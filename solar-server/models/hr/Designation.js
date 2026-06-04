import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        level: {
            type: Number,
            default: 1, // Hierarchy level
        },
        description: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

designationSchema.index({ name: 1, department: 1 }, { unique: true });

export default mongoose.model('Designation', designationSchema);
