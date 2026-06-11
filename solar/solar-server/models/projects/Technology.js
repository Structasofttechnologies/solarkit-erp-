import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Technology name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        subProjectTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubProjectType',
            required: false
        },
        brandId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandManufacturer',
            required: false
        },
        status: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export default mongoose.model('Technology', schema);
