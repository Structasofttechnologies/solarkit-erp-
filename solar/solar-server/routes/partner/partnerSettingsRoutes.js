import express from 'express';
import {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getRewards,
    createReward,
    updateReward,
    deleteReward,
    getGoals,
    createGoal,
    deleteGoal,
    getIndustryTypes,
    createIndustryType,
    deleteIndustryType,
    getProfessions,
    createProfession,
    deleteProfession,
    getPartners,
    createPartner,
    updatePartner,
    deletePartner,
    getBusinessTypes,
    createBusinessType,
    deleteBusinessType,
    getGSTPartnerConfigs,
    createGSTPartnerConfig,
    updateGSTPartnerConfig,
    deleteGSTPartnerConfig
} from '../../controllers/partner/partnerSettingsController.js';

import {
    createPartnerUser,
    getAllPartnerUsers,
    getPartnerUserById,
    updatePartnerUser,
    deletePartnerUser,
    getPartnerUserCounts
} from '../../controllers/partner/partnerUserController.js';

const router = express.Router();

// Partners (Types)
router.get('/types', getPartners);
router.post('/types', createPartner);
router.put('/types/:id', updatePartner);
router.delete('/types/:id', deletePartner);

// Plans
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Rewards & Points
router.get('/rewards', getRewards);
router.post('/rewards', createReward);
router.put('/rewards/:id', updateReward);
router.delete('/rewards/:id', deleteReward);

// Goals
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.delete('/goals/:id', deleteGoal);

// Industry Types
router.get('/industry-types', getIndustryTypes);
router.post('/industry-types', createIndustryType);
router.delete('/industry-types/:id', deleteIndustryType);

// Professions
router.get('/professions', getProfessions);
router.post('/professions', createProfession);
router.delete('/professions/:id', deleteProfession);

// Business Types
router.get('/business-types', getBusinessTypes);
router.post('/business-types', createBusinessType);
router.delete('/business-types/:id', deleteBusinessType);

// GST Partner Config
router.get('/gst-partner-config', getGSTPartnerConfigs);
router.post('/gst-partner-config', createGSTPartnerConfig);
router.put('/gst-partner-config/:id', updateGSTPartnerConfig);
router.delete('/gst-partner-config/:id', deleteGSTPartnerConfig);

// Partner Users
router.post('/users', createPartnerUser);
router.get('/users', getAllPartnerUsers);
router.get('/users/counts', getPartnerUserCounts);
router.get('/users/:id', getPartnerUserById);
router.put('/users/:id', updatePartnerUser);
router.delete('/users/:id', deletePartnerUser);

export default router;
