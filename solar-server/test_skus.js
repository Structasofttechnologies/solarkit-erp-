import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0').then(async () => {
  const SKU = mongoose.model('SKU', new mongoose.Schema({}, { strict: false }));
  const skus = await SKU.find().sort({_id: -1}).limit(10).lean();
  console.log('--- LATEST 10 SKUS ---');
  skus.forEach(s => {
    console.log('SKU:', s.skuCode, '| Cat:', s.category, '| Tech:', s.technology, '| Watt:', s.wattage, '| Cap:', s.capacity);
  });
  process.exit();
});
