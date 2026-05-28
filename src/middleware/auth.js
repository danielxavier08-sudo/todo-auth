const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_troque_em_producao';

/**
 * Middleware de autenticação.
 * Verifica o token JWT enviado no header Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido. Faça login para continuar.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Confirma que o usuário ainda existe no banco
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado. Faça login novamente.' });
    }

    // Anexa dados do usuário à requisição
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

/**
 * Middleware de autorização.
 * Verifica se o usuário autenticado é dono da tarefa (ou admin).
 * Deve ser usado APÓS authenticate.
 */
function authorizeTaskOwner(req, res, next) {
  const db = require('../models/db');
  const taskId = req.params.id;
  const task = db.findTaskById(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  // Admin pode tudo; usuário comum só acessa as próprias tarefas
  if (req.user.role === 'admin' || task.userId === req.user.id) {
    req.task = task; // disponibiliza a tarefa para o controller
    return next();
  }

  return res.status(403).json({ error: 'Sem permissão para acessar esta tarefa.' });
}

module.exports = { authenticate, authorizeTaskOwner, JWT_SECRET };
