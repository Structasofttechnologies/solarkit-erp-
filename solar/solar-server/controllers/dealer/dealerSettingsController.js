import DealerPlan from '../../models/dealer/DealerPlan.js';
import DealerReward from '../../models/dealer/DealerReward.js';
import DealerGoal from '../../models/dealer/DealerGoal.js';
import DealerProfession from '../../models/dealer/DealerProfession.js';
import State from '../../models/core/State.js';

// --- PLANS ---

export const getPlans = async (req, res) => {
    try {
        const plans = await DealerPlan.find({ isActive: true });
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPlan = async (req, res) => {
    try {
        const plan = new DealerPlan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await DealerPlan.findByIdAndUpdate(id, req.body, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json(plan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        await DealerPlan.findByIdAndDelete(id);
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- REWARDS & POINTS ---

export const getRewards = async (req, res) => {
    try {
        const rewards = await DealerReward.find({ isActive: true });
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReward = async (req, res) => {
    try {
        const reward = new DealerReward(req.body);
        await reward.save();
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteReward = async (req, res) => {
    try {
        const { id } = req.params;
        await DealerReward.findByIdAndDelete(id);
        res.status(200).json({ message: 'Reward deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReward = async (req, res) => {
    try {
        const { id } = req.params;
        const reward = await DealerReward.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ONBOARDING GOALS ---

export const getGoals = async (req, res) => {
    try {
        const goals = await DealerGoal.find({ isActive: true })
            .populate('state')
            .populate('district')
            .populate('cluster');
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGoal = async (req, res) => {
    try {
        const goal = new DealerGoal(req.body);
        await goal.save();
        const populatedGoal = await DealerGoal.findById(goal._id)
            .populate('state')
            .populate('district')
            .populate('cluster');
        res.status(201).json(populatedGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        await DealerGoal.findByIdAndDelete(id);
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- PROFESSION TYPES ---

export const getProfessions = async (req, res) => {
    try {
        // If stateId is provided, filter by it
        const query = req.query.stateId ? { state: req.query.stateId } : {};
        const professions = await DealerProfession.find({ ...query, isActive: true }).populate('state');
        res.status(200).json(professions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProfession = async (req, res) => {
    try {
        const profession = new DealerProfession(req.body);
        await profession.save();
        const populatedProfession = await DealerProfession.findById(profession._id).populate('state');
        res.status(201).json(populatedProfession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProfession = async (req, res) => {
    try {
        const { id } = req.params;
        await DealerProfession.findByIdAndDelete(id);
        res.status(200).json({ message: 'Profession deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
