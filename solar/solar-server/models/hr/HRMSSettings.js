import mongoose from 'mongoose';

const hrmsSettingsSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    // Position can be a string (custom) or linked to Designation model
    // Using String to allow flexibility if designations aren't fully seeded, 
    // but ideally should be ObjectId. Let's use String for now to match UI flexibility,
    // or better, ObjectId if we enforce it. 
    // The prompt says "Replace all static data...". 
    // Let's use ObjectId and if it fails fall back? No, let's stick to ObjectId for strictness if possible.
    // However, existing UI has generic positions. I'll use String for 'position' name to simplify transition 
    // from static strings, unless I force creating designations first.
    // Validating against Designation model is safer.
    // Let's use String for now to avoid blocking if Designations are missing.
    position: {
        type: String,
        required: true
    },
    settingType: {
        type: String,
        enum: ['payroll', 'recruitment', 'performance', 'vacancy', 'test', 'unified'],
        default: 'unified'
    },
    payroll: {
        salary: { type: String, default: '' },
        perks: { type: String, default: '' },
        benefits: { type: String, default: '' },
        esops: { type: String, default: 'eligible' },
        payrollType: { type: String, default: 'monthly' },
        peCheck: { type: Boolean, default: false },
        peInput: { type: String, default: '' },
        esicCheck: { type: Boolean, default: false },
        esicInput: { type: String, default: '' },
        activeCpField: { type: String, default: '' },
        salaryIncrement: { type: String, default: '' },
        cpOnboardingGoal: { type: String, default: '' },
        leaves: { type: String, default: '' },
        performanceLoginTime: { type: String, default: '' },
        performanceWorkingHours: { type: Number, default: 8 },
        yearlyFreeLeave: { type: String, default: '' },
        hybridType: { type: String, default: '' },
        perKwCommission: { type: Number, default: 0 },
        perCustomerFileCommission: { type: Number, default: 0 },
        hybridBaseType: { type: String, enum: ['Monthly', 'Hourly'], default: 'Monthly' },
        hybridSalary: { type: String, default: '' },
        commissionTypeSelection: { type: String, enum: ['Per kW Commission', 'Per Customer File'], default: 'Per kW Commission' }
    },
    recruitment: {
        probation: { type: String, default: '' },
        training: [{ type: String }]
    },
    performance: {
        efficiencyFormula: { type: String, default: '' },
        attendanceReq: { type: String, default: '' },
        leaveImpact: { type: String, default: '' },
        overdueImpact: { type: String, default: '' },
        productivity: { type: String, default: '' },
        breakTime: { type: String, default: '' },
        idealTime: { type: String, default: '' },
        efficiencyDecreaseGrid: [{
            range: { type: String },
            decrease: { type: String }
        }]
    },
    vacancy: {
        count: { type: String, default: '' },
        experience: { type: String, default: '' },
        skills: [{ type: String }],
        education: { type: String, default: '' },
        certifications: { type: String, default: '' },
        deadline: { type: Date },
        jobType: { type: String, default: 'fulltime' },
        description: { type: String, default: '' },
        responsibilities: { type: String, default: '' }
    },
    test: {
        selectedTests: [{ type: String }]
    },
    // Location Scope
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

// Index for faster lookups (non-unique)
hrmsSettingsSchema.index({ department: 1, position: 1 });

export default mongoose.model('HRMSSettings', hrmsSettingsSchema);
