import mongoose from 'mongoose';

const partnerUserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        mobileNumber: {
            type: String,
            required: [true, 'Mobile number is required'],
            unique: true,
            trim: true
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: [true, 'State is required']
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: [true, 'District is required']
        },
        aadhaarNumber: {
            type: String,
            trim: true
        },
        partnerType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
            required: [true, 'Partner type is required']
        },
        industryType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PartnerIndustryType'
        },
        professionType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PartnerProfession'
        },
        hasShopOffice: {
            type: Boolean,
            default: false
        },
        hasGST: {
            type: Boolean,
            default: false
        },
        businessType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusinessType'
        },
        gstPartnerType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner'
        },
        gstNumber: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'pending'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

// Indexes for efficient querying
partnerUserSchema.index({ partnerType: 1, status: 1 });
partnerUserSchema.index({ state: 1, district: 1 });

export default mongoose.model('PartnerUser', partnerUserSchema);
