import mongoose from 'mongoose';

const dealerRewardSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['product', 'cashback', 'experience', 'project_point_rule', 'redeem_settings']
        },
        // Common fields
        name: {
            type: String, // For products, cashback name, experience name
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

        // Redeem Settings (stored as a special single document usually, or handled separately)
        // We can use a separate collection or a specific type 'settings' for this if needed.
        // implementing as part of this model with type='settings' for simplicity if needed, 
        // or just separate fields in a different config model. 
        // For now, let's keep it consistent.
    },
    {
        timestamps: true
    }
);

export default mongoose.model('DealerReward', dealerRewardSchema);
