import express from 'express';
import {
  getAdminDashboard,
  getInstallerDashboard,
  getDeliveryDashboard,
  getDealerDashboard,
  getFranchiseeDashboard,
  getInventoryDashboard,
} from '../../controllers/dashboard/dashboardController.js';
import { getAdminStats, getInstallerStats } from '../../controllers/admin/adminStatsController.js';
import { getMyOverdueTasks, getUserDashboardStats } from '../../controllers/dashboard/userDashboardController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/admin-stats', authorize('admin'), getAdminStats);
router.get('/installer-stats', authorize('admin'), getInstallerStats);
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/inventory', authorize('admin'), getInventoryDashboard);
router.get('/installer', authorize('admin'), getInstallerDashboard);
router.get('/delivery', authorize('admin'), getDeliveryDashboard);
router.get('/dealer', authorize('dealer'), getDealerDashboard);
router.get('/franchisee', authorize('franchisee'), getFranchiseeDashboard);

// User-specific overdue view
router.get('/user/overdue-tasks', getMyOverdueTasks);
router.get('/user/stats', getUserDashboardStats);

export default router;
