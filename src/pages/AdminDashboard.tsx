import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Train, Shield, LogOut, Plus, Edit2, Trash2, Search, Ticket } from 'lucide-react';
import { 
  getCurrentAdmin, 
  getAllTrains, 
  addTrain, 
  updateTrain, 
  deleteTrain,
  getAllTickets,
  getTicketByCode
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trains, setTrains] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    route: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    availableSeats: '',
  });

  // Check admin on component mount only
  useEffect(() => {
    const admin = getCurrentAdmin();
    if (!admin) {
      navigate('/admin');
      return;
    }
    
    // Load data after confirming admin exists
    setTrains(getAllTrains());
    setTickets(getAllTickets());
    setIsLoading(false);
  }, []); // Empty dependency array - runs only once

  const handleLogout = () => {
    localStorage.removeItem('ticket_ride_current_admin');
    navigate('/admin');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      route: '',
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
      availableSeats: '',
    });
    setEditingTrain(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.origin || !formData.destination) {
      toast({
        title: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const trainData = {
      ...formData,
      price: parseFloat(formData.price),
      availableSeats: parseInt(formData.availableSeats),
    };

    if (editingTrain) {
      updateTrain(editingTrain.id, trainData);
      toast({ title: 'Train updated successfully' });
    } else {
      addTrain(trainData);
      toast({ title: 'Train added successfully' });
    }

    // Update state directly
    setTrains(getAllTrains());
    setTickets(getAllTickets());
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      route: train.route,
      origin: train.origin,
      destination: train.destination,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price.toString(),
      availableSeats: train.availableSeats.toString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this train?')) {
      deleteTrain(id);
      toast({ title: 'Train deleted' });
      // Update state directly
      setTrains(getAllTrains());
      setTickets(getAllTickets());
    }
  };

  const handleVerify = () => {
    const ticket = getTicketByCode(searchCode);
    if (ticket) {
      setVerifiedTicket(ticket);
      toast({
        title: 'Ticket Verified!',
        description: `Valid ticket for ${ticket.passengerName}`,
      });
    } else {
      setVerifiedTicket(null);
      toast({
        title: 'Invalid Ticket',
        description: 'No ticket found with this code',
        variant: 'destructive',
      });
    }
  };

  const admin = getCurrentAdmin();

  // Show loading while checking admin
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no admin after loading, show nothing (will redirect)
  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{admin.name}</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trains" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trains">Manage Trains</TabsTrigger>
            <TabsTrigger value="bookings">View Bookings</TabsTrigger>
            <TabsTrigger value="verify">Verify Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="trains" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Train Management</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Train
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTrain ? 'Edit Train' : 'Add New Train'}</DialogTitle>
                    <DialogDescription>
                      {editingTrain 
                        ? 'Update the train details below.' 
                        : 'Fill in the details to add a new train to the system.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Train Name *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Input value={formData.route} onChange={(e) => setFormData({...formData, route: e.target.value})} />
                    </div>
                    <div>
                      <Label>Origin *</Label>
                      <Input value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} />
                    </div>
                    <div>
                      <Label>Destination *</Label>
                      <Input value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
                    </div>
                    <div>
                      <Label>Departure Time</Label>
                      <Input value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} placeholder="09:00 AM" />
                    </div>
                    <div>
                      <Label>Arrival Time</Label>
                      <Input value={formData.arrivalTime} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} placeholder="02:00 PM" />
                    </div>
                    <div>
                      <Label>Price (₹)</Label>
                      <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                      <Label>Available Seats</Label>
                      <Input type="number" value={formData.availableSeats} onChange={(e) => setFormData({...formData, availableSeats: e.target.value})} />
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={handleSubmit}>
                    {editingTrain ? 'Update Train' : 'Add Train'}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {trains.map((train) => (
                <Card key={train.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{train.name}</h3>
                      <p className="text-sm text-muted-foreground">{train.route}</p>
                      <p className="text-sm mt-2">{train.origin} → {train.destination}</p>
                      <p className="text-sm text-muted-foreground">{train.departureTime} - {train.arrivalTime}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{train.price}</p>
                        <p className="text-sm text-muted-foreground">{train.availableSeats} seats</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(train)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(train.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">All Bookings ({tickets.length})</h2>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-primary">{ticket.trainName}</h3>
                        <Badge variant={ticket.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {ticket.paymentStatus === 'paid' ? 'Paid' : 'Cash'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {ticket.origin} → {ticket.destination}
                      </p>
                      <p className="text-sm">Passenger: {ticket.passengerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Travel Date: {new Date(ticket.travelDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Booking Code</p>
                      <p className="text-lg font-bold">{ticket.bookingCode}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Booked: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Verify Ticket</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Enter Booking Code or Scan QR</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter booking code"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                    />
                    <Button onClick={handleVerify}>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>

                {verifiedTicket && (
                  <Card className="p-6 bg-primary/5 border-primary">
                    <div className="flex items-start gap-3 mb-4">
                      <Ticket className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary">{verifiedTicket.trainName}</h3>
                        <p className="text-sm text-muted-foreground">{verifiedTicket.route}</p>
                      </div>
                      <Badge className="bg-green-500">Valid</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Passenger</p>
                        <p className="font-semibold">{verifiedTicket.passengerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Travel Date</p>
                        <p className="font-semibold">{new Date(verifiedTicket.travelDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">From - To</p>
                        <p className="font-semibold">{verifiedTicket.origin} → {verifiedTicket.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <Badge variant={verifiedTicket.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {verifiedTicket.paymentStatus === 'paid' ? 'Paid' : 'Cash on Boarding'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;