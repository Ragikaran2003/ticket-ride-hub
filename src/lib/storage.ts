// Local storage utilities for the train booking system

export interface Train {
  id: string;
  name: string;
  route: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

export interface Ticket {
  id: string;
  bookingCode: string;
  qrCode: string;
  trainId: string;
  trainName: string;
  route: string;
  origin: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  passengerEmail: string;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
}

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
    const sampleTrains: Train[] = [
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
    const defaultAdmin: Admin = {
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
export const getTrains = (): Train[] => {
  const trains = localStorage.getItem(STORAGE_KEYS.TRAINS);
  return trains ? JSON.parse(trains) : [];
};

export const addTrain = (train: Omit<Train, 'id'>): Train => {
  const trains = getTrains();
  const newTrain = {
    ...train,
    id: Date.now().toString(),
  };
  trains.push(newTrain);
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
  return newTrain;
};

export const updateTrain = (id: string, updates: Partial<Train>): Train | null => {
  const trains = getTrains();
  const index = trains.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  trains[index] = { ...trains[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
  return trains[index];
};

export const deleteTrain = (id: string): boolean => {
  const trains = getTrains();
  const filtered = trains.filter(t => t.id !== id);
  if (filtered.length === trains.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(filtered));
  return true;
};

export const searchTrains = (origin: string, destination: string, date: string): Train[] => {
  const trains = getTrains();
  return trains.filter(
    t => t.origin.toLowerCase().includes(origin.toLowerCase()) &&
         t.destination.toLowerCase().includes(destination.toLowerCase()) &&
         t.availableSeats > 0
  );
};

// Ticket operations
export const getTickets = (): Ticket[] => {
  const tickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
  return tickets ? JSON.parse(tickets) : [];
};

export const addTicket = (ticket: Omit<Ticket, 'id' | 'bookingCode' | 'qrCode' | 'createdAt'>): Ticket => {
  const tickets = getTickets();
  const bookingCode = `TRH${Date.now().toString().slice(-8)}`;
  const newTicket: Ticket = {
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

export const getTicketByCode = (code: string): Ticket | null => {
  const tickets = getTickets();
  return tickets.find(t => t.bookingCode === code || t.qrCode === code) || null;
};

// User operations
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const registerUser = (name: string, email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, this would be hashed
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  return users.find((u: User) => u.email === email && u.password === password) || null;
};

// Admin operations
export const getCurrentAdmin = (): Admin | null => {
  const admin = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
  return admin ? JSON.parse(admin) : null;
};

export const setCurrentAdmin = (admin: Admin | null) => {
  if (admin) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  }
};

export const loginAdmin = (email: string, password: string): Admin | null => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  return admins.find((a: Admin) => a.email === email && a.password === password) || null;
};
