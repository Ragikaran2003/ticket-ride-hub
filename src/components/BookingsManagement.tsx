import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket, Calendar } from "lucide-react";

const BookingsManagement = ({ tickets }) => {
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);

  // Helper function to normalize dates (fix timezone issue)
  const normalizeDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Create date object and get local date parts
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null; // Check if valid date
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  };

  useEffect(() => {
    if (tickets.length === 0) {
      setFilteredTickets([]);
      return;
    }

    let filtered = tickets;

    if (dateFilter === "today") {
      const today = normalizeDate(new Date());
      filtered = tickets.filter((ticket) => {
        const ticketDate = normalizeDate(ticket.travel_date);
        return ticketDate === today;
      });
    } else if (dateFilter === "custom" && selectedDate) {
      filtered = tickets.filter((ticket) => {
        const ticketDate = normalizeDate(ticket.travel_date);
        return ticketDate === selectedDate;
      });
    }

    setFilteredTickets(filtered);
  }, [tickets, dateFilter, selectedDate]);

  // Reset selected date when filter changes
  useEffect(() => {
    if (dateFilter !== "custom") {
      setSelectedDate("");
    }
  }, [dateFilter]);

  // Format date for display - safe version
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return "Invalid Date";
    }
  };

  // Simple date format for badge (shorter version)
  const formatBadgeDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-US', {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          All Bookings ({filteredTickets.length})
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="date-filter" className="text-sm whitespace-nowrap">
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

      {/* Show which date is being filtered */}
      {dateFilter === "custom" && selectedDate && (
        <Card className="p-3 mb-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Calendar className="h-4 w-4" />
            <span>
              Showing bookings for: <strong>{formatDisplayDate(selectedDate + 'T00:00:00')}</strong>
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {filteredTickets.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Bookings</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredTickets.filter((t) => t.payment_status === "paid").length}
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
            Rs.
            {filteredTickets
              .reduce(
                (total, ticket) => total + parseFloat(ticket.price || 0),
                0
              )
              .toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {dateFilter === "all"
                ? "There are no bookings in the system yet."
                : dateFilter === "today"
                ? "No bookings found for today."
                : `No bookings found for ${formatDisplayDate(selectedDate + 'T00:00:00')}.`}
            </p>
          </Card>
        ) : (
          filteredTickets
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
                        {formatBadgeDate(ticket.travel_date)}
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
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                    </p>
                    {ticket.distance && (
                      <p className="text-sm text-muted-foreground">
                        Distance: {ticket.distance} km • Amount: ₹{Math.round(parseFloat(ticket.price || 0))}
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
                      Booked: {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "N/A"}
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
    </>
  );
};

export default BookingsManagement;