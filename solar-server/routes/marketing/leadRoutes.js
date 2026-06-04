import express from 'express';
import { createLead, getAllLeads, getLeadById, updateLead, deleteLead } from '../../controllers/marketing/leadController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication
router.use(authorize('dealer')); // All routes require 'dealer' role

router.route('/')
    .post(createLead)
    .get(getAllLeads);

router.route('/:id')
    .get(getLeadById)
    .put(updateLead)
    .delete(deleteLead);

export default router;
