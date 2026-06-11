import mongoose from "mongoose";
import SubCategory from "./models/inventory/SubCategory.js";
import ProjectCategoryMapping from "./models/projects/ProjectCategoryMapping.js";

async function run() {
  await mongoose.connect('mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0');
  
  const ids = ['6a2022984854a9e4b4427747'];
  const subCategories = await SubCategory.find({
    status: true,
    $or: [
      { unique_id: { $in: ids } },
      { _id: { $in: ids } }
    ]
  });
  
  const subCategoryIds = subCategories.map(sc => sc._id);
  console.log('subCategoryIds:', subCategoryIds);
  
  const mappings = await ProjectCategoryMapping.find({
    subCategoryId: { $in: subCategoryIds },
    status: true
  }).sort({ createdAt: -1 });
  
  console.log('mappings.length:', mappings.length);

  const uniqueProjectTypesMap = {};
  mappings.forEach(m => {
    const name = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
    if (!uniqueProjectTypesMap[name]) {
       uniqueProjectTypesMap[name] = {
          _id: m._id, 
          name: name,
          status: m.status,
          subCategoryId: m.subCategoryId,
          projectTypeFrom: m.projectTypeFrom,
          projectTypeTo: m.projectTypeTo
       };
    }
  });

  console.log('uniqueProjectTypesMap:', uniqueProjectTypesMap);
  process.exit(0);
}

run().catch(console.error);
