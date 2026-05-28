const db = require('../models/db');

// GET /api/tasks → lista tarefas do usuário autenticado
function listTasks(req, res) {
  const tasks = db.findTasksByUserId(req.user.id);
  return res.json({ tasks });
}

// POST /api/tasks → cria nova tarefa
function createTask(req, res) {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
  }

  const task = db.createTask({ title: title.trim(), description, userId: req.user.id });
  return res.status(201).json({ message: 'Tarefa criada com sucesso!', task });
}

// PUT /api/tasks/:id → atualiza tarefa (somente dono ou admin)
function updateTask(req, res) {
  const { title, description, completed } = req.body;
  const updates = {};

  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description;
  if (completed !== undefined) updates.completed = Boolean(completed);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
  }

  const updated = db.updateTask(req.params.id, updates);
  return res.json({ message: 'Tarefa atualizada com sucesso!', task: updated });
}

// DELETE /api/tasks/:id → remove tarefa (somente dono ou admin)
function deleteTask(req, res) {
  db.deleteTask(req.params.id);
  return res.json({ message: 'Tarefa removida com sucesso!' });
}

// PATCH /api/tasks/:id/toggle → alterna status completed
function toggleTask(req, res) {
  const current = req.task; // injetado pelo middleware authorizeTaskOwner
  const updated = db.updateTask(req.params.id, { completed: !current.completed });
  return res.json({ message: 'Status atualizado!', task: updated });
}

module.exports = { listTasks, createTask, updateTask, deleteTask, toggleTask };
