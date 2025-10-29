import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { getStations, addStation, updateStation, deleteStation } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const StationManagement = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading stations...');
      const stationsData = await getStations();
      console.log('✅ Stations loaded:', stationsData);
      
      // Ensure stations is always an array
      if (Array.isArray(stationsData)) {
        setStations(stationsData);
      } else {
        console.error('❌ Stations data is not an array:', stationsData);
        setStations([]);
      }
    } catch (error) {
      console.error('❌ Error loading stations:', error);
      toast({
        title: 'Failed to load stations',
        description: 'Please try again later',
        variant: 'destructive',
      });
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '' });
    setEditingStation(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingStation) {
        await updateStation(editingStation.id, formData);
        toast({ title: 'Station updated successfully' });
      } else {
        await addStation(formData);
        toast({ title: 'Station added successfully' });
      }

      await loadStations(); // Reload stations
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving station:', error);
      toast({
        title: 'Failed to save station',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this station?')) {
      try {
        await deleteStation(id);
        toast({ title: 'Station deleted' });
        await loadStations(); // Reload stations
      } catch (error) {
        console.error('Error deleting station:', error);
        toast({
          title: 'Failed to delete station',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading stations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Manage Stations</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { 
          setIsDialogOpen(open); 
          if (!open) resetForm(); 
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Station
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStation ? 'Edit Station' : 'Add New Station'}</DialogTitle>
              <DialogDescription>
                {editingStation ? 'Update station details' : 'Add a new station to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Station Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Mumbai Central"
                />
              </div>
              <div>
                <Label>Station Code</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="MMCT"
                  maxLength={5}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingStation ? 'Update Station' : 'Add Station'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!Array.isArray(stations) || stations.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No Stations Found</h4>
          <p className="text-muted-foreground mb-4">
            {!Array.isArray(stations) 
              ? 'There was an error loading stations' 
              : 'Get started by adding your first station'}
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Station
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stations.map((station) => (
            <Card key={station.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{station.name}</h4>
                    <p className="text-sm text-muted-foreground">Code: {station.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(station)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(station.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StationManagement;