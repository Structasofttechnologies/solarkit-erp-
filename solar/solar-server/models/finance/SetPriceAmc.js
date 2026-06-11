import mongoose from 'mongoose';

const setPriceAmcSchema = new mongoose.Schema(
    {
        quoteSettingsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuoteSettings',
            required: true
        },
        productType: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        subCategory: {
            type: String,
            required: true
        },
        projectType: { // Assuming project type relevance similar to SetPrice
            type: String,
            required: true
        },
        subProjectType: {
            type: String,
            required: true
        },

        amcPrice: {
            type: Number,
            required: true,
            min: 0
        },
        latestBuyingPrice: {
            type: Number,
            required: true,
            min: 0
        },
        gst: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },

        // Location Specifics
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State'
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District'
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('SetPriceAmc', setPriceAmcSchema);
