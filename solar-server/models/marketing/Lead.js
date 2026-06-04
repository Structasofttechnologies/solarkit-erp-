import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: String,
            required: true,
            trim: true
        },
        whatsapp: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            default: null
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: null
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            default: null
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            default: null
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            default: null
        },
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone',
            default: null
        },
        solarType: {
            type: String,
            required: true
        },
        subType: {
            type: String
        },
        kw: {
            type: String,
            required: true
        },
        billAmount: {
            type: Number,
            default: 0
        },
        rural: {
            type: String
        },
        sourceOfMedia: {
            type: String
        },
        profession: {
            type: String
        },
        status: {
            type: String,
            enum: ['New', 'SurveyPending', 'SurveyCompleted', 'QuoteGenerated', 'ProjectStart', 'ProjectSigned', 'Converted'],
            default: 'New'
        },
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        history: [{
            action: String,
            date: { type: Date, default: Date.now },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],

        quote: {
            totalAmount: Number,
            commission: Number,
            netAmount: Number,
            systemSize: String,
            generatedAt: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
