import mongoose from 'mongoose';

const brandSupplierSchema = new mongoose.Schema(
    {
        type: { // Dealer or Distributor
            type: String,
            required: true,
            enum: ['Dealer', 'Distributor'],
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // Location Hierarchy
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true,
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            required: true,
        },
        district: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true,
        }],
        city: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            required: true,
        }],

        // Links
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandManufacturer',
            required: true
        },

        // Product Details
        product: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
            required: true,
        },
        projectType: {
            type: String,
            required: true,
        },
        subProjectType: {
            type: String,
            required: true,
        },
        procurementType: {
            type: [String],
            required: true,
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster filtering
brandSupplierSchema.index({ state: 1, cluster: 1, district: 1, city: 1 });
brandSupplierSchema.index({ type: 1 });
brandSupplierSchema.index({ manufacturer: 1 });

export default mongoose.model('BrandSupplier', brandSupplierSchema);
