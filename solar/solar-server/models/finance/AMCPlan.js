import mongoose from 'mongoose';

const amcPlanSchema = new mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMCService'
    }],
    planName: {
        type: String,
        required: true,
        default: 'Basic Plan'
    },
    category: {
        type: String,
        default: 'Solar Rooftop'
    },
    subCategory: {
        type: String,
        default: 'Residential'
    },
    projectType: {
        type: String,
        default: '3-5 kW'
    },
    subProjectType: {
        type: String,
        default: 'On-Grid'
    },
    monthlyCharge: {
        type: Number,
        default: 0
    },
    yearlyCharge: {
        type: Number,
        default: 0
    },
    paymentType: {
        type: String,
        enum: ['Monthly', 'Annually', 'Both'],
        default: 'Monthly'
    },
    amcDuration: {
        type: Number,
        default: 12
    },
    monthlyVisits: {
        type: Number,
        default: 1,
        min: 1,
        max: 30
    },
    annualVisits: {
        type: Number,
        default: 4
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    description: String,
    basicPricePerKw: {
        type: Number,
        default: 0,
        min: 0
    },
    amcServiceCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    guaranteePerUnitPrice: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model('AMCPlan', amcPlanSchema);
