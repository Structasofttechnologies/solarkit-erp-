import express from 'express';
import { getConfig, upsertConfig } from '../../controllers/admin/adminConfigController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All admin configuration requires authentication
router.get('/:section/:key', protect, getConfig);
router.put('/:section/:key', protect, upsertConfig);

export default router;

