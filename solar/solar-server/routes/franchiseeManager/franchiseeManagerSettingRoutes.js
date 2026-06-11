
import express from 'express';
import { getFranchiseeManagerSettings, updateFranchiseeManagerSettings } from '../../controllers/franchiseeManager/franchiseeManagerSettingController.js';

const router = express.Router();

router.get('/', getFranchiseeManagerSettings);
router.put('/', updateFranchiseeManagerSettings);

export default router;
