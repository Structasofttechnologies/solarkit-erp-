import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import ProjectJourneyStage from '../models/projects/ProjectJourneyStage.js';

const restoreSteps = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing (if any)
        await ProjectJourneyStage.deleteMany({});

        const stages = [
            { name: 'Project SignUp', order: 1, fields: [] },
            { name: 'Feasibility Approval', order: 2, fields: [] },
            { name: 'Installation Status', order: 3, fields: [] },
            { name: 'Meter Installation', order: 4, fields: [] },
            { name: 'Subsidy', order: 5, fields: [] }
        ];

        await ProjectJourneyStage.insertMany(stages);
        console.log('Restored 5 default steps with empty forms.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error restoring steps:', error);
        process.exit(1);
    }
};

restoreSteps();
