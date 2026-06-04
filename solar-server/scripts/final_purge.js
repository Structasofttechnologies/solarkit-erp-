import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function purgeAllInColl() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Test if we can find ANY index for name/district on installervendorplans
    const coll = db.collection('installervendorplans');
    const indexes = await coll.indexes();
    console.log('FINAL_INDEXES_LIST (raw):', JSON.stringify(indexes, null, 2));

    // Try to drop ANY index that is not _id_
    for (const idx of indexes) {
        if (idx.name !== '_id_') {
            console.log(`Dropping ${idx.name} from installervendorplans...`);
            try {
                await coll.dropIndex(idx.name);
                console.log(`Successfully dropped ${idx.name}`);
            } catch (e) {
                console.log(`Failed dropping ${idx.name}: ${e.message}`);
            }
        }
    }

    // Explicit drop by EXACT keys as mentioned in error
    try {
        console.log('Attempting explicit key-based drop...');
        await coll.dropIndex({ name: 1, district: 1 });
        console.log('Dropped name/district index by specification');
    } catch (e) {
        console.log(`Key-based drop failed: ${e.message}`);
    }

    await mongoose.disconnect();
}
purgeAllInColl();
