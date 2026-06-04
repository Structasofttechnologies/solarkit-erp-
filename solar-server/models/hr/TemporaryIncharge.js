import mongoose from 'mongoose';

const temporaryInchargeSchema = new mongoose.Schema(
    {
        originalUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        tempInchargeUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: false
        },
        role: { // The role being taken over
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            default: 'Leave'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient date range queries
temporaryInchargeSchema.index({ originalUser: 1, startDate: 1, endDate: 1 });
temporaryInchargeSchema.index({ tempInchargeUser: 1, isActive: 1 });

export default mongoose.model('TemporaryIncharge', temporaryInchargeSchema);
