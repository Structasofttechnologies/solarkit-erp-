import mongoose from 'mongoose';

const amcServiceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    // Optional link to a plan if needed, but not required for master list
    amcPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMCPlan'
    },
    description: String,
    serviceType: {
        type: String, // regular, preventive, emergency, special
        default: 'regular'
    },
    basePrice: {
        type: Number,
        default: 0
    },
    priceType: {
        type: String, // fixed, per_visit, monthly, yearly
        default: 'fixed'
    },
    visitsPerYear: {
        type: Number,
        default: 0
    },
    additionalVisitCharge: {
        type: Number,
        default: 0
    },
    hasPowerGuarantee: {
        type: Boolean,
        default: false
    },
    guaranteeMinKW: {
        type: Number,
        default: 0
    },
    guaranteeMaxKW: {
        type: Number,
        default: 0
    },
    guaranteePerUnitPrice: {
        type: Number,
        default: 0
    },
    guaranteeDescription: String,
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model('AMCService', amcServiceSchema);
