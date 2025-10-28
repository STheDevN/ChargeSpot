const mongoose = require('mongoose');

const rentalUnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['AC', 'DC'],
    required: true
  },
  powerOutput: {
    type: Number,
    required: true,
    min: 1
  },
  connectorTypes: [{
    type: String,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger']
  }],
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  weeklyRate: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChargingStation'
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  features: {
    isPortable: { type: Boolean, default: false },
    hasDisplay: { type: Boolean, default: false },
    hasWiFi: { type: Boolean, default: false },
    weatherResistant: { type: Boolean, default: false },
    hasScheduling: { type: Boolean, default: false }
  },
  specifications: {
    weight: Number, // in kg
    dimensions: {
      length: Number, // in cm
      width: Number,
      height: Number
    },
    cableLength: Number, // in meters
    inputVoltage: String,
    outputVoltage: String
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'inactive'],
    default: 'available'
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  lastMaintenanceDate: {
    type: Date
  },
  warrantyExpiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for location-based queries
rentalUnitSchema.index({ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 });
rentalUnitSchema.index({ owner: 1 });
rentalUnitSchema.index({ station: 1 });
rentalUnitSchema.index({ isAvailable: 1, status: 1 });

module.exports = mongoose.model('RentalUnit', rentalUnitSchema);
