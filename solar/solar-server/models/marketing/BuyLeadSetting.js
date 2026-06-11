import mongoose from 'mongoose';

const buyLeadSettingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    projectType: {
        type: String,
        required: true
    },
    subProjectType: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    areaType: {
        type: String,
        required: true,
        enum: ['urban', 'rural', 'both']
    },
    cluster: {
        type: String
    },
    numLeads: {
        type: Number,
        required: true,
        min: 1
    },
    totalKW: {
        type: Number,
        required: true,
        min: 1
    },
    totalRupees: {
        type: Number,
        required: true,
        min: 0
    },
    perLeadRupees: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    currentLeadsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const BuyLeadSetting = mongoose.model('BuyLeadSetting', buyLeadSettingSchema);

export default BuyLeadSetting;
