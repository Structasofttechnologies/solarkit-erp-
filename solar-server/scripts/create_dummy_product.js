import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Product from '../models/inventory/Product.js';
import BrandManufacturer from '../models/inventory/BrandManufacturer.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const categoryId = '69b1168934baff02cf91eb91';
  const subProjectTypeId = '6a2111edf96ac643b4c6c2f3';
  const brandId = '69a7491e38f8a242baa3f00b';

  // Check if brand exists, if not create dummy brand
  let brand = await BrandManufacturer.findById(brandId);
  if (!brand) {
      console.log('Creating dummy brand...');
      brand = await BrandManufacturer.create({
          _id: new mongoose.Types.ObjectId(brandId),
          companyName: 'Dummy Brand',
          companyOriginCountry: 'India',
          brand: 'Dummy Brand',
          product: 'Panel',
          brandLogo: '/uploads/images/dummy-logo.png'
      });
  }

  // Create dummy product
  console.log('Creating dummy product...');
  const product = await Product.create({
      name: 'Dummy Test Product',
      categoryId: new mongoose.Types.ObjectId(categoryId),
      subProjectTypeId: new mongoose.Types.ObjectId(subProjectTypeId),
      brandId: new mongoose.Types.ObjectId(brandId),
      status: true
  });

  console.log('Dummy product created with ID:', product._id);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
