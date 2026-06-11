import mongoose from 'mongoose';

const installerVendorPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        countryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            default: null
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: null
        },
        clusterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            default: null
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            default: null
        },
        requirements: [{
            type: String
        }],
        coverage: {
            type: String,
            default: "1 District"
        },
        projectTypes: [{
            type: String
        }],
        categories: [{
            type: String
        }],
        subProjectTypes: [{
            type: String
        }],
        projectTypeRanges: [{
            type: String
        }],
        subscription: {
            type: String,
            default: "0"
        },
        paymentMethods: [{
            type: String
        }],
        teams: {
            type: Map,
            of: Number,
            default: new Map()
        },
        rates: {
            type: Map,
            of: String,
            default: new Map()
        },
        weeklyKWAssign: {
            type: Map,
            of: String,
            default: new Map()
        }
    },
    {
        timestamps: true
    }
);

// Logical uniqueness is now handled in the fetch/save controller logic to allow multiple configs


export default mongoose.model('InstallerVendorPlan', installerVendorPlanSchema);
