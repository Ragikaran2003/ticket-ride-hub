import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut } from "lucide-react";
import { getCurrentAdmin, getAllTrains, getAllTickets, getStations } from "@/lib/storage";
import StationManagement from "@/components/StationManagement";
import TrainManagement from "@/components/TrainManagement";
import BookingsManagement from "@/components/BookingsManagement";
import TicketVerification from "@/components/TicketVerification";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trains, setTrains] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const admin = getCurrentAdmin();
    console.log("Current admin:", admin);
    
    if (!admin) {
      console.log("No admin found, redirecting to login");
      navigate("/admin");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading admin dashboard data...");
      
      const [allStations, allTrains, allTickets] = await Promise.all([
        getStations(),
        getAllTrains(),
        getAllTickets()
      ]);

      console.log("Data loaded:", {
        stations: allStations.length,
        trains: allTrains.length,
        tickets: allTickets.length
      });

      setStations(allStations);
      setTrains(allTrains);
      setTickets(allTickets);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Failed to load data',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("ticket_ride_current_admin");
    navigate("/admin");
  };

  const admin = getCurrentAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No admin session found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {admin.name}</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stations" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="trains">Manage Trains</TabsTrigger>
            <TabsTrigger value="bookings">View Bookings</TabsTrigger>
            <TabsTrigger value="verify">Verify Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="mt-6">
            <StationManagement />
          </TabsContent>

          <TabsContent value="trains" className="mt-6">
            <TrainManagement 
              trains={trains}
              stations={stations}
              onDataUpdate={loadData}
            />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsManagement 
              tickets={tickets}
            />
          </TabsContent>

          <TabsContent value="verify" className="mt-6">
            <TicketVerification 
              onDataUpdate={loadData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;