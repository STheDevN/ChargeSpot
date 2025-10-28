import React, { useState, useEffect } from 'react'; // Added React for best practice
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/index.js';
// Entity imports removed as they were only for TypeScript types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { 
  ArrowLeft,
  Save,
  Trash2,
  MapPin,
  Zap,
  DollarSign,
  Clock,
  Phone,
  Globe,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function OwnerStationManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);       // Removed type
  const [bookings, setBookings] = useState([]);       // Removed type
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);       // Removed type

  // Form state
  const [formData, setFormData] = useState({
    stationName: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    chargingSpeedKw: 0,
    connectorTypes: '',
    pricePerKwh: 0,
    isAvailable: true,
    stationType: '',
    operatingHours: '',
    contactPhone: '',
    websiteUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [stationData, bookingsData] = await Promise.all([
          BaseCrudService.getById('stations', id), // Fixed endpoint name
          BaseCrudService.getAll('bookings')                // Removed generic
        ]);
        
        if (stationData) {
          setStation(stationData);
          setFormData({
            stationName: stationData.stationName || '',
            description: stationData.description || '',
            address: stationData.address || '',
            latitude: stationData.latitude || 0,
            longitude: stationData.longitude || 0,
            chargingSpeedKw: stationData.chargingSpeedKw || 0,
            connectorTypes: stationData.connectorTypes || '',
            pricePerKwh: stationData.pricePerKwh || 0,
            isAvailable: stationData.isAvailable ?? true,
            stationType: stationData.stationType || '',
            operatingHours: stationData.operatingHours || '',
            contactPhone: stationData.contactPhone || '',
            websiteUrl: stationData.websiteUrl || ''
          });
        }

        // Filter bookings for this station
        const stationBookings = bookingsData.items.filter(
          booking => booking.stationName === stationData?.stationName
        );
        setBookings(stationBookings);

      } catch (error) {
        console.error('Error fetching station data:', error);
        setMessage({ type: 'error', text: 'Failed to load station data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!station) return;

    setSaving(true);
    try {
      const updatedStation = {
        ...station,
        ...formData
      };

      await BaseCrudService.update('stations', updatedStation);
      setStation(updatedStation);
      setMessage({ type: 'success', text: 'Station updated successfully!' });
    } catch (error) {
      console.error('Error updating station:', error);
      setMessage({ type: 'error', text: 'Failed to update station' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!station || !confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      return;
    }

    try {
      await BaseCrudService.delete('stations', station._id);
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Error deleting station:', error);
      setMessage({ type: 'error', text: 'Failed to delete station' });
    }
  };

  const handleInputChange = (field, value) => { // Removed type annotations
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading station data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="w-full max-w-[120rem] mx-auto px-6 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Station not found. <Link to="/owner/dashboard" className="text-primary hover:underline">Return to dashboard</Link>
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 5);
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime || '');
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="w-full max-w-[120rem] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/owner/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-bold text-secondary">
              Manage Station: {station.stationName}
            </h1>
            <p className="font-paragraph text-secondary/70 mt-1">
              Update station details, monitor bookings, and manage availability
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary/70 text-sm">Status</p>
                            <Badge className={`${station.isAvailable ? 'bg-primary' : 'bg-red-500'} text-white mt-1`}>
                                {station.isAvailable ? 'Available' : 'Occupied'}
                            </Badge>
                        </div>
                        <Settings className="w-8 h-8 text-secondary/40" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary/70 text-sm">Today's Bookings</p>
                            <p className="font-heading text-2xl font-bold text-secondary">{todayBookings.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-secondary/40" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary/70 text-sm">Total Bookings</p>
                            <p className="font-heading text-2xl font-bold text-secondary">{bookings.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-secondary/40" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-paragraph text-secondary/70 text-sm">Charging Speed</p>
                            <p className="font-heading text-2xl font-bold text-primary">{station.chargingSpeedKw}kW</p>
                        </div>
                        <Zap className="w-8 h-8 text-secondary/40" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="details">Station Details</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Station Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stationName">Station Name</Label>
                    <Input
                      id="stationName"
                      value={formData.stationName}
                      onChange={(e) => handleInputChange('stationName', e.target.value)}
                      placeholder="Enter station name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your charging station"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Full address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                        placeholder="0.000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                        placeholder="0.000000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chargingSpeedKw">Charging Speed (kW)</Label>
                    <Input
                      id="chargingSpeedKw"
                      type="number"
                      value={formData.chargingSpeedKw}
                      onChange={(e) => handleInputChange('chargingSpeedKw', parseInt(e.target.value))}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="connectorTypes">Connector Types</Label>
                    <Input
                      id="connectorTypes"
                      value={formData.connectorTypes}
                      onChange={(e) => handleInputChange('connectorTypes', e.target.value)}
                      placeholder="CCS, CHAdeMO, Type 2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stationType">Station Type</Label>
                    <Input
                      id="stationType"
                      value={formData.stationType}
                      onChange={(e) => handleInputChange('stationType', e.target.value)}
                      placeholder="DC Fast Charger"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pricePerKwh">Price per kWh ($)</Label>
                    <Input
                      id="pricePerKwh"
                      type="number"
                      step="0.01"
                      value={formData.pricePerKwh}
                      onChange={(e) => handleInputChange('pricePerKwh', parseFloat(e.target.value))}
                      placeholder="0.35"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Operations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact & Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={formData.operatingHours}
                      onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                      placeholder="24/7 or Mon-Fri 8AM-6PM"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Availability Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isAvailable">Station Available</Label>
                      <p className="font-paragraph text-sm text-secondary/70 mt-1">
                        Toggle to mark station as available or occupied
                      </p>
                    </div>
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                    <p className="font-paragraph text-secondary/70">No bookings yet for this station</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-subtlebackground">
                        <tr>
                          <th className="text-left p-4 font-paragraph font-medium text-secondary">Customer</th>
                          <th className="text-left p-4 font-paragraph font-medium text-secondary">Date & Time</th>
                          <th className="text-left p-4 font-paragraph font-medium text-secondary">Duration</th>
                          <th className="text-left p-4 font-paragraph font-medium text-secondary">Status</th>
                          <th className="text-left p-4 font-paragraph font-medium text-secondary">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking._id} className="border-b border-brandaccent/10">
                            <td className="p-4 font-paragraph text-secondary">{booking.userName}</td>
                            <td className="p-4 font-paragraph text-secondary/70">
                              {new Date(booking.startTime || '').toLocaleDateString()} at{' '}
                              {new Date(booking.startTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4 font-paragraph text-secondary/70">
                              {booking.endTime ? (
                                `${Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime || '').getTime()) / (1000 * 60))} min`
                              ) : (
                                'Ongoing'
                              )}
                            </td>
                            <td className="p-4">
                              <Badge className={`${
                                booking.status === 'confirmed' ? 'bg-primary' : 
                                booking.status === 'completed' ? 'bg-green-500' : 
                                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                              } text-white`}>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="p-4 font-paragraph text-secondary/70 font-mono text-sm">
                              {booking.bookingReference}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-heading text-lg font-semibold text-red-800 mb-2">Delete Station</h4>
                  <p className="font-paragraph text-red-700 mb-4">
                    Once you delete a station, there is no going back. This will permanently delete the station 
                    and all associated data including bookings and reviews.
                  </p>
                  <Button 
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Station Permanently
                  </Button>
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