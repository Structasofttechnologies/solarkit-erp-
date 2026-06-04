import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function debugAll() {
    try {
        await mongoose.connect(MONGO_URI);
        const roles = await mongoose.connection.collection('roles').find({}).toArray();
        const depts = await mongoose.connection.collection('departments').find({}).toArray();
        const countries = await mongoose.connection.collection('countries').find({}).toArray();
        const states = await mongoose.connection.collection('states').find({}).toArray();

        const deptMap = {}; depts.forEach(d => deptMap[d._id.toString()] = d);
        const countryMap = {}; countries.forEach(c => countryMap[c._id.toString()] = c);
        const stateMap = {}; states.forEach(s => stateMap[s._id.toString()] = s);

        let output = "--- DEPARTMENTS ---\n";
        depts.forEach(d => {
            output += `ID: ${d._id}\nName: ${d.name}\nCountry: ${d.country}\n\n`;
        });

        output += "\n--- ROLES ---\n";
        roles.forEach(role => {
            const d = deptMap[role.department?.toString()];
            const c = countryMap[role.country?.toString()];
            const s = stateMap[role.state?.toString()];

            output += `ID: ${role._id}\n`;
            output += `Name: ${role.name}\n`;
            output += `Level: ${role.level}\n`;
            output += `Dept: ${d ? d.name : 'Unknown'} (${role.department})\n`;
            output += `Country: ${c ? c.name : 'null'} (${role.country})\n`;
            output += `State: ${s ? s.name : 'null'} (${role.state})\n`;
            output += `-------------------\n`;
        });

        fs.writeFileSync('final_debug.txt', output);
        console.log("Debug info written to final_debug.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugAll();
