import mongoose from 'mongoose';

const loanRuleSchema = new mongoose.Schema({
    loanProviderType: {
        type: String,
        enum: ['NBFC', 'BANK', 'EMI'],
        required: true
    },
    orderType: {
        type: String,
        enum: ['Combokit', 'Customised kit'],
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    subCategoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    }],
    projectTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectType'
    },
    subProjectTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubProjectType'
    },
    subProjectTypeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubProjectType'
    }],
    combokitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolarKit'
    },
    customizedKitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComboKitAssignment'
    },
    customizedKitIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComboKitAssignment'
    }],
    loanProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanProvider'
    },
    projectTypeFrom: {
        type: Number
    },
    projectTypeTo: {
        type: Number
    },
    // Keep projectType string for backward compatibility or as a display name
    projectType: {
        type: String,
        required: false,
        trim: true
    },
    interestRate: {
        type: Number,
        required: true,
        default: 0
    },
    tenureMonths: {
        type: Number,
        required: true,
        default: 0
    },
    maxAmount: {
        type: Number,
        required: true,
        default: 0
    },
    fields: [{
        name: String,
        selected: Boolean,
        ranges: [{
            from: Number,
            to: Number,
            score: Number,
            secondaryLabel: String, // e.g. "Age", "Downpayment"
            secondaryFrom: Number,
            secondaryTo: Number
        }]
    }],
    outcomes: [{
        status: { type: String, enum: ['approved', 'rejected', 'manual call', 'pre-approved'] },
        minScore: Number,
        maxScore: Number
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    countries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }],
    states: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    }],
    clusters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    }],
    districts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }],
    clusterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const LoanRule = mongoose.model('LoanRule', loanRuleSchema);

export default LoanRule;
