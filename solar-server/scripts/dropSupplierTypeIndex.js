import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://your-connection-string';

async function dropIndex() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('suppliertypes');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop existing unique index on loginTypeName if it exists
    for (const idx of indexes) {
        if (idx.key && idx.key.loginTypeName !== undefined && idx.unique) {
            console.log(`Dropping unique index: ${idx.name}`);
            await collection.dropIndex(idx.name);
            console.log('Index dropped successfully');
        }
    }

    console.log('Done!');
    process.exit(0);
}

dropIndex().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
