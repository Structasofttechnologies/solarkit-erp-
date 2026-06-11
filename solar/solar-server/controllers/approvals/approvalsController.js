import Approval from '../../models/approvals/Approval.js';
import ProcurementOrder from '../../models/orders/ProcurementOrder.js';

// Get Approvals with filters
export const getApprovals = async (req, res) => {
    try {
        const { type, status, state, cluster, district } = req.query;

        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        // Location filters - allow filtering by state, cluster, district
        // Note: Assuming the frontend sends these as query params
        if (state && state !== 'All') query['location.state'] = state;
        if (district && district !== 'All') query['location.district'] = district;
        if (cluster && cluster !== 'All') query['location.cluster'] = cluster;

        const approvals = await Approval.find(query).sort({ createdAt: -1 });

        // approvals fetched successfully

        res.status(200).json(approvals);
    } catch (error) {
        console.error('Error fetching approvals:', error);
        res.status(500).json({ message: 'Error fetching approvals', error: error.message });
    }
};

// Create a new approval request (for seeding or manual creation)
export const createApproval = async (req, res) => {
    try {
        const newApproval = new Approval(req.body);
        const savedApproval = await newApproval.save();
        res.status(201).json(savedApproval);
    } catch (error) {
        console.error('Error creating approval:', error);
        res.status(500).json({ message: 'Error creating approval', error: error.message });
    }
};

// Update approval status (Approve/Reject)
export const updateApprovalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, approvedBy, rejectedBy } = req.body;

        const updateData = { status };

        if (status === 'Approved') {
            updateData.approvedBy = approvedBy || 'Admin';
            updateData.approvedDate = new Date();
        } else if (status === 'Rejected') {
            updateData.rejectedBy = rejectedBy || 'Admin';
            updateData.rejectedDate = new Date();
            updateData.rejectionReason = remarks;
        }

        const updatedApproval = await Approval.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedApproval) {
            return res.status(404).json({ message: 'Approval not found' });
        }
        
        // SYNC EFFECT FOR INVENTORY TRACKING
        if (status === 'Approved' && updatedApproval.type === 'inventory') {
            const orderId = updatedApproval.data?.orderId;
            if (orderId) {
                try {
                    await ProcurementOrder.findByIdAndUpdate(orderId, { status: 'Approval by Admin' });
                    console.log(`✅ Procurement Order ${orderId} status updated via Admin Approval`);
                } catch (syncErr) {
                    console.error("Failed to sync status with ProcurementOrder", syncErr);
                }
            }
        }

        res.status(200).json(updatedApproval);
    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({ message: 'Error updating approval status', error: error.message });
    }
};

// Delete approval (optional, but good for cleanup)
export const deleteApproval = async (req, res) => {
    try {
        const { id } = req.params;
        await Approval.findByIdAndDelete(id);
        res.status(200).json({ message: 'Approval deleted successfully' });
    } catch (error) {
        console.error('Error deleting approval:', error);
        res.status(500).json({ message: 'Error deleting approval', error: error.message });
    }
};
