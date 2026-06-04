import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/users/User.js';

dotenv.config();

const addPartnerUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        const managerPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Partner User',
                email: 'partner@solarkits.com',
                password: hashedPassword,
                role: 'dealer', // Internal role is 'dealer'
                status: 'active',
                isApproved: true
            },
            {
                name: 'Partner Manager User',
                email: 'partnermanager@solarkits.com',
                password: managerPassword,
                role: 'dealerManager', // Internal role is 'dealerManager'
                status: 'active',
                isApproved: true
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists.`);
                // Update password just in case
                existingUser.password = userData.password;
                await existingUser.save();
                console.log(`Updated password for ${userData.email}.`);
            } else {
                const newUser = new User(userData);
                await newUser.save();
                console.log(`Created user ${userData.email}.`);
            }
        }

        console.log("Partner users setup complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addPartnerUsers();
