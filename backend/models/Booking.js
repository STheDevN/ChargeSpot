const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChargingStation',
    required: true
  },
  // Optional: charger identifier for station with multiple chargers (used in demo and timeslot flows)
  charger: {
    type: String,
  },
  // Optional: booking calendar date for UI grouping (do not rely on this for conflicts)
  date: {
    type: Date,
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String // Stripe payment intent ID
  },
  amount: {
    type: Number,
    required: true
  },
  // Tag booking source/type (e.g., standard, demo)
  bookingType: {
    type: String,
    enum: ['standard', 'demo'],
    default: 'standard'
  },
  energyCharged: {
    type: Number, // in kWh
    default: 0
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate booking reference
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
