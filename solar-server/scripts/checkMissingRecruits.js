import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/hr/Candidate.js';
import User from './models/users/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const namesToCheck = ['test', 'Patel Alis', 'Alis Patel'];
        for (const name of namesToCheck) {
            console.log(`Checking candidate: ${name}`);
            const cand = await Candidate.findOne({ name: new RegExp(name, 'i') });
            if (cand) {
                console.log(`- CANDIDATE Found! Status: ${cand.status}, Mobile: ${cand.mobile}, Email: ${cand.email}`);
                const user = await User.findOne({
                    $or: [
                        { phone: cand.mobile },
                        { email: cand.email }
                    ]
                });
                if (user) {
                    console.log(`- USER Found! Role: ${user.role}, Name: ${user.name}`);
                } else {
                    console.log(`- USER NOT FOUND! (This is the bug)`);
                }
            } else {
                console.log(`- CANDIDATE NOT FOUND!`);
            }
            console.log('---');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
