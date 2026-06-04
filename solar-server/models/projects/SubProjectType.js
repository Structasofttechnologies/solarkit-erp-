import mongoose from 'mongoose';

const subProjectTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Sub Project Type name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        projectTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProjectType',
            required: false
        },
        status: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export default mongoose.model('SubProjectType', subProjectTypeSchema);
