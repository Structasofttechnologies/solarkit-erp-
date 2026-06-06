import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'active' },
  mobile: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const passwordHash123456 = await bcrypt.hash('123456', 10);
    const passwordHash123 = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@solarkits.com',
        mobile: '0000000001',
        password: passwordHash123456,
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Dealer User',
        email: 'dealer@solarkits.com',
        mobile: '0000000002',
        password: passwordHash123456,
        role: 'dealer',
        status: 'active'
      },
      {
        name: 'Franchise User',
        email: 'franchise@solarkits.com',
        mobile: '0000000003',
        password: passwordHash123456,
        role: 'franchisee',
        status: 'active'
      },
      {
        name: 'Dealer Manager',
        email: 'dealermanager@solarkits.com',
        mobile: '0000000004',
        password: passwordHash123,
        role: 'dealerManager',
        status: 'active'
      },
      {
        name: 'Franchise Manager',
        email: 'franchisemanager@example.com',
        mobile: '0000000005',
        password: passwordHash123,
        role: 'franchiseeManager',
        status: 'active'
      },
      {
        name: 'Account Manager',
        email: 'accountmanager@solarkits.com',
        mobile: '0000000006',
        password: passwordHash123,
        role: 'accountManager',
        status: 'active'
      },
      {
        name: 'Delivery Manager',
        email: 'deliverymanager@solarkits.com',
        mobile: '0000000007',
        password: passwordHash123,
        role: 'deliveryManager',
        status: 'active'
      }
    ];

    for (const user of testUsers) {
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`User ${user.email} already exists, updating password and role...`);
        existing.password = user.password;
        existing.role = user.role;
        await existing.save();
      } else {
        console.log(`Creating user ${user.email}...`);
        await User.create(user);
      }
    }

    console.log('All test users seeded successfully.');
  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedTestUsers();
