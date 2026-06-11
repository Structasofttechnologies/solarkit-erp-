import express from 'express';
import {
    createQuickQuote,
    getAllQuickQuotes,
    getQuickQuoteById,
    updateQuickQuote,
    deleteQuickQuote
} from '../../controllers/mobile/quickQuoteController.js';

const router = express.Router();

router.post('/', createQuickQuote);
router.get('/', getAllQuickQuotes);
router.get('/:id', getQuickQuoteById);
router.put('/:id', updateQuickQuote);
router.delete('/:id', deleteQuickQuote);

export default router;
