const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  tokenNumber: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'serving', 'completed', 'cancelled'],
    default: 'waiting'
  },
  queuePosition: {
    type: Number,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

appointmentSchema.index({ appointmentDate: 1, doctorId: 1, appointmentTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);