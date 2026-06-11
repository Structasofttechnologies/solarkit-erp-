import express from 'express';
import {
    getAllSolarKits,
    getSolarKitById,
    createSolarKit,
    updateSolarKit,
    deleteSolarKit
} from '../../controllers/projects/solarKitController.js';
import { protect } from '../../middleware/auth.js'; // Assuming auth requirements

const router = express.Router();

router.route('/')
    .get(getAllSolarKits)
    .post(protect, createSolarKit);

router.route('/:id')
    .get(getSolarKitById)
    .put(protect, updateSolarKit) // Add admin/role check if needed
    .delete(protect, deleteSolarKit);

export default router;
