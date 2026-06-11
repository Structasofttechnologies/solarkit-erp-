import FranchiseeReward from '../../models/franchisee/FranchiseeReward.js';

// Create a reward
export const createReward = async (req, res) => {
    try {
        const reward = new FranchiseeReward(req.body);
        await reward.save();
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all rewards (filter by type)
export const getRewards = async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        const rewards = await FranchiseeReward.find(filter);
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a reward
export const updateReward = async (req, res) => {
    try {
        const reward = await FranchiseeReward.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reward) return res.status(404).json({ message: 'Reward not found' });
        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a reward
export const deleteReward = async (req, res) => {
    try {
        const reward = await FranchiseeReward.findByIdAndDelete(req.params.id);
        if (!reward) return res.status(404).json({ message: 'Reward not found' });
        res.status(200).json({ message: 'Reward deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Redeem Settings
export const getRedeemSettings = async (req, res) => {
    try {
        const settings = await FranchiseeReward.findOne({ isRedeemSetting: true });
        if (!settings) return res.status(200).json({}); // Return empty if not set
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save/Update Redeem Settings
export const saveRedeemSettings = async (req, res) => {
    try {
        let settings = await FranchiseeReward.findOne({ isRedeemSetting: true });

        if (settings) {
            settings = await FranchiseeReward.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = new FranchiseeReward({ ...req.body, isRedeemSetting: true, type: 'redeem_setting', points: 0 }); // dummy points/type
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
