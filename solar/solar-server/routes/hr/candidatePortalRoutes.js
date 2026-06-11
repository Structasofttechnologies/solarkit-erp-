import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import * as candidatePortalController from '../../controllers/hr/candidatePortalController.js';

const router = express.Router();

// Public routes
router.post('/login', candidatePortalController.login);

// Protected candidate routes
router.use(protect);
router.use(authorize('candidate'));

router.get('/me', candidatePortalController.getMe);
router.post('/start-test', candidatePortalController.startTest);
router.post('/submit-test', candidatePortalController.submitTest);
router.post('/submit-application', candidatePortalController.submitApplication);
router.post('/sign-agreement', candidatePortalController.signAgreement);

export default router;
