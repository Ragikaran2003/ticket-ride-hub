import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Ticket } from "lucide-react";
import { getTicketByCode, updateTicketPaymentStatus } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const TicketVerification = ({ onDataUpdate }) => {
  const { toast } = useToast();
  const [searchCode, setSearchCode] = useState("");
  const [verifiedTicket, setVerifiedTicket] = useState(null);

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
      onDataUpdate();
      
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
        variant: 'destructive',
      });
    }
  };

  return (
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
  );
};

export default TicketVerification;