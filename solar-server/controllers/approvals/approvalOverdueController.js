import ApprovalOverdueRule from '../../models/approvals/ApprovalOverdueRule.js';

// @desc    Get all approval overdue rules
// @route   GET /api/approval-overdue
// @access  Private
const EXPECTED_RULES = [
    { ruleName: 'Installer Approvals', type: 'onboarding', key: 'installer', overdueDays: 3 },
    { ruleName: 'Driver Approvals', type: 'onboarding', key: 'driver', overdueDays: 2 },
    { ruleName: 'Dealer Approvals', type: 'onboarding', key: 'dealer', overdueDays: 5 },
    { ruleName: 'Franchisee Approvals', type: 'onboarding', key: 'franchisee', overdueDays: 5 },
    { ruleName: 'Recruitment Approvals', type: 'company', key: 'recruitment', overdueDays: 4 },
    { ruleName: 'Combokit Approvals', type: 'company', key: 'combokit', overdueDays: 3 },
    { ruleName: 'Inventory Approvals', type: 'company', key: 'inventory', overdueDays: 4 },
    { ruleName: 'Ticket Approvals', type: 'company', key: 'ticket', overdueDays: 2 },
    { ruleName: 'Standard Project Approvals', type: 'company', key: 'standard', overdueDays: 3 },
    { ruleName: 'Customize Project Approvals', type: 'company', key: 'customize', overdueDays: 3 },
    { ruleName: 'Leave Approvals', type: 'company', key: 'leave', overdueDays: 2 },
    { ruleName: 'Resignation Approvals', type: 'company', key: 'resignation', overdueDays: 2 }
];

// @desc    Get all approval overdue rules
// @route   GET /api/approval-overdue
// @access  Private
export const getRules = async (req, res) => {
    try {
        let rules = await ApprovalOverdueRule.find({}).sort({ createdAt: 1 });

        // Auto-seed missing rules
        const existingKeys = new Set(rules.map(r => r.key));
        const missingRules = EXPECTED_RULES.filter(er => !existingKeys.has(er.key));

        if (missingRules.length > 0) {
            await ApprovalOverdueRule.insertMany(missingRules);
            rules = await ApprovalOverdueRule.find({}).sort({ createdAt: 1 });
        }

        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new approval overdue rule
// @route   POST /api/approval-overdue
// @access  Private
export const createRule = async (req, res) => {
    const { ruleName, type, key, overdueDays, status } = req.body;

    try {
        const ruleExists = await ApprovalOverdueRule.findOne({ key });

        if (ruleExists) {
            return res.status(400).json({ message: 'Rule with this key already exists' });
        }

        const rule = await ApprovalOverdueRule.create({
            ruleName,
            type,
            key,
            overdueDays,
            status
        });

        res.status(201).json(rule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an approval overdue rule
// @route   PUT /api/approval-overdue/:id
// @access  Private
export const updateRule = async (req, res) => {
    const { ruleName, overdueDays, status } = req.body;

    try {
        const rule = await ApprovalOverdueRule.findById(req.params.id);

        if (rule) {
            rule.ruleName = ruleName || rule.ruleName;
            rule.overdueDays = overdueDays || rule.overdueDays;
            rule.status = status || rule.status;

            const updatedRule = await rule.save();
            res.json(updatedRule);
        } else {
            res.status(404).json({ message: 'Rule not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an approval overdue rule
// @route   DELETE /api/approval-overdue/:id
// @access  Private
export const deleteRule = async (req, res) => {
    try {
        const rule = await ApprovalOverdueRule.findById(req.params.id);

        if (rule) {
            await rule.deleteOne();
            res.json({ message: 'Rule removed' });
        } else {
            res.status(404).json({ message: 'Rule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Initialize default rules if empty
// @route   POST /api/approval-overdue/seed
// @access  Private
export const seedRules = async (req, res) => {
    try {
        const count = await ApprovalOverdueRule.countDocuments();
        if (count > 0) {
            return res.status(400).json({ message: 'Rules already exist' });
        }

        const defaultRules = EXPECTED_RULES;

        await ApprovalOverdueRule.insertMany(defaultRules);
        res.status(201).json({ message: 'Default rules seeded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
