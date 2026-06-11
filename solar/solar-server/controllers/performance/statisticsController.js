import Statistics from '../../models/admin/Statistics.js';

export const getStatistics = async (req, res) => {
    try {
        const stats = await Statistics.find(req.query).populate('user', 'name role');
        res.status(200).json({ success: true, count: stats.length, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await Statistics.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!stats) return res.status(404).json({ success: false, message: 'Statistics not found' });
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createStatistics = async (req, res) => {
    try {
        const stats = await Statistics.create(req.body);
        res.status(201).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
