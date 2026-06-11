import mongoose from 'mongoose';

const vendorDeliveryConfigSchema = new mongoose.Schema(
    {
        distanceThreshold: {
            type: Number,
            required: true,
            default: 50,
            min: 0,
        },
        allowPickup: {
            type: Boolean,
            default: true,
        },
        allowDelivery: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model('VendorDeliveryConfig', vendorDeliveryConfigSchema);
