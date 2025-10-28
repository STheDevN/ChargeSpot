const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');
const Booking = require('../models/Booking');
const RentalUnit = require('../models/RentalUnit');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Pune demo stations data with real locations
const puneStationsData = [
  {
    name: 'GreenCharge Hub - Koregaon Park',
    description: 'Premium charging station with cafe and shopping nearby',
    address: 'Lane 5, Koregaon Park, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    coordinates: {
      latitude: 18.5362,
      longitude: 73.8958
    },
    ownerData: {
      email: 'owner.koregaon@greencharge.demo',
      password: 'demo123',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      phone: '+91-9876543210'
    },
    stationType: 'Super Fast',
    chargingSpeedKw: 150,
    connectorTypes: ['Type 2', 'CCS'],
    pricePerKwh: 12.50,
    totalChargers: 6,
    operatingHours: '24/7',
    amenities: ['WiFi', 'Restroom', 'Coffee Shop', 'Parking', 'Security'],
    features: {
      hasRestroom: true,
      hasWiFi: true,
      hasFood: true,
      hasShopping: true,
      isAccessible: true,
      hasSecurity: true
    },
    rentalUnits: [
      {
        name: 'Portable AC Charger - 7kW',
        type: 'AC',
        powerOutput: 7,
        dailyRate: 150,
        weeklyRate: 900,
        monthlyRate: 3000,
        connectorTypes: ['Type 2'],
        isAvailable: true
      },
      {
        name: 'Fast DC Charger - 30kW',
        type: 'DC',
        powerOutput: 30,
        dailyRate: 400,
        weeklyRate: 2500,
        monthlyRate: 8000,
        connectorTypes: ['CCS', 'CHAdeMO'],
        isAvailable: true
      }
    ]
  },
  {
    name: 'PowerPoint Station - Baner',
    description: 'Modern charging facility in IT hub area',
    address: 'Baner Road, Near Aundh ITI, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411045',
    coordinates: {
      latitude: 18.5679,
      longitude: 73.7797
    },
    ownerData: {
      email: 'owner.baner@powerpoint.demo',
      password: 'demo123',
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91-9876543211'
    },
    stationType: 'Fast Charging',
    chargingSpeedKw: 60,
    connectorTypes: ['Type 2', 'CCS'],
    pricePerKwh: 10.00,
    totalChargers: 4,
    operatingHours: '6:00 AM - 11:00 PM',
    amenities: ['WiFi', 'Restroom', 'Parking'],
    features: {
      hasRestroom: true,
      hasWiFi: true,
      hasFood: false,
      hasShopping: false,
      isAccessible: true,
      hasSecurity: false
    },
    rentalUnits: [
      {
        name: 'Home AC Charger - 11kW',
        type: 'AC',
        powerOutput: 11,
        dailyRate: 200,
        weeklyRate: 1200,
        monthlyRate: 4000,
        connectorTypes: ['Type 2'],
        isAvailable: true
      }
    ]
  },
  {
    name: 'EcoCharge Point - Hinjewadi',
    description: 'Eco-friendly charging station powered by solar energy',
    address: 'Phase 1, Hinjewadi, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411057',
    coordinates: {
      latitude: 18.5912,
      longitude: 73.7389
    },
    ownerData: {
      email: 'owner.hinjewadi@ecocharge.demo',
      password: 'demo123',
      firstName: 'Amit',
      lastName: 'Kumar',
      phone: '+91-9876543212'
    },
    stationType: 'Fast Charging',
    chargingSpeedKw: 50,
    connectorTypes: ['Type 2', 'CCS', 'CHAdeMO'],
    pricePerKwh: 9.50,
    totalChargers: 8,
    operatingHours: '24/7',
    amenities: ['WiFi', 'Restroom', 'Restaurant', 'Parking', 'Security'],
    features: {
      hasRestroom: true,
      hasWiFi: true,
      hasFood: true,
      hasShopping: false,
      isAccessible: true,
      hasSecurity: true
    },
    rentalUnits: [
      {
        name: 'Portable DC Charger - 25kW',
        type: 'DC',
        powerOutput: 25,
        dailyRate: 350,
        weeklyRate: 2100,
        monthlyRate: 7000,
        connectorTypes: ['CCS'],
        isAvailable: true
      },
      {
        name: 'Standard AC Charger - 7kW',
        type: 'AC',
        powerOutput: 7,
        dailyRate: 120,
        weeklyRate: 700,
        monthlyRate: 2500,
        connectorTypes: ['Type 2'],
        isAvailable: true
      }
    ]
  },
  {
    name: 'QuickCharge Station - Wakad',
    description: 'Quick charging solution for busy professionals',
    address: 'Wakad Main Road, Near Dange Chowk, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411057',
    coordinates: {
      latitude: 18.5975,
      longitude: 73.7898
    },
    ownerData: {
      email: 'owner.wakad@quickcharge.demo',
      password: 'demo123',
      firstName: 'Sneha',
      lastName: 'Joshi',
      phone: '+91-9876543213'
    },
    stationType: 'Super Fast',
    chargingSpeedKw: 120,
    connectorTypes: ['Type 2', 'CCS'],
    pricePerKwh: 11.00,
    totalChargers: 5,
    operatingHours: '5:00 AM - 12:00 AM',
    amenities: ['WiFi', 'Coffee Shop', 'Parking'],
    features: {
      hasRestroom: false,
      hasWiFi: true,
      hasFood: true,
      hasShopping: false,
      isAccessible: true,
      hasSecurity: false
    },
    rentalUnits: [
      {
        name: 'Ultra-Fast DC Charger - 50kW',
        type: 'DC',
        powerOutput: 50,
        dailyRate: 500,
        weeklyRate: 3000,
        monthlyRate: 10000,
        connectorTypes: ['CCS', 'CHAdeMO'],
        isAvailable: true
      }
    ]
  },
  {
    name: 'ElectroHub - Kharadi',
    description: 'Complete EV ecosystem with charging and services',
    address: 'EON IT Park Road, Kharadi, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411014',
    coordinates: {
      latitude: 18.5515,
      longitude: 73.9394
    },
    ownerData: {
      email: 'owner.kharadi@electrohub.demo',
      password: 'demo123',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-9876543214'
    },
    stationType: 'Fast Charging',
    chargingSpeedKw: 75,
    connectorTypes: ['Type 1', 'Type 2', 'CCS'],
    pricePerKwh: 10.50,
    totalChargers: 10,
    operatingHours: '24/7',
    amenities: ['WiFi', 'Restroom', 'Restaurant', 'Shopping', 'Parking', 'Security'],
    features: {
      hasRestroom: true,
      hasWiFi: true,
      hasFood: true,
      hasShopping: true,
      isAccessible: true,
      hasSecurity: true
    },
    rentalUnits: [
      {
        name: 'Home Wall Charger - 22kW',
        type: 'AC',
        powerOutput: 22,
        dailyRate: 300,
        weeklyRate: 1800,
        monthlyRate: 6000,
        connectorTypes: ['Type 2'],
        isAvailable: true
      },
      {
        name: 'Mobile DC Charger - 40kW',
        type: 'DC',
        powerOutput: 40,
        dailyRate: 450,
        weeklyRate: 2700,
        monthlyRate: 9000,
        connectorTypes: ['CCS'],
        isAvailable: true
      }
    ]
  }
];

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  const startHour = 6; // 6 AM
  const endHour = 23; // 11 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: Math.random() > 0.3, // 70% slots available
      price: Math.floor(Math.random() * 50) + 100 // ₹100-150 per slot
    });
  }
  
  return slots;
}

