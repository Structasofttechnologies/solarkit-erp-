import mongoose from 'mongoose';

const solarPanelBundleSchema = new mongoose.Schema(
    {
        product: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            required: true
        },
        skuQuantity: {
            type: Number,
            default: 0
        },
        technology: String,
        wattage: String,
        kwOption: Number,
        duration: Number, // In Days

        discount: {
            type: Number,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },

        // Location
        state: String,
        cluster: String,
        district: String
    },
    {
        timestamps: true
    }
);

export default mongoose.model('SolarPanelBundle', solarPanelBundleSchema);
