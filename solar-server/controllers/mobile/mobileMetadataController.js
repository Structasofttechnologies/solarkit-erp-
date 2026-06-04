import mongoose from "mongoose";
import ProjectType from "../../models/projects/ProjectType.js";
import SubProjectType from "../../models/projects/SubProjectType.js";
import Category from "../../models/inventory/Category.js";
import SubCategory from "../../models/inventory/SubCategory.js";
import State from "../../models/core/State.js";
import District from "../../models/core/District.js";

const buildIdQuery = (value) => {
  const query = [{ unique_id: value }];

  if (mongoose.Types.ObjectId.isValid(value)) {
    query.push({ _id: value });
  }

  return query;
};

// 1. Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 2. Get sub categories by category unique_id or _id
export const getSubCategoriesByCategoryUniqueId = async (req, res) => {
  try {
    const { categoryUniqueId } = req.params;

    if (!categoryUniqueId) {
      const subCategories = await SubCategory.find({ status: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All Sub Categories fetched successfully",
        data: subCategories,
      });
    }

    const ids = categoryUniqueId.split(',').map(id => id.trim());
    
    // Find all matching categories
    const categories = await Category.find({
      status: true,
      $or: [
        { unique_id: { $in: ids } },
        { _id: { $in: ids.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
      ]
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categories not found",
      });
    }

    const categoryIds = categories.map(cat => cat._id);

    const subCategories = await SubCategory.find({
      categoryId: { $in: categoryIds },
      status: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Sub Categories fetched successfully",
      data: subCategories,
    });
  } catch (error) {
    console.error("Error in getSubCategoriesByCategoryUniqueId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. Get project types by sub category unique_id or _id
export const getProjectTypesBySubCategoryUniqueId = async (req, res) => {
  try {
    const { subCategoryUniqueId } = req.params;

    if (!subCategoryUniqueId) {
      const projectTypes = await ProjectType.find({ status: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All Project Types fetched successfully",
        data: projectTypes,
      });
    }

    const ids = subCategoryUniqueId.split(',').map(id => id.trim());

    const subCategories = await SubCategory.find({
      status: true,
      $or: [
        { unique_id: { $in: ids } },
        { _id: { $in: ids.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
      ]
    });

    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sub Categories not found",
      });
    }

    const subCategoryIds = subCategories.map(subCat => subCat._id);

    const projectTypes = await ProjectType.find({
      subCategoryId: { $in: subCategoryIds },
      status: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Project Types fetched successfully",
      data: projectTypes,
    });
  } catch (error) {
    console.error("Error in getProjectTypesBySubCategoryUniqueId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4. Get sub project types by project type unique_id or _id
export const getSubProjectTypesByProjectTypeUniqueId = async (req, res) => {
  try {
    const { projectTypeUniqueId } = req.params;

    if (!projectTypeUniqueId) {
      const subProjectTypes = await SubProjectType.find({ status: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All Sub Project Types fetched successfully",
        data: subProjectTypes,
      });
    }

    const ids = projectTypeUniqueId.split(',').map(id => id.trim());

    const projectTypes = await ProjectType.find({
      status: true,
      $or: [
        { unique_id: { $in: ids } },
        { _id: { $in: ids.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
      ]
    });

    if (!projectTypes || projectTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project Types not found",
      });
    }

    const projectTypeIds = projectTypes.map(pt => pt._id);

    const subProjectTypes = await SubProjectType.find({
      projectTypeId: { $in: projectTypeIds },
      status: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Sub Project Types fetched successfully",
      data: subProjectTypes,
    });
  } catch (error) {
    console.error("Error in getSubProjectTypesByProjectTypeUniqueId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 5. Get all states
export const getStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "States fetched successfully",
      data: states,
    });
  } catch (error) {
    console.error("Error in getStates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 6. Get districts by state
export const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    
    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: "State ID is required",
      });
    }

    const districts = await District.find({ state: stateId, isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Districts fetched successfully",
      data: districts,
    });
  } catch (error) {
    console.error("Error in getDistrictsByState:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};