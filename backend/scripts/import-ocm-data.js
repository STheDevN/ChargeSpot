const mongoose = require('mongoose');
const fetch = require('node-fetch');
require('dotenv').config();

// Import models
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Open Charge Map API configuration
const OCM_API_BASE = 'https://api.openchargemap.io/v3/poi';
const OCM_API_KEY = process.env.OCM_API_KEY; // Optional, but recommended for higher rate limits

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mapping functions for OCM data to our schema
function mapConnectionType(ocmConnectionType) {
  const typeMap = {
    1: 'Type 1', // J1772
    2: 'CHAdeMO',
    25: 'Type 2', // Mennekes
    32: 'CCS', // CCS Type 1
    33: 'CCS', // CCS Type 2
    8: 'Tesla Supercharger',
    27: 'Tesla Supercharger'
  };
  return typeMap[ocmConnectionType?.ID] || 'Type 2';
}

function mapStationType(powerKW) {
  if (powerKW >= 150) return 'Super Fast';
  if (powerKW >= 50) return 'Fast Charging';
  return 'Standard';
}

function mapOperatorName(ocmOperator) {
  if (!ocmOperator) return 'Independent';
  return ocmOperator.Title || 'Unknown Operator';
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

async function fetchOCMStations(countryCode = null, maxResults = 1000, boundingBox = null) {
  console.log(`Fetching stations from Open Charge Map...`);
  
  const params = new URLSearchParams({
    output: 'json',
    maxresults: maxResults.toString(),
    compact: 'true',
    verbose: 'false'
  });
  
  if (OCM_API_KEY) {
    params.append('key', OCM_API_KEY);
  }
  
  if (countryCode) {
    params.append('countrycode', countryCode);
  }
  
  // Bounding box format: (latitude_from,longitude_from),(latitude_to,longitude_to)
  if (boundingBox) {
    params.append('boundingbox', boundingBox);
  }
  
  const url = `${OCM_API_BASE}?${params.toString()}`;
  console.log(`Fetching from: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OCM API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} stations from OCM`);
    return data;
  } catch (error) {
    console.error('Error fetching from OCM:', error);
    throw error;
  }
}

function convertOCMToOurSchema(ocmStation, ownerId) {
  try {
    // Extract connection info
    const connections = ocmStation.Connections || [];
    const connectorTypes = [...new Set(connections.map(conn => mapConnectionType(conn.ConnectionType)))];
    
    // Calculate max power
    const maxPowerKW = Math.max(...connections.map(conn => conn.PowerKW || 0).filter(p => p > 0), 7);
    
    // Extract address info
    const address = ocmStation.AddressInfo || {};
    
    // Map to our schema
    const station = {
      name: ocmStation.OperatorInfo?.Title 
        ? `${ocmStation.OperatorInfo.Title} - ${address.Title || 'Charging Station'}`
        : address.Title || 'EV Charging Station',
      description: `${mapStationType(maxPowerKW)} charging station with ${connections.length} connector(s)`,
      address: `${address.AddressLine1 || ''} ${address.AddressLine2 || ''}`.trim() || 'Address not available',
      city: address.Town || 'Unknown City',
      state: address.StateOrProvince || 'Unknown State',
      zipCode: address.Postcode || '00000',
      coordinates: {
        latitude: address.Latitude || 0,
        longitude: address.Longitude || 0
      },
      stationType: mapStationType(maxPowerKW),
      chargingSpeedKw: maxPowerKW,
      connectorTypes: connectorTypes.length > 0 ? connectorTypes : ['Type 2'],
      pricePerKwh: getRandomNumber(0.15, 0.45), // OCM doesn't always have pricing
      operatingHours: ocmStation.OperatorInfo?.BookingURL ? '24/7' : 'Varies',
      amenities: [], // OCM doesn't provide amenity data consistently
      contactInfo: {
        phone: ocmStation.OperatorInfo?.PhonePrimaryContact || '',
        website: ocmStation.OperatorInfo?.WebsiteURL || ''
      },
      owner: ownerId,
      isActive: true,
      isAvailable: ocmStation.StatusType?.IsOperational !== false,
      status: 'approved',
      rating: {
        average: getRandomNumber(3.5, 4.8),
        count: getRandomInt(5, 50)
      },
      features: {
        hasRestroom: Math.random() > 0.6,
        hasWiFi: Math.random() > 0.5,
        hasFood: Math.random() > 0.7,
        hasShopping: Math.random() > 0.8,
        isAccessible: ocmStation.GeneralComments?.toLowerCase().includes('accessible') || Math.random() > 0.7,
        hasSecurity: Math.random() > 0.6
      }
    };
    
    return station;
  } catch (error) {
    console.error('Error converting OCM station:', error);
    return null;
  }
}

