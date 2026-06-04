import mongoose from 'mongoose';

const projectOverdueSettingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    projectType: {
        type: String,
        required: true
    },
    subProjectType: {
        type: String,
        required: true
    },
    processConfig: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Ensure unique combination of filters
projectOverdueSettingSchema.index({ category: 1, subCategory: 1, projectType: 1, subProjectType: 1 }, { unique: true });

const ProjectOverdueSetting = mongoose.model('ProjectOverdueSetting', projectOverdueSettingSchema);

export default ProjectOverdueSetting;
