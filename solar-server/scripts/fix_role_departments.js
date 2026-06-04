import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

/**
 * Correction Logic:
 * 1. Find all departments and group by name and country.
 * 2. Find all countries and group by ID.
 * 3. Find all roles.
 * 4. For each role:
 *    - Determine its country (either from role.country or assigned default if null and state is Indian).
 *    - Find the department with the SAME name as the role's current department but for the CORRECT country.
 *    - Update the role's department ID.
 */

async function fixRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const roles = await mongoose.connection.collection('roles').find({}).toArray();
        const depts = await mongoose.connection.collection('departments').find({}).toArray();
        const countries = await mongoose.connection.collection('countries').find({}).toArray();
        const states = await mongoose.connection.collection('states').find({}).toArray();

        const countryMap = {}; countries.forEach(c => countryMap[c._id.toString()] = c);
        const stateMap = {}; states.forEach(s => stateMap[s._id.toString()] = s);

        // Dept map: name_countryId -> deptId
        const deptLookup = {};
        depts.forEach(d => {
            const countryName = d.country; // This is a string name in the depts collection? 
            // In debug it showed: Country: India or Country: United Arab Emirates
            deptLookup[`${d.name.toLowerCase()}_${countryName.toLowerCase()}`] = d._id;
        });

        console.log("Starting correction...");
        let count = 0;

        for (const role of roles) {
            const currentDeptId = role.department?.toString();
            const currentDept = depts.find(d => d._id.toString() === currentDeptId);
            if (!currentDept) continue;

            const deptName = currentDept.name.toLowerCase();

            // Determine target country name for the role
            let targetCountryName = "";
            const roleCountryId = role.country?.toString();
            if (roleCountryId && countryMap[roleCountryId]) {
                targetCountryName = countryMap[roleCountryId].name.toLowerCase();
            } else if (role.state && stateMap[role.state.toString()]) {
                // Infer from state if country is null
                const state = stateMap[role.state.toString()];
                // We assume if it has an Indian state, it's India
                // In this DB, Gujarat is India.
                targetCountryName = "india";
            } else {
                // Default to India for legacy nulls
                targetCountryName = "india";
            }

            const targetDeptId = deptLookup[`${deptName}_${targetCountryName}`];

            if (targetDeptId && targetDeptId.toString() !== currentDeptId) {
                console.log(`Updating Role: ${role.name} (${role.level}) - Dept: ${currentDept.name} -> Target Country: ${targetCountryName}`);
                await mongoose.connection.collection('roles').updateOne(
                    { _id: role._id },
                    { $set: { department: targetDeptId } }
                );
                count++;
            } else if (!targetDeptId) {
                console.warn(`Could not find department ${deptName} for country ${targetCountryName} for role ${role.name}`);
            }
        }

        console.log(`Finished! Updated ${count} roles.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixRoles();
