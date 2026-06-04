import mongoose from 'mongoose';
import dotenv from 'dotenv';
import State from './models/core/State.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const state = await State.findOne();
        if (state) {
            console.log(`Found state: ${state.name} with ID: ${state._id}`);
        } else {
            console.log("No states found.");
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
