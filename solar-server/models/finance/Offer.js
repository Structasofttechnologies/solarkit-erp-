import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
    {
        offerName: {
            type: String,
            required: true
        },
        offerType: {
            type: String,
            enum: ['Solar Cashback', 'Loyalty Program', 'Limited Stock', 'Referral Bonus', 'Cashback Offer', 'Limited Stock Offer', 'Seasonal Discount', 'Global Announcement'],
            required: true
        },

        // Common Fields
        cpType: String, // Channel Partner Type
        projectType: String,
        brand: String,
        kwSelection: String,
        description: String,
        offerImage: String,
        images: [String],

        // Solar Cashback Specific
        cashbackAmount: Number,
        targetKw: Number,

        // Loyalty Program Specific
        yearCashbacks: [{
            years: Number,
            cashback: Number
        }],

        // Limited Stock Specific
        bundlePlan: String,
        currentStock: Number,
        product: String,
        deadline: Date,
        cashbackValue: Number,

        // Validity
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        autoRenew: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Expired'],
            default: 'Active'
        },

        // Location
        state: String, // Keeping as string to match frontend 'Gujarat', 'Maharashtra' etc or we can map to ObjectId if needed. 
        // For now frontend sends names, so we will store names or need a mapping.
        // Given the requirement "Database Driven", we should ideally use ObjectIds, but the frontend currently hardcodes these strings.
        // I will use String for now to match the "Convert" requirement without breaking the UI excessive refactor, 
        // but the best practice is ObjectId. 
        // The user asked for "No static data allowed", so eventually these locations should come from the DB.
        // I will assume the Location Management system exists (as seen in models like State.js).
        // So I will try to use ObjectIds but allow strings if easier for now. 
        // Let's stick to consistent Location IDs if possible.

        // But looking at the frontend Offers.jsx:
        // const clusters = { "Gujarat": ["Rajkot", ...], ... }
        // It uses hardcoded objects.
        // I will stick to mixed schema or strings to support the transition.

        // Category filtering support
        category: String,
        subCategory: String,
        plans: [String],

        location: {
            country: String,
            state: String,
            cluster: String,
            district: String
        }
    },
    {
        timestamps: true
    }
);

// Middleware to check expiry
offerSchema.pre('save', function (next) {
    const now = new Date();
    if (this.endDate && this.endDate < now) {
        this.status = 'Expired';
    }
    next();
});

export default mongoose.model('Offer', offerSchema);
