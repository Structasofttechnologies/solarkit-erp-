import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testInsert() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const coll = db.collection('installervendorplans');
    
    console.log('Inserting first doc...');
    await coll.insertOne({ name: 'TEST_PLAN', districtId: null, random: Math.random() });
    
    console.log('Inserting second doc with same name/district...');
    try {
        await coll.insertOne({ name: 'TEST_PLAN', districtId: null, random: Math.random() });
        console.log('SUCCESS: No duplicate error on raw insert');
    } catch (e) {
        console.log('ERROR: Duplicate error triggered:', e.message);
    }
    
    await mongoose.disconnect();
}
testInsert();
