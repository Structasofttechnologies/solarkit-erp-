
import express from 'express';
import { getSurveyByLead, createOrUpdateSurvey, completeSurvey } from '../../controllers/marketing/surveyController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Get survey for a specific lead
router.get('/:leadId', protect, getSurveyByLead);

// Create or update survey for a lead
router.post('/:leadId', protect, authorize('dealer'), createOrUpdateSurvey);

// Mark survey as completed
router.put('/:leadId/complete', protect, authorize('dealer'), completeSurvey);

export default router;
