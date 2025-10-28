const express = require('express');
const Booking = require('../models/Booking');
const ChargingStation = require('../models/ChargingStation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// PRD alias: GET /api/bookings -> same as /my-bookings
router.get('/', authenticate, async (req, res, next) => {
  try {
    req.url = '/my-bookings';
    return router.handle(req, res, next);
  } catch (e) {
    return next(e);
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .populate('station', 'name address coordinates chargingSpeedKw pricePerKwh')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create new booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { stationId, startTime, endTime, notes } = req.body;

    // Validation
    if (!stationId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Station ID, start time, and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Check if station exists and is available
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (!station.isAvailable || station.status !== 'approved') {
      return res.status(400).json({ error: 'Station is not available for booking' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      station: stationId,
      status: { $in: ['confirmed', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Calculate duration and amount
    const duration = Math.round((end - start) / (1000 * 60)); // in minutes
    const estimatedEnergy = (duration / 60) * (station.chargingSpeedKw * 0.8); // 80% efficiency
    const amount = estimatedEnergy * station.pricePerKwh;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      station: stationId,
      startTime: start,
      endTime: end,
      duration,
      amount,
      notes
    });

    await booking.save();

    // Populate station data for response
    await booking.populate('station', 'name address coordinates chargingSpeedKw pricePerKwh');

    // Emit real-time update
    req.io.to(`station-${stationId}`).emit('booking-created', booking);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('station', 'name address coordinates chargingSpeedKw pricePerKwh owner');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking or is admin/station owner
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isStationOwner = booking.station.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isStationOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('station', 'owner');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    const isUser = booking.user.toString() === req.user._id.toString();
    const isStationOwner = booking.station.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isStationOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in-progress', 'cancelled', 'no-show'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'no-show': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    // Update booking
    booking.status = status;
    
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
      booking.cancelledAt = new Date();
    } else if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    // Emit real-time update
    req.io.to(`station-${booking.station._id}`).emit('booking-status-changed', {
      bookingId: booking._id,
      status: booking.status
    });

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // Check cancellation time (at least 1 hour before start)
    const oneHourBefore = new Date(booking.startTime.getTime() - 60 * 60 * 1000);
    if (new Date() > oneHourBefore) {
      return res.status(400).json({ error: 'Booking can only be cancelled at least 1 hour before start time' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();

    await booking.save();

    // Emit real-time update
    req.io.to(`station-${booking.station}`).emit('booking-cancelled', {
      bookingId: booking._id
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get station bookings (for station owners)
router.get('/station/:stationId', authenticate, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { page = 1, limit = 20, status, date } = req.query;

    // Check if user owns the station or is admin
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view station bookings' });
    }

    const query = { station: stationId };
    
    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      query.startTime = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get station bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch station bookings' });
  }
});

module.exports = router;
