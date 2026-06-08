import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import SKU from '../models/inventory/SKU.js';
import Product from '../models/inventory/Product.js';
import Category from '../models/inventory/Category.js';
import SubCategory from '../models/inventory/SubCategory.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const categories = await SKU.distinct('category');
  console.log('Distinct SKU Categories:', categories);

  const productTypes = await SKU.distinct('productType');
  console.log('Distinct SKU productTypes:', productTypes);

  // Find any SKU with product name "BOS"
  const bosSkus = await SKU.find({}).populate({
    path: 'product',
    model: 'Product'
  }).lean();
  
  const bosFiltered = bosSkus.filter(s => s.product && s.product.name && s.product.name.toLowerCase().includes('bos'));
  console.log('BOS SKUs:', JSON.stringify(bosFiltered, null, 2));

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
