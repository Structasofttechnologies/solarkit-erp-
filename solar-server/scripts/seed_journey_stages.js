import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

import ProjectJourneyStage from '../models/projects/ProjectJourneyStage.js';

const seedStages = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing stages
        await ProjectJourneyStage.deleteMany({});
        console.log('Existing stages deleted');

        const stages = [
            { 
                name: 'Project SignUp', 
                order: 1, 
                fields: ['Consumer Registered', 'Application Submission'] 
            },
            { 
                name: 'Feasibility Approval', 
                order: 2, 
                fields: ['Feasibility', 'Meter Charge Generation Paid (optional)'] 
            },
            { 
                name: 'Installation Status', 
                order: 3, 
                fields: ['Vendor Selection', 'Work Start (vendor Agreement)', 'Solar Installation Details', 'PCR (vendor)'] 
            },
            { 
                name: 'Meter Installation', 
                order: 4, 
                fields: ['Meter Change fill Submit And Meter Install', 'Inspection (Project Commissioning)'] 
            },
            { 
                name: 'Subsidy', 
                order: 5, 
                fields: ['Subsidy Request', 'Subsidy Disbursal'] 
            }
        ];

        await ProjectJourneyStage.insertMany(stages);
        console.log('5 default stages seeded successfully');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding stages:', error);
        process.exit(1);
    }
};

seedStages();
