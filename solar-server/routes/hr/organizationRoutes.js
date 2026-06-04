import express from 'express';
import { getChartData, getEmployees, getStats } from '../../controllers/hr/organizationController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/chart-data', protect, getChartData);
router.get('/employees', protect, getEmployees);
router.get('/stats', protect, getStats);

export default router;
