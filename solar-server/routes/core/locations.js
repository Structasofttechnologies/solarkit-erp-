import express from 'express';
import * as locationController from '../../controllers/core/locationController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Country routes
router.get('/countries', locationController.getAllCountries);
router.get('/countries/master', locationController.getAllMasterCountries);
router.post('/countries/activate', protect, locationController.activateCountry);
router.get('/check-duplicate', locationController.checkDuplicate);
router.get('/countries/:id', locationController.getCountryById);
router.post('/countries', protect, locationController.createCountry);
router.put('/countries/:id', protect, locationController.updateCountry);
router.delete('/countries/:id', protect, locationController.deleteCountry);

// State routes
router.get('/states', locationController.getAllStates);
router.get('/states/:id', locationController.getStateById);
router.post('/states', protect, locationController.createState);
router.put('/states/:id', protect, locationController.updateState);
router.delete('/states/:id', protect, locationController.deleteState);

// City routes
router.get('/cities', locationController.getAllCities);
router.get('/cities/:id', locationController.getCityById);
router.post('/cities/bulk', protect, locationController.bulkCreateCities);
router.post('/cities', protect, locationController.createCity);
router.put('/cities/:id', protect, locationController.updateCity);
router.delete('/cities/:id', protect, locationController.deleteCity);

// District routes
router.get('/districts', locationController.getAllDistricts);
router.get('/districts/:id', locationController.getDistrictById);
router.post('/districts', protect, locationController.createDistrict);
router.put('/districts/:id', protect, locationController.updateDistrict);
router.delete('/districts/:id', protect, locationController.deleteDistrict);

// Cluster routes
router.get('/clusters', locationController.getAllClusters);
router.get('/clusters/:id', locationController.getClusterById);
router.post('/clusters', protect, locationController.createCluster);
router.put('/clusters/:id', protect, locationController.updateCluster);
router.delete('/clusters/:id', protect, locationController.deleteCluster);

// Zone routes
router.get('/zones', locationController.getAllZones);
router.get('/zones/:id', locationController.getZoneById);
router.post('/zones', protect, locationController.createZone);
router.put('/zones/:id', protect, locationController.updateZone);
router.delete('/zones/:id', protect, locationController.deleteZone);

// Area routes
router.get('/areas', locationController.getAllAreas);
router.get('/areas/:id', locationController.getAreaById);
router.post('/areas', protect, locationController.createArea);
router.put('/areas/:id', protect, locationController.updateArea);
router.delete('/areas/:id', protect, locationController.deleteArea);

// Hierarchy routes
router.get('/hierarchy/states', locationController.getStatesHierarchy);
router.get('/hierarchy/clusters', locationController.getClustersHierarchy);
router.get('/hierarchy/districts', locationController.getDistrictsHierarchy);
router.get('/hierarchy/cities', locationController.getCitiesHierarchy);

export default router;
