import mongoose from 'mongoose';

const franchiseePlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
        },
        priceDescription: {
            type: String,
            default: 'signup fees',
        },
        yearlyTargetKw: {
            type: Number,
            default: 0,
        },
        cashbackAmount: {
            type: Number,
            default: 0,
        },
        accessType: {
            type: String,
            default: '',
        },
        userLimit: {
            type: Number, // -1 for unlimited
            default: 1,
        },
        userDescription: {
            type: String,
            default: ''
        },
        projectTypes: [{
            name: String,
            image: String
        }],
        features: [{
            type: String,
        }],
        documents: [{
            type: String,
        }],
        depositFees: {
            type: Number,
            default: 0,
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        colorArgs: {
            buttonColor: String,
            headerColor: String,
            iconColor: String,
            bgColor: String
        },
        // 1. Configure Supply Type
        configureSupplyType: {
            structureCost: { type: Boolean, default: false },
            installationCost: { type: Boolean, default: false },
            insurance: { type: Boolean, default: false }
        },
        // 2. Onboarding Requirements
        onboardingRequirements: {
            kycDocuments: [{ type: String }],
            verificationStatus: {
                verifiedDealer: { type: Boolean, default: false },
                notVerifiedDealer: { type: Boolean, default: false }
            },
            additionalDocuments: { type: String, default: '' }
        },
        // 3. Coverage Area
        coverageArea: { type: String, default: '' },
        // 4. User Management
        userManagement: {
            subUserTypes: [{ type: String }],
            userLimits: { type: Number, default: 0 },
            noSublogin: { type: Boolean, default: false }
        },
        // 5. Assign Module
        assignModule: { modules: [{ type: String }] },
        // 6. Category Types
        categoryTypes: [{
            category: { type: String },
            subCategory: { type: String },
            projectType: { type: String },
            subProjectType: { type: String }
        }],
        // 7. Features
        featuresList: {
            platformFeatures: [{ type: String }],
            crmAppFeatures: [{ type: String }]
        },
        // 8. Quote Settings
        quoteSettings: {
            customerQuoteType: [{ type: String }],
            projectSignupLimit: { type: Number, default: 0 },
            deliveryType: { type: String, default: '' }
        },
        // 9. Fees & Charges
        feesAndCharges: {
            applicableUpgradeFees: { type: Number, default: 0 },
            signupFeesIfDirectUpgrade: { type: Number, default: 0 }
        },
        // 10. Discount Plan Setting
        discountPlanSetting: {
            bulkBuySetting: { type: Boolean, default: false },
            solarPanelBundleSetting: { type: Boolean, default: false },
            offers: { type: Boolean, default: false }
        },
        // 11. Dealer Assign Settings
        dealerAssignSettings: { howManyDealerAssign: { type: Number, default: 0 } },
        // 12. Cashback & Targets
        cashbackAndTargets: {
            yearlyTargetKw: { type: Number, default: 0 },
            cashbackPerKw: { type: Number, default: 0 },
            totalCashback: { type: Number, default: 0 }
        },
        // 13. Lead Buy Setting
        leadBuySetting: { type: String, default: '' },
        // 14. Cashback Setup
        cashbackSetup: [{
            status: { type: Boolean, default: true },
            category: { type: String },
            subCategory: { type: String },
            projectType: { type: String },
            projectSubType: { type: String },
            targetKw: { type: Number },
            cashbackPerKw: { type: Number },
            periodInMonth: { type: Number },
            claimInMonth: { type: Number },
            cashbackRedeemTo: { type: String }
        }],
        // 15. Royalty Charges Setup
        royaltyChargesSetup: [{
            status: { type: Boolean, default: true },
            category: { type: String },
            subCategory: { type: String },
            projectType: { type: String },
            projectSubType: { type: String },
            royaltyChargesPercent: { type: Number }
        }],
        // 16. Rewards And Points Settings
        rewardsAndPointsSettings: { enabled: { type: Boolean, default: false } },
        // 17. Training Videos
        trainingVideos: [{
            category: { type: String },
            sectionName: { type: String },
            uploadVideo: { type: String },
            youtubeLink: { type: String }
        }]
    },
    {
        timestamps: true,
    }
);

// Unique plan name per state
franchiseePlanSchema.index({ name: 1, state: 1 }, { unique: true });

export default mongoose.model('FranchiseePlan', franchiseePlanSchema);
