import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as leaveController from '../../controllers/hr/leaveApprovalController.js';

const router = express.Router();

router.route('/')
    .post(protect, leaveController.createLeaveRequest)
    .get(protect, leaveController.getAllLeaveRequests);

router.route('/:id')
    .get(protect, leaveController.getLeaveRequestDetails);

router.put('/:id/approve', protect, leaveController.approveLeaveRequest);
router.put('/:id/reject', protect, leaveController.rejectLeaveRequest);

export default router;
