import Kilowatt from '../../models/projects/Kilowatt.js';

export const getAll = async (req, res) => {
    try {
        const items = await Kilowatt.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const item = new Kilowatt({
            ...req.body,
            createdBy: req.user?.id
        });
        await item.save();
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const item = await Kilowatt.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await Kilowatt.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
