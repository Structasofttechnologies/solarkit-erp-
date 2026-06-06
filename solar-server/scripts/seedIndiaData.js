import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Country from '../models/core/Country.js';
import State from '../models/core/State.js';
import District from '../models/core/District.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
];

const gujaratDistricts = [
  "Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang",
  "Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi",
  "Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"
];

async function seedIndiaStatesAndDistricts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Ensure Country India is Active
    let india = await Country.findOne({ name: 'India' });
    if (!india) {
      india = await Country.create({ name: 'India', isActive: true });
      console.log('Created active country India.');
    }

    // 2. Add all Indian States
    console.log('Adding all 36 Indian States and UTs...');
    const stateDocs = {};
    for (const sName of indianStates) {
      let st = await State.findOne({ name: sName, country: india._id });
      if (!st) {
        st = await State.create({ name: sName, country: india._id, isActive: true });
      }
      stateDocs[sName] = st;
    }

    // 3. Add all Gujarat Districts
    console.log('Adding all 33 Gujarat Districts...');
    const gujaratState = stateDocs['Gujarat'];
    if (gujaratState) {
      for (const dName of gujaratDistricts) {
        let dist = await District.findOne({ name: dName, state: gujaratState._id });
        if (!dist) {
          await District.create({ name: dName, state: gujaratState._id, country: india._id, isActive: true });
        }
      }
    }

    console.log('Successfully seeded all Indian States and Gujarat Districts.');
  } catch (error) {
    console.error('Error seeding states/districts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedIndiaStatesAndDistricts();
