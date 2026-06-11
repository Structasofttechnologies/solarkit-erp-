import PartnerUser from '../../models/partner/PartnerUser.js';
import Partner from '../../models/partner/Partner.js';
import PartnerIndustryType from '../../models/partner/PartnerIndustryType.js';
import PartnerProfession from '../../models/partner/PartnerProfession.js';
import BusinessType from '../../models/partner/BusinessType.js';
import GSTPartnerConfig from '../../models/partner/GSTPartnerConfig.js';
import State from '../../models/core/State.js';
import District from '../../models/core/District.js';

const populateOptions = [
    { path: 'state', select: 'name' },
    { path: 'district', select: 'name' },
    { path: 'partnerType', select: 'name' },
    { path: 'industryType', select: 'name' },
    { path: 'professionType', select: 'name' },
    { path: 'businessType', select: 'name' },
    { path: 'gstPartnerType', select: 'name' },
    { path: 'createdBy', select: 'name email' }
];

// ==========================================
// CREATE Partner User (Mobile)
// ==========================================
export const createMobilePartnerUser = async (req, res) => {
    try {
        const partnerUser = new PartnerUser(req.body);
        await partnerUser.save();

        const populated = await PartnerUser.findById(partnerUser._id).populate(populateOptions);
        res.status(201).json({
            success: true,
            message: 'Partner User created successfully',
            data: populated
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `A partner user with this ${field} already exists`,
                error: error.message
            });
        }
        res.status(400).json({
            success: false,
            message: 'Failed to create Partner User',
            error: error.message
        });
    }
};

// ==========================================
// GET ALL Partner Users (Mobile, with filters)
// ==========================================
export const getMobilePartnerUsers = async (req, res) => {
    try {
        const query = {};
        if (req.query.partnerType) query.partnerType = req.query.partnerType;
        if (req.query.state) query.state = req.query.state;
        if (req.query.district) query.district = req.query.district;
        if (req.query.status) query.status = req.query.status;
        if (req.query.createdBy) query.createdBy = req.query.createdBy;

        const partnerUsers = await PartnerUser.find(query)
            .populate(populateOptions)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Partner Users fetched successfully',
            data: partnerUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Partner Users',
            error: error.message
        });
    }
};

// ==========================================
// GET Partner User BY ID (Mobile)
// ==========================================
export const getMobilePartnerUserById = async (req, res) => {
    try {
        const partnerUser = await PartnerUser.findById(req.params.id).populate(populateOptions);
        if (!partnerUser) {
            return res.status(404).json({ success: false, message: 'Partner User not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Partner User fetched successfully',
            data: partnerUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Partner User',
            error: error.message
        });
    }
};

// ==========================================
// GET Metadata for Partner User form (Mobile)
// All dropdown data in one call
// ==========================================
export const getPartnerUserMetadata = async (req, res) => {
    try {
        const [partnerTypes, industryTypes, professions, businessTypes, gstConfigs, states] = await Promise.all([
            Partner.find({ isActive: true }).select('name'),
            PartnerIndustryType.find({ isActive: true }).select('name partnerType'),
            PartnerProfession.find({ isActive: true }).populate('industryType', 'name').populate('state', 'name').select('name partnerType plan industryType state'),
            BusinessType.find({ isActive: true }).select('name'),
            GSTPartnerConfig.find({ isActive: true }).populate('businessType', 'name').populate('partnerTypes', 'name'),
            State.find({ status: true }).select('name')
        ]);

        res.status(200).json({
            success: true,
            message: 'Metadata fetched successfully',
            data: {
                partnerTypes,
                industryTypes,
                professions,
                businessTypes,
                gstConfigs,
                states
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch metadata',
            error: error.message
        });
    }
};

// ==========================================
// GET Districts by State (Mobile helper)
// ==========================================
export const getDistrictsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const districts = await District.find({ state: stateId, isActive: true }).select('name');
        res.status(200).json({
            success: true,
            message: 'Districts fetched successfully',
            data: districts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch districts',
            error: error.message
        });
    }
};
