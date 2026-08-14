import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';

async function setupRpto() {
  await connectDB();
  try {
    const email = 'rpto@soaring.com';
    const password = 'soaringrpto123';
    
    // Check if exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists. Updating password and role...');
    } else {
      console.log('Creating new rpto user...');
      user = new User({ email, name: 'RPTO Head' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.role = 'rpto-head';
    
    await user.save();
    console.log('Successfully setup RPTO user.');
  } catch(e) {
    console.log('Error setting up rpto user:', e.message);
  }
  process.exit(0);
}

setupRpto();
