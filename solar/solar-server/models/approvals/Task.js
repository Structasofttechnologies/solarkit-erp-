import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        linkedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
        deadline: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
