import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        module: {
            type: String,
            required: true,
            trim: true // e.g. "HRMS", "Inventory", "Sales"
        },
        action: {
            type: String,
            required: true, // e.g. "create", "read", "update", "delete"
        },
        description: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

// Compound unique index
permissionSchema.index({ module: 1, action: 1, name: 1 }, { unique: true });

export default mongoose.model('Permission', permissionSchema);
