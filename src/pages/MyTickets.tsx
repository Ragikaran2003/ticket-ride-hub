import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Calendar, MapPin, Clock, Download, Ticket, Navigation } from 'lucide-react';
import { getUserTickets, getCurrentUser } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator'; // Import the PDF generator
import { useToast } from '@/hooks/use-toast';

const MyTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    console.log('🔍 useEffect triggered - user:', user, 'hasLoaded:', hasLoaded);
    
    if (!user) {
      console.log('❌ No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (!hasLoaded) {
      loadTickets();
    }
  }, [user, hasLoaded, navigate]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading user tickets...');
      const ticketsData = await getUserTickets();
      console.log('✅ Tickets loaded:', ticketsData);
      
      if (Array.isArray(ticketsData)) {
        setTickets(ticketsData);
      } else {
        console.error('❌ Tickets data is not an array:', ticketsData);
        setTickets([]);
      }
      
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Failed to load tickets',
        description: 'Please try again',
        variant: 'destructive',
      });
      setTickets([]);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (ticket) => {
    setDownloading(ticket.id);
    try {
      console.log('📥 Downloading ticket:', ticket);
      
      // Prepare ticket data for PDF
      const pdfTicketData = {
        ...ticket,
        // Ensure all required fields are present
        train_name: ticket.train_name || 'Train',
        origin_name: ticket.origin_name || ticket.origin,
        destination_name: ticket.destination_name || ticket.destination,
        passenger_name: ticket.passenger_name || 'Passenger',
        travel_date: ticket.travel_date,
        price: ticket.price,
        distance: ticket.distance || 0,
        booking_code: ticket.booking_code,
        departure_time: ticket.departure_time || '08:00 AM',
        arrival_time: ticket.arrival_time || '04:00 PM',
        payment_method: ticket.payment_method || 'cash',
        payment_status: ticket.payment_status || 'pending'
      };
      
      await generateTicketPDF(pdfTicketData);
      
      toast({
        title: '✅ Ticket Downloaded!',
        description: 'Your ticket PDF has been saved',
      });
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (ticket) => {
    if (new Date(ticket.travel_date) < new Date()) {
      return 'completed';
    }
    return ticket.payment_status === 'paid' ? 'confirmed' : 'pending';
  };

  const getStatusText = (ticket) => {
    if (new Date(ticket.travel_date) < new Date()) {
      return 'Journey Completed';
    }
    return ticket.payment_status === 'paid' ? 'Confirmed' : 'Pending Payment';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Tickets</h1>
            <p className="text-muted-foreground mt-2">
              Manage your upcoming and past journeys
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTickets}>
              Refresh
            </Button>
            <Button onClick={() => navigate('/')}>
              <Ticket className="h-4 w-4 mr-2" />
              Book New Ticket
            </Button>
          </div>
        </div>

        {!Array.isArray(tickets) || tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't booked any train tickets yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Book Your First Ticket
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-primary">{ticket.train_name}</h3>
                      <Badge variant={
                        getStatusColor(ticket) === 'confirmed' ? 'default' :
                        getStatusColor(ticket) === 'pending' ? 'secondary' : 'outline'
                      }>
                        {getStatusText(ticket)}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.origin_name}</p>
                          <p className="text-xs text-muted-foreground">Departure</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.destination_name}</p>
                          <p className="text-xs text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(ticket.travel_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Travel Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.departure_time || '08:00 AM'}</p>
                          <p className="text-xs text-muted-foreground">Departure Time</p>
                        </div>
                      </div>
                    </div>
                    
                    {ticket.distance && (
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Distance: {ticket.distance} km • Fare: ₹{ticket.price}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Passenger:</span>
                        <span className="font-medium ml-2">{ticket.passenger_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Booking Code:</span>
                        <span className="font-medium ml-2">{ticket.booking_code}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium ml-2">₹{ticket.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(ticket)}
                      disabled={downloading === ticket.id}
                    >
                      {downloading === ticket.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;