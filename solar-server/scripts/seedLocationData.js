import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Country from '../models/core/Country.js';
import State from '../models/core/State.js';
import District from '../models/core/District.js';
import Cluster from '../models/core/Cluster.js';
import Zone from '../models/core/Zone.js';
import City from '../models/core/City.js';
import User from '../models/users/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedLocations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // We can use a random admin user as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    const createdBy = adminUser ? adminUser._id : null;

    // 1. Create Country (India)
    console.log('Creating Country: India...');
    let india = await Country.findOne({ name: 'India' });
    if (!india) {
      india = await Country.create({ name: 'India', isActive: true, createdBy });
    }

    // 2. Create State (Gujarat)
    console.log('Creating State: Gujarat...');
    let gujarat = await State.findOne({ name: 'Gujarat', country: india._id });
    if (!gujarat) {
      gujarat = await State.create({ name: 'Gujarat', country: india._id, isActive: true, createdBy });
    }

    // 3. Create Districts
    console.log('Creating Districts...');
    const districtNames = ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Bhavnagar'];
    const districtDocs = [];
    for (const dName of districtNames) {
      let d = await District.findOne({ name: dName, state: gujarat._id });
      if (!d) {
        d = await District.create({ name: dName, state: gujarat._id, country: india._id, isActive: true, createdBy });
      }
      districtDocs.push(d);
    }

    // 4. Create Clusters
    console.log('Creating Clusters...');
    let saurashtraCluster = await Cluster.findOne({ name: 'Saurashtra Cluster', state: gujarat._id });
    if (!saurashtraCluster) {
      const saurashtraDistricts = districtDocs.filter(d => ['Rajkot', 'Bhavnagar'].includes(d.name)).map(d => d._id);
      saurashtraCluster = await Cluster.create({
        name: 'Saurashtra Cluster',
        state: gujarat._id,
        country: india._id,
        districts: saurashtraDistricts,
        isActive: true,
        createdBy
      });
    }

    let centralCluster = await Cluster.findOne({ name: 'Central Gujarat Cluster', state: gujarat._id });
    if (!centralCluster) {
      const centralDistricts = districtDocs.filter(d => ['Ahmedabad', 'Vadodara'].includes(d.name)).map(d => d._id);
      centralCluster = await Cluster.create({
        name: 'Central Gujarat Cluster',
        state: gujarat._id,
        country: india._id,
        districts: centralDistricts,
        isActive: true,
        createdBy
      });
    }

    let southCluster = await Cluster.findOne({ name: 'South Gujarat Cluster', state: gujarat._id });
    if (!southCluster) {
      const southDistricts = districtDocs.filter(d => ['Surat'].includes(d.name)).map(d => d._id);
      southCluster = await Cluster.create({
        name: 'South Gujarat Cluster',
        state: gujarat._id,
        country: india._id,
        districts: southDistricts,
        isActive: true,
        createdBy
      });
    }

    // 5. Create Zones
    console.log('Creating Zones...');
    const zonesData = [
      { name: 'Ahmedabad North Zone', cluster: centralCluster._id, districts: [districtDocs.find(d => d.name === 'Ahmedabad')._id] },
      { name: 'Ahmedabad South Zone', cluster: centralCluster._id, districts: [districtDocs.find(d => d.name === 'Ahmedabad')._id] },
      { name: 'Surat City Zone', cluster: southCluster._id, districts: [districtDocs.find(d => d.name === 'Surat')._id] },
      { name: 'Rajkot Central Zone', cluster: saurashtraCluster._id, districts: [districtDocs.find(d => d.name === 'Rajkot')._id] }
    ];

    const zoneDocs = [];
    for (const zData of zonesData) {
      let z = await Zone.findOne({ name: zData.name, cluster: zData.cluster });
      if (!z) {
        z = await Zone.create({
          ...zData,
          state: gujarat._id,
          country: india._id,
          isActive: true,
          createdBy
        });
      }
      zoneDocs.push(z);
    }

    // 6. Create Cities
    console.log('Creating Cities...');
    const citiesData = [
      { name: 'Navrangpura', zone: zoneDocs[0]._id, cluster: centralCluster._id, district: districtDocs.find(d => d.name === 'Ahmedabad')._id },
      { name: 'Bopal', zone: zoneDocs[0]._id, cluster: centralCluster._id, district: districtDocs.find(d => d.name === 'Ahmedabad')._id },
      { name: 'Maninagar', zone: zoneDocs[1]._id, cluster: centralCluster._id, district: districtDocs.find(d => d.name === 'Ahmedabad')._id },
      { name: 'Adajan', zone: zoneDocs[2]._id, cluster: southCluster._id, district: districtDocs.find(d => d.name === 'Surat')._id },
      { name: 'Varachha', zone: zoneDocs[2]._id, cluster: southCluster._id, district: districtDocs.find(d => d.name === 'Surat')._id },
      { name: 'Kalawad Road', zone: zoneDocs[3]._id, cluster: saurashtraCluster._id, district: districtDocs.find(d => d.name === 'Rajkot')._id }
    ];

    for (const cData of citiesData) {
      let c = await City.findOne({ name: cData.name, zone: cData.zone });
      if (!c) {
        c = await City.create({
          ...cData,
          state: gujarat._id,
          country: india._id,
          areaType: 'Urban',
          isActive: true,
          createdBy
        });
      }
    }

    console.log('Location seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedLocations();
