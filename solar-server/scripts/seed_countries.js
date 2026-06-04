import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CountryMaster from '../models/core/CountryMaster.js';

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Check if India exists in CountryMaster
    const existing = await CountryMaster.findOne({ name: 'India' });
    if (existing) {
      console.log('India already exists in CountryMaster:', existing);
    } else {
      const india = new CountryMaster({
        name: 'India',
        isActive: true
      });
      await india.save();
      console.log('Seeded CountryMaster with India:', india);
    }
    
    const existing2 = await CountryMaster.findOne({ name: 'United States' });
    if (existing2) {
      console.log('US already exists');
    } else {
      const us = new CountryMaster({
        name: 'United States',
        isActive: true
      });
      await us.save();
      console.log('Seeded CountryMaster with United States:', us);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
