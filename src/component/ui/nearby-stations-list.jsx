import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { MapPin, Zap, Navigation, Star, Loader2 } from 'lucide-react';

export default function NearbyStationsList({ 
  userLocation = null,
  maxStations = 10,
  onStationSelect 
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch nearby stations
  const fetchNearbyStations = async (lat = 18.5204, lng = 73.8567) => {
    setLoading(true);
    
    try {
      const allStations = [];

      // 1. Fetch demo stations
      try {
        const demoResponse = await fetch('http://localhost:5000/api/demo/stations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          const demoStations = (demoData.stations || []).map(station => ({
            ...station,
            source: 'demo',
            id: station._id,
            lat: station.coordinates?.latitude || station.latitude,
            lng: station.coordinates?.longitude || station.longitude,
            isLive: false
          }));
          allStations.push(...demoStations);
        }
      } catch (err) {
        console.error('Demo stations not available:', err);
        // Add fallback data
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
            isLive: false,
            rating: { average: 4.5, count: 23 }
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
            isLive: false,
            rating: { average: 4.2, count: 18 }
          }
        ];
        allStations.push(...fallbackStations);
      }

      // 2. Fetch live stations from Open Charge Map (limited for sidebar)
      try {
        const ocmUrl = `https://api.openchargemap.io/v3/poi?output=json&latitude=${lat}&longitude=${lng}&distance=15&maxresults=20&compact=true&verbose=false`;
        
        const ocmResponse = await fetch(ocmUrl);
        if (ocmResponse.ok) {
          const ocmData = await ocmResponse.json();
          const ocmStations = ocmData.slice(0, 10).map(station => {
            const address = station.AddressInfo || {};
            const connections = station.Connections || [];
            
            const maxPower = Math.max(...connections.map(c => c.PowerKW || 0).filter(p => p > 0), 7);
            
            let stationType = 'Standard';
            if (maxPower >= 150) stationType = 'Super Fast';
            else if (maxPower >= 50) stationType = 'Fast Charging';
            
            return {
              id: `ocm-${station.ID}`,
              name: address.Title || 'EV Charging Station',
              address: `${address.AddressLine1 || ''} ${address.AddressLine2 || ''}`.trim() || 'Address not available',
              city: address.Town || 'Unknown City',
              lat: address.Latitude,
              lng: address.Longitude,
              chargingSpeedKw: maxPower,
              stationType: stationType,
              isAvailable: station.StatusType?.IsOperational !== false,
              pricePerKwh: Math.random() * 0.3 + 0.15,
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

      // Calculate distances and sort
      if (lat && lng) {
        allStations.forEach(station => {
          station.distance = calculateDistance(lat, lng, station.lat, station.lng);
        });
        
        allStations.sort((a, b) => a.distance - b.distance);
      }

      setStations(allStations.slice(0, maxStations));
      
    } catch (err) {
      console.error('Error fetching nearby stations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two points
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

  // Fetch stations when location changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyStations(userLocation[0], userLocation[1]);
    } else {
      fetchNearbyStations(); // Default to Pune
    }
  }, [userLocation]);

  const getDirections = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-semibold flex items-center justify-between">
          Nearby Stations
          <Loader2 className="w-4 h-4 animate-spin" />
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white border-brandaccent/20 p-4 animate-pulse">
              <CardContent className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xl font-semibold flex items-center justify-between">
        Nearby Stations ({stations.length})
        {userLocation && (
          <span className="text-sm font-normal text-gray-500">Within 15km</span>
        )}
      </h3>
      
      {stations.length === 0 ? (
        <Card className="bg-white border-brandaccent/20 text-center py-12 px-6">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <MapPin className="w-12 h-12 text-secondary/30" />
            <p className="font-paragraph text-secondary/70">No charging stations found nearby.</p>
            <Button 
              size="sm" 
              onClick={() => fetchNearbyStations()}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {stations.map((station) => (
            <Card key={station.id} className="bg-white border-brandaccent/20 p-4 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-heading text-sm font-semibold pr-2 leading-tight">
                    {station.name || station.stationName}
                  </h4>
                  <div className="flex flex-col gap-1">
                    {station.isLive && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Live</Badge>
                    )}
                    <Badge className={`text-xs ${
                      station.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.isAvailable ? 'Available' : 'Occupied'}
                    </Badge>
                  </div>
                </div>
                
                <p className="font-paragraph text-xs text-secondary/70 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> 
                  <span className="truncate">{station.address}</span>
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-medium">{station.chargingSpeedKw}kW</span>
                    </div>
                    {station.distance && (
                      <span className="text-gray-500">{station.distance.toFixed(1)}km</span>
                    )}
                  </div>
                  <span className="font-medium">₹{station.pricePerKwh?.toFixed(2)}/kWh</span>
                </div>

                {station.rating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>{station.rating.average?.toFixed(1)}</span>
                    <span className="text-gray-500">({station.rating.count})</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      if (onStationSelect) onStationSelect(station);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-xs h-8 px-2"
                    onClick={() => getDirections(station)}
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {stations.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          {stations.filter(s => s.isLive).length} live stations • {stations.filter(s => s.isAvailable).length} available now
        </div>
      )}
    </div>
  );
}
