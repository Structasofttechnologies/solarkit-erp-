import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function dropAllUniqueIndexes() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const collection = db.collection('suppliertypes');

    const indexes = await collection.indexes();
    console.log('\n=== Current indexes ===');
    indexes.forEach(i => console.log(`  Name: ${i.name}, Keys: ${JSON.stringify(i.key)}, Unique: ${i.unique || false}`));

    // Drop every unique index except _id_
    for (const idx of indexes) {
        if (idx.name === '_id_') continue; // never drop _id index
        if (idx.unique) {
            try {
                await collection.dropIndex(idx.name);
                console.log(`✅ Dropped unique index: ${idx.name}`);
            } catch(e) {
                console.log(`⚠️ Could not drop ${idx.name}: ${e.message}`);
            }
        } else {
            console.log(`Skipping non-unique index: ${idx.name}`);
        }
    }

    const remaining = await collection.indexes();
    console.log('\n=== Remaining indexes ===');
    remaining.forEach(i => console.log(`  Name: ${i.name}, Keys: ${JSON.stringify(i.key)}, Unique: ${i.unique || false}`));

    await mongoose.disconnect();
    console.log('\nDone! All unique indexes removed.');
}

dropAllUniqueIndexes().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
