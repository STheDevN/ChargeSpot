import React, { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { MapPin, Zap, Navigation, Star } from 'lucide-react';

// Simple fallback map component that works without external dependencies
export default function SimpleMap({ 
  stations = [], 
  center = [18.5204, 73.8567], 
  zoom = 12,
  height = '400px',
  onStationSelect 
}) {
  const [selectedStation, setSelectedStation] = useState(null);

  // Always use the simple grid map to avoid Leaflet compatibility issues
  const MapComponent = () => {
    return <SimpleGridMap />;
  };

  // Simple grid-based map fallback
  const SimpleGridMap = () => {
    return (
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden"
        style={{ height }}
      >
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
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-800">Pune Charging Stations</h3>
          <p className="text-xs text-gray-600">{stations.length} stations available</p>
        </div>

        {/* Station markers */}
        <div className="absolute inset-0 p-4">
          {stations.slice(0, 8).map((station, index) => {
            // Position stations in a grid pattern
            const row = Math.floor(index / 3);
            const col = index % 3;
            const top = 20 + (row * 25);
            const left = 15 + (col * 30);

            return (
              <div
                key={station._id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ 
                  top: `${Math.min(top, 80)}%`, 
                  left: `${Math.min(left, 85)}%` 
                }}
                onClick={() => {
                  setSelectedStation(station);
                  if (onStationSelect) onStationSelect(station);
                }}
              >
                {/* Station marker */}
                <div className={`w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                  station.isAvailable 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}>
                  <Zap className="w-4 h-4 text-white" />
                </div>

                {/* Station tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] border">
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">
                      {station.name || station.stationName}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {station.address}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-500" />
                        {station.chargingSpeedKw}kW
                      </span>
                      <Badge className={`text-xs ${
                        station.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {station.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
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
          </div>
        </div>

        {/* Selected station details */}
        {selectedStation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4 z-10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{selectedStation.name || selectedStation.stationName}</h3>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedStation.address}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>{selectedStation.chargingSpeedKw}kW</span>
              </div>
              <div>
                <span className="font-semibold">₹{selectedStation.pricePerKwh}/kWh</span>
              </div>
            </div>

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
                onClick={() => {
                  const lat = selectedStation.coordinates?.latitude || selectedStation.latitude;
                  const lng = selectedStation.coordinates?.longitude || selectedStation.longitude;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
              >
                <Navigation className="w-3 h-3" />
                Directions
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return <MapComponent />;
}
