import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Train, Clock, MapPin, IndianRupee, Calendar as CalendarIcon, Navigation, User, Hourglass } from 'lucide-react';
import { addTicket, getCurrentUser } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { formatTime, calculateTravelDuration , STATION_WAITING_TIME } from '@/utils/timeCalculations';

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
    // Use actual times from backend or fallback to calculated times
    const departureTime = formatTime(train.departureTime || train.departure_time);
    const arrivalTime = formatTime(train.arrivalTime || train.arrival_time);
    const displayPrice = train.price;
    const distance = train.distance; // Default fallback

    console.log('🚂 Train data for booking:', train);

    // Create complete ticket data
    const ticketData = {
      trainId: train.id,
      passengerName: passengerName.trim(),
      originStationId: train.fromStationId || train.origin_station_id,
      destinationStationId: train.toStationId || train.destination_station_id,
      travelDate: train.travelDate,
      paymentMethod: paymentMethod,
      price: displayPrice,
      distance: distance,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid'
    };

    console.log('🎫 Creating ticket with data:', ticketData);

    // Add ticket to storage
    const result = await addTicket(ticketData);
    
    console.log('📦 Add ticket result:', result);
    
    const ticket = result.ticket || result;
    
    if (!ticket) {
      throw new Error('No ticket data received from addTicket function');
    }

    if (ticket.error) {
      throw new Error(ticket.error);
    }

    console.log('✅ Ticket created successfully:', ticket);

    toast({
      title: 'Booking Confirmed! 🎉',
      description: 'Your ticket has been booked successfully',
    });

    // Generate PDF with actual timing data
    try {
      const pdfTicketData = {
        id: ticket.id || ticket.booking_code,
        train_name: train.name,
        origin_name: train.origin,
        destination_name: train.destination,
        distance: ticket.distance || distance,
        price: ticket.price,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        travel_date: train.travelDate,
        passenger_name: passengerName.trim(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        booking_code: ticket.booking_code 
      };
      
      // await generateTicketPDF(pdfTicketData);
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
    console.error('❌ Error response:', error.response);
    console.error('❌ Error message:', error.message);
    
    // Check for specific error types
    if (error.message?.includes('already booked') || error.response?.data?.error?.includes('already booked')) {
      toast({
        title: 'Duplicate Booking',
        description: 'You have already booked a ticket for this train on the selected date',
        variant: 'destructive'
      });
    } else if (error.message?.includes('No ticket data')) {
      toast({
        title: 'Booking Failed',
        description: 'Ticket was not created properly. Please try again.',
        variant: 'destructive'
      });
    } else if (error.response?.data?.error) {
      toast({
        title: 'Booking Failed',
        description: error.response.data.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    }
  } finally {
    setIsProcessing(false);
  }
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

  // Use actual times from backend or fallback to calculated times
  const departureTime = formatTime(train.departureTime || train.departure_time);
  const arrivalTime = formatTime(train.arrivalTime || train.arrival_time);
  const travelDuration = calculateTravelDuration(departureTime, arrivalTime);
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
                    <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      <Hourglass className="h-3 w-3" />
                      <span className="text-xs font-medium">{STATION_WAITING_TIME}m stops at stations</span>
                    </div>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-700">{departureTime}</p>
                    <p className="text-sm text-muted-foreground mt-1">{train.origin}</p>
                    <p className="text-xs text-green-600 mt-1">Departure</p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 px-4">
                    <div className="w-full h-1 bg-gradient-to-r from-green-600 to-red-600 rounded-full mb-2"></div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{travelDuration.display}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                      <Hourglass className="h-3 w-3" />
                      <span>2m stops included</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-700">{arrivalTime}</p>
                    <p className="text-sm text-muted-foreground mt-1">{train.destination}</p>
                    <p className="text-xs text-red-600 mt-1">Arrival</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Travel Date</p>
                      <p className="text-muted-foreground">
                        {new Date(train.travelDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Available Seats</p>
                      <p className={`font-medium ${
                        train.available_seats > 10 ? 'text-green-600' : 
                        train.available_seats > 0 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {train.available_seats} {train.available_seats === 1 ? 'seat' : 'seats'}
                      </p>
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
                    className="mt-1" disabled
                  />
                </div>
                <div className="text-sm text-muted-foreground" >
                  <p>Booking for: <span className="font-medium">{user.name}</span> ({user.email})</p>
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
                  <span className="text-muted-foreground">Train Fare</span>
                  <span className="font-medium">₹{displayPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
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

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departure</span>
                  <span className="font-medium">{departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrival</span>
                  <span className="font-medium">{arrivalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{travelDuration.display}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span className="text-muted-foreground">Waiting Time</span>
                  <span className="font-medium flex items-center gap-1">
                    <Hourglass className="h-3 w-3" />
                    {STATION_WAITING_TIME}m at stations
                  </span>
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
                    
                    Confirm Booking
                  </>
                )}
              </Button>

              {train.available_seats > 0 && train.available_seats < 5 && (
                <p className="text-xs text-orange-600 text-center mt-2">
                  Only {train.available_seats} seat{train.available_seats !== 1 ? 's' : ''} left!
                </p>
              )}

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