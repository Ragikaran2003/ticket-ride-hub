// Local storage utilities for the train booking system

const STORAGE_KEYS = {
  TRAINS: 'ticket_ride_trains',
  TICKETS: 'ticket_ride_tickets',
  USERS: 'ticket_ride_users',
  ADMINS: 'ticket_ride_admins',
  CURRENT_USER: 'ticket_ride_current_user',
  CURRENT_ADMIN: 'ticket_ride_current_admin',
};

// Initialize with sample data
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TRAINS)) {
    const sampleTrains = [
      {
        id: '1',
        name: 'Express 101',
        route: 'Mumbai-Delhi',
        origin: 'Mumbai',
        destination: 'Delhi',
        departureTime: '08:00',
        arrivalTime: '16:30',
        price: 1200,
        availableSeats: 50,
      },
      {
        id: '2',
        name: 'Rajdhani Express',
        route: 'Delhi-Kolkata',
        origin: 'Delhi',
        destination: 'Kolkata',
        departureTime: '16:55',
        arrivalTime: '10:05',
        price: 2100,
        availableSeats: 40,
      },
      {
        id: '3',
        name: 'Shatabdi Express',
        route: 'Chennai-Bangalore',
        origin: 'Chennai',
        destination: 'Bangalore',
        departureTime: '06:00',
        arrivalTime: '11:00',
        price: 800,
        availableSeats: 60,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(sampleTrains));
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

export const searchTrains = (origin, destination, date) => {
  const trains = getTrains();
  return trains.filter(
    t => t.origin.toLowerCase().includes(origin.toLowerCase()) &&
         t.destination.toLowerCase().includes(destination.toLowerCase()) &&
         t.availableSeats > 0
  );
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