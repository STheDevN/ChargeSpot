const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// PRD unified endpoint: POST /api/payments/create-payment-intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'usd', bookingId, rentalId } = req.body;

    if (!amount && !bookingId && !rentalId) {
      return res.status(400).json({ error: 'amount or bookingId or rentalId is required' });
    }

    if (bookingId) {
      req.params.bookingId = bookingId;
      return router.handle({ ...req, method: 'POST', url: `/booking/${bookingId}` }, res);
    }

    if (rentalId) {
      req.params.rentalId = rentalId;
      return router.handle({ ...req, method: 'POST', url: `/rental/${rentalId}` }, res);
    }

    // Direct amount path (no booking/rental linkage)
    // Create Stripe customer if not exists
    let customer;
    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user._id.toString() }
      });
      req.user.stripeCustomerId = customer.id;
      await req.user.save();
    }

    const cents = Math.max(1, Math.round(Number(amount) * 100));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cents,
      currency,
      customer: customer.id,
      metadata: { type: 'direct' },
      automatic_payment_methods: { enabled: true }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Unified payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});
// Create payment intent for booking
router.post('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('station', 'name')
      .populate('user', 'email firstName lastName');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to pay for this booking' });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    // Create Stripe customer if not exists
    let customer;
    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });

      // Update user with Stripe customer ID
      req.user.stripeCustomerId = customer.id;
      await req.user.save();
    }

    // Create payment intent
    const amountInCents = Math.max(1, Math.round(Number(booking.amount || 0) * 100));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Convert to cents and ensure >= 1
      currency: 'usd',
      customer: customer.id,
      metadata: {
        bookingId: booking._id.toString(),
        type: 'booking'
      },
      description: `Payment for booking at ${booking.station.name}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update booking with payment intent ID
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create booking payment error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create payment intent for rental
router.post('/rental/:rentalId', authenticate, async (req, res) => {
  try {
    const { rentalId } = req.params;
    const rental = await Rental.findById(rentalId)
      .populate('station', 'name')
      .populate('user', 'email firstName lastName');

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if user owns the rental
    if (rental.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to pay for this rental' });
    }

    // Check if rental is already paid
    if (rental.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Rental is already paid' });
    }

    // Create Stripe customer if not exists
    let customer;
    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });

      // Update user with Stripe customer ID
      req.user.stripeCustomerId = customer.id;
      await req.user.save();
    }

    // Create payment intent
    const amountInCents = Math.max(1, Math.round(Number(rental.pricing.totalAmount || 0) * 100));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Convert to cents and ensure >= 1
      currency: 'usd',
      customer: customer.id,
      metadata: {
        rentalId: rental._id.toString(),
        type: 'rental'
      },
      description: `Payment for rental at ${rental.station.name}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update rental with payment intent ID
    rental.paymentIntentId = paymentIntent.id;
    await rental.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create rental payment error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm/:paymentIntentId', authenticate, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update booking or rental based on metadata
    const { type, bookingId, rentalId } = paymentIntent.metadata;

    if (type === 'booking' && bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
      }
    } else if (type === 'rental' && rentalId) {
      const rental = await Rental.findById(rentalId);
      if (rental) {
        rental.paymentStatus = 'paid';
        await rental.save();
      }
    }

    res.json({
      message: 'Payment confirmed successfully',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's paid bookings and rentals
    const [bookings, rentals] = await Promise.all([
      Booking.find({ 
        user: req.user._id, 
        paymentStatus: 'paid' 
      })
        .populate('station', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      Rental.find({ 
        user: req.user._id, 
        paymentStatus: 'paid' 
      })
        .populate('station', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ]);

    // Combine and sort by date
    const payments = [
      ...bookings.map(booking => ({
        id: booking._id,
        type: 'booking',
        amount: booking.amount,
        status: booking.paymentStatus,
        createdAt: booking.createdAt,
        description: `Booking at ${booking.station.name}`,
        station: booking.station
      })),
      ...rentals.map(rental => ({
        id: rental._id,
        type: 'rental',
        amount: rental.pricing.totalAmount,
        status: rental.paymentStatus,
        createdAt: rental.createdAt,
        description: `Rental at ${rental.station.name}`,
        station: rental.station
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Webhook endpoint for Stripe events (raw body is mounted early in index.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update booking or rental status
      const { type, bookingId, rentalId } = paymentIntent.metadata;
      
      if (type === 'booking' && bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      } else if (type === 'rental' && rentalId) {
        await Rental.findByIdAndUpdate(rentalId, {
          paymentStatus: 'paid'
        });
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update booking or rental status
      const { type: failedType, bookingId: failedBookingId, rentalId: failedRentalId } = failedPayment.metadata;
      
      if (failedType === 'booking' && failedBookingId) {
        await Booking.findByIdAndUpdate(failedBookingId, {
          paymentStatus: 'failed'
        });
      } else if (failedType === 'rental' && failedRentalId) {
        await Rental.findByIdAndUpdate(failedRentalId, {
          paymentStatus: 'failed'
        });
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
