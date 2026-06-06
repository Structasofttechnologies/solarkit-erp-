import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0').then(async () => {
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const SubCategory = mongoose.model('SubCategory', new mongoose.Schema({}, { strict: false }));
  const Technology = mongoose.model('Technology', new mongoose.Schema({ name: String }, { strict: false }));
  const PanelWatt = mongoose.model('PanelWatt', new mongoose.Schema({ name: String }, { strict: false }));
  const SKU = mongoose.model('SKU', new mongoose.Schema({}, { strict: false }));

  const catId = '69b1168934baff02cf91eb91';
  const subCatId = '6a2022984854a9e4b4427747';
  const techId = '6a211cbdc7a75dd86e81cb5f';
  const pWattId = '6a212070cd2ea42e8c527b03';
  const brandId = '69a74ce7003424b96e791c7b';

  const cat = await Category.findById(catId).lean();
  const subCat = await SubCategory.findById(subCatId).lean();
  const tech = await Technology.findById(techId).lean();
  const pWatt = await PanelWatt.findById(pWattId).lean();

  console.log('Filters:');
  console.log('Category:', cat?.name);
  console.log('SubCategory:', subCat?.name);
  console.log('BrandId:', brandId);
  console.log('Technology:', tech?.name);
  console.log('PanelWatt doc:', pWatt);

  const query = {
    status: true,
    category: cat?.name,
    subCategory: subCat?.name,
    brand: new mongoose.Types.ObjectId(brandId),
  };

  if (tech) query.technology = { $regex: new RegExp(tech.name, "i") };
  
  const parsedWatt = pWatt ? Number(pWatt.name.toString().replace(/kw|w/ig, '').trim()) : null;
  if (parsedWatt && !isNaN(parsedWatt)) query.wattage = parsedWatt;

  console.log('\nQuery built:', JSON.stringify(query));
  
  const skus = await SKU.find(query).limit(5).lean();
  console.log('\nSKUs matching EXACT query:', skus.length);
  skus.forEach(s => {
    console.log('SKU:', s.skuCode, 'SubCat:', s.subCategory, 'Tech:', s.technology, 'Watt:', s.wattage);
  });

  // What DOES exist for this brand?
  const brandSkus = await SKU.find({ brand: new mongoose.Types.ObjectId(brandId) }).limit(5).lean();
  console.log('\nWhat does exist for Brand', brandId, '? Found:', brandSkus.length);
  brandSkus.forEach(s => {
    console.log('SKU:', s.skuCode, 'Cat:', s.category, 'SubCat:', s.subCategory, 'Tech:', s.technology, 'Watt:', s.wattage);
  });

  process.exit();
});
