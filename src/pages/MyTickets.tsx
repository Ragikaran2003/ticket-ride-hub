import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Train,
  Calendar,
  MapPin,
  Clock,
  Download,
  Ticket,
  Navigation,
  Search,
  Filter,
  X
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { getUserTickets, getCurrentUser } from '@/lib/storage';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const MyTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // 🔥 Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    console.log('🔍 useEffect triggered - user:', user, 'hasLoaded:', hasLoaded);
    
    if (!user) {
      console.log('❌ No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (!hasLoaded) {
      loadTickets();
    }
  }, [user, hasLoaded, navigate]);

  // 🔥 Filter tickets when search or filters change
  useEffect(() => {
    if (tickets.length > 0) {
      applyFilters();
    }
  }, [searchTerm, statusFilter, dateFilter, tickets]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading user tickets...');
      const ticketsData = await getUserTickets();
      console.log('✅ Tickets loaded:', ticketsData);
      
      if (Array.isArray(ticketsData)) {
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
      } else {
        console.error('❌ Tickets data is not an array:', ticketsData);
        setTickets([]);
        setFilteredTickets([]);
      }
      
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Failed to load tickets',
        description: 'Please try again',
        variant: 'destructive',
      });
      setTickets([]);
      setFilteredTickets([]);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 FIXED: Apply search and filters with proper date comparison
  const applyFilters = () => {
    let filtered = [...tickets];

    // Search by train name, booking code, or passenger name
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.train_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => {
        const travelDate = parseISO(ticket.travel_date);
        const today = new Date();
        
        if (statusFilter === 'completed') {
          return travelDate < today;
        } else if (statusFilter === 'upcoming') {
          return travelDate >= today;
        } else if (statusFilter === 'paid') {
          return ticket.payment_status === 'paid';
        } else if (statusFilter === 'pending') {
          return ticket.payment_status === 'pending';
        }
        return true;
      });
    }

    // 🔥 FIXED: Date filter with proper date comparison
    if (dateFilter) {
      filtered = filtered.filter(ticket => {
        try {
          const ticketDate = parseISO(ticket.travel_date);
          return isSameDay(ticketDate, dateFilter);
        } catch (error) {
          console.error('Error parsing ticket date:', ticket.travel_date, error);
          return false;
        }
      });
    }

    setFilteredTickets(filtered);
  };

  // 🔥 Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter(null);
    setShowFilters(false);
  };

  // 🔥 Format date for display
  const formatTicketDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const handleDownload = async (ticket) => {
    setDownloading(ticket.id);
    try {
      console.log('📥 Downloading ticket:', ticket);
      
      const pdfTicketData = {
        ...ticket,
        train_name: ticket.train_name || 'Train',
        origin_name: ticket.origin_name || ticket.origin,
        destination_name: ticket.destination_name || ticket.destination,
        passenger_name: ticket.passenger_name || 'Passenger',
        travel_date: ticket.travel_date,
        price: ticket.price,
        distance: ticket.distance || 0,
        booking_code: ticket.booking_code,
        departure_time: ticket.departure_time || '08:00 AM',
        arrival_time: ticket.arrival_time || '04:00 PM',
        payment_method: ticket.payment_method || 'cash',
        payment_status: ticket.payment_status || 'pending'
      };
      
      await generateTicketPDF(pdfTicketData);
      
      toast({
        title: '✅ Ticket Downloaded!',
        description: 'Your ticket PDF has been saved',
      });
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (ticket) => {
    try {
      const travelDate = parseISO(ticket.travel_date);
      if (travelDate < new Date()) {
        return 'completed';
      }
      return ticket.payment_status === 'paid' ? 'confirmed' : 'pending';
    } catch (error) {
      console.error('Error determining status:', error);
      return 'pending';
    }
  };

  const getStatusText = (ticket) => {
    try {
      const travelDate = parseISO(ticket.travel_date);
      if (travelDate < new Date()) {
        return 'Journey Completed';
      }
      return ticket.payment_status === 'paid' ? 'Confirmed' : 'Pending Payment';
    } catch (error) {
      console.error('Error getting status text:', error);
      return 'Pending Payment';
    }
  };

  // 🔥 Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Tickets</h1>
            <p className="text-muted-foreground mt-2">
              Manage your upcoming and past journeys
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTickets}>
              Refresh
            </Button>
            <Button onClick={() => navigate('/')}>
              <Ticket className="h-4 w-4 mr-2" />
              Book New Ticket
            </Button>
          </div>
        </div>

        {/* 🔥 SEARCH AND FILTERS SECTION */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <Label htmlFor="search" className="sr-only">Search tickets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by train name, booking code, or passenger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                Clear All
              </Button>
            )}
          </div>

          {/* 🔥 EXPANDED FILTERS */}
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming Journeys</SelectItem>
                    <SelectItem value="completed">Completed Journeys</SelectItem>
                    <SelectItem value="paid">Paid Tickets</SelectItem>
                    <SelectItem value="pending">Pending Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 🔥 FIXED: Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="date-filter">Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateFilter(null)}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Clear date
                  </Button>
                )}
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* TICKETS LIST */}
        {!Array.isArray(tickets) || tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't booked any train tickets yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Book Your First Ticket
            </Button>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tickets found</h3>
            <p className="text-muted-foreground mb-6">
              No tickets match your search criteria.
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-primary">{ticket.train_name}</h3>
                      <Badge variant={
                        getStatusColor(ticket) === 'confirmed' ? 'default' :
                        getStatusColor(ticket) === 'pending' ? 'secondary' : 'outline'
                      }>
                        {getStatusText(ticket)}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.origin_name}</p>
                          <p className="text-xs text-muted-foreground">Departure</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.destination_name}</p>
                          <p className="text-xs text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatTicketDate(ticket.travel_date)}
                          </p>
                          <p className="text-xs text-muted-foreground">Travel Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.departure_time || '08:00 AM'}</p>
                          <p className="text-xs text-muted-foreground">Departure Time</p>
                        </div>
                      </div>
                    </div>
                    
                    {ticket.distance && (
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Distance: {ticket.distance} km • Fare: ₹{ticket.price}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Passenger:</span>
                        <span className="font-medium ml-2">{ticket.passenger_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Booking Code:</span>
                        <span className="font-medium ml-2">{ticket.booking_code}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium ml-2">₹{ticket.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(ticket)}
                      disabled={downloading === ticket.id}
                    >
                      {downloading === ticket.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;