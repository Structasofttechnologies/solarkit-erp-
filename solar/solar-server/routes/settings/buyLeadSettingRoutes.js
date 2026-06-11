import express from 'express';
import {
    getAllSettings,
    createSetting,
    updateSetting,
    deleteSetting,
    addLeads,
    getLeadsBySetting
} from '../../controllers/settings/buyLeadSettingController.js';

const router = express.Router();

router.get('/', getAllSettings);
router.post('/', createSetting);
router.post('/add-leads', addLeads);
router.get('/:id/leads', getLeadsBySetting);
router.put('/:id', updateSetting);
router.delete('/:id', deleteSetting);

export default router;
