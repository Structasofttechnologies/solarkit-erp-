import mongoose from 'mongoose';

const priceMasterSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true,
        },
        clusterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            required: true,
        },
        technology: {
            type: String,
            default: '',
        },
        basePrice: {
            type: Number,
            required: true,
            default: 0
        },
        tax: {
            type: Number,
            required: true,
            default: 0 // Percentage
        },
        discount: {
            type: Number,
            default: 0 // Flat or Percentage? Plan implied flat reduction or we store final.
        },
        finalPrice: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

// Compound index to ensure one price per product per cluster per technology
priceMasterSchema.index({ productId: 1, stateId: 1, clusterId: 1, technology: 1 }, { unique: true });

export default mongoose.model('PriceMaster', priceMasterSchema);
