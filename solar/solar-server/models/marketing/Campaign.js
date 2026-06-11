import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    campaignName: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true
    },
    campaignType: {
        type: String,
        required: [true, 'Campaign type is required'],
        enum: ['Email', 'WhatsApp', 'Ads', 'Call', 'Social Media', 'Other']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [0, 'Budget cannot be negative']
    },
    expectedLeads: {
        type: Number,
        required: [true, 'Expected leads is required'],
        min: [1, 'Expected leads must be at least 1']
    },
    actualLeads: {
        type: Number,
        default: 0,
        min: [0, 'Actual leads cannot be negative']
    },
    conversionRate: {
        type: Number,
        default: 0
    },
    revenueGenerated: {
        type: Number,
        default: 0,
        min: [0, 'Revenue cannot be negative']
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Paused', 'Scheduled'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Pre-save hook to calculate conversion rate and update status
campaignSchema.pre('save', function (next) {
    // Calculate conversion rate: (actualLeads / expectedLeads) * 100
    if (this.expectedLeads > 0) {
        this.conversionRate = parseFloat(((this.actualLeads / this.expectedLeads) * 100).toFixed(2));
    } else {
        this.conversionRate = 0;
    }

    // Auto-update status based on dates if not manually paused
    const now = new Date();

    // Ensure endDate is after startDate
    if (this.endDate < this.startDate) {
        return next(new Error('End date must be greater than start date'));
    }

    // Only auto-update status if it's not manually Paused
    if (this.status !== 'Paused') {
        if (now < this.startDate) {
            this.status = 'Scheduled';
        } else if (now > this.endDate) {
            this.status = 'Completed';
        } else {
            this.status = 'Active';
        }
    }

    next();
});

export default mongoose.model('Campaign', campaignSchema);
