import mongoose from 'mongoose';

const socialMediaCampaignSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true
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
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    quarter: {
        type: String,
        enum: ['January-March', 'April-June', 'July-September', 'October-December'],
        required: true
    },
    budget: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

export default mongoose.model('SocialMediaCampaign', socialMediaCampaignSchema);
