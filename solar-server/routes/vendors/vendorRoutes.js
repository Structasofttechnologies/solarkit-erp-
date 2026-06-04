import express from 'express';
import {
    getInstallerVendors,
    createInstallerVendor,
    updateInstallerVendor,
    deleteInstallerVendor,
    getSupplierTypes,
    createSupplierType,
    updateSupplierType,
    deleteSupplierType,
    getSupplierVendors,
    createSupplierVendor,
    updateSupplierVendor,
    deleteSupplierVendor,
    getVendorDashboardMetrics,
    getVendorOrders
} from '../../controllers/vendors/vendorController.js';
import {
    getInstallerVendorPlans,
    saveInstallerVendorPlan,
    deleteInstallerVendorPlan
} from '../../controllers/vendors/installerVendorPlanController.js';
import {
    getSupplierVendorPlans,
    saveSupplierVendorPlan,
    deleteSupplierVendorPlan,
    getSupplierVendorPlanCounts
} from '../../controllers/vendors/supplierVendorPlanController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Installer Vendor Routes
router.route('/installer-vendors')
    .get(getInstallerVendors)
    .post(protect, createInstallerVendor);

router.route('/installer-vendors/:id')
    .put(protect, updateInstallerVendor)
    .delete(protect, deleteInstallerVendor);

// Supplier Type Routes
router.route('/supplier-types')
    .get(getSupplierTypes)
    .post(protect, createSupplierType);

router.route('/supplier-types/:id')
    .put(protect, updateSupplierType)
    .delete(protect, deleteSupplierType);

// Supplier Vendor Routes
router.route('/supplier-vendors')
    .get(getSupplierVendors)
    .post(protect, createSupplierVendor);

router.route('/supplier-vendors/:id')
    .put(protect, updateSupplierVendor)
    .delete(protect, deleteSupplierVendor);

// Dashboard Routes
router.get('/dashboard-metrics', protect, getVendorDashboardMetrics);
router.get('/orders', protect, getVendorOrders);

// Installer Vendor Plan Routes
router.route('/installer-vendor-plans')
    .get(getInstallerVendorPlans)
    .post(protect, saveInstallerVendorPlan);

router.route('/installer-vendor-plans/:id')
    .delete(protect, deleteInstallerVendorPlan);

// Supplier Vendor Plan Routes
router.get('/supplier-vendor-plans/counts', getSupplierVendorPlanCounts);
router.route('/supplier-vendor-plans')
    .get(getSupplierVendorPlans)
    .post(protect, saveSupplierVendorPlan);

router.route('/supplier-vendor-plans/:id')
    .delete(protect, deleteSupplierVendorPlan);

export default router;
