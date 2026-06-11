import mongoose from 'mongoose';

const supplierVendorPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse',
            default: null
        },
        kycDetails: [{
            type: String,
        }],
        subloginRole: {
            type: String,
            trim: true,
            default: '',
        },
        subloginLimit: {
            type: String,
            trim: true,
            default: '',
        },
        accessType: {
            type: String,
            trim: true,
            default: 'Full Access',
        }
    },
    {
        timestamps: true,
    }
);

// We drop the unique index because a globally applied plan relies on having null
// stateId/clusterId/districtId, and uniqueness is managed via the controller's logic (upsert).

export default mongoose.model('SupplierVendorPlan', supplierVendorPlanSchema);
