import mongoose from 'mongoose';

const appDemoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        scheduledDate: { type: Date, required: true },
        linkedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
        linkedDealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled'],
            default: 'Scheduled',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model('AppDemo', appDemoSchema);
