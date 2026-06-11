import mongoose from 'mongoose';

const projectCategoryMappingSchema = new mongoose.Schema(
    {
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        clusterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: true
        },
        projectTypeFrom: {
            type: Number,
            required: true,
            min: 0
        },
        projectTypeTo: {
            type: Number,
            required: true,
            min: 0
        },
        subProjectTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubProjectType',
            required: false // Based on the screenshot, it might be optional or required depending on business logic, but it's present.
        },
        deliveryCharges: {
            type: Number,
            default: 0
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

// We might want a unique compound index to prevent duplicate ranges for the same category in the same cluster.
// For now, let's keep it simple or allow overlap, but generally you wouldn't want the exact same mapping twice.
projectCategoryMappingSchema.index({ stateId: 1, clusterId: 1, categoryId: 1, subCategoryId: 1, projectTypeFrom: 1, projectTypeTo: 1, subProjectTypeId: 1 }, { unique: true });

export default mongoose.model('ProjectCategoryMapping', projectCategoryMappingSchema);
