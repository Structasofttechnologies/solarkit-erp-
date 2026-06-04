import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/users/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const users = await User.find({ role: 'employee' }).sort({ createdAt: -1 });
        console.log(`Found ${users.length} employees:`);
        users.forEach(u => {
            console.log(`- Name: ${u.name}, ID: ${u._id}, Role: ${u.role}, State: ${u.state}, CreatedAt: ${u.createdAt}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
