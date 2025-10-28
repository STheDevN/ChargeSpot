const express = require('express');
const router = express.Router();
const {
  geocodeAddress,
  reverseGeocode,
  getNearbyPlaces,
  getStationAmenities,
  getDistanceMatrix,
  getDirections,
  findStationsAlongRoute
} = require('../services/googleMaps');
const ChargingStation = require('../models/ChargingStation');
const { optionalAuth } = require('../middleware/auth');
// PRD alias: GET /api/maps/nearby?lat=&lng=&radius=
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    // Reuse search-nearby logic
    const origin = { lat: parseFloat(lat), lng: parseFloat(lng) };
    req.body = { latitude: origin.lat, longitude: origin.lng, radius: parseFloat(radius) };
    req.method = 'POST';
    req.url = '/search-nearby';
    return router.handle(req, res);
  } catch (e) {
    console.error('Nearby alias error:', e);
    return res.status(500).json({ error: 'Failed to fetch nearby stations' });
  }
});


// Geocode an address
router.post('/geocode', optionalAuth, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const result = await geocodeAddress(address);
    res.json(result);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Reverse geocode coordinates
router.post('/reverse-geocode', optionalAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const result = await reverseGeocode(latitude, longitude);
    res.json(result);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

// Get nearby amenities for a location
router.get('/nearby-places', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 500, types } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const typesArray = types ? types.split(',') : [];
    const result = await getNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      typesArray
    );
    
    res.json(result);
  } catch (error) {
    console.error('Nearby places error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

// Get station amenities using Google Maps
router.get('/station/:stationId/amenities', optionalAuth, async (req, res) => {
  try {
    const { stationId } = req.params;
    
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    const amenities = await getStationAmenities(
      station.coordinates.latitude,
      station.coordinates.longitude
    );
    
    res.json(amenities);
  } catch (error) {
    console.error('Station amenities error:', error);
    res.status(500).json({ error: 'Failed to fetch station amenities' });
  }
});

// Calculate distances from user location to multiple stations
router.post('/distance-matrix', optionalAuth, async (req, res) => {
  try {
    const { origin, stationIds } = req.body;
    
    if (!origin || !origin.lat || !origin.lng) {
      return res.status(400).json({ error: 'Origin location is required' });
    }
    
    if (!stationIds || stationIds.length === 0) {
      return res.status(400).json({ error: 'Station IDs are required' });
    }
    
    // Fetch station coordinates
    const stations = await ChargingStation.find({ _id: { $in: stationIds } });
    const destinations = stations.map(s => ({
      lat: s.coordinates.latitude,
      lng: s.coordinates.longitude,
      stationId: s._id
    }));
    
    const matrix = await getDistanceMatrix(origin, destinations);
    
    // Combine with station data
    const results = matrix.rows[0].elements.map((element, index) => ({
      station: stations[index],
      distance: element.distance,
      duration: element.duration,
      status: element.status
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Distance matrix error:', error);
    res.status(500).json({ error: 'Failed to calculate distances' });
  }
});

// Get directions to a station
router.post('/directions', optionalAuth, async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    const directions = await getDirections(origin, destination, [], mode);
    res.json(directions);
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// Find stations along a route
router.post('/route/charging-stops', optionalAuth, async (req, res) => {
  try {
    const { origin, destination, vehicleRange = 300, maxDetour = 5000 } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    // Get main route
    const mainRoute = await getDirections(origin, destination);
    const totalDistance = mainRoute.distance.value / 1000; // Convert to km
    
    // Calculate how many charging stops needed
    const stopsNeeded = Math.max(0, Math.ceil(totalDistance / vehicleRange) - 1);
    
    if (stopsNeeded === 0) {
      return res.json({
        mainRoute,
        stopsNeeded: 0,
        message: 'No charging stops needed for this journey',
        chargingStops: []
      });
    }
    
    // Find all fast charging stations (for road trips)
    const stations = await ChargingStation.find({
      stationType: { $in: ['Fast Charging', 'Super Fast'] },
      isActive: true,
      isAvailable: true,
      status: 'approved'
    });
    
    // Find stations along the route
    const stationsAlongRoute = await findStationsAlongRoute(
      origin,
      destination,
      stations,
      maxDetour
    );
    
    // Select optimal charging stops (evenly distributed)
    const optimalStops = stationsAlongRoute.slice(0, stopsNeeded);
    
    res.json({
      mainRoute,
      stopsNeeded,
      chargingStops: optimalStops,
      totalStations: stationsAlongRoute.length
    });
  } catch (error) {
    console.error('Route charging stops error:', error);
    res.status(500).json({ error: 'Failed to find charging stops' });
  }
});

// Search stations by location with distance
router.post('/search-nearby', optionalAuth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    // Find stations within bounding box (approximate)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInDegrees = radius / 111; // Approximate km to degrees
    
    const stations = await ChargingStation.find({
      'coordinates.latitude': {
        $gte: lat - radiusInDegrees,
        $lte: lat + radiusInDegrees
      },
      'coordinates.longitude': {
        $gte: lng - radiusInDegrees,
        $lte: lng + radiusInDegrees
      },
      isActive: true,
      status: 'approved'
    }).limit(parseInt(limit));
    
    // Calculate exact distances using Distance Matrix API
    if (stations.length > 0) {
      const destinations = stations.map(s => ({
        lat: s.coordinates.latitude,
        lng: s.coordinates.longitude
      }));
      
      const matrix = await getDistanceMatrix(
        { lat, lng },
        destinations
      );
      
      // Add distance data to each station
      const stationsWithDistance = stations.map((station, index) => {
        const element = matrix.rows[0].elements[index];
        return {
          ...station.toObject(),
          distance: element.distance,
          duration: element.duration
        };
      });
      
      // Sort by distance
      stationsWithDistance.sort((a, b) => 
        a.distance.value - b.distance.value
      );
      
      res.json({ stations: stationsWithDistance });
    } else {
      res.json({ stations: [] });
    }
  } catch (error) {
    console.error('Search nearby error:', error);
    res.status(500).json({ error: 'Failed to search nearby stations' });
  }
});

module.exports = router;
