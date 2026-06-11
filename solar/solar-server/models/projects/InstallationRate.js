import mongoose from 'mongoose';

const installationRateSchema = new mongoose.Schema({
    rateType: {
        type: String,
        enum: ['perKW', 'perProject'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
        required: true
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true
    }
}, {
    timestamps: true
});

const InstallationRate = mongoose.model('InstallationRate', installationRateSchema);
export default InstallationRate;
