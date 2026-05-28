/**
 * Testes de integração para as rotas de autenticação e tarefas.
 * Execute: node tests/auth.test.js
 * Requer o servidor rodando em localhost:3000
 */

const BASE = 'http://localhost:3000/api';
let token = '';
let taskId = null;

async function req(method, path, body, auth) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${auth}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
  } else {
    console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('\n🧪 Iniciando testes...\n');

  // 1. Registro
  console.log('📋 Autenticação');
  const reg = await req('POST', '/auth/register', { name: 'Teste', email: 'teste@teste.com', password: '123456' });
  assert('Registro retorna 201',       reg.status === 201);
  assert('Registro retorna token',     !!reg.data.token);
  token = reg.data.token;

  // 2. Registro duplicado
  const reg2 = await req('POST', '/auth/register', { name: 'Teste', email: 'teste@teste.com', password: '123456' });
  assert('E-mail duplicado retorna 409', reg2.status === 409);

  // 3. Login correto
  const login = await req('POST', '/auth/login', { email: 'teste@teste.com', password: '123456' });
  assert('Login correto retorna 200',  login.status === 200);
  assert('Login retorna token',        !!login.data.token);

  // 4. Login errado
  const badLogin = await req('POST', '/auth/login', { email: 'teste@teste.com', password: 'errado' });
  assert('Login errado retorna 401',   badLogin.status === 401);

  // 5. Rota protegida sem token
  console.log('\n🔒 Proteção de Rotas');
  const noAuth = await req('GET', '/tasks');
  assert('GET /tasks sem token retorna 401', noAuth.status === 401);

  // 6. Criar tarefa
  console.log('\n📝 Tarefas');
  const create = await req('POST', '/tasks', { title: 'Minha tarefa' }, token);
  assert('Criar tarefa retorna 201',   create.status === 201);
  assert('Tarefa tem ID',              !!create.data.task?.id);
  taskId = create.data.task?.id;

  // 7. Listar tarefas
  const list = await req('GET', '/tasks', null, token);
  assert('Listar tarefas retorna 200', list.status === 200);
  assert('Lista contém a tarefa',      list.data.tasks?.length === 1);

  // 8. Toggle tarefa
  const toggle = await req('PATCH', `/tasks/${taskId}/toggle`, null, token);
  assert('Toggle retorna 200',         toggle.status === 200);
  assert('Tarefa marcada como feita',  toggle.data.task?.completed === true);

  // 9. Atualizar tarefa
  const update = await req('PUT', `/tasks/${taskId}`, { title: 'Atualizada' }, token);
  assert('Atualizar retorna 200',      update.status === 200);
  assert('Título atualizado',          update.data.task?.title === 'Atualizada');

  // 10. Controle de acesso — outro usuário
  console.log('\n🛡️  Controle de Acesso');
  const reg3 = await req('POST', '/auth/register', { name: 'Outro', email: 'outro@teste.com', password: '123456' });
  const otherToken = reg3.data.token;
  const forbidden = await req('DELETE', `/tasks/${taskId}`, null, otherToken);
  assert('Outro usuário não pode deletar tarefa alheia — retorna 403', forbidden.status === 403);

  // 11. Deletar tarefa (dono correto)
  const del = await req('DELETE', `/tasks/${taskId}`, null, token);
  assert('Dono pode deletar sua tarefa — retorna 200', del.status === 200);

  console.log('\n✨ Testes concluídos!\n');
}

run().catch(err => {
  console.error('Erro fatal nos testes:', err.message);
  process.exit(1);
});
