const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const User = require('../models/User');

const generateTokenNumber = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId).populate('departmentId');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if slot is available
    const slot = doctor.availableSlots.find(s => s.time === appointmentTime);
    if (!slot) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Check existing appointments for this slot
    const existingCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (existingCount >= slot.maxPatients) {
      return res.status(400).json({ message: 'Slot is full' });
    }

    // Generate queue position
    const queuePosition = existingCount + 1;

    // Generate token and OTP
    const tokenNumber = generateTokenNumber();
    const otp = generateOTP();

    const appointment = await Appointment.create({
      patientId,
      departmentId: doctor.departmentId._id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      tokenNumber,
      otp,
      queuePosition
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName phone')
      .populate('departmentId', 'name code')
      .populate('doctorId', 'name');

    // Emit socket event
    req.io.emit('appointment-booked', {
      departmentId: doctor.departmentId._id,
      appointment: populatedAppointment
    });

    res.status(201).json({
      success: true,
      appointment: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patientId: req.user.id,
      status: { $ne: 'cancelled' }
    })
    .populate('departmentId', 'name code')
    .populate('doctorId', 'name')
    .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'fullName phone')
      .populate('departmentId', 'name code')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Calculate current queue position
    const currentPosition = await Appointment.countDocuments({
      doctorId: appointment.doctorId._id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      queuePosition: { $lt: appointment.queuePosition },
      status: { $in: ['waiting', 'ready', 'serving'] }
    }) + 1;

    res.json({
      success: true,
      appointment: {
        ...appointment.toObject(),
        currentQueuePosition: currentPosition
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};