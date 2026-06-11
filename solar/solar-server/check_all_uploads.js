import mongoose from 'mongoose';

const DB_URI = 'mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0';

async function run() {
  await mongoose.connect(DB_URI);
  console.log('Connected to DB');

  const SKU = mongoose.model('SKU', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const skus = await SKU.find().lean();
  console.log(`Checking ${skus.length} SKUs...`);
  for (const s of skus) {
    // Check all fields of SKU for any string containing '/uploads/' or 'data:image'
    for (const [key, value] of Object.entries(s)) {
      const valStr = JSON.stringify(value);
      if (valStr.includes('/uploads/') || valStr.includes('data:image')) {
        console.log(`Found match in SKU ${s.skuCode} (${s._id}) under field [${key}]:`);
        console.log(valStr.substring(0, 300));
      }
    }
  }

  const products = await Product.find().lean();
  console.log(`Checking ${products.length} Products...`);
  for (const p of products) {
    for (const [key, value] of Object.entries(p)) {
      const valStr = JSON.stringify(value);
      if (valStr.includes('/uploads/') || valStr.includes('data:image')) {
        console.log(`Found match in Product ${p.name} (${p._id}) under field [${key}]:`);
        console.log(valStr.substring(0, 300));
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
