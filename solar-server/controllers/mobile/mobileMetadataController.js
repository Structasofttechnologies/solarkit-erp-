import mongoose from "mongoose";
import ProjectType from "../../models/projects/ProjectType.js";
import SubProjectType from "../../models/projects/SubProjectType.js";
import Category from "../../models/inventory/Category.js";
import SubCategory from "../../models/inventory/SubCategory.js";
import Technology from "../../models/projects/Technology.js";
import PanelWatt from "../../models/projects/PanelWatt.js";
import SolarPanel from "../../models/projects/SolarPanel.js";
import Kilowatt from "../../models/projects/Kilowatt.js";
import State from "../../models/core/State.js";
import District from "../../models/core/District.js";
import SKU from "../../models/inventory/SKU.js";
import ProjectCategoryMapping from "../../models/projects/ProjectCategoryMapping.js";
import ComboKitAssignment from "../../models/inventory/ComboKitAssignment.js";
import BrandManufacturer from "../../models/inventory/BrandManufacturer.js";
import CompanyUser from "../../models/users/CompanyUser.js";
import SetPrice from "../../models/finance/SetPrice.js";

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
    const validObjectIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

    // Try finding project types
    const projectTypes = await ProjectType.find({
      status: true,
      $or: [
        { unique_id: { $in: ids } },
        { _id: { $in: validObjectIds } }
      ]
    });
    const projectTypeIds = projectTypes.map(pt => pt._id);

    // Try finding sub categories
    const subCategories = await mongoose.model('SubCategory').find({
      status: true,
      _id: { $in: validObjectIds }
    });
    const subCategoryIds = subCategories.map(sc => sc._id);

    // Find SubProjectTypes matching either projectTypeId or subCategoryId or the direct ID in the parameters list
    const subProjectTypes = await SubProjectType.find({
      status: true,
      $or: [
        { projectTypeId: { $in: projectTypeIds } },
        { subCategoryId: { $in: subCategoryIds } },
        { subCategoryId: { $in: validObjectIds } }
      ]
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

// 4.5 Get all technologies
export const getTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find({ status: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Technologies fetched successfully",
      data: technologies,
    });
  } catch (error) {
    console.error("Error in getTechnologies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4.6 Get all panel watts (filtered by technologyId optionally)
export const getPanelWatts = async (req, res) => {
  try {
    const { technologyId } = req.params;
    let query = { status: true };
    if (technologyId) query.technologyId = technologyId;

    const panelWatts = await PanelWatt.find(query).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Panel Watts fetched successfully",
      data: panelWatts,
    });
  } catch (error) {
    console.error("Error in getPanelWatts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4.7 Get all solar panels (filtered by panelWattId optionally)
export const getSolarPanels = async (req, res) => {
  try {
    const { panelWattId } = req.params;
    let query = { status: true };
    if (panelWattId) query.panelWattId = panelWattId;

    const solarPanels = await SolarPanel.find(query).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Solar Panels (Number of Panels) fetched successfully",
      data: solarPanels,
    });
  } catch (error) {
    console.error("Error in getSolarPanels:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4.8 Get all kilowatts / capacities (filtered by solarPanelId optionally)
export const getKilowatts = async (req, res) => {
  try {
    const { solarPanelId } = req.params;
    let query = { status: true };
    if (solarPanelId) query.solarPanelId = solarPanelId;

    const kilowatts = await Kilowatt.find(query).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Capacities (Kilowatts) fetched successfully",
      data: kilowatts,
    });
  } catch (error) {
    console.error("Error in getKilowatts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4.9 Dynamic filter for getting available options based on Product/SKU intersections
export const getDynamicAvailableFilters = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      projectType,
      brandId,
      technology,
      panelWatt
    } = req.query;

    // Helper to check if string is ObjectId
    const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

    // Build the query to find SKUs matching these criteria
    let query = { status: true };

    // Track resolved values for solar panel calculation
    let resolvedPanelWatt = null;
    let projectTypeFromKW = null;
    let projectTypeToKW = null;

    // ── Track resolved names for response ────────────────────────────────
    const resolvedFilters = {
      category:       { id: category || null,    name: null },
      subCategory:    { id: subCategory || null,  name: null },
      projectType:    { id: projectType || null,  name: null, kWFrom: null, kWTo: null },
      brand:          { id: brandId || null,      name: null },
      technology:     { id: technology || null,   name: null },
      panelWatt:      { id: panelWatt || null,    name: null, wattage: null },
    };
    // ─────────────────────────────────────────────────────────────────────

    if (category) {
      if (isObjectId(category)) {
        const cat = await Category.findById(category).lean();
        if (cat) {
          query.category = cat.name;
          resolvedFilters.category.name = cat.name;
        }
      } else {
        query.category = category;
        resolvedFilters.category.name = category;
      }
    }

    if (subCategory) {
      if (isObjectId(subCategory)) {
        const subCat = await SubCategory.findById(subCategory).lean();
        if (subCat) {
          query.subCategory = subCat.name;
          resolvedFilters.subCategory.name = subCat.name;
        }
      } else {
        query.subCategory = subCategory;
        resolvedFilters.subCategory.name = subCategory;
      }
    }

    // Resolve Project Type — extract kW range for solar panel calculation
    if (projectType) {
      if (isObjectId(projectType)) {
        const pType = await ProjectType.findById(projectType).lean();
        if (pType) {
          resolvedFilters.projectType.name = pType.name;

          // Try to extract kW range from the project type name (e.g. "Commercial upto 10 KW")
          const uptoMatch = pType.name.match(/upto\s+(\d+)/i);
          if (uptoMatch) {
            projectTypeFromKW = 1;
            projectTypeToKW = parseInt(uptoMatch[1]);
          }

          // Also check ProjectCategoryMapping for exact from/to values
          const catId = isObjectId(category) ? category : null;
          const subCatId = isObjectId(subCategory) ? subCategory : null;
          if (catId) {
            let mappingQuery = { categoryId: new mongoose.Types.ObjectId(catId) };
            if (subCatId) mappingQuery.subCategoryId = new mongoose.Types.ObjectId(subCatId);

            let mappings = await ProjectCategoryMapping.find(mappingQuery).lean();

            if (mappings.length === 0 && subCatId) {
              mappings = await ProjectCategoryMapping.find({
                categoryId: new mongoose.Types.ObjectId(catId)
              }).lean();
            }

            if (mappings.length > 0) {
              const relevantMapping = mappings.find(m =>
                m.projectTypeTo <= (projectTypeToKW || 999)
              ) || mappings[0];
              if (relevantMapping) {
                projectTypeFromKW = relevantMapping.projectTypeFrom;
                projectTypeToKW = relevantMapping.projectTypeTo;
              }
            }
          }

          resolvedFilters.projectType.kWFrom = projectTypeFromKW;
          resolvedFilters.projectType.kWTo   = projectTypeToKW;
        }
      }
    }

    if (brandId) {
      if (isObjectId(brandId)) {
        // brand field in SKU is stored as ObjectId
        query.brand = new mongoose.Types.ObjectId(brandId);
        const brandDoc = await BrandManufacturer.findById(brandId).lean();
        resolvedFilters.brand.name = brandDoc?.companyName || brandDoc?.brand || null;
      } else {
        query.brand = brandId;
        resolvedFilters.brand.name = brandId;
      }
    }

    if (technology) {
      if (isObjectId(technology)) {
        const tech = await Technology.findById(technology).lean();
        if (tech) {
          query.technology = { $regex: new RegExp(tech.name, "i") };
          resolvedFilters.technology.name = tech.name;
        }
      } else {
        query.technology = { $regex: new RegExp(technology, "i") };
        resolvedFilters.technology.name = technology;
      }
    }

    if (panelWatt) {
      if (isObjectId(panelWatt)) {
        const pWatt = await PanelWatt.findById(panelWatt).lean();
        if (pWatt) {
          const parsedWatt = Number(pWatt.name.toString().replace(/kw|w/ig, '').trim());
          if (!isNaN(parsedWatt)) {
            query.wattage = parsedWatt;
            resolvedPanelWatt = parsedWatt;
            resolvedFilters.panelWatt.name = pWatt.name;
            resolvedFilters.panelWatt.wattage = parsedWatt;
          }
        } else {
          resolvedFilters.panelWatt.name = 'ID not found in PanelWatt master';
        }
      } else {
        const parsedWatt = Number(panelWatt.toString().replace(/kw|w/ig, '').trim());
        if (!isNaN(parsedWatt)) {
          query.wattage = parsedWatt;
          resolvedPanelWatt = parsedWatt;
          resolvedFilters.panelWatt.name = `${parsedWatt}W`;
          resolvedFilters.panelWatt.wattage = parsedWatt;
        }
      }
    }
    // Find all matching SKUs first
    const skus = await SKU.find(query).lean();
    console.log('[DynamicFilters] Found SKUs:', skus.length);
    console.log('[DynamicFilters] ProjectType Range:', projectTypeFromKW, 'to', projectTypeToKW, 'kW');
    console.log('[DynamicFilters] Resolved Panel Watt before fallback:', resolvedPanelWatt);

    // If panelWatt wasn't resolved from PanelWatt master, get it from ComboKitAssignment directly
    if (!resolvedPanelWatt) {
      // Build brand-based query to find matching combokit
      const ckQuery = {};
      if (brandId && isObjectId(brandId)) {
        const brand = await BrandManufacturer.findById(brandId).lean();
        const brandName = brand?.companyName || brand?.brand;
        if (brandName) {
          ckQuery.$or = [
            { brandName: { $regex: new RegExp(brandName, 'i') } },
            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } }
          ];
        }
      }
      const firstKit = await ComboKitAssignment.findOne(ckQuery, 'panelWatt').lean();
      if (firstKit?.panelWatt) {
        resolvedPanelWatt = firstKit.panelWatt;
        console.log('[DynamicFilters] Using panelWatt from ComboKitAssignment:', resolvedPanelWatt);
      }
      // Also try from matching SKUs
      if (!resolvedPanelWatt && skus.length > 0) {
        resolvedPanelWatt = skus[0].wattage;
        console.log('[DynamicFilters] Using SKU wattage as fallback:', resolvedPanelWatt);
      }
    }

    // ── Calculate Solar Panel Numbers ──
    let availableSolarPanelNumbers = [];

    if (projectTypeFromKW && projectTypeToKW && resolvedPanelWatt) {
      // Generate panel counts from kW range × panel watt
      for (let kw = projectTypeFromKW; kw <= projectTypeToKW; kw++) {
        const numPanels = Math.ceil((kw * 1000) / resolvedPanelWatt);
        availableSolarPanelNumbers.push(numPanels.toString());
      }
      availableSolarPanelNumbers = [...new Set(availableSolarPanelNumbers)]
        .sort((a, b) => Number(a) - Number(b))
        .map(val => ({ _id: val, id: val, name: `${val} Panels` }));
    } else {
      // Fallback: get numberOfPanels directly from ComboKitAssignment collection
      const comboKitQuery = {};

      if (brandId && isObjectId(brandId)) {
        const brand = await BrandManufacturer.findById(brandId).lean();
        const brandName = brand?.companyName || brand?.brand;
        if (brandName) {
          comboKitQuery.$or = [
            { brandName: { $regex: new RegExp(brandName, 'i') } },
            { panels: { $regex: new RegExp(brandName, 'i') } },
            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } },
          ];
        }
      }

      const kitPanelNumbers = await ComboKitAssignment.distinct('numberOfPanels', comboKitQuery);
      availableSolarPanelNumbers = kitPanelNumbers
        .filter(n => n != null && !isNaN(n))
        .sort((a, b) => a - b)
        .map(val => ({ _id: val.toString(), id: val.toString(), name: `${val} Panels` }));
    }

    const availableWattages = [...new Set(skus.map(s => s.wattage).filter(Boolean))]
      .map(val => ({ id: val.toString(), name: val.toString() }));

    const availableTechnologies = [...new Set(skus.map(s => s.technology).filter(Boolean))]
      .map(val => ({ id: val, name: val }));

    // Update resolvedFilters with final panelWatt used
    resolvedFilters.panelWatt.wattage = resolvedPanelWatt;
    if (!resolvedFilters.panelWatt.name && resolvedPanelWatt) {
      resolvedFilters.panelWatt.name = `${resolvedPanelWatt}W (auto-resolved)`;
    }

    return res.status(200).json({
      success: true,
      message: "Available filters fetched successfully",
      resolvedFilters,           // ← shows what was matched for each ID
      calculationInfo: {
        panelWattUsed: resolvedPanelWatt,
        projectTypeRangeKW: projectTypeFromKW && projectTypeToKW
          ? `${projectTypeFromKW}kW to ${projectTypeToKW}kW`
          : null,
        formula: resolvedPanelWatt && projectTypeToKW
          ? `ceil(kW × 1000 ÷ ${resolvedPanelWatt}W)`
          : 'fallback: ComboKitAssignment.numberOfPanels'
      },
      data: {
        availableSolarPanelNumbers,
        availableWattages,
        availableTechnologies
      },
    });
  } catch (error) {
    console.error("Error in getDynamicAvailableFilters:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4.11 Get Filtered Combokits for Mobile — filter by brand only
export const getFilteredCombokits = async (req, res) => {
  try {
    const { brandId, kilowatt } = req.query;
    const kw = kilowatt ? parseFloat(kilowatt) : null;

    const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

    // --- Build query for ComboKitAssignment ---
    const query = {}; // No status filter — return all kits regardless of Active/Inactive

    // brandId filter — search root level brandName, panels, AND nested comboKits[].panelBrand
    if (brandId) {
      if (isObjectId(brandId)) {
        const brand = await BrandManufacturer.findById(brandId).lean();
        const brandName = brand?.companyName || brand?.brand;
        if (brandName) {
          query.$or = [
            { brandId: new mongoose.Types.ObjectId(brandId) },
            { brandName: { $regex: new RegExp(brandName, 'i') } },
            { panels: { $regex: new RegExp(brandName, 'i') } },
            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } },
            { 'comboKits.inverterBrand': { $regex: new RegExp(brandName, 'i') } }
          ];
        } else {
          query.brandId = new mongoose.Types.ObjectId(brandId);
        }
      } else {
        // brandId is a name string
        query.$or = [
          { brandName: { $regex: new RegExp(brandId, 'i') } },
          { panels: { $regex: new RegExp(brandId, 'i') } },
          { 'comboKits.panelBrand': { $regex: new RegExp(brandId, 'i') } },
          { 'comboKits.inverterBrand': { $regex: new RegExp(brandId, 'i') } }
        ];
      }
    }

    console.log('[getFilteredCombokits] Query:', JSON.stringify(query));

    const combokits = await ComboKitAssignment.find(query).lean();

    console.log('[getFilteredCombokits] Found:', combokits.length);

    // --- Fetch Prices from SetPrice for each combokit ---
    const comboKitNames = combokits
      .map(a => a.solarkitName || (a.comboKits?.[0]?.name))
      .filter(Boolean);

    const setPrices = comboKitNames.length > 0
      ? await SetPrice.find({ comboKit: { $in: comboKitNames }, status: 'Active' })
          .select('comboKit benchmarkPrice marketPrice gst finalPrice paymentType kitType')
          .lean()
      : [];

    // Build a map: comboKitName -> prices array
    const priceMap = {};
    setPrices.forEach(p => {
      if (!priceMap[p.comboKit]) priceMap[p.comboKit] = [];
      priceMap[p.comboKit].push({
        benchmarkPrice: p.benchmarkPrice,
        marketPrice: p.marketPrice,
        gst: p.gst,
        finalPrice: p.finalPrice,
        paymentType: p.paymentType,
        kitType: p.kitType,
      });
    });

    // --- Fetch Brand Logos ---
    // Fetch all brands to map logos efficiently
    const allBrands = await BrandManufacturer.find({ isActive: true }).select('companyName brand brandLogo').lean();
    const brandMap = {};
    allBrands.forEach(b => {
      if (b.companyName) brandMap[b.companyName.toLowerCase()] = b.brandLogo;
      if (b.brand) brandMap[b.brand.toLowerCase()] = b.brandLogo;
    });

    const getFullUrl = (urlPath) => {
      if (!urlPath) return null;
      if (urlPath.startsWith('/uploads/')) {
        return `${req.protocol}://${req.get('host')}${urlPath}`;
      }
      return urlPath;
    };

    const getBrandLogo = (brandName) => {
      if (!brandName) return null;
      return getFullUrl(brandMap[brandName.toLowerCase()] || null);
    };

    // Format response for mobile list — flatten each comboKit variant as its own item
    const formatted = [];

    for (const a of combokits) {
      const kitName = a.solarkitName || (a.comboKits?.[0]?.name) || 'Combokit';
      const prices = priceMap[kitName] || [];
      const defaultPrice = prices[0] || null;

      // Shared price block (same for all variants of this combokit)
      const priceBlock = {
        benchmarkPrice: defaultPrice?.benchmarkPrice ?? null,
        marketPrice: defaultPrice?.marketPrice ?? null,
        gst: defaultPrice?.gst ?? null,
        finalPrice: defaultPrice?.finalPrice ?? null,
        benchmarkPriceFormatted: defaultPrice?.benchmarkPrice != null ? `₹${Number(defaultPrice.benchmarkPrice).toLocaleString('en-IN')}` : null,
        marketPriceFormatted: defaultPrice?.marketPrice != null ? `₹${Number(defaultPrice.marketPrice).toLocaleString('en-IN')}` : null,
        finalPriceFormatted: defaultPrice?.finalPrice != null ? `₹${Number(defaultPrice.finalPrice).toLocaleString('en-IN')}` : null,
        gstFormatted: defaultPrice?.gst != null ? `${defaultPrice.gst}%` : null,
        allPrices: prices.map(p => ({
          paymentType: p.paymentType,
          kitType: p.kitType,
          marketPrice: p.marketPrice,
          finalPrice: p.finalPrice,
          gst: p.gst,
          marketPriceFormatted: p.marketPrice != null ? `₹${Number(p.marketPrice).toLocaleString('en-IN')}` : null,
          finalPriceFormatted: p.finalPrice != null ? `₹${Number(p.finalPrice).toLocaleString('en-IN')}` : null,
        })),
      };

      const variants = a.comboKits || [];

      if (variants.length === 0) {
        // No nested variants — emit one item using root data
        formatted.push({
          kitId: a._id,
          name: kitName,
          status: a.status,
          image: null,
          panelBrand: a.brandName || null,
          panelBrandImage: getBrandLogo(a.brandName),
          inverterBrand: null,
          inverterBrandImage: null,
          panelSkuCount: 0,
          inverterSkuCount: 0,
          ...priceBlock,
        });
      } else {
        for (const kit of variants) {
          formatted.push({
            kitId: a._id,
            name: kit.name || kitName,
            status: a.status,
            // ─── Kit Image ────────────────────────────────────────────────
            image: getFullUrl(kit.image) || null,
            // ─── Panel Brand ──────────────────────────────────────────────
            panelBrand: kit.panelBrand || null,
            panelBrandImage: getBrandLogo(kit.panelBrand),
            // ─── Inverter Brand ───────────────────────────────────────────
            inverterBrand: kit.inverterBrand || null,
            inverterBrandImage: getBrandLogo(kit.inverterBrand),
            // ─── SKU Counts ───────────────────────────────────────────────
            panelSkuCount: (kit.panelSkus || []).length,
            inverterSkuCount: (kit.inverterSkus || []).length,
            // ─── Price (from parent combokit) ─────────────────────────────
            ...priceBlock,
          });
        }
      }
    }

    // If kilowatt param provided, multiply finalPrice by kilowatt and show in finalPrice itself
    if (kw != null && !isNaN(kw)) {
      for (const item of formatted) {
        item.kilowatt = kw;
        if (item.finalPrice != null) {
          const total = Math.round(kw * item.finalPrice * 100) / 100;
          item.perKwPrice = item.finalPrice;
          item.finalPrice = total;
          item.finalPriceFormatted = `₹${total.toLocaleString('en-IN')}`;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Found ${formatted.length} variant(s)`,
      total: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error in getFilteredCombokits:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 4.10 Calculate Kilowatt from Panel Watt and Number of Solar Panels
// Formula: panelWatt * numberOfPanels / 1000 = kW
export const calculateKilowatt = async (req, res) => {
  try {
    const { panelWatt, numberOfPanels } = req.query;

    // Validate inputs
    if (!panelWatt || !numberOfPanels) {
      return res.status(400).json({
        success: false,
        message: "Both 'panelWatt' and 'numberOfPanels' are required",
      });
    }

    const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

    // Helper: robustly extract a numeric value from any wattage string
    // Handles: "540W", "540 W", "540Watt", "540 watt", "540", "540.5W", etc.
    const extractWattage = (str) => {
      if (!str) return NaN;
      const match = str.toString().match(/^(\d+(?:\.\d+)?)/);
      if (match) return Number(match[1]);
      // Fallback: extract first number found anywhere in the string
      const anyNum = str.toString().match(/[\d.]+/);
      return anyNum ? Number(anyNum[0]) : NaN;
    };

    // Resolve panelWatt — could be an ObjectId (from PanelWatt master) or a direct number
    let resolvedPanelWatt = null;
    let resolvedPanelWattName = null;

    if (isObjectId(panelWatt)) {
      const pWatt = await PanelWatt.findById(panelWatt).lean();
      console.log('[calculateKilowatt] PanelWatt doc found:', pWatt);
      if (pWatt) {
        resolvedPanelWattName = pWatt.name;
        resolvedPanelWatt = extractWattage(pWatt.name);
      }

      // Fallback: try to get panelWatt from ComboKitAssignment
      if (!resolvedPanelWatt || isNaN(resolvedPanelWatt)) {
        console.log('[calculateKilowatt] PanelWatt name parse failed, trying ComboKitAssignment fallback...');
        const kit = await ComboKitAssignment.findOne({ panelWattId: panelWatt }, 'panelWatt').lean()
          || await ComboKitAssignment.findOne({}, 'panelWatt').lean();
        if (kit?.panelWatt) {
          resolvedPanelWatt = Number(kit.panelWatt);
          resolvedPanelWattName = `${resolvedPanelWatt}W (from ComboKit)`;
          console.log('[calculateKilowatt] Resolved from ComboKitAssignment:', resolvedPanelWatt);
        }
      }
    } else {
      // Direct numeric value passed (e.g. "540" or "540W")
      resolvedPanelWatt = extractWattage(panelWatt);
      resolvedPanelWattName = `${resolvedPanelWatt}W`;
    }

    console.log('[calculateKilowatt] resolvedPanelWatt:', resolvedPanelWatt, '| resolvedPanelWattName:', resolvedPanelWattName);

    const parsedNumberOfPanels = Number(numberOfPanels);

    if (!resolvedPanelWatt || isNaN(resolvedPanelWatt) || resolvedPanelWatt <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'panelWatt' value. Please provide a valid panel wattage or Panel Watt ID.",
        debug: { panelWattParam: panelWatt, resolvedName: resolvedPanelWattName },
      });
    }

    if (isNaN(parsedNumberOfPanels) || parsedNumberOfPanels <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'numberOfPanels' value. Must be a positive number.",
      });
    }

    // Calculate: panelWatt * numberOfPanels / 1000
    const kilowatt = (resolvedPanelWatt * parsedNumberOfPanels) / 1000;
    const kilowattValue = parseFloat(kilowatt.toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Kilowatt calculated successfully",
      data: [
        { _id: kilowattValue.toString(), name: `${kilowattValue} kW` }
      ],
    });
  } catch (error) {
    console.error("Error in calculateKilowatt:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 5. Get all states
export const getStates = async (req, res) => {
  try {
    const { companyUserId } = req.query;
    let query = { isActive: true };

    if (companyUserId) {
      const user = await CompanyUser.findById(companyUserId).lean();
      if (user && user.state) {
        const stateIds = user.state.split(',').map(s => s.trim()).filter(Boolean);
        query._id = { $in: stateIds };
      } else {
        query._id = { $in: [] }; // Return none if user not found or no state assigned
      }
    }

    const states = await State.find(query).sort({ name: 1 });

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
    const { companyUserId } = req.query;

    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: "State ID is required",
      });
    }

    let query = { state: stateId, isActive: true };

    if (companyUserId) {
      const user = await CompanyUser.findById(companyUserId).lean();
      if (user && user.district) {
        const districtIds = user.district.split(',').map(d => d.trim()).filter(Boolean);
        query._id = { $in: districtIds };
      } else {
        query._id = { $in: [] }; // Return none if user not found or no district assigned
      }
    }

    const districts = await District.find(query).sort({ name: 1 });

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

// 7. Get only assigned districts for a company user (without state dependency)
export const getUserDistricts = async (req, res) => {
  try {
    const { companyUserId } = req.params;

    if (!companyUserId) {
      return res.status(400).json({
        success: false,
        message: "Company User ID is required",
      });
    }

    const user = await CompanyUser.findById(companyUserId).lean();
    if (!user || !user.district) {
      return res.status(200).json({
        success: true,
        message: "No districts assigned",
        data: [],
      });
    }

    const districtIds = user.district.split(',').map(d => d.trim()).filter(Boolean);
    
    if (districtIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No valid districts assigned",
        data: [],
      });
    }

    const districts = await District.find({ _id: { $in: districtIds }, isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Assigned districts fetched successfully",
      data: districts,
    });
  } catch (error) {
    console.error("Error in getUserDistricts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};