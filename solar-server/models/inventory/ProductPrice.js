import mongoose from 'mongoose';

const productPriceSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SKU',
            required: true,
        },
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
        price: {
            type: Number,
            required: true,
        },
        gst: {
            type: Number,
            default: 0,
        },
        basePrice: {
            type: Number, // calculated (price / (1 + gst/100)) usually, but stored for reference
        },
        isActive: {
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
    {
        timestamps: true,
        indexes: [
            { sku: 1, cluster: 1, unique: true } // One price per SKU per cluster
        ]
    }
);

export default mongoose.model('ProductPrice', productPriceSchema);
