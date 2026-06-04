import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkDepartments() {
    try {
        await mongoose.connect(MONGO_URI);
        const depts = await mongoose.connection.collection('departments').find({}).toArray();
        console.log(`Found ${depts.length} departments`);

        depts.forEach(d => {
            console.log(`ID: ${d._id}, Name: ${d.name}, Country: ${d.country}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDepartments();
