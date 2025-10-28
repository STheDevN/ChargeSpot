import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { MapPin, Zap, Navigation, Star, Search, Loader2, MapIcon } from 'lucide-react';

// Live stations map with Open Charge Map integration
export default function LiveStationsMap({ 
  height = '500px',
  onStationSelect,
  showSearch = true 
}) {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [error, setError] = useState(null);

  // Fetch stations from multiple sources
  const fetchStations = async (lat = 18.5204, lng = 73.8567, radius = 25) => {
    setLoading(true);
    setError(null);
    
    try {
      const allStations = [];

      // 1. Fetch demo stations from our database
      try {
        const demoResponse = await fetch('http://localhost:5000/api/demo/stations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          console.log('Demo stations response:', demoData);
          const demoStations = (demoData.stations || []).map(station => ({
            ...station,
            source: 'demo',
            id: station._id,
            lat: station.coordinates?.latitude || station.latitude,
            lng: station.coordinates?.longitude || station.longitude,
            isLive: false
          }));
          allStations.push(...demoStations);
          console.log('Added demo stations:', demoStations.length);
        } else {
          console.error('Demo API error:', demoResponse.status, demoResponse.statusText);
        }
      } catch (err) {
        console.error('Demo stations fetch error:', err);
        // Add fallback demo data if API fails
        const fallbackStations = [
          {
            id: 'demo-1',
            name: 'GreenCharge Hub - Koregaon Park',
            address: 'Lane 5, Koregaon Park, Pune',
            lat: 18.5362,
            lng: 73.8958,
            chargingSpeedKw: 150,
            isAvailable: true,
            pricePerKwh: 12,
            source: 'demo',
            isLive: false
          },
          {
            id: 'demo-2', 
            name: 'PowerPoint Station - Baner',
            address: 'Baner Road, Near Aundh ITI, Pune',
            lat: 18.5679,
            lng: 73.7781,
            chargingSpeedKw: 60,
            isAvailable: true,
            pricePerKwh: 10,
            source: 'demo',
            isLive: false
          }
        ];
        allStations.push(...fallbackStations);
        console.log('Using fallback demo stations');
      }

      // 2. Fetch live stations from Open Charge Map
      try {
        const ocmUrl = `https://api.openchargemap.io/v3/poi?output=json&latitude=${lat}&longitude=${lng}&distance=${radius}&maxresults=50&compact=true&verbose=false`;
        
        const ocmResponse = await fetch(ocmUrl);
        if (ocmResponse.ok) {
          const ocmData = await ocmResponse.json();
          const ocmStations = ocmData.map(station => {
            const address = station.AddressInfo || {};
            const connections = station.Connections || [];
            
            // Get max power
            const maxPower = Math.max(...connections.map(c => c.PowerKW || 0).filter(p => p > 0), 7);
            
            // Determine station type
            let stationType = 'Standard';
            if (maxPower >= 150) stationType = 'Super Fast';
            else if (maxPower >= 50) stationType = 'Fast Charging';
            
            return {
              id: `ocm-${station.ID}`,
              name: address.Title || 'EV Charging Station',
              address: `${address.AddressLine1 || ''} ${address.AddressLine2 || ''}`.trim() || 'Address not available',
              city: address.Town || 'Unknown City',
              state: address.StateOrProvince || 'Unknown State',
              lat: address.Latitude,
              lng: address.Longitude,
              chargingSpeedKw: maxPower,
              stationType: stationType,
              isAvailable: station.StatusType?.IsOperational !== false,
              pricePerKwh: Math.random() * 0.3 + 0.15, // Estimated price
              connectorTypes: connections.map(c => {
                const typeId = c.ConnectionType?.ID;
                switch (typeId) {
                  case 1: return 'Type 1';
                  case 2: return 'CHAdeMO';
                  case 25: return 'Type 2';
                  case 32:
                  case 33: return 'CCS';
                  case 8:
                  case 27: return 'Tesla Supercharger';
                  default: return 'Type 2';
                }
              }).filter((type, index, arr) => arr.indexOf(type) === index),
              operatorInfo: station.OperatorInfo?.Title || 'Unknown Operator',
              source: 'ocm',
              isLive: true,
              rating: {
                average: Math.random() * 1.5 + 3.5,
                count: Math.floor(Math.random() * 50) + 5
              }
            };
          }).filter(station => station.lat && station.lng);
          
          allStations.push(...ocmStations);
        }
      } catch (err) {
        console.warn('OCM stations not available:', err.message);
      }

      // Calculate distances and sort by proximity
      if (userLocation || (lat && lng)) {
        const refLat = userLocation ? userLocation[0] : lat;
        const refLng = userLocation ? userLocation[1] : lng;
        
        allStations.forEach(station => {
          station.distance = calculateDistance(refLat, refLng, station.lat, station.lng);
        });
        
        allStations.sort((a, b) => a.distance - b.distance);
      }

      setStations(allStations);
      setFilteredStations(allStations.slice(0, 20)); // Show first 20 stations
      
    } catch (err) {
      setError(`Failed to load stations: ${err.message}`);
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchStations(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        alert('Unable to get your location. Showing stations near Pune.');
        fetchStations(); // Default to Pune
      }
    );
  };

  // Search for location
  const searchForLocation = async () => {
    if (!searchLocation.trim()) return;
    
    try {
      setLoading(true);
      // Use a simple geocoding approach (you can enhance this with Google Maps API)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setUserLocation([lat, lng]);
        fetchStations(lat, lng);
      } else {
        alert('Location not found. Please try a different search term.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for location. Please try again.');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStations(); // Start with Pune as default
  }, []);

  const handleStationClick = (station) => {
    setSelectedStation(station);
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  const getDirections = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full">
      {/* Search and Controls */}
      {showSearch && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search location (e.g., Mumbai, Delhi, Bangalore)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                className="pl-10"
              />
            </div>
            <Button onClick={searchForLocation} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
            <Button onClick={getUserLocation} variant="outline" disabled={loading}>
              <MapIcon className="w-4 h-4 mr-2" />
              My Location
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {userLocation ? (
              <span>📍 Showing stations near your location ({filteredStations.length} found)</span>
            ) : (
              <span>📍 Showing stations near Pune ({filteredStations.length} found)</span>
            )}
          </div>
        </div>
      )}

      {/* Map Area */}
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border"
        style={{ height }}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Loading charging stations...</p>
              <p className="text-xs text-gray-500 mt-1">Fetching demo + live stations</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error Loading Stations</p>
              <p className="text-sm">{error}</p>
              <Button onClick={() => fetchStations()} className="mt-2" size="sm">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map title */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm z-20">
          <h3 className="font-semibold text-sm text-gray-800">Live Charging Stations</h3>
          <p className="text-xs text-gray-600">
            {filteredStations.filter(s => s.isLive).length} live + {filteredStations.filter(s => !s.isLive).length} demo stations
          </p>
        </div>

        {/* User location marker */}
        {userLocation && (
          <div
            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-30"
            style={{ 
              top: '50%', 
              left: '50%' 
            }}
            title="Your Location"
          />
        )}

        {/* Station markers */}
        <div className="absolute inset-0 p-4">
          {filteredStations.map((station, index) => {
            // Position stations in a more spread out pattern
            const angle = (index * 137.5) * (Math.PI / 180); // Golden angle
            const radius = Math.min(35, 15 + (index * 2));
            const centerX = 50;
            const centerY = 50;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            return (
              <div
                key={station.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{ 
                  top: `${Math.max(10, Math.min(90, y))}%`, 
                  left: `${Math.max(10, Math.min(90, x))}%` 
                }}
                onClick={() => handleStationClick(station)}
              >
                {/* Station marker */}
                <div className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-125 ${
                  station.isAvailable 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}>
                  <Zap className="w-3 h-3 text-white" />
                  
                  {/* Live indicator */}
                  {station.isLive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white">
                      <div className="w-full h-full bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>

                {/* Distance badge */}
                {station.distance && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {station.distance.toFixed(1)} km
                  </div>
                )}

                {/* Station tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-white rounded-lg shadow-lg p-3 min-w-[220px] border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-800 pr-2">
                        {station.name}
                      </h4>
                      {station.isLive && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Live</Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {station.address}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-500" />
                        {station.chargingSpeedKw}kW
                      </div>
                      <div>
                        ₹{station.pricePerKwh?.toFixed(2)}/kWh
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${
                        station.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {station.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                      {station.distance && (
                        <span className="text-xs text-gray-500">{station.distance.toFixed(1)} km away</span>
                      )}
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Selected station modal */}
        {selectedStation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedStation.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedStation.isLive && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Live Station</Badge>
                      )}
                      <Badge className={`text-xs ${
                        selectedStation.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStation.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedStation.address}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>{selectedStation.chargingSpeedKw}kW</span>
                  </div>
                  <div>
                    <span className="font-semibold">₹{selectedStation.pricePerKwh?.toFixed(2)}/kWh</span>
                  </div>
                  {selectedStation.distance && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Distance: {selectedStation.distance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                {selectedStation.connectorTypes && selectedStation.connectorTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Connector Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStation.connectorTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStation.rating && (
                  <div className="flex items-center gap-1 text-sm mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{selectedStation.rating.average?.toFixed(1) || 'N/A'}</span>
                    <span className="text-gray-500">({selectedStation.rating.count || 0} reviews)</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (onStationSelect) onStationSelect(selectedStation);
                      setSelectedStation(null);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => getDirections(selectedStation)}
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Station count info */}
      <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
        <div>
          Showing {filteredStations.length} stations within {userLocation ? '25km' : 'Pune area'}
        </div>
        <div className="flex items-center gap-4">
          <span>{filteredStations.filter(s => s.isLive).length} live stations</span>
          <span>{filteredStations.filter(s => s.isAvailable).length} available</span>
        </div>
      </div>
    </div>
  );
}
