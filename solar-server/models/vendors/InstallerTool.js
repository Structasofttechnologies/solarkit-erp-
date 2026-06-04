import mongoose from 'mongoose';

const installerToolSchema = new mongoose.Schema({
    toolName: {
        type: String,
        required: true,
        trim: true
    },
    projectCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: false
    },
    projectType: {
        type: String,
        required: true
    },
    subType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubProjectType',
        required: false
    }
}, {
    timestamps: true
});

const InstallerTool = mongoose.model('InstallerTool', installerToolSchema);
export default InstallerTool;
