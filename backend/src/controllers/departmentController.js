const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentDoctors = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const doctors = await Doctor.find({ 
      departmentId, 
      isActive: true 
    }).populate('departmentId', 'name code');
    
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).populate('departmentId');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ 
      success: true, 
      doctor: {
        id: doctor._id,
        name: doctor.name,
        department: doctor.departmentId.name,
        availableSlots: doctor.availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};