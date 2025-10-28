# Google Maps API Integration for EV Charging Station Finder

## 🎯 **What Google Maps API Adds to Your Project:**

### **Current Setup:**
- ✅ Open Charge Map API → Station data & locations
- ✅ Google Maps API → Enhanced features

### **Combined Power:**
OCM provides the charging station database, Google Maps enhances the user experience!

---

## 🚀 **Key Use Cases:**

### **1. Enhanced Interactive Map Display**
**Instead of:** Basic static map
**With Google Maps:**
- ✅ Interactive, zoomable maps
- ✅ Street view of charging stations
- ✅ Real-time traffic data
- ✅ Satellite/terrain views
- ✅ Custom markers for stations

### **2. Route Planning with Charging Stops**
**Feature:** Plan trips with charging station stops
```javascript
// Calculate route with charging stops
- User enters: Origin → Destination
- App finds: Charging stations along route
- Google Maps: Provides turn-by-turn directions
- Result: Optimized trip with charging breaks
```

### **3. Geocoding & Reverse Geocoding**
**Feature:** Convert addresses to coordinates and vice versa
```javascript
// User searches: "123 Main St, New York"
// Google Maps → Returns exact lat/lng
// Find nearest charging stations

// User clicks map location
// Google Maps → Returns address
// Search for stations nearby
```

### **4. Distance Matrix & ETA**
**Feature:** Calculate distance and time to each station
```javascript
// From user's location to each station:
- Distance: 2.3 miles
- Duration: 8 minutes
- Traffic: Moderate
```

### **5. Places API for Enhanced Amenities**
**Feature:** Get real amenity data for station locations
```javascript
// For each charging station location:
- Nearby restaurants (within 500m)
- Nearby restrooms (public facilities)
- Nearby shopping centers
- Photos of the location
- User reviews from Google
```

### **6. Autocomplete for Search**
**Feature:** Smart location search
```javascript
// User types: "Star"
// Autocomplete shows:
- Starbucks, 123 Main St
- Star Market, 456 Oak Ave
- Nearest charging stations
```

---

## 🔧 **Implementation Strategy:**

### **Backend Enhancements:**

#### **1. Geocoding Service**
```javascript
// services/geocoding.js
const axios = require('axios');

async function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await axios.get(url);
  if (response.data.status === 'OK') {
    const location = response.data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: response.data.results[0].formatted_address
    };
  }
  throw new Error('Geocoding failed');
}
```

#### **2. Nearby Places for Amenities**
```javascript
// services/places.js
async function getNearbyAmenities(latitude, longitude) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await axios.get(url);
  const amenities = {
    restaurants: [],
    restrooms: [],
    shopping: [],
    cafes: []
  };
  
  response.data.results.forEach(place => {
    if (place.types.includes('restaurant')) {
      amenities.restaurants.push(place.name);
    }
    if (place.types.includes('cafe')) {
      amenities.cafes.push(place.name);
    }
    if (place.types.includes('shopping_mall')) {
      amenities.shopping.push(place.name);
    }
  });
  
  return amenities;
}
```

#### **3. Distance Matrix for Nearest Stations**
```javascript
// services/distance.js
async function calculateDistances(origin, destinations) {
  const destString = destinations.map(d => `${d.lat},${d.lng}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destString}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await axios.get(url);
  return response.data.rows[0].elements.map((element, index) => ({
    station: destinations[index],
    distance: element.distance.text,
    duration: element.duration.text,
    distanceValue: element.distance.value // meters
  }));
}
```

#### **4. Route with Charging Stops**
```javascript
// services/route-planner.js
async function planRouteWithCharging(origin, destination, vehicleRange) {
  // 1. Get route from Google Directions API
  const route = await getDirections(origin, destination);
  
  // 2. Calculate charging stops needed
  const totalDistance = route.distance.value / 1000; // km
  const stopsNeeded = Math.ceil(totalDistance / vehicleRange);
  
  // 3. Find stations along route
  const chargingStops = await findStationsAlongRoute(route.polyline, stopsNeeded);
  
  return {
    route,
    chargingStops,
    totalDistance: route.distance.text,
    totalDuration: route.duration.text
  };
}
```

---

## 💻 **Frontend Enhancements:**

### **1. Enhanced Map Component**
```javascript
// components/ui/google-map.jsx
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

