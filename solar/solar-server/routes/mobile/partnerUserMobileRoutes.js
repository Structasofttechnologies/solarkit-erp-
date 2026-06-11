import express from 'express';
import {
    createMobilePartnerUser,
    getMobilePartnerUsers,
    getMobilePartnerUserById,
    getPartnerUserMetadata,
    getDistrictsByState
} from '../../controllers/mobile/partnerUserMobileController.js';

const router = express.Router();

// Metadata for dropdowns (call this first in Flutter)
router.get('/metadata', getPartnerUserMetadata);

// Districts by state (helper for Flutter)
router.get('/districts/:stateId', getDistrictsByState);

// CRUD
router.post('/', createMobilePartnerUser);
router.get('/', getMobilePartnerUsers);
router.get('/:id', getMobilePartnerUserById);

export default router;
