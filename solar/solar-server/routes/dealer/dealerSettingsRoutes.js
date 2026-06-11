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
    getProfessions,
    createProfession,
    deleteProfession
} from '../../controllers/dealer/dealerSettingsController.js';

const router = express.Router();

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

// Professions
router.get('/professions', getProfessions);
router.post('/professions', createProfession);
router.delete('/professions/:id', deleteProfession);

export default router;
