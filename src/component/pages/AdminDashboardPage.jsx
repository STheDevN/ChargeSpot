import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../integrations/index.js';
import { Link } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Input } from '../ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { on, off } = useRealtime();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingStations: 0,
    pendingReviews: 0,
    pendingRentals: 0
  });
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter states
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [stationFilters, setStationFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Realtime updates for admin
  useEffect(() => {
    const inc = (key, delta = 1) => setAnalytics(prev => ({ ...prev, [key]: (prev[key] || 0) + delta }));

    const onStationCreated = (station) => {
      inc('totalStations', 1);
      inc('pendingStations', station.status === 'pending' ? 1 : 0);
      setStations(prev => [station, ...prev]);
    };
    const onStationDeleted = ({ stationId }) => {
      inc('totalStations', -1);
      setStations(prev => prev.filter(s => s._id !== stationId));
    };
    const onBookingCompleted = (booking) => {
      inc('totalBookings', 1);
      setAnalytics(prev => ({ ...prev, totalRevenue: (prev.totalRevenue || 0) + (booking.amount || 0) }));
    };

    on('station-created', onStationCreated);
    on('station-deleted', onStationDeleted);
    on('booking-completed', onBookingCompleted);

    return () => {
      off('station-created', onStationCreated);
      off('station-deleted', onStationDeleted);
      off('booking-completed', onBookingCompleted);
    };
  }, [on, off]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics
      const analyticsResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch stations
      const stationsResponse = await fetch('http://localhost:5000/api/admin/stations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (stationsResponse.ok) {
        const stationsData = await stationsResponse.json();
        setStations(stationsData.stations);
      }

      // Fetch reviews
      const reviewsResponse = await fetch('http://localhost:5000/api/admin/reviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);
      }

      // Fetch rentals
      const rentalsResponse = await fetch('http://localhost:5000/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rentalsResponse.ok) {
        const rentalsData = await rentalsResponse.json();
        setRentals(rentalsData.rentals);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isActive } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleStationStatusChange = async (stationId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stations/${stationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setStations(stations.map(station => 
          station._id === stationId ? { ...station, status } : station
        ));
      }
    } catch (error) {
      console.error('Error updating station status:', error);
    }
  };

  const handleReviewModeration = async (reviewId, moderationStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moderationStatus })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, moderationStatus } : review
        ));
      }
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !userFilters.search || 
      user.firstName?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(userFilters.search.toLowerCase());
    
    const matchesRole = !userFilters.role || user.role === userFilters.role;
    const matchesStatus = !userFilters.status || 
      (userFilters.status === 'active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredStations = stations.filter(station => {
    const matchesSearch = !stationFilters.search || 
      station.name?.toLowerCase().includes(stationFilters.search.toLowerCase()) ||
      station.address?.toLowerCase().includes(stationFilters.search.toLowerCase());
    
    const matchesStatus = !stationFilters.status || station.status === stationFilters.status;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading admin dashboard...</p>
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
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-secondary mb-2">
            Admin Dashboard
          </h1>
          <p className="font-paragraph text-xl text-secondary/70">
            Manage users, stations, reviews, and monitor system performance
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-white/80 text-sm">Total Users</p>
                  <p className="font-heading text-2xl font-bold text-white">
                    {analytics.totalUsers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-white/80 text-sm">Total Stations</p>
                  <p className="font-heading text-2xl font-bold text-white">
                    {analytics.totalStations}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-white/80 text-sm">Total Bookings</p>
                  <p className="font-heading text-2xl font-bold text-white">
                    {analytics.totalBookings}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-white/80 text-sm">Total Revenue</p>
                  <p className="font-heading text-2xl font-bold text-white">
                    ${analytics.totalRevenue.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-background border-brandaccent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-secondary/70 text-sm">Pending Stations</p>
                  <p className="font-heading text-xl font-bold text-secondary">
                    {analytics.pendingStations}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-brandaccent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-secondary/70 text-sm">Pending Reviews</p>
                  <p className="font-heading text-xl font-bold text-secondary">
                    {analytics.pendingReviews}
                  </p>
                </div>
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-brandaccent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-paragraph text-secondary/70 text-sm">Pending Rentals</p>
                  <p className="font-heading text-xl font-bold text-secondary">
                    {analytics.pendingRentals}
                  </p>
                </div>
                <Activity className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-subtlebackground rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-paragraph font-medium text-secondary">New User Registration</p>
                          <p className="font-paragraph text-sm text-secondary/70">2 minutes ago</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">New</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-subtlebackground rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-paragraph font-medium text-secondary">Station Approved</p>
                          <p className="font-paragraph text-sm text-secondary/70">15 minutes ago</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-subtlebackground rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-paragraph font-medium text-secondary">Review Submitted</p>
                          <p className="font-paragraph text-sm text-secondary/70">1 hour ago</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-secondary/70">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-secondary/70">Payment Gateway</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-secondary/70">Email Service</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Warning
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-paragraph text-secondary/70">Map Service</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilters.role} onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userFilters.status} onValueChange={(value) => setUserFilters({ ...userFilters, status: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-subtlebackground">
                      <tr>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">User</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Email</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Role</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Status</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Joined</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-brandaccent/10">
                          <td className="p-4 font-paragraph text-secondary">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="p-4 font-paragraph text-secondary">{user.email}</td>
                          <td className="p-4">
                            <Badge className={`${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={`${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4 font-paragraph text-secondary/70">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
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

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Station Management</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-4 h-4" />
                    <Input
                      placeholder="Search stations..."
                      value={stationFilters.search}
                      onChange={(e) => setStationFilters({ ...stationFilters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  <Select value={stationFilters.status} onValueChange={(value) => setStationFilters({ ...stationFilters, status: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-subtlebackground">
                      <tr>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Station</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Owner</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Location</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Status</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Created</th>
                        <th className="text-left p-4 font-paragraph font-medium text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.map((station) => (
                        <tr key={station._id} className="border-b border-brandaccent/10">
                          <td className="p-4 font-paragraph text-secondary">
                            {station.name}
                          </td>
                          <td className="p-4 font-paragraph text-secondary">
                            {station.owner?.firstName} {station.owner?.lastName}
                          </td>
                          <td className="p-4 font-paragraph text-secondary/70">
                            {station.address}
                          </td>
                          <td className="p-4">
                            <Badge className={`${
                              station.status === 'approved' ? 'bg-green-100 text-green-800' :
                              station.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              station.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {station.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-paragraph text-secondary/70">
                            {new Date(station.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {station.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStationStatusChange(station._id, 'approved')}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStationStatusChange(station._id, 'rejected')}
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
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

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.filter(review => review.moderationStatus === 'pending').map((review) => (
                    <div key={review._id} className="border border-brandaccent/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-paragraph font-medium text-secondary">
                            {review.user?.firstName} {review.user?.lastName}
                          </h4>
                          <p className="font-paragraph text-sm text-secondary/70">
                            Review for {review.station?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-paragraph text-secondary/80 mb-4">{review.comment}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReviewModeration(review._id, 'approved')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewModeration(review._id, 'rejected')}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
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
