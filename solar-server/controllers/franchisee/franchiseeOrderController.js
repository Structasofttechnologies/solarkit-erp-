import FranchiseeOrderSetting from '../../models/franchisee/FranchiseeOrderSetting.js';

// Create an order setting
export const createOrderSetting = async (req, res) => {
    try {
        const setting = new FranchiseeOrderSetting(req.body);
        await setting.save();
        res.status(201).json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all order settings (filter by state, type, plan)
export const getOrderSettings = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) filter.state = req.query.state;
        if (req.query.settingType) filter.settingType = req.query.settingType;
        if (req.query.planType) filter.planType = req.query.planType;

        const settings = await FranchiseeOrderSetting.find(filter).populate('state', 'name code');
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order setting
export const updateOrderSetting = async (req, res) => {
    try {
        const setting = await FranchiseeOrderSetting.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!setting) return res.status(404).json({ message: 'Setting not found' });
        res.status(200).json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an order setting
export const deleteOrderSetting = async (req, res) => {
    try {
        const setting = await FranchiseeOrderSetting.findByIdAndDelete(req.params.id);
        if (!setting) return res.status(404).json({ message: 'Setting not found' });
        res.status(200).json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
