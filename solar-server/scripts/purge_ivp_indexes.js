import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    let out = 'RUNNING_FIX:\n';

    const collName = 'installervendorplans';
    const coll = db.collection(collName);

    const indexes = await coll.indexes();
    out += `Indexes Before: ${JSON.stringify(indexes, null, 2)}\n`;

    for (const idx of indexes) {
        if (idx.name !== '_id_') {
            try {
                await coll.dropIndex(idx.name);
                out += `DROPPED ${idx.name}\n`;
            } catch (e) {
                out += `FAILED ${idx.name}: ${e.message}\n`;
            }
        }
    }

    // Try explicit drop of the field name mentioned in error if not already dropped
    try {
        await coll.dropIndex('name_1_district_1');
        out += `EXPLICIT DROPPED name_1_district_1\n`;
    } catch (e) {
        out += `EXPLICIT FAILED name_1_district_1: ${e.message}\n`;
    }

    fs.writeFileSync('fix_out.txt', out);
    console.log('Fix details in fix_out.txt');
    await mongoose.disconnect();
}
fix();
