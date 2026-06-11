import express from 'express';
import { getStatistics, updateStatistics, createStatistics } from '../../controllers/performance/statisticsController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getStatistics)
    .post(protect, authorize('admin'), createStatistics);

router.route('/:id')
    .put(protect, authorize('admin'), updateStatistics);

export default router;
