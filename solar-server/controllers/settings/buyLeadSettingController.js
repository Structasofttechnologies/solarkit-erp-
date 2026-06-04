import BuyLeadSetting from '../../models/marketing/BuyLeadSetting.js';
import BuyLeadSettingLead from '../../models/marketing/BuyLeadSettingLead.js';

// Get all lead settings
export const getAllSettings = async (req, res) => {
    try {
        const settings = await BuyLeadSetting.find().sort({ createdAt: -1 });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new lead setting
export const createSetting = async (req, res) => {
    try {
        const newSetting = new BuyLeadSetting(req.body);
        const savedSetting = await newSetting.save();
        res.status(201).json(savedSetting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a lead setting
export const updateSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSetting = await BuyLeadSetting.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedSetting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.status(200).json(updatedSetting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a lead setting
export const deleteSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSetting = await BuyLeadSetting.findByIdAndDelete(id);

        if (!deletedSetting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        // Also delete associated leads
        await BuyLeadSettingLead.deleteMany({ settingId: id });

        res.status(200).json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add leads to a setting
export const addLeads = async (req, res) => {
    try {
        const { settingId, leads } = req.body;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ message: 'No leads provided' });
        }

        const leadDocs = leads.map(lead => ({
            ...lead,
            settingId
        }));

        await BuyLeadSettingLead.insertMany(leadDocs);

        // Update the setting status and count
        const setting = await BuyLeadSetting.findById(settingId);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        const totalLeads = await BuyLeadSettingLead.countDocuments({ settingId });
        
        setting.currentLeadsCount = totalLeads;
        if (totalLeads > 0) {
            setting.status = 'active';
        } else {
            setting.status = 'inactive';
        }

        await setting.save();

        res.status(200).json({ 
            message: 'Leads added successfully',
            setting
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get leads for a specific setting
export const getLeadsBySetting = async (req, res) => {
    try {
        const { id } = req.params;
        const leads = await BuyLeadSettingLead.find({ settingId: id }).sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
