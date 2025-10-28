// Simple smoke test for backend endpoints
// Run with: node smoke-test.js

const http = require('http');

async function request(method, path, body, token) {
  const url = `http://localhost:5000${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

(async () => {
  try {
    // Health
    const health = await request('GET', '/api/health');
    console.log('HEALTH', health.status, health.json && health.json.status);

    // Register (ignore if already exists)
    const email = `smoke.${Date.now()}@example.com`;
    const register = await request('POST', '/api/auth/register', {
      email,
      password: 'secret12',
      firstName: 'Smoke',
      lastName: 'Test'
    });
    console.log('REGISTER', register.status);

    // Login
    const login = await request('POST', '/api/auth/login', {
      email,
      password: 'secret12'
    });
    console.log('LOGIN', login.status);
    const token = login.json && login.json.token;

    // Stations list (basic)
    const stations = await request('GET', '/api/stations?limit=3');
    console.log('STATIONS', stations.status, Array.isArray(stations.json?.stations) ? stations.json.stations.length : 'n/a');

    // Bookings list (alias)
    const myBookings = await request('GET', '/api/bookings', undefined, token);
    console.log('BOOKINGS', myBookings.status);

    // Rental units listing (non-demo)
    const rentalUnits = await request('GET', '/api/rental-units?limit=3');
    console.log('RENTAL_UNITS', rentalUnits.status, Array.isArray(rentalUnits.json?.rentalUnits) ? rentalUnits.json.rentalUnits.length : 'n/a');

    // Maps nearby alias (requires lat/lng - use 18.5204,73.8567 Pune)
    const nearby = await request('GET', '/api/maps/nearby?lat=18.5204&lng=73.8567&radius=2');
    console.log('MAPS_NEARBY', nearby.status);

    console.log('SMOKE TEST COMPLETE');
  } catch (e) {
    console.error('SMOKE TEST FAILED', e);
    process.exit(1);
  }
})();


