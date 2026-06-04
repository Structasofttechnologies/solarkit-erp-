import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        let log = 'COLLECTIONS_LIST:\n';
        for (const coll of collections) {
            log += `- ${coll.name}\n`;
            const indexes = await db.collection(coll.name).indexes();
            log += `  Indexes: ${JSON.stringify(indexes, null, 2)}\n\n`;
        }
        fs.writeFileSync('diag_output.txt', log);
        console.log('Diagnosis written to diag_output.txt');
        await mongoose.disconnect();
    } catch (err) {
        fs.writeFileSync('diag_output.txt', err.stack);
        process.exit(1);
    }
}
checkCollections();
