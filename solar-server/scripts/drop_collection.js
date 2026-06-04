import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function dropColl() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collectionName = 'installervendorplans';
    console.log(`Dropping collection: ${collectionName}...`);
    try {
        await db.dropCollection(collectionName);
        console.log(`Successfully dropped ${collectionName}`);
    } catch (e) {
        console.log(`Drop failed: ${e.message}`);
    }
    await mongoose.disconnect();
}
dropColl();
