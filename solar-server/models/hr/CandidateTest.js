import mongoose from 'mongoose';

const candidateTestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        default: 60
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 30
    },
    passingPercentage: {
        type: Number,
        required: true,
        default: 60
    },
    negativeMarking: {
        type: Boolean,
        default: false
    },
    negativeMarkValue: {
        type: Number,
        default: 0.25
    },

    // Associations
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
        // required: true // Optional if test is general? UI implies department specific.
    },

    // Location Scope
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

    // Questions
    questions: [{
        text: { type: String, required: true },
        type: {
            type: String,
            enum: ['multiple', 'single', 'text'],
            default: 'multiple'
        },
        options: [{ type: String }],
        // Store correct answer indices or values. 
        // Logic: For single/multiple, verify against indices or string values.
        // Simple string array for flexibility.
        correctAnswer: [{ type: String }],
        marks: { type: Number, default: 1 }
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

export default mongoose.model('CandidateTest', candidateTestSchema);
