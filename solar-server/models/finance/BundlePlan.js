import mongoose from 'mongoose';

const bundlePlanSchema = new mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    clusters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    }],
    districts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }],
    cities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    }],
    cpTypes: [String], // Startup, Basic, Enterprise, Solar Business

    bundleName: {
        type: String,
        required: true,
        trim: true
    },
    panelBrands: [String], // Adani, Tata, Waree, etc.
    technologyType: [String], // Mono Perc, Bi Facial, etc.
    wattage: [String], // 330W, 400W, etc.
    kw: {
        type: Number,
        default: 0
    },
    cashback: {
        type: Number,
        default: 0
    },
    timeDuration: [Number], // Days (30, 60, 90, 120)

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

export default mongoose.model('BundlePlan', bundlePlanSchema);
