
import express from 'express';
import { getCommissionStats } from '../../controllers/dealer/commissionController.js';
import { protect } from '../../middleware/auth.js'; // Assuming auth middleware exists

const router = express.Router();

router.get('/stats', protect, getCommissionStats);

export default router;
