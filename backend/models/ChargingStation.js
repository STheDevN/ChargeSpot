const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  stationType: {
    type: String,
    enum: ['Fast Charging', 'Standard', 'Super Fast'],
    required: true
  },
  connectorTypes: [{
    type: String,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger']
  }],
  chargingSpeedKw: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerKwh: {
    type: Number,
    required: true,
    min: 0
  },
  operatingHours: {
    type: String,
    default: '24/7'
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Restroom', 'Coffee Shop', 'Restaurant', 'Shopping', 'Parking', 'Security']
  }],
  images: [{
    url: String,
    alt: String
  }],
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  features: {
    hasRestroom: { type: Boolean, default: false },
    hasWiFi: { type: Boolean, default: false },
    hasFood: { type: Boolean, default: false },
    hasShopping: { type: Boolean, default: false },
    isAccessible: { type: Boolean, default: false },
    hasSecurity: { type: Boolean, default: false }
  },
  // Individual chargers for slot booking
  chargers: [{
    chargerId: {
      type: String,
      required: true
    },
    connectorType: {
      type: String,
      enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'],
      required: true
    },
    powerOutput: {
      type: Number,
      required: true,
      min: 1
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'offline'],
      default: 'operational'
    },
    timeSlots: [{
      startTime: String, // "09:00"
      endTime: String,   // "10:00"
      isAvailable: { type: Boolean, default: true },
      price: Number // per slot price
    }]
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
chargingStationSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

module.exports = mongoose.model('ChargingStation', chargingStationSchema);
