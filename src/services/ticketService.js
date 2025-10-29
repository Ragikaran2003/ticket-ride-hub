// services/ticketService.js - CORRECTED VERSION
import api from './api';

export const ticketService = {
  createTicket: async (ticketData) => {
    try {
      console.log('📤 Creating ticket with data:', ticketData);
      const response = await api.post('/tickets', ticketData);
      console.log('✅ Ticket creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ticket creation failed:', error);
      throw error;
    }
  },

  getAllTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getUserTickets: async () => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  // ✅ FIXED: Use the correct endpoint from your backend route
  getTicketByCode: async (code) => {
    try {
      console.log('🔍 Searching ticket with code:', code);
      const response = await api.get(`/tickets/${code}`);
      console.log('✅ Ticket found:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error finding ticket:', error.response?.data);
      throw error;
    }
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    try {
      console.log('🔄 Updating payment status:', { id, paymentStatus });
      const response = await api.put(`/tickets/${id}/payment-status`, {
        paymentStatus
      });
      console.log('✅ Payment status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating payment status:', error.response?.data);
      throw error;
    }
  }
};