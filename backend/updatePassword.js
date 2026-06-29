// updatePassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const User = require('./models/User');

  const plainPassword = 'adarsh'; // your admin password
  const email = 'adarsh@gmail.com'; // your admin email

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found!');
    process.exit();
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(plainPassword, salt);
  await user.save();

  console.log('Password updated and hashed for user:', email);
  process.exit();
}

updatePassword().catch(console.error);
