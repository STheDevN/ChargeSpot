const express = require('express');
const ChargingStation = require('../models/ChargingStation');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all stations with optional filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      city,
      stationType,
      connectorType,
      minSpeed,
      maxPrice,
      availableOnly,
      lat,
      lng,
      radius = 10,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const query = { status: 'approved', isActive: true };

    // City filter
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Station type filter
    if (stationType) {
      query.stationType = stationType;
    }

    // Connector type filter
    if (connectorType) {
      query.connectorTypes = connectorType;
    }

    // Charging speed filter
    if (minSpeed) {
      query.chargingSpeedKw = { $gte: parseInt(minSpeed) };
    }

    // Price filter
    if (maxPrice) {
      query.pricePerKwh = { $lte: parseFloat(maxPrice) };
    }

    // Availability filter
    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    // Geospatial query
    if (lat && lng) {
      query['coordinates.latitude'] = {
        $gte: parseFloat(lat) - (radius / 111),
        $lte: parseFloat(lat) + (radius / 111)
      };
      query['coordinates.longitude'] = {
        $gte: parseFloat(lng) - (radius / 111),
        $lte: parseFloat(lng) + (radius / 111)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stations = await ChargingStation.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChargingStation.countDocuments(query);

    res.json({
      stations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Get station by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone');

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Get recent reviews
    const reviews = await Review.find({ 
      station: station._id, 
      moderationStatus: 'approved' 
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upcoming bookings count
    const upcomingBookings = await Booking.countDocuments({
      station: station._id,
      startTime: { $gte: new Date() },
      status: { $in: ['confirmed', 'in-progress'] }
    });

    res.json({
      station,
      reviews,
      upcomingBookings
    });
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ error: 'Failed to fetch station' });
  }
});

// Create new station (Owner only)
router.post('/', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const stationData = {
      ...req.body,
      owner: req.user._id
    };

    const station = new ChargingStation(stationData);
    await station.save();

    // Emit real-time update
    req.io.emit('station-created', station);

    res.status(201).json({
      message: 'Station created successfully',
      station
    });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Failed to create station' });
  }
});

// Update station (Owner or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check if user owns the station or is admin
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this station' });
    }

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Emit real-time update
    req.io.to(`station-${station._id}`).emit('station-updated', updatedStation);

    res.json({
      message: 'Station updated successfully',
      station: updatedStation
    });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ error: 'Failed to update station' });
  }
});

// Delete station (Owner or Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check if user owns the station or is admin
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this station' });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);

    // Emit real-time update
    req.io.emit('station-deleted', { stationId: req.params.id });

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Failed to delete station' });
  }
});

// Get stations by owner
router.get('/owner/:ownerId', authenticate, async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Check if user is requesting their own stations or is admin
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these stations' });
    }

    const stations = await ChargingStation.find({ owner: ownerId })
      .sort({ createdAt: -1 });

    res.json({ stations });
  } catch (error) {
    console.error('Get owner stations error:', error);
    res.status(500).json({ error: 'Failed to fetch owner stations' });
  }
});

// Update station availability
router.patch('/:id/availability', authenticate, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check if user owns the station or is admin
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this station' });
    }

    station.isAvailable = isAvailable;
    await station.save();

    // Emit real-time update
    req.io.to(`station-${station._id}`).emit('station-availability-changed', {
      stationId: station._id,
      isAvailable
    });

    res.json({
      message: 'Station availability updated',
      station
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update station availability' });
  }
});

module.exports = router;
