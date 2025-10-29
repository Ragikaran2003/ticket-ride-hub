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
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // Add this to prevent reloads

  const travelDate = searchParams.get('date') || '';
  const fromStationId = searchParams.get('from') || '';
  const toStationId = searchParams.get('to') || '';
  const user = getCurrentUser();

  useEffect(() => {
    // Prevent multiple loads
    if (hasLoaded) return;

    const loadBookingData = async () => {
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

      try {
        setIsLoading(true);
        console.log('🔄 Loading booking data...');
        
        // Get train data
        const trainData = await getTrainById(trainId);
        if (!trainData) {
          toast({
            title: 'Train not found',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        // Calculate distance and price
        const distance = await calculateDistance(trainId, fromStationId, toStationId);
        const calculatedPrice = Math.round(distance * trainData.price_per_km);
        
        // Get station names
        let originStation, destinationStation;
        try {
          originStation = await getStationById(fromStationId);
          destinationStation = await getStationById(toStationId);
        } catch (error) {
          console.error('Error loading stations:', error);
          originStation = { name: 'Origin Station' };
          destinationStation = { name: 'Destination Station' };
        }

        console.log('✅ Booking details loaded:', {
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
          origin: originStation?.name || 'Origin Station',
          destination: destinationStation?.name || 'Destination Station',
          price_per_km: trainData.price_per_km,
        });
        setPassengerName(user.name);
        setHasLoaded(true); // Mark as loaded to prevent reloads
      } catch (error) {
        console.error('❌ Error loading booking data:', error);
        toast({
          title: 'Failed to load booking details',
          description: 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [trainId, travelDate, fromStationId, toStationId, user, navigate, toast, hasLoaded]); // Add hasLoaded to dependencies

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
      originStationId: fromStationId,
      destinationStationId: toStationId,
      travelDate: travelDate,
      paymentMethod: paymentMethod,
    };

    console.log('🎫 Creating ticket with data:', ticketData);

    // Add ticket to storage
    console.log('📤 Calling addTicket API...');
    const result = await addTicket(ticketData);
    const ticket = result.ticket || result;
    
    console.log('✅ Ticket created successfully:', ticket);

    toast({
      title: 'Booking Confirmed! 🎉',
      description: 'Your ticket has been booked successfully',
    });

    // Generate PDF with enhanced error handling
    try {
      console.log('🔄 Generating PDF...');
      
      // Ensure ticket has all required fields for PDF
      const pdfTicketData = {
        ...ticket,
        train_name: train.name,
        origin: train.origin,
        destination: train.destination,
        distance: train.distance,
        price: train.calculatedPrice,
        departure_time: '08:00 AM',
        arrival_time: '04:00 PM',
        travel_date: travelDate,
        passenger_name: passengerName.trim(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid'
      };
      
      await generateTicketPDF(pdfTicketData);
      console.log('📄 PDF generated successfully');
      
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      
      // Don't fail the entire booking if PDF fails
      toast({
        title: 'Ticket booked! 📝',
        description: 'PDF download failed, but you can view your ticket in My Tickets',
        variant: 'default',
      });
    }
    
    // Navigate to my-tickets after a short delay
    setTimeout(() => {
      navigate('/my-tickets');
    }, 2000);

  } catch (error) {
    console.error('❌ Booking error details:', error);
    toast({
      title: 'Booking failed',
      description: error.response?.data?.error || error.message || 'Please try again',
      variant: 'destructive',
    });
  } finally {
    setIsProcessing(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load train details</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Search
          </Button>
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
                      Distance: {train.distance} km • ₹{train.price_per_km}/km
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
                  {train.distance} km × ₹{train.price_per_km}/km
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