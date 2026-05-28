const express = require('express');
const router = express.Router();
const { authenticate, authorizeTaskOwner } = require('../middleware/auth');
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
} = require('../controllers/taskController');

// Todas as rotas de tarefas exigem autenticação
router.use(authenticate);

// GET  /api/tasks        → lista tarefas do usuário
router.get('/', listTasks);

// POST /api/tasks        → cria tarefa
router.post('/', createTask);

// As rotas abaixo também verificam propriedade da tarefa
router.put('/:id', authorizeTaskOwner, updateTask);
router.delete('/:id', authorizeTaskOwner, deleteTask);
router.patch('/:id/toggle', authorizeTaskOwner, toggleTask);

module.exports = router;
