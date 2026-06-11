import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = 'mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0';

async function dropIndexes() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const partnerPlans = mongoose.connection.db.collection('partnerplans');
        const indexes = await partnerPlans.indexes();
        console.log('Current indexes on partnerplans:', JSON.stringify(indexes, null, 2));

        for (const index of indexes) {
            if (index.name !== '_id_') {
                console.log(`Dropping index: ${index.name}`);
                await partnerPlans.dropIndex(index.name);
            }
        }
        
        console.log('Finished dropping indexes');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndexes();
