import api from './api';
import { mockQueueService } from './mockService';


const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

export const queueService = {
  joinQueue: async (userData) => {
    if (USE_MOCK) return mockQueueService.joinQueue(userData);
    const response = await api.post('/queue/join', userData);
    return response.data;
  },

  getTicketStatus: async (ticketId) => {
    if (USE_MOCK) return mockQueueService.getTicketStatus(ticketId);
    const response = await api.get(`/queue/ticket/${ticketId}`);
    return response.data;
  },

  getQueue: async () => {
    if (USE_MOCK) return mockQueueService.getQueue();
    const response = await api.get('/queue');
    return response.data;
  },

  verifyTicket: async (ticketId, otp) => {
    if (USE_MOCK) return mockQueueService.verifyTicket(ticketId, otp);
    const response = await api.post('/queue/verify', { ticketId, otp });
    return response.data;
  },

  serveNext: async () => {
    if (USE_MOCK) return mockQueueService.serveNext();
    const response = await api.post('/queue/serve-next');
    return response.data;
  },

  getCurrentServing: async () => {
    if (USE_MOCK) return mockQueueService.getCurrentServing();
    const response = await api.get('/queue/current-serving');
    return response.data;
  },
};