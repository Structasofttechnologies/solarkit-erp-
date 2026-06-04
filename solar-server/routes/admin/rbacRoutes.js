import express from 'express';
import {
  getPanels,
  createPanel,
  updatePanel,
  deletePanel,
  clonePanel,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  syncModules,
  getPermissionMatrix,
  updatePermissionMatrix,
  getUsersAndPanels,
  assignUserPanel,
  removeUserPanel,
  getActivityLogs,
} from '../../controllers/admin/rbacController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All RBAC routes require standard token authentication
router.use(protect);

// Panels Endpoints
router.get('/panels', getPanels);
router.post('/panels', createPanel);
router.put('/panels/:id', updatePanel);
router.delete('/panels/:id', deletePanel);
router.post('/panels/clone', clonePanel);

// Dynamic Modules Endpoints
router.get('/modules', getModules);
router.post('/modules', createModule);
router.post('/modules/sync', syncModules);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Permission Matrix Endpoints
router.get('/matrix', getPermissionMatrix);
router.post('/matrix/update', updatePermissionMatrix);

// User-Panel Assignment Endpoints
router.get('/users-panels', getUsersAndPanels);
router.post('/users-panels', assignUserPanel);
router.delete('/users-panels/:id', removeUserPanel);

// Audit Logging Endpoints
router.get('/logs', getActivityLogs);

export default router;
