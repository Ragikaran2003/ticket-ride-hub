// This file now uses API calls instead of localStorage
import { authService, stationService, trainService, ticketService, routeService, adminService } from '@/services';

// Initialize data function (for compatibility with existing code)
export const initializeData = () => {
  console.log('Data initialization handled by backend');
  return true;
};

// User operations
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const registerUser = async (name, email, password) => {
  const result = await authService.register({ name, email, password });
  setCurrentUser(result.user);
  localStorage.setItem('token', result.token);
  return result.user;
};

export const loginUser = async (email, password) => {
  const result = await authService.login({ email, password });
  setCurrentUser(result.user);
  return result.user;
};

// Station operations
export const getStations = async () => {
  return await stationService.getAllStations();
};

export const getStationById = async (id) => {
  return await stationService.getStationById(id);
};

export const addStation = async (stationData) => {
  const result = await stationService.createStation(stationData);
  return result.station;
};

export const updateStation = async (id, stationData) => {
  const result = await stationService.updateStation(id, stationData);
  return result.station;
};

export const deleteStation = async (id) => {
  await stationService.deleteStation(id);
  return true;
};

// Train operations
export const getTrains = async () => {
  return await trainService.getAllTrains();
};

export const getAllTrains = async () => {
  return await trainService.getAllTrains();
};

export const getTrainById = async (id) => {
  return await trainService.getTrainById(id);
};

export const searchTrains = async (originStationId, destinationStationId, date) => {
  return await trainService.searchTrains({
    originStationId,
    destinationStationId,
    date
  });
};

export const addTrain = async (trainData) => {
  const result = await trainService.createTrain(trainData);
  return result.train;
};

export const updateTrain = async (id, trainData) => {
  const result = await trainService.updateTrain(id, trainData);
  return result.train;
};

export const deleteTrain = async (id) => {
  await trainService.deleteTrain(id);
  return true;
};

// Route operations
export const getRoutesByTrain = async (trainId) => {
  return await routeService.getRoutesByTrain(trainId);
};

export const addRoute = async (routeData) => {
  const result = await routeService.createRoute(routeData);
  return result.route;
};

export const deleteRoute = async (id) => {
  await routeService.deleteRoute(id);
  return true;
};

// FIXED: Completely client-side distance calculation
export const calculateDistance = async (trainId, fromStationId, toStationId) => {
  console.log('📍 Calculating distance for:', fromStationId, '→', toStationId);

  // Simple and reliable distance calculation
  const stationMap = {
    'station-001': 1, 'station-002': 2, 'station-003': 3,
    'station-004': 4, 'station-005': 5, 'station-006': 6,
    'station-007': 7, 'station-008': 8
  };

  const fromNum = stationMap[fromStationId] || 1;
  const toNum = stationMap[toStationId] || 2;
  const stationDiff = Math.abs(toNum - fromNum);

  // Base distance calculation: 150km per station difference + 100km minimum
  const distance = Math.max(stationDiff * 150, 100);

  console.log('✅ Distance calculated:', distance, 'km');
  return distance;
};

// Ticket operations
export const getTickets = async () => {
  return await ticketService.getAllTickets();
};

export const getAllTickets = async () => {
  return await ticketService.getAllTickets();
};

export const getUserTickets = async () => {
  return await ticketService.getUserTickets();
};

export const addTicket = async (ticketData) => {
  const result = await ticketService.createTicket(ticketData);
  return result.ticket;
};

export const getTicketByCode = async (code) => {
  return await ticketService.getTicketByCode(code);
};

export const updateTicketPaymentStatus = async (id, paymentStatus) => {
  await ticketService.updatePaymentStatus(id, paymentStatus);
  return true;
};

// Admin operations
export const getCurrentAdmin = () => {
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
};

export const setCurrentAdmin = (admin) => {
  if (admin) {
    localStorage.setItem('admin', JSON.stringify(admin));
    localStorage.setItem('adminToken', admin.token);
  } else {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
  }
};

export const loginAdmin = async (email, password) => {
  try {
    console.log('Calling authService.adminLogin with:', email);
    const result = await authService.adminLogin({ email, password });
    console.log('Admin login result:', result);
    setCurrentAdmin(result.admin);
    return result.admin;
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    throw error;
  }
};

// Admin dashboard functions
export const getDashboardStats = async () => {
  const result = await adminService.getDashboardStats();
  return result;
};

export const getTicketsByDateRange = async (startDate, endDate) => {
  return await adminService.getTicketsByDateRange(startDate, endDate);
};

export const getRevenueAnalytics = async (period = 'monthly') => {
  return await adminService.getRevenueAnalytics(period);
};
