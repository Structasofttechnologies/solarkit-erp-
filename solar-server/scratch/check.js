import mongoose from 'mongoose';
import CompanyUser from '../models/users/CompanyUser.js';
import ProjectType from '../models/projects/ProjectType.js';
import SubProjectType from '../models/projects/SubProjectType.js';

async function test() {
  await mongoose.connect('mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0');
  
  const users = await CompanyUser.find({}).lean();
  console.log("=== USERS ===");
  console.log(JSON.stringify(users.map(u => ({ id: u._id, pTypes: u.projectTypes, partnerTypes: u.partnerTypes })), null, 2));

  const pTypes = await ProjectType.find({}).lean();
  console.log("=== PROJECT TYPES ===");
  console.log(JSON.stringify(pTypes.map(p => ({ id: p._id, name: p.name, unique_id: p.unique_id })), null, 2));

  const subPTypes = await SubProjectType.find({}).lean();
  console.log("=== SUB PROJECT TYPES ===");
  console.log(JSON.stringify(subPTypes.map(p => ({ id: p._id, name: p.name, unique_id: p.unique_id, projectTypeId: p.projectTypeId })), null, 2));

  process.exit(0);
}
test();
