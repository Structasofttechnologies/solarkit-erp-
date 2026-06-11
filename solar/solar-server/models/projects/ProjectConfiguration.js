import mongoose from 'mongoose';

const projectConfigurationSchema = new mongoose.Schema({
    configKey: {
        type: String,
        required: true
    },
    configValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const ProjectConfiguration = mongoose.model('ProjectConfiguration', projectConfigurationSchema);

export default ProjectConfiguration;
