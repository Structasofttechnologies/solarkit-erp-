import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import SKU from '../models/inventory/SKU.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const skuCodesToDelete = [
    'BOS-3KW-STD',
    'BOS-5KW-STD',
    'BOS-10KW-STD',
    'BOS-3KW-PRE',
    'BOS-5KW-PRE'
  ];

  const result = await SKU.deleteMany({ skuCode: { $in: skuCodesToDelete } });
  console.log(`Deleted ${result.deletedCount} dummy BOS Kits from the SKU collection.`);

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
