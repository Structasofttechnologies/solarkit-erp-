import PartnerPlan from '../../models/partner/PartnerPlan.js';
import PartnerReward from '../../models/partner/PartnerReward.js';
import PartnerGoal from '../../models/partner/PartnerGoal.js';
import PartnerProfession from '../../models/partner/PartnerProfession.js';
import Partner from '../../models/partner/Partner.js';
import PartnerIndustryType from '../../models/partner/PartnerIndustryType.js';
import BusinessType from '../../models/partner/BusinessType.js';
import GSTPartnerConfig from '../../models/partner/GSTPartnerConfig.js';

// --- PARTNERS (Types) ---

export const getPartners = async (req, res) => {
    try {
        const partners = await Partner.find({ isActive: true });
        res.status(200).json({ success: true, message: 'Partner Types fetched successfully', data: partners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPartner = async (req, res) => {
    try {
        const partner = new Partner(req.body);
        await partner.save();
        res.status(201).json(partner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findByIdAndUpdate(id, req.body, { new: true });
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.status(200).json(partner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        await Partner.findByIdAndDelete(id);
        res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- PLANS ---

export const getPlans = async (req, res) => {
    try {
        const { partnerType, countryId, stateId, clusterId, districtId } = req.query;
        let query = { isActive: true };

        if (partnerType) {
            const types = partnerType.split(',').filter(t => t && t !== 'null' && t !== 'undefined');
            query.partnerType = { $in: types };
        }
        if (countryId) {
            const ids = countryId.split(',').filter(id => id && id !== 'null' && id !== 'undefined');
            query.country = { $in: ids };
        }
        if (stateId) {
            const ids = stateId.split(',').filter(id => id && id !== 'null' && id !== 'undefined');
            query.state = { $in: ids };
        }
        if (clusterId) {
            const ids = clusterId.split(',').filter(id => id && id !== 'null' && id !== 'undefined');
            query.cluster = { $in: ids };
        }
        if (districtId) {
            const ids = districtId.split(',').filter(id => id && id !== 'null' && id !== 'undefined');
            query.district = { $in: ids };
        }

        let plans = await PartnerPlan.find(query)
            .populate('country', 'name')
            .populate('state', 'name code')
            .populate('cluster', 'name')
            .populate('district', 'name');

        // Note: The template creation logic below assumes plans are at stateId level.
        // If we want plans at district level, this logic needs refinement.
        // For now, we only use template logic if stateId is provided.

        if (stateId && partnerType && plans.length === 0) {
            // Find all unique plan names that exist in the system to use as templates
            // This defines what plans "should" exist for any given partner/location
            const allPlanNames = await PartnerPlan.distinct('name', { isActive: true });

            if (allPlanNames.length > 0) {
                // Check if any plans (active OR inactive) already exist for this SPECIFIC context
                // to avoid re-creating something that was already created or deleted.
                const existingPlansInContext = await PartnerPlan.find({
                    partnerType,
                    country: countryId ? { $all: countryId.split(',').filter(id => id && id !== 'null') } : { $size: 0 },
                    state: stateId ? { $all: stateId.split(',').filter(id => id && id !== 'null') } : { $size: 0 },
                    cluster: clusterId ? { $all: clusterId.split(',').filter(id => id && id !== 'null') } : { $size: 0 },
                    district: districtId ? { $all: districtId.split(',').filter(id => id && id !== 'null') } : { $size: 0 }
                });

                const existingNames = existingPlansInContext.map(p => p.name);
                const namesToCreate = allPlanNames.filter(name => !existingNames.includes(name));

                if (namesToCreate.length > 0) {
                    // Fetch the actual template objects for these names
                    // We take one sample for each missing name
                    const templates = await Promise.all(namesToCreate.map(name =>
                        PartnerPlan.findOne({ name, isActive: true }).lean()
                    ));

                    const newPlans = templates.map(template => {
                        const obj = { ...template };
                        delete obj._id;
                        delete obj.createdAt;
                        delete obj.updatedAt;
                        delete obj.__v;

                        obj.country = countryId ? countryId.split(',').filter(id => id && id !== 'null') : [];
                        obj.state = stateId ? stateId.split(',').filter(id => id && id !== 'null') : [];
                        obj.cluster = clusterId ? clusterId.split(',').filter(id => id && id !== 'null') : [];
                        obj.district = districtId ? districtId.split(',').filter(id => id && id !== 'null') : [];
                        obj.partnerType = partnerType;
                        obj.isActive = true;
                        return obj;
                    });

                    if (newPlans.length > 0) {
                        try {
                            await PartnerPlan.insertMany(newPlans, { ordered: false });
                        } catch (error) {
                            // If some already existed due to a race condition (index violation), 
                            // we ignore it and continue since we're re-fetching anyway.
                            console.warn('Duplicate plans prevented by index during template creation');
                        }

                        // Re-fetch to get the newly created plans or existing ones
                        plans = await PartnerPlan.find(query)
                            .populate('country', 'name')
                            .populate('state', 'name code')
                            .populate('cluster', 'name')
                            .populate('district', 'name');
                    }
                }
            }
        }
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPlan = async (req, res) => {
    try {
        const plan = new PartnerPlan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(400).json({ message: error.message });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PartnerPlan.findByIdAndUpdate(id, req.body, { new: true }).populate('state');
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json(plan);
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(400).json({ message: error.message });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PartnerPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- REWARDS & POINTS ---

export const getRewards = async (req, res) => {
    try {
        const { partnerType, plan } = req.query;
        let query = { isActive: true };
        if (partnerType) query.partnerType = partnerType;
        if (plan) query.plan = plan;

        const rewards = await PartnerReward.find(query);
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReward = async (req, res) => {
    try {
        const reward = new PartnerReward(req.body);
        await reward.save();
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteReward = async (req, res) => {
    try {
        const { id } = req.params;
        await PartnerReward.findByIdAndDelete(id);
        res.status(200).json({ message: 'Reward deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReward = async (req, res) => {
    try {
        const { id } = req.params;
        const reward = await PartnerReward.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ONBOARDING GOALS ---

export const getGoals = async (req, res) => {
    try {
        const { partnerType, stateId } = req.query;
        let query = { isActive: true };
        if (partnerType) query.partnerType = partnerType;
        if (stateId) query.state = stateId;

        const goals = await PartnerGoal.find(query)
            .populate('state');
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGoal = async (req, res) => {
    try {
        const goal = new PartnerGoal(req.body);
        await goal.save();
        const populatedGoal = await PartnerGoal.findById(goal._id)
            .populate('state');
        res.status(201).json(populatedGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        await PartnerGoal.findByIdAndDelete(id);
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- INDUSTRY TYPES ---

export const getIndustryTypes = async (req, res) => {
    try {
        const { partnerType } = req.query;
        let query = { isActive: true };
        if (partnerType) query.partnerType = partnerType;

        const industryTypes = await PartnerIndustryType.find(query).sort({ createdAt: -1 });
        res.status(200).json(industryTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createIndustryType = async (req, res) => {
    try {
        const industryType = new PartnerIndustryType(req.body);
        await industryType.save();
        res.status(201).json(industryType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteIndustryType = async (req, res) => {
    try {
        const { id } = req.params;
        await PartnerIndustryType.findByIdAndDelete(id);
        res.status(200).json({ message: 'Industry Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- PROFESSION TYPES ---

export const getProfessions = async (req, res) => {
    try {
        const { partnerType, stateId, industryTypeId, plan } = req.query;
        let query = { isActive: true };
        if (partnerType) query.partnerType = partnerType;
        if (stateId) query.state = stateId;
        if (industryTypeId) query.industryType = industryTypeId;
        if (plan) query.plan = plan;

        const professions = await PartnerProfession.find(query).populate('state').populate('industryType');
        res.status(200).json(professions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProfession = async (req, res) => {
    try {
        const profession = new PartnerProfession(req.body);
        await profession.save();
        const populatedProfession = await PartnerProfession.findById(profession._id)
            .populate('state')
            .populate('industryType');
        res.status(201).json(populatedProfession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProfession = async (req, res) => {
    try {
        const { id } = req.params;
        await PartnerProfession.findByIdAndDelete(id);
        res.status(200).json({ message: 'Profession deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- BUSINESS TYPES ---

export const getBusinessTypes = async (req, res) => {
    try {
        const businessTypes = await BusinessType.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: businessTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBusinessType = async (req, res) => {
    try {
        const businessType = new BusinessType(req.body);
        await businessType.save();
        res.status(201).json({ success: true, data: businessType });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Business type already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteBusinessType = async (req, res) => {
    try {
        const { id } = req.params;
        await BusinessType.findByIdAndDelete(id);
        // Also remove from any GST configs
        await GSTPartnerConfig.deleteMany({ businessType: id });
        res.status(200).json({ success: true, message: 'Business Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GST PARTNER CONFIG ---

export const getGSTPartnerConfigs = async (req, res) => {
    try {
        const configs = await GSTPartnerConfig.find({ isActive: true })
            .populate('businessType', 'name')
            .populate('partnerTypes', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createGSTPartnerConfig = async (req, res) => {
    try {
        const config = new GSTPartnerConfig(req.body);
        await config.save();
        const populated = await GSTPartnerConfig.findById(config._id)
            .populate('businessType', 'name')
            .populate('partnerTypes', 'name');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Config for this business type already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateGSTPartnerConfig = async (req, res) => {
    try {
        const config = await GSTPartnerConfig.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('businessType', 'name')
            .populate('partnerTypes', 'name');
        if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteGSTPartnerConfig = async (req, res) => {
    try {
        await GSTPartnerConfig.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'GST Config deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
