const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCreateStation() {
  try {
    console.log('Creating sample owner...');
    
    // Create a sample owner
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
    
    console.log('Creating test station...');
    
    // Create a simple test station
    const testStation = {
      name: 'Test Charging Station',
      description: 'A test charging station',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      stationType: 'Fast Charging',
      chargingSpeedKw: 150,
      connectorTypes: ['Type 2', 'CCS'],
      pricePerKwh: 0.25,
      operatingHours: '24/7',
      amenities: ['WiFi', 'Restroom'],
      contactInfo: {
        phone: '+1-555-1234',
        website: 'https://example.com'
      },
      owner: owner._id,
      isActive: true,
      isAvailable: true,
      status: 'approved',
      rating: {
        average: 4.5,
        count: 10
      },
      features: {
        hasRestroom: true,
        hasWiFi: true,
        hasFood: false,
        hasShopping: false,
        isAccessible: true,
        hasSecurity: true
      }
    };
    
    const station = new ChargingStation(testStation);
    await station.save();
    
    console.log('Test station created successfully!');
    console.log('Station ID:', station._id);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error creating test station:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    process.exit(1);
  }
}

testCreateStation();
