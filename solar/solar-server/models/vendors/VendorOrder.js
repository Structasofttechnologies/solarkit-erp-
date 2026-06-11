import mongoose from 'mongoose';

const vendorOrderSchema = new mongoose.Schema(
    {
        orderNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SupplierVendor',
            required: true,
        },
        brand: {
            type: String, // Or ObjectId ref 'Brand' if strictly required, but requirements said "Brand" column. Keeping generic for now as per requirement "Brand" column.
            required: true,
        },
        product: {
            type: String, // Or ObjectId ref 'Product'
            required: true,
        },
        deliveryDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Delivered', 'In Transit', 'Delayed', 'Pending'],
            default: 'Pending',
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
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse',
            default: null,
        },
        transactionValue: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('VendorOrder', vendorOrderSchema);
