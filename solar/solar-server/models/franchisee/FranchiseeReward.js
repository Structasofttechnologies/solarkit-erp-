import mongoose from 'mongoose';

const franchiseeRewardSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['product', 'experience', 'project_point', 'redeem_setting'],
            required: true
        },
        name: { // For product/experience
            type: String,
            trim: true
        },
        description: { // For product/experience
            type: String
        },
        points: {
            type: Number,
            required: true
        },
        // Fields for project_point type
        categoryType: {
            type: String
        },
        subCategory: {
            type: String
        },
        projectType: {
            type: String
        },
        subProjectType: {
            type: String
        },
        kw: {
            type: Number
        },
        // Common
        isActive: {
            type: Boolean,
            default: true
        },
        // Redeem settings (single document check in controller)
        isRedeemSetting: {
            type: Boolean,
            default: false
        },
        minRedeemPoints: {
            type: Number
        },
        redeemFrequency: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('FranchiseeReward', franchiseeRewardSchema);
