import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  console.log("Searching for 'Residential 3 to 10 kw' in all collections:");
  for (let col of collections) {
    const name = col.name;
    const count = await db.collection(name).countDocuments({
      $or: [
        { name: "Residential 3 to 10 kw" },
        { type: "Residential 3 to 10 kw" },
        { "projectTypes.type": "Residential 3 to 10 kw" },
        { "projectTypes.name": "Residential 3 to 10 kw" }
      ]
    });
    if (count > 0) {
      console.log(`Found in collection '${name}': ${count} documents`);
    }
  }
  mongoose.connection.close();
};

run().catch(console.error);
