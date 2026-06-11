import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        description: {
            type: String,
            default: ''
        },
        logo: {
            type: String, // URL to logo image
            default: ''
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
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

export default mongoose.model('Brand', brandSchema);
