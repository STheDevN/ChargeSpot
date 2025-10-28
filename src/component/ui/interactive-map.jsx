import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BaseCrudService } from '../../integrations/crud-service.js';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Zap, Clock, Star, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const availableIcon = createCustomIcon('#10b981'); // Green
const occupiedIcon = createCustomIcon('#ef4444'); // Red
const pendingIcon = createCustomIcon('#f59e0b'); // Yellow

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function InteractiveMap({ 
  stations = [], 
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  onStationSelect,
  height = '400px',
  showFilters = true
}) {
  const [filteredStations, setFilteredStations] = useState(stations);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Filter states
  const [filters, setFilters] = useState({
    availableOnly: false,
    stationType: '',
    minSpeed: '',
    maxPrice: ''
  });

  useEffect(() => {
    setFilteredStations(stations);
  }, [stations]);

  useEffect(() => {
    // Apply filters
    let filtered = stations;

    if (filters.availableOnly) {
      filtered = filtered.filter(station => station.isAvailable);
    }

    if (filters.stationType) {
      filtered = filtered.filter(station => station.stationType === filters.stationType);
    }

    if (filters.minSpeed) {
      filtered = filtered.filter(station => station.chargingSpeedKw >= parseInt(filters.minSpeed));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(station => station.pricePerKwh <= parseFloat(filters.maxPrice));
    }

    setFilteredStations(filtered);
  }, [stations, filters]);

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
        setMapCenter([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        alert('Unable to get your location. Please try again.');
      }
    );
  };

  const getStationIcon = (station) => {
    if (station.status === 'pending') return pendingIcon;
    return station.isAvailable ? availableIcon : occupiedIcon;
  };

  const handleStationClick = (station) => {
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  const uniqueStationTypes = [...new Set(stations.map(s => s.stationType).filter(Boolean))];

  return (
    <div className="w-full">
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available-only"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="available-only" className="text-sm font-medium">
                  Available only
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Type:</label>
                <select
                  value={filters.stationType}
                  onChange={(e) => setFilters({ ...filters, stationType: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="">All types</option>
                  {uniqueStationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Min Speed:</label>
                <select
                  value={filters.minSpeed}
                  onChange={(e) => setFilters({ ...filters, minSpeed: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="">Any</option>
                  <option value="7">7 kW+</option>
                  <option value="22">22 kW+</option>
                  <option value="50">50 kW+</option>
                  <option value="150">150 kW+</option>
                </select>
              </div>

              <Button
                onClick={getUserLocation}
                disabled={loading}
                size="sm"
                variant="outline"
                className="ml-auto"
              >
                {loading ? 'Getting location...' : 'Use My Location'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} zoom={zoom} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={createCustomIcon('#3b82f6')}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station markers */}
          {filteredStations.map((station) => (
            <Marker
              key={station._id}
              position={[station.coordinates?.latitude || station.latitude, station.coordinates?.longitude || station.longitude]}
              icon={getStationIcon(station)}
              eventHandlers={{
                click: () => handleStationClick(station)
              }}
            >
              <Popup>
                <div className="min-w-[250px]">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{station.name || station.stationName}</h3>
                      <Badge className={`${
                        station.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {station.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {station.address}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-500" />
                        <span>{station.chargingSpeedKw}kW</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">${station.pricePerKwh}/kWh</span>
                      </div>
                    </div>

                    {station.operatingHours && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{station.operatingHours}</span>
                      </div>
                    )}

                    {station.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{station.rating.average?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-500">({station.rating.count || 0} reviews)</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStationClick(station)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => {
                          const lat = station.coordinates?.latitude || station.latitude;
                          const lng = station.coordinates?.longitude || station.longitude;
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                        }}
                      >
                        <Navigation className="w-3 h-3" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available ({filteredStations.filter(s => s.isAvailable).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Occupied ({filteredStations.filter(s => !s.isAvailable).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pending ({filteredStations.filter(s => s.status === 'pending').length})</span>
          </div>
        </div>
        <div>
          Showing {filteredStations.length} of {stations.length} stations
        </div>
      </div>
    </div>
  );
}
