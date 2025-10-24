import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Train, Clock, MapPin, IndianRupee, Calendar as CalendarIcon } from 'lucide-react';
import { getTrainById, addTicket, getCurrentUser, Train as TrainType } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Booking = () => {
  const navigate = useNavigate();
  const { trainId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [train, setTrain] = useState<TrainType | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const travelDate = searchParams.get('date') || '';
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Please login first',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (trainId) {
      const foundTrain = getTrainById(trainId);
      if (foundTrain) {
        setTrain(foundTrain);
        setPassengerName(user.name);
      } else {
        navigate('/');
      }
    }
  }, [trainId, user, navigate, toast]);

  const handleBooking = async () => {
    if (!train || !user || !passengerName) return;

    setIsProcessing(true);
    try {
      const ticket = addTicket({
        userId: user.id,
        trainId: train.id,
        trainName: train.name,
        route: train.route,
        origin: train.origin,
        destination: train.destination,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        travelDate,
        passengerName,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      });

      await generateTicketPDF(ticket);

      toast({
        title: 'Booking Successful!',
        description: 'Your ticket has been downloaded.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!train) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ticket Ride Hub</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            My Bookings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Complete Your Booking</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Train Details */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Journey Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Train</p>
                  <p className="text-lg font-semibold text-primary">{train.name}</p>
                  <p className="text-sm text-muted-foreground">{train.route}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> From
                    </p>
                    <p className="font-semibold">{train.origin}</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {train.departureTime}
                    </p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> To
                    </p>
                    <p className="font-semibold">{train.destination}</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {train.arrivalTime}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Travel Date
                  </p>
                  <p className="font-semibold">
                    {new Date(travelDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Total Fare</p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-5 w-5" />
                      <p className="text-2xl font-bold text-primary">{train.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Form */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Passenger Details</h3>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Passenger Name</Label>
                  <Input
                    id="name"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter passenger name"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'online')}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="cursor-pointer flex-1">
                        <p className="font-semibold">Cash on Boarding</p>
                        <p className="text-sm text-muted-foreground">Pay when you board the train</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="cursor-pointer flex-1">
                        <p className="font-semibold">Online Payment</p>
                        <p className="text-sm text-muted-foreground">Pay now (Simulated)</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!passengerName || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Booking'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;
