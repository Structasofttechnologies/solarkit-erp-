import mongoose from 'mongoose';

const campaignConfigSchema = new mongoose.Schema({
    campaignTypes: [{
        type: String,
        trim: true
    }],
    conversions: {
        type: Map,
        of: Number,
        default: {}
    },
    cprmConversion: {
        type: Number,
        default: 0
    },
    companyConversion: {
        type: Number,
        default: 0
    },
    defaultCompanyBudget: {
        type: Number,
        default: 0
    },
    defaultCprmBudget: {
        type: Number,
        default: 0
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    partnerType: {
        type: String,
        trim: true
    },
    plans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PartnerPlan'
    }],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Removed singleton logic - now supporting multiple configuration records
export default mongoose.model('CampaignConfig', campaignConfigSchema);
