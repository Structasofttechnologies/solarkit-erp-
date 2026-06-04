import mongoose from 'mongoose';

const franchiseeOnboardingGoalSchema = new mongoose.Schema(
    {
        goalName: {
            type: String,
            required: true
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        cluster: { // Storing as string for now based on UI, but ideally should be ObjectId link if Cluster model exists and is strictly used
            type: String,
            required: true
        },
        district: { // Storing as string for now based on UI requirements or link to District model
            type: String,
            required: true
        },
        franchiseManagerCount: {
            type: Number,
            required: true
        },
        dueDateDays: {
            type: Number,
            required: true
        },
        cprmType: {
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
                required: true
            }
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('FranchiseeOnboardingGoal', franchiseeOnboardingGoalSchema);
