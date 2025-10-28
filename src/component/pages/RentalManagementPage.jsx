import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BaseCrudService } from '../../integrations/crud-service.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Zap, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Truck,
  Package,
  User,
  Phone,
  Mail
} from 'lucide-react';

export default function RentalManagementPage() {
  const [rentals, setRentals] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    chargingUnit: {
      type: '',
      power: '',
      connectorType: ''
    },
    rentalPeriod: {
      startDate: '',
      endDate: '',
      duration: ''
    },
    deliveryInfo: {
      address: '',
      city: '',
      zipCode: '',
      deliveryDate: '',
      pickupDate: '',
      specialInstructions: ''
    },
    notes: ''
  });

  const chargingUnitTypes = [
    { type: 'Portable', power: 7, connectorType: 'Type 2' },
    { type: 'Wall Mount', power: 22, connectorType: 'Type 2' },
    { type: 'Fast Charger', power: 50, connectorType: 'CCS' }
  ];

  const rentalDurations = ['daily', 'weekly', 'monthly'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch rentals
      const rentalsResponse = await fetch('http://localhost:5000/api/rentals/my-rentals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rentalsResponse.ok) {
        const rentalsData = await rentalsResponse.json();
        setRentals(rentalsData.rentals);
      }

      // Fetch stations for rental requests
      const stationsResponse = await fetch('http://localhost:5000/api/stations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (stationsResponse.ok) {
        const stationsData = await stationsResponse.json();
        setStations(stationsData.stations);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleSubmitRentalRequest = async (e) => {
    e.preventDefault();
    try {
      const rentalData = {
        stationId: selectedStation._id,
        chargingUnit: formData.chargingUnit,
        rentalPeriod: {
          ...formData.rentalPeriod,
          startDate: new Date(formData.rentalPeriod.startDate),
          endDate: new Date(formData.rentalPeriod.endDate)
        },
        deliveryInfo: {
          ...formData.deliveryInfo,
          deliveryDate: new Date(formData.deliveryInfo.deliveryDate),
          pickupDate: new Date(formData.deliveryInfo.pickupDate)
        },
        notes: formData.notes
      };

      await BaseCrudService.createRental(rentalData);
      setShowRequestDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating rental request:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      chargingUnit: {
        type: '',
        power: '',
        connectorType: ''
      },
      rentalPeriod: {
        startDate: '',
        endDate: '',
        duration: ''
      },
      deliveryInfo: {
        address: '',
        city: '',
        zipCode: '',
        deliveryDate: '',
        pickupDate: '',
        specialInstructions: ''
      },
      notes: ''
    });
    setSelectedStation(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'active':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateRentalCost = (unitType, duration, days) => {
    const rates = {
      'Portable': 25,
      'Wall Mount': 50,
      'Fast Charger': 100
    };
    
    const dailyRate = rates[unitType] || 25;
    return dailyRate * days;
  };

  const pendingRentals = rentals.filter(rental => rental.status === 'pending');
  const activeRentals = rentals.filter(rental => ['approved', 'active'].includes(rental.status));
  const completedRentals = rentals.filter(rental => ['completed', 'cancelled'].includes(rental.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-paragraph text-secondary/70">Loading rentals...</p>
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
              Charging Unit Rentals
            </h1>
            <p className="font-paragraph text-xl text-secondary/70">
              Rent charging equipment for your home or business
            </p>
          </div>
          
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Request Rental
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-secondary">
                  Request Charging Unit Rental
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitRentalRequest} className="space-y-6">
                {/* Station Selection */}
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Select Station</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stations.map((station) => (
                      <Card 
                        key={station._id} 
                        className={`cursor-pointer transition-colors ${
                          selectedStation?._id === station._id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-brandaccent/20 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedStation(station)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-heading font-semibold text-secondary">{station.name}</h4>
                            <p className="font-paragraph text-sm text-secondary/70 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {station.address}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-primary" />
                                {station.chargingSpeedKw}kW
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-primary" />
                                ${station.pricePerKwh}/kWh
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedStation && (
                  <>
                    {/* Charging Unit Selection */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-semibold text-secondary">Charging Unit</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {chargingUnitTypes.map((unit) => (
                          <Card 
                            key={unit.type}
                            className={`cursor-pointer transition-colors ${
                              formData.chargingUnit.type === unit.type 
                                ? 'border-primary bg-primary/5' 
                                : 'border-brandaccent/20 hover:border-primary/50'
                            }`}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              chargingUnit: {
                                type: unit.type,
                                power: unit.power,
                                connectorType: unit.connectorType
                              }
                            }))}
                          >
                            <CardContent className="p-4 text-center">
                              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-heading font-semibold text-secondary">{unit.type}</h4>
                              <p className="font-paragraph text-sm text-secondary/70">{unit.power}kW</p>
                              <p className="font-paragraph text-sm text-secondary/70">{unit.connectorType}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-semibold text-secondary">Rental Period</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.rentalPeriod.startDate}
                            onChange={(e) => handleInputChange('rentalPeriod.startDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.rentalPeriod.endDate}
                            onChange={(e) => handleInputChange('rentalPeriod.endDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration *</Label>
                          <Select value={formData.rentalPeriod.duration} onValueChange={(value) => handleInputChange('rentalPeriod.duration', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {rentalDurations.map(duration => (
                                <SelectItem key={duration} value={duration}>
                                  {duration.charAt(0).toUpperCase() + duration.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-semibold text-secondary">Delivery Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address *</Label>
                        <Input
                          id="address"
                          value={formData.deliveryInfo.address}
                          onChange={(e) => handleInputChange('deliveryInfo.address', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.deliveryInfo.city}
                            onChange={(e) => handleInputChange('deliveryInfo.city', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            value={formData.deliveryInfo.zipCode}
                            onChange={(e) => handleInputChange('deliveryInfo.zipCode', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deliveryDate">Delivery Date *</Label>
                          <Input
                            id="deliveryDate"
                            type="date"
                            value={formData.deliveryInfo.deliveryDate}
                            onChange={(e) => handleInputChange('deliveryInfo.deliveryDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickupDate">Pickup Date *</Label>
                          <Input
                            id="pickupDate"
                            type="date"
                            value={formData.deliveryInfo.pickupDate}
                            onChange={(e) => handleInputChange('deliveryInfo.pickupDate', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Textarea
                          id="specialInstructions"
                          value={formData.deliveryInfo.specialInstructions}
                          onChange={(e) => handleInputChange('deliveryInfo.specialInstructions', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-semibold text-secondary">Additional Notes</h3>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={3}
                          placeholder="Any additional information or special requirements..."
                        />
                      </div>
                    </div>

                    {/* Cost Estimate */}
                    {formData.chargingUnit.type && formData.rentalPeriod.startDate && formData.rentalPeriod.endDate && (
                      <div className="space-y-4">
                        <h3 className="font-heading text-lg font-semibold text-secondary">Cost Estimate</h3>
                        <Card className="bg-subtlebackground">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-paragraph text-secondary/70">Unit Type:</span>
                                <span className="font-paragraph font-medium">{formData.chargingUnit.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-paragraph text-secondary/70">Daily Rate:</span>
                                <span className="font-paragraph font-medium">
                                  ${chargingUnitTypes.find(u => u.type === formData.chargingUnit.type)?.power === 7 ? 25 : 
                                    chargingUnitTypes.find(u => u.type === formData.chargingUnit.type)?.power === 22 ? 50 : 100}/day
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-paragraph text-secondary/70">Duration:</span>
                                <span className="font-paragraph font-medium">
                                  {Math.ceil((new Date(formData.rentalPeriod.endDate) - new Date(formData.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>
                              <div className="border-t pt-2 flex justify-between">
                                <span className="font-paragraph font-semibold text-secondary">Total Estimate:</span>
                                <span className="font-paragraph font-bold text-primary">
                                  ${calculateRentalCost(
                                    formData.chargingUnit.type, 
                                    formData.rentalPeriod.duration,
                                    Math.ceil((new Date(formData.rentalPeriod.endDate) - new Date(formData.rentalPeriod.startDate)) / (1000 * 60 * 60 * 24))
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6">
                      <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Truck className="w-4 h-4 mr-2" />
                        Submit Rental Request
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowRequestDialog(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rentals Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingRentals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeRentals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedRentals.length})</TabsTrigger>
          </TabsList>

          {/* Pending Rentals */}
          <TabsContent value="pending" className="space-y-6">
            {pendingRentals.length === 0 ? (
              <Card className="bg-background border-brandaccent/20">
                <CardContent className="p-16 text-center">
                  <div className="space-y-4">
                    <AlertCircle className="w-16 h-16 text-secondary/30 mx-auto" />
                    <h3 className="font-heading text-xl font-semibold text-secondary">No pending rentals</h3>
                    <p className="font-paragraph text-secondary/70">
                      You don't have any pending rental requests at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRentals.map((rental) => (
                  <Card key={rental._id} className="bg-background border-brandaccent/20">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-secondary">
                              {rental.chargingUnit.type}
                            </h3>
                            <p className="font-paragraph text-sm text-secondary/70">
                              {rental.station?.name}
                            </p>
                          </div>
                          <Badge className={getStatusColor(rental.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(rental.status)}
                              {rental.status}
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(rental.rentalPeriod.startDate).toLocaleDateString()} - {new Date(rental.rentalPeriod.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{rental.deliveryInfo.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span>${rental.pricing.totalAmount}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Rentals */}
          <TabsContent value="active" className="space-y-6">
            {activeRentals.length === 0 ? (
              <Card className="bg-background border-brandaccent/20">
                <CardContent className="p-16 text-center">
                  <div className="space-y-4">
                    <Zap className="w-16 h-16 text-secondary/30 mx-auto" />
                    <h3 className="font-heading text-xl font-semibold text-secondary">No active rentals</h3>
                    <p className="font-paragraph text-secondary/70">
                      You don't have any active rentals at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRentals.map((rental) => (
                  <Card key={rental._id} className="bg-background border-brandaccent/20">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-secondary">
                              {rental.chargingUnit.type}
                            </h3>
                            <p className="font-paragraph text-sm text-secondary/70">
                              {rental.station?.name}
                            </p>
                          </div>
                          <Badge className={getStatusColor(rental.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(rental.status)}
                              {rental.status}
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(rental.rentalPeriod.startDate).toLocaleDateString()} - {new Date(rental.rentalPeriod.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{rental.deliveryInfo.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span>${rental.pricing.totalAmount}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Rentals */}
          <TabsContent value="completed" className="space-y-6">
            {completedRentals.length === 0 ? (
              <Card className="bg-background border-brandaccent/20">
                <CardContent className="p-16 text-center">
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-secondary/30 mx-auto" />
                    <h3 className="font-heading text-xl font-semibold text-secondary">No completed rentals</h3>
                    <p className="font-paragraph text-secondary/70">
                      Your rental history will appear here once rentals are completed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRentals.map((rental) => (
                  <Card key={rental._id} className="bg-background border-brandaccent/20">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-secondary">
                              {rental.chargingUnit.type}
                            </h3>
                            <p className="font-paragraph text-sm text-secondary/70">
                              {rental.station?.name}
                            </p>
                          </div>
                          <Badge className={getStatusColor(rental.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(rental.status)}
                              {rental.status}
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(rental.rentalPeriod.startDate).toLocaleDateString()} - {new Date(rental.rentalPeriod.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{rental.deliveryInfo.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span>${rental.pricing.totalAmount}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
