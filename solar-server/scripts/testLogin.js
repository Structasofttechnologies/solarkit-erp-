import mongoose from 'mongoose';
import User from './models/users/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected");

        // Look up user
        const user = await User.findOne({ phone: '8511231513' });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User found:", user.email, user.phone);
            // test password match
            const match = await user.matchPassword('8511231513');
            console.log("Password match for 8511231513:", match);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
