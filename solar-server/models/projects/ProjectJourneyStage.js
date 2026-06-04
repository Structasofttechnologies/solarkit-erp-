import mongoose from 'mongoose';

const projectJourneyStageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fields: [{
        name: { type: String, required: true },
        inputs: [{
            label: { type: String, required: true },
            type: { 
                type: String, 
                enum: ['text', 'textarea', 'upload', 'download', 'select', 'date'], 
                default: 'text' 
            },
            required: { type: Boolean, default: false },
            options: [String], // For dropdown/select
            order: { type: Number, default: 0 }
        }],
        order: { type: Number, default: 0 }
    }],
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const ProjectJourneyStage = mongoose.model('ProjectJourneyStage', projectJourneyStageSchema);

export default ProjectJourneyStage;
