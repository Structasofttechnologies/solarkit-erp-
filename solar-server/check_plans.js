import mongoose from 'mongoose';
import AMCPlan from './models/finance/AMCPlan.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPlans() {
    await connectDB();
    const plans = await AMCPlan.find({ 
        projectType: '4 to 40 kW',
        subProjectType: 'Hybrid'
    });
    console.log('Plans matching "4 to 40 kW Hybrid":');
    console.log(JSON.stringify(plans, null, 2));
    process.exit();
}

checkPlans();
