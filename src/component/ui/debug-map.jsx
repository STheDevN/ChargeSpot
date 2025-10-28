import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { MapPin, Zap, Navigation, Star, Loader2 } from 'lucide-react';

// Debug map component that always shows stations
export default function DebugMap({ height = '500px', onStationSelect }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // Hardcoded stations that will always work
  const hardcodedStations = [
    {
      id: 'debug-1',
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
      id: 'debug-2',
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
    },
    {
      id: 'debug-3',
      name: 'EcoCharge Point - Hinjewadi',
      address: 'Phase 1, Hinjewadi, Pune',
      lat: 18.5912,
      lng: 73.7389,
      chargingSpeedKw: 50,
      isAvailable: false,
      pricePerKwh: 8,
      source: 'demo',
      isLive: false,
      rating: { average: 4.0, count: 15 }
    },
    {
      id: 'debug-4',
      name: 'QuickCharge Station - Wakad',
      address: 'Wakad Main Road, Near Dange Chowk, Pune',
      lat: 18.5975,
      lng: 73.7898,
      chargingSpeedKw: 120,
      isAvailable: true,
      pricePerKwh: 15,
      source: 'demo',
      isLive: false,
      rating: { average: 4.7, count: 31 }
    },
    {
      id: 'debug-5',
      name: 'ElectroHub - Kharadi',
      address: 'EON IT Park Road, Kharadi, Pune',
      lat: 18.5515,
      lng: 73.9475,
      chargingSpeedKw: 75,
      isAvailable: true,
      pricePerKwh: 11,
      source: 'demo',
      isLive: false,
      rating: { average: 4.3, count: 27 }
    }
  ];

  useEffect(() => {
    // Simulate loading and then show hardcoded stations
    const timer = setTimeout(() => {
      setStations(hardcodedStations);
      setLoading(false);
      console.log('Debug map loaded with', hardcodedStations.length, 'stations');
    }, 1000);

    return () => clearTimeout(timer);
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
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border"
        style={{ height }}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Loading debug stations...</p>
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
          <h3 className="font-semibold text-sm text-gray-800">Debug Map - Pune Stations</h3>
          <p className="text-xs text-gray-600">{stations.length} demo stations loaded</p>
        </div>

        {/* Station markers */}
        <div className="absolute inset-0 p-4">
          {stations.map((station, index) => {
            // Position stations in a spread pattern
            const positions = [
              { top: '25%', left: '30%' }, // Koregaon Park
              { top: '20%', left: '60%' }, // Baner
              { top: '15%', left: '45%' }, // Hinjewadi
              { top: '35%', left: '70%' }, // Wakad
              { top: '45%', left: '80%' }  // Kharadi
            ];
            
            const position = positions[index] || { top: '50%', left: '50%' };

            return (
              <div
                key={station.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{ 
                  top: position.top, 
                  left: position.left 
                }}
                onClick={() => handleStationClick(station)}
              >
                {/* Station marker */}
                <div className={`relative w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-125 ${
                  station.isAvailable 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}>
                  <Zap className="w-4 h-4 text-white" />
                </div>

                {/* Station tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-white rounded-lg shadow-lg p-3 min-w-[220px] border">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">
                      {station.name}
                    </h4>
                    
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
                        ₹{station.pricePerKwh}/kWh
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
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{station.rating.average}</span>
                      </div>
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
              <span>Available ({stations.filter(s => s.isAvailable).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Occupied ({stations.filter(s => !s.isAvailable).length})</span>
            </div>
          </div>
        </div>

        {/* Selected station modal */}
        {selectedStation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedStation.name}</h3>
                    <Badge className={`text-xs mt-1 ${
                      selectedStation.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStation.isAvailable ? 'Available' : 'Occupied'}
                    </Badge>
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
                    <span className="font-semibold">₹{selectedStation.pricePerKwh}/kWh</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm mb-4">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{selectedStation.rating.average}</span>
                  <span className="text-gray-500">({selectedStation.rating.count} reviews)</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (onStationSelect) onStationSelect(selectedStation);
                      setSelectedStation(null);
                    }}
                  >
                    Book Slot
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
          Showing {stations.length} demo stations in Pune
        </div>
        <div className="flex items-center gap-4">
          <span>{stations.filter(s => s.isAvailable).length} available</span>
          <span>{stations.filter(s => !s.isAvailable).length} occupied</span>
        </div>
      </div>
    </div>
  );
}
