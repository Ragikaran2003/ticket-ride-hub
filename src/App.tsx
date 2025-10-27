import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { initializeData } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SearchResults from '@/pages/SearchResults';
import Booking from '@/pages/Booking';
import MyTickets from '@/pages/MyTickets';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';

// Initialize sample data
initializeData();

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={
            <>
              <Navbar />
              <SearchResults />
            </>
          } />
          
          {/* Protected User Routes */}
          <Route path="/booking/:trainId" element={
            <>
              <Navbar />
              <Booking />
            </>
          } />
          <Route path="/my-tickets" element={
            <>
              <Navbar />
              <MyTickets />
            </>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster />
      </div>
    </Router>
  );
}

export default App;