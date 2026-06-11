import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'recruitment',
            'driver',
            'dealer',
            'installer',
            'franchisee',
            'combokit',
            'inventory',
            'ticket',
            'standard',
            'customize',
            'leave',
            'resignation'
        ]
    },
    data: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    location: {
        state: { type: String, required: true },
        district: { type: String }, // Optional, as some might be higher level
        cluster: { type: String },
        city: { type: String }
    },
    requestedBy: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: String
    },
    approvedDate: {
        type: Date
    },
    rejectedBy: {
        type: String
    },
    rejectedDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying by status, type and location
approvalSchema.index({ status: 1, type: 1 });
approvalSchema.index({ 'location.state': 1, 'location.district': 1 });

export default mongoose.model('Approval', approvalSchema);
