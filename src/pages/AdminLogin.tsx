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
  const [email, setEmail] = useState('admin@ticketride.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log('🔄 Login function called');
    
    if (!email || !password) {
      toast({
        title: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📤 Calling loginAdmin API...');
      
      // Direct API call for testing
      const response = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }

      const result = await response.json();
      console.log('✅ Login successful:', result);

      // Store admin data manually
      localStorage.setItem('admin', JSON.stringify(result.admin));
      localStorage.setItem('adminToken', result.token);
      
      toast({
        title: 'Admin Access Granted',
        description: `Welcome, ${result.admin.name}`,
      });

      console.log('🔄 Navigating to dashboard...');
      // Force navigation
      window.location.href = '/admin/dashboard';
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      toast({
        title: 'Access Denied',
        description: error.message || 'Invalid admin credentials',
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

  // Test backend connection
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      console.log('Backend health check:', data);
      toast({
        title: 'Backend Connected',
        description: 'Backend server is running',
      });
    } catch (error) {
      console.error('Backend connection failed:', error);
      toast({
        title: 'Backend Connection Failed',
        description: 'Make sure backend server is running on port 5000',
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
              onKeyPress={handleKeyPress}
              className="mt-1"
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
              onKeyPress={handleKeyPress}
              className="mt-1"
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
            type="button" // Important: type="button"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Logging In...
              </>
            ) : (
              'Access Admin Panel'
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
            type="button"
          >
            Back to Home
          </Button>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={testConnection}
            type="button"
          >
            Test Backend Connection
          </Button>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Demo: admin@ticketride.com / admin123
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Backend: http://localhost:5000
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;