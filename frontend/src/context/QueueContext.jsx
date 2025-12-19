import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [userTicket, setUserTicket] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const socket = useSocket();

  useEffect(() => {

    const loadInitialData = async () => {
      try {
        const { queueService } = await import('@/services/queueService');
        const data = await queueService.getQueue();
        if (data) {
          setQueue(data.queue || []);
          setCurrentServing(data.currentServing);
          updateUserPosition(data.queue || []);
        }
      } catch (error) {
        console.error('Failed to load queue data:', error);
        setQueue([]);
        setCurrentServing(null);
      }
    };

    loadInitialData();
  }, []);

  const updateUserPosition = useCallback((queueData) => {
    if (userTicket) {
      const position = queueData.findIndex(ticket => ticket.id === userTicket.id);
      setUserPosition(position >= 0 ? position : null);
    }
  }, [userTicket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queue-updated', (data) => {
      setQueue(data.queue);
      setCurrentServing(data.currentServing);
      updateUserPosition(data.queue);
    });

    socket.on('ticket-served', (data) => {
      setCurrentServing(data.currentServing);
      setQueue(data.queue);
      updateUserPosition(data.queue);
    });

    socket.on('your-turn', () => {
      setUserPosition(0);
    });

    socket.on('alert-near', (data) => {
      setUserPosition(data.position);
    });

    return () => {
      socket.off('queue-updated');
      socket.off('ticket-served');
      socket.off('your-turn');
      socket.off('alert-near');
    };
  }, [socket, updateUserPosition]);



  const addToQueue = useCallback((ticket) => {
    setUserTicket(ticket);
    setQueue(prev => [...prev, ticket]);
  }, []);

  const value = useMemo(() => ({
    queue,
    currentServing,
    userTicket,
    userPosition,
    loading,
    setLoading,
    addToQueue,
    setUserTicket,
  }), [queue, currentServing, userTicket, userPosition, loading, addToQueue]);

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};