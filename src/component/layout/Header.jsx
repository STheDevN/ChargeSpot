import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMember, useRealtime } from '../../integrations/index.js';
import { Button } from '../ui/button.jsx';
import { AuthModal } from '../ui/auth-modal.jsx';
import NotificationCenter from '../ui/notification-center.jsx';
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Info, 
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';

export default function Header() {
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const { connected } = useRealtime();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    actions.logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-brandaccent/20 sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-secondary">ChargeSpot</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Navigation links */}
              <Link 
                to="/stations" 
                className="flex items-center gap-1 font-paragraph text-secondary hover:text-primary transition-colors"
                onClick={() => console.log('Stations link clicked')}
              >
                <MapPin className="w-4 h-4" />
                Find Stations
              </Link>
              <Link 
                to="/about" 
                className="flex items-center gap-1 font-paragraph text-secondary hover:text-primary transition-colors"
                onClick={() => console.log('About link clicked')}
              >
                <Info className="w-4 h-4" />
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-1 font-paragraph text-secondary hover:text-primary transition-colors"
                onClick={() => console.log('Contact link clicked')}
              >
                <Phone className="w-4 h-4" />
                Contact
              </Link>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connected ? (
                  <div className="flex items-center gap-1 text-green-600" title="Real-time updates active">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600" title="Real-time updates disconnected">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs font-medium">Offline</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
              )}
              
              {isLoading && (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              
              {!isAuthenticated && !isLoading && (
                <Button 
                  onClick={() => {
                    console.log('Sign In button clicked');
                    setShowAuthModal(true);
                  }} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign In
                </Button>
              )}
              
              {isAuthenticated && (
                <>
                  <Link to="/bookings" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span className="font-paragraph">My Bookings</span>
                  </Link>
                  
                  {member?.role === 'owner' && (
                    <Link to="/owner/dashboard" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-paragraph">Owner Dashboard</span>
                    </Link>
                  )}

                  {member?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="font-paragraph">Admin Panel</span>
                    </Link>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <Button 
                      variant="ghost"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-paragraph">{member?.firstName || 'User'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-brandaccent/20 rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-subtlebackground"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors rounded-md hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}