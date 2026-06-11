import Dispute from '../../models/tickets/Dispute.js';
import User from '../../models/users/User.js';

// Helper to generate Dispute ID
const generateDisputeId = async () => {
    const count = await Dispute.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    // Format: DIS-YYYY-XXX
    return `DIS-${year}-${(count + 1).toString().padStart(3, '0')}`;
};

// Create a new dispute
export const createDispute = async (req, res) => {
    try {
        const { type, priority, subject, relatedTo, referenceId, description, attachments, relatedTicket } = req.body;

        const disputeId = await generateDisputeId();

        const newDispute = new Dispute({
            disputeId,
            type,
            priority,
            subject,
            relatedTo,
            referenceId,
            description,
            relatedTicket: relatedTicket || null,
            raisedBy: req.user.id,
            attachments: attachments || [],
            timeline: [{
                description: 'Dispute created',
                actionBy: req.user.id
            }]
        });

        await newDispute.save();
        res.status(201).json({ success: true, data: newDispute });
    } catch (error) {
        console.error('Error creating dispute:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all disputes with optional filters
export const getAllDisputes = async (req, res) => {
    try {
        const { type, status, fromDate, toDate } = req.query;
        let query = {};

        // If the user is a dealer, they only see their own disputes
        if (req.user.role === 'dealer') {
            query.raisedBy = req.user.id;
        } else if (req.user.role === 'dealerManager') {
            // Find dealers managed by this manager
            const myDealers = await User.find({ role: 'dealer', createdBy: req.user.id }).select('_id');
            const dealerIds = myDealers.map(d => d._id);
            query.raisedBy = { $in: [...dealerIds, req.user.id] }; // Include manager's own disputes just in case
        }

        if (type) query.type = type;
        if (status) query.status = status;

        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            // End of the day for toDate
            if (toDate) {
                const endToDate = new Date(toDate);
                endToDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endToDate;
            }
        }

        const disputes = await Dispute.find(query)
            .populate('raisedBy', 'name companyName')
            .populate('assignedTo', 'name')
            .populate('timeline.actionBy', 'name')
            .populate('relatedTicket')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: disputes.length, data: disputes });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update dispute (e.g. status, assignedTo, adding timeline notes)
export const updateDispute = async (req, res) => {
    try {
        const { status, assignedTo, note } = req.body;
        const dispute = await Dispute.findById(req.params.id);

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        if (status) dispute.status = status;
        if (assignedTo) dispute.assignedTo = assignedTo;

        if (note) {
            dispute.timeline.push({
                description: note,
                actionBy: req.user.id
            });
        }

        await dispute.save();
        res.status(200).json({ success: true, data: dispute });
    } catch (error) {
        console.error('Error updating dispute:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
