import express from 'express';
import {
    getLoanRules,
    createLoanRule,
    updateLoanRule,
    deleteLoanRule,
    updateModuleCompletion
} from '../../controllers/finance/loanController.js';

const router = express.Router();

router.get('/', getLoanRules);
router.post('/', createLoanRule);
router.put('/:id', updateLoanRule);
router.delete('/:id', deleteLoanRule);
router.post('/completion/update', updateModuleCompletion);

export default router;
