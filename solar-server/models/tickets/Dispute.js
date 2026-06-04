import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
    {
        disputeId: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['payment', 'service', 'warranty', 'contract', 'other'],
        },
        priority: {
            type: String,
            required: true,
            enum: ['low', 'medium', 'high', 'critical'],
        },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'resolved', 'rejected'],
            default: 'open',
        },
        subject: {
            type: String,
            required: true,
        },
        relatedTo: {
            type: String,
            required: true,
            // enum: ['installation', 'service', 'payment', 'contract', 'product'] might be helpful or just string
        },
        referenceId: {
            type: String, // Optional string
        },
        description: {
            type: String,
            required: true,
        },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        attachments: [{
            name: String,
            size: String,
            url: String
        }],
        timeline: [{
            date: {
                type: Date,
                default: Date.now,
            },
            description: String,
            actionBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        relatedTicket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Dispute', disputeSchema);
