import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Train,
  Shield,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  Ticket,
  MapPin,
  ArrowRight,
  Calendar,
  IndianRupee,
} from "lucide-react";
import {
  getCurrentAdmin,
  getAllTrains,
  addTrain,
  updateTrain,
  deleteTrain,
  getAllTickets,
  getTicketByCode,
  getStations,
  getRoutesByTrain,
  addRoute,
  deleteRoute,
  getStationById,
  updateTicketPaymentStatus,
} from "@/lib/storage";
import StationManagement from "@/components/StationManagement";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trains, setTrains] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stations, setStations] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Date filtering states
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    pricePerKm: "",
    availableSeats: "",
  });

  const [routeStations, setRouteStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [distanceToNext, setDistanceToNext] = useState("");

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
      setFilteredTickets(allTickets);
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

  // Filter tickets based on date selection
  useEffect(() => {
    if (tickets.length === 0) return;

    let filtered = tickets;

    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = tickets.filter((ticket) =>
        ticket.travel_date && ticket.travel_date.startsWith(today)
      );
    } else if (dateFilter === "custom" && selectedDate) {
      filtered = tickets.filter((ticket) =>
        ticket.travel_date && ticket.travel_date.startsWith(selectedDate)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, dateFilter, selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("ticket_ride_current_admin");
    navigate("/admin");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      pricePerKm: "",
      availableSeats: "",
    });
    setRouteStations([]);
    setSelectedStation("");
    setDistanceToNext("");
    setEditingTrain(null);
  };

  const loadTrainRoutes = async (trainId) => {
    try {
      const routes = await getRoutesByTrain(trainId);
      const routeStationsData = await Promise.all(
        routes.map(async (route) => {
          const station = await getStationById(route.station_id);
          return {
            ...station,
            distanceToNext: route.distance_to_next,
            sequence: route.sequence,
          };
        })
      );

      const sortedStations = routeStationsData.sort((a, b) => a.sequence - b.sequence);
      setRouteStations(sortedStations);
    } catch (error) {
      console.error('Error loading train routes:', error);
      toast({
        title: 'Failed to load train routes',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || routeStations.length < 2) {
      toast({
        title: "Please fill train name and add at least 2 stations",
        variant: "destructive",
      });
      return;
    }

    try {
      const trainData = {
        ...formData,
        pricePerKm: parseFloat(formData.pricePerKm),
        availableSeats: parseInt(formData.availableSeats),
      };

      if (editingTrain) {
        await updateTrain(editingTrain.id, trainData);
        // Update routes
        const existingRoutes = await getRoutesByTrain(editingTrain.id);
        for (const route of existingRoutes) {
          await deleteRoute(route.id);
        }
        for (const [index, station] of routeStations.entries()) {
          await addRoute({
            trainId: editingTrain.id,
            stationId: station.id,
            sequence: index,
            distanceToNext: station.distanceToNext || 0,
          });
        }
        toast({ title: "Train updated successfully" });
      } else {
        const newTrain = await addTrain(trainData);
        // Add routes
        for (const [index, station] of routeStations.entries()) {
          await addRoute({
            trainId: newTrain.id,
            stationId: station.id,
            sequence: index,
            distanceToNext: station.distanceToNext || 0,
          });
        }
        toast({ title: "Train added successfully" });
      }

      // Reload data
      await loadData();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving train:', error);
      toast({
        title: 'Failed to save train',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (train) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      pricePerKm: train.price_per_km.toString(),
      availableSeats: train.available_seats.toString(),
    });
    await loadTrainRoutes(train.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this train?")) {
      try {
        await deleteTrain(id);
        toast({ title: "Train deleted" });
        await loadData();
      } catch (error) {
        console.error('Error deleting train:', error);
        toast({
          title: 'Failed to delete train',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

  const addStationToRoute = () => {
    const station = stations.find((s) => s.id === selectedStation);

    if (!station) {
      toast({
        title: "Station not found",
        variant: "destructive",
      });
      return;
    }

    // If there are existing stations, update the distance for the last station
    if (routeStations.length > 0) {
      const updatedStations = [...routeStations];
      const lastIndex = updatedStations.length - 1;
      updatedStations[lastIndex] = {
        ...updatedStations[lastIndex],
        distanceToNext: parseFloat(distanceToNext) || 0,
      };

      // Add new station with no distance (it's the last station)
      const newStation = {
        ...station,
        distanceToNext: 0, // Last station has no distance
      };

      setRouteStations([...updatedStations, newStation]);
    } else {
      // First station - no distance needed
      const newStation = {
        ...station,
        distanceToNext: 0,
      };
      setRouteStations([newStation]);
    }

    setSelectedStation("");
    setDistanceToNext("");
  };

  const removeStationFromRoute = (index) => {
    setRouteStations(routeStations.filter((_, i) => i !== index));
  };

  const updateDistance = (index, newDistance) => {
    const updatedStations = [...routeStations];
    updatedStations[index] = {
      ...updatedStations[index],
      distanceToNext: parseFloat(newDistance) || 0,
    };
    setRouteStations(updatedStations);
  };

  const handleVerify = async () => {
    try {
      const ticket = await getTicketByCode(searchCode);
      if (ticket) {
        setVerifiedTicket(ticket);
        toast({
          title: "Ticket Verified!",
          description: `Valid ticket for ${ticket.passenger_name}`,
        });
      } else {
        setVerifiedTicket(null);
        toast({
          title: "Invalid Ticket",
          description: "No ticket found with this code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying ticket:', error);
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePaymentStatus = async (ticketId, newStatus) => {
    try {
      await updateTicketPaymentStatus(ticketId, newStatus);
      toast({
        title: "Payment Status Updated",
        description: `Ticket status changed to ${newStatus}`,
      });
      
      // Refresh the tickets list
      await loadData();
      
      // Also update verified ticket if it's the same one
      if (verifiedTicket && verifiedTicket.id === ticketId) {
        setVerifiedTicket({
          ...verifiedTicket,
          payment_status: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Failed to update payment status",
        description: "Please try again",
        variant: "destructive",
      });
    }
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Train Management</h2>
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Train
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTrain ? "Edit Train" : "Add New Train"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTrain
                        ? "Update the train details and route below."
                        : "Fill in the details and define the route to add a new train to the system."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Train Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Express 101"
                        />
                      </div>
                      <div>
                        <Label>Price per Km (₹) *</Label>
                        <Input
                          type="number"
                          value={formData.pricePerKm}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerKm: e.target.value,
                            })
                          }
                          placeholder="2.5"
                          step="0.1"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Available Seats *</Label>
                        <Input
                          type="number"
                          value={formData.availableSeats}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              availableSeats: e.target.value,
                            })
                          }
                          placeholder="50"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Train Route
                      </h3>

                      <div className="space-y-4 mb-4">
                        {routeStations.map((station, index) => (
                          <div key={index}>
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {station.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({station.code})
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeStationFromRoute(index)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {index < routeStations.length - 1 && (
                              <div className="mt-2 ml-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Label
                                  htmlFor={`distance-${index}`}
                                  className="text-sm font-semibold text-blue-800 block mb-2"
                                >
                                  Distance from {station.name} to{" "}
                                  {routeStations[index + 1]?.name}:
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`distance-${index}`}
                                    type="number"
                                    placeholder="Enter distance in km"
                                    value={station.distanceToNext || ""}
                                    onChange={(e) =>
                                      updateDistance(index, e.target.value)
                                    }
                                    className="h-9 flex-1"
                                    min="1"
                                  />
                                  <span className="text-sm text-blue-700 font-medium whitespace-nowrap">
                                    kilometers
                                  </span>
                                </div>
                                {station.distanceToNext > 0 && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Current: {station.distanceToNext} km from{" "}
                                    {station.name} to{" "}
                                    {routeStations[index + 1]?.name}
                                  </p>
                                )}
                              </div>
                            )}

                            {index < routeStations.length - 1 && (
                              <div className="flex justify-center mt-2">
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-sm">Select Station</Label>
                          <Select
                            value={selectedStation}
                            onValueChange={setSelectedStation}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  stations.filter(
                                    (station) =>
                                      !routeStations.some(
                                        (rs) => rs.id === station.id
                                      )
                                  ).length === 0
                                    ? "All stations added"
                                    : "Choose station"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {stations
                                .filter((station) => {
                                  return !routeStations.some(
                                    (routeStation) =>
                                      routeStation.id === station.id
                                  );
                                })
                                .map((station) => (
                                  <SelectItem
                                    key={station.id}
                                    value={station.id}
                                  >
                                    {station.name} ({station.code})
                                  </SelectItem>
                                ))}
                              {stations.filter(
                                (station) =>
                                  !routeStations.some(
                                    (rs) => rs.id === station.id
                                  )
                              ).length === 0 && (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  All available stations have been added to the
                                  route
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stations.length - routeStations.length} stations
                            available
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm">
                            {routeStations.length === 0
                              ? "Starting Station (No distance needed)"
                              : `Distance from ${
                                  routeStations[routeStations.length - 1]?.name
                                } to new station`}
                          </Label>
                          <div className="flex gap-2">
                            {routeStations.length > 0 && (
                              <Input
                                type="number"
                                placeholder="Enter distance in km"
                                value={distanceToNext}
                                onChange={(e) =>
                                  setDistanceToNext(e.target.value)
                                }
                                className="flex-1"
                                min="1"
                              />
                            )}
                            <Button
                              onClick={addStationToRoute}
                              disabled={
                                !selectedStation ||
                                (routeStations.length > 0 && !distanceToNext)
                              }
                              className="whitespace-nowrap"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {routeStations.length === 0
                                ? "Add First Station"
                                : "Add Next Station"}
                            </Button>
                          </div>
                          {routeStations.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter distance from{" "}
                              {routeStations[routeStations.length - 1]?.name} to
                              the new station
                            </p>
                          )}
                        </div>
                      </div>

                      {routeStations.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-green-800 mb-2">
                            Route Summary
                          </h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>
                              <strong>Total Stations:</strong>{" "}
                              {routeStations.length}
                            </p>
                            <p>
                              <strong>Total Distance:</strong>{" "}
                              {routeStations.reduce((total, station, index) => {
                                if (index < routeStations.length - 1) {
                                  return total + (station.distanceToNext || 0);
                                }
                                return total;
                              }, 0)}{" "}
                              km
                            </p>
                            <p>
                              <strong>Route:</strong>
                            </p>
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center flex-wrap gap-2">
                                {routeStations.map((station, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="font-medium">
                                      {station.name}
                                    </span>
                                    {index < routeStations.length - 1 && (
                                      <>
                                        <ArrowRight className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                          {station.distanceToNext || 0} km
                                        </span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={routeStations.length < 2}
                    >
                      {editingTrain ? "Update Train" : "Add Train"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {trains.map((train) => (
                <Card key={train.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary">
                        {train.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{train.price_per_km}/km • {train.available_seats} seats available
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(train)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(train.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                All Bookings ({filteredTickets.length})
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="date-filter"
                    className="text-sm whitespace-nowrap"
                  >
                    Filter by Date:
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="custom-date"
                      className="text-sm whitespace-nowrap"
                    >
                      Select Date:
                    </Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredTickets.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Bookings
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    filteredTickets.filter((t) => t.payment_status === "paid")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    filteredTickets.filter((t) => t.payment_status === "pending")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₹
                  {filteredTickets.reduce(
                    (total, ticket) => total + (ticket.price || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Revenue
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <Card className="p-12 text-center">
                  <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">
                    No bookings found
                  </h3>
                  <p className="text-muted-foreground">
                    {dateFilter === "all"
                      ? "There are no bookings in the system yet."
                      : `No bookings found for the selected date filter.`}
                  </p>
                </Card>
              ) : (
                filteredTickets
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-primary">
                              {ticket.train_name}
                            </h3>
                            <Badge
                              variant={
                                ticket.payment_status === "paid"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {ticket.payment_status === "paid"
                                ? "Paid"
                                : "Pending Payment"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {new Date(ticket.travel_date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {ticket.origin_name} → {ticket.destination_name}
                          </p>
                          <p className="text-sm">
                            Passenger: {ticket.passenger_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Booking Date:{" "}
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                          {ticket.distance && (
                            <p className="text-sm text-muted-foreground">
                              Distance: {ticket.distance} km • Amount: ₹
                              {ticket.price}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Booking Code
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {ticket.booking_code}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Booked:{" "}
                            {new Date(ticket.created_at).toLocaleString()}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {ticket.payment_method === "cash"
                                ? "Cash on Board"
                                : "Online Payment"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Verify Ticket</h2>

              <div className="space-y-4">
                <div>
                  <Label>Enter Booking Code or Scan QR</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter booking code"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                    />
                    <Button onClick={handleVerify}>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>

                {verifiedTicket && (
                  <Card className="p-6 bg-primary/5 border-primary">
                    <div className="flex items-start gap-3 mb-4">
                      <Ticket className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary">
                          {verifiedTicket.train_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {verifiedTicket.origin_name} → {verifiedTicket.destination_name}
                        </p>
                      </div>
                      <Badge className="bg-green-500">Valid</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Passenger
                        </p>
                        <p className="font-semibold">
                          {verifiedTicket.passenger_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Travel Date
                        </p>
                        <p className="font-semibold">
                          {new Date(
                            verifiedTicket.travel_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payment Status
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              verifiedTicket.payment_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {verifiedTicket.payment_status === "paid"
                              ? "Paid"
                              : "Cash on Boarding"}
                          </Badge>
                          {verifiedTicket.payment_status !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePaymentStatus(verifiedTicket.id, "paid")}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;