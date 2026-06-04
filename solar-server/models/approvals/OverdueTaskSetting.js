import mongoose from 'mongoose';

const overdueTaskSettingSchema = new mongoose.Schema({
    todayTasksDays: {
        type: Number,
        default: 0
    },
    todayPriority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    showTodayTasks: {
        type: Boolean,
        default: true
    },
    pendingMinDays: {
        type: Number,
        default: 1
    },
    pendingMaxDays: {
        type: Number,
        default: 7
    },
    sendPendingReminders: {
        type: Boolean,
        default: true
    },
    reminderFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly'],
        default: 'weekly'
    },
    overdueDays: {
        type: Number,
        default: 1
    },
    escalationLevels: [{
        level: Number,
        name: String,
        fromDay: { type: Number, required: true },
        toDay: { type: Number }, // If null, means 'and above'
        escalateTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Designation'
        },
        penaltyPercentage: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }],
    autoPenalty: {
        type: Boolean,
        default: true
    },
    penaltyPercentage: {
        type: Number,
        default: 2
    },
    overdueBenchmark: {
        type: Number,
        default: 70
    },
    countries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }],
    states: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    }],
    clusters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    }],
    districts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }],
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    // Stage-wise Overdue Settings (NEW)
    stageSettings: [{
        stageKey: { type: String, required: true }, // e.g., 'lead_stage', 'survey_pending'
        stageName: { type: String, required: true },
        overdueDays: { type: Number, default: 2 },
        isActive: { type: Boolean, default: true }
    }],
    // Project Timeline Based Settings (NEW)
    timelineSettings: {
        targetCompletionDays: { type: Number, default: 30 }, // Default project duration
        bufferDays: { type: Number, default: 5 },
        slaThreshold: { type: Number, default: 90 }, // Percentage benchmark
        autoMarkOverdue: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

const OverdueTaskSetting = mongoose.model('OverdueTaskSetting', overdueTaskSettingSchema);
export default OverdueTaskSetting;
