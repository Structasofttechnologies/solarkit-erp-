import mongoose from 'mongoose';

const departmentModuleAccessSchema = new mongoose.Schema(
    {
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            required: true
        },
        accessLevel: {
            type: String,
            enum: ['country', 'state', 'cluster', 'district'],
            default: 'country'
        },
        enabled: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Ensure unique mapping per department and module
departmentModuleAccessSchema.index({ departmentId: 1, moduleId: 1 }, { unique: true });

export default mongoose.model('DepartmentModuleAccess', departmentModuleAccessSchema);
