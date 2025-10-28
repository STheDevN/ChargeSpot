const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

// Cache for geocoding results to reduce API calls
const geocodeCache = new Map();

/**
 * Geocode an address to get coordinates
 */
async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }

  try {
    const url = `${BASE_URL}/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      
      const geocoded = {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        addressComponents: result.address_components
      };

      // Cache the result
      geocodeCache.set(address, geocoded);
      
      return geocoded;
    }

    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
async function reverseGeocode(latitude, longitude) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${BASE_URL}/geocode/json`;
    const response = await axios.get(url, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      return {
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components,
        placeId: result.place_id
      };
    }

    throw new Error(`Reverse geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    throw error;
  }
}

/**
 * Get nearby places (amenities) for a location
 */
async function getNearbyPlaces(latitude, longitude, radius = 500, types = []) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${BASE_URL}/place/nearbysearch/json`;
    const params = {
      location: `${latitude},${longitude}`,
      radius: radius,
      key: GOOGLE_MAPS_API_KEY
    };

    if (types.length > 0) {
      params.type = types.join('|');
    }

    const response = await axios.get(url, params);

    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      return {
        places: response.data.results.map(place => ({
          name: place.name,
          types: place.types,
          rating: place.rating,
          vicinity: place.vicinity,
          placeId: place.place_id,
          location: place.geometry.location
        })),
        status: response.data.status
      };
    }

    throw new Error(`Places search failed: ${response.data.status}`);
  } catch (error) {
    console.error('Nearby places error:', error.message);
    throw error;
  }
}

/**
 * Extract amenities from nearby places
 */
async function getStationAmenities(latitude, longitude) {
  try {
    const amenities = {
      hasRestroom: false,
      hasWiFi: false,
      hasFood: false,
      hasShopping: false,
      nearbyPlaces: {
        restaurants: [],
        cafes: [],
        shopping: [],
        parking: []
      }
    };

    // Search for nearby amenities
    const places = await getNearbyPlaces(latitude, longitude, 500);

    places.places.forEach(place => {
      // Restaurants
      if (place.types.includes('restaurant')) {
        amenities.hasFood = true;
        amenities.nearbyPlaces.restaurants.push(place.name);
      }
      
      // Cafes/Coffee shops
      if (place.types.includes('cafe') || place.types.includes('coffee_shop')) {
        amenities.hasFood = true;
        amenities.nearbyPlaces.cafes.push(place.name);
      }
      
      // Shopping
      if (place.types.includes('shopping_mall') || place.types.includes('store')) {
        amenities.hasShopping = true;
        amenities.nearbyPlaces.shopping.push(place.name);
      }
      
      // Parking
      if (place.types.includes('parking')) {
        amenities.nearbyPlaces.parking.push(place.name);
      }
    });

    return amenities;
  } catch (error) {
    console.error('Get station amenities error:', error.message);
    return null;
  }
}

/**
 * Calculate distance matrix between origin and multiple destinations
 */
async function getDistanceMatrix(origins, destinations, mode = 'driving') {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${BASE_URL}/distancematrix/json`;
    
    // Format origins and destinations
    const originsStr = Array.isArray(origins)
      ? origins.map(o => `${o.lat},${o.lng}`).join('|')
      : `${origins.lat},${origins.lng}`;
    
    const destStr = Array.isArray(destinations)
      ? destinations.map(d => `${d.lat},${d.lng}`).join('|')
      : `${destinations.lat},${destinations.lng}`;

    const response = await axios.get(url, {
      params: {
        origins: originsStr,
        destinations: destStr,
        mode: mode,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return {
        origins: response.data.origin_addresses,
        destinations: response.data.destination_addresses,
        rows: response.data.rows.map(row => ({
          elements: row.elements.map(element => ({
            distance: element.distance,
            duration: element.duration,
            status: element.status
          }))
        }))
      };
    }

    throw new Error(`Distance matrix failed: ${response.data.status}`);
  } catch (error) {
    console.error('Distance matrix error:', error.message);
    throw error;
  }
}

/**
 * Get directions between two points
 */
async function getDirections(origin, destination, waypoints = [], mode = 'driving') {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${BASE_URL}/directions/json`;
    
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: mode,
      key: GOOGLE_MAPS_API_KEY
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints.map(w => `${w.lat},${w.lng}`).join('|');
    }

    const response = await axios.get(url, params);

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps,
        polyline: route.overview_polyline.points
      };
    }

    throw new Error(`Directions failed: ${response.data.status}`);
  } catch (error) {
    console.error('Directions error:', error.message);
    throw error;
  }
}

/**
 * Calculate stations along a route
 */
async function findStationsAlongRoute(origin, destination, stations, maxDetour = 5000) {
  try {
    // Get the main route
    const mainRoute = await getDirections(origin, destination);
    
    // Filter stations that are within reasonable detour distance
    const stationsAlongRoute = [];
    
    for (const station of stations) {
      // Calculate route with station as waypoint
      const routeWithStation = await getDirections(
        origin,
        destination,
        [{ lat: station.coordinates.latitude, lng: station.coordinates.longitude }]
      );
      
      // Check if detour is acceptable
      const detourDistance = routeWithStation.distance.value - mainRoute.distance.value;
      
      if (detourDistance <= maxDetour) {
        stationsAlongRoute.push({
          station: station,
          detourDistance: detourDistance,
          detourDuration: routeWithStation.duration.value - mainRoute.duration.value
        });
      }
    }
    
    // Sort by least detour
    stationsAlongRoute.sort((a, b) => a.detourDistance - b.detourDistance);
    
    return stationsAlongRoute;
  } catch (error) {
    console.error('Find stations along route error:', error.message);
    throw error;
  }
}

/**
 * Get place details
 */
async function getPlaceDetails(placeId) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${BASE_URL}/place/details/json`;
    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,rating,formatted_address,geometry,photos,reviews,opening_hours',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }

    throw new Error(`Place details failed: ${response.data.status}`);
  } catch (error) {
    console.error('Place details error:', error.message);
    throw error;
  }
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getNearbyPlaces,
  getStationAmenities,
  getDistanceMatrix,
  getDirections,
  findStationsAlongRoute,
  getPlaceDetails
};
