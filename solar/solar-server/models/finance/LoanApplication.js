import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    dealer: { // For dealer loans, this replaces franchisee reference if needed or we use both
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    applicantName: {
        type: String,
        required: true
    },
    applicantAadhar: String,
    applicantPan: String,
    employmentType: {
        type: String,
        // enum: ['Salaried', 'Self-Employed', 'Business', 'Other'] // Optional: keep enum but make it non-required or handle empty
    },
    downpayment: {
        type: Number,
        default: 0
    },
    loanAmount: {
        type: Number,
        required: true,
        default: 0
    },
    coApplicantName: String,
    coApplicantAadhar: String,
    coApplicantPan: String,
    coApplicantEmployment: String,
    documents: [{
        type: { type: String }, // e.g., 'aadharFront', 'pan', 'lightBill'
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    applicationNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Disbursed', 'Rejected', 'Active', 'Closed'],
        default: 'Pending'
    },
    // Keep existing fields for backward compatibility if needed, but project/dealer are key for new flow
    franchisee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: String,
    customerPhone: String,
    loanType: {
        type: String,
        enum: ['bank', 'private', 'NBFC'],
    },
    bankName: String,
    lenderName: String,
    interestRate: String,
    tenure: Number, // in months
    applicationDate: {
        type: Date,
        default: Date.now
    },
    projectType: String,
    category: String,
    subCategory: String,
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
    partnerType: {
        type: String,
        enum: ['Franchisee', 'Dealer', 'Direct', 'Channel Partner', 'Other']
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PartnerPlan'
    }
}, { timestamps: true });

// Pre-save to generate application number if not present
loanApplicationSchema.pre('save', function (next) {
    if (!this.applicationNumber) {
        this.applicationNumber = 'LN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

export default mongoose.model('LoanApplication', loanApplicationSchema);
