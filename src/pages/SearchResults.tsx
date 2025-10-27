import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Clock, MapPin, ArrowRight, IndianRupee, Navigation } from 'lucide-react';
import { searchTrains } from '@/lib/storage';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState([]);

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    const results = searchTrains(origin, destination, date);
    setTrains(results);
  }, [origin, destination, date]);

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
              Try searching with different cities or dates
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
            {trains.map((train) => (
              <Card key={train.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-xl font-bold text-primary mb-1">{train.name}</h3>
                    <p className="text-sm text-muted-foreground">{train.route}</p>
                    
                    {/* Distance Information */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Navigation className="h-4 w-4" />
                      <span>{train.distance} km • Rs. {train.price} total fare</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-semibold">{train.departureTime}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{train.origin}</p>
                    </div>

                    <ArrowRight className="h-6 w-6 text-primary" />

                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-semibold">{train.arrivalTime}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{train.destination}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <IndianRupee className="h-5 w-5" />
                      <p className="text-2xl font-bold text-primary">{train.price}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {train.availableSeats} seats available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {(train.price / train.distance).toFixed(2)}/km
                    </p>
                    <Button
                      onClick={() => navigate(`/book/${train.id}?date=${date}`)}
                      disabled={train.availableSeats === 0}
                      className="mt-2"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;