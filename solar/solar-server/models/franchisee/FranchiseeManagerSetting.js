
import mongoose from 'mongoose';

const franchiseeManagerSettingSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    cluster: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    // Settings for "Franchisee Manager Trainee"
    traineeSettings: {
        appDemos: { type: Number, default: 0 },
        evaluationFlow: { type: String }, // Just storing as string or could be structured if needed
        ninetyDaysGoal: {
            target: { type: Number, default: 0 },
            dueDays: { type: Number, default: 0 }
        },
        commissionEligibility: {
            requiredFranchisees: { type: Number, default: 30 },
            signupStatus: { type: String }
        },
        companyLeadEligibility: {
            signupCount: { type: Number, default: 0 },
            leadLimit: { type: Number, default: 0 },
            percentageVisit: { type: String }
        },
        commissionSettings: {
            newFranchiseeCommission: { type: Number, default: 0 },
            signupDoneCommission: { type: Number, default: 0 }
        }
    },
    // Settings for "Franchisee Manager" (CPRM Form)
    // Assuming similar structure based on UI "CPRM Form (similar structure...)"
    managerSettings: {
        appDemos: { type: Number, default: 0 },
        ninetyDaysGoal: {
            target: { type: Number, default: 0 },
            dueDays: { type: Number, default: 0 }
        },
        commissionEligibility: {
            requiredFranchisees: { type: Number, default: 30 },
            signupStatus: { type: String }
        },
        companyLeadEligibility: {
            signupCount: { type: Number, default: 0 },
            leadLimit: { type: Number, default: 0 },
            percentageVisit: { type: String }
        },
        commissionSettings: {
            newFranchiseeCommission: { type: Number, default: 0 },
            signupDoneCommission: { type: Number, default: 0 }
        }
    },
    // Video Sections
    videoSections: [{
        category: String,
        name: String,
        videos: [{
            id: Number,
            name: String,
            category: String,
            type: { type: String, enum: ['file', 'youtube'] },
            fileName: String, // Metadata only for now
            youtubeLink: String
        }],
        isExpanded: { type: Boolean, default: true }
    }],
    // Exam Questions
    examSettings: {
        passingMarks: { type: Number, default: 1 },
        questions: [{
            question: String,
            options: {
                A: String,
                B: String,
                C: String,
                D: String
            },
            correctAnswer: String
        }]
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per location
franchiseeManagerSettingSchema.index({ state: 1, cluster: 1, district: 1 }, { unique: true });

const FranchiseeManagerSetting = mongoose.model('FranchiseeManagerSetting', franchiseeManagerSettingSchema);

export default FranchiseeManagerSetting;
