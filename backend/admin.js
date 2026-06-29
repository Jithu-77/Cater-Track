const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: 'adarsh@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return mongoose.disconnect();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adarsh', salt);

    const adminUser = new User({
      name: 'Adarsh',
      email: 'adarsh@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    mongoose.disconnect();
  }
}

createAdmin();
