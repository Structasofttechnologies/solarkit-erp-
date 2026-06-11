import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
            // unique removed to allow same names across countries
        },
        code: {
            type: String,
            trim: true,
            sparse: true
        },
        country: {
            type: String,
            required: true,
            default: 'India' // Just in case, adding a default
        },
        description: {
            type: String,
            default: '',
        },
        headOfDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        assignedModules: [{
            module: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module'
            },
            level: {
                type: String,
                enum: ['country', 'state', 'cluster', 'district'],
                default: 'country'
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'coming-soon'],
                default: 'active'
            }
        }],
        isActive: {
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
    {
        timestamps: true,
    }
);

// Ensure name is unique per country
departmentSchema.index({ name: 1, country: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
