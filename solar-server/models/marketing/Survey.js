
import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
        unique: true // One survey per lead
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    details: {
        type: Object, // Store dynamic survey answers here
        default: {}
    },
    siteImages: [{
        type: String // URLs to images
    }],
    notes: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Survey', surveySchema);
