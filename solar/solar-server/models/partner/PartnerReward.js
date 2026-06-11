import mongoose from 'mongoose';

const partnerRewardSchema = new mongoose.Schema(
    {
        partnerType: {
            type: String, // 'Dealer', 'Franchisee', 'Channel Partner', etc.
            required: true,
            index: true
        },
        plan: {
            type: String, // Plan name like 'Freelancer Dealer', 'Premium Dealer', etc.
            index: true
        },
        type: {
            type: String,
            required: true,
            // Combined enum from Dealer and Franchisee schemas
            enum: ['product', 'cashback', 'experience', 'project_point', 'project_point_rule', 'redeem_setting', 'redeem_settings']
        },
        // Common fields
        name: {
            type: String,
            trim: true
        },
        description: {
            type: String
        },
        points: {
            type: Number,
            default: 0
        },
        image: {
            type: String // Base64 or URL
        },
        isActive: {
            type: Boolean,
            default: true
        },

        // Product specific
        category: {
            type: String // electronics, vehicles, etc.
        },

        // Cashback specific
        amount: {
            type: Number
        },
        couponCode: {
            type: String
        },
        redemptionMethod: {
            type: String
        },

        // Experience specific
        duration: {
            type: Number // in days
        },
        location: {
            type: String
        },

        // Project Point Rule specific
        projectRule: {
            categoryType: String, // solar_rooftop, solar_pump
            subCategory: String, // residential, commercial, agricultural
            projectType: String, // 3kw-5kw, etc.
            subProjectType: String, // on-grid, off-grid
            pointsPerKw: Number
        },
        // Franchisee specific project point fields
        categoryType: String,
        subCategory: String,
        projectType: String,
        subProjectType: String,
        kw: Number,

        // Redeem Settings 
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
        timestamps: true
    }
);

export default mongoose.model('PartnerReward', partnerRewardSchema);
