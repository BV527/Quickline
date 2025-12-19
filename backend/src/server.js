require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { securityHeaders, generalLimiter, sanitizeInput } = require('./middleware/security');
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

connectDB();

app.use(securityHeaders);
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quickline.vercel.app',
    'https://your-vercel-domain.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(generalLimiter);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quickline API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      queue: '/api/queue',
      upload: '/api/upload',
      users: '/api/users',
      departments: '/api/departments',
      appointments: '/api/appointments',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Patient joins their room
  socket.on('join-patient', (data) => {
    socket.join(`patient-${data.patientId}`);
    console.log(`Patient ${data.patientId} joined room`);
  });
  
  // Admin joins admin room
  socket.on('join-admin', (data) => {
    socket.join('admin-room');
    console.log(`Admin ${data.adminId} joined admin room`);
  });
  
  // Join department room
  socket.on('join-department', (data) => {
    socket.join(`department-${data.departmentId}`);
    console.log(`Joined department ${data.departmentId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🏥 Hospital OPD Server running on port ${PORT}`);
  console.log(`📱 Patient Portal: http://localhost:5173/patient/login`);
  console.log(`👨⚕️ Admin Portal: http://localhost:5173/admin/login`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop other processes or change the port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});