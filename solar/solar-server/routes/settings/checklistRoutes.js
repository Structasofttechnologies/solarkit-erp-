import express from 'express';
import {
    getAllChecklists,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    getModuleCompletions,
    updateModuleCompletion,
    seedChecklists,
    getAllCategories,
    createCategory
} from '../../controllers/settings/checklistController.js';

const router = express.Router();

router.get('/', getAllChecklists);
router.post('/', createChecklist);
router.put('/:id', updateChecklist);
router.delete('/:id', deleteChecklist);

router.get('/completion', getModuleCompletions);
router.post('/completion/update', updateModuleCompletion);
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.post('/seed', seedChecklists);

export default router;
