import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        }],
        description: {
            type: String,
            default: '',
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        },
        level: {
            type: String, // State, Cluster, District, Country, etc.
            default: ''
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            default: null
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: null
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            default: null
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            default: null
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            default: null
        },
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone',
            default: null
        },
        parentRole: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            default: null
        },
        isChildPosition: {
            type: Boolean,
            default: false
        },
        mandatoryTasks: [{
            type: String
        }],
        optionalTasks: [{
            type: String
        }],
        rights: [{
            type: String // View, Edit, Delete etc.
        }],
        tempIncharge: { // Just a display field or link? The UI shows it.
            type: String,
            default: ''
        },
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

// Ensure name is unique per context
roleSchema.index({ name: 1, department: 1, country: 1, state: 1, cluster: 1, district: 1 }, { unique: true });

export default mongoose.model('Role', roleSchema);
