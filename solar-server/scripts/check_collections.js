import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;

async function checkCollections() {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('COLLECTIONS_LIST_START');
    for (const coll of collections) {
        console.log(`- ${coll.name}`);
        const indexes = await db.collection(coll.name).indexes();
        console.log('  Indexes:', JSON.stringify(indexes));
    }
    console.log('COLLECTIONS_LIST_END');
    await mongoose.disconnect();
}
checkCollections();
