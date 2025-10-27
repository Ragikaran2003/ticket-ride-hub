import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Train, Clock, MapPin, IndianRupee, Calendar as CalendarIcon, Navigation } from 'lucide-react';
import { getTrainById, addTicket, getCurrentUser, calculateDistance, getStationById } from '@/lib/storage';
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
  const fromStationId = searchParams.get('from') || '';
  const toStationId = searchParams.get('to') || '';
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
      navigate('/');
      return;
    }

    if (!fromStationId || !toStationId) {
      toast({
        title: 'Invalid station selection',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    const trainData = getTrainById(trainId);
    if (!trainData) {
      toast({
        title: 'Train not found',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Calculate distance and price
    const distance = calculateDistance(trainId, fromStationId, toStationId);
    const calculatedPrice = Math.round(distance * trainData.pricePerKm);
    const originStation = getStationById(fromStationId);
    const destinationStation = getStationById(toStationId);

    console.log('Booking details:', {
      trainData,
      distance,
      calculatedPrice,
      originStation,
      destinationStation
    });

    setTrain({
      ...trainData,
      distance,
      calculatedPrice,
      origin: originStation?.name || 'Unknown Station',
      destination: destinationStation?.name || 'Unknown Station',
      originStation,
      destinationStation,
    });
    setPassengerName(user.name);
  }, [trainId, travelDate, fromStationId, toStationId, user, navigate, toast]);

  const handleBooking = async () => {
    if (!passengerName.trim()) {
      toast({
        title: 'Please enter passenger name',
        variant: 'destructive',
      });
      return;
    }

    if (!train) {
      toast({
        title: 'Train information not loaded',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create ticket data
      const ticketData = {
        trainId: train.id,
        userId: user.id,
        trainName: train.name,
        route: `${train.origin} to ${train.destination}`,
        origin: train.origin,
        destination: train.destination,
        departureTime: '08:00 AM',
        arrivalTime: '04:00 PM',
        price: train.calculatedPrice,
        distance: train.distance,
        calculatedPrice: train.calculatedPrice,
        passengerName: passengerName.trim(),
        travelDate: travelDate,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      };

      console.log('Creating ticket:', ticketData);

      // Add ticket to storage
      const ticket = addTicket(ticketData);
      
      console.log('Ticket created:', ticket);

      toast({
        title: 'Booking Confirmed! 🎉',
        description: 'Your ticket has been booked successfully',
      });

      // Generate PDF
      try {
        await generateTicketPDF(ticket);
        console.log('PDF generated successfully');
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        // Continue even if PDF fails
        toast({
          title: 'Ticket booked but PDF download failed',
          description: 'You can download the ticket from My Tickets page',
          variant: 'default',
        });
      }
      
      // Navigate to my-tickets after a short delay
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'Please try again. Error: ' + error.message,
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
                  <p className="text-sm text-muted-foreground">{train.origin} → {train.destination}</p>
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
                        <p className="text-sm font-medium">08:00 AM</p>
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
                  <div className="flex items-center gap-2 mt-3">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Distance: {train.distance} km • ₹{train.pricePerKm}/km
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Passenger Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passengerName">Full Name *</Label>
                  <Input
                    id="passengerName"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter passenger name"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="font-normal">Cash on Boarding</Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6 mb-4">
                  Pay for your ticket when you board the train
                </p>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" disabled />
                  <Label htmlFor="online" className="font-normal text-muted-foreground">Online Payment</Label>
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
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">₹{train.calculatedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{train.calculatedPrice}</span>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {train.distance} km × ₹{train.pricePerKm}/km
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBooking}
                disabled={isProcessing || !passengerName.trim()}
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