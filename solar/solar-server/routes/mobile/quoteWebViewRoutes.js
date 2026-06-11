import express from 'express';
import { getQuoteWebViewData } from '../../controllers/mobile/quoteWebViewController.js';

const router = express.Router();

// Public endpoint - no auth required
// GET /api/quote-web-view/:quoteId
router.get('/:quoteId', getQuoteWebViewData);

export default router;
