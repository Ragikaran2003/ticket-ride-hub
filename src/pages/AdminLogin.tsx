import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { loginAdmin } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: 'admin@ticketride.com',
    password: 'admin123'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLogin = async () => {
    console.log('🔄 Login function called with:', formData);
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📤 Calling loginAdmin service...');
      
      const admin = await loginAdmin(formData.email, formData.password);
      
      console.log('✅ Login successful, admin data:', admin);

      toast({
        title: 'Admin Access Granted',
        description: `Welcome, ${admin.name}`,
      });

      // Wait a moment before navigation for better UX
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid admin credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      toast({
        title: 'Access Denied',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const testConnection = async () => {
    try {
      console.log('🔌 Testing backend connection...');
      const response = await api.get('/health');
      console.log('✅ Backend health check:', response.data);
      
      toast({
        title: 'Backend Connected ✅',
        description: `Server: ${response.data.message}`,
      });
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error);
      
      let errorMessage = 'Cannot connect to backend server';
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Check if backend is running on localhost:5000';
      } else if (error.response?.status === 404) {
        errorMessage = 'Backend endpoint not found';
      }
      
      toast({
        title: 'Backend Connection Failed ❌',
        description: errorMessage,
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
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </>
            ) : (
              'Access Admin Panel'
            )}
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate('/')}
              type="button"
              disabled={isLoading}
            >
              Back to Home
            </Button>

            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={testConnection}
              type="button"
              disabled={isLoading}
            >
              Test Connection
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@ticketride.com<br />
              Password: admin123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;