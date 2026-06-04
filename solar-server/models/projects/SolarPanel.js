import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'SolarPanel name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        panelWattId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PanelWatt',
            required: false
        },
        status: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export default mongoose.model('SolarPanel', schema);
