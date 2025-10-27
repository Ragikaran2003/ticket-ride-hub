import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Download, MapPin, Clock, Calendar, LogOut, QrCode } from 'lucide-react';
import { getCurrentUser, getUserTickets } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setTickets(getUserTickets(user.id));
  }, [user, navigate]);

  const handleDownload = async (ticket) => {
    try {
      await generateTicketPDF(ticket);
      toast({
        title: 'Downloaded!',
        description: 'Your ticket has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ticket_ride_current_user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ticket Ride Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <Button onClick={() => navigate('/')}>
              Book New Ticket
            </Button>
          </div>

          {tickets.length === 0 ? (
            <Card className="p-12 text-center">
              <Train className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by booking your first ticket
              </p>
              <Button onClick={() => navigate('/')}>
                Search Trains
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-6">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-[300px]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary">{ticket.trainName}</h3>
                        <Badge variant={ticket.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {ticket.paymentStatus === 'paid' ? 'Paid' : 'Cash on Boarding'}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <MapPin className="h-3 w-3" /> From
                          </p>
                          <p className="font-semibold">{ticket.origin}</p>
                          <p className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {ticket.departureTime}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <MapPin className="h-3 w-3" /> To
                          </p>
                          <p className="font-semibold">{ticket.destination}</p>
                          <p className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {ticket.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.travelDate).toLocaleDateString()}
                        </span>
                        <span>Passenger: {ticket.passengerName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
                      <p className="text-lg font-bold text-primary mb-2">{ticket.bookingCode}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-4">
                        <QrCode className="h-3 w-3" /> QR code in ticket
                      </p>
                      <Button onClick={() => handleDownload(ticket)} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Ticket
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;