import express from 'express';
import {
    getLoanApplications,
    getLoanStats,
    getLoanCountsByLocation,
    createLoanApplication
} from '../../controllers/finance/loanApplicationController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'dealer'), getLoanApplications);
router.get('/stats', authorize('admin', 'dealer'), getLoanStats);
router.get('/location-counts', authorize('admin', 'dealer'), getLoanCountsByLocation);
router.post('/', authorize('admin', 'dealer'), createLoanApplication);

export default router;
