import express from 'express';
import {
    createQuoteSetting, getQuoteSettings, updateQuoteSetting, deleteQuoteSetting,
    createSurveyBOM, getSurveyBOMs, updateSurveyBOM, deleteSurveyBOM,
    createTerraceType, getTerraceTypes, updateTerraceType, deleteTerraceType,
    createStructureType, getStructureTypes, updateStructureType, deleteStructureType,
    createBuildingType, getBuildingTypes, updateBuildingType, deleteBuildingType,
    createDiscom, getDiscoms, getDiscomsByState, updateDiscom, deleteDiscom
} from '../../controllers/settings/quoteSettingsController.js';

const router = express.Router();

// --- Quote Settings ---
router.post('/settings', createQuoteSetting);
router.get('/settings', getQuoteSettings);
router.put('/settings/:id', updateQuoteSetting);
router.delete('/settings/:id', deleteQuoteSetting);

// --- Survey BOM ---
router.post('/survey-bom', createSurveyBOM);
router.get('/survey-bom', getSurveyBOMs);
router.put('/survey-bom/:id', updateSurveyBOM);
router.delete('/survey-bom/:id', deleteSurveyBOM);

// --- Terrace Types ---
router.post('/terrace-types', createTerraceType);
router.get('/terrace-types', getTerraceTypes);
router.put('/terrace-types/:id', updateTerraceType);
router.delete('/terrace-types/:id', deleteTerraceType);

// --- Structure Types ---
router.post('/structure-types', createStructureType);
router.get('/structure-types', getStructureTypes);
router.put('/structure-types/:id', updateStructureType);
router.delete('/structure-types/:id', deleteStructureType);

// --- Building Types ---
router.post('/building-types', createBuildingType);
router.get('/building-types', getBuildingTypes);
router.put('/building-types/:id', updateBuildingType);
router.delete('/building-types/:id', deleteBuildingType);

// --- Discoms ---
router.post('/discoms', createDiscom);
router.get('/discoms', getDiscoms);
router.get('/discoms/state/:stateId', getDiscomsByState);
router.put('/discoms/:id', updateDiscom);
router.delete('/discoms/:id', deleteDiscom);

export default router;
