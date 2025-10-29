const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-stations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createOwnerUser() {
  try {
    // Get email from command line argument or use default
    const email = process.argv[2] || 'owner@chargespot.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      if (existingUser.role !== 'owner') {
        existingUser.role = 'owner';
        await existingUser.save();
        console.log(`Updated user ${email} role to owner`);
      } else {
        console.log(`User ${email} already has owner role`);
      }
      return;
    }

    // Create new owner user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const ownerUser = new User({
      firstName: 'Station',
      lastName: 'Owner',
      email: email,
      password: hashedPassword,
      phone: '+1234567890',
      role: 'owner',
      isVerified: true
    });

    await ownerUser.save();
    console.log('Owner user created successfully!');
    console.log(`Email: ${email}`);
    console.log('Password: password123');
    console.log('Role: owner');
    
  } catch (error) {
    console.error('Error creating owner user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createOwnerUser();
