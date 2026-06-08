import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import BrandManufacturer from '../models/inventory/BrandManufacturer.js';
import ComboKitAssignment from '../models/inventory/ComboKitAssignment.js';
import { saveBase64Image } from '../utils/imageUpload.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const run = async () => {
  await connectDB();
  console.log('Connected to DB');

  const brands = await BrandManufacturer.find({});
  let brandUpdated = 0;
  for (const brand of brands) {
    if (brand.brandLogo && brand.brandLogo.startsWith('data:image')) {
      brand.brandLogo = saveBase64Image(brand.brandLogo);
      await brand.save();
      brandUpdated++;
    }
  }
  console.log(`Updated ${brandUpdated} brands.`);

  const kits = await ComboKitAssignment.find({});
  let kitUpdated = 0;
  for (const assignment of kits) {
    let changed = false;
    if (assignment.comboKits && assignment.comboKits.length > 0) {
      assignment.comboKits = assignment.comboKits.map(kit => {
        if (kit.image && kit.image.startsWith('data:image')) {
          kit.image = saveBase64Image(kit.image);
          changed = true;
        }
        return kit;
      });
    }
    if (changed) {
      await assignment.save();
      kitUpdated++;
    }
  }
  console.log(`Updated ${kitUpdated} kit assignments.`);

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
