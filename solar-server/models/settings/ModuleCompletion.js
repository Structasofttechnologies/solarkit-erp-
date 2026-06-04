import mongoose from 'mongoose';

const moduleCompletionSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true,
        trim: true
    },
    clusterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    progressPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    category: {
        type: String,
        trim: true
    },
    iconName: {
        type: String,
        default: 'ClipboardList'
    },
    itemsStatus: [{
        itemName: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

const ModuleCompletion = mongoose.model('ModuleCompletion', moduleCompletionSchema);

export default ModuleCompletion;
