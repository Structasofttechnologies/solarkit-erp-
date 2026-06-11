import express from 'express';
import {
    createSetPrice,
    getSetPrices,
    updateSetPrice,
    deleteSetPrice,
    createSetPriceAmc,
    getSetPricesAmc,
    updateSetPriceAmc,
    deleteSetPriceAmc,
    createOffer,
    getOffers,
    updateOffer,
    deleteOffer,
    createBundle,
    getBundles,
    updateBundle,
    deleteBundle,
    getDashboardStats,
    getCompanyMargins,
    updateCompanyMargin
} from '../../controllers/settings/salesSettingsController.js';

const router = express.Router();

// Dashboard Stats
router.get('/dashboard-stats', getDashboardStats);

// Set Price Routes
router.post('/set-price', createSetPrice);
router.get('/set-price', getSetPrices);
router.put('/set-price/:id', updateSetPrice);
router.delete('/set-price/:id', deleteSetPrice);

// Set Price AMC Routes
router.post('/set-price-amc', createSetPriceAmc);
router.get('/set-price-amc', getSetPricesAmc);
router.put('/set-price-amc/:id', updateSetPriceAmc);
router.delete('/set-price-amc/:id', deleteSetPriceAmc);

// Offers Routes
router.post('/offers', createOffer);
router.get('/offers', getOffers);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

// Solar Bundle Routes
router.post('/bundles', createBundle);
router.get('/bundles', getBundles);
router.put('/bundles/:id', updateBundle);
router.delete('/bundles/:id', deleteBundle);

// Company Margin Routes
router.get('/company-margin', getCompanyMargins);
router.put('/company-margin', updateCompanyMargin);

export default router;
