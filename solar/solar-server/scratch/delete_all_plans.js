import mongoose from 'mongoose';
import PartnerPlan from '../models/partner/PartnerPlan.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function deleteAllPlans() {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const result = await PartnerPlan.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} plans.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting plans:', error.message);
        process.exit(1);
    }
}

deleteAllPlans();
