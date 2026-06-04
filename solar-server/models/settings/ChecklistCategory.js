import mongoose from 'mongoose';

const checklistCategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        iconName: {
            type: String,
            default: 'ClipboardList',
        },
        iconBg: {
            type: String,
            default: 'bg-blue-100 text-blue-600',
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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('ChecklistCategory', checklistCategorySchema);
