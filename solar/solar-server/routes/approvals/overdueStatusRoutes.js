import express from 'express';
import { getOverdueStatusSettings, updateOverdueStatusSettings, getAllOverdueStatusSettings, seedDefaultSettings } from '../../controllers/approvals/overdueStatusController.js';

const router = express.Router();

router.get('/', getOverdueStatusSettings);
router.get('/all', getAllOverdueStatusSettings);
router.put('/', updateOverdueStatusSettings);
router.post('/seed', seedDefaultSettings);

export default router;
