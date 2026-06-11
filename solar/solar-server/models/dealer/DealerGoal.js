import mongoose from 'mongoose';

const dealerGoalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'CP Goal'
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District'
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster'
        },
        dealerCount: {
            type: Number,
            required: true
        },
        dueDate: {
            type: String, // Keeping as string to match "90 Days" input, or could be Number
            required: true
        },
        dealerType: {
            type: String,
            enum: ['Cluster CPRM', 'District CPRM'],
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

export default mongoose.model('DealerGoal', dealerGoalSchema);
