import mongoose from 'mongoose';

const dealerPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            default: ''
        },
        yearlyTarget: {
            type: String,
            default: ''
        },
        incentive: {
            type: String,
            default: ''
        },
        price: {
            type: String,
            required: true
        },
        features: [{
            type: String
        }],
        documents: [{
            type: String
        }],
        depositFees: {
            type: String,
            default: ''
        },
        // Store additional configuration as a flexible object to match frontend state structure
        config: {
            kyc: {
                aadhar: Boolean,
                pan: Boolean,
                gst: Boolean,
                verifiedDealer: Boolean,
                notVerifiedDealer: Boolean
            },
            eligibility: {
                kyc: Boolean,
                agreement: Boolean,
                depositCheque: Boolean,
                gstRequired: Boolean,
                gstAmount: String,
                depositAmount: String,
                noCashback: Boolean
            },
            coverage: {
                area: String,
                city: Boolean,
                district: Boolean,
                cluster: Boolean,
                state: Boolean
            },
            user: {
                sales: Boolean,
                dealer: Boolean,
                leadPartner: Boolean,
                service: Boolean,
                userLimit: Number,
                noSublogin: Boolean
            },
            module: {
                lead: Boolean,
                loan: Boolean,
                quotes: Boolean,
                projectSignup: Boolean,
                trainingVideo: Boolean
            },
            category: {
                solarPanel: Boolean,
                solarRooftop: Boolean,
                solarPump: Boolean,
                solarWater: Boolean,
                upto100kw: Boolean,
                upto200kw: Boolean,
                above100kw: Boolean,
                above200kw: Boolean,
                residential: Boolean,
                commercial: Boolean,
                onGrid: Boolean,
                offGrid: Boolean,
                hybrid: Boolean
            },
            features: {
                adminApp: Boolean,
                adminCrm: Boolean,
                dealerUser: Boolean,
                leadPartner: Boolean,
                districtManager: Boolean,
                appSubUser: Boolean,
                crmLeadManagement: Boolean,
                crmAssignLead: Boolean,
                crmKnowMargin: Boolean,
                crmSurveyBom: Boolean,
                crmInstall: Boolean,
                crmService: Boolean,
                crmProjectManagement: Boolean,
                crmAmcPlan: Boolean
            },
            quote: {
                quickQuote: Boolean,
                surveyQuote: Boolean,
                generationGraph: Boolean,
                addons: Boolean,
                projectSignupLimit: String,
                deliveryType: String
            },
            fees: {
                signupFees: String,
                installerCharges: String,
                sdAmountCheque: String,
                upgradeFees: String,
                directUpgradeFees: String
            },
            incentive: {
                yearlyTarget: String,
                cashbackPerKw: String,
                totalIncentive: String
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // For UI display customization
        ui: {
            headerColor: String,
            buttonColor: String,
            icon: String,
            accessType: String,
            userDescription: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('DealerPlan', dealerPlanSchema);
