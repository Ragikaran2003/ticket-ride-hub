// Local storage utilities for the train booking system

const STORAGE_KEYS = {
  TRAINS: 'ticket_ride_trains',
  TICKETS: 'ticket_ride_tickets',
  USERS: 'ticket_ride_users',
  ADMINS: 'ticket_ride_admins',
  CURRENT_USER: 'ticket_ride_current_user',
  CURRENT_ADMIN: 'ticket_ride_current_admin',
  STATIONS: 'ticket_ride_stations',
  ROUTES: 'ticket_ride_routes',
};

// Initialize with sample data
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.STATIONS)) {
    const sampleStations = [
      { id: '1', name: 'Mumbai Central', code: 'MMCT' },
      { id: '2', name: 'Delhi Junction', code: 'DLI' },
      { id: '3', name: 'Chennai Central', code: 'MAS' },
      { id: '4', name: 'Kolkata Howrah', code: 'HWH' },
      { id: '5', name: 'Bangalore City', code: 'SBC' },
      { id: '6', name: 'Hyderabad Deccan', code: 'HYB' },
      { id: '7', name: 'Ahmedabad Junction', code: 'ADI' },
      { id: '8', name: 'Pune Junction', code: 'PUNE' },
    ];
    localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(sampleStations));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ROUTES)) {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRAINS)) {
    const sampleTrains = [
      {
        id: '1',
        name: 'Express 101',
        pricePerKm: 2.5,
        availableSeats: 50,
      },
      {
        id: '2',
        name: 'Rajdhani Express',
        pricePerKm: 4.0,
        availableSeats: 40,
      },
      {
        id: '3',
        name: 'Shatabdi Express',
        pricePerKm: 3.0,
        availableSeats: 60,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(sampleTrains));

    // Add sample routes
    const sampleRoutes = [
      // Express 101 routes
      { trainId: '1', stationId: '1', sequence: 0, distanceToNext: 500 }, // Mumbai to Delhi
      { trainId: '1', stationId: '2', sequence: 1, distanceToNext: 0 }, // Delhi (terminal)
      
      // Rajdhani Express routes
      { trainId: '2', stationId: '2', sequence: 0, distanceToNext: 800 }, // Delhi to Kolkata
      { trainId: '2', stationId: '4', sequence: 1, distanceToNext: 0 }, // Kolkata (terminal)
      
      // Shatabdi Express routes
      { trainId: '3', stationId: '3', sequence: 0, distanceToNext: 350 }, // Chennai to Bangalore
      { trainId: '3', stationId: '5', sequence: 1, distanceToNext: 0 }, // Bangalore (terminal)
    ].map(route => ({ ...route, id: Date.now().toString() + Math.random() }));

    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(sampleRoutes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    const defaultAdmin = {
      id: '1',
      name: 'Admin',
      email: 'admin@ticketride.com',
      password: 'admin123', // In production, this would be hashed
    };
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([defaultAdmin]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
};

// Station operations
export const getStations = () => {
  const stations = localStorage.getItem(STORAGE_KEYS.STATIONS);
  return stations ? JSON.parse(stations) : [];
};

export const addStation = (station) => {
  const stations = getStations();
  const newStation = {
    ...station,
    id: Date.now().toString(),
  };
  stations.push(newStation);
  localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations));
  return newStation;
};

export const updateStation = (id, updates) => {
  const stations = getStations();
  const index = stations.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  stations[index] = { ...stations[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations));
  return stations[index];
};

export const deleteStation = (id) => {
  const stations = getStations();
  const filtered = stations.filter(s => s.id !== id);
  if (filtered.length === stations.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(filtered));
  return true;
};

export const getStationById = (id) => {
  const stations = getStations();
  return stations.find(s => s.id === id) || null;
};

// Route operations
export const getRoutes = () => {
  const routes = localStorage.getItem(STORAGE_KEYS.ROUTES);
  return routes ? JSON.parse(routes) : [];
};

export const addRoute = (route) => {
  const routes = getRoutes();
  const newRoute = {
    ...route,
    id: Date.now().toString(),
  };
  routes.push(newRoute);
  localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  return newRoute;
};

export const deleteRoute = (id) => {
  const routes = getRoutes();
  const filtered = routes.filter(r => r.id !== id);
  if (filtered.length === routes.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(filtered));
  return true;
};

export const getRoutesByTrain = (trainId) => {
  const routes = getRoutes();
  return routes.filter(r => r.trainId === trainId).sort((a, b) => a.sequence - b.sequence);
};

export const getRouteSegment = (trainId, fromStationId, toStationId) => {
  const routes = getRoutesByTrain(trainId);
  const fromIndex = routes.findIndex(r => r.stationId === fromStationId);
  const toIndex = routes.findIndex(r => r.stationId === toStationId);
  
  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    return null;
  }
  
  return routes.slice(fromIndex, toIndex + 1);
};

