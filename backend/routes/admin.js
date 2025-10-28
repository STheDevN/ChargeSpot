const express = require('express');
const User = require('../models/User');
const ChargingStation = require('../models/ChargingStation');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Rental = require('../models/Rental');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStations,
      totalBookings,
      totalReviews,
      totalRentals,
      pendingStations,
      pendingReviews,
      pendingRentals
    ] = await Promise.all([
      User.countDocuments(),
      ChargingStation.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Rental.countDocuments(),
      ChargingStation.countDocuments({ status: 'pending' }),
      Review.countDocuments({ moderationStatus: 'pending' }),
      Rental.countDocuments({ status: 'pending' })
    ]);

    // Revenue calculation (mock for now)
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent activity
    const recentBookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('station', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentStations = await ChargingStation.find()
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      analytics: {
        totalUsers,
        totalStations,
        totalBookings,
        totalReviews,
        totalRentals,
        pendingStations,
        pendingReviews,
        pendingRentals,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivity: {
        bookings: recentBookings,
        stations: recentStations
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// PRD alias: GET /api/admin/analytics -> same payload as /dashboard
router.get('/analytics', async (req, res, next) => {
  try {
    req.url = '/dashboard';
    return router.handle(req, res, next);
  } catch (e) {
    return next(e);
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Station management
router.get('/stations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stations = await ChargingStation.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
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

// Approve/reject station
router.patch('/stations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    station.status = status;
    await station.save();

    res.json({
      message: 'Station status updated successfully',
      station
    });
  } catch (error) {
    console.error('Update station status error:', error);
    res.status(500).json({ error: 'Failed to update station status' });
  }
});

// Review moderation
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20, moderationStatus } = req.query;
    const query = {};
    
    if (moderationStatus) query.moderationStatus = moderationStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email')
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Moderate review
router.patch('/reviews/:id/moderate', async (req, res) => {
  try {
    const { moderationStatus } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!['approved', 'rejected'].includes(moderationStatus)) {
      return res.status(400).json({ error: 'Invalid moderation status' });
    }

    review.moderationStatus = moderationStatus;
    review.isModerated = true;
    await review.save();

    res.json({
      message: 'Review moderated successfully',
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
});

// Rental management
router.get('/rentals', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rentals = await Rental.find(query)
      .populate('user', 'firstName lastName email')
      .populate('station', 'name address')
      .populate('owner', 'firstName lastName email')
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
    console.error('Get rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// System settings
router.get('/settings', async (req, res) => {
  try {
    // Return system settings (can be stored in database or config)
    const settings = {
      maintenanceMode: false,
      registrationEnabled: true,
      maxBookingDuration: 8, // hours
      cancellationWindow: 1, // hours
      reviewModerationRequired: true,
      rentalApprovalRequired: true
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
