import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    position: {
        type: String,
        default: ''
    },
    leaveType: {
        type: String,
        enum: ['Paid Leave', 'Sick Leave', 'Casual Leave', 'Emergency Leave'],
        required: true
    },
    leaveDuration: {
        type: String,
        enum: ['Half Day', 'Full Day', 'Multiple Days'],
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    attachment: {
        type: String, // URL to uploaded file
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    temporaryIncharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvalDate: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
