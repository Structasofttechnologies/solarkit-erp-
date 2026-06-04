import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearAnyConstraint() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collectionName = 'installervendorplans';
    const coll = db.collection(collectionName);
    
    const indexes = await coll.indexes();
    console.log('Current indexes for installervendorplans:', JSON.stringify(indexes, null, 2));

    for (const idx of indexes) {
        if (idx.name !== '_id_') {
            console.log(`Dropping index: ${idx.name}`);
            try {
                await coll.dropIndex(idx.name);
                console.log(`Dropped ${idx.name}`);
            } catch (e) {
                console.log(`Error dropping ${idx.name}: ${e.message}`);
            }
        }
    }
    
    // Also try to drop the specific name mentioned in the error just in case it's hidden or differently named
    try {
        await coll.dropIndex('name_1_district_1');
        console.log('Successfully dropped name_1_district_1 via explicit name');
    } catch (e) {
        console.log(`Explicit drop failed: ${e.message}`);
    }

    await mongoose.disconnect();
}
clearAnyConstraint();
