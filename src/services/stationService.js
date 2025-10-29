import api from './api';

export const stationService = {
  // Get all stations
  getAllStations: async () => {
    const response = await api.get('/stations');
    return response.data;
  },

  // Get station by ID
  getStationById: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },

  // Create station (Admin only)
  createStation: async (stationData) => {
    const response = await api.post('/stations', stationData);
    return response.data;
  },

  // Update station (Admin only)
  updateStation: async (id, stationData) => {
    const response = await api.put(`/stations/${id}`, stationData);
    return response.data;
  },

  // Delete station (Admin only)
  deleteStation: async (id) => {
    const response = await api.delete(`/stations/${id}`);
    return response.data;
  }
};