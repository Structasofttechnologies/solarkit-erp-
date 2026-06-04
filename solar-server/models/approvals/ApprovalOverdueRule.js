import mongoose from 'mongoose';

const approvalOverdueRuleSchema = new mongoose.Schema({
    ruleName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['onboarding', 'company']
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    overdueDays: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const ApprovalOverdueRule = mongoose.model('ApprovalOverdueRule', approvalOverdueRuleSchema);
export default ApprovalOverdueRule;
