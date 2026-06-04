import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function checkRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        const roles = await mongoose.connection.collection('roles').find({}).toArray();
        const departments = await mongoose.connection.collection('departments').find({}).toArray();

        const deptMap = {};
        departments.forEach(d => {
            deptMap[d._id.toString()] = d.name;
        });

        let output = `Found ${roles.length} roles\n\n`;

        roles.forEach(role => {
            output += `ID: ${role._id}\n`;
            output += `Name: ${role.name}\n`;
            output += `Level: ${role.level}\n`;
            output += `Department ID: ${role.department}\n`;
            output += `Department Name: ${deptMap[role.department?.toString()] || 'Unknown'}\n`;
            output += `Country: ${role.country}\n`;
            output += `State: ${role.state}\n`;
            output += `Cluster: ${role.cluster}\n`;
            output += `District: ${role.district}\n`;
            output += `-------------------\n`;
        });

        fs.writeFileSync('roles_debug.txt', output);
        console.log("Debug info written to roles_debug.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRoles();
