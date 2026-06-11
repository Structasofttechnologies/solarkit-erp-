import express from 'express';
import {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
    assignModulesToDepartment,
    getDepartmentModules,
    createTemporaryIncharge,
    getTemporaryIncharges,
    seedSystemModules,
    getTemporaryInchargeDashboard,
    updateTemporaryIncharge,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createResignationRequest,
    getResignationRequests,
    approveResignation,
    rejectResignation
} from '../../controllers/hr/hrController.js';

const router = express.Router();

// Module Routes
router.get('/modules', getAllModules);
router.post('/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);
router.post('/seed-modules', seedSystemModules);
router.post('/modules/seed', seedSystemModules); // Admin helper

// Department Module Assignment
router.post('/department/:departmentId/modules', assignModulesToDepartment);
router.get('/department/:departmentId/modules', getDepartmentModules);

// Temporary Incharge
router.post('/temporary-incharge', createTemporaryIncharge);
router.put('/temporary-incharge/:id', updateTemporaryIncharge);
router.get('/temporary-incharge', getTemporaryIncharges);
router.get('/temporary-incharge/dashboard', getTemporaryInchargeDashboard);

// Employee Management
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Resignation Management
router.post('/resignations', createResignationRequest);
router.get('/resignations', getResignationRequests);
router.put('/resignations/:id/approve', approveResignation);
router.put('/resignations/:id/reject', rejectResignation);

export default router;
