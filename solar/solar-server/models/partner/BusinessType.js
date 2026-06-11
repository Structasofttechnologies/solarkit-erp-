import mongoose from 'mongoose';

const businessTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Business type name is required'],
            unique: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('BusinessType', businessTypeSchema);
