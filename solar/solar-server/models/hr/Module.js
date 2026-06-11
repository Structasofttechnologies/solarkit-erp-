import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        key: {
            type: String, // standardized key for frontend checks e.g., 'recruitment_management'
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String,
            default: ''
        },
        defaultLevel: {
            type: String,
            enum: ['country', 'state', 'cluster', 'district'],
            default: 'country'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'coming-soon'],
            default: 'active'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        route: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: 'Layers'
        },
        parentModule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Module', moduleSchema);
