import mongoose from 'mongoose';

const supplierTypeSchema = new mongoose.Schema(
    {
        loginTypeName: {
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
        category: {
            type: [String],
            default: [],
        },
        subCategory: {
            type: [String],
            default: [],
        },
        projectType: {
            type: [String],
            default: [],
        },
        subType: {
            type: [String],
            default: [],
        },
        assignModules: {
            type: [String],
            default: [],
        },
        loginAccessType: {
            type: String,
            trim: true,
            default: "",
        },
        orderTat: {
            type: String,
            trim: true,
            default: "",
        },
        modulesTasks: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('SupplierType', supplierTypeSchema);
