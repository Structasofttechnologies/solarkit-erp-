import mongoose from 'mongoose';
import https from 'https';

const getPublicIP = () => {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).ip);
        } catch (e) {
          resolve('Could not fetch IP');
        }
      });
    }).on('error', () => resolve('Could not fetch IP (network error)'));
  });
};

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState >= 1) {
    console.log('✅ MongoDB is already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Provide diagnostic information for common Atlas issues
    if (error.message.includes('Could not connect to any servers') || error.message.includes('IP address')) {
      const publicIP = await getPublicIP();
      console.log('\n--------------------------------------------------------------');
      console.log('🚨 DIAGNOSTIC: This usually means your IP is NOT whitelisted in MongoDB Atlas.');
      console.log(`🖥️  Your current Public IP is: ${publicIP}`);
      console.log('👉 To fix this:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to "Network Access" under the Security section.');
      console.log('3. Click "Add IP Address" and then "Add Current IP Address".');
      console.log('4. Alternatively, add 0.0.0.0/0 to allow access from anywhere (for development only).');
      console.log('--------------------------------------------------------------\n');
    }

    process.exit(1);
  }
};

export default connectDB;