function EnhancedMap({ stations, center, onStationSelect }) {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '600px' }}
      >
        {stations.map(station => (
          <Marker
            key={station._id}
            position={{
              lat: station.coordinates.latitude,
              lng: station.coordinates.longitude
            }}
            icon={{
              url: getStationIcon(station.stationType),
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            onClick={() => onStationSelect(station)}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

### **2. Autocomplete Search**
```javascript
// components/ui/location-autocomplete.jsx
import { Autocomplete } from '@react-google-maps/api';

function LocationSearch({ onPlaceSelected }) {
  const [autocomplete, setAutocomplete] = useState(null);
  
  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      onPlaceSelected({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address
      });
    }
  };
  
  return (
    <Autocomplete
      onLoad={setAutocomplete}
      onPlaceChanged={handlePlaceChanged}
    >
      <Input placeholder="Search location..." />
    </Autocomplete>
  );
}
```

### **3. Route Planning Component**
```javascript
// components/pages/RoutePlannerPage.jsx
import { DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

function RoutePlanner() {
  const [directions, setDirections] = useState(null);
  const [chargingStops, setChargingStops] = useState([]);
  
  const planRoute = async (origin, destination) => {
    // Get route with charging stops
    const result = await fetch('/api/route/plan', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, vehicleRange: 300 })
    });
    
    const data = await result.json();
    setDirections(data.route);
    setChargingStops(data.chargingStops);
  };
  
  return (
    <GoogleMap>
      {directions && (
        <DirectionsRenderer directions={directions} />
      )}
      {chargingStops.map(stop => (
        <Marker position={stop.location} icon="/charging-icon.png" />
      ))}
    </GoogleMap>
  );
}
```

---

## 📦 **Required Packages:**

### **Backend:**
```bash
npm install axios
```

### **Frontend:**
```bash
npm install @react-google-maps/api
```

---

## 🔑 **API Keys Setup:**

### **1. Backend (.env):**
```bash
GOOGLE_MAPS_API_KEY=your_server_side_key_here
```

### **2. Frontend (.env):**
```bash
PUBLIC_GOOGLE_MAPS_API_KEY=your_client_side_key_here
```

**Note:** Use different keys for frontend/backend with appropriate restrictions:
- **Server-side key:** Restrict to your server IP
- **Client-side key:** Restrict to your domain(s)

---

## 🎯 **Google Maps APIs to Enable:**

In Google Cloud Console, enable these APIs:

1. ✅ **Maps JavaScript API** - For interactive maps
2. ✅ **Geocoding API** - For address to coordinates
3. ✅ **Places API** - For location search & amenities
4. ✅ **Distance Matrix API** - For distance calculations
5. ✅ **Directions API** - For route planning
6. ⚠️ **Optional: Street View Static API** - For station photos

---

## 💰 **Cost Considerations:**

### **Free Tier (Monthly):**
- Maps JavaScript API: $200 credit (~28,000 loads)
- Geocoding API: $200 credit (~40,000 requests)
- Places API: $200 credit (~varies)
- Distance Matrix: $200 credit (~40,000 elements)
- Directions API: $200 credit (~40,000 requests)

### **Optimization Tips:**
```javascript
// 1. Cache geocoding results
// 2. Batch distance calculations
// 3. Use session tokens for autocomplete
// 4. Implement request throttling
// 5. Cache directions for common routes
```

---

## 🚀 **Feature Priority:**

### **Phase 1 - Essential (Implement Now):**
1. ✅ Interactive map with station markers
2. ✅ Geocoding for address search
3. ✅ Distance calculation to stations

### **Phase 2 - Enhanced (Next):**
4. ✅ Autocomplete search
5. ✅ Nearby amenities for each station
6. ✅ Street view for station locations

### **Phase 3 - Advanced (Future):**
7. ✅ Route planning with charging stops
8. ✅ Real-time traffic data
9. ✅ Range anxiety calculator

---

## 🔄 **Integration with OCM Data:**

### **Best Approach:**

```javascript
// 1. Import stations from OCM
await importOCMStations();

// 2. Enhance with Google Maps data
for (const station of stations) {
  // Verify/improve address
  const geocoded = await geocodeAddress(station.address);
  
  // Get nearby amenities
  const amenities = await getNearbyAmenities(
    station.coordinates.latitude,
    station.coordinates.longitude
  );
  
  // Update station with enhanced data
  await updateStation(station._id, {
    verifiedAddress: geocoded.formattedAddress,
    nearbyPlaces: amenities
  });
}
```

---

## 📊 **Comparison:**

| Feature | OCM Only | Google Maps Only | OCM + Google Maps |
|---------|----------|------------------|-------------------|
| Station Database | ✅ Excellent | ❌ Limited | ✅✅ Best |
| Map Display | ⚠️ Basic | ✅ Excellent | ✅✅ Best |
| Charging Data | ✅ Accurate | ❌ None | ✅✅ Best |
| Amenities | ⚠️ Limited | ✅ Excellent | ✅✅ Best |
| Route Planning | ❌ None | ✅ Excellent | ✅✅ Best |
| Real-time Updates | ⚠️ Community | ✅ Excellent | ✅✅ Best |

**Recommendation: Use both for maximum value! 🎯**
