import FranchiseePlan from '../../models/franchisee/FranchiseePlan.js';

// Create a new plan
export const createPlan = async (req, res) => {
    try {
        const plan = new FranchiseePlan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all plans (optional filter by state)
export const getPlans = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }
        const plans = await FranchiseePlan.find(filter).populate('state', 'name code');
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single plan
export const getPlan = async (req, res) => {
    try {
        const plan = await FranchiseePlan.findById(req.params.id).populate('state', 'name code');
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a plan
export const updatePlan = async (req, res) => {
    try {
        const plan = await FranchiseePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json(plan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a plan
export const deletePlan = async (req, res) => {
    try {
        const plan = await FranchiseePlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
