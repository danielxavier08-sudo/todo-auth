const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile  (rota protegida)
router.get('/profile', authenticate, profile);

module.exports = router;
