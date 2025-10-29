import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Clock, MapPin, ArrowRight, IndianRupee, Navigation } from 'lucide-react';
import { searchTrains, getStations, calculateDistance, getStationById } from '@/lib/storage';
import { toast, useToast } from '@/hooks/use-toast';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const fromStationId = searchParams.get('from') || '';
  const toStationId = searchParams.get('to') || '';

  useEffect(() => {
    loadSearchResults();
  }, [fromStationId, toStationId, date]);

  const loadSearchResults = async () => {
    try {
      setIsLoading(true);
      const [trainsData, stationsData] = await Promise.all([
        searchTrains(fromStationId, toStationId, date),
        getStations()
      ]);

      console.log('🚆 Trains found:', trainsData);

      // Calculate distance and price for each train
      const trainsWithDetails = await Promise.all(
        trainsData.map(async (train) => {
          try {
            const distance = await calculateDistance(train.id, fromStationId, toStationId);
            const price = Math.round(distance * train.price_per_km);
            
            return {
              ...train,
              distance: distance,
              calculatedPrice: price
            };
          } catch (error) {
            console.error(`Error processing train ${train.id}:`, error);
            // Return train with default values
            return {
              ...train,
              distance: 200,
              calculatedPrice: 200 * train.price_per_km
            };
          }
        })
      );

      console.log('✅ Trains with details:', trainsWithDetails);
      setTrains(trainsWithDetails);
      setStations(stationsData);
    } catch (error) {
      console.error('❌ Search error:', error);
      toast({
        title: 'Failed to load trains',
        description: 'Please try again',
        variant: 'destructive',
      });
      setTrains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (trainId) => {
    console.log('🎫 Book Now clicked for train:', trainId);
    console.log('📅 Date:', date);
    console.log('📍 From:', fromStationId);
    console.log('📍 To:', toStationId);
    
    // Navigate to booking page with all required parameters
    navigate(`/book/${trainId}?date=${date}&from=${fromStationId}&to=${toStationId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Searching for trains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ticket Ride Hub</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Search
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold">{origin}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <span className="font-semibold">{destination}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-base">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Badge>
          </div>
        </Card>

        {/* Results */}
        {trains.length === 0 ? (
          <Card className="p-12 text-center">
            <Train className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No trains found</h3>
            <p className="text-muted-foreground mb-6">
              Try searching with different stations or dates
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Search
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              Available Trains ({trains.length})
            </h2>
            {trains.map((train) => {
              const originStation = stations.find(s => s.id === fromStationId);
              const destinationStation = stations.find(s => s.id === toStationId);

              return (
                <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-xl font-bold text-primary mb-1">{train.name}</h3>
                      
                      {/* Route Information */}
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4" />
                        <span>{train.distance} km • ₹{train.calculatedPrice} total fare</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-semibold">08:00</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{originStation?.name}</p>
                      </div>

                      <ArrowRight className="h-6 w-6 text-primary" />

                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-semibold">16:00</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{destinationStation?.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <IndianRupee className="h-5 w-5" />
                        <p className="text-2xl font-bold text-primary">{train.calculatedPrice}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {train.available_seats} seats available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{train.price_per_km}/km
                      </p>
                      <Button
                        onClick={() => handleBookNow(train.id)}
                        disabled={train.available_seats === 0}
                        className="mt-2"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;