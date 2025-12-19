const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  specialization: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableSlots: [{
    time: {
      type: String,
      required: true
    },
    maxPatients: {
      type: Number,
      default: 10
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);