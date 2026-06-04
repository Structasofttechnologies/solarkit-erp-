import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        projectTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProjectType',
            required: false
        },
        description: {
            type: String,
            default: '',
        },
        status: {
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
    { timestamps: true }
);

// Compound unique index maybe? For now simple unique name is dangerous if same name in diff project type allowed.
// Let's assume name + projectType should be unique
categorySchema.index({ name: 1, projectTypeId: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
