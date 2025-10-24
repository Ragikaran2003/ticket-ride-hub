import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Train } from 'lucide-react';
import { loginAdmin, setCurrentAdmin } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const admin = loginAdmin(email, password);
    if (admin) {
      setCurrentAdmin(admin);
      toast({
        title: 'Admin Access Granted',
        description: `Welcome, ${admin.name}`,
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid admin credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Admin Login</h1>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleLogin}>
            Access Admin Panel
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Demo: admin@ticketride.com / admin123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
