import SolarInstaller from '../../models/vendors/SolarInstaller.js';
import InstallerTool from '../../models/vendors/InstallerTool.js';
import InstallerRating from '../../models/vendors/InstallerRating.js';
import InstallerAgency from '../../models/vendors/InstallerAgency.js';

// --- Solar Installer Controllers ---

export const getSolarInstallers = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;
        let filter = {};
        if (state) filter.state = state;
        if (cluster) filter.cluster = cluster;
        if (district) filter.district = district;

        const installers = await SolarInstaller.find(filter)
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(installers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSolarInstaller = async (req, res) => {
    try {
        const newInstaller = new SolarInstaller(req.body);
        await newInstaller.save();
        res.status(201).json(newInstaller);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSolarInstaller = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInstaller = await SolarInstaller.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedInstaller) return res.status(404).json({ message: 'Installer not found' });
        res.status(200).json(updatedInstaller);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSolarInstaller = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInstaller = await SolarInstaller.findByIdAndDelete(id);
        if (!deletedInstaller) return res.status(404).json({ message: 'Installer not found' });
        res.status(200).json({ message: 'Installer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Installer Tool Controllers ---

export const getInstallerTools = async (req, res) => {
    try {
        const { projectCategory, subCategory, projectType, subType } = req.query;
        const query = {};
        
        if (projectCategory) query.projectCategory = projectCategory;
        if (subCategory) query.subCategory = subCategory;
        if (projectType) query.projectType = projectType;
        if (subType) query.subType = subType;

        const tools = await InstallerTool.find(query)
            .populate('projectCategory', 'name')
            .populate('subCategory', 'name')
            .populate('subType', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInstallerTool = async (req, res) => {
    try {
        const newTool = new InstallerTool(req.body);
        await newTool.save();
        res.status(201).json(newTool);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInstallerTool = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTool = await InstallerTool.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTool) return res.status(404).json({ message: 'Tool not found' });
        res.status(200).json(updatedTool);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInstallerTool = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTool = await InstallerTool.findByIdAndDelete(id);
        if (!deletedTool) return res.status(404).json({ message: 'Tool not found' });
        res.status(200).json({ message: 'Tool deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Installer Rating Controllers ---

export const getInstallerRatings = async (req, res) => {
    try {
        const ratings = await InstallerRating.find().sort({ createdAt: -1 });
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInstallerRating = async (req, res) => {
    try {
        const { category, maxRating } = req.body;
        const newRating = new InstallerRating({ category, maxRating });
        await newRating.save();
        
        // Update all other records with this maxRating if provided
        if (maxRating !== undefined) {
            await InstallerRating.updateMany({}, { maxRating });
        }

        res.status(201).json(newRating);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInstallerRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, maxRating } = req.body;
        
        const updatedRating = await InstallerRating.findByIdAndUpdate(id, { category, maxRating }, { new: true });
        if (!updatedRating) return res.status(404).json({ message: 'Rating not found' });
        
        // Sync maxRating across all records
        if (maxRating !== undefined) {
            await InstallerRating.updateMany({}, { maxRating });
        }

        res.status(200).json(updatedRating);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInstallerRating = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRating = await InstallerRating.findByIdAndDelete(id);
        if (!deletedRating) return res.status(404).json({ message: 'Rating not found' });
        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Installer Agency Controllers ---

export const getInstallerAgencies = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;
        const query = {};
        if (state) query.state = state;
        if (cluster) query.cluster = cluster;
        if (district) query.district = district;

        const agencies = await InstallerAgency.find(query)
            .populate('state', 'name code')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(agencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInstallerAgency = async (req, res) => {
    try {
        const newAgency = new InstallerAgency(req.body);
        await newAgency.save();
        res.status(201).json(newAgency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInstallerAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAgency = await InstallerAgency.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedAgency) return res.status(404).json({ message: 'Agency not found' });
        res.status(200).json(updatedAgency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInstallerAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAgency = await InstallerAgency.findByIdAndDelete(id);
        if (!deletedAgency) return res.status(404).json({ message: 'Agency not found' });
        res.status(200).json({ message: 'Agency deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Installer Agency Plan Controllers ---

import InstallerAgencyPlan from '../../models/vendors/InstallerAgencyPlan.js';

export const getInstallerAgencyPlans = async (req, res) => {
    try {
        const { countryId, stateId, clusterId, districtId, districtIds } = req.query;
        let query = {};
        if (countryId) query.country = countryId;
        if (stateId) query.state = stateId;
        if (clusterId) query.cluster = clusterId;

        if (districtIds) {
            const ids = districtIds.split(',');
            query.districts = { $in: ids };
        } else if (districtId) {
            query.districts = districtId;
        }

        const plans = await InstallerAgencyPlan.find(query)
            .sort({ createdAt: 1 })
            .populate('country', 'name')
            .populate('state', 'name abbreviation')
            .populate('cluster', 'name')
            .populate('districts', 'name');
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInstallerAgencyPlan = async (req, res) => {
    try {
        const newPlan = new InstallerAgencyPlan(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInstallerAgencyPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPlan = await InstallerAgencyPlan.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPlan) return res.status(404).json({ message: 'Agency Plan not found' });
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInstallerAgencyPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPlan = await InstallerAgencyPlan.findByIdAndDelete(id);
        if (!deletedPlan) return res.status(404).json({ message: 'Agency Plan not found' });
        res.status(200).json({ message: 'Agency Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Solar Installer Plan Controllers (Individual) ---

import SolarInstallerPlan from '../../models/vendors/SolarInstallerPlan.js';

export const getSolarInstallerPlans = async (req, res) => {
    try {
        const { countryId, stateId, clusterId, districtId, districtIds } = req.query;
        let query = {};
        if (countryId) query.country = countryId;
        if (stateId) query.state = stateId;
        if (clusterId) query.cluster = clusterId;

        if (districtIds) {
            const ids = districtIds.split(',');
            query.districts = { $in: ids };
        } else if (districtId) {
            query.districts = districtId;
        }

        const plans = await SolarInstallerPlan.find(query)
            .sort({ createdAt: 1 })
            .populate('country', 'name')
            .populate('state', 'name abbreviation')
            .populate('cluster', 'name')
            .populate('districts', 'name');
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSolarInstallerPlan = async (req, res) => {
    try {
        const newPlan = new SolarInstallerPlan(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSolarInstallerPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPlan = await SolarInstallerPlan.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPlan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSolarInstallerPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPlan = await SolarInstallerPlan.findByIdAndDelete(id);
        if (!deletedPlan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
