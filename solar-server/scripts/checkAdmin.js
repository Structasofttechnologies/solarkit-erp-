import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/users/User.js';

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@solarkits.com' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
    } else {
      const adminUser = new User({
        name: 'Super Admin',
        email: 'admin@solarkits.com',
        password: 'password123',
        phone: '1234567890',
        role: 'admin',
        status: 'active'
      });
      await adminUser.save();
      console.log('Admin user created: admin@solarkits.com / password123');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
