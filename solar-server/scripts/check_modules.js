import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkModules() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const modules = await db.collection('modules').find().toArray();
    console.log(JSON.stringify(modules, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkModules();
