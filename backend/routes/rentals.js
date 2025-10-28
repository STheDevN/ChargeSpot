const express = require('express');
const Rental = require('../models/Rental');
const ChargingStation = require('../models/ChargingStation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user's rentals
router.get('/my-rentals', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rentals = await Rental.find(query)
      .populate('station', 'name address')
      .populate('owner', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.json({
      rentals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Create rental request
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      stationId,
      chargingUnit,
      rentalPeriod,
      deliveryInfo,
      notes
    } = req.body;

    // Validation
    if (!stationId || !chargingUnit || !rentalPeriod || !deliveryInfo) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if station exists and is owned by someone
    const station = await ChargingStation.findById(stationId)
      .populate('owner', 'firstName lastName email phone');
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (!station.owner) {
      return res.status(400).json({ error: 'Station owner not found' });
    }

    // Calculate pricing
    const startDate = new Date(rentalPeriod.startDate);
    const endDate = new Date(rentalPeriod.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let dailyRate = 0;
    switch (chargingUnit.type) {
      case 'Portable':
        dailyRate = 25;
        break;
      case 'Wall Mount':
        dailyRate = 50;
        break;
      case 'Fast Charger':
        dailyRate = 100;
        break;
      default:
        dailyRate = 25;
    }

    const totalAmount = dailyRate * daysDiff;
    const deposit = totalAmount * 0.2; // 20% deposit

    // Create rental request
    const rental = new Rental({
      user: req.user._id,
      station: stationId,
      owner: station.owner._id,
      chargingUnit,
      rentalPeriod,
      pricing: {
        dailyRate,
        totalAmount,
        deposit
      },
      deliveryInfo,
      notes
    });

    await rental.save();

    // Populate data for response
    await rental.populate('station', 'name address');
    await rental.populate('owner', 'firstName lastName email phone');

    res.status(201).json({
      message: 'Rental request submitted successfully',
      rental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ error: 'Failed to create rental request' });
  }
});

// Get rental by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('station', 'name address')
      .populate('owner', 'firstName lastName email phone');

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check authorization
    const isUser = rental.user._id.toString() === req.user._id.toString();
    const isOwner = rental.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this rental' });
    }

    res.json({ rental });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

// Update rental status (Owner or Admin)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const rental = await Rental.findById(req.params.id)
      .populate('owner', '_id');

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check authorization
    const isOwner = rental.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this rental' });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['approved', 'rejected'],
      'approved': ['active', 'cancelled'],
      'rejected': [],
      'active': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[rental.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    // Update rental
    rental.status = status;
    if (notes) rental.notes = notes;

    if (status === 'cancelled') {
      rental.cancelledAt = new Date();
    } else if (status === 'completed') {
      rental.completedAt = new Date();
    }

    await rental.save();

    res.json({
      message: 'Rental status updated successfully',
      rental
    });
  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({ error: 'Failed to update rental status' });
  }
});

// Cancel rental (User)
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if user owns the rental
    if (rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this rental' });
    }

    // Check if rental can be cancelled
    if (!['pending', 'approved'].includes(rental.status)) {
      return res.status(400).json({ error: 'Rental cannot be cancelled' });
    }

    rental.status = 'cancelled';
    rental.cancellationReason = cancellationReason;
    rental.cancelledAt = new Date();

    await rental.save();

    res.json({
      message: 'Rental cancelled successfully',
      rental
    });
  } catch (error) {
    console.error('Cancel rental error:', error);
    res.status(500).json({ error: 'Failed to cancel rental' });
  }
});

// Get rentals for station owner
router.get('/owner/:ownerId', authenticate, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Check if user is requesting their own rentals or is admin
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these rentals' });
    }

    const query = { owner: ownerId };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rentals = await Rental.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.json({
      rentals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get owner rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch owner rentals' });
  }
});

module.exports = router;
