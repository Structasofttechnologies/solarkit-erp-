import express from 'express';
import { protect } from '../../middleware/auth.js';

// Import Controllers
import * as projectTypeController from '../../controllers/projects/projectTypeController.js';
import * as categoryController from '../../controllers/inventory/categoryController.js';
import * as unitController from '../../controllers/inventory/unitController.js';
import * as skuController from '../../controllers/inventory/skuController.js';
import * as priceMasterController from '../../controllers/inventory/priceMasterController.js';
import { createProductPriceHandler } from '../../controllers/inventory/productPriceController.js';
import * as subCategoryController from '../../controllers/inventory/subCategoryController.js';
import * as subProjectTypeController from '../../controllers/projects/subProjectTypeController.js';
import * as projectCategoryMappingController from '../../controllers/projects/projectCategoryMappingController.js';
import {
    BRAND,
    DEPARTMENT,
    DESIGNATION,
    ROLE,
    PERMISSION,
    getDesignationsByDepartment
} from '../../controllers/core/masterController.js';


import * as technologyController from '../../controllers/projects/technologyController.js';
import * as panelWattController from '../../controllers/projects/panelWattController.js';
import * as solarPanelController from '../../controllers/projects/solarPanelController.js';
import * as kilowattController from '../../controllers/projects/kilowattController.js';

const router = express.Router();

// --- Project Types ---
router.get('/project-types', projectTypeController.getAllProjectTypes);
router.post('/project-types', protect, projectTypeController.createProjectType);
router.put('/project-types/:id', protect, projectTypeController.updateProjectType);
router.delete('/project-types/:id', protect, projectTypeController.deleteProjectType);

// --- Categories ---
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', protect, categoryController.createCategory);
router.put('/categories/:id', protect, categoryController.updateCategory);
router.delete('/categories/:id', protect, categoryController.deleteCategory);

// --- Sub Categories ---
router.get('/sub-categories', subCategoryController.getAllSubCategories);
router.post('/sub-categories', protect, subCategoryController.createSubCategory);
router.put('/sub-categories/:id', protect, subCategoryController.updateSubCategory);
router.delete('/sub-categories/:id', protect, subCategoryController.deleteSubCategory);

// --- Sub Project Types ---
router.get('/sub-project-types', subProjectTypeController.getAllSubProjectTypes);
router.post('/sub-project-types', protect, subProjectTypeController.createSubProjectType);
router.put('/sub-project-types/:id', protect, subProjectTypeController.updateSubProjectType);
router.delete('/sub-project-types/:id', protect, subProjectTypeController.deleteSubProjectType);


// --- Technology ---
router.get('/technologies', technologyController.getAll);
router.post('/technologies', protect, technologyController.create);
router.put('/technologies/:id', protect, technologyController.update);
router.delete('/technologies/:id', protect, technologyController.remove);

// --- Panel Watt ---
router.get('/panel-watts', panelWattController.getAll);
router.post('/panel-watts', protect, panelWattController.create);
router.put('/panel-watts/:id', protect, panelWattController.update);
router.delete('/panel-watts/:id', protect, panelWattController.remove);

// --- Solar Panel ---
router.get('/solar-panels', solarPanelController.getAll);
router.post('/solar-panels', protect, solarPanelController.create);
router.put('/solar-panels/:id', protect, solarPanelController.update);
router.delete('/solar-panels/:id', protect, solarPanelController.remove);

// --- Kilowatt ---
router.get('/kilowatts', kilowattController.getAll);
router.post('/kilowatts', protect, kilowattController.create);
router.put('/kilowatts/:id', protect, kilowattController.update);
router.delete('/kilowatts/:id', protect, kilowattController.remove);

// --- Units ---
router.get('/units', unitController.getAllUnits);
router.post('/units', protect, unitController.createUnit);
router.put('/units/:id', protect, unitController.updateUnit);
router.delete('/units/:id', protect, unitController.deleteUnit);

// --- SKUs ---
router.get('/skus', skuController.getAllSKUs);
router.post('/skus', protect, skuController.createSKU);
router.put('/skus/:id', protect, skuController.updateSKU);
router.delete('/skus/:id', protect, skuController.deleteSKU);
router.post('/skus/parameters', protect, skuController.saveSKUParameters);
router.get('/skus/:skuCode/parameters', skuController.getSKUParameters);
router.post('/skus/image', protect, skuController.saveSKUImage);
router.get('/skus/:skuCode/image', skuController.getSKUImage);
router.post('/skus/bulk', protect, skuController.bulkCreateSKUs);
router.get('/skus/product/:productId', skuController.getSKUsByProduct);

// --- Price Master ---
router.get('/price-master', priceMasterController.getAllPriceMasters);
router.post('/price-master', protect, priceMasterController.createPriceMaster);
router.put('/price-master/:id', protect, priceMasterController.updatePriceMaster);
router.delete('/price-master/:id', protect, priceMasterController.deletePriceMaster);
router.get('/product-prices', createProductPriceHandler.getAll);
router.post('/product-prices', protect, createProductPriceHandler.upsert);
router.post('/product-prices/bulk', protect, createProductPriceHandler.bulkUpsert);
router.delete('/product-prices/:id', protect, createProductPriceHandler.delete);

// --- Project Category Mappings ---
router.get('/project-category-mappings', projectCategoryMappingController.getAllMappings);
router.post('/project-category-mappings', protect, projectCategoryMappingController.createMapping);
router.put('/project-category-mappings/:id', protect, projectCategoryMappingController.updateMapping);
router.delete('/project-category-mappings/:id', protect, projectCategoryMappingController.deleteMapping);

// --- Legacy Masters ---

// Brands
router.get('/brands', BRAND.getAll);
router.post('/brands', protect, BRAND.create);
router.put('/brands/:id', protect, BRAND.update);
router.delete('/brands/:id', protect, BRAND.delete);

// Roles
router.get('/roles', ROLE.getAll);
router.post('/roles', protect, ROLE.create);
router.put('/roles/:id', protect, ROLE.update);
router.delete('/roles/:id', protect, ROLE.delete);

// Departments
router.get('/departments', DEPARTMENT.getAll);
router.post('/departments', protect, DEPARTMENT.create);
router.put('/departments/:id', protect, DEPARTMENT.update);
router.delete('/departments/:id', protect, DEPARTMENT.delete);

// Designations
router.get('/designations', DESIGNATION.getAll);
router.post('/designations', protect, DESIGNATION.create);
router.put('/designations/:id', protect, DESIGNATION.update);
router.delete('/designations/:id', protect, DESIGNATION.delete);

// Permissions
router.get('/permissions', PERMISSION.getAll);
router.post('/permissions', protect, PERMISSION.create);
router.put('/permissions/:id', protect, PERMISSION.update);
router.delete('/permissions/:id', protect, PERMISSION.delete);

// Custom Routes
router.get('/departments/:departmentId/designations', getDesignationsByDepartment);

export default router;
