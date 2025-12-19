import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/patient/login';
    }
    return Promise.reject(error);
  }
);

export const hospitalService = {
  // Authentication
  registerPatient: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  loginPatient: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/users/verify');
    return response.data;
  },

  // Departments
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartmentDoctors: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/doctors`);
    return response.data;
  },

  getDoctorSlots: async (doctorId) => {
    const response = await api.get(`/departments/doctors/${doctorId}/slots`);
    return response.data;
  },

  // Appointments
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  getAppointmentStatus: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}/status`);
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  // Admin
  getDepartmentQueue: async (departmentId) => {
    const response = await api.get(`/admin/departments/${departmentId}/queue`);
    return response.data;
  },

  verifyPatient: async (tokenNumber, otp) => {
    const response = await api.post('/admin/verify-patient', { tokenNumber, otp });
    return response.data;
  },

  serveNext: async (departmentId) => {
    const response = await api.post('/admin/serve-next', { departmentId });
    return response.data;
  },

  completeAppointment: async (appointmentId) => {
    const response = await api.put(`/admin/appointments/${appointmentId}/complete`);
    return response.data;
  }
};