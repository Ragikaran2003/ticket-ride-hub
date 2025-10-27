import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Train, Clock, MapPin, IndianRupee, Calendar as CalendarIcon } from 'lucide-react';
import { getTrainById, addTicket, getCurrentUser } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Booking = () => {
  const navigate = useNavigate();
  const { trainId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [train, setTrain] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
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

    if (!travelDate) {
      toast({
        title: 'Please select travel date',
        variant: 'destructive',
      });
      navigate('/search');
      return;
    }

    const trainData = getTrainById(trainId);
    if (!trainData) {
      toast({
        title: 'Train not found',
        variant: 'destructive',
      });
      navigate('/search');
      return;
    }

    setTrain(trainData);
    setPassengerName(user.name);
  }, [trainId, travelDate, user, navigate, toast]);

  const handleBooking = async () => {
    if (!passengerName.trim()) {
      toast({
        title: 'Please enter passenger name',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const ticket = addTicket({
        trainId: train.id,
        userId: user.id,
        trainName: train.name,
        route: train.route,
        origin: train.origin,
        destination: train.destination,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        price: train.price,
        passengerName,
        travelDate,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      });

      toast({
        title: 'Booking Confirmed!',
        description: 'Your ticket has been booked successfully',
      });

      await generateTicketPDF(ticket);
      
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);

    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!train) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading train details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Confirm Your Booking</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Train Details</h2>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Train className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary">{train.name}</h3>
                  <p className="text-sm text-muted-foreground">{train.route}</p>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{train.origin}</p>
                        <p className="text-xs text-muted-foreground">Departure</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{train.departureTime}</p>
                        <p className="text-xs text-muted-foreground">Time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{new Date(travelDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Passenger Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passengerName">Full Name</Label>
                  <Input
                    id="passengerName"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter passenger name"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash on Boarding</Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6 mb-4">
                  Pay for your ticket when you board the train
                </p>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">Online Payment</Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Pay securely online (Coming Soon)
                </p>
              </RadioGroup>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Price</span>
                  <span className="font-medium">₹{train.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{train.price}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBooking}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By confirming, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;