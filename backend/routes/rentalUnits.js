const express = require('express');
const RentalUnit = require('../models/RentalUnit');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/rental-units - list rental units (non-demo)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { city, type, connectorType, availableOnly = 'true', page = 1, limit = 20 } = req.query;

    const query = {};
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (type) query.type = type;
    if (connectorType) query.connectorTypes = connectorType;
    if (availableOnly === 'true') {
      query.isAvailable = true;
      query.status = 'available';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const units = await RentalUnit.find(query)
      .populate('owner', 'firstName lastName email')
      .populate('station', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RentalUnit.countDocuments(query);

    res.json({
      rentalUnits: units,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List rental units error:', error);
    res.status(500).json({ error: 'Failed to fetch rental units' });
  }
});

// GET /api/rental-units/:id - rental unit details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const unit = await RentalUnit.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('station', 'name address city');

    if (!unit) return res.status(404).json({ error: 'Rental unit not found' });
    res.json(unit);
  } catch (error) {
    console.error('Get rental unit error:', error);
    res.status(500).json({ error: 'Failed to fetch rental unit' });
  }
});

module.exports = router;


