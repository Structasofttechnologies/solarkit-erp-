import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function dropIndex() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solarkit';
        console.log(`Connecting to: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('installervendorplans');
        
        // List indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Find the index name for {name: 1, districtId: 1} or {name: 1, district: 1}
        // Based on the error: index: name_1_district_1
        try {
            await collection.dropIndex('name_1_district_1');
            console.log('Successfully dropped index name_1_district_1');
        } catch (e) {
            console.log('Could not drop name_1_district_1 (already gone or different name)');
        }

        // Try another common name or pattern if it failed
        try {
            await collection.dropIndex('name_1_districtId_1');
            console.log('Successfully dropped index name_1_districtId_1');
        } catch (e) {
            // ignore
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error:', err);
    }
}

dropIndex();
