require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedHospitalData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Department.deleteMany({});
    await Doctor.deleteMany({});

    // Create departments
    const departments = await Department.create([
      {
        name: 'General Medicine',
        code: 'GM',
        description: 'General medical consultation and treatment'
      },
      {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Medical care for infants, children, and adolescents'
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Bone, joint, and muscle treatment'
      },
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system care'
      },
      {
        name: 'Dermatology',
        code: 'DERM',
        description: 'Skin, hair, and nail treatment'
      }
    ]);

    console.log('Departments created:', departments.length);

    // Create doctors with time slots
    const timeSlots = [
      { time: '09:00', maxPatients: 10 },
      { time: '10:00', maxPatients: 10 },
      { time: '11:00', maxPatients: 10 },
      { time: '14:00', maxPatients: 10 },
      { time: '15:00', maxPatients: 10 },
      { time: '16:00', maxPatients: 10 }
    ];

    const doctors = [];
    
    // General Medicine doctors
    doctors.push(
      {
        name: 'Dr. Sarah Johnson',
        departmentId: departments[0]._id,
        specialization: 'Internal Medicine',
        availableSlots: timeSlots
      },
      {
        name: 'Dr. Michael Chen',
        departmentId: departments[0]._id,
        specialization: 'Family Medicine',
        availableSlots: timeSlots
      }
    );

    // Pediatrics doctors
    doctors.push(
      {
        name: 'Dr. Emily Rodriguez',
        departmentId: departments[1]._id,
        specialization: 'Child Development',
        availableSlots: timeSlots
      }
    );

    // Orthopedics doctors
    doctors.push(
      {
        name: 'Dr. David Wilson',
        departmentId: departments[2]._id,
        specialization: 'Sports Medicine',
        availableSlots: timeSlots
      }
    );

    // Cardiology doctors
    doctors.push(
      {
        name: 'Dr. Lisa Thompson',
        departmentId: departments[3]._id,
        specialization: 'Interventional Cardiology',
        availableSlots: timeSlots
      }
    );

    // Dermatology doctors
    doctors.push(
      {
        name: 'Dr. James Brown',
        departmentId: departments[4]._id,
        specialization: 'Cosmetic Dermatology',
        availableSlots: timeSlots
      }
    );

    await Doctor.create(doctors);
    console.log('Doctors created:', doctors.length);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@hospital.com' });
    if (!adminExists) {
      await User.create({
        fullName: 'Hospital Admin',
        email: 'admin@hospital.com',
        phone: '+1234567890',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    console.log('Hospital data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedHospitalData();