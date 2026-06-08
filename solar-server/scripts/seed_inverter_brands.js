import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import BrandManufacturer from '../models/inventory/BrandManufacturer.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const inverterBrands = [
    { companyName: 'Growatt', companyOriginCountry: 'China', brand: 'Growatt', product: 'inverter', comboKit: true, isActive: true },
    { companyName: 'Solis', companyOriginCountry: 'China', brand: 'Solis', product: 'inverter', comboKit: true, isActive: true },
    { companyName: 'Delta', companyOriginCountry: 'Taiwan', brand: 'Delta', product: 'inverter', comboKit: true, isActive: true },
  ];

  for (const brand of inverterBrands) {
    const exists = await BrandManufacturer.findOne({ companyName: brand.companyName, product: 'inverter' });
    if (!exists) {
      const created = await BrandManufacturer.create(brand);
      console.log(`✅ Created: ${created.companyName} (${created._id})`);
    } else {
      console.log(`⚠️ Already exists: ${brand.companyName}`);
    }
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
