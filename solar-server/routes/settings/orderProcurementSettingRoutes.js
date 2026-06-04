import express from 'express';
import {
    getAllSettings,
    getSettingById,
    createSetting,
    updateSetting,
    deleteSetting
} from '../../controllers/settings/orderProcurementSettingController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
    .get(getAllSettings)
    .post(createSetting);

router.route('/:id')
    .get(getSettingById)
    .put(updateSetting)
    .delete(deleteSetting);

export default router;
