import express from "express";
import {
  getCategories,
  getSubCategoriesByCategoryUniqueId,
  getProjectTypesBySubCategoryUniqueId,
  getSubProjectTypesByProjectTypeUniqueId,
  getTechnologies,
  getPanelWatts,
  getSolarPanels,
  getKilowatts,
  getDynamicAvailableFilters,
  calculateKilowatt,
  getFilteredCombokits,
  getStates,
  getDistrictsByState,
  getUserDistricts,
  calculateFinalPrice,
  getTerraceTypes,
  getMatchedQuoteSummary,
  getGstRate
} from "../../controllers/mobile/mobileMetadataController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/sub-categories/:categoryUniqueId?", getSubCategoriesByCategoryUniqueId);
router.get("/project-types/:subCategoryUniqueId?", getProjectTypesBySubCategoryUniqueId);
router.get("/sub-project-types/:projectTypeUniqueId?", getSubProjectTypesByProjectTypeUniqueId);
router.get("/technologies", getTechnologies);
router.get("/panel-watts/:technologyId?", getPanelWatts);
router.get("/solar-panels/:panelWattId?", getSolarPanels);
router.get("/capacities/:solarPanelId?", getKilowatts);
router.get("/dynamic-filters", getDynamicAvailableFilters);
router.get("/calculate-kilowatt", calculateKilowatt);
router.get("/combokits", getFilteredCombokits);
router.get("/states", getStates);
router.get("/districts/:stateId", getDistrictsByState);
router.get("/user-districts/:companyUserId", getUserDistricts);
router.get("/calculate-final-price", calculateFinalPrice);
router.post("/calculate-final-price", calculateFinalPrice);
router.get(
  "/calculate-final-price/:panelSku/:inverterSku/:bosSku/:numberOfPanels/:kilowatt/:clusterId/:stateId?/:marginType?",
  calculateFinalPrice
);
router.get("/terrace-types", getTerraceTypes);
router.get("/quote-summary", getMatchedQuoteSummary);
router.get("/gst-rate", getGstRate);

export default router;