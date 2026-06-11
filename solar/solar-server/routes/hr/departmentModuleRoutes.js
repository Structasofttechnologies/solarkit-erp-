import express from 'express';
import {
    getDepartments,
    getModules,
    getDepartmentModules,
    saveDepartmentModules,
    getDepartmentStats,
    getAllDepartmentStats,
    deleteDepartmentModule
} from '../../controllers/hr/departmentModuleController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// router.use(protect);

router.get('/departments', getDepartments);
router.get('/modules', getModules);
router.get('/department-modules/:departmentId', getDepartmentModules);
router.post('/department-modules/save', saveDepartmentModules);
router.delete('/department-modules/mapping/:mappingId', deleteDepartmentModule);
router.get('/department-modules/stats/all', getAllDepartmentStats);
router.get('/department-modules/stats/:departmentId', getDepartmentStats);

export default router;
