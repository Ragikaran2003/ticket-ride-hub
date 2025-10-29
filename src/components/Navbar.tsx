import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Train, Menu, User, Ticket, LogOut, Shield } from 'lucide-react';
import { getCurrentUser, setCurrentUser, getCurrentAdmin, setCurrentAdmin } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const user = getCurrentUser();
  const admin = getCurrentAdmin();

  const handleLogout = () => {
    if (user) {
      setCurrentUser(null);
      toast({
        title: 'Logged out successfully',
        description: 'Hope to see you again soon!',
      });
    }
    if (admin) {
      setCurrentAdmin(null);
      toast({
        title: 'Admin session ended',
      });
    }
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Train },
    ...(user ? [{ path: '/my-tickets', label: 'My Tickets', icon: Ticket }] : []),
  ];

  const MobileNav = () => (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex items-center gap-2 mb-8">
          <Train className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Ticket Ride Hub</span>
        </div>
        
        <nav className="space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setSheetOpen(false);
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-6 right-6 space-y-2">
          {user ? (
            <>
              <div className="text-sm text-muted-foreground px-2">
                Welcome, {user.name}
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : admin ? (
            <>
              <div className="text-sm text-muted-foreground px-2">
                Admin: {admin.name}
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout Admin
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full" onClick={() => { navigate('/login'); setSheetOpen(false); }}>
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { navigate('/admin'); setSheetOpen(false); }}>
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Train className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Ticket Ride Hub</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'secondary' : 'ghost'}
                    asChild
                  >
                    <Link to={item.path}>
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {!isMobile && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/my-tickets')}>
                        <Ticket className="h-4 w-4 mr-2" />
                        My Tickets
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : admin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin: {admin.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button onClick={() => navigate('/login')}>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu */}
            {isMobile && <MobileNav />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;