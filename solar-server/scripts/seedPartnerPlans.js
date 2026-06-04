import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PartnerPlan from '../models/partner/PartnerPlan.js';
import Partner from '../models/partner/Partner.js';

dotenv.config();

const seedPlans = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // We need a partner and a state. We'll pick the first available or default to something.
        const partner = await Partner.findOne();
        let partnerType = 'Dealer';
        if (partner && partner.name) {
            partnerType = partner.name;
        }

        const plans = [
            {
                partnerType,
                name: 'Startup Plan',
                description: 'Configure settings for the Startup plan',
                price: 4999,
                priceDescription: 'signup fees',
                yearlyTargetKw: 50,
                cashbackAmount: 20000,
                accessType: 'App Only Access',
                userLimit: 1,
                userDescription: 'Single User',
                isActive: true,
                ui: {
                    headerColor: 'bg-blue-600',
                    buttonColor: 'bg-blue-500',
                    icon: 'Rocket',
                    iconColor: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                },
                config: {
                    kyc: { aadhar: true, pan: true, gst: false, verifiedPartner: false, notVerifiedPartner: true },
                    eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: false, gstAmount: '', depositAmount: '5000', noCashback: false },
                    coverage: { area: '1 District', city: true, district: true, cluster: false, state: false },
                    user: { sales: true, admin: false, leadPartner: true, service: true, userLimit: 1, noSublogin: false },
                    category: { solarPanel: true, solarRooftop: true, solarPump: false, solarWater: false, upto100kw: true, upto200kw: true, above100kw: false, above200kw: false, residential: true, commercial: true, onGrid: true, offGrid: true, hybrid: false },
                    features: { adminApp: true, adminCrm: false, userApp: true, leadPartner: true, districtManager: false, appSubUser: false, crmLeadManagement: true, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: false, crmProjectManagement: false, crmAmcPlan: false },
                    quote: { quickQuote: true, surveyQuote: true, generationGraph: false, addons: false, projectSignupLimit: '', deliveryType: '' },
                    fees: { signupFees: '4999', installerCharges: '', sdAmountCheque: '5000', upgradeFees: '', directUpgradeFees: '' },
                    incentive: { yearlyTarget: '50', cashbackPerKw: '', totalIncentive: '20000' }
                }
            },
            {
                partnerType,
                name: 'Basic Plan',
                description: 'Configure settings for the Basic plan',
                price: 9999,
                priceDescription: 'signup fees',
                yearlyTargetKw: 100,
                cashbackAmount: 50000,
                accessType: 'Web + App Access',
                userLimit: 5,
                userDescription: 'Multi User',
                isActive: true,
                ui: {
                    headerColor: 'bg-green-600',
                    buttonColor: 'bg-green-500',
                    icon: 'Layers',
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-50'
                },
                config: {
                   kyc: { aadhar: true, pan: true, gst: false, verifiedPartner: false, notVerifiedPartner: true },
                    eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: false, gstAmount: '', depositAmount: '10000', noCashback: false },
                    coverage: { area: '2 Districts', city: true, district: true, cluster: false, state: false },
                    user: { sales: true, admin: true, leadPartner: true, service: true, userLimit: 5, noSublogin: false },
                    category: { solarPanel: true, solarRooftop: true, solarPump: false, solarWater: false, upto100kw: true, upto200kw: true, above100kw: true, above200kw: false, residential: true, commercial: true, onGrid: true, offGrid: true, hybrid: false },
                    features: { adminApp: true, adminCrm: true, userApp: true, leadPartner: true, districtManager: false, appSubUser: true, crmLeadManagement: true, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: true, crmProjectManagement: true, crmAmcPlan: false },
                    quote: { quickQuote: true, surveyQuote: true, generationGraph: true, addons: true, projectSignupLimit: '', deliveryType: '' },
                    fees: { signupFees: '9999', installerCharges: '', sdAmountCheque: '10000', upgradeFees: '', directUpgradeFees: '' },
                    incentive: { yearlyTarget: '100', cashbackPerKw: '', totalIncentive: '50000' }
                }
            },
             {
                partnerType,
                name: 'Enterprise Plan',
                description: 'Configure settings for the Enterprise plan',
                price: 24999,
                priceDescription: 'signup fees',
                yearlyTargetKw: 500,
                cashbackAmount: 150000,
                accessType: 'Web + App Access',
                userLimit: 20,
                userDescription: 'Corporate Use',
                isActive: true,
                ui: {
                    headerColor: 'bg-gray-600',
                    buttonColor: 'bg-gray-500',
                    icon: 'Building2',
                    iconColor: 'text-gray-600',
                    bgColor: 'bg-gray-50'
                },
                config: {
                    kyc: { aadhar: true, pan: true, gst: true, verifiedPartner: true, notVerifiedPartner: false },
                    eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: true, gstAmount: '', depositAmount: '25000', noCashback: false },
                    coverage: { area: 'State Level', city: true, district: true, cluster: true, state: true },
                    user: { sales: true, admin: true, leadPartner: true, service: true, userLimit: 20, noSublogin: false },
                    category: { solarPanel: true, solarRooftop: true, solarPump: true, solarWater: true, upto100kw: true, upto200kw: true, above100kw: true, above200kw: true, residential: true, commercial: true, onGrid: true, offGrid: true, hybrid: true },
                    features: { adminApp: true, adminCrm: true, userApp: true, leadPartner: true, districtManager: true, appSubUser: true, crmLeadManagement: true, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: true, crmProjectManagement: true, crmAmcPlan: true },
                    quote: { quickQuote: true, surveyQuote: true, generationGraph: true, addons: true, projectSignupLimit: 'Unlimited', deliveryType: 'Priority' },
                    fees: { signupFees: '24999', installerCharges: 'Included', sdAmountCheque: '25000', upgradeFees: '', directUpgradeFees: '' },
                    incentive: { yearlyTarget: '500', cashbackPerKw: '500', totalIncentive: '150000' }
                }
            },
            {
                partnerType,
                name: 'Solar Business Plan',
                description: 'Configure settings for the Solar Business plan',
                price: 49999,
                priceDescription: 'signup fees',
                yearlyTargetKw: 1000,
                cashbackAmount: 400000,
                accessType: 'Web + App + API Access',
                userLimit: -1,
                userDescription: 'Unlimited Users',
                isActive: true,
                ui: {
                    headerColor: 'bg-yellow-600',
                    buttonColor: 'bg-yellow-500',
                    icon: 'SolarPanel',
                    iconColor: 'text-yellow-600',
                    bgColor: 'bg-yellow-50'
                },
                config: {
                    kyc: { aadhar: true, pan: true, gst: true, verifiedPartner: true, notVerifiedPartner: false },
                    eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: true, gstAmount: '', depositAmount: '50000', noCashback: false },
                    coverage: { area: 'National Level', city: true, district: true, cluster: true, state: true },
                    user: { sales: true, admin: true, leadPartner: true, service: true, userLimit: 999, noSublogin: false },
                    category: { solarPanel: true, solarRooftop: true, solarPump: true, solarWater: true, upto100kw: true, upto200kw: true, above100kw: true, above200kw: true, residential: true, commercial: true, onGrid: true, offGrid: true, hybrid: true },
                    features: { adminApp: true, adminCrm: true, userApp: true, leadPartner: true, districtManager: true, appSubUser: true, crmLeadManagement: true, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: true, crmProjectManagement: true, crmAmcPlan: true },
                    quote: { quickQuote: true, surveyQuote: true, generationGraph: true, addons: true, projectSignupLimit: 'Unlimited', deliveryType: 'Priority Dedicated' },
                    fees: { signupFees: '49999', installerCharges: 'Included', sdAmountCheque: '50000', upgradeFees: '', directUpgradeFees: '' },
                    incentive: { yearlyTarget: '1000', cashbackPerKw: '500', totalIncentive: '400000' }
                }
            }
        ];

        for (const planData of plans) {
            const existing = await PartnerPlan.findOne({ name: planData.name, partnerType: planData.partnerType });
            if (existing) {
                console.log(`Plan ${planData.name} already exists. Skipping.`);
            } else {
                await PartnerPlan.create(planData);
                console.log(`Created plan: ${planData.name}`);
            }
        }

        console.log('✅ Seeding complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
