import mongoose from 'mongoose';
import CompanyUser from '../models/users/CompanyUser.js';

async function seedDummyUser() {
  try {
    await mongoose.connect('mongodb+srv://w3bfranceoperations_db_user:BpXlfVpX5yF9eaeA@cluster0.p7gs1gy.mongodb.net/solarkit?appName=Cluster0');
    
    const dummyUser = new CompanyUser({
      fullName: 'Dummy Test User',
      mobileNumber: '9999999999',
      emailAddress: 'dummytest@example.com',
      district: 'Ahmedabad', // Using a generic district
      projectTypes: [
        {
          type: '6a2009dd1d8856ba67b6770b', // ID for "residencial 10 to 16Kw"
          count: 5,
          deadline: new Date('2026-12-31')
        }
      ],
      partnerTypes: [
        {
          type: 'Dealer', 
          count: 2,
          deadline: new Date('2026-12-31')
        }
      ],
      status: 'active'
    });

    await dummyUser.save();
    console.log('Dummy user inserted successfully with ID:', dummyUser._id);
  } catch (error) {
    console.error('Error inserting dummy user:', error);
  } finally {
    process.exit(0);
  }
}

seedDummyUser();
