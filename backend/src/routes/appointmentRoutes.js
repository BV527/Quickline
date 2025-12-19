const express = require('express');
const { 
  bookAppointment, 
  getMyAppointments, 
  getAppointmentStatus 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/:appointmentId/status', protect, getAppointmentStatus);

module.exports = router;