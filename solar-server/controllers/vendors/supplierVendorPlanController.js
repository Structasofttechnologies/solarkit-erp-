import SupplierVendorPlan from '../../models/vendors/SupplierVendorPlan.js';

// Get plans based on location hierarchy
export const getSupplierVendorPlans = async (req, res, next) => {
    try {
        const { countryId, stateId, clusterId, districtId, warehouseId, fetchAllNames } = req.query;

        // If requested, just return all distinct global plan names
        if (fetchAllNames === 'true') {
            const allNames = await SupplierVendorPlan.distinct('name');
            return res.status(200).json({ success: true, count: allNames.length, data: allNames });
        }

        let queries = [];

        // Always include completely global plans (fallback)
        queries.push({ countryId: null, stateId: null, clusterId: null, districtId: null, warehouseId: null });

        // Add varying levels of specificity
        if (countryId) queries.push({ countryId: countryId, stateId: null, clusterId: null, districtId: null, warehouseId: null });
        if (stateId) queries.push({ stateId: stateId, clusterId: null, districtId: null, warehouseId: null });
        if (clusterId) queries.push({ clusterId: clusterId, districtId: null, warehouseId: null });
        if (districtId) queries.push({ districtId: districtId, warehouseId: null });
        if (warehouseId) queries.push({ warehouseId: warehouseId });

        const query = queries.length > 0 ? { $or: queries } : {};

        // Fetch all matching plans
        const plans = await SupplierVendorPlan.find(query)
            .populate('countryId', 'name')
            .populate('stateId', 'name')
            .populate('clusterId', 'name')
            .populate('districtId', 'name')
            .populate('warehouseId', 'name')
            .lean();

        // deduplicate by plan name, preferring the most specific location record
        const planMap = new Map();
        for (const p of plans) {
            let score = 0;
            if (p.warehouseId) score = 5;
            else if (p.districtId) score = 4;
            else if (p.clusterId) score = 3;
            else if (p.stateId) score = 2;
            else if (p.countryId) score = 1;

            if (!planMap.has(p.name) || planMap.get(p.name).score < score) {
                p.score = score;
                planMap.set(p.name, p);
            }
        }
        
        // Convert map back to array
        const finalPlans = Array.from(planMap.values());

        res.json({ success: true, count: finalPlans.length, data: finalPlans });
    } catch (err) {
        next(err);
    }
};

// Save a plan (upsert logic to handle arrays of districts or global null saves)
export const saveSupplierVendorPlan = async (req, res, next) => {
    try {
        const { name, districtIds, ...planData } = req.body; // destructure districtIds out

        // 1. If we are saving a bulk group of districts explicitly
        if (districtIds && Array.isArray(districtIds) && districtIds.length > 0) {
            const promises = districtIds.map(dId => {
                const filter = { name, stateId: planData.stateId, clusterId: planData.clusterId, districtId: dId };
                const payload = { ...planData, name, districtId: dId };
                return SupplierVendorPlan.findOneAndUpdate(filter, payload, { new: true, upsert: true, runValidators: true });
            });
            await Promise.all(promises);
            return res.status(200).json({ success: true, message: 'Plans mass saved successfully' });
        } 
        // 2. Otherwise save explicitly (using nulls if global was passed from UI)
        else {
            const finalCountryId = planData.countryId || null;
            const finalStateId = planData.stateId || null;
            const finalClusterId = planData.clusterId || null;
            const finalDistrictId = planData.districtId || null;
            const finalWarehouseId = planData.warehouseId || null;

            const filter = { name, countryId: finalCountryId, stateId: finalStateId, clusterId: finalClusterId, districtId: finalDistrictId, warehouseId: finalWarehouseId };
            const payload = { ...planData, name, countryId: finalCountryId, stateId: finalStateId, clusterId: finalClusterId, districtId: finalDistrictId, warehouseId: finalWarehouseId };

            const plan = await SupplierVendorPlan.findOneAndUpdate(filter, payload, { new: true, upsert: true, runValidators: true });
            return res.status(200).json({ success: true, data: plan, message: 'Plan saved successfully' });
        }
    } catch (err) {
        next(err);
    }
};

export const deleteSupplierVendorPlan = async (req, res, next) => {
    try {
        if (req.params.id === 'by-name') {
            const { name } = req.query;
            if (!name) return res.status(400).json({ success: false, message: 'Plan name is required for global deletion' });
            
            const result = await SupplierVendorPlan.deleteMany({ name });
            return res.json({ success: true, message: `Deleted ${result.deletedCount} configurations for plan ${name}` });
        }

        const plan = await SupplierVendorPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (err) {
        next(err);
    }
};
export const getSupplierVendorPlanCounts = async (req, res, next) => {
    try {
        const counts = await SupplierVendorPlan.aggregate([
            {
                $group: {
                    _id: null,
                    countries: { $addToSet: "$countryId" },
                    states: { $addToSet: "$stateId" },
                    clusters: { $addToSet: "$clusterId" },
                    warehouses: { $addToSet: "$warehouseId" },
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    countryCounts: { $size: { $filter: { input: "$countries", as: "c", cond: { $ne: ["$$c", null] } } } },
                    stateCounts: { $size: { $filter: { input: "$states", as: "s", cond: { $ne: ["$$s", null] } } } },
                    clusterCounts: { $size: { $filter: { input: "$clusters", as: "cl", cond: { $ne: ["$$cl", null] } } } },
                    warehouseCounts: { $size: { $filter: { input: "$warehouses", as: "w", cond: { $ne: ["$$w", null] } } } },
                    total: 1
                }
            }
        ]);

        // For more detailed counts per specific ID
        const detailedCounts = await SupplierVendorPlan.aggregate([
            {
                $facet: {
                    byCountry: [{ $match: { countryId: { $ne: null } } }, { $group: { _id: "$countryId", count: { $sum: 1 } } }],
                    byState: [{ $match: { stateId: { $ne: null } } }, { $group: { _id: "$stateId", count: { $sum: 1 } } }],
                    byCluster: [{ $match: { clusterId: { $ne: null } } }, { $group: { _id: "$clusterId", count: { $sum: 1 } } }],
                    byWarehouse: [{ $match: { warehouseId: { $ne: null } } }, { $group: { _id: "$warehouseId", count: { $sum: 1 } } }]
                }
            }
        ]);

        res.json({ 
            success: true, 
            summary: counts[0] || { countryCounts: 0, stateCounts: 0, clusterCounts: 0, warehouseCounts: 0, total: 0 },
            detailed: detailedCounts[0]
        });
    } catch (err) {
        next(err);
    }
};
