import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function purgeTotal() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
        const indexes = await db.collection(coll.name).indexes();
        for (const idx of indexes) {
            if (idx.name === 'name_1_district_1' || idx.name === 'name_1_districtId_1') {
                console.log(`FOUND offending index ${idx.name} in collection ${coll.name}. Dropping...`);
                try {
                    await db.collection(coll.name).dropIndex(idx.name);
                    console.log(`DROPPED ${idx.name} from ${coll.name}`);
                } catch (e) {
                    console.log(`FAILED dropping ${idx.name} from ${coll.name}: ${e.message}`);
                }
            }
        }
    }
    await mongoose.disconnect();
}
purgeTotal();
