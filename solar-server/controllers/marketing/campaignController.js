import Campaign from '../../models/marketing/Campaign.js';
import CampaignConfig from '../../models/marketing/CampaignConfig.js';
import SocialMediaCampaign from '../../models/marketing/SocialMediaCampaign.js';

// Create a new campaign
export const createCampaign = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Basic validation for dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'Start date cannot be after end date' });
        }

        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all campaigns with optional filtering
export const getAllCampaigns = async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = {};

        if (status) query.status = status;
        if (type) query.campaignType = type;

        const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single campaign
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update campaign
export const updateCampaign = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'Start date cannot be after end date' });
        }

        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Update fields
        Object.keys(req.body).forEach(key => {
            campaign[key] = req.body[key];
        });

        // Save triggers pre-save hook for auto-calculation
        await campaign.save();

        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Dashboard Stats
export const getCampaignStats = async (req, res) => {
    try {
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    activeCampaigns: {
                        $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] }
                    },
                    totalLeads: { $sum: "$actualLeads" },
                    totalRevenue: { $sum: "$revenueGenerated" },
                    totalBudget: { $sum: "$budget" },
                    avgConversion: { $avg: "$conversionRate" }
                }
            }
        ]);

        const result = stats[0] || {
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalLeads: 0,
            totalRevenue: 0,
            totalBudget: 0,
            avgConversion: 0
        };

        // Calculate ROI: ((Revenue - Budget) / Budget) * 100
        const roi = result.totalBudget > 0
            ? ((result.totalRevenue - result.totalBudget) / result.totalBudget) * 100
            : 0;

        res.status(200).json({ ...result, marketingROI: parseFloat(roi.toFixed(2)) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to sanitize IDs (convert '' or 'all' to null/undefined for Mongoose)
const sanitizeId = (id) => {
    if (!id || id === 'all' || id === '') return undefined;
    if (typeof id === 'object' && id?._id) return id._id;
    return id;
};

// Configuration Controllers
export const getCampaignConfig = async (req, res, next) => {
    try {
        const { country, state, cluster, district, partnerType } = req.query;
        let query = {};
        if (sanitizeId(country)) query.country = sanitizeId(country);
        if (sanitizeId(state)) query.state = sanitizeId(state);
        if (sanitizeId(cluster)) query.cluster = sanitizeId(cluster);
        if (sanitizeId(district)) query.district = sanitizeId(district);
        if (partnerType) query.partnerType = partnerType;

        const config = await CampaignConfig.findOne(query)
            .populate('plans', 'name');
            
        res.json({ success: true, data: config || {
            campaignTypes: ['company', 'CPRM'],
            conversions: { 'company': 32, 'CPRM': 12 },
            plans: []
        } });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

export const getAllCampaignConfigs = async (req, res, next) => {
    try {
        const configs = await CampaignConfig.find()
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('cluster', 'name clusterName')
            .populate('district', 'name districtName')
            .populate('plans', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: configs });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

export const updateCampaignConfig = async (req, res, next) => {
    try {
        const {
            country,
            state,
            cluster,
            district,
            partnerType,
            campaignTypes,
            conversions,
            cprmConversion,
            companyConversion,
            defaultCompanyBudget,
            defaultCprmBudget,
            plans
        } = req.body;

        // Try to update or create a record for this specific region/partner
        let query = {};
        if (sanitizeId(country)) query.country = sanitizeId(country);
        if (sanitizeId(state)) query.state = sanitizeId(state);
        if (sanitizeId(cluster)) query.cluster = sanitizeId(cluster);
        if (sanitizeId(district)) query.district = sanitizeId(district);
        if (partnerType) query.partnerType = partnerType;
        
        let config = await CampaignConfig.findOne(query);
        
        if (!config) {
            // Remove _id from body to prevent duplicate key errors if frontend sent an old id
            const cleanBody = { ...req.body };
            delete cleanBody._id;
            
            // Clean region IDs in body
            cleanBody.country = sanitizeId(cleanBody.country);
            cleanBody.state = sanitizeId(cleanBody.state);
            cleanBody.cluster = sanitizeId(cleanBody.cluster);
            cleanBody.district = sanitizeId(cleanBody.district);

            config = new CampaignConfig(cleanBody);
        } else {
            // Update fields manually from req.body to avoid accidental _id update or invalid values
            if (campaignTypes) {
                config.campaignTypes = campaignTypes;
                config.markModified('campaignTypes');
            }
            if (conversions) {
                config.conversions = conversions;
                config.markModified('conversions');
            }
            if (cprmConversion !== undefined) config.cprmConversion = cprmConversion;
            if (companyConversion !== undefined) config.companyConversion = companyConversion;
            if (defaultCompanyBudget !== undefined) config.defaultCompanyBudget = defaultCompanyBudget;
            if (defaultCprmBudget !== undefined) config.defaultCprmBudget = defaultCprmBudget;
            if (plans !== undefined) {
                config.plans = plans;
                config.markModified('plans');
            }
        }

        config.updatedBy = req.user?.id;
        await config.save();
        
        // Return version with plans populated (if needed) or just IDs
        const savedConfig = await CampaignConfig.findById(config._id)
            .populate('plans', 'name');

        res.json({ success: true, message: 'Settings updated successfully', data: savedConfig });
    } catch (err) {
        console.error('Update Config Error:', err);
        next(err || new Error('Internal Server Error'));
    }
};

export const deleteCampaignConfig = async (req, res, next) => {
    try {
        const config = await CampaignConfig.findByIdAndDelete(req.params.id);
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        res.json({ success: true, message: 'Configuration removed successfully' });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

// Social Media Campaign Controllers
export const getAllSocialCampaigns = async (req, res, next) => {
    try {
        const campaigns = await SocialMediaCampaign.find()
            .populate('country')
            .populate('state')
            .populate('cluster')
            .populate('district')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: campaigns.length, data: campaigns });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

export const createSocialCampaign = async (req, res, next) => {
    try {
        const body = { ...req.body };
        body.country = sanitizeId(body.country);
        body.state = sanitizeId(body.state);
        body.cluster = sanitizeId(body.cluster);
        body.district = sanitizeId(body.district);

        const campaign = await SocialMediaCampaign.create({
            ...body,
            createdBy: req.user?.id
        });
        await campaign.populate(['country', 'state', 'cluster', 'district']);
        res.status(201).json({ success: true, data: campaign });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

export const updateSocialCampaign = async (req, res, next) => {
    try {
        const body = { ...req.body };
        body.country = sanitizeId(body.country);
        body.state = sanitizeId(body.state);
        body.cluster = sanitizeId(body.cluster);
        body.district = sanitizeId(body.district);

        const campaign = await SocialMediaCampaign.findByIdAndUpdate(
            req.params.id,
            body,
            { new: true, runValidators: true }
        ).populate(['country', 'state', 'cluster', 'district']);

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        res.json({ success: true, data: campaign });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};

export const deleteSocialCampaign = async (req, res, next) => {
    try {
        const campaign = await SocialMediaCampaign.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (err) {
        next(err || new Error('Internal Server Error'));
    }
};
