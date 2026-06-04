import express from "express";
import {
  getCategories,
  getSubCategoriesByCategoryUniqueId,
  getProjectTypesBySubCategoryUniqueId,
  getSubProjectTypesByProjectTypeUniqueId,
  getStates,
  getDistrictsByState
} from "../../controllers/mobile/mobileMetadataController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/sub-categories/:categoryUniqueId?", getSubCategoriesByCategoryUniqueId);
router.get("/project-types/:subCategoryUniqueId?", getProjectTypesBySubCategoryUniqueId);
router.get("/sub-project-types/:projectTypeUniqueId?", getSubProjectTypesByProjectTypeUniqueId);
router.get("/states", getStates);
router.get("/districts/:stateId", getDistrictsByState);

export default router;