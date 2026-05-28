# 📝 Todo App — Autenticação JWT

Lista de Tarefas com sistema completo de autenticação e autorização usando **Node.js + Express + JWT**.

---

## 🚀 Como executar

```bash
# 1. Clone o repositório
git clone <URL_DO_REPO>
cd todo-auth

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e defina um JWT_SECRET forte

# 4. Inicie o servidor
npm start          # produção
npm run dev        # desenvolvimento (nodemon)
```

Acesse: **http://localhost:3000**

---

## 🔑 Autenticação

O sistema usa **tokens JWT** enviados no header `Authorization: Bearer <token>`.

### Registro

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta 201:**
```json
{
  "message": "Usuário registrado com sucesso!",
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@exemplo.com", "role": "user" }
}
```

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta 200:**
```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGci...",
  "user": { ... }
}
```

---

### Perfil (rota protegida)

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## ✅ Tarefas (todas as rotas exigem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks` | Lista tarefas do usuário |
| `POST` | `/api/tasks` | Cria nova tarefa |
| `PUT` | `/api/tasks/:id` | Atualiza tarefa (dono) |
| `DELETE` | `/api/tasks/:id` | Remove tarefa (dono) |
| `PATCH` | `/api/tasks/:id/toggle` | Alterna status concluído |

**Exemplo — criar tarefa:**
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Estudar Node.js" }
```

---

## 🛡️ Permissões de Acesso

| Ação | Usuário comum | Admin |
|------|:---:|:---:|
| Ver suas tarefas | ✅ | ✅ |
| Criar tarefa | ✅ | ✅ |
| Editar **sua** tarefa | ✅ | ✅ |
| Deletar **sua** tarefa | ✅ | ✅ |
| Editar/deletar tarefa alheia | ❌ | ✅ |

---

## 🔒 Segurança implementada

- Senhas com **hash bcrypt** (salt rounds: 12)
- Tokens **JWT** com expiração de 7 dias
- **Rate limiting** global: 100 req / 15 min
- **Rate limiting** no login: 10 tentativas / 15 min (proteção brute-force)
- Mensagens de erro genéricas (não revelam se e-mail existe)
- Validação de entrada em todas as rotas

---

## 🧪 Testes

Com o servidor rodando em outra aba:

```bash
npm test
```

Ou teste manualmente com **Postman** importando as requisições acima.

---

## 📁 Estrutura do Projeto

```
todo-auth/
├── src/
│   ├── server.js              # Entrada da aplicação
│   ├── models/
│   │   └── db.js              # Banco de dados em memória
│   ├── middleware/
│   │   └── auth.js            # authenticate + authorizeTaskOwner
│   ├── controllers/
│   │   ├── authController.js  # register, login, profile
│   │   └── taskController.js  # CRUD de tarefas
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   └── tasks.js           # /api/tasks/*
│   └── public/
│       └── index.html         # Interface web
├── tests/
│   └── auth.test.js           # Testes de integração
├── .env.example
├── .gitignore
└── README.md
```
