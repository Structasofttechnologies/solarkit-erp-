import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/users/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const users = await User.find({ role: 'employee' }).sort({ createdAt: -1 }).limit(5);
        console.log("Recent Employees:");
        for (const u of users) {
            console.log(`Name: ${u.name}`);
            console.log(`Role: ${u.role}`);
            console.log(`State: ${u.state}`);
            console.log(`Dept: ${u.department}`);
            console.log(`Status: ${u.status}`);
            console.log('---');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
