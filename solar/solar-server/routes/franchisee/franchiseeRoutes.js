import express from 'express';
import * as planController from '../../controllers/franchisee/franchiseePlanController.js';
import * as rewardController from '../../controllers/franchisee/franchiseeRewardController.js';
import * as goalController from '../../controllers/franchisee/franchiseeGoalController.js';
import * as professionController from '../../controllers/franchisee/franchiseeProfessionController.js';
import * as orderController from '../../controllers/franchisee/franchiseeOrderController.js';

const router = express.Router();

// Plans
router.post('/plans', planController.createPlan);
router.get('/plans', planController.getPlans);
router.get('/plans/:id', planController.getPlan);
router.put('/plans/:id', planController.updatePlan);
router.delete('/plans/:id', planController.deletePlan);

// Rewards
router.post('/rewards', rewardController.createReward);
router.get('/rewards', rewardController.getRewards);
router.put('/rewards/:id', rewardController.updateReward);
router.delete('/rewards/:id', rewardController.deleteReward);

// Redeem Settings
router.get('/redeem-settings', rewardController.getRedeemSettings);
router.post('/redeem-settings', rewardController.saveRedeemSettings);

// Onboarding Goals
router.post('/goals', goalController.createGoal);
router.get('/goals', goalController.getGoals);
router.put('/goals/:id', goalController.updateGoal);
router.delete('/goals/:id', goalController.deleteGoal);

// Profession Types
router.post('/professions', professionController.createProfession);
router.get('/professions', professionController.getProfessions);
router.put('/professions/:id', professionController.updateProfession);
router.delete('/professions/:id', professionController.deleteProfession);

// Order Settings
router.post('/order-settings', orderController.createOrderSetting);
router.get('/order-settings', orderController.getOrderSettings);
router.put('/order-settings/:id', orderController.updateOrderSetting);
router.delete('/order-settings/:id', orderController.deleteOrderSetting);

export default router;
