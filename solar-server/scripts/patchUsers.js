import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/users/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB. Patching users...");
        // Using the correct ObjectId for Gujarat found earlier
        const gujaratId = new mongoose.Types.ObjectId('69aa2a5d476790c4ac681ceba');

        const result = await User.updateMany(
            { role: 'employee', state: null },
            { $set: { state: gujaratId } }
        );
        console.log(`Patched ${result.modifiedCount} users to have state ID: ${gujaratId}.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
