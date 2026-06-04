import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/hr/Candidate.js';
import User from './models/users/User.js';
import Vacancy from './models/hr/Vacancy.js'; // Ensure Vacancy is registered for populate

dotenv.config();

async function runPatch() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB. Patching missing users...");

        // Find all 'Joined' candidates
        const joinedCandidates = await Candidate.find({ status: 'Joined' }).populate('vacancy');
        console.log(`Found ${joinedCandidates.length} candidates with 'Joined' status.`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const cand of joinedCandidates) {
            try {
                const query = [];
                if (cand.mobile) query.push({ phone: cand.mobile });
                if (cand.email) query.push({ email: cand.email });

                if (query.length === 0) {
                    console.log(`Skipping candidate ${cand.name} - no mobile or email found.`);
                    continue;
                }

                const existingUser = await User.findOne({ $or: query });

                if (!existingUser) {
                    console.log(`Creating user for: ${cand.name} (Mobile: ${cand.mobile})`);
                    const rawPassword = cand.mobile || 'password123';
                    await User.create({
                        name: cand.name,
                        email: cand.email || `${cand.mobile}@temp.com`,
                        phone: cand.mobile,
                        password: rawPassword,
                        role: 'employee',
                        trainingCompleted: false,
                        department: cand.vacancy?.department,
                        state: cand.vacancy?.state || new mongoose.Types.ObjectId('69aa2a5d476790c4ac681ceba'), // Use ObjectId
                        isActive: true
                    });
                    createdCount++;
                } else {
                    console.log(`User already exists for: ${cand.name} (Role: ${existingUser.role})`);
                    if (existingUser.role !== 'employee' && existingUser.role !== 'admin') {
                        console.log(`Updating role to employee for: ${cand.name}`);
                        existingUser.role = 'employee';
                        if (!existingUser.state) existingUser.state = cand.vacancy?.state || new mongoose.Types.ObjectId('69aa2a5d476790c4ac681ceba');
                        if (!existingUser.department) existingUser.department = cand.vacancy?.department;
                        await existingUser.save();
                        updatedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error processing candidate ${cand.name}:`, err);
            }
        }

        console.log(`Patch completed. Created ${createdCount}, Updated ${updatedCount}.`);
        process.exit(0);
    } catch (err) {
        console.error("Critical error in runPatch:", err);
        process.exit(1);
    }
}

runPatch();
