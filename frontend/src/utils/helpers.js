export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskOTP = (otp) => {
  if (!otp) return '';
  return otp.replace(/./g, '*');
};

export const getPositionText = (position) => {
  if (position === 0) return 'Your Turn!';
  if (position === 1) return '1 person ahead';
  return `${position} people ahead`;
};

export const generateTicketId = () => {
  return 'TKT' + Date.now().toString().slice(-6);
};