import InventoryItem from '../../models/inventory/InventoryItem.js';
import RestockLimit from '../../models/inventory/RestockLimit.js';
import Brand from '../../models/inventory/Brand.js';
import BrandManufacturer from '../../models/inventory/BrandManufacturer.js';
import Warehouse from '../../models/inventory/Warehouse.js';
import InventorySettings from '../../models/inventory/InventorySettings.js';
import mongoose from 'mongoose';

// Create Inventory Item
export const createInventoryItem = async (req, res) => {
    try {
        const { itemName, brand, category, subCategory, projectType, subProjectType, kitType, sku, quantity, price, minLevel, maxLevel, state, cluster, city, district, status, productType, technology, wattage } = req.body;

        // Check if item exists at this location (State + Cluster + District + SKU)
        const existingItem = await InventoryItem.findOne({
            sku,
            state,
            cluster,
            district
        });

        if (existingItem) {
            existingItem.quantity += Number(quantity);
            // Optionally update other fields if provided?
            // prioritizing keeping original meta-data but updating stock.
            // But if price changes? Let's just update quantity for 'Add Inventory' flow.

            // If itemName or descriptions are updated in form, maybe we should update them too?
            // For now, simple stock increment.
            existingItem.updatedBy = req.user ? req.user.id : null;
            await existingItem.save();
            return res.status(200).json(existingItem);
        }

        // Create new item
        const newItem = new InventoryItem({
            itemName,
            brand,
            category,
            subCategory,
            projectType,
            subProjectType,
            kitType,
            productType,
            technology,
            wattage,
            sku,
            quantity,
            price,
            minLevel,
            maxLevel,
            state,
            cluster,
            city,
            district,
            status,
            createdBy: req.user ? req.user.id : null // Handle potential missing user
        });


        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Create Inventory Error:", error);
        // Handle Mongoose Unique Constraint Error gracefully
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Inventory item already exists at this location.', error: error.message });
        }
        res.status(500).json({ message: 'Error creating inventory item', error: error.message });
    }
};

// Get All Inventory Items with Filters
export const getInventoryItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            state,
            cluster,
            city,
            district,
            category,
            subCategory,
            projectType,
            subProjectType,
            productName,
            sku,
            brand,
            lowStock
        } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (state) query.state = state;
        if (cluster) query.cluster = cluster;
        if (city) query.city = city;
        if (district) query.district = district;
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (projectType) query.projectType = projectType;
        if (subProjectType) query.subProjectType = subProjectType;
        if (productName) query.itemName = productName;
        if (sku) query.sku = sku;
        if (brand) {
            // Check if brand is ObjectId or Name
            if (mongoose.Types.ObjectId.isValid(brand)) {
                query.brand = brand;
            } else {
                // If passing name, we might need to lookup first or handle on frontend to pass ID. 
                // Ideally frontend passes ID. If we must support name search, we need a lookup.
                // For now assuming ID.
            }
        }
        if (req.query.status) query.status = req.query.status;

        // Low stock filter logic is complex because threshold can be dynamic per item or global.
        // However, the prompt implies `minLevel` on the item is the threshold.
        if (lowStock === 'true') {
            query.$expr = { $lte: ["$quantity", "$minLevel"] };
        }

        const items = await InventoryItem.find(query)
            .populate('brand', 'brand companyName brandLogo')
            .populate('state', 'name code')
            .populate('city', 'name')
            .populate('district', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await InventoryItem.countDocuments(query);

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalItems: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
    }
};

// Update Inventory Item
export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (req.user) {
            updateData.updatedBy = req.user.id;
        }

        const updatedItem = await InventoryItem.findByIdAndUpdate(id, updateData, { new: true })
            .populate('brand', 'brand companyName brandLogo')
            .populate('state', 'name code')
            .populate('city', 'name')
            .populate('district', 'name');

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating inventory item', error: error.message });
    }
};

// Delete Inventory Item
export const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await InventoryItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Also delete associated restock limits
        await RestockLimit.deleteMany({ itemId: id });

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
    }
};