async function importOCMStations(regions = []) {
  console.log('Starting OCM import...');
  
  const ownerId = await createSampleOwner();
  const allStations = [];
  
  // Default regions if none specified
  if (regions.length === 0) {
    regions = [
      { name: 'United States', countryCode: 'US', maxResults: 500 },
      { name: 'United Kingdom', countryCode: 'GB', maxResults: 300 },
      { name: 'Germany', countryCode: 'DE', maxResults: 300 },
      { name: 'Netherlands', countryCode: 'NL', maxResults: 200 },
      { name: 'Norway', countryCode: 'NO', maxResults: 200 },
      { name: 'India', countryCode: 'IN', maxResults: 200 }
    ];
  }
  
  for (const region of regions) {
    try {
      console.log(`\nFetching stations for ${region.name}...`);
      
      const ocmStations = await fetchOCMStations(
        region.countryCode, 
        region.maxResults, 
        region.boundingBox
      );
      
      console.log(`Converting ${ocmStations.length} stations for ${region.name}...`);
      
      const convertedStations = ocmStations
        .map(ocmStation => convertOCMToOurSchema(ocmStation, ownerId))
        .filter(station => station !== null && station.coordinates.latitude !== 0);
      
      console.log(`Successfully converted ${convertedStations.length} stations for ${region.name}`);
      allStations.push(...convertedStations);
      
      // Rate limiting - wait between requests
      if (regions.indexOf(region) < regions.length - 1) {
        console.log('Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`Error importing stations for ${region.name}:`, error);
    }
  }
  
  console.log(`\nTotal stations to import: ${allStations.length}`);
  
  if (allStations.length > 0) {
    try {
      // Clear existing stations
      await ChargingStation.deleteMany({});
      console.log('Cleared existing stations');
      
      // Insert in batches
      const batchSize = 100;
      for (let i = 0; i < allStations.length; i += batchSize) {
        const batch = allStations.slice(i, i + batchSize);
        await ChargingStation.insertMany(batch);
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allStations.length/batchSize)}`);
      }
      
      console.log(`\n✅ Successfully imported ${allStations.length} stations from Open Charge Map!`);
      return allStations.length;
      
    } catch (error) {
      console.error('Error inserting stations to database:', error);
      throw error;
    }
  }
  
  return 0;
}

async function main() {
  try {
    console.log('🚀 Starting Open Charge Map import...\n');
    
    // You can customize regions here
    const regions = [
      { name: 'United States (California)', countryCode: 'US', maxResults: 300, boundingBox: '32.5,-124.4,42.0,-114.1' },
      { name: 'United States (New York)', countryCode: 'US', maxResults: 200, boundingBox: '40.4,-79.8,45.0,-71.8' },
      { name: 'United Kingdom', countryCode: 'GB', maxResults: 300 },
      { name: 'Germany', countryCode: 'DE', maxResults: 300 },
      { name: 'Netherlands', countryCode: 'NL', maxResults: 200 },
      { name: 'India (Major Cities)', countryCode: 'IN', maxResults: 200 }
    ];
    
    const totalImported = await importOCMStations(regions);
    
    console.log('\n=== Import Summary ===');
    console.log(`Total Stations Imported: ${totalImported}`);
    console.log('Data Source: Open Charge Map API');
    console.log('Status: ✅ Success');
    console.log('======================\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Allow running with custom parameters
if (require.main === module) {
  main();
}

module.exports = { importOCMStations, fetchOCMStations };
