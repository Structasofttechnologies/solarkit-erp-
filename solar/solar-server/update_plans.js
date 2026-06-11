import mongoose from 'mongoose';
import AMCPlan from './models/finance/AMCPlan.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function updatePlans() {
    await connectDB();
    const result = await AMCPlan.updateMany(
        { 
            projectType: '4 to 40 kW',
            subProjectType: 'Hybrid'
        },
        { 
            basicPricePerKw: 2000,
            amcServiceCharges: 500
        }
    );
    console.log(`Updated ${result.modifiedCount} plans matching "4 to 40 kW Hybrid"`);
    process.exit();
}
updatePlans();
