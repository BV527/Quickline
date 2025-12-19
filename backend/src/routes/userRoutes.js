const express = require('express');
const { registerPatient, loginPatient, verifyToken } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/verify', protect, verifyToken);

module.exports = router;