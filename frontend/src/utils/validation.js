import * as yup from 'yup';

export const joinQueueSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  email: yup
    .string()
    .email('Invalid email format')
    .optional(),
});

export const adminLoginSchema = yup.object({
  username: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const verifyTicketSchema = yup.object({
  ticketId: yup.string().required('Ticket ID is required'),
  otp: yup
    .string()
    .required('OTP is required')
    .length(6, 'OTP must be 6 digits'),
});

export const fileUploadSchema = yup.object({
  file: yup
    .mixed()
    .required('File is required')
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Unsupported file format', (value) => {
      return value && ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'].includes(value.type);
    }),
});