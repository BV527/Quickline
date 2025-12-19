const express = require('express');
const { 
  getDepartmentQueue, 
  verifyPatient, 
  serveNext, 
  completeAppointment 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/departments/:departmentId/queue', protect, adminOnly, getDepartmentQueue);
router.post('/verify-patient', protect, adminOnly, verifyPatient);
router.post('/serve-next', protect, adminOnly, serveNext);
router.put('/appointments/:appointmentId/complete', protect, adminOnly, completeAppointment);

module.exports = router;