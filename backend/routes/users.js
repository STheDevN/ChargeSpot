const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        profileImage: req.user.profileImage,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload profile image
router.post('/profile/image', authenticate, async (req, res) => {
  try {
    // In a real application, you would handle file upload here
    // For now, we'll just accept a URL
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');
    const Rental = require('../models/Rental');

    const [totalBookings, totalReviews, totalRentals, completedBookings] = await Promise.all([
      Booking.countDocuments({ user: req.user._id }),
      Review.countDocuments({ user: req.user._id }),
      Rental.countDocuments({ user: req.user._id }),
      Booking.countDocuments({ user: req.user._id, status: 'completed' })
    ]);

    // Calculate total energy charged and CO2 saved
    const energyCharged = await Booking.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$energyCharged' } } }
    ]);

    const totalEnergyCharged = energyCharged[0]?.total || 0;
    const co2Saved = totalEnergyCharged * 0.4; // Approximate CO2 savings per kWh

    res.json({
      stats: {
        totalBookings,
        totalReviews,
        totalRentals,
        completedBookings,
        totalEnergyCharged,
        co2Saved: Math.round(co2Saved * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Verify password
    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Soft delete - deactivate account instead of hard delete
    user.isActive = false;
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
