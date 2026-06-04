import mongoose from 'mongoose';

const partnerGoalSchema = new mongoose.Schema(
    {
        partnerType: {
            type: String, // 'Dealer', 'Franchisee', 'Channel Partner', etc.
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        plan: {
            type: String, // Plan name like 'Freelancer Dealer', 'Premium Dealer', etc.
            index: true
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        district: {
            type: mongoose.Schema.Types.Mixed // Could be String or ObjectId
        },
        cluster: {
            type: mongoose.Schema.Types.Mixed // Could be String or ObjectId
        },
        targetCount: { // Replaces dealerCount / franchiseManagerCount
            type: Number,
            required: true
        },
        commission: {
            type: Number,
            default: 0
        },
        dueDate: {
            type: mongoose.Schema.Types.Mixed, // String ("90 Days") or Number (90)
            required: true
        },
        deadlineDate: {
            type: Date
        },
        managerType: { // Replaces dealerType / cprmType
            type: String,
            required: true
        },
        professions: [{
            type: {
                type: String,
                required: true
            },
            goal: {
                type: Number,
                required: true,
                default: 0
            }
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('PartnerGoal', partnerGoalSchema);
