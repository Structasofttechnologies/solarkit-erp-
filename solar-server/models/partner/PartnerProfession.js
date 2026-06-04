import mongoose from 'mongoose';

const partnerProfessionSchema = new mongoose.Schema(
    {
        partnerType: {
            type: String, // 'Dealer', 'Franchisee', 'Channel Partner', etc.
            required: true,
            index: true
        },
        plan: {
            type: String, // Plan name like 'Freelancer Dealer', etc.
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
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

// We might want to ensure profession name is unique per state, partnerType and plan
partnerProfessionSchema.index({ partnerType: 1, plan: 1, name: 1, state: 1 }, { unique: true });

export default mongoose.model('PartnerProfession', partnerProfessionSchema);
