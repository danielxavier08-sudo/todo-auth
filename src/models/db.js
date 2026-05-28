// Banco de dados em memória (simula persistência sem necessidade de banco externo)
// Em produção, substituir por PostgreSQL, MongoDB etc.

const db = {
  users: [],
  tasks: [],
  _userIdCounter: 1,
  _taskIdCounter: 1,

  // ── Usuários ──────────────────────────────────────────────────────────────
  createUser(data) {
    const user = {
      id: this._userIdCounter++,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: data.password, // já deve vir com hash
      role: data.role || 'user',
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  },

  findUserByEmail(email) {
    return this.users.find(u => u.email === email.toLowerCase().trim()) || null;
  },

  findUserById(id) {
    return this.users.find(u => u.id === Number(id)) || null;
  },

  // ── Tarefas ───────────────────────────────────────────────────────────────
  createTask(data) {
    const task = {
      id: this._taskIdCounter++,
      title: data.title,
      description: data.description || '',
      completed: false,
      userId: data.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(task);
    return task;
  },

  findTasksByUserId(userId) {
    return this.tasks.filter(t => t.userId === Number(userId));
  },

  findTaskById(id) {
    return this.tasks.find(t => t.id === Number(id)) || null;
  },

  updateTask(id, data) {
    const idx = this.tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) return null;
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.tasks[idx];
  },

  deleteTask(id) {
    const idx = this.tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }
};

module.exports = db;
