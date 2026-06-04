import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solarkit';

async function listIndexes() {
    await mongoose.connect(mongoUri);
    const collection = mongoose.connection.collection('installervendorplans');
    const indexes = await collection.indexes();
    console.log('CURRENT_INDEXES_START');
    console.log(JSON.stringify(indexes, null, 2));
    console.log('CURRENT_INDEXES_END');
    
    // Explicitly try to drop any index that has name & district/districtId
    for (const idx of indexes) {
        if (idx.unique && idx.key.name && (idx.key.district || idx.key.districtId)) {
            console.log(`Dropping problematic unique index: ${idx.name}`);
            try {
                await collection.dropIndex(idx.name);
                console.log(`Successfully dropped ${idx.name}`);
            } catch (e) {
                console.log(`Failed to drop ${idx.name}: ${e.message}`);
            }
        }
    }

    await mongoose.disconnect();
}
listIndexes();