// Brands CRUD
export const createBrand = async (req, res) => {
    try {
        const { brandName, description, logo, status } = req.body;
        const brand = new Brand({ brandName, description, logo, status, createdBy: req.user.id });
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBrands = async (req, res) => {
    try {
        const brands = await BrandManufacturer.find({ isActive: true }); 
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Restock Limits
export const getRestockLimits = async (req, res) => {
    try {
        const { state, city, district, cluster } = req.query;
        // Logic to get items and their limits.
        
        const query = {};
        if (state) query.state = state;
        if (cluster) query.cluster = cluster;
        if (city) query.city = city;
        if (district) query.district = district;

        const items = await InventoryItem.find(query)
            .populate('brand', 'brand comboKit')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name');

        // Fetch limits for these items
        const itemIds = items.map(i => i._id);
        const limits = await RestockLimit.find({ itemId: { $in: itemIds } });

        // Map limits to items
        const result = items.map(item => {
            const limit = limits.find(l => l.itemId.toString() === item._id.toString());
            return {
                ...item.toObject(),
                currentRestockLimit: limit ? limit.restockThreshold : 0,
                restockLimitId: limit ? limit._id : null
            };
        });

        res.json(result);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setRestockLimit = async (req, res) => {
    try {
        const { itemId, threshold } = req.body;

        let limit = await RestockLimit.findOne({ itemId });
        if (limit) {
            limit.restockThreshold = threshold;
            limit.updatedBy = req.user.id;
            await limit.save();
        } else {
            limit = new RestockLimit({
                itemId,
                restockThreshold: threshold,
                createdBy: req.user.id
            });
            await limit.save();
        }
        res.json(limit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Aggregations for Dashboard/Overview
export const getInventorySummary = async (req, res) => {
    try {
        const { state, city, district } = req.query;
        const match = {};
        if (state) match.state = new mongoose.Types.ObjectId(state);
        if (city) match.city = new mongoose.Types.ObjectId(city);
        if (district) match.district = new mongoose.Types.ObjectId(district);

        const summary = await InventoryItem.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalValue: { $sum: { $multiply: ["$quantity", "$price"] } }
                }
            }
        ]);

        const lowStockCount = await InventoryItem.countDocuments({
            ...match,
            $expr: { $lte: ["$quantity", "$minLevel"] }
        });

        res.json({
            ...summary[0] || { totalProducts: 0, totalQuantity: 0, totalValue: 0 },
            lowStockCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Combokit/Brand Overview - Fully Dynamic
export const getBrandOverview = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;
        const match = {};

        // Location filters (matching SKU location fields)
        if (state && mongoose.Types.ObjectId.isValid(state)) match.state = new mongoose.Types.ObjectId(state);
        if (cluster && mongoose.Types.ObjectId.isValid(cluster)) match.cluster = new mongoose.Types.ObjectId(cluster);
        // Note: SKU doesn't directly have district, but we could match via Product if needed.

        const SKU = mongoose.model('SKU');

        const aggregation = [
            { $match: match },
            // Join with Product model
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            // Join with BrandManufacturer model
            {
                $lookup: {
                    from: "brandmanufacturers",
                    localField: "brand",
                    foreignField: "_id",
                    as: "brandInfo"
                }
            },
            { $unwind: "$brandInfo" },
            // Group by Product Name AND Brand Name
            {
                $group: {
                    _id: {
                        productId: "$productInfo._id",
                        productName: "$productInfo.name",
                        brandId: "$brandInfo._id",
                        brandName: "$brandInfo.brand",
                        brandLogo: "$brandInfo.logo"
                    },
                    skuCount: { $sum: 1 }
                }
            },
            // Group by Product Name
            {
                $group: {
                    _id: "$_id.productName",
                    brands: {
                        $push: {
                            productId: "$_id.productId",
                            brandId: "$_id.brandId",
                            brandName: "$_id.brandName",
                            logo: "$_id.brandLogo",
                            skus: "$skuCount"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const overview = await SKU.aggregate(aggregation);

        res.json(overview);
    } catch (error) {
        console.error('Brand Overview Dynamic Fetch Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== WAREHOUSE CONTROLLERS ====================

export const getAllWarehouses = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;
        let filter = {};
        if (state) filter.state = state;
        if (cluster) filter.cluster = cluster;
        if (district) filter.district = district;

        const warehouses = await Warehouse.find(filter)
            .populate({
                path: 'state',
                select: 'name country',
                populate: { path: 'country', select: 'name' }
            })
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('city', 'name');
        res.json({ success: true, count: warehouses.length, data: warehouses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse({ ...req.body, createdBy: req.user.id });
        await warehouse.save();
        res.status(201).json({ success: true, data: warehouse });
    } catch (error) {
        console.error("Create Warehouse Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json({ success: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id)
            .populate({
                path: 'state',
                select: 'name country',
                populate: { path: 'country', select: 'name' }
            })
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('city', 'name');
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== INVENTORY SETTINGS ====================

export const getSettings = async (req, res) => {
    try {
        let settings = await InventorySettings.findOne();
        if (!settings) {
            settings = await InventorySettings.create({
                globalLowStockThreshold: 10,
                brandThresholds: [],
                productThresholds: []
            });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        let settings = await InventorySettings.findOne();
        if (!settings) {
            settings = new InventorySettings();
        }

        const { globalLowStockThreshold, brandThresholds, productThresholds } = req.body;

        if (globalLowStockThreshold !== undefined) settings.globalLowStockThreshold = globalLowStockThreshold;
        if (brandThresholds) settings.brandThresholds = brandThresholds;
        if (productThresholds) settings.productThresholds = productThresholds;

        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== INVENTORY PROJECTION ====================

/**
 * GET /api/inventory/projection?quarter=Q3&year=2025&brand=xxx&state=xxx&...
 * Returns projected inventory (KW) for each filtered item based on historical growth trend.
 */
export const getProjectedInventory = async (req, res) => {
    try {
        const { quarter, year, brand, state, cluster, technology, watt, sku } = req.query;

        // Helper: get date range for a given quarter + year
        const getQuarterRange = (q, y) => {
            const yr = parseInt(y) || new Date().getFullYear();
            const map = {
                Q1: [new Date(`${yr}-01-01`), new Date(`${yr}-03-31T23:59:59`)],
                Q2: [new Date(`${yr}-04-01`), new Date(`${yr}-06-30T23:59:59`)],
                Q3: [new Date(`${yr}-07-01`), new Date(`${yr}-09-30T23:59:59`)],
                Q4: [new Date(`${yr}-10-01`), new Date(`${yr}-12-31T23:59:59`)],
            };
            return map[q] || null;
        };

        // Build base filter
        const baseFilter = {};
        if (brand && mongoose.Types.ObjectId.isValid(brand)) baseFilter.brand = brand;
        if (state && mongoose.Types.ObjectId.isValid(state)) baseFilter.state = state;
        if (cluster && mongoose.Types.ObjectId.isValid(cluster)) baseFilter.cluster = cluster;
        if (technology) baseFilter.technology = technology;
        if (watt) baseFilter.wattage = Number(watt);
        if (sku) baseFilter.sku = sku;

        // Fetch all matching items (not time-filtered, to get full historical picture)
        const items = await InventoryItem.find(baseFilter)
            .populate('brand', 'brand companyName')
            .sort({ createdAt: 1 });

        if (!items.length) {
            return res.json({ success: true, data: [] });
        }

        const targetQuarter = quarter || 'Q1';
        const targetYear = parseInt(year) || new Date().getFullYear();

        // For each item, collect quarterly usage (quantity * wattage / 1000 = KW)
        // We look at up to 4 prior quarters
        const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
        const targetQIdx = quarterOrder.indexOf(targetQuarter);

        // Build list of previous quarters (up to 4) before target
        const prevQuarters = [];
        let tempQ = targetQIdx;
        let tempY = targetYear;
        for (let i = 0; i < 4; i++) {
            tempQ--;
            if (tempQ < 0) { tempQ = 3; tempY--; }
            prevQuarters.unshift({ q: quarterOrder[tempQ], y: tempY });
        }

        // For each item compute the KW per previous quarter
        const projections = [];

        for (const item of items) {
            const kwPerQuarter = [];

            for (const { q, y } of prevQuarters) {
                const range = getQuarterRange(q, y);
                if (!range) { kwPerQuarter.push(null); continue; }

                // Find all inventory events for this item in this quarter
                // Since inventory is cumulative (quantity on hand), we approximate usage
                // as the quantity stored in that period range.
                const snapshot = await InventoryItem.findOne({
                    _id: item._id,
                    updatedAt: { $gte: range[0], $lte: range[1] }
                });
                // Approx: use quantity * wattage / 1000 at that snapshot, else null
                const kw = snapshot ? (snapshot.quantity * (snapshot.wattage || 0)) / 1000 : null;
                kwPerQuarter.push(kw);
            }

            // Filter out null values
            const validKw = kwPerQuarter.filter(v => v !== null);

            let projectedKw = (item.quantity * (item.wattage || 0)) / 1000; // fallback = current

            if (validKw.length >= 2) {
                // Weighted average growth rate (more recent = higher weight)
                const growthRates = [];
                for (let i = 1; i < validKw.length; i++) {
                    if (validKw[i - 1] > 0) {
                        growthRates.push((validKw[i] - validKw[i - 1]) / validKw[i - 1]);
                    }
                }
                if (growthRates.length > 0) {
                    // Weighted average: most recent growth counts more
                    let totalWeight = 0;
                    let weightedSum = 0;
                    growthRates.forEach((rate, idx) => {
                        const weight = idx + 1;
                        weightedSum += rate * weight;
                        totalWeight += weight;
                    });
                    const avgGrowth = weightedSum / totalWeight;
                    const lastKw = validKw[validKw.length - 1];
                    projectedKw = Math.max(0, lastKw * (1 + avgGrowth));
                } else if (validKw.length === 1) {
                    projectedKw = validKw[0];
                }
            } else if (validKw.length === 1) {
                projectedKw = validKw[0];
            }

            projections.push({
                itemId: item._id,
                sku: item.sku,
                projectedKw: Math.round(projectedKw * 100) / 100,
                historicalKw: validKw,
                currentKw: (item.quantity * (item.wattage || 0)) / 1000
            });
        }

        res.json({ success: true, data: projections });
    } catch (error) {
        console.error('Projection Error:', error);
        res.status(500).json({ message: error.message });
    }
};
