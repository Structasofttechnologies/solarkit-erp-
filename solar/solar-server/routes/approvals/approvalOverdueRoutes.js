import express from 'express';
import {
    getRules,
    createRule,
    updateRule,
    deleteRule,
    seedRules
} from '../../controllers/approvals/approvalOverdueController.js';

const router = express.Router();

router.route('/').get(getRules).post(createRule);
router.route('/seed').post(seedRules);
router.route('/:id').put(updateRule).delete(deleteRule);

export default router;
