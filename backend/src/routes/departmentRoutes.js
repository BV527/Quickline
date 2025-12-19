const express = require('express');
const { 
  getAllDepartments, 
  getDepartmentDoctors, 
  getDoctorSlots 
} = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllDepartments);
router.get('/:departmentId/doctors', protect, getDepartmentDoctors);
router.get('/doctors/:doctorId/slots', protect, getDoctorSlots);

module.exports = router;