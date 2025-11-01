import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Train, Clock, MapPin, IndianRupee, Calendar as CalendarIcon, Navigation, User } from 'lucide-react';
import { addTicket, getCurrentUser } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Booking = () => {
  const navigate = useNavigate();
  const { trainId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  const [train, setTrain] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    const initializeBooking = () => {
      if (!user) {
        toast({
          title: 'Please login first',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Get data passed from search results via state
      const { trainData, searchParams } = location.state || {};

      console.log('📍 Location state:', location.state);
      console.log('📦 Train data:', trainData);
      console.log('🔍 Search params:', searchParams);

      if (!trainData || !searchParams) {
        toast({
          title: 'Invalid booking data',
          description: 'Please search for trains again',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      if (!searchParams.date) {
        toast({
          title: 'Please select travel date',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Use the data passed from search results (no API calls needed)
      setTrain({
        ...trainData,
        travelDate: searchParams.date,
        fromStationId: searchParams.from,
        toStationId: searchParams.to,
        origin: searchParams.origin,
        destination: searchParams.destination
      });
      
      setPassengerName(user.name);
    };

    initializeBooking();
  }, [user, navigate, toast, location.state]);

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
        passengerName: passengerName.trim(),
        originStationId: train.fromStationId,
        destinationStationId: train.toStationId,
        travelDate: train.travelDate,
        paymentMethod: paymentMethod,
      };

      console.log('🎫 Creating ticket with data:', ticketData);
      console.log('💰 Expected price:', train.calculatedPrice || train.price);
      console.log('📏 Expected distance:', train.distance);

      // Add ticket to storage
      const result = await addTicket(ticketData);
      
      const ticket = result.ticket || result;
      
      if (!ticket) {
        throw new Error('No ticket data received from server');
      }

      console.log('✅ Ticket created successfully:', ticket);

      toast({
        title: 'Booking Confirmed! 🎉',
        description: 'Your ticket has been booked successfully',
      });

      // Generate PDF
      try {
        const pdfTicketData = {
          ...ticket,
          train_name: train.name,
          origin_name: train.origin,
          destination_name: train.destination,
          distance: ticket.distance || train.distance,
          price: ticket.price || train.calculatedPrice || train.price,
          departure_time: '08:00 AM',
          arrival_time: '04:00 PM',
          travel_date: train.travelDate,
          passenger_name: passengerName.trim(),
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cash' ? 'pending' : 'paid'
        };
        
        await generateTicketPDF(pdfTicketData);
        console.log('📄 PDF generated successfully');
        
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        toast({
          title: 'Ticket booked! 📝',
          description: 'PDF download failed, but you can view your ticket in My Tickets',
          variant: 'default',
        });
      }
      
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);

    } catch (error) {
      console.error('❌ Booking error details:', error);
      
      let errorMessage = 'Booking failed. Please try again.';
      
      if (error.message.includes('network') || error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message.includes('No seats available')) {
        errorMessage = 'No seats available on this train.';
      } else {
        errorMessage = error.message || 'Booking failed. Please try again.';
      }

       if (error.response?.data?.error?.includes('already booked')) {
    // Show specific duplicate booking error
    toast({
      title: 'Duplicate Booking',
      description: error.response.data.error,
      variant: 'destructive'
    });
  } else {
    // Other errors
    toast({
      title: 'Booking Failed',
      description: error.response?.data?.error || 'Please try again',
      variant: 'destructive'
    });
  }
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate travel time based on distance
  const calculateTravelTime = (distance) => {
    const totalMinutes = Math.round((distance / 60) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  // Calculate arrival time
  const calculateArrivalTime = (departureTime, travelMinutes) => {
    const [hours, mins] = departureTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + travelMinutes;
    
    const arrHours = Math.floor(totalMinutes / 60) % 24;
    const arrMinutes = totalMinutes % 60;
    
    return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
  };

  if (!train) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const travelTime = calculateTravelTime(train.distance);
  const arrivalTime = calculateArrivalTime('08:00', travelTime.totalMinutes);
  const displayPrice = train.calculatedPrice || train.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Confirm Your Booking</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Train Details Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Train className="h-5 w-5" />
                Train Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{train.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    <span>{train.distance} km • ₹{train.price_per_km}/km</span>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold">08:00</p>
                    <p className="text-sm text-muted-foreground mt-1">{train.origin}</p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 px-4">
                    <div className="w-full h-1 bg-gradient-to-r from-primary to-accent rounded-full mb-2"></div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{travelTime.hours}h {travelTime.minutes}m</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-semibold">{arrivalTime}</p>
                    <p className="text-sm text-muted-foreground mt-1">{train.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Travel Date</p>
                      <p className="text-muted-foreground">{new Date(train.travelDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Available Seats</p>
                      <p className="text-muted-foreground">{train.available_seats}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Passenger Information Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Passenger Information
              </h2>
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

            {/* Payment Method Card */}
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

          {/* Booking Summary Card */}
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">₹{displayPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{displayPrice}</span>
                </div>
                <div className="text-xs text-muted-foreground text-center bg-muted/50 p-2 rounded">
                  {train.distance} km × ₹{train.price_per_km}/km = ₹{displayPrice}
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBooking}
                disabled={isProcessing || !passengerName.trim() || train.available_seats === 0}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : train.available_seats === 0 ? (
                  'Sold Out'
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