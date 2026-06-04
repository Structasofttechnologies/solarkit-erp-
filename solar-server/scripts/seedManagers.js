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

async function seedManagers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const passwordHash = await bcrypt.hash('password123', 10);

    const managers = [
      {
        name: 'Account Manager',
        email: 'accountmanager@solarkits.com',
        mobile: '1111111111',
        password: passwordHash,
        role: 'accountManager',
        status: 'active'
      },
      {
        name: 'Delivery Manager',
        email: 'deliverymanager@solarkits.com',
        mobile: '2222222222',
        password: passwordHash,
        role: 'deliveryManager',
        status: 'active'
      }
    ];

    for (const mgr of managers) {
      const existing = await User.findOne({ email: mgr.email });
      if (existing) {
        console.log(`User ${mgr.email} already exists, updating password...`);
        existing.password = passwordHash;
        existing.role = mgr.role;
        await existing.save();
      } else {
        console.log(`Creating user ${mgr.email}...`);
        await User.create(mgr);
      }
    }

    console.log('Managers seeded successfully.');
  } catch (error) {
    console.error('Error seeding managers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedManagers();
