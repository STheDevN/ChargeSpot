import React, { useState, useEffect } from 'react'; // Added React for best practice
import { Link } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/index.js';
// Entity imports removed as they were only for TypeScript types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Star,
  Zap,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

export default function OwnerAnalyticsPage() {
  const [stations, setStations] = useState([]); // Removed type
  const [bookings, setBookings] = useState([]); // Removed type
  const [reviews, setReviews] = useState([]);   // Removed type
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    activeStations: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    utilizationRate: 0,
    topPerformingStation: '',
    peakHours: [],            // Removed 'as' assertion
    monthlyRevenue: [],       // Removed 'as' assertion
    stationPerformance: [],   // Removed 'as' assertion
    bookingStatus: []         // Removed 'as' assertion
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
        calculateAnalytics(stationsData.items, bookingsData.items, reviewsData.items);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const calculateAnalytics = (stationsData, bookingsData, reviewsData) => { // Removed type annotations
    // Basic metrics
    const totalRevenue = bookingsData.reduce((sum, booking) => {
      // Mock revenue calculation based on station pricing
      const station = stationsData.find(s => s.stationName === booking.stationName);
      return sum + (station?.pricePerKwh || 0.35) * (Math.random() * 50 + 10); // Mock kWh usage
    }, 0);

    const activeStations = stationsData.filter(station => station.isAvailable).length;
    const averageRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length;
    
    // Growth calculations (mock data for demonstration)
    const revenueGrowth = Math.random() * 20 + 5; // 5-25% growth
    const bookingGrowth = Math.random() * 15 + 3; // 3-18% growth
    
    // Utilization rate
    const utilizationRate = (bookingsData.length / (stationsData.length * 30)) * 100; // Rough calculation

    // Top performing station
    const stationBookingCounts = stationsData.map(station => ({
      name: station.stationName || '',
      bookings: bookingsData.filter(b => b.stationName === station.stationName).length
    }));
    const topPerformingStation = stationBookingCounts.sort((a, b) => b.bookings - a.bookings)[0]?.name || '';

    // Peak hours analysis
    const hourCounts = {}; // Removed type annotation
    bookingsData.forEach(booking => {
      const hour = new Date(booking.startTime || '').getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
      .map(([hour, bookings]) => ({ hour, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 24);

    // Monthly revenue (mock data)
    const monthlyRevenue = [
      { month: 'Jan', revenue: totalRevenue * 0.8 },
      { month: 'Feb', revenue: totalRevenue * 0.85 },
      { month: 'Mar', revenue: totalRevenue * 0.9 },
      { month: 'Apr', revenue: totalRevenue * 0.95 },
      { month: 'May', revenue: totalRevenue },
      { month: 'Jun', revenue: totalRevenue * 1.1 }
    ];

    // Station performance
    const stationPerformance = stationsData.map(station => {
      const stationBookings = bookingsData.filter(b => b.stationName === station.stationName);
      const revenue = stationBookings.length * (station.pricePerKwh || 0.35) * 30; // Mock calculation
      return {
        name: station.stationName || '',
        bookings: stationBookings.length,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Booking status distribution
    const statusCounts = {}; // Removed type annotation
    bookingsData.forEach(booking => {
      const status = booking.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusColors = { // Removed type annotation
      confirmed: '#BEEB00',
      completed: '#22c55e',
      cancelled: '#ef4444',
      pending: '#f59e0b'
    };

    const bookingStatus = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: statusColors[name] || '#6b7280'
    }));

    setAnalytics({
      totalRevenue,
      totalBookings: bookingsData.length,
      averageRating: averageRating || 0,
      activeStations,
      revenueGrowth,
      bookingGrowth,
      utilizationRate,
      topPerformingStation,
      peakHours,
      monthlyRevenue,
      stationPerformance,
      bookingStatus
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading analytics...</p>
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
          <div className="flex items-center gap-4">
            <Link to="/owner/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-4xl font-bold text-secondary">
                Business Analytics
              </h1>
              <p className="font-paragraph text-xl text-secondary/70">
                Comprehensive insights into your charging station performance
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-primary-foreground/80 text-sm">Total Revenue</p>
                            <p className="font-heading text-2xl font-bold text-primary-foreground">
                                ${analytics.totalRevenue.toFixed(0)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3 text-primary-foreground/80" />
                                <span className="font-paragraph text-xs text-primary-foreground/80">
                                    +{analytics.revenueGrowth.toFixed(1)}% from last period
                                </span>
                            </div>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary-foreground/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brandaccent to-brandaccent/80 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary text-sm">Total Bookings</p>
                            <p className="font-heading text-2xl font-bold text-secondary">
                                {analytics.totalBookings}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3 text-secondary/80" />
                                <span className="font-paragraph text-xs text-secondary/80">
                                    +{analytics.bookingGrowth.toFixed(1)}% from last period
                                </span>
                            </div>
                        </div>
                        <Calendar className="w-8 h-8 text-secondary/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary-foreground/80 text-sm">Average Rating</p>
                            <p className="font-heading text-2xl font-bold text-secondary-foreground">
                                {analytics.averageRating.toFixed(1)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-secondary-foreground/80 fill-current" />
                                <span className="font-paragraph text-xs text-secondary-foreground/80">
                                    Based on {reviews.length} reviews
                                </span>
                            </div>
                        </div>
                        <Star className="w-8 h-8 text-secondary-foreground/80" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-white/80 text-sm">Utilization Rate</p>
                            <p className="font-heading text-2xl font-bold text-white">
                                {analytics.utilizationRate.toFixed(1)}%
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <Activity className="w-3 h-3 text-white/80" />
                                <span className="font-paragraph text-xs text-white/80">
                                    {analytics.activeStations} active stations
                                </span>
                            </div>
                        </div>
                        <Zap className="w-8 h-8 text-white/80" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#BEEB00" fill="#BEEB00" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Booking Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Booking Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics.bookingStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.bookingStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-secondary/70">Top Performing Station</p>
                      <p className="font-heading text-lg font-bold text-secondary">{analytics.topPerformingStation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brandaccent/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-brandaccent" />
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-secondary/70">Peak Hour</p>
                      <p className="font-heading text-lg font-bold text-secondary">
                        {analytics.peakHours[0]?.hour || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-secondary/70">Avg. Session Duration</p>
                      <p className="font-heading text-lg font-bold text-secondary">45 min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Revenue by Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.stationPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#BEEB00" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Station Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-subtlebackground">
                      <tr>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Station Name</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Status</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Bookings</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Revenue</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.stationPerformance.map((station, index) => (
                        <tr key={index} className="border-b border-brandaccent/10">
                          <td className="p-4 font-paragraph text-secondary">{station.name}</td>
                          <td className="p-4">
                            <Badge className="bg-primary text-white">Active</Badge>
                          </td>
                          <td className="p-4 font-paragraph text-secondary">{station.bookings}</td>
                          <td className="p-4 font-paragraph text-primary font-bold">${station.revenue.toFixed(0)}</td>
                          <td className="p-4 font-paragraph text-secondary">
                            {((station.bookings / analytics.totalBookings) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Peak Usage Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#BEEB00" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}