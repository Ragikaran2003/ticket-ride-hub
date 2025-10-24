import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Train, Calendar, MapPin } from 'lucide-react';
import { initializeData } from '@/lib/storage';

const Home = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  const handleSearch = () => {
    if (origin && destination && date) {
      navigate(`/search?origin=${origin}&destination=${destination}&date=${date}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ticket Ride Hub</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Sign Up</Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>Admin</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Journey Starts Here
          </h2>
          <p className="text-xl text-muted-foreground">
            Book train tickets easily and travel with confidence
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto p-8 shadow-lg">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="origin" className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                From
              </Label>
              <Input
                id="origin"
                placeholder="Origin city"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="destination" className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-accent" />
                To
              </Label>
              <Input
                id="destination"
                placeholder="Destination city"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleSearch}
            disabled={!origin || !destination || !date}
          >
            Search Trains
          </Button>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Train className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Easy Booking</h3>
            <p className="text-sm text-muted-foreground">
              Search and book your train tickets in just a few clicks
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Instant Tickets</h3>
            <p className="text-sm text-muted-foreground">
              Get your ticket PDF with QR code immediately after booking
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Wide Network</h3>
            <p className="text-sm text-muted-foreground">
              Travel across multiple cities with our extensive railway network
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;
