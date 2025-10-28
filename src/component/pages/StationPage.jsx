import React, { useState, useEffect } from 'react'; // Added React for best practice
import { Link } from 'react-router-dom';
import { useMember, BaseCrudService, useRealtime } from '../../integrations/index.js';
// Entity imports removed as they were only for TypeScript types
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Card, CardContent } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Image } from '../ui/image.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import InteractiveMap from '../ui/interactive-map.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  MapPin, 
  Search, 
  Zap, 
  Clock, 
  Filter,
  ChevronRight,
  SlidersHorizontal,
  X,
  Map,
  List
} from 'lucide-react';

export default function StationsPage() {
  const { member, isAuthenticated } = useMember();
  const { on, off } = useRealtime();
  const [stations, setStations] = useState([]);         // Removed type
  const [amenities, setAmenities] = useState([]);       // Removed type
  const [filteredStations, setFilteredStations] = useState([]); // Removed type
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Filter states
  const [selectedStationType, setSelectedStationType] = useState(''); // Removed type
  const [selectedConnectorType, setSelectedConnectorType] = useState(''); // Removed type
  const [minChargingSpeed, setMinChargingSpeed] = useState('');     // Removed type
  const [maxPrice, setMaxPrice] = useState('');                     // Removed type
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);   // Removed type

  // Mock user's top stations (in a real app, this would come from user preferences/history)
  const getUserTopStations = (allStations) => { // Removed type annotation
    if (!isAuthenticated) return allStations;
    
    // Mock logic: return stations sorted by a combination of availability, speed, and price
    return allStations.sort((a, b) => {
      const scoreA = (a.isAvailable ? 10 : 0) + (a.chargingSpeedKw || 0) / 10 - (a.pricePerKwh || 0) * 100;
      const scoreB = (b.isAvailable ? 10 : 0) + (b.chargingSpeedKw || 0) / 10 - (b.pricePerKwh || 0) * 100;
      return scoreB - scoreA;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsData, amenitiesData] = await Promise.all([
          BaseCrudService.getAll('stations'), // Fixed endpoint name
          Promise.resolve({ items: [] }) // Amenities endpoint doesn't exist, using mock data
        ]);
        
        // Handle both API response formats
        const stations = stationsData.stations || stationsData.items || [];
        setStations(stations);
        const topStations = getUserTopStations(stations);
        setFilteredStations(topStations);
        setAmenities(amenitiesData.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Realtime station events
  useEffect(() => {
    const handleCreated = (station) => setStations((prev) => [station, ...prev]);
    const handleUpdated = (updated) => setStations((prev) => prev.map(s => s._id === updated._id ? updated : s));
    const handleDeleted = ({ stationId }) => setStations((prev) => prev.filter(s => s._id !== stationId));

    on('station-created', handleCreated);
    on('station-updated', handleUpdated);
    on('station-deleted', handleDeleted);

    return () => {
      off('station-created', handleCreated);
      off('station-updated', handleUpdated);
      off('station-deleted', handleDeleted);
    };
  }, [on, off]);

  useEffect(() => {
    let filtered = stations.filter(station => {
      // Search filter
      const matchesSearch = !searchQuery || 
        station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address?.toLowerCase().includes(searchQuery.toLowerCase());

      // Station type filter
      const matchesStationType = !selectedStationType || station.stationType === selectedStationType;

      // Connector type filter
      const matchesConnectorType = !selectedConnectorType || 
        station.connectorTypes?.includes(selectedConnectorType);

      // Charging speed filter
      const matchesChargingSpeed = !minChargingSpeed || 
        (station.chargingSpeedKw && station.chargingSpeedKw >= parseInt(minChargingSpeed));

      // Price filter
      const matchesPrice = !maxPrice || 
        (station.pricePerKwh && station.pricePerKwh <= parseFloat(maxPrice));

      // Availability filter
      const matchesAvailability = !availableOnly || station.isAvailable;

      return matchesSearch && matchesStationType && matchesConnectorType && 
             matchesChargingSpeed && matchesPrice && matchesAvailability;
    });

    // Apply user's top stations logic if authenticated and no filters are active
    if (isAuthenticated && !searchQuery && !selectedStationType && !selectedConnectorType && 
        !minChargingSpeed && !maxPrice && !availableOnly) {
      filtered = getUserTopStations(filtered);
    }

    setFilteredStations(filtered);
  }, [stations, searchQuery, selectedStationType, selectedConnectorType, minChargingSpeed, maxPrice, availableOnly, selectedAmenities, isAuthenticated]);

  const clearFilters = () => {
    setSelectedStationType('');
    setSelectedConnectorType('');
    setMinChargingSpeed('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSelectedAmenities([]);
  };

  const uniqueStationTypes = [...new Set(stations.map(s => s.stationType).filter(Boolean))];
  const uniqueConnectorTypes = [...new Set(stations.flatMap(s => s.connectorTypes?.split(',') || []).map(c => c.trim()).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 bg-gradient-to-r from-subtlebackground to-brandaccent/20">
        <div className="text-center space-y-6">
          <h1 className="font-heading text-5xl font-bold text-secondary">
            {isAuthenticated ? 'Your Top Charging Stations' : 'Find Your Perfect Charging Station'}
          </h1>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            {isAuthenticated 
              ? 'Discover your personalized selection of charging stations based on your preferences and usage patterns.'
              : 'Explore our comprehensive network of charging stations with real-time availability, detailed amenities, and user reviews to make your charging experience seamless.'
            }
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Search Bar and View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-5 h-5" />
              <Input
                placeholder="Search by station name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-brandaccent/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12 px-6"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(selectedStationType || selectedConnectorType || minChargingSpeed || maxPrice || availableOnly) && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">Active</Badge>
                )}
              </Button>
              
              <div className="flex border border-brandaccent/30 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-none border-0"
                >
                  <Map className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-subtlebackground border-brandaccent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-lg font-semibold text-secondary">Filter Stations</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={clearFilters} className="text-secondary/70 hover:text-secondary">
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                    <Button variant="ghost" onClick={() => setShowFilters(false)} className="text-secondary/70 hover:text-secondary">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Station Type */}
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-medium text-secondary">Station Type</label>
                    <Select value={selectedStationType} onValueChange={setSelectedStationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {uniqueStationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Connector Type */}
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-medium text-secondary">Connector Type</label>
                    <Select value={selectedConnectorType} onValueChange={setSelectedConnectorType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All connectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All connectors</SelectItem>
                        {uniqueConnectorTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Charging Speed */}
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-medium text-secondary">Min Charging Speed (kW)</label>
                    <Select value={minChargingSpeed} onValueChange={setMinChargingSpeed}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any speed</SelectItem>
                        <SelectItem value="7">7 kW+</SelectItem>
                        <SelectItem value="22">22 kW+</SelectItem>
                        <SelectItem value="50">50 kW+</SelectItem>
                        <SelectItem value="150">150 kW+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Price */}
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-medium text-secondary">Max Price ($/kWh)</label>
                    <Select value={maxPrice} onValueChange={setMaxPrice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any price</SelectItem>
                        <SelectItem value="0.25">$0.25</SelectItem>
                        <SelectItem value="0.35">$0.35</SelectItem>
                        <SelectItem value="0.45">$0.45</SelectItem>
                        <SelectItem value="0.55">$0.55</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex items-center space-x-2">
                  <Checkbox 
                    id="available-only" 
                    checked={availableOnly}
                    onCheckedChange={(checked) => setAvailableOnly(checked)} // Removed 'as boolean' cast
                  />
                  <label htmlFor="available-only" className="font-paragraph text-sm text-secondary">
                    Show only available stations
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="font-paragraph text-secondary/70">
              Showing {filteredStations.length} of {stations.length} stations
            </p>
          </div>
        </div>
      </section>

      {/* Stations Display */}
      <section className="w-full max-w-[120rem] mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="bg-background border-brandaccent/20">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-48 bg-brandaccent/20 rounded-lg"></div>
                    <div className="h-4 bg-brandaccent/20 rounded w-3/4"></div>
                    <div className="h-4 bg-brandaccent/20 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStations.length === 0 ? (
          <Card className="bg-background border-brandaccent/20">
            <CardContent className="p-16 text-center">
              <div className="space-y-4">
                <MapPin className="w-16 h-16 text-secondary/30 mx-auto" />
                <h3 className="font-heading text-xl font-semibold text-secondary">No stations found</h3>
                <p className="font-paragraph text-secondary/70">
                  Try adjusting your search criteria or filters to find more stations.
                </p>
                <Button onClick={clearFilters} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'map' ? (
          <InteractiveMap
            stations={filteredStations}
            center={[40.7128, -74.0060]} // Default to NYC, could be user's location
            zoom={13}
            onStationSelect={setSelectedStation}
            height="600px"
            showFilters={false}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStations.map((station) => (
              <Card key={station._id} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={station.stationImage || station.images?.[0]?.url || "https://static.wixstatic.com/media/7f4fa4_070120f10b7446fbbd06189579c77f7e~mv2.png?originWidth=384&originHeight=192"}
                      alt={station.name || station.stationName || "Charging station"}
                      width={400}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${station.isAvailable ? 'bg-primary' : 'bg-red-500'} text-white`}>
                        {station.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>
                    {station.stationType && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-secondary/80 text-secondary-foreground">
                          {station.stationType}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-secondary mb-2">
                        {station.name || station.stationName}
                      </h3>
                      <p className="font-paragraph text-secondary/70 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {station.address}
                      </p>
                    </div>

                    {station.description && (
                      <p className="font-paragraph text-sm text-secondary/60 line-clamp-2">
                        {station.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-paragraph text-sm font-medium">{station.chargingSpeedKw}kW</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-paragraph text-sm font-bold text-primary">
                          ${station.pricePerKwh}/kWh
                        </span>
                      </div>
                    </div>

                    {station.connectorTypes && (
                      <div className="flex flex-wrap gap-1">
                        {station.connectorTypes.split(',').map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary/60" />
                      <span className="font-paragraph text-sm text-secondary/70">
                        {station.operatingHours || '24/7'}
                      </span>
                    </div>

                    <Link to={`/stations/${station._id}`}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}