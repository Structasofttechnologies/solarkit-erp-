import mongoose from 'mongoose';

const dealerProfessionSchema = new mongoose.Schema(
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
        timestamps: true
    }
);

// Prevent duplicate professions in the same state
dealerProfessionSchema.index({ state: 1, name: 1 }, { unique: true });

export default mongoose.model('DealerProfession', dealerProfessionSchema);
