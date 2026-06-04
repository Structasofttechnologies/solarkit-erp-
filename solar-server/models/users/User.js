import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'dealer', 'franchisee', 'dealerManager', 'franchiseeManager', 'delivery_manager', 'installer', 'employee'], // Added employee for dynamic roles
      default: 'dealer',
    },
    dynamicRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      default: null,
    },
    cluster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
      default: null,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    companyName: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    gstin: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'approved', 'rejected', 'Notice Period', 'Resigned'],
      default: 'pending',
    },
    partnerType: {
      type: String,
      enum: ['Franchisee', 'Dealer', 'Direct', 'Channel Partner', 'Other'],
      default: 'Other'
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerPlan',
      default: null
    },
    profileImage: {
      type: String,
      default: null,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 5,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    trainingCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Leave Management & Tracking
    employeeStatus: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present'
    },
    absentDays: {
      type: Number,
      default: 0
    },
    temporaryIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    pendingTasks: {
      type: Number,
      default: 0
    },
    overdueTasks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
