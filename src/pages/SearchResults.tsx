import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Train,
  Clock,
  MapPin,
  ArrowRight,
  IndianRupee,
  Navigation,
  Users,
  Hourglass,
} from "lucide-react";
import { searchTrains, getStations } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { formatTime,  calculateTrainTimesWithActualData , STATION_WAITING_TIME  } from "@/utils/timeCalculations";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const fromStationId = searchParams.get("from") || "";
  const toStationId = searchParams.get("to") || "";

  useEffect(() => {
    loadSearchResults();
  }, [fromStationId, toStationId, date]);

  const loadSearchResults = async () => {
    try {
      setIsLoading(true);
      const [trainsData, stationsData] = await Promise.all([
        searchTrains(fromStationId, toStationId, date),
        getStations(),
      ]);

      console.log("🚆 Trains found with complete route:", trainsData);

      // Calculate times in frontend using actual route data
      const trainsWithCalculatedTimes = trainsData.map((train) => {
        // Calculate times using actual route data
        const { departureTime, arrivalTime, travelDuration, travelTime } = calculateTrainTimesWithActualData(train);

        console.log(`⏰ ${train.name} calculated times:`, {
          departure: departureTime,
          arrival: arrivalTime,
          duration: travelDuration.display
        });

        return {
          ...train,
          distance: train.distance,
          calculatedPrice: train.price,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          travelDuration: travelDuration,
          travelTime: travelTime,
        };
      });

      console.log("✅ Trains with calculated times:", trainsWithCalculatedTimes);
      setTrains(trainsWithCalculatedTimes);
      setStations(stationsData);
    } catch (error) {
      console.error("❌ Search error:", error);
      toast({
        title: "Failed to load trains",
        description: "Please try again",
        variant: "destructive",
      });
      setTrains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (train) => {
    console.log("🎫 Book Now clicked for train:", train);

    // Navigate to booking page with train data
    navigate(`/book/${train.id}`, {
      state: {
        trainData: {
          ...train,
          travelDate: date,
          fromStationId: fromStationId,
          toStationId: toStationId,
          origin: origin,
          destination: destination,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
        },
        searchParams: {
          date: date,
          from: fromStationId,
          to: toStationId,
          origin: origin,
          destination: destination,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ticket Ride Hub</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
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
                <div>
                  <span className="font-semibold block">{origin}</span>
                  <span className="text-sm text-muted-foreground">
                    Departure
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <div>
                  <span className="font-semibold block">{destination}</span>
                  <span className="text-sm text-muted-foreground">Arrival</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-base mb-2">
                {date
                  ? new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "No date selected"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {trains.length} train{trains.length !== 1 ? "s" : ""} found
              </p>
            </div>
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
            <Button onClick={() => navigate("/")}>Back to Search</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              Available Trains ({trains.length})
            </h2>
            {trains.map((train) => {
              const originStation = stations.find(
                (s) => s.id === fromStationId
              );
              const destinationStation = stations.find(
                (s) => s.id === toStationId
              );

              return (
                <Card
                  key={train.id}
                  className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                >
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    {/* Train Info */}
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Train className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-primary">
                            {train.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{train.available_seats} seats</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="h-4 w-4" />
                              <span>{train.distance} km</span>
                            </div>
                            {train.travelTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{train.travelTime}</span>
                              </div>
                            )}
                            {/* Waiting Time Display */}
                            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              <Hourglass className="h-3 w-3" />
                              <span className="text-xs font-medium">{STATION_WAITING_TIME}m stops</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <p className="text-lg font-bold text-green-700">
                            {formatTime(train.departureTime)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {originStation?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Departure
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <ArrowRight className="h-5 w-5 text-primary mb-1" />
                        <div className="bg-primary/10 px-2 py-1 rounded-full">
                          <span className="text-xs font-medium text-primary">
                            {train.travelTime || "--:--"}
                          </span>
                        </div>
                        {/* Waiting Time Info */}
                        <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          <Hourglass className="h-3 w-3 inline mr-1" />
                          {STATION_WAITING_TIME}m stops included
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-red-600" />
                          <p className="text-lg font-bold text-red-700">
                            {formatTime(train.arrivalTime)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {destinationStation?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Arrival</p>
                      </div>
                    </div>

                    {/* Price and Booking */}
                    <div className="text-right min-w-[150px]">
                      <div className="flex items-center justify-end gap-1 mb-2">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                        <p className="text-2xl font-bold text-green-700">
                          {train.calculatedPrice}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        ₹{train.price_per_km}/km
                      </p>
                      <Button
                        onClick={() => handleBookNow(train)}
                        disabled={train.available_seats === 0}
                        className="w-full"
                        size="lg"
                      >
                        {train.available_seats === 0 ? "Sold Out" : "Book Now"}
                      </Button>
                      {train.available_seats > 0 &&
                        train.available_seats < 10 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Only {train.available_seats} left!
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Additional Travel Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Travel Time: {train.travelDuration?.display || train.travelTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hourglass className="h-4 w-4 text-orange-500" />
                        <span>Waiting Time: {STATION_WAITING_TIME} minutes at each station</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4" />
                        <span>Distance: {train.distance} km</span>
                      </div>
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