const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  const email = (process.argv[2] || 'admin@ecommerce.com').toLowerCase().trim();
  const password = process.argv[3] || 'Admin123!';
  const name = process.argv[4] || 'Super Administrator';

  if (password.length < 6) {
    console.error('Error: Admin password must be at least 6 characters long.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/novashop_ecommerce';

  console.log(`[NovaShop Admin Provisioning]`);
  console.log(`Connecting to database: ${mongoUri.replace(/:([^:@]{3,})@/, ':****@')}`);

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    let user = await User.findOne({ email });

    if (user) {
      console.log(`User found with email '${email}'. Promoting to admin role...`);
      user.role = 'admin';
      user.name = name;
      user.password = password; // pre-save hook will hash with bcrypt
      user.isBlocked = false;
      await user.save();
      console.log(`SUCCESS: User '${email}' is now an Admin with updated credentials.`);
    } else {
      console.log(`Creating brand new Admin account for '${email}'...`);
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        phone: '+1 555-0100',
        isBlocked: false,
      });
      console.log(`SUCCESS: Admin account created with ID: ${user._id}`);
    }

    console.log(`-----------------------------------------------------`);
    console.log(`Admin Email   : ${email}`);
    console.log(`Admin Role    : admin`);
    console.log(`Admin Status  : Active / Verified`);
    console.log(`-----------------------------------------------------`);
    process.exit(0);
  } catch (err) {
    console.error(`Provisioning Failed:`, err.message);
    process.exit(1);
  }
}

createAdmin();
