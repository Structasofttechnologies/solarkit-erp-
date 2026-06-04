import mongoose from 'mongoose';

const resignationSchema = new mongoose.Schema(
    {
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
            default: null
        },
        resignationDate: {
            type: Date,
            required: true
        },
        noticePeriodDays: {
            type: Number,
            required: true
        },
        lastWorkingDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
            default: 'Pending'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model('Resignation', resignationSchema);
