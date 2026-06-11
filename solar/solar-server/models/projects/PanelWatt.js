import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'PanelWatt name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        technologyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Technology',
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

export default mongoose.model('PanelWatt', schema);
