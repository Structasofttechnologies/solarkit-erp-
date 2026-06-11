import mongoose from 'mongoose';

const partnerPlanSchema = new mongoose.Schema(
    {
        partnerType: [{
            type: String, // 'Dealer', 'Franchisee', 'Channel Partner', etc.
        }],
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: { // Replaces 'message' from DealerPlan and 'description' from FranchiseePlan
            type: String,
            default: ''
        },
        price: {
            type: Number, // Storing as number for consistency
            required: true
        },
        priceDescription: { // From FranchiseePlan
            type: String,
            default: 'signup fees'
        },
        yearlyTargetKw: { // Unified target
            type: Number,
            default: 0
        },
        cashbackAmount: { // Unified incentive amount
            type: Number,
            default: 0
        },
        accessType: { // From FranchiseePlan and DealerPlan ui.accessType
            type: String,
            default: ''
        },
        userLimit: {
            type: Number, // -1 for unlimited
            default: 1
        },
        userDescription: {
            type: String,
            default: ''
        },
        projectTypes: [{ // From FranchiseePlan
            name: String,
            image: String
        }],
        features: [{
            type: String
        }],
        documents: [{
            type: String
        }],
        depositFees: {
            type: Number,
            default: 0
        },
        country: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country'
        }],
        state: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State'
        }],
        cluster: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster'
        }],
        district: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District'
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        // We will store the deeply nested configurations in `config` like DealerPlan 
        // OR `franchiseeConfig` if it's highly specific. For a unified plan, `config` object helps.
        config: {
            type: mongoose.Schema.Types.Mixed, // Using Mixed to accommodate flexible deeply nested structures from both forms
            default: {}
        },
        ui: {
            headerColor: String,
            buttonColor: String,
            icon: String, // For DealerPlan rockets/etc or FranchiseePlan
            iconColor: String,
            bgColor: String
        }
    },
    {
        timestamps: true
    }
);



export default mongoose.model('PartnerPlan', partnerPlanSchema);
