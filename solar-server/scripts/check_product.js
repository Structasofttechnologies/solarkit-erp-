import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Product from '../models/inventory/Product.js';
import Category from '../models/inventory/Category.js';
import SubCategory from '../models/inventory/SubCategory.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const p = await Product.findOne({ name: /BOS/i })
    .populate('categoryId')
    .lean();

  console.log('Product Found:', JSON.stringify(p, null, 2));

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
