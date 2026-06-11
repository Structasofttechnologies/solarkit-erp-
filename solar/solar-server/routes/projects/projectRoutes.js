import express from 'express';
import {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectStats,
    signProject
} from '../../controllers/projects/projectController.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/stats', getProjectStats);
router.post('/', createProject);
router.post('/sign-project/:leadId', signProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
