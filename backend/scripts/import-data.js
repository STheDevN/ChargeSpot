const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

// Import models
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');
const Review = require('../models/Review');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Helper function to generate random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Sample data arrays
const operators = ['EVgo', 'ChargePoint', 'Tesla', 'Electrify America', 'Greenlots', 'Blink', 'SemaConnect'];
const amenities = ['WiFi', 'Restroom', 'Coffee Shop', 'Restaurant', 'Shopping', 'Parking', 'Security'];
const connectorTypes = ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
const stationTypes = ['Fast Charging', 'Standard', 'Super Fast'];

async function createSampleOwner() {
  console.log('Creating sample station owner...');
  
  // Check if owner already exists
  let owner = await User.findOne({ email: 'owner@example.com' });
  
  if (!owner) {
    owner = new User({
      email: 'owner@example.com',
      password: 'hashedpassword123', // In real app, this would be properly hashed
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

async function importDetailedStations() {
  console.log('Importing detailed EV charging stations...');
  
  // Create sample owner first
  const ownerId = await createSampleOwner();
  
  const stations = [];
  const csvPath = path.join(__dirname, '../datasets/detailed_ev_charging_stations.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const chargingSpeed = parseInt(row['Charging Capacity (kW)']) || getRandomInt(50, 350);
          const stationType = chargingSpeed >= 150 ? 'Super Fast' : chargingSpeed >= 50 ? 'Fast Charging' : 'Standard';
          
          const station = {
            name: `${getRandomElement(operators)} Station - ${row['Station ID']?.slice(-5) || 'Unknown'}`,
            description: `${row['Charger Type']} charging station with ${chargingSpeed}kW capacity`,
            address: row['Address'] || 'Address not available',
            city: row['Address']?.split(',')[1]?.trim() || 'Unknown City',
            state: row['Address']?.split(',')[2]?.trim() || 'Unknown State',
            zipCode: getRandomInt(10000, 99999).toString(),
            coordinates: {
              latitude: parseFloat(row['Latitude']) || getRandomNumber(25, 45),
              longitude: parseFloat(row['Longitude']) || getRandomNumber(-125, -70)
            },
            stationType: stationType,
            chargingSpeedKw: chargingSpeed,
            connectorTypes: row['Connector Types']?.split(',').map(c => c.trim().replace('Tesla', 'Tesla Supercharger')) || [getRandomElement(connectorTypes)],
            pricePerKwh: parseFloat(row['Cost (USD/kWh)']) || getRandomNumber(0.15, 0.50),
            
            operatingHours: row['Availability'] || '24/7',
            amenities: amenities.slice(0, getRandomInt(2, 5)),
            contactInfo: {
              phone: `+1-${getRandomInt(200, 999)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
              website: `https://${row['Station Operator']?.toLowerCase().replace(/\s+/g, '') || 'example'}.com`
            },
            owner: ownerId,
            isActive: true,
            isAvailable: Math.random() > 0.2, // 80% available
            status: 'approved',
            rating: {
              average: parseFloat(row['Reviews (Rating)']) || getRandomNumber(3.5, 5.0),
              count: getRandomInt(5, 100)
            },
            features: {
              hasRestroom: Math.random() > 0.4,
              hasWiFi: Math.random() > 0.5,
              hasFood: Math.random() > 0.3,
              hasShopping: Math.random() > 0.4,
              isAccessible: Math.random() > 0.7,
              hasSecurity: Math.random() > 0.6
            }
          };
          
          stations.push(station);
        } catch (error) {
          console.error('Error processing row:', error.message);
        }
      })
      .on('end', async () => {
        try {
          // Clear existing stations
          await ChargingStation.deleteMany({});
          console.log('Cleared existing stations');
          
          // Insert new stations in batches
          const batchSize = 100;
          for (let i = 0; i < stations.length; i += batchSize) {
            const batch = stations.slice(i, i + batchSize);
            await ChargingStation.insertMany(batch);
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stations.length/batchSize)}`);
          }
          
          console.log(`Successfully imported ${stations.length} charging stations`);
          resolve(stations.length);
        } catch (error) {
          console.error('Error inserting stations:', error.message);
          if (error.errors) {
            Object.keys(error.errors).forEach(key => {
              console.error(`Validation error for ${key}:`, error.errors[key].message);
            });
          }
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function importIndianStations() {
  console.log('Importing Indian EV charging stations...');
  
  // Get the owner ID
  const ownerId = await createSampleOwner();
  
  const stations = [];
  const csvPath = path.join(__dirname, '../datasets/ev-charging-stations-india.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const chargingSpeed = parseInt(row['type']) === 12 ? getRandomInt(50, 150) : getRandomInt(7, 22);
          const stationType = chargingSpeed >= 150 ? 'Super Fast' : chargingSpeed >= 50 ? 'Fast Charging' : 'Standard';
          
          const station = {
            name: row['name'] || 'Unnamed Station',
            description: `EV charging station in ${row['city']}, ${row['state']}`,
            address: row['address'] || 'Address not available',
            city: row['city'] || 'Unknown City',
            state: row['state'] || 'Unknown State',
            zipCode: getRandomInt(100000, 999999).toString(),
            coordinates: {
              latitude: parseFloat(row['lattitude']) || getRandomNumber(8, 37),
              longitude: parseFloat(row['longitude']) || getRandomNumber(68, 97)
            },
            stationType: stationType,
            chargingSpeedKw: chargingSpeed,
            connectorTypes: parseInt(row['type']) === 12 ? ['CCS', 'CHAdeMO'] : ['Type 2'],
            pricePerKwh: getRandomNumber(8, 15), // INR per kWh
            
            operatingHours: '24/7',
            amenities: amenities.slice(0, getRandomInt(1, 4)),
            contactInfo: {
              phone: `+91-${getRandomInt(70000, 99999)}-${getRandomInt(10000, 99999)}`,
              website: 'https://example.com'
            },
            owner: ownerId,
            isActive: true,
            isAvailable: Math.random() > 0.15, // 85% available
            status: 'approved',
            rating: {
              average: getRandomNumber(3.2, 4.8),
              count: getRandomInt(2, 50)
            },
            features: {
              hasRestroom: Math.random() > 0.5,
              hasWiFi: Math.random() > 0.6,
              hasFood: Math.random() > 0.4,
              hasShopping: Math.random() > 0.3,
              isAccessible: Math.random() > 0.8,
              hasSecurity: Math.random() > 0.5
            }
          };
          
          stations.push(station);
        } catch (error) {
          console.error('Error processing Indian station row:', error);
        }
      })
      .on('end', async () => {
        try {
          // Insert Indian stations (append to existing)
          const batchSize = 50;
          for (let i = 0; i < stations.length; i += batchSize) {
            const batch = stations.slice(i, i + batchSize);
            await ChargingStation.insertMany(batch);
            console.log(`Inserted Indian batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stations.length/batchSize)}`);
          }
          
          console.log(`Successfully imported ${stations.length} Indian charging stations`);
          resolve(stations.length);
        } catch (error) {
          console.error('Error inserting Indian stations:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function createSampleUsers() {
  console.log('Creating sample users for reviews...');
  
  const users = [];
  for (let i = 1; i <= 20; i++) {
    users.push({
      email: `user${i}@example.com`,
      password: 'hashedpassword123',
      firstName: `User${i}`,
      lastName: 'Reviewer',
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      role: 'user',
      isEmailVerified: true
    });
  }
  
  // Clear existing users and insert new ones
  await User.deleteMany({ role: 'user' });
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} sample users`);
  
  return createdUsers;
}

async function createSampleReviews() {
  console.log('Creating sample reviews...');
  
  const stations = await ChargingStation.find().limit(50);
  const users = await createSampleUsers();
  const reviews = [];
  
  const reviewTexts = [
    "Great charging station with fast speeds and clean facilities.",
    "Easy to use and conveniently located. Highly recommended!",
    "Good charging speed but could use better lighting at night.",
    "Excellent service and the staff was very helpful.",
    "Clean restrooms and good WiFi. Will definitely come back.",
    "Charging was slower than expected but location is convenient.",
    "Perfect for long trips. Fast charging and good amenities.",
    "Well maintained station with clear instructions.",
    "Great location near restaurants and shopping.",
    "Reliable charging station, never had any issues."
  ];
  
  const reviewTitles = [
    "Excellent Experience",
    "Great Service",
    "Good Location",
    "Fast Charging",
    "Clean Facilities",
    "Convenient Stop",
    "Reliable Station",
    "Well Maintained",
    "Highly Recommended",
    "Perfect for Travel"
  ];
  
  for (const station of stations) {
    const numReviews = getRandomInt(2, 8);
    
    for (let i = 0; i < numReviews; i++) {
      const rating = getRandomInt(3, 5);
      const user = getRandomElement(users);
      
      const review = {
        user: user._id,
        station: station._id,
        rating: rating,
        title: getRandomElement(reviewTitles),
        comment: getRandomElement(reviewTexts),
        isRecommended: rating >= 4,
        helpfulVotes: getRandomInt(0, 15),
        isVerified: Math.random() > 0.7,
        isModerated: true,
        moderationStatus: 'approved'
      };
      
      reviews.push(review);
    }
  }
  
  await Review.deleteMany({});
  await Review.insertMany(reviews);
  console.log(`Created ${reviews.length} sample reviews`);
  
  return reviews.length;
}

async function main() {
  try {
    console.log('Starting data import...');
    
    // Import detailed stations
    const detailedCount = await importDetailedStations();
    
    // Import Indian stations
    const indianCount = await importIndianStations();
    
    // Create sample reviews
    const reviewCount = await createSampleReviews();
    
    console.log('\n=== Import Summary ===');
    console.log(`Detailed Stations: ${detailedCount}`);
    console.log(`Indian Stations: ${indianCount}`);
    console.log(`Total Stations: ${detailedCount + indianCount}`);
    console.log(`Sample Reviews: ${reviewCount}`);
    console.log('======================\n');
    
    console.log('Data import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the import
main();
