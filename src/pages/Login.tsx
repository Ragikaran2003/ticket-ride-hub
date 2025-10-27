import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, User, Mail, Lock } from 'lucide-react';
import { registerUser, loginUser, setCurrentUser } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  const handleLogin = () => {
    const user = loginUser(loginData.email, loginData.password);
    if (user) {
      setCurrentUser(user);
      toast({
        title: 'Welcome back!',
        description: `Hello, ${user.name}`,
      });
      navigate('/');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast({
        title: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    const user = registerUser(registerData.name, registerData.email, registerData.password);
    setCurrentUser(user);
    toast({
      title: 'Account created!',
      description: `Welcome to Ticket Ride Hub, ${user.name}`,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Train className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Ticket Ride Hub</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleLogin}>
              Sign In
            </Button>

            <div className="text-center">
              <Button variant="link" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div>
              <Label htmlFor="register-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-name"
                  placeholder="John Doe"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleRegister}>
              Create Account
            </Button>

            <div className="text-center">
              <Button variant="link" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;