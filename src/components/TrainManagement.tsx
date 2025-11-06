import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Clock, Gauge } from "lucide-react";
import { deleteTrain } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import TrainDialog from "./TrainDialog";

const TrainManagement = ({ trains, stations, onDataUpdate }) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);

  const handleEdit = (train) => {
    setEditingTrain(train);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this train?")) {
      try {
        await deleteTrain(id);
        toast({ title: "Train deleted" });
        onDataUpdate();
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

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingTrain(null);
  };

  const handleTrainSaved = () => {
    onDataUpdate();
    handleDialogClose();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Train Management</h2>
        <TrainDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editingTrain={editingTrain}
          stations={stations}
          onTrainSaved={handleTrainSaved}
          onClose={handleDialogClose}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Train
          </Button>
        </TrainDialog>
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
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {train.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Starts: {train.startTime}</span>
                    </div>
                  )}
                  {train.speed && (
                    <div className="flex items-center gap-1">
                      <Gauge className="h-4 w-4" />
                      <span>Speed: {train.speed} km/h</span>
                    </div>
                  )}
                </div>
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
    </>
  );
};

export default TrainManagement;