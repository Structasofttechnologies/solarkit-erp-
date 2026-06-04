import mongoose from 'mongoose';

const companyUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    // mobileNumber is the ONLY credential needed to login — no password
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    district: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'company_user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // Partner Goals
    partnerGoalsEnabled: {
      type: Boolean,
      default: false,
    },
    partnerMonthlyTargetKw: {
      type: Number,
      default: 0,
    },
    partnerPerKwCommission: {
      type: Number,
      default: 0,
    },
    partnerQuotePermissions: {
      create: { type: Boolean, default: false },
      edit:   { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    partnerTypes: [
      {
        type:     { type: String },
        count:    { type: Number },
        deadline: { type: Date },
      }
    ],

    // Project Goals
    projectGoalEnabled: {
      type: Boolean,
      default: false,
    },
    projectMonthlyTargetKw: {
      type: Number,
      default: 0,
    },
    projectPerKwCommission: {
      type: Number,
      default: 0,
    },
    projectTypes: [
      {
        type:     { type: String },
        count:    { type: Number },
        deadline: { type: Date },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model('CompanyUser', companyUserSchema);
