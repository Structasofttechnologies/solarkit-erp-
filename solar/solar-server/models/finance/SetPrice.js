import mongoose from 'mongoose';

const setPriceSchema = new mongoose.Schema(
    {
        productType: {
            type: String,
            required: true
        },
        // Linking to other models for normalization if needed, but keeping text for flexibility as per requirement
        // In a strict relational model we would use ObjectIds, but based on the frontend it seems to use strings heavily.
        // However, to be "fully dynamic" and "database driven", we should try to link where possible. 
        // The requirement says "productId / serviceId".
        // I will add both references and fallback strings to support the existing frontend filters.

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
        projectType: {
            type: String,
            required: true
        },
        subProjectType: {
            type: String,
            required: true
        },

        // Pricing details
        benchmarkPrice: {
            type: Number,
            required: true,
            min: 0
        },
        marketPrice: {
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

        // Calculated field, but good to store for query speed if needed
        finalPrice: {
            type: Number
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },

        // Location Specifics
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country'
        },
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
        },
        kitType: {
            type: String,
            enum: ['Custom Kit', 'Combo Kit'],
            default: 'Custom Kit'
        },
        paymentType: {
            type: String,
            enum: ['Cash', 'Loan', 'EMI'],
            default: 'Cash'
        },
        comboKit: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            default: ''
        },
        partnerPlan: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'partnerPlanModel' // Dynamic ref might be needed if multiple models, or just ref a generic one
        },
        partnerPlanModel: {
            type: String,
            enum: ['DealerPlan', 'FranchiseePlan', 'ChannelPartnerPlan'],
            default: 'DealerPlan'
        },
        validFrom: {
            type: Date,
            default: Date.now
        },
        validTo: {
            type: Date
        },
        margin: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Auto-calculate final price and margin before saving
setPriceSchema.pre('save', function (next) {
    if (this.marketPrice && this.gst) {
        this.finalPrice = this.marketPrice + (this.marketPrice * this.gst / 100);
    } else {
        this.finalPrice = this.marketPrice;
    }
    
    if (this.marketPrice !== undefined && this.benchmarkPrice !== undefined) {
        this.margin = this.marketPrice - this.benchmarkPrice;
    }
    
    next();
});

export default mongoose.model('SetPrice', setPriceSchema);
