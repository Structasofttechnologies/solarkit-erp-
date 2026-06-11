import express from 'express';
import {
    getLoanProviders,
    createLoanProvider,
    updateLoanProvider,
    deleteLoanProvider
} from '../../controllers/finance/loanProviderController.js';

const router = express.Router();

router.get('/', getLoanProviders);
router.post('/', createLoanProvider);
router.put('/:id', updateLoanProvider);
router.delete('/:id', deleteLoanProvider);

export default router;
