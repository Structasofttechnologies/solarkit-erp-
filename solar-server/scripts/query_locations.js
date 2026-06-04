import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.getClient().db();
    const states = await db.collection('states').find({}).toArray();
    console.log('States:', states.map(s => `"${s.name}"`));
    const clusters = await db.collection('clusters').find({}).toArray();
    console.log('Clusters:', clusters.map(c => `"${c.name}"`));
    const districts = await db.collection('districts').find({}).toArray();
    console.log('Districts:', districts.map(d => `"${d.name}"`));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
