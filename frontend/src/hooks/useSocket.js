import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useSocket = (user) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL);

    // Join appropriate room based on user role
    if (user.role === 'patient') {
      socketRef.current.emit('join-patient', { patientId: user.id });
    } else if (user.role === 'admin') {
      socketRef.current.emit('join-admin', { adminId: user.id });
    }

    // Listen for queue updates
    socketRef.current.on('queue-updated', (data) => {
      // Refresh queue data
      window.location.reload();
    });

    // Listen for appointment alerts
    socketRef.current.on('appointment-alert', (data) => {
      if (data.type === 'ready') {
        toast.success('🔔 You are next! Please be ready.');
      } else if (data.type === 'serving') {
        toast.success('👨‍⚕️ Please proceed to consultation room.');
      } else if (data.type === 'warning') {
        toast('⚠️ ' + data.message, { icon: '⚠️' });
      }
    });

    // Listen for patient verification
    socketRef.current.on('patient-verified', () => {
      toast.success('✅ Patient verified successfully!');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socketRef.current;
};