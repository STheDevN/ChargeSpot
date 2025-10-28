const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

// Import models
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple HTTP GET function using Node.js built-in modules
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function createSampleOwner() {
  console.log('Creating sample station owner...');
  
  let owner = await User.findOne({ email: 'owner@example.com' });
  
  if (!owner) {
    owner = new User({
      email: 'owner@example.com',
      password: 'hashedpassword123',
      firstName: 'Station',
      lastName: 'Owner',
      phone: '+1-555-0123',
      role: 'owner',
      isEmailVerified: true
    });
    
    await owner.save();
    console.log('Created sample owner user');
  }
  
  return owner._id;
}

async function fetchOCMSample() {
  console.log('Fetching sample stations from Open Charge Map...');
  
  // Sample request for US stations (limited to 100 for testing)
  const url = 'https://api.openchargemap.io/v3/poi?output=json&countrycode=US&maxresults=100&compact=true&verbose=false';
  
  try {
    const data = await httpGet(url);
    console.log(`Fetched ${data.length} sample stations`);
    return data;
  } catch (error) {
    console.error('Error fetching from OCM:', error);
    throw error;
  }
}

function convertOCMStation(ocmStation, ownerId) {
  try {
    const address = ocmStation.AddressInfo || {};
    const connections = ocmStation.Connections || [];
    
    // Get connector types
    const connectorTypes = connections.map(conn => {
      const typeId = conn.ConnectionType?.ID;
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
    });
    
    // Get max power
    const maxPower = Math.max(...connections.map(c => c.PowerKW || 0).filter(p => p > 0), 7);
    
    // Determine station type
    let stationType = 'Standard';
    if (maxPower >= 150) stationType = 'Super Fast';
    else if (maxPower >= 50) stationType = 'Fast Charging';
    
    return {
      name: address.Title || 'EV Charging Station',
      description: `${stationType} charging station with ${connections.length} connector(s)`,
      address: `${address.AddressLine1 || ''} ${address.AddressLine2 || ''}`.trim() || 'Address not available',
      city: address.Town || 'Unknown City',
      state: address.StateOrProvince || 'Unknown State',
      zipCode: address.Postcode || '00000',
      coordinates: {
        latitude: address.Latitude || 0,
        longitude: address.Longitude || 0
      },
      stationType: stationType,
      chargingSpeedKw: maxPower,
      connectorTypes: connectorTypes.length > 0 ? [...new Set(connectorTypes)] : ['Type 2'],
      pricePerKwh: Math.random() * 0.3 + 0.15, // Random price between $0.15-$0.45
      operatingHours: '24/7',
      amenities: ['Parking'],
      contactInfo: {
        phone: ocmStation.OperatorInfo?.PhonePrimaryContact || '',
        website: ocmStation.OperatorInfo?.WebsiteURL || ''
      },
      owner: ownerId,
      isActive: true,
      isAvailable: ocmStation.StatusType?.IsOperational !== false,
      status: 'approved',
      rating: {
        average: Math.random() * 1.5 + 3.5, // Random rating 3.5-5.0
        count: Math.floor(Math.random() * 50) + 5
      },
      features: {
        hasRestroom: Math.random() > 0.6,
        hasWiFi: Math.random() > 0.5,
        hasFood: Math.random() > 0.7,
        hasShopping: Math.random() > 0.8,
        isAccessible: Math.random() > 0.7,
        hasSecurity: Math.random() > 0.6
      }
    };
  } catch (error) {
    console.error('Error converting station:', error);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Open Charge Map sample import...\n');
    
    const ownerId = await createSampleOwner();
    
    console.log('Fetching stations from Open Charge Map API...');
    const ocmStations = await fetchOCMSample();
    
    console.log('Converting stations to our format...');
    const convertedStations = ocmStations
      .map(station => convertOCMStation(station, ownerId))
      .filter(station => station && station.coordinates.latitude !== 0);
    
    console.log(`Successfully converted ${convertedStations.length} stations`);
    
    if (convertedStations.length > 0) {
      console.log('Clearing existing stations...');
      await ChargingStation.deleteMany({});
      
      console.log('Inserting new stations...');
      await ChargingStation.insertMany(convertedStations);
      
      console.log(`\n✅ Successfully imported ${convertedStations.length} stations from Open Charge Map!`);
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Stations Imported: ${convertedStations.length}`);
    console.log('Data Source: Open Charge Map API (Sample)');
    console.log('Region: United States (100 stations)');
    console.log('======================\n');
    
    console.log('💡 To import more stations:');
    console.log('1. Get a free API key from https://openchargemap.org/site/develop/api');
    console.log('2. Add OCM_API_KEY to your .env file');
    console.log('3. Use the full import script for larger datasets');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB is running');
    console.log('3. Try again in a few minutes (API rate limiting)');
    process.exit(1);
  }
}

main();
