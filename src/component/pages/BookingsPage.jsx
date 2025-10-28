import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMember, BaseCrudService, useRealtime } from '../../integrations/index.js';
// The 'Bookings' import is removed as it was only used for TypeScript types
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { MemberProtectedRoute } from '../ui/member-protected-route.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  Calendar, 
  Clock, 
  MapPin,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

function BookingsPageContent() {
  const { member } = useMember();
  const { on, off } = useRealtime();
  const [bookings, setBookings] = useState([]); // Removed <Bookings[]> type
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState(null); // Removed <string | null> type

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { items } = await BaseCrudService.getAll('bookings'); // Removed <Bookings> generic
        
        // Filter bookings for the current user
        const userBookings = items.filter(booking => 
          booking.userName === (member?.profile?.nickname || member?.contact?.firstName || 'Anonymous User')
        );
        
        // Sort by creation date (newest first)
        const sortedBookings = userBookings.sort((a, b) => 
          new Date(b._createdDate || 0).getTime() - new Date(a._createdDate || 0).getTime()
        );
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [member]);

  // Realtime booking updates
  useEffect(() => {
    const handleStatus = ({ bookingId, status }) => {
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
    };
    const handleCreated = (booking) => setBookings(prev => [booking, ...prev]);
    const handleCancelled = ({ bookingId }) => setBookings(prev => prev.filter(b => b._id !== bookingId));

    on('booking-status-changed', handleStatus);
    on('booking-created', handleCreated);
    on('booking-cancelled', handleCancelled);

    return () => {
      off('booking-status-changed', handleStatus);
      off('booking-created', handleCreated);
      off('booking-cancelled', handleCancelled);
    };
  }, [on, off]);

  const getStatusIcon = (status) => { // Removed type annotation
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => { // Removed type annotation
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDateTime = (dateTime) => { // Removed type annotation
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (startTime) => { // Removed type annotation
    if (!startTime) return false;
    return new Date(startTime) > new Date();
  };

  const handleCancelBooking = async (bookingId) => { // Removed type annotation
    try {
      setCancellingBookingId(bookingId);
      
      // Update the booking status to 'Cancelled'
      await BaseCrudService.update('bookings', { // Removed <Bookings> generic
        _id: bookingId,
        status: 'Cancelled'
      });
      
      // Update the local state to reflect the change
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'Cancelled' }
            : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      // You could add a toast notification here for better UX
    } finally {
      setCancellingBookingId(null);
    }
  };

  const upcomingBookings = bookings.filter(booking => isUpcoming(booking.startTime));
  const pastBookings = bookings.filter(booking => !isUpcoming(booking.startTime));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 bg-gradient-to-r from-subtlebackground to-brandaccent/20">
        <div className="text-center space-y-6">
          <h1 className="font-heading text-5xl font-bold text-secondary">
            My Bookings
          </h1>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            Manage your charging station reservations and view your booking history.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-background border-brandaccent/20">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-brandaccent/20 rounded w-1/4"></div>
                    <div className="h-4 bg-brandaccent/20 rounded w-3/4"></div>
                    <div className="h-4 bg-brandaccent/20 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="bg-background border-brandaccent/20">
            <CardContent className="p-16 text-center">
              <div className="space-y-4">
                <Calendar className="w-16 h-16 text-secondary/30 mx-auto" />
                <h3 className="font-heading text-xl font-semibold text-secondary">No bookings yet</h3>
                <p className="font-paragraph text-secondary/70">
                  You haven't made any charging station reservations yet.
                </p>
                <Link to="/stations">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Find Charging Stations
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold text-secondary">
                  Upcoming Bookings ({upcomingBookings.length})
                </h2>
                <div className="grid gap-6">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking._id} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-heading text-xl font-semibold text-secondary">
                                {booking.stationName}
                              </h3>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status}
                                </div>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-secondary/70">
                                <Calendar className="w-4 h-4" />
                                <span className="font-paragraph text-sm">
                                  {formatDateTime(booking.startTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-secondary/70">
                                <Clock className="w-4 h-4" />
                                <span className="font-paragraph text-sm">
                                  Until {formatDateTime(booking.endTime)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-secondary/70">
                              <span className="font-paragraph text-sm font-medium">
                                Booking Reference: {booking.bookingReference}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                              View Details
                            </Button>
                            {booking.status !== 'Cancelled' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={cancellingBookingId === booking._id}
                              >
                                {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold text-secondary">
                  Booking History ({pastBookings.length})
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking._id} className="bg-background border-brandaccent/20 opacity-75">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-heading text-lg font-medium text-secondary">
                                {booking.stationName}
                              </h4>
                              <Badge className={getStatusColor(booking.status)} variant="outline">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status}
                                </div>
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-secondary/60">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(booking.startTime)}
                              </span>
                              <span>•</span>
                              <span>{booking.bookingReference}</span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-secondary/60 hover:text-secondary">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <MemberProtectedRoute messageToSignIn="Sign in to view your bookings">
      <BookingsPageContent />
    </MemberProtectedRoute>
  );
}