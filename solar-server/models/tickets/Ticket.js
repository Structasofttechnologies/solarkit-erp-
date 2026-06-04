import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            required: true,
            unique: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: false, // User requested unlinking ticket assignment for random unassigned cases
        },
        user: { // The dealer or user who raised the ticket
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerPhone: {
            type: String,
            required: true,
        },
        customerEmail: {
            type: String,
        },
        issueType: {
            type: String,
            required: true,
            // enum: ['Performance Issue', 'Physical Damage', 'Monitoring System Problem', 'Billing Issue', 'Other'],
        },
        component: {
            type: String,
            required: true,
            // enum: ['Solar Panel', 'BOS Kit', 'Inverter', 'Other'],
        },
        description: {
            type: String,
            required: true,
            minlength: 30,
        },
        priority: {
            type: String,
            enum: ['Normal', 'Urgent'],
            default: 'Normal',
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Technician Assigned', 'Replacement Completed', 'Resolved', 'Closed'],
            default: 'Open',
        },
        media: [{
            type: String, // URLs to images/videos
        }],
        history: [{
            status: String,
            note: String,
            updatedAt: {
                type: Date,
                default: Date.now,
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        }],
        assignedTo: { // Technician or support staff
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        estimatedResolutionDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

// Auto-generate ticketId pre-save if not provided? 
// Or handle in controller. Controller is better for async checks.

export default mongoose.model('Ticket', ticketSchema);
