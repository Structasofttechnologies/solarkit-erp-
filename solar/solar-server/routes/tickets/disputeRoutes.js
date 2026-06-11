import express from 'express';
import { createDispute, getAllDisputes, updateDispute } from '../../controllers/tickets/disputeController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Allow dealers and dealer managers to create and view disputes
router.post('/', authorize('dealer', 'dealerManager', 'franchiseeManager', 'admin'), createDispute);
router.get('/', authorize('dealer', 'dealerManager', 'franchiseeManager', 'admin'), getAllDisputes);

// Update status or add timeline notes
router.put('/:id', authorize('dealer', 'dealerManager', 'franchiseeManager', 'admin'), updateDispute);

export default router;
