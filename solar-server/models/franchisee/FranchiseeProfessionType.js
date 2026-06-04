import mongoose from 'mongoose';

const franchiseeProfessionTypeSchema = new mongoose.Schema(
    {
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

// Unique profession per state
franchiseeProfessionTypeSchema.index({ name: 1, state: 1 }, { unique: true });

export default mongoose.model('FranchiseeProfessionType', franchiseeProfessionTypeSchema);
