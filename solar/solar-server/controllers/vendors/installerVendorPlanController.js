import InstallerVendorPlan from '../../models/vendors/InstallerVendorPlan.js';

// Get plans based on location hierarchy
export const getInstallerVendorPlans = async (req, res, next) => {
    try {
        const { countryId, stateId, clusterId, districtId, fetchAllNames } = req.query;
        
        if (fetchAllNames === 'true') {
            const names = await InstallerVendorPlan.distinct('name');
            return res.status(200).json({ success: true, count: names.length, data: names });
        }

        let queries = [];
        
        // Always include completely global plans
        queries.push({ countryId: null, stateId: null, clusterId: null, districtId: null });

        if (countryId) queries.push({ countryId: countryId, stateId: null, clusterId: null, districtId: null });
        if (stateId) queries.push({ stateId: stateId, clusterId: null, districtId: null });
        if (clusterId) queries.push({ clusterId: clusterId, districtId: null });
        if (districtId) queries.push({ districtId: districtId });

        const query = queries.length > 0 ? { $or: queries } : {};

        const plans = await InstallerVendorPlan.find(query)
            .populate('countryId', 'name')
            .populate('stateId', 'name')
            .populate('clusterId', 'name')
            .populate('districtId', 'name')
            .lean(); // Use lean for modifying

        const finalPlans = plans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
        res.status(200).json({ success: true, count: finalPlans.length, data: finalPlans });
    } catch (error) {
        next(error);
    }
};

// Create or Update a plan (supports bulk districts)
export const saveInstallerVendorPlan = async (req, res, next) => {
    try {
        const { name, countryId, stateId, clusterId, districtId } = req.body;

        // Ensure these are explicitly null if omitted or "all"
        const finalCountryId = countryId || null;
        const finalStateId = stateId || null;
        const finalClusterId = clusterId || null;
        const finalDistrictId = districtId || null;

        const payload = { ...req.body, countryId: finalCountryId, stateId: finalStateId, clusterId: finalClusterId, districtId: finalDistrictId };

        let plan;
        if (payload._id) {
            // Update existing configuration
            plan = await InstallerVendorPlan.findByIdAndUpdate(
                payload._id,
                payload,
                { new: true, runValidators: true }
            );
        } else {
            // Create new configuration row
            plan = await InstallerVendorPlan.create(payload);
        }

        res.status(200).json({ 
            success: true, 
            data: plan, 
            message: payload._id ? 'Configuration updated successfully' : 'New configuration appended successfully' 
        });
    } catch (error) {
        next(error);
    }
};

// Delete a plan
export const deleteInstallerVendorPlan = async (req, res, next) => {
    try {
        if (req.params.id === 'by-name') {
            const { name } = req.query;
            if (!name) return res.status(400).json({ success: false, message: 'Plan name is required for global deletion' });
            
            await InstallerVendorPlan.deleteMany({ name });
            return res.status(200).json({ success: true, message: `All configurations for plan ${name} deleted successfully` });
        }

        const plan = await InstallerVendorPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        next(error);
    }
};
