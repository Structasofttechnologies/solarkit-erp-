import express from 'express';
import {
    createSolarKit,
    getSolarKits,
    updateSolarKit,
    deleteSolarKit,
    updateSolarKitStatus,
    getSolarKitBOM,
    saveSolarKitBOM,
    createAMCPlan,
    getAMCPlans,
    updateAMCPlan,
    deleteAMCPlan,
    createAMCService,
    getAMCServices,
    updateAMCService,
    deleteAMCService,
    createBundlePlan,
    getBundlePlans,
    updateBundlePlan,
    deleteBundlePlan,
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment,
    getPlansByRole,
    getAllCombokits,
    getAllCustomizedCombokits
} from '../../controllers/inventory/combokitController.js';

const router = express.Router();

// Role Plans Route
router.get('/plans', getPlansByRole);

// ComboKit Global Fetch
router.get('/all-combokits', getAllCombokits);
router.get('/all-customized-combokits', getAllCustomizedCombokits);

// SolarKit Routes
router.post('/solarkits', createSolarKit);
router.get('/solarkits', getSolarKits);
router.put('/solarkits/:id', updateSolarKit);
router.delete('/solarkits/:id', deleteSolarKit);
router.put('/solarkits/:id/status', updateSolarKitStatus);
router.get('/solarkits/:id/bom', getSolarKitBOM);
router.put('/solarkits/:id/bom', saveSolarKitBOM);

// Route Alias for backward compatibility (Short URL)
router.get('/:id/bom', getSolarKitBOM);
router.put('/:id/bom', saveSolarKitBOM);

// AMC Plan Routes
router.post('/amc-plans', createAMCPlan);
router.get('/amc-plans', getAMCPlans);
router.put('/amc-plans/:id', updateAMCPlan);
router.delete('/amc-plans/:id', deleteAMCPlan);

// AMC Service Routes
router.post('/amc-services', createAMCService);
router.get('/amc-services', getAMCServices);
router.put('/amc-services/:id', updateAMCService);
router.delete('/amc-services/:id', deleteAMCService);

// Bundle Plan Routes
router.post('/bundle-plans', createBundlePlan);
router.get('/bundle-plans', getBundlePlans);
router.put('/bundle-plans/:id', updateBundlePlan);
router.delete('/bundle-plans/:id', deleteBundlePlan);

// ComboKit Assignment Routes
router.post('/assignments', createAssignment);
router.get('/assignments', getAssignments);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

export default router;
