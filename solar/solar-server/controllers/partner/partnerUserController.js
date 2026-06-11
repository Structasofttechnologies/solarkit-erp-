import PartnerUser from '../../models/partner/PartnerUser.js';

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
// CREATE Partner User
// ==========================================
export const createPartnerUser = async (req, res) => {
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
        // Handle duplicate key errors
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
// GET ALL Partner Users (with filters)
// ==========================================
export const getAllPartnerUsers = async (req, res) => {
    try {
        const query = {};

        if (req.query.partnerType) query.partnerType = req.query.partnerType;
        if (req.query.state) query.state = req.query.state;
        if (req.query.district) query.district = req.query.district;
        if (req.query.status) query.status = req.query.status;
        if (req.query.industryType) query.industryType = req.query.industryType;
        if (req.query.professionType) query.professionType = req.query.professionType;
        if (req.query.hasGST) query.hasGST = req.query.hasGST === 'true';

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
// GET Partner User BY ID
// ==========================================
export const getPartnerUserById = async (req, res) => {
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
// UPDATE Partner User
// ==========================================
export const updatePartnerUser = async (req, res) => {
    try {
        const partnerUser = await PartnerUser.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate(populateOptions);

        if (!partnerUser) {
            return res.status(404).json({ success: false, message: 'Partner User not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Partner User updated successfully',
            data: partnerUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update Partner User',
            error: error.message
        });
    }
};

// ==========================================
// DELETE Partner User
// ==========================================
export const deletePartnerUser = async (req, res) => {
    try {
        const partnerUser = await PartnerUser.findByIdAndDelete(req.params.id);
        if (!partnerUser) {
            return res.status(404).json({ success: false, message: 'Partner User not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Partner User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete Partner User',
            error: error.message
        });
    }
};

// ==========================================
// GET Partner User COUNT by Partner Type
// ==========================================
export const getPartnerUserCounts = async (req, res) => {
    try {
        const counts = await PartnerUser.aggregate([
            { $group: { _id: '$partnerType', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => { countMap[c._id] = c.count; });

        res.status(200).json({
            success: true,
            message: 'Partner User counts fetched',
            data: countMap
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch counts',
            error: error.message
        });
    }
};
