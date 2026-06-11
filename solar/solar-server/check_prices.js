import mongoose from 'mongoose';

const DB_URI = 'mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0';

async function run() {
  await mongoose.connect(DB_URI);
  console.log('Connected to DB');

  const ProductPrice = mongoose.model('ProductPrice', new mongoose.Schema({}, { strict: false }));
  const SKU = mongoose.model('SKU', new mongoose.Schema({}, { strict: false }));

  const prices = await ProductPrice.find().lean();
  console.log(`Found ${prices.length} prices:`);

  for (const p of prices) {
    const skuDoc = await SKU.findById(p.sku).lean();
    console.log(`- SKU ID: ${p.sku} | Price: ${p.price} | Code: ${skuDoc ? skuDoc.skuCode : 'Unknown'}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
