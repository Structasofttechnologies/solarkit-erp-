import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as employeeTrainingController from '../../controllers/hr/employeeTrainingController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/my-training', employeeTrainingController.getMyTraining);
router.post('/complete-training', employeeTrainingController.completeTraining);

export default router;
