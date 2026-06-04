import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/users/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const users = await User.find({ role: { $in: ['admin', 'employee', 'dealerManager', 'franchiseeManager', 'delivery_manager', 'installer'] } }).lean();
        console.log(`Found ${users.length} users with matching roles.`);
        const employeeList = users.map((user, index) => {
            return {
                _id: user._id,
                name: user.name,
                role: user.role,
                department: user.department || '-',
            };
        });
        console.log("Sample UI Mapping for newest 3:");
        console.log(employeeList.slice(-3));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
