import express from 'express';
import {
    createManufacturer,
    getAllManufacturers,
    updateManufacturer,
    deleteManufacturer,
    createSupplier,
    getAllSuppliers,
    updateSupplier,
    deleteSupplier,
} from '../../controllers/inventory/brandController.js';

const router = express.Router();

// Manufacturer Routes
router.post('/manufacturer', createManufacturer);
router.get('/manufacturer', getAllManufacturers);
router.put('/manufacturer/:id', updateManufacturer);
router.delete('/manufacturer/:id', deleteManufacturer);

// Supplier Routes
router.post('/supplier', createSupplier);
router.get('/supplier', getAllSuppliers);
router.put('/supplier/:id', updateSupplier);
router.delete('/supplier/:id', deleteSupplier);

export default router;
