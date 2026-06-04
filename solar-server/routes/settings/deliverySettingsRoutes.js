import express from 'express';
import {
    getDeliveryTypes,
    createDeliveryType,
    updateDeliveryType,
    deleteDeliveryType,
    getBenchmarkPrices,
    createBenchmarkPrice,
    updateBenchmarkPrice,
    deleteBenchmarkPrice,
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVendorDeliveryConfig,
    upsertVendorDeliveryConfig,
    getVendorDeliveryPlans,
    createVendorDeliveryPlan,
    updateVendorDeliveryPlan,
    deleteVendorDeliveryPlan, deleteApplicableCategory, addApplicableCategory, updateApplicableCategory,
} from '../../controllers/settings/deliverySettingsController.js';

const router = express.Router();

// Delivery Types
router.route('/types')
    .get(getDeliveryTypes)
    .post(createDeliveryType);

router.route('/types/:id')
    .put(updateDeliveryType)
    .delete(deleteDeliveryType);

router.route('/types/:id/categories')
    .post(addApplicableCategory);

router.route('/types/:id/categories/:categoryId')
    .put(updateApplicableCategory)
    .delete(deleteApplicableCategory);

// Benchmark Prices
router.route('/benchmark-prices')
    .get(getBenchmarkPrices)
    .post(createBenchmarkPrice);

router.route('/benchmark-prices/:id')
    .put(updateBenchmarkPrice)
    .delete(deleteBenchmarkPrice);

// Vehicles
router.route('/vehicles')
    .get(getVehicles)
    .post(createVehicle);

router.route('/vehicles/:id')
    .put(updateVehicle)
    .delete(deleteVehicle);

// Vendor Delivery Config
router.route('/vendor-config')
    .get(getVendorDeliveryConfig)
    .post(upsertVendorDeliveryConfig);

// Vendor Delivery Plans
router.route('/vendor-plans')
    .get(getVendorDeliveryPlans)
    .post(createVendorDeliveryPlan);

router.route('/vendor-plans/:id')
    .put(updateVendorDeliveryPlan)
    .delete(deleteVendorDeliveryPlan);

export default router;
