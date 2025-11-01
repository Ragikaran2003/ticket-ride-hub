import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Trash2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  getRoutesByTrain,
  getStationById,
  addTrain,
  updateTrain,
  addRoute,
  deleteRoute,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const TrainDialog = ({ 
  open, 
  onOpenChange, 
  editingTrain, 
  stations, 
  onTrainSaved,
  onClose,
  children 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    pricePerKm: "",
    availableSeats: "",
  });
  const [routeStations, setRouteStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [distanceToNext, setDistanceToNext] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && editingTrain) {
      setFormData({
        name: editingTrain.name,
        pricePerKm: editingTrain.price_per_km.toString(),
        availableSeats: editingTrain.available_seats.toString(),
      });
      loadTrainRoutes(editingTrain.id);
    } else if (open) {
      resetForm();
    }
  }, [open, editingTrain]);

  const resetForm = () => {
    setFormData({
      name: "",
      pricePerKm: "",
      availableSeats: "",
    });
    setRouteStations([]);
    setSelectedStation("");
    setDistanceToNext("");
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
  console.log('🚀 Submitting train data...');
  
  // Validation
  if (!formData.name.trim()) {
    toast({
      title: "Train name is required",
      variant: "destructive",
    });
    return;
  }

  if (!formData.pricePerKm || parseFloat(formData.pricePerKm) <= 0) {
    toast({
      title: "Valid price per km is required",
      variant: "destructive",
    });
    return;
  }

  if (!formData.availableSeats || parseInt(formData.availableSeats) <= 0) {
    toast({
      title: "Valid seat count is required",
      variant: "destructive",
    });
    return;
  }

  if (routeStations.length < 2) {
    toast({
      title: "Please add at least 2 stations to the route",
      variant: "destructive",
    });
    return;
  }

  try {
    setIsLoading(true);
    console.log('📝 Form data:', formData);
    console.log('📍 Route stations:', routeStations);

    const trainData = {
      name: formData.name.trim(),
      pricePerKm: parseFloat(formData.pricePerKm),
      availableSeats: parseInt(formData.availableSeats),
    };

    console.log('🚂 Train data to save:', trainData);

    let trainId;

    if (editingTrain) {
      console.log('✏️ Updating train:', editingTrain.id);
      await updateTrain(editingTrain.id, trainData);
      trainId = editingTrain.id;
      
      console.log('✅ Train updated');
      
      // Update routes
      console.log('🔄 Updating routes...');
      const existingRoutes = await getRoutesByTrain(editingTrain.id);
      console.log('🗑️ Deleting existing routes:', existingRoutes);
      
      for (const route of existingRoutes) {
        await deleteRoute(route.id);
      }
      console.log('✅ Existing routes deleted');
      
    } else {
      console.log('🆕 Creating new train...');
      const newTrain = await addTrain(trainData);
      console.log('✅ New train response:', newTrain);
      
      // Check if newTrain is defined and has an id
      if (!newTrain) {
        throw new Error('Failed to create train: No train ID returned from server');
      }
      
      trainId = newTrain.id;
      console.log('✅ New train created with ID:', trainId);
    }

    // Add routes
    console.log('➕ Adding routes...');
    for (const [index, station] of routeStations.entries()) {
      const routeData = {
        trainId: trainId,
        stationId: station.id,
        
        distanceToNext: station.distanceToNext || 0,
      };
      console.log(`📍 Adding route ${index + 1}:`, routeData);
      await addRoute(routeData);
    }
    console.log('✅ Routes added');

    toast({ 
      title: editingTrain ? "Train updated successfully" : "Train added successfully",
      description: `${routeStations.length} stations in route.`
    });

    console.log('✅ Train saved successfully');
    onTrainSaved();
    
  } catch (error) {
    console.error('❌ Error saving train:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    toast({
      title: 'Failed to save train',
      description: error.message || 'Please check your input and try again',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetForm();
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>
        {children}
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
                        return total + (parseInt(station.distanceToNext) || 0);
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
            disabled={routeStations.length < 2 || isLoading}
          >
            {isLoading ? "Saving..." : editingTrain ? "Update Train" : "Add Train"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainDialog;