const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');
const RentalUnit = require('../models/RentalUnit');
const Booking = require('../models/Booking');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get all demo stations in Pune
router.get('/stations', optionalAuth, async (req, res) => {
  try {
    const demoStations = await ChargingStation.find({
      city: 'Pune',
      'contactInfo.email': { $regex: /\.demo$/ }
    })
    .populate('owner', 'firstName lastName email phone')
    .sort({ createdAt: -1 });

    res.json({
      stations: demoStations,
      total: demoStations.length
    });
  } catch (error) {
    console.error('Get demo stations error:', error);
    res.status(500).json({ error: 'Failed to fetch demo stations' });
  }
});

// Get specific demo station with chargers and time slots
router.get('/stations/:stationId', optionalAuth, async (req, res) => {
  try {
    const { stationId } = req.params;
    
    const station = await ChargingStation.findById(stationId)
      .populate('owner', 'firstName lastName email phone');
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json(station);
  } catch (error) {
    console.error('Get demo station error:', error);
    res.status(500).json({ error: 'Failed to fetch station details' });
  }
});

// Get available time slots for a specific charger
router.get('/stations/:stationId/chargers/:chargerId/slots', optionalAuth, async (req, res) => {
  try {
    const { stationId, chargerId } = req.params;
    const { date } = req.query;
    
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    const charger = station.chargers.find(c => c.chargerId === chargerId);
    if (!charger) {
      return res.status(404).json({ error: 'Charger not found' });
    }
    
    // Get existing bookings for this date
    const bookingDate = date ? new Date(date) : new Date();
    const existingBookings = await Booking.find({
      station: stationId,
      charger: chargerId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['confirmed', 'in-progress'] }
    });
    
    // Mark booked slots as unavailable
    const availableSlots = charger.timeSlots.map(slot => {
      const isBooked = existingBookings.some(booking => 
        booking.startTime === slot.startTime
      );
      
      return {
        ...slot.toObject(),
        isAvailable: slot.isAvailable && !isBooked,
        isBooked
      };
    });
    
    res.json({
      charger: {
        chargerId: charger.chargerId,
        connectorType: charger.connectorType,
        powerOutput: charger.powerOutput,
        status: charger.status
      },
      date: bookingDate,
      timeSlots: availableSlots
    });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// Book a charging slot (demo booking)
router.post('/stations/:stationId/book', authenticate, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { chargerId, date, startTime, endTime, duration } = req.body;
    
    if (!chargerId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }
    
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    const charger = station.chargers.find(c => c.chargerId === chargerId);
    if (!charger) {
      return res.status(404).json({ error: 'Charger not found' });
    }
    
    // Check if slot is available
    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      station: stationId,
      charger: chargerId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      startTime: startTime,
      status: { $in: ['confirmed', 'in-progress'] }
    });
    
    if (existingBooking) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    
    // Calculate total amount
    const timeSlot = charger.timeSlots.find(slot => slot.startTime === startTime);
    const slotPrice = timeSlot ? timeSlot.price : 100;
    const totalAmount = slotPrice * (duration || 1);
    
    // Create booking
    const booking = new Booking({
      user: req.user.id,
      station: stationId,
      charger: chargerId,
      date: bookingDate,
      startTime,
      endTime,
      duration: duration || 1,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'pending',
      bookingType: 'demo'
    });
    
    await booking.save();
    
    // Populate booking details
    await booking.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'station', select: 'name address city' }
    ]);
    
    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get demo rental units
router.get('/rental-units', optionalAuth, async (req, res) => {
  try {
    const rentalUnits = await RentalUnit.find({
      'location.city': 'Pune'
    })
    .populate('owner', 'firstName lastName email phone')
    .populate('station', 'name address')
    .sort({ createdAt: -1 });
    
    res.json({
      rentalUnits,
      total: rentalUnits.length
    });
  } catch (error) {
    console.error('Get rental units error:', error);
    res.status(500).json({ error: 'Failed to fetch rental units' });
  }
});

// Get specific rental unit details
router.get('/rental-units/:unitId', optionalAuth, async (req, res) => {
  try {
    const { unitId } = req.params;
    
    const rentalUnit = await RentalUnit.findById(unitId)
      .populate('owner', 'firstName lastName email phone')
      .populate('station', 'name address city');
    
    if (!rentalUnit) {
      return res.status(404).json({ error: 'Rental unit not found' });
    }
    
    res.json(rentalUnit);
  } catch (error) {
    console.error('Get rental unit error:', error);
    res.status(500).json({ error: 'Failed to fetch rental unit details' });
  }
});

// Demo station owner login
router.post('/owner/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find demo owner
    const owner = await User.findOne({ 
      email,
      role: 'owner',
      email: { $regex: /\.demo$/ }
    });
    
    if (!owner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, simple password check (in production, use bcrypt)
    if (password !== 'demo123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Get owner's stations
    const stations = await ChargingStation.find({ owner: owner._id });
    const rentalUnits = await RentalUnit.find({ owner: owner._id });
    
    res.json({
      message: 'Login successful',
      owner: {
        id: owner._id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phone: owner.phone
      },
      stations,
      rentalUnits,
      isDemoAccount: true
    });
  } catch (error) {
    console.error('Demo owner login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get bookings for a demo station owner
router.get('/owner/:ownerId/bookings', authenticate, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { status, date } = req.query;
    
    // Get owner's stations
    const stations = await ChargingStation.find({ owner: ownerId });
    const stationIds = stations.map(s => s._id);
    
    let query = { station: { $in: stationIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const queryDate = new Date(date);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('station', 'name address')
      .sort({ date: -1, startTime: 1 });
    
    res.json({
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (for demo station owners)
router.patch('/bookings/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const booking = await Booking.findById(bookingId)
      .populate('station', 'owner');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns the station (for demo)
    if (booking.station.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    booking.status = status;
    if (status === 'completed') {
      booking.paymentStatus = 'paid';
    }
    
    await booking.save();
    
    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

module.exports = router;
