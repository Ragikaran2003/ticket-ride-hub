import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, Train, MapPin, Search, Clock, Shield, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getStations } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

// Custom Select with Search Component
const StationSelect = ({ value, onValueChange, placeholder, stations }) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    station.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedStation = stations.find(station => station.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedStation ? (
            <span>{selectedStation.name} ({selectedStation.code})</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search station..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredStations.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No station found.
            </div>
          ) : (
            filteredStations.map((station) => (
              <button
                key={station.id}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                  value === station.id && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onValueChange(station.id);
                  setOpen(false);
                  setSearchValue('');
                }}
              >
                <div className="flex flex-col items-start">
                  <span>{station.name}</span>
                  <span className="text-xs text-muted-foreground">{station.code}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const stationsData = await getStations();
      setStations(stationsData);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast({
        title: 'Failed to load stations',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    if (!origin || !destination) {
      toast({
        title: 'Please select origin and destination stations',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Please select travel date',
        variant: 'destructive',
      });
      return;
    }

    if (origin === destination) {
      toast({
        title: 'Origin and destination cannot be the same',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const originStation = stations.find(s => s.id === origin);
      const destinationStation = stations.find(s => s.id === destination);
      
      navigate(`/search?origin=${encodeURIComponent(originStation.name)}&destination=${encodeURIComponent(destinationStation.name)}&date=${format(date, 'yyyy-MM-dd')}&from=${origin}&to=${destination}`);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Ticket className="h-8 w-8" />,
      title: 'Easy Booking',
      description: 'Book your train tickets in just a few clicks'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Real-time Status',
      description: 'Get live train status and seat availability'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Payment',
      description: 'Multiple secure payment options available'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Train className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold text-primary">Ticket Ride Hub</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your journey begins here. Book train tickets effortlessly and travel with confidence across India.
            </p>
          </div>

          {/* Search Card */}
          <Card className="p-8 max-w-4xl mx-auto shadow-lg border-primary/20">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <StationSelect
                  value={origin}
                  onValueChange={setOrigin}
                  placeholder="Select origin"
                  stations={stations}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <StationSelect
                  value={destination}
                  onValueChange={setDestination}
                  placeholder="Select destination"
                  stations={stations}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="invisible">Search</Label>
                <Button 
                  className="w-full" 
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Trains
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">Why Choose Ticket Ride Hub?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center border-primary/10 hover:border-primary/30 transition-all">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Travelers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Train Routes</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;