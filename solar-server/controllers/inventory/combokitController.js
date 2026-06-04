import mongoose from 'mongoose';
import SolarKit from '../../models/inventory/SolarKit.js';
import AMCPlan from '../../models/finance/AMCPlan.js';
import AMCService from '../../models/finance/AMCService.js';
import BundlePlan from '../../models/finance/BundlePlan.js';
import ComboKitAssignment from '../../models/inventory/ComboKitAssignment.js';
import CustomizedComboKit from '../../models/inventory/CustomizedComboKit.js';
import State from '../../models/core/State.js';
import Cluster from '../../models/core/Cluster.js';
import District from '../../models/core/District.js';
import DealerPlan from '../../models/dealer/DealerPlan.js';
import FranchiseePlan from '../../models/franchisee/FranchiseePlan.js';
import ChannelPartnerPlan from '../../models/finance/ChannelPartnerPlan.js';

export const getPlansByRole = async (req, res) => {
    try {
        const { role } = req.query;
        let plans = [];
        if (role === 'Dealer') {
            plans = await DealerPlan.find({ isActive: true });
        } else if (role === 'Franchisee') {
            plans = await FranchiseePlan.find({ isActive: true });
        } else if (role === 'Channel Partner') {
            plans = await ChannelPartnerPlan.find({ isActive: true });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }
        res.status(200).json(plans);
    } catch (error) {
        console.error("Error fetching plans by role:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- SolarKit Controllers ---

export const createSolarKit = async (req, res) => {
    try {
        const newSolarKit = new SolarKit(req.body);
        const savedSolarKit = await newSolarKit.save();
        res.status(201).json(savedSolarKit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSolarKits = async (req, res) => {
    try {
        const { country } = req.query;
        const filter = country ? { country } : {};
        const solarKits = await SolarKit.find(filter).populate('country', 'name');
        res.status(200).json(solarKits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSolarKit = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid SolarKit ID' });
        }
        const updatedSolarKit = await SolarKit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSolarKit) return res.status(404).json({ message: 'SolarKit not found' });
        res.status(200).json(updatedSolarKit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSolarKit = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid SolarKit ID' });
        }
        await SolarKit.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'SolarKit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSolarKitStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid SolarKit ID' });
        }
        const { status } = req.body;
        const updatedSolarKit = await SolarKit.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedSolarKit) return res.status(404).json({ message: 'SolarKit not found' });
        res.status(200).json(updatedSolarKit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSolarKitBOM = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid SolarKit ID' });
        }
        const solarKit = await SolarKit.findById(req.params.id);
        if (!solarKit) return res.status(404).json({ message: 'SolarKit not found' });
        res.status(200).json({ bom: solarKit.bom || [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveSolarKitBOM = async (req, res) => {
    try {
        const id = req.params.id;
        const { bom } = req.body;

        console.log('Save BOM Request for ID:', id);

        // Normalize BOM data: convert price to number, and map 'type' to 'itemType' as per new schema
        const normalizedBom = bom.map(section => ({
            ...section,
            items: section.items.map(item => ({
                name: item.name,
                itemType: item.itemType || item.type,
                qty: item.qty,
                unit: item.unit,
                price: Number(item.price) || 0
            }))
        }));

        // Try finding by ID directly first
        let updatedSolarKit;

        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedSolarKit = await SolarKit.findByIdAndUpdate(
                id,
                { bom: normalizedBom },
                { new: true }
            );
        } else {
            console.log('Processing non-standard ID:', id);
            updatedSolarKit = await SolarKit.findOneAndUpdate(
                { _id: id },
                { bom: normalizedBom },
                { new: true }
            );
        }

        if (!updatedSolarKit) return res.status(404).json({ message: 'SolarKit not found' });

        console.log('BOM saved successfully for ID:', id);
        res.status(200).json(updatedSolarKit);
    } catch (error) {
        console.error('Final Save BOM error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// --- AMC Plan Controllers ---

export const createAMCPlan = async (req, res) => {
    try {
        const { stateId, clusterId, districtId, serviceIds } = req.body;
        const newPlan = new AMCPlan({
            state: stateId,
            cluster: clusterId,
            district: districtId,
            services: serviceIds,
            planName: req.body.planName,
            category: req.body.category,
            subCategory: req.body.subCategory,
            projectType: req.body.projectType,
            subProjectType: req.body.subProjectType,
            monthlyCharge: req.body.monthlyCharge,
            yearlyCharge: req.body.yearlyCharge,
            paymentType: req.body.paymentType,
            amcDuration: req.body.amcDuration,
            monthlyVisits: req.body.monthlyVisits,
            annualVisits: req.body.annualVisits,
            basicPricePerKw: req.body.basicPricePerKw,
            amcServiceCharges: req.body.amcServiceCharges,
            status: req.body.status || 'Active'
        });
        const savedPlan = await newPlan.save();
        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAMCPlans = async (req, res) => {
    try {
        const { state, cluster, district, category, subCategory, projectType, subProjectType } = req.query;
        const filter = {};
        if (district) {
            filter.district = district;
        } else if (cluster) {
            filter.cluster = cluster;
        } else if (state) {
            filter.state = state;
        }

        if (category) filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        if (subCategory) filter.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
        if (projectType) filter.projectType = { $regex: new RegExp(`^${projectType}$`, 'i') };
        if (subProjectType) filter.subProjectType = { $regex: new RegExp(`^${subProjectType}$`, 'i') };

        const plans = await AMCPlan.find(filter)
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('services');
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAMCPlan = async (req, res) => {
    try {
        const { stateId, clusterId, districtId, serviceIds } = req.body;
        const updateData = {
            state: stateId,
            cluster: clusterId,
            district: districtId,
            services: serviceIds,
            planName: req.body.planName,
            category: req.body.category,
            subCategory: req.body.subCategory,
            projectType: req.body.projectType,
            subProjectType: req.body.subProjectType,
            monthlyCharge: req.body.monthlyCharge,
            yearlyCharge: req.body.yearlyCharge,
            paymentType: req.body.paymentType,
            amcDuration: req.body.amcDuration,
            monthlyVisits: req.body.monthlyVisits,
            annualVisits: req.body.annualVisits,
            basicPricePerKw: req.body.basicPricePerKw,
            amcServiceCharges: req.body.amcServiceCharges,
            status: req.body.status
        };

        // Filter out undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedPlan = await AMCPlan.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('services');
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAMCPlan = async (req, res) => {
    try {
        await AMCPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'AMC Plan deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- AMC Services Controllers ---

export const createAMCService = async (req, res) => {
    try {
        const newService = new AMCService(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAMCServices = async (req, res) => {
    try {
        const { amcPlanId } = req.query;
        const filter = amcPlanId ? { amcPlanId } : {};
        const services = await AMCService.find(filter).populate('amcPlanId', 'name');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAMCService = async (req, res) => {
    try {
        const updatedService = await AMCService.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAMCService = async (req, res) => {
    try {
        await AMCService.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'AMC Service deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Bundle Plans Controllers ---

export const createBundlePlan = async (req, res) => {
    try {
        const { Country } = req.body;
        const newBundle = new BundlePlan({
            ...req.body,
            country: Country // Map Country (frontend) to country (schema)
        });
        const savedBundle = await newBundle.save();
        res.status(201).json(savedBundle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBundlePlans = async (req, res) => {
    try {
        const bundles = await BundlePlan.find()
            .populate('state', 'name');
        res.status(200).json(bundles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBundlePlan = async (req, res) => {
    try {
        const { Country } = req.body;
        const updateData = {
            ...req.body,
            country: Country // Map Country if present
        };
        const updatedBundle = await BundlePlan.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('state', 'name');
        res.status(200).json(updatedBundle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBundlePlan = async (req, res) => {
    try {
        await BundlePlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Bundle Plan deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- ComboKit Assignments Controllers ---

export const createAssignment = async (req, res) => {
    try {
        // Validate uniqueness if needed (e.g. one active assignment per location per type)
        const newAssignment = new ComboKitAssignment(req.body);
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssignments = async (req, res) => {
    try {
        const { state, cluster, city, district, category, subCategory, subProjectType, projectType, combokitId, kitName } = req.query;
        const filter = {};
        if (state) filter.state = state;
        if (cluster) filter.cluster = cluster;
        if (city) filter.city = city;
        if (district) filter.district = district;
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (subProjectType) filter.subProjectType = subProjectType;
        if (projectType) filter.projectType = projectType;
        if (combokitId) filter.combokitId = combokitId;
        if (kitName) filter['comboKits.name'] = kitName;

        const assignments = await ComboKitAssignment.find(filter)
            .populate('state', 'name')
            .populate('clusters', 'name')
            .populate('districts', 'name')
            .populate('combokitId', 'name');
        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateAssignment = async (req, res) => {
    try {
        // Sanitize comboKits to remove temporary frontend IDs
        if (req.body.comboKits && Array.isArray(req.body.comboKits)) {
            req.body.comboKits = req.body.comboKits.map(kit => {
                const newKit = { ...kit };
                // If id is present and not a valid 24-char hex ObjectId, remove it
                if (newKit.id && !/^[0-9a-fA-F]{24}$/.test(newKit.id)) {
                    delete newKit.id;
                }
                return newKit;
            });
        }

        const updatedAssignment = await ComboKitAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error("Error updating assignment:", error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAssignment = async (req, res) => {
    try {
        await ComboKitAssignment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCombokits = async (req, res) => {
    try {
        const assignments = await ComboKitAssignment.find({}, 'comboKits');
        const allKits = [];
        const seenNames = new Set();
        
        assignments.forEach(assignment => {
            if (assignment.comboKits && assignment.comboKits.length > 0) {
                assignment.comboKits.forEach(kit => {
                    // Collect all kits. Maybe deduplicate by name for the primary dropdown?
                    // User says: adani combokit with panel test, tata combokit
                    if (!seenNames.has(kit.name)) {
                        allKits.push({
                            id: kit._id,
                            name: kit.name
                        });
                        seenNames.add(kit.name);
                    }
                });
            }
        });
        
        res.status(200).json(allKits);
    } catch (error) {
        console.error("Error fetching all combokits:", error);
        res.status(500).json({ message: error.message });
    }
};
export const getAllCustomizedCombokits = async (req, res) => {
    try {
        const assignments = await ComboKitAssignment.find({})
            .populate('state', 'name')
            .populate('clusters', 'name')
            .populate('districts', 'name')
            .populate('combokitId', 'name');
        
        // Map to a format useful for the dropdown
        const result = assignments.map(a => ({
            _id: a._id,
            panels: a.panels || [],
            inverters: a.inverters || [],
            category: a.category,
            subCategory: a.subCategory,
            projectType: a.projectType,
            subProjectType: a.subProjectType,
            state: a.state,
            districts: a.districts,
            role: a.role || (a.cpTypes && a.cpTypes.length > 0 ? a.cpTypes[0] : ''),
            solarkitName: a.solarkitName
        }));
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching all customized combokits:", error);
        res.status(500).json({ message: error.message });
    }
};
