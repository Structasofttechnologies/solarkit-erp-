import mongoose from 'mongoose';

const projectDocumentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true,
        trim: true
    },
    stage: {
        type: String,
        required: false
    },
    templateContent: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    category: String,
    subCategory: String,
    projectType: String,
    subProjectType: String,
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const ProjectDocument = mongoose.model('ProjectDocument', projectDocumentSchema);

export default ProjectDocument;
