import mongoose from 'mongoose';

const projectTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            default: null,
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
    { timestamps: true }
);

export default mongoose.model('ProjectType', projectTypeSchema);
