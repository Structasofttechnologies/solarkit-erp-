import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ac-acne8yh-shard-00-00.p7gs1gy.mongodb.net/test'; // Fallback if env missing

async function dropProblematicIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const collection = mongoose.connection.db.collection('partnerplans'); // Mongoose pluralizes by default
        
        console.log('Fetching indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const indexName = 'partnerType_1_country_1_state_1_cluster_1_district_1_name_1';
        
        const exists = indexes.find(idx => idx.name === indexName);
        if (exists) {
            console.log(`Dropping index: ${indexName}...`);
            await collection.dropIndex(indexName);
            console.log('Index dropped successfully.');
        } else {
            console.log('Index not found. It might have a different name.');
            // Try to find any index that has more than one of these fields
            const problematic = indexes.find(idx => {
                const keys = Object.keys(idx.key);
                return keys.includes('partnerType') && keys.includes('country');
            });
            if (problematic) {
                console.log(`Dropping problematic index: ${problematic.name}...`);
                await collection.dropIndex(problematic.name);
                console.log('Index dropped successfully.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

dropProblematicIndex();
