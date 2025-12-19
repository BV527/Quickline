const express = require('express');
const { login, refreshToken, logout, verify } = require('../controllers/authController');
const { validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', auth, logout);
router.get('/verify', auth, verify);

module.exports = router;