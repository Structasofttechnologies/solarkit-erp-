import express from 'express';
import {
    createInventoryItem,
    getInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    createBrand,
    getBrands,
    getRestockLimits,
    setRestockLimit,
    getInventorySummary,
    getBrandOverview,
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getSettings,
    updateSettings,
    getProjectedInventory
} from '../../controllers/inventory/inventoryController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

// Inventory Items
router.post('/items', createInventoryItem);
router.get('/items', getInventoryItems);
router.patch('/items/:id', updateInventoryItem);
router.delete('/items/:id', deleteInventoryItem);

// Summary
router.get('/summary', getInventorySummary);

// Projection
router.get('/projection', getProjectedInventory);

// Brands
router.post('/brands', createBrand);
router.get('/brands', getBrands);
router.get('/brand-overview', getBrandOverview);

// Restock Limits
router.get('/restock-limits', getRestockLimits);
router.post('/restock-limits', setRestockLimit);

// Warehouses
router.get('/warehouses', getAllWarehouses);
router.get('/warehouses/:id', getWarehouseById);
router.post('/warehouses', createWarehouse);
router.patch('/warehouses/:id', updateWarehouse);
router.delete('/warehouses/:id', deleteWarehouse);

// Inventory Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