export const calculateDistance = (trainId, fromStationId, toStationId) => {
  const segment = getRouteSegment(trainId, fromStationId, toStationId);
  if (!segment || segment.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < segment.length - 1; i++) {
    totalDistance += segment[i].distanceToNext || 0;
  }
  return totalDistance;
};

// Train operations
export const getTrains = () => {
  const trains = localStorage.getItem(STORAGE_KEYS.TRAINS);
  return trains ? JSON.parse(trains) : [];
};

export const addTrain = (train) => {
  const trains = getTrains();
  const newTrain = {
    ...train,
    id: Date.now().toString(),
  };
  trains.push(newTrain);
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
  return newTrain;
};

export const updateTrain = (id, updates) => {
  const trains = getTrains();
  const index = trains.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  trains[index] = { ...trains[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
  return trains[index];
};

export const deleteTrain = (id) => {
  const trains = getTrains();
  const filtered = trains.filter(t => t.id !== id);
  if (filtered.length === trains.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(filtered));
  return true;
};

export const searchTrains = (originStationId, destinationStationId, date) => {
  const trains = getTrains();
  
  return trains.filter(train => {
    const routes = getRoutesByTrain(train.id);
    const originIndex = routes.findIndex(r => r.stationId === originStationId);
    const destinationIndex = routes.findIndex(r => r.stationId === destinationStationId);
    
    return originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex;
  });
};

export const getTrainById = (id) => {
  const trains = getTrains();
  return trains.find(t => t.id === id) || null;
};

export const getAllTrains = getTrains;

// Ticket operations
export const getTickets = () => {
  const tickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
  return tickets ? JSON.parse(tickets) : [];
};

export const addTicket = (ticket) => {
  const tickets = getTickets();
  const bookingCode = `TRH${Date.now().toString().slice(-8)}`;
  const newTicket = {
    ...ticket,
    id: Date.now().toString(),
    bookingCode,
    qrCode: bookingCode,
    createdAt: new Date().toISOString(),
    paymentStatus: ticket.paymentStatus || 'pending',
  };
  tickets.push(newTicket);
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  
  // Update available seats
  const train = getTrains().find(t => t.id === ticket.trainId);
  if (train) {
    updateTrain(train.id, { availableSeats: train.availableSeats - 1 });
  }
  
  return newTicket;
};

export const getTicketByCode = (code) => {
  const tickets = getTickets();
  return tickets.find(t => t.bookingCode === code || t.qrCode === code) || null;
};

export const getUserTickets = (userId) => {
  const tickets = getTickets();
  return tickets.filter(t => t.userId === userId);
};

export const getAllTickets = getTickets;

// Add these new functions for ticket updates
export const updateTicketPaymentStatus = (ticketId, paymentStatus) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;
  
  tickets[index] = { 
    ...tickets[index], 
    paymentStatus,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  return tickets[index];
};

export const updateTicket = (id, updates) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tickets[index] = { ...tickets[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  return tickets[index];
};

// User operations
export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const registerUser = (name, email, password) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, this would be hashed
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  return users.find((u) => u.email === email && u.password === password) || null;
};

// Admin operations
export const getCurrentAdmin = () => {
  const admin = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
  return admin ? JSON.parse(admin) : null;
};

export const setCurrentAdmin = (admin) => {
  if (admin) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  }
};

export const loginAdmin = (email, password) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  return admins.find((a) => a.email === email && a.password === password) || null;
};