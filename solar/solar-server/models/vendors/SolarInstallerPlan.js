import mongoose from 'mongoose';

const solarInstallerPlanSchema = new mongoose.Schema({
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', default: null },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', default: null },
    cluster: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', default: null },
    districts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'District' }],
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    minimumRating: { type: Number, default: 0, min: 0, max: 5 },
    planColor: { type: String, default: '#0070cc' },

    eligibility: {
        aadharCard: { type: Boolean, default: false },
        panCard: { type: Boolean, default: false },
        agreement: { type: Boolean, default: false },
        requiredDocuments: [{ type: String }]
    },
    coverage: { type: String, default: 'District' },
    selectedDistricts: [{ type: String }],
    selectedClusters: [{ type: String }],

    assignedProjectTypes: [{
        category: { type: String },
        subCategory: { type: String },
        projectType: { type: String },
        subProjectType: { type: String },
        yearlyTargetKw: { type: String },
        incentiveAmount: { type: String },
        installationCharges: { type: String },
        capacity: { type: String },
        daysRequiredUnit: { type: String, default: 'Weeks' },
        daysRequiredVal: { type: String },
        timeRequiredUnit: { type: String, default: 'Weeks' },
        timeRequiredVal: { type: String },
        active: { type: Boolean, default: false }
    }],

    solarInstallationCharges: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
        projectType: { type: String },
        subProjectType: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProjectType' },
        typeLabel: { type: String },
        chargesPerKw: { type: Number, default: 0 },
        active: { type: Boolean, default: false }
    }],

    solarInstallationPoints: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
        projectType: { type: String },
        subProjectType: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProjectType' },
        typeLabel: { type: String },
        yearlyTargetKw: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        periodInMonth: { type: Number, default: 0 },
        claimInMonth: { type: Number, default: 0 },
        active: { type: Boolean, default: false }
    }],

    signupFees: { type: Number, default: 0 },
    yearlyTargetKw: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    depositFees: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('SolarInstallerPlan', solarInstallerPlanSchema);
