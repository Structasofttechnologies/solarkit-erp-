import mongoose from 'mongoose';

const inventorySettingsSchema = new mongoose.Schema(
    {
        globalLowStockThreshold: {
            type: Number,
            default: 10,
        },
        brandThresholds: [
            {
                brandId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Brand',
                    required: true,
                },
                threshold: {
                    type: Number,
                    required: true,
                },
            }
        ],
        productThresholds: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'InventoryItem',
                    required: true,
                },
                threshold: {
                    type: Number,
                    required: true,
                },
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model('InventorySettings', inventorySettingsSchema);
