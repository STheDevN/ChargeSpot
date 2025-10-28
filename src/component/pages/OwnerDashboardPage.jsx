import React, { useState, useEffect } from 'react'; // Added React for best practice
import { Link } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/index.js';
// Entity imports removed as they were only for TypeScript types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  Zap, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Users, 
  Star,
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [stations, setStations] = useState([]); // Removed type
  const [bookings, setBookings] = useState([]); // Removed type
  const [reviews, setReviews] = useState([]);   // Removed type
  const [loading, setLoading] = useState(true);

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    activeStations: 0,
    todayBookings: 0,
    weeklyRevenue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsData, bookingsData, reviewsData] = await Promise.all([
          BaseCrudService.getAll('stations'), // Fixed endpoint name
          BaseCrudService.getAll('bookings'),         // Removed generic
          BaseCrudService.getAll('reviews')           // Removed generic
        ]);
        
        setStations(stationsData.items);
        setBookings(bookingsData.items);
        setReviews(reviewsData.items);

        // Calculate analytics
        const totalRevenue = bookingsData.items.reduce((sum, booking) => {
          // Assuming a base rate calculation
          return sum + (Math.random() * 50 + 10); // Mock revenue calculation
        }, 0);

        const today = new Date();
        const todayRevenue = bookingsData.items.filter(booking => {
          const bookingDate = new Date(booking.startTime || '');
          return bookingDate.toDateString() === today.toDateString();
        }).reduce((sum) => sum + (Math.random() * 30 + 5), 0); // Mock today's revenue

        const activeStations = stationsData.items.filter(station => station.isAvailable).length;
        const averageRating = reviewsData.items.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.items.length;
        
        const todayBookings = bookingsData.items.filter(booking => {
          const bookingDate = new Date(booking.startTime || '');
          return bookingDate.toDateString() === today.toDateString();
        }).length;

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        const weeklyRevenue = bookingsData.items.filter(booking => {
          const bookingDate = new Date(booking.startTime || '');
          return bookingDate >= weekStart;
        }).length * 25; // Mock calculation

        setAnalytics({
          totalRevenue,
          todayRevenue,
          totalBookings: bookingsData.items.length,
          averageRating: averageRating || 0,
          activeStations,
          todayBookings,
          weeklyRevenue
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentBookings = bookings.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);

  const handleMarkAsProcessed = async (bookingId, isProcessed) => { // Removed type annotations
    try {
      // Update the booking status to 'processed' or back to its original status
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) return;

      const updatedStatus = isProcessed ? 'processed' : 'confirmed';
      
      await BaseCrudService.update('bookings', { // Removed generic
        _id: bookingId,
        ...booking,
        status: updatedStatus
      });

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === bookingId 
            ? { ...b, status: updatedStatus }
            : b
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="w-full max-w-[120rem] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold text-secondary mb-2">
              Station Owner Dashboard
            </h1>
            <p className="font-paragraph text-xl text-secondary/70">
              Manage your charging stations, bookings, and business analytics
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/owner/stations">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Manage Stations
              </Button>
            </Link>
            <Link to="/owner/stations">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Station
              </Button>
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-primary-foreground/80 text-sm">Total Revenue</p>
                            <p className="font-heading text-2xl font-bold text-primary-foreground">
                                ${analytics.totalRevenue.toFixed(0)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary-foreground/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-white/80 text-sm">Today's Revenue</p>
                            <p className="font-heading text-2xl font-bold text-white">
                                ${analytics.todayRevenue.toFixed(0)}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-white/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary-foreground/80 text-sm">Total Bookings</p>
                            <p className="font-heading text-2xl font-bold text-secondary-foreground">
                                {analytics.totalBookings}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-secondary-foreground/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-white/80 text-sm">Avg Rating</p>
                            <p className="font-heading text-2xl font-bold text-white">
                                {analytics.averageRating.toFixed(1)}
                            </p>
                        </div>
                        <Star className="w-8 h-8 text-white/80" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Today's Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-paragraph text-secondary/70">Today's Bookings</span>
                    <span className="font-heading text-xl font-bold text-secondary">{analytics.todayBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-paragraph text-secondary/70">Weekly Revenue</span>
                    <span className="font-heading text-xl font-bold text-primary">${analytics.weeklyRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-paragraph text-secondary/70">Station Utilization</span>
                    <span className="font-heading text-xl font-bold text-brandaccent">
                      {((analytics.totalBookings / stations.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 bg-subtlebackground rounded-lg">
                      <div>
                        <p className="font-paragraph font-medium text-secondary">{booking.stationName}</p>
                        <p className="font-paragraph text-sm text-secondary/70">{booking.userName}</p>
                      </div>
                      <Badge className={`${
                        booking.status === 'confirmed' ? 'bg-primary' : 
                        booking.status === 'completed' ? 'bg-green-500' : 
                        booking.status === 'processed' ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white`}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-2xl font-bold text-secondary">Recent Bookings</h3>
              <Link to="/owner/bookings">
                <Button variant="outline">View All Bookings</Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-subtlebackground">
                      <tr>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Station</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Customer</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Date & Time</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Status</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Reference</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Processed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 10).map((booking) => (
                        <tr key={booking._id} className="border-b border-brandaccent/10">
                          <td className="p-4 font-paragraph text-secondary">{booking.stationName}</td>
                          <td className="p-4 font-paragraph text-secondary">{booking.userName}</td>
                          <td className="p-4 font-paragraph text-secondary/70">
                            {new Date(booking.startTime || '').toLocaleDateString()} at{' '}
                            {new Date(booking.startTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            <Badge className={`${
                              booking.status === 'confirmed' ? 'bg-primary' : 
                              booking.status === 'completed' ? 'bg-green-500' : 
                              booking.status === 'processed' ? 'bg-blue-500' :
                              booking.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                            } text-white`}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-paragraph text-secondary/70 font-mono text-sm">
                            {booking.bookingReference}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`processed-${booking._id}`}
                                checked={booking.status === 'processed'}
                                onCheckedChange={(checked) => 
                                  handleMarkAsProcessed(booking._id, checked) // Removed 'as boolean' cast
                                }
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label 
                                htmlFor={`processed-${booking._id}`}
                                className="text-sm font-paragraph text-secondary/70 cursor-pointer"
                              >
                                {booking.status === 'processed' ? 'Processed' : 'Mark as processed'}
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}