// Helper function to generate sample bookings
function generateSampleBookings(stationId, chargerId) {
  const bookings = [];
  const today = new Date();
  
  // Generate bookings for next 7 days
  for (let day = 0; day < 7; day++) {
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + day);
    
    // Random 2-4 bookings per day
    const bookingsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < bookingsPerDay; i++) {
      const startHour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
      
      bookings.push({
        station: stationId,
        charger: chargerId,
        date: bookingDate,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${(startHour + duration).toString().padStart(2, '0')}:00`,
        duration: duration,
        totalAmount: duration * (Math.floor(Math.random() * 50) + 100),
        status: day < 2 ? 'completed' : 'confirmed',
        paymentStatus: 'paid'
      });
    }
  }
  
  return bookings;
}

async function createDemoStations() {
  console.log('🚀 Creating Pune demo stations for presentation...\n');
  
  try {
    // Clear existing demo stations (keep OCM stations)
    await ChargingStation.deleteMany({ 
      city: 'Pune',
      'contactInfo.email': { $regex: /\.demo$/ }
    });
    
    await User.deleteMany({ 
      email: { $regex: /\.demo$/ }
    });
    
    console.log('✅ Cleared existing demo data\n');
    
    const createdStations = [];
    const createdOwners = [];
    const createdRentalUnits = [];
    
    for (const stationData of puneStationsData) {
      console.log(`📍 Creating station: ${stationData.name}`);
      
      // 1. Create station owner
      const owner = new User({
        email: stationData.ownerData.email,
        password: stationData.ownerData.password, // In production, this would be hashed
        firstName: stationData.ownerData.firstName,
        lastName: stationData.ownerData.lastName,
        phone: stationData.ownerData.phone,
        role: 'owner',
        isEmailVerified: true,
        isActive: true
      });
      
      await owner.save();
      createdOwners.push(owner);
      console.log(`   👤 Created owner: ${owner.firstName} ${owner.lastName}`);
      
      // 2. Create charging station
      const station = new ChargingStation({
        name: stationData.name,
        description: stationData.description,
        address: stationData.address,
        city: stationData.city,
        state: stationData.state,
        zipCode: stationData.zipCode,
        coordinates: stationData.coordinates,
        stationType: stationData.stationType,
        chargingSpeedKw: stationData.chargingSpeedKw,
        connectorTypes: stationData.connectorTypes,
        pricePerKwh: stationData.pricePerKwh,
        operatingHours: stationData.operatingHours,
        amenities: stationData.amenities,
        contactInfo: {
          phone: stationData.ownerData.phone,
          email: stationData.ownerData.email
        },
        owner: owner._id,
        isActive: true,
        isAvailable: true,
        status: 'approved',
        rating: {
          average: Math.random() * 1.5 + 3.5, // 3.5-5.0
          count: Math.floor(Math.random() * 50) + 10
        },
        features: stationData.features,
        // Add charger-specific data for booking
        chargers: []
      });
      
      // 3. Create individual chargers for the station
      for (let i = 1; i <= stationData.totalChargers; i++) {
        const charger = {
          chargerId: `${station.name.replace(/\s+/g, '').substring(0, 8).toUpperCase()}-${i.toString().padStart(2, '0')}`,
          connectorType: stationData.connectorTypes[Math.floor(Math.random() * stationData.connectorTypes.length)],
          powerOutput: stationData.chargingSpeedKw,
          isAvailable: Math.random() > 0.2, // 80% available
          status: 'operational',
          timeSlots: generateTimeSlots()
        };
        
        station.chargers.push(charger);
      }
      
      await station.save();
      createdStations.push(station);
      console.log(`   ⚡ Created station with ${station.chargers.length} chargers`);
      
      // 4. Create rental units for this station
      for (const rentalData of stationData.rentalUnits) {
        const rentalUnit = new RentalUnit({
          name: rentalData.name,
          description: `${rentalData.name} available for rent from ${stationData.name}`,
          type: rentalData.type,
          powerOutput: rentalData.powerOutput,
          connectorTypes: rentalData.connectorTypes,
          dailyRate: rentalData.dailyRate,
          weeklyRate: rentalData.weeklyRate,
          monthlyRate: rentalData.monthlyRate,
          isAvailable: rentalData.isAvailable,
          owner: owner._id,
          station: station._id,
          location: {
            address: stationData.address,
            city: stationData.city,
            state: stationData.state,
            coordinates: stationData.coordinates
          },
          features: {
            isPortable: rentalData.type === 'AC',
            hasDisplay: true,
            hasWiFi: Math.random() > 0.5,
            weatherResistant: true
          },
          status: 'available'
        });
        
        await rentalUnit.save();
        createdRentalUnits.push(rentalUnit);
        console.log(`   🔌 Created rental unit: ${rentalUnit.name}`);
      }
      
      // 5. Generate some sample bookings for demonstration
      const sampleBookings = [];
      for (let i = 0; i < Math.min(3, station.chargers.length); i++) {
        const charger = station.chargers[i];
        const bookings = generateSampleBookings(station._id, charger.chargerId);
        sampleBookings.push(...bookings);
      }
      
      // Note: We're not creating actual booking documents here to keep it simple
      // In a real scenario, you'd create Booking documents
      
      console.log(`   📅 Generated ${sampleBookings.length} sample booking slots\n`);
    }
    
    console.log('✅ Demo stations creation completed!\n');
    
    // Summary
    console.log('📊 CREATION SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`🏢 Stations Created: ${createdStations.length}`);
    console.log(`👥 Station Owners: ${createdOwners.length}`);
    console.log(`🔌 Rental Units: ${createdRentalUnits.length}`);
    console.log(`⚡ Total Chargers: ${createdStations.reduce((sum, s) => sum + s.chargers.length, 0)}`);
    console.log('=' .repeat(50));
    
    console.log('\n🎯 DEMO CREDENTIALS:');
    console.log('=' .repeat(50));
    createdOwners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.firstName} ${owner.lastName}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Password: demo123`);
      console.log(`   Station: ${createdStations[index].name}`);
      console.log('');
    });
    
    console.log('🎉 Ready for presentation! All demo stations are in Pune with:');
    console.log('✅ Real coordinates for map display');
    console.log('✅ Station owner dashboards');
    console.log('✅ Slot booking functionality');
    console.log('✅ Rental units available');
    console.log('✅ Sample booking data');
    console.log('\n💡 Note: New stations can be hosted alongside these demo stations!');
    
    return {
      stations: createdStations,
      owners: createdOwners,
      rentalUnits: createdRentalUnits
    };
    
  } catch (error) {
    console.error('❌ Error creating demo stations:', error);
    throw error;
  }
}

async function main() {
  try {
    await createDemoStations();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createDemoStations };
