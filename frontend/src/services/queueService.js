import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for testing
const mockData = {
  tickets: [],
  currentServing: null,
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const queueService = {
  joinQueue: async (userData) => {
    if (USE_MOCK) {
      const ticket = {
        id: Date.now().toString(),
        ...userData,
        position: mockData.tickets.length + 1,
        status: 'waiting',
        createdAt: new Date().toISOString()
      };
      mockData.tickets.push(ticket);
      return { success: true, ticket };
    }
    const response = await api.post('/queue/join', userData);
    return response.data;
  },

  getTicketStatus: async (ticketId) => {
    if (USE_MOCK) {
      const ticket = mockData.tickets.find(t => t.id === ticketId);
      return { success: true, ticket };
    }
    const response = await api.get(`/queue/ticket/${ticketId}`);
    return response.data;
  },

  getQueue: async () => {
    if (USE_MOCK) {
      return { success: true, queue: mockData.tickets };
    }
    const response = await api.get('/queue');
    return response.data;
  },

  verifyTicket: async (ticketId, otp) => {
    if (USE_MOCK) {
      return { success: true, verified: true };
    }
    const response = await api.post('/queue/verify', { ticketId, otp });
    return response.data;
  },

  serveNext: async () => {
    if (USE_MOCK) {
      const nextTicket = mockData.tickets.find(t => t.status === 'waiting');
      if (nextTicket) {
        nextTicket.status = 'serving';
        mockData.currentServing = nextTicket;
      }
      return { success: true, ticket: nextTicket };
    }
    const response = await api.post('/queue/serve-next');
    return response.data;
  },

  getCurrentServing: async () => {
    if (USE_MOCK) {
      return { success: true, serving: mockData.currentServing };
    }
    const response = await api.get('/queue/current-serving');
    return response.data;
  },
};