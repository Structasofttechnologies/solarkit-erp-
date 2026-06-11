import mongoose from 'mongoose';

const installerAgencyPlanSchema = new mongoose.Schema({
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', default: null },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', default: null },
    cluster: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', default: null },
    districts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'District' }],
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    minimumRating: { type: Number, default: 0, min: 0, max: 5 },
    planColor: { type: String, default: '#0070cc' }, // For top banner branding

    // Eligibility Requirements
    eligibility: {
        aadharCard: { type: Boolean, default: false },
        panCard: { type: Boolean, default: false },
        agreement: { type: Boolean, default: false },
        requiredDocuments: [{ type: String }]
    },
    coverage: { type: String, default: 'District' }, // e.g. District, State, Cluster
    selectedDistricts: [{ type: String }],
    selectedClusters: [{ type: String }],

    // Sub User
    userLimits: { type: Number, default: 10 },
    subUser: {
        supervisor: { type: Boolean, default: false },
        sales: { type: Boolean, default: false },
        dealer: { type: Boolean, default: false },
        leadPartner: { type: Boolean, default: false },
        service: { type: Boolean, default: false },
    },

    // Dynamic Project Configurations (Added for dynamic hierarchy)
    projectConfigurations: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
        projectType: { type: String },
        subProjectType: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProjectType' }
    }],

    // Project Type Vise Installation Capacity (Array of rows)
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

    // Solar Installation Points (Dynamic Table)
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


    // Pricing & Target (Right Summary Card)
    signupFees: { type: Number, default: 0 },
    yearlyTargetKw: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    depositFees: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('InstallerAgencyPlan', installerAgencyPlanSchema);

