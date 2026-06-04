import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkCountries() {
    try {
        await mongoose.connect(MONGO_URI);
        const countries = await mongoose.connection.collection('countries').find({}).toArray();
        let output = `Found ${countries.length} countries\n\n`;

        countries.forEach(c => {
            output += `ID: ${c._id}\nName: ${c.name}\n\n`;
        });

        fs.writeFileSync('countries_debug.txt', output);
        console.log("Debug info written to countries_debug.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCountries();
