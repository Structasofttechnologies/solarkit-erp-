import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as hrmsController from '../../controllers/settings/hrmsSettingsController.js';

const router = express.Router();

// HRMS Settings (Department/Position Config)
router.get('/settings', protect, hrmsController.getHRMSSettings);
router.post('/settings', protect, hrmsController.createOrUpdateHRMSSettings);
router.put('/settings/:id', protect, hrmsController.updateHRMSSettings);
router.delete('/settings/:id', protect, hrmsController.deleteHRMSSettings);

// Candidate Tests
router.get('/tests', protect, hrmsController.getCandidateTests);
router.post('/tests', protect, hrmsController.createCandidateTest);
router.put('/tests/:id', protect, hrmsController.updateCandidateTest);
router.delete('/tests/:id', protect, hrmsController.deleteCandidateTest);

// Candidate Trainings
router.get('/trainings', protect, hrmsController.getCandidateTrainings);
router.post('/trainings', protect, hrmsController.createCandidateTraining);
router.put('/trainings/:id', protect, hrmsController.updateCandidateTraining);
router.delete('/trainings/:id', protect, hrmsController.deleteCandidateTraining);

// Vacancies
router.get('/vacancies', protect, hrmsController.getVacancies);
router.post('/vacancies', protect, hrmsController.createVacancy);
router.put('/vacancies/:id', protect, hrmsController.updateVacancy);
router.delete('/vacancies/:id', protect, hrmsController.deleteVacancy);
router.post('/vacancies/:vacancyId/candidates', protect, hrmsController.addCandidateToVacancy);

// Candidates
router.get('/candidates', protect, hrmsController.getAllCandidates);
router.get('/vacancies/:vacancyId/candidates', protect, hrmsController.getCandidatesByVacancy);
router.put('/candidates/:candidateId/status', protect, hrmsController.updateCandidateStatus);
router.post('/candidates/:candidateId/recruit', protect, hrmsController.recruitCandidate);
router.delete('/candidates/:candidateId', protect, hrmsController.deleteCandidate);

export default router;
