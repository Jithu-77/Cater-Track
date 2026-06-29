const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Demo users data
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@catering.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Staff Member',
        email: 'staff@catering.com',
        password: 'staff123',
        role: 'staff'
      },
      {
        name: 'Customer User',
        email: 'customer@catering.com',
        password: 'customer123',
        role: 'customer'
      }
    ];

    // Create users
    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`Created ${userData.role} user: ${userData.email}`);
    }

    console.log('\nDemo users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@catering.com / admin123');
    console.log('Staff: staff@catering.com / staff123');
    console.log('Customer: customer@catering.com / customer123');

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
createDemoUsers();
