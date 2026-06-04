import express from 'express';
import {
  getAllInstallations,
  getInstallationById,
  createInstallation,
  updateInstallation,
  updateInstallationStatus,
  deleteInstallation,
  getInstallationsByInstaller,
  completeInstallation,
} from '../../controllers/projects/installationController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllInstallations);
router.post('/', authorize('admin'), createInstallation);
router.get('/:id', getInstallationById);
router.put('/:id', updateInstallation);
router.put('/:id/status', updateInstallationStatus);
router.put('/:id/complete', completeInstallation);
router.delete('/:id', authorize('admin'), deleteInstallation);
router.get('/installer/:installerId', getInstallationsByInstaller);

export default router;
