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

  const bosKits = [
    {
      skuCode: 'BOS-3KW-STD',
      description: '3 kW Standard BOS Kit (DC Cables, MC4, Earthing, Lightning Arrester)',
      category: 'BOS',
      productType: 'BOS Kit',
      technology: 'Standard',
      wattage: 3,
      capacity: '3 kW',
      status: true,
    },
    {
      skuCode: 'BOS-5KW-STD',
      description: '5 kW Standard BOS Kit (DC Cables, MC4, Earthing, Lightning Arrester)',
      category: 'BOS',
      productType: 'BOS Kit',
      technology: 'Standard',
      wattage: 5,
      capacity: '5 kW',
      status: true,
    },
    {
      skuCode: 'BOS-10KW-STD',
      description: '10 kW Standard BOS Kit (DC Cables, MC4, Earthing, Lightning Arrester)',
      category: 'BOS',
      productType: 'BOS Kit',
      technology: 'Standard',
      wattage: 10,
      capacity: '10 kW',
      status: true,
    },
    {
      skuCode: 'BOS-3KW-PRE',
      description: '3 kW Premium BOS Kit (Extended Warranty, Surge Protection, AC DB)',
      category: 'BOS',
      productType: 'BOS Kit',
      technology: 'Premium',
      wattage: 3,
      capacity: '3 kW',
      status: true,
    },
    {
      skuCode: 'BOS-5KW-PRE',
      description: '5 kW Premium BOS Kit (Extended Warranty, Surge Protection, AC DB)',
      category: 'BOS',
      productType: 'BOS Kit',
      technology: 'Premium',
      wattage: 5,
      capacity: '5 kW',
      status: true,
    },
  ];

  let created = 0;
  for (const kit of bosKits) {
    const exists = await SKU.findOne({ skuCode: kit.skuCode });
    if (!exists) {
      await SKU.create(kit);
      console.log(`✅ Created: ${kit.skuCode} - ${kit.description}`);
      created++;
    } else {
      console.log(`⚠️ Already exists: ${kit.skuCode}`);
    }
  }

  console.log(`\n✅ Done! ${created} BOS Kits added.`);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
