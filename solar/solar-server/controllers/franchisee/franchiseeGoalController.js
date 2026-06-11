import FranchiseeOnboardingGoal from '../../models/franchisee/FranchiseeOnboardingGoal.js';

// Create a goal
export const createGoal = async (req, res) => {
    try {
        const goal = new FranchiseeOnboardingGoal(req.body);
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all goals (filter by state)
export const getGoals = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }
        const goals = await FranchiseeOnboardingGoal.find(filter).populate('state', 'name code');
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    try {
        const goal = await FranchiseeOnboardingGoal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const goal = await FranchiseeOnboardingGoal.findByIdAndDelete(req.params.id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
