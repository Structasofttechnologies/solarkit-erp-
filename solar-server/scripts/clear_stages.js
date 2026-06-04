import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import ProjectJourneyStage from '../models/projects/ProjectJourneyStage.js';

const clearStages = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await ProjectJourneyStage.deleteMany({});
        console.log(`Deleted ${result.deletedCount} stages.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error clearing stages:', error);
        process.exit(1);
    }
};

clearStages();
