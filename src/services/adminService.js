import api from './api';

export const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get tickets by date range
  getTicketsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/admin/tickets/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = 'monthly') => {
    const response = await api.get('/admin/analytics/revenue', {
      params: { period }
    });
    return response.data;
  }
};