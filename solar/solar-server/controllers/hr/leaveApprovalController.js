import LeaveRequest from '../../models/hr/LeaveRequest.js';
import User from '../../models/users/User.js';
import TemporaryIncharge from '../../models/hr/TemporaryIncharge.js';

// @desc    Create a manual leave request (Admin side)
// @route   POST /api/leave-approvals
// @access  Private
export const createLeaveRequest = async (req, res, next) => {
    try {
        const {
            employee, department, position, leaveType, leaveDuration,
            fromDate, toDate, totalDays, reason, attachment
        } = req.body;

        if (!employee || !leaveType || !leaveDuration || !fromDate || !toDate || !totalDays || !reason) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const leaveRequest = await LeaveRequest.create({
            employee,
            department: department || null,
            position: position || '',
            leaveType,
            leaveDuration,
            fromDate,
            toDate,
            totalDays,
            reason,
            attachment,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: leaveRequest, message: 'Leave request created successfully.' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all leave requests
// @route   GET /api/leave-approvals
// @access  Private
export const getAllLeaveRequests = async (req, res, next) => {
    try {
        const leaveRequests = await LeaveRequest.find()
            .populate('employee', 'name userId phone email')
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: leaveRequests.length, data: leaveRequests });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single leave request details
// @route   GET /api/leave-approvals/:id
// @access  Private
export const getLeaveRequestDetails = async (req, res, next) => {
    try {
        const leaveRequest = await LeaveRequest.findById(req.params.id)
            .populate('employee', 'name userId phone email department')
            .populate('department', 'name')
            .populate('approvedBy', 'name')
            .populate('temporaryIncharge', 'name');

        if (!leaveRequest) {
            return res.status(404).json({ success: false, message: 'Leave request not found.' });
        }

        res.json({ success: true, data: leaveRequest });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve a leave request
// @route   PUT /api/leave-approvals/:id/approve
// @access  Private
export const approveLeaveRequest = async (req, res, next) => {
    try {
        const { temporaryIncharge } = req.body;
        const leaveRequest = await LeaveRequest.findById(req.params.id);

        if (!leaveRequest) {
            return res.status(404).json({ success: false, message: 'Leave request not found.' });
        }

        if (leaveRequest.status === 'Approved') {
            return res.status(400).json({ success: false, message: 'Leave request is already approved.' });
        }

        const employeeId = leaveRequest.employee;
        const user = await User.findById(employeeId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Associated employee not found.' });
        }

        // 1. Mark as approved
        leaveRequest.status = 'Approved';
        leaveRequest.approvedBy = req.user.id;
        leaveRequest.approvalDate = new Date();
        if (temporaryIncharge) {
            leaveRequest.temporaryIncharge = temporaryIncharge;

            // Create a TemporaryIncharge record so it shows up on the dashboard
            await TemporaryIncharge.create({
                originalUser: employeeId,
                tempInchargeUser: temporaryIncharge,
                department: leaveRequest.department || user.department,
                startDate: leaveRequest.fromDate,
                endDate: leaveRequest.toDate,
                reason: `Leave: ${leaveRequest.leaveType}`,
                createdBy: req.user.id
            });
        }

        // 2. Add absent days to user's total
        user.absentDays = (user.absentDays || 0) + leaveRequest.totalDays;

        // 3. Status update if dates are currently active (Today is between fromDate and toDate)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fromDate = new Date(leaveRequest.fromDate);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(leaveRequest.toDate);
        toDate.setHours(23, 59, 59, 999);

        if (today >= fromDate && today <= toDate) {
            user.employeeStatus = 'Absent';
            if (temporaryIncharge) {
                user.temporaryIncharge = temporaryIncharge;
            }
        }

        await leaveRequest.save();
        await user.save();

        res.json({ success: true, data: leaveRequest, message: 'Leave request approved successfully.' });
    } catch (err) {
        next(err);
    }
};

// @desc    Reject a leave request
// @route   PUT /api/leave-approvals/:id/reject
// @access  Private
// @access  Private
export const rejectLeaveRequest = async (req, res, next) => {
    try {
        const { rejectionReason } = req.body;
        const leaveRequest = await LeaveRequest.findById(req.params.id);

        if (!leaveRequest) {
            return res.status(404).json({ success: false, message: 'Leave request not found.' });
        }

        if (leaveRequest.status === 'Rejected') {
            return res.status(400).json({ success: false, message: 'Leave request is already rejected.' });
        }

        // If it was previously approved, we'd need to rollback absent days (complex, simplified for now: just reject pending)
        if (leaveRequest.status === 'Approved') {
            const user = await User.findById(leaveRequest.employee);
            if (user) {
                user.absentDays = Math.max(0, (user.absentDays || 0) - leaveRequest.totalDays);

                // Check if we need to reset status
                const today = new Date();
                const from = new Date(leaveRequest.fromDate);
                const to = new Date(leaveRequest.toDate);
                if (today >= from && today <= to) {
                    user.employeeStatus = 'Present'; // Simplified, assuming no other active leaves
                    user.temporaryIncharge = null;
                }
                await user.save();
            }
        }

        leaveRequest.status = 'Rejected';
        leaveRequest.rejectionReason = rejectionReason || 'No reason provided';

        await leaveRequest.save();

        res.json({ success: true, data: leaveRequest, message: 'Leave request rejected.' });
    } catch (err) {
        next(err);
    }
};
