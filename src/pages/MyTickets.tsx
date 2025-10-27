import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Calendar, MapPin, Clock, Download, Ticket, Navigation } from 'lucide-react';
import { getCurrentUser, getUserTickets } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const MyTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Load tickets only once when component mounts
    const userTickets = getUserTickets(currentUser.id);
    setTickets(userTickets);
  }, [navigate, refresh]); // Add refresh dependency

  const handleDownload = async (ticket) => {
    setDownloading(ticket.id);
    try {
      await generateTicketPDF(ticket);
      toast({
        title: 'Ticket Downloaded',
        description: 'Your ticket has been saved',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (ticket) => {
    if (new Date(ticket.travelDate) < new Date()) {
      return 'completed';
    }
    return ticket.paymentStatus === 'paid' ? 'confirmed' : 'pending';
  };

  const getStatusText = (ticket) => {
    if (new Date(ticket.travelDate) < new Date()) {
      return 'Journey Completed';
    }
    return ticket.paymentStatus === 'paid' ? 'Confirmed' : 'Pending Payment';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
            <Button variant="outline" onClick={() => setRefresh(!refresh)}>
              Refresh
            </Button>
            <Button onClick={() => navigate('/')}>
              <Ticket className="h-4 w-4 mr-2" />
              Book New Ticket
            </Button>
          </div>
        </div>

        {tickets.length === 0 ? (
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
                      <h3 className="text-xl font-bold text-primary">{ticket.trainName}</h3>
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
                          <p className="text-sm font-medium">{ticket.origin}</p>
                          <p className="text-xs text-muted-foreground">Departure</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.destination}</p>
                          <p className="text-xs text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(ticket.travelDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Travel Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.departureTime}</p>
                          <p className="text-xs text-muted-foreground">Departure Time</p>
                        </div>
                      </div>
                    </div>
                    
                    {ticket.distance && (
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Distance: {ticket.distance} km • Fare: ₹{ticket.calculatedPrice || ticket.price}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Passenger:</span>
                        <span className="font-medium ml-2">{ticket.passengerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Booking Code:</span>
                        <span className="font-medium ml-2">{ticket.bookingCode}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium ml-2">₹{ticket.calculatedPrice || ticket.price}</span>
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
                          Download
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