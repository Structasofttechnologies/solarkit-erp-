import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/hr/Module.js';
import Panel from '../models/users/Panel.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkDb() {
  await mongoose.connect(MONGO_URI);
  
  const modules = await Module.find({}).populate('parentModule');
  console.log(`Found ${modules.length} modules.`);
  console.log(JSON.stringify(modules.slice(0, 5), null, 2));
  
  const panels = await Panel.find({});
  console.log(`Found ${panels.length} panels.`);
  console.log(JSON.stringify(panels, null, 2));

  process.exit(0);
}

checkDb();
