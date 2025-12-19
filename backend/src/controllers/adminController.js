const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const User = require('../models/User');

exports.getDepartmentQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const appointments = await Appointment.find({
      departmentId,
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['waiting', 'ready', 'serving'] }
    })
    .populate('patientId', 'fullName phone')
    .populate('doctorId', 'name')
    .sort({ appointmentTime: 1, queuePosition: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPatient = async (req, res) => {
  try {
    const { tokenNumber, otp } = req.body;

    const appointment = await Appointment.findOne({
      tokenNumber,
      otp,
      status: { $in: ['waiting', 'ready'] }
    })
    .populate('patientId', 'fullName phone')
    .populate('departmentId', 'name code')
    .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid token or OTP' 
      });
    }

    // Check if appointment is for today or future
    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    
    if (appointmentDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date has passed'
      });
    }

    appointment.isVerified = true;
    appointment.status = 'ready';
    await appointment.save();

    // Emit socket events
    req.io.to(`department-${appointment.departmentId._id}`).emit('queue-updated', {
      departmentId: appointment.departmentId._id
    });
    
    req.io.to(`patient-${appointment.patientId._id}`).emit('appointment-alert', {
      type: 'ready',
      message: 'You are verified and ready to be served!'
    });

    res.json({
      success: true,
      message: 'Patient verified successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.serveNext = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find next patient to serve
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const nextAppointment = await Appointment.findOne({
      departmentId,
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      status: 'ready',
      isVerified: true
    })
    .populate('patientId', 'fullName phone')
    .populate('doctorId', 'name')
    .sort({ appointmentTime: 1, queuePosition: 1 });

    if (!nextAppointment) {
      return res.status(404).json({
        success: false,
        message: 'No verified patients in queue'
      });
    }

    nextAppointment.status = 'serving';
    await nextAppointment.save();

    // Emit socket events
    req.io.to(`department-${departmentId}`).emit('queue-updated', {
      departmentId
    });
    
    req.io.to(`patient-${nextAppointment.patientId._id}`).emit('appointment-alert', {
      type: 'serving',
      message: 'Please proceed to consultation room'
    });
    
    // Alert next patient in queue
    const nextInQueue = await Appointment.findOne({
      departmentId,
      appointmentDate: { $gte: today },
      status: 'ready',
      isVerified: true,
      _id: { $ne: nextAppointment._id }
    }).sort({ appointmentTime: 1, queuePosition: 1 });
    
    if (nextInQueue) {
      req.io.to(`patient-${nextInQueue.patientId}`).emit('appointment-alert', {
        type: 'warning',
        message: 'You are next! Please be ready.'
      });
    }

    res.json({
      success: true,
      message: 'Patient is now being served',
      appointment: nextAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'completed';
    await appointment.save();

    // Emit socket event
    req.io.emit('appointment-completed', {
      departmentId: appointment.departmentId,
      appointmentId
    });

    res.json({
      success: true,
      message: 'Appointment completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};