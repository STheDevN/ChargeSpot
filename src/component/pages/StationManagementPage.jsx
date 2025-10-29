import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/crud-service.js';
import { useMember } from '../../integrations/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Zap, 
  Clock, 
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X
} from 'lucide-react';

export default function StationManagementPage() {
  const navigate = useNavigate();
  const { member, isAuthenticated } = useMember();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    stationType: '',
    connectorTypes: [],
    chargingSpeedKw: '',
    pricePerKwh: '',
    operatingHours: '24/7',
    amenities: [],
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    features: {
      hasRestroom: false,
      hasWiFi: false,
      hasFood: false,
      hasShopping: false,
      isAccessible: false,
      hasSecurity: false
    }
  });

  const stationTypes = ['Fast Charging', 'Standard', 'Super Fast'];
  const connectorTypes = ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
  const amenities = ['WiFi', 'Restroom', 'Coffee Shop', 'Restaurant', 'Shopping', 'Parking', 'Security'];

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/stations/owner/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStations(data.stations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Debug: Check authentication status
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Is authenticated:', isAuthenticated);
      console.log('Current user:', member);
      console.log('User role:', member?.role);
      
      const stationData = {
        ...formData,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        connectorTypes: formData.connectorTypes.join(','),
        chargingSpeedKw: parseFloat(formData.chargingSpeedKw),
        pricePerKwh: parseFloat(formData.pricePerKwh)
      };
      
      console.log('Station data being sent:', stationData);

      if (editingStation) {
        await BaseCrudService.updateStation({ ...stationData, _id: editingStation._id });
      } else {
        await BaseCrudService.createStation(stationData);
      }

      setShowAddDialog(false);
      setEditingStation(null);
      resetForm();
      fetchStations();
    } catch (error) {
      console.error('Error saving station:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to save station. ';
      if (error.message.includes('403')) {
        errorMessage += 'You need to be logged in as a station owner to create stations.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please check if the backend is running and try again.';
      } else if (error.message.includes('401')) {
        errorMessage += 'Please log in to create stations.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name || '',
      description: station.description || '',
      address: station.address || '',
      city: station.city || '',
      state: station.state || '',
      zipCode: station.zipCode || '',
      latitude: station.coordinates?.latitude?.toString() || '',
      longitude: station.coordinates?.longitude?.toString() || '',
      stationType: station.stationType || '',
      connectorTypes: station.connectorTypes ? station.connectorTypes.split(',') : [],
      chargingSpeedKw: station.chargingSpeedKw?.toString() || '',
      pricePerKwh: station.pricePerKwh?.toString() || '',
      operatingHours: station.operatingHours || '24/7',
      amenities: station.amenities || [],
      contactInfo: {
        phone: station.contactInfo?.phone || '',
        email: station.contactInfo?.email || '',
        website: station.contactInfo?.website || ''
      },
      features: {
        hasRestroom: station.features?.hasRestroom || false,
        hasWiFi: station.features?.hasWiFi || false,
        hasFood: station.features?.hasFood || false,
        hasShopping: station.features?.hasShopping || false,
        isAccessible: station.features?.isAccessible || false,
        hasSecurity: station.features?.hasSecurity || false
      }
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (stationId) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await BaseCrudService.deleteStation(stationId);
        fetchStations();
      } catch (error) {
        console.error('Error deleting station:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: '',
      longitude: '',
      stationType: '',
      connectorTypes: [],
      chargingSpeedKw: '',
      pricePerKwh: '',
      operatingHours: '24/7',
      amenities: [],
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      features: {
        hasRestroom: false,
        hasWiFi: false,
        hasFood: false,
        hasShopping: false,
        isAccessible: false,
        hasSecurity: false
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading stations...</p>
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
              Manage Your Stations
            </h1>
            <p className="font-paragraph text-xl text-secondary/70">
              Add, edit, and manage your charging stations
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Station
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-secondary">
                  {editingStation ? 'Edit Station' : 'Add New Station'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Station Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stationType">Station Type *</Label>
                      <Select value={formData.stationType} onValueChange={(value) => handleInputChange('stationType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select station type" />
                        </SelectTrigger>
                        <SelectContent>
                          {stationTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Location Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chargingSpeedKw">Charging Speed (kW) *</Label>
                      <Input
                        id="chargingSpeedKw"
                        type="number"
                        value={formData.chargingSpeedKw}
                        onChange={(e) => handleInputChange('chargingSpeedKw', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKwh">Price per kWh ($) *</Label>
                      <Input
                        id="pricePerKwh"
                        type="number"
                        step="0.01"
                        value={formData.pricePerKwh}
                        onChange={(e) => handleInputChange('pricePerKwh', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Connector Types *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {connectorTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.connectorTypes.includes(type)}
                            onCheckedChange={(checked) => handleArrayChange('connectorTypes', type, checked)}
                          />
                          <Label htmlFor={type} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={formData.operatingHours}
                      onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                      placeholder="e.g., 24/7 or 8:00 AM - 10:00 PM"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.map(amenity => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={(checked) => handleArrayChange('amenities', amenity, checked)}
                        />
                        <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.contactInfo.website}
                        onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    {editingStation ? 'Update Station' : 'Create Station'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingStation(null);
                      resetForm();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stations List */}
        <div className="space-y-6">
          {stations.length === 0 ? (
            <Card className="bg-background border-brandaccent/20">
              <CardContent className="p-16 text-center">
                <div className="space-y-4">
                  <MapPin className="w-16 h-16 text-secondary/30 mx-auto" />
                  <h3 className="font-heading text-xl font-semibold text-secondary">No stations yet</h3>
                  <p className="font-paragraph text-secondary/70">
                    Get started by adding your first charging station.
                  </p>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Station
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => (
                <Card key={station._id} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-secondary mb-1">
                            {station.name}
                          </h3>
                          <p className="font-paragraph text-secondary/70 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {station.address}
                          </p>
                        </div>
                        <Badge className={getStatusColor(station.status)}>
                          {station.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>{station.chargingSpeedKw}kW</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span>${station.pricePerKwh}/kWh</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-secondary/70">
                        <Clock className="w-3 h-3" />
                        <span>{station.operatingHours}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/stations/${station._id}`)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(station)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(station._id)}
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
