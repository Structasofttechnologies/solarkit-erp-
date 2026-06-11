import express from 'express';
import {
    getJourneyStages,
    createJourneyStage,
    updateJourneyStage,
    deleteJourneyStage,
    updateJourneyStageOrder,
    getOverdueSettings,
    createOrUpdateOverdueSetting,
    getProjectConfigurations,
    getProjectConfigurationByKey,
    saveProjectConfiguration,
    deleteProjectConfigurationByKey,
    getProjectDocuments,
    createProjectDocument,
    updateProjectDocument,
    deleteProjectDocument,
    getPlaceholderNames,
    savePlaceholderName,
    deletePlaceholderName,
    deletePlaceholderByKey
} from '../../controllers/settings/projectSettingsController.js';

const router = express.Router();

// Journey Stages
router.get('/stages', getJourneyStages);
router.post('/stages', createJourneyStage);
router.put('/stages/order', updateJourneyStageOrder); // Specific route before :id
router.put('/stages/:id', updateJourneyStage);
router.delete('/stages/:id', deleteJourneyStage);

// Overdue Settings
router.get('/overdue', getOverdueSettings);
router.post('/overdue', createOrUpdateOverdueSetting);

// Project Configuration
router.get('/config', getProjectConfigurations);
router.get('/config/:key', getProjectConfigurationByKey);
router.post('/config', saveProjectConfiguration);
router.delete('/config/:key', deleteProjectConfigurationByKey);

// Project Documents
router.get('/documents', getProjectDocuments);
router.post('/documents', createProjectDocument);
router.put('/documents/:id', updateProjectDocument);
router.delete('/documents/:id', deleteProjectDocument);

// Placeholder Names
router.get('/placeholders', getPlaceholderNames);
router.post('/placeholders', savePlaceholderName);
router.delete('/placeholders/key/:key', deletePlaceholderByKey); // Delete by key
router.delete('/placeholders/:id', deletePlaceholderName); // Delete by ID

export default router;
