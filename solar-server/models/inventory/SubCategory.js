import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Sub Category name is required'],
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
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required']
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

export default mongoose.model('SubCategory', subCategorySchema);
