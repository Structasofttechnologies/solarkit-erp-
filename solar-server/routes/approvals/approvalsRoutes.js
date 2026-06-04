import express from 'express';
import {
    getApprovals,
    createApproval,
    updateApprovalStatus,
    deleteApproval
} from '../../controllers/approvals/approvalsController.js';

const router = express.Router();

router.get('/', getApprovals);
router.post('/', createApproval);
router.put('/:id/status', updateApprovalStatus);
router.delete('/:id', deleteApproval);

export default router;
