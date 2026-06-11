import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    vacancy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vacancy',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Applied', 'Test Completed', 'Under Review', 'Selected', 'Rejected', 'Joined'],
        default: 'Applied'
    },
    preferredJoiningDate: {
        type: Date
    },
    agreedToTerms: {
        type: Boolean,
        default: false
    },
    testStartedAt: {
        type: Date
    },
    testCompletedAt: {
        type: Date
    },
    employmentAgreementSigned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Candidate', candidateSchema);
