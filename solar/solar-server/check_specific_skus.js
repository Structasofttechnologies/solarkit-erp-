import mongoose from 'mongoose';

const DB_URI = 'mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0';

async function run() {
  await mongoose.connect(DB_URI);
  console.log('Connected to DB');

  const ProductPrice = mongoose.model('ProductPrice', new mongoose.Schema({}, { strict: false }));

  const skuIds = [
    new mongoose.Types.ObjectId('6a26b8e05cae4f698dd9b14c'),
    new mongoose.Types.ObjectId('6a26b9135cae4f698dd9b14d')
  ];

  const prices = await ProductPrice.find({ sku: { $in: skuIds } }).lean();
  console.log('Prices for the new SKUs:', prices);

  await mongoose.disconnect();
}

run().catch(console.error);
