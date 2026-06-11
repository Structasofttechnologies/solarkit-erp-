import mongoose from 'mongoose';

const candidateTrainingSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    position: {
        type: String,
        required: false
    },

    // Location Scope
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    cities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    }],

    // Training Sections
    sections: [{
        category: {
            type: String,
            // enum: ['solarrooftop', 'solarpump', 'solarstreetlight'], // Optional: restrict if needed
            default: 'solarrooftop'
        },
        name: { type: String, required: true },
        videos: [{
            url: String, // URL or File path
            type: {
                type: String,
                enum: ['upload', 'youtube'],
                default: 'youtube'
            }
        }]
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

export default mongoose.model('CandidateTraining', candidateTrainingSchema);
