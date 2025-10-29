import api from './api';

export const trainService = {
  // Get all trains
  getAllTrains: async () => {
    const response = await api.get('/trains');
    return response.data;
  },

  // Get train by ID
  getTrainById: async (id) => {
    const response = await api.get(`/trains/${id}`);
    return response.data;
  },

  // Search trains
  searchTrains: async (searchParams) => {
    const response = await api.get('/trains/search', { params: searchParams });
    return response.data;
  },

  // Create train (Admin only)
  createTrain: async (trainData) => {
    const response = await api.post('/trains', trainData);
    return response.data;
  },

  // Update train (Admin only)
  updateTrain: async (id, trainData) => {
    const response = await api.put(`/trains/${id}`, trainData);
    return response.data;
  },

  // Delete train (Admin only)
  deleteTrain: async (id) => {
    const response = await api.delete(`/trains/${id}`);
    return response.data;
  }
};