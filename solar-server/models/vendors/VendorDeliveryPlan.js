import mongoose from 'mongoose';

const vendorDeliveryPlanSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'vendorModel'
        },
        vendorModel: {
            type: String,
            required: true,
            enum: ['InstallerVendor', 'SupplierVendor']
        },
        deliveryType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryType',
            required: true,
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        pricePerDelivery: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Prevent duplicate plans for the same vendor, delivery type, and vehicle
vendorDeliveryPlanSchema.index({ vendor: 1, deliveryType: 1, vehicle: 1 }, { unique: true });

export default mongoose.model('VendorDeliveryPlan', vendorDeliveryPlanSchema);
