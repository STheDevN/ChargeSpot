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

// Enhanced HTTP GET function with timeout
function httpGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(timeout, () => {
      request.destroy();
      reject(new Error('Request timeout'));
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

// Enhanced function to fetch OCM stations with multiple regions
async function fetchOCMStations(options = {}) {
  const {
    countryCode = 'US',
    maxResults = 200,
    boundingBox = null,
    levelId = null, // Filter by charging level
    minPowerKW = null
  } = options;
  
  console.log(`Fetching stations from Open Charge Map for ${countryCode}...`);
  
  let url = `https://api.openchargemap.io/v3/poi?output=json&countrycode=${countryCode}&maxresults=${maxResults}&compact=true&verbose=false`;
  
  if (boundingBox) {
    url += `&boundingbox=${boundingBox}`;
  }
  
  if (levelId) {
    url += `&levelid=${levelId}`;
  }
  
  if (minPowerKW) {
    url += `&minpowerkw=${minPowerKW}`;
  }
  
  // Add API key if available
  if (process.env.OCM_API_KEY) {
    url += `&key=${process.env.OCM_API_KEY}`;
  }
  
  try {
    const data = await httpGet(url, 15000);
    console.log(`✓ Fetched ${data.length} stations for ${countryCode}`);
    return data;
  } catch (error) {
    console.error(`✗ Error fetching from OCM for ${countryCode}:`, error.message);
    return [];
  }
}

// Enhanced connector type mapping
function mapConnectorType(connectionTypeId) {
  const typeMap = {
    1: 'Type 1',      // J1772
    2: 'CHAdeMO',
    25: 'Type 2',     // Mennekes (IEC 62196-2)
    32: 'CCS',        // CCS Type 1 (SAE Combo)
    33: 'CCS',        // CCS Type 2 (Mennekes Combo)
    8: 'Tesla Supercharger',
    27: 'Tesla Supercharger',
    1036: 'Type 2',   // IEC 62196-2 Type 2
    30: 'CHAdeMO'
  };
  return typeMap[connectionTypeId] || 'Type 2';
}

// Extract amenities from OCM data
function extractAmenities(ocmStation) {
  const amenities = [];
  const generalComments = (ocmStation.GeneralComments || '').toLowerCase();
  
  // Parking is usually available at charging stations
  amenities.push('Parking');
  
  // Check comments for amenity keywords
  if (generalComments.includes('wifi') || generalComments.includes('internet')) {
    amenities.push('WiFi');
  }
  if (generalComments.includes('restroom') || generalComments.includes('bathroom') || generalComments.includes('toilet')) {
    amenities.push('Restroom');
  }
  if (generalComments.includes('restaurant') || generalComments.includes('food') || generalComments.includes('cafe')) {
    amenities.push('Restaurant');
  }
  if (generalComments.includes('shopping') || generalComments.includes('mall') || generalComments.includes('store')) {
    amenities.push('Shopping');
  }
  if (generalComments.includes('coffee')) {
    amenities.push('Coffee Shop');
  }
  
  // Check operator info for chains that typically have amenities
  const operatorTitle = (ocmStation.OperatorInfo?.Title || '').toLowerCase();
  if (operatorTitle.includes('tesla')) {
    amenities.push('Security');
  }
  if (operatorTitle.includes('electrify america') || operatorTitle.includes('evgo')) {
    if (!amenities.includes('Security')) amenities.push('Security');
  }
  
  return [...new Set(amenities)]; // Remove duplicates
}

// Enhanced OCM to schema conversion
function convertOCMStation(ocmStation, ownerId) {
  try {
    const address = ocmStation.AddressInfo || {};
    const connections = ocmStation.Connections || [];
    
    if (!address.Latitude || !address.Longitude) {
      return null; // Skip stations without coordinates
    }
    
    // Extract connector types and count
    const connectorTypes = connections.map(conn => 
      mapConnectorType(conn.ConnectionType?.ID)
    );
    const uniqueConnectors = [...new Set(connectorTypes)];
    
    // Calculate total chargers (number of connections)
    const totalChargers = connections.reduce((sum, conn) => {
      return sum + (conn.Quantity || 1);
    }, 0);
    
    // Get max power across all connections
    const powerValues = connections
      .map(c => c.PowerKW || 0)
      .filter(p => p > 0);
    const maxPower = powerValues.length > 0 ? Math.max(...powerValues) : 7;
    
    // Determine station type based on max power
    let stationType = 'Standard';
    if (maxPower >= 150) stationType = 'Super Fast';
    else if (maxPower >= 50) stationType = 'Fast Charging';
    
    // Determine availability based on status
    const statusType = ocmStation.StatusType || {};
    const isOperational = statusType.IsOperational !== false;
    const isAvailable = isOperational && (statusType.ID === 50 || statusType.ID === 10); // 50=Operational, 10=Available
    
    // Calculate available chargers (assume 70-90% available if operational)
    const availableChargers = isOperational 
      ? Math.max(1, Math.floor(totalChargers * (0.7 + Math.random() * 0.2)))
      : 0;
    
    // Extract amenities
    const amenities = extractAmenities(ocmStation);
    
    // Determine pricing (OCM sometimes has UsageCost)
    let pricePerKwh = Math.random() * 0.3 + 0.15; // Default random price
    if (ocmStation.UsageCost) {
      const cost = parseFloat(ocmStation.UsageCost);
      if (!isNaN(cost) && cost > 0 && cost < 1) {
        pricePerKwh = cost;
      }
    }
    
    // Extract operating hours
    let operatingHours = '24/7';
    if (ocmStation.OperatorInfo?.IsRestrictedEdit) {
      operatingHours = 'Varies - Check with operator';
    }
    
    // Build station name
    let stationName = address.Title || 'EV Charging Station';
    if (ocmStation.OperatorInfo?.Title && !stationName.includes(ocmStation.OperatorInfo.Title)) {
      stationName = `${ocmStation.OperatorInfo.Title} - ${stationName}`;
    }
    
    return {
      name: stationName,
      description: `${stationType} charging station with ${totalChargers} charger(s) (${uniqueConnectors.join(', ')})`,
      address: `${address.AddressLine1 || ''} ${address.AddressLine2 || ''}`.trim() || 'Address not available',
      city: address.Town || address.StateOrProvince || 'Unknown City',
      state: address.StateOrProvince || address.Country?.Title || 'Unknown State',
      zipCode: address.Postcode || '00000',
      coordinates: {
        latitude: address.Latitude,
        longitude: address.Longitude
      },
      stationType: stationType,
      chargingSpeedKw: maxPower,
      connectorTypes: uniqueConnectors.length > 0 ? uniqueConnectors : ['Type 2'],
      pricePerKwh: pricePerKwh,
      operatingHours: operatingHours,
      amenities: amenities,
      contactInfo: {
        phone: ocmStation.OperatorInfo?.PhonePrimaryContact || 
               ocmStation.OperatorInfo?.ContactTelephone1 || '',
        website: ocmStation.OperatorInfo?.WebsiteURL || '',
        email: ocmStation.OperatorInfo?.ContactEmail || ''
      },
      owner: ownerId,
      isActive: true,
      isAvailable: isAvailable,
      status: 'approved',
      rating: {
        average: Math.random() * 1.5 + 3.5, // 3.5-5.0
        count: Math.floor(Math.random() * 50) + 5
      },
      features: {
        hasRestroom: amenities.includes('Restroom'),
        hasWiFi: amenities.includes('WiFi'),
        hasFood: amenities.includes('Restaurant') || amenities.includes('Coffee Shop'),
        hasShopping: amenities.includes('Shopping'),
        isAccessible: (ocmStation.GeneralComments || '').toLowerCase().includes('accessible') || 
                      (ocmStation.GeneralComments || '').toLowerCase().includes('wheelchair'),
        hasSecurity: amenities.includes('Security')
      },
      // OCM specific metadata (optional, can be stored for reference)
      ocmId: ocmStation.ID,
      ocmUUID: ocmStation.UUID,
      ocmDataProvider: ocmStation.DataProvider?.Title || 'Open Charge Map'
    };
  } catch (error) {
    console.error('Error converting station:', error.message);
    return null;
  }
}

async function importMultipleRegions() {
  console.log('🚀 Starting Enhanced Open Charge Map Import...\n');
  
  const ownerId = await createSampleOwner();
  let allStations = [];
  
  // Define regions to import
  const regions = [
    { countryCode: 'US', maxResults: 300, name: 'United States' },
    { countryCode: 'GB', maxResults: 200, name: 'United Kingdom' },
    { countryCode: 'DE', maxResults: 200, name: 'Germany' },
    { countryCode: 'NL', maxResults: 150, name: 'Netherlands' },
    { countryCode: 'NO', maxResults: 150, name: 'Norway' },
    { countryCode: 'IN', maxResults: 150, name: 'India' },
    { countryCode: 'CA', maxResults: 200, name: 'Canada' }
  ];
  
  for (const region of regions) {
    try {
      const ocmStations = await fetchOCMStations(region);
      
      if (ocmStations.length > 0) {
        console.log(`Converting ${ocmStations.length} stations for ${region.name}...`);
        
        const converted = ocmStations
          .map(station => convertOCMStation(station, ownerId))
          .filter(station => station !== null);
        
        console.log(`✓ Converted ${converted.length} valid stations for ${region.name}`);
        allStations = allStations.concat(converted);
      }
      
      // Rate limiting - wait between requests
      if (regions.indexOf(region) < regions.length - 1) {
        console.log('⏳ Waiting 2 seconds before next request...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`✗ Error importing ${region.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total stations to import: ${allStations.length}`);
  
  if (allStations.length > 0) {
    try {
      console.log('🗑️  Clearing existing stations...');
      await ChargingStation.deleteMany({});
      
      console.log('💾 Inserting new stations...');
      const batchSize = 100;
      for (let i = 0; i < allStations.length; i += batchSize) {
        const batch = allStations.slice(i, i + batchSize);
        await ChargingStation.insertMany(batch);
        console.log(`   Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allStations.length/batchSize)} inserted`);
      }
      
      console.log(`\n✅ Successfully imported ${allStations.length} stations from Open Charge Map!`);
      
      // Statistics
      const fastCharging = allStations.filter(s => s.stationType === 'Fast Charging').length;
      const superFast = allStations.filter(s => s.stationType === 'Super Fast').length;
      const standard = allStations.filter(s => s.stationType === 'Standard').length;
      
      console.log('\n📈 Station Statistics:');
      console.log(`   Super Fast: ${superFast}`);
      console.log(`   Fast Charging: ${fastCharging}`);
      console.log(`   Standard: ${standard}`);
      
      return allStations.length;
      
    } catch (error) {
      console.error('❌ Error inserting stations to database:', error);
      throw error;
    }
  }
  
  return 0;
}

async function main() {
  try {
    const totalImported = await importMultipleRegions();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Stations Imported: ${totalImported}`);
    console.log('Data Source: Open Charge Map API');
    console.log('Status: ✅ Success');
    console.log('='.repeat(50));
    
    console.log('\n💡 Next Steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. View stations at: http://localhost:4321/stations');
    console.log('3. Test the interactive map and filters');
    console.log('\n📝 Note: For higher rate limits, get a free API key from:');
    console.log('   https://openchargemap.org/site/develop/api');
    console.log('   Add it to .env as: OCM_API_KEY=your_key_here\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Verify MongoDB is running');
    console.log('3. Try again in a few minutes (API rate limiting)');
    console.log('4. Check if OCM API is accessible: https://api.openchargemap.io');
    process.exit(1);
  }
}

main();
