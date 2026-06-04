import express from 'express';
import { getOverdueTaskSettings, updateOverdueTaskSettings, getAllOverdueTaskSettings, deleteOverdueTaskSettings } from '../../controllers/approvals/overdueTaskController.js';

const router = express.Router();

router.get('/', getOverdueTaskSettings);
router.get('/all', getAllOverdueTaskSettings);
router.put('/', updateOverdueTaskSettings);
router.delete('/:id', deleteOverdueTaskSettings);

export default router;
