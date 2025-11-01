import api from './api';

export const routeService = {
  // Get routes by train
  getRoutesByTrain: async (trainId) => {
    const response = await api.get(`/routes/train/${trainId}`);
    return response.data;
  },

  // Create route (Admin only) - NO NEED TO REMOVE SEQUENCE ANYMORE
  createRoute: async (routeData) => {
    // Just send the data as is - backend will handle sequence
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  // Update route (Admin only)
  updateRoute: async (id, routeData) => {
    const response = await api.put(`/routes/${id}`, routeData);
    return response.data;
  },

  // Delete route (Admin only)
  deleteRoute: async (id) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  },

  // Calculate distance between stations
  calculateDistance: async (trainId, originStationId, destinationStationId) => {
    console.log('📍 Client-side distance calculation');
    
    const stationMap = {
      'station-001': 1, 'station-002': 2, 'station-003': 3, 
      'station-004': 4, 'station-005': 5, 'station-006': 6,
      'station-007': 7, 'station-008': 8
    };
    
    const fromNum = stationMap[originStationId] || 1;
    const toNum = stationMap[destinationStationId] || 2;
    const stationDiff = Math.abs(toNum - fromNum);
    const distance = Math.max(stationDiff * 150, 100);
    
    return { distance };
  }
};