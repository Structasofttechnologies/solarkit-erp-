import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  approveUser,
  rejectUser,
  deleteUser,
  getInstallerDashboard,
  getDeliveryDashboard,
} from '../../controllers/users/userController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllUsers);
router.post('/', authorize('admin'), createUser);
router.get('/dashboard/installer', authorize('admin'), getInstallerDashboard);
router.get('/dashboard/delivery', authorize('admin'), getDeliveryDashboard);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/approve', authorize('admin'), approveUser);
router.put('/:id/reject', authorize('admin'), rejectUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
