const express = require('express');
const Review = require('../models/Review');
const ChargingStation = require('../models/ChargingStation');
const Booking = require('../models/Booking');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// PRD alias: GET /api/reviews?stationId=...
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { stationId } = req.query;
    if (!stationId) return next();
    req.params.stationId = stationId;
    return router.handle({ ...req, url: `/station/${stationId}` }, res, next);
  } catch (e) {
    return next(e);
  }
});

// Get reviews for a station
router.get('/station/:stationId', optionalAuth, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ 
      station: stationId, 
      moderationStatus: 'approved' 
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ 
      station: stationId, 
      moderationStatus: 'approved' 
    });

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
    console.error('Get station reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create new review
router.post('/', authenticate, async (req, res) => {
  try {
    const { stationId, rating, title, comment, images } = req.body;

    // Validation
    if (!stationId || !rating || !comment) {
      return res.status(400).json({ error: 'Station ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if station exists
    const station = await ChargingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check if user has a completed booking for this station
    const completedBooking = await Booking.findOne({
      user: req.user._id,
      station: stationId,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.status(400).json({ error: 'You can only review stations you have used' });
    }

    // Check if user has already reviewed this station
    const existingReview = await Review.findOne({
      user: req.user._id,
      station: stationId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this station' });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      station: stationId,
      booking: completedBooking._id,
      rating,
      title,
      comment,
      images,
      isRecommended: rating >= 4
    });

    await review.save();

    // Populate user data for response
    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ user: req.user._id })
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user._id });

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
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Update review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    review.isRecommended = review.rating >= 4;
    review.moderationStatus = 'pending'; // Reset moderation status

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Vote on review helpfulness
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { helpful } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user has already voted (simplified - in production, use separate votes collection)
    // For now, we'll just increment the helpful votes
    if (helpful) {
      review.helpfulVotes += 1;
      await review.save();
    }

    res.json({
      message: 'Vote recorded successfully',
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Respond to review (Station owner)
router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id)
      .populate('station', 'owner');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the station
    if (review.station.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to respond to this review' });
    }

    // Update review with response
    review.response = {
      text: response,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

module.exports = router;
