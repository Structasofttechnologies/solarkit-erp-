import FranchiseeProfessionType from '../../models/franchisee/FranchiseeProfessionType.js';

// Create a profession type
export const createProfession = async (req, res) => {
    try {
        const profession = new FranchiseeProfessionType(req.body);
        await profession.save();
        res.status(201).json(profession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all professions (filter by state)
export const getProfessions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }
        const professions = await FranchiseeProfessionType.find(filter).populate('state', 'name code');
        res.status(200).json(professions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a profession
export const updateProfession = async (req, res) => {
    try {
        const profession = await FranchiseeProfessionType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!profession) return res.status(404).json({ message: 'Profession not found' });
        res.status(200).json(profession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a profession
export const deleteProfession = async (req, res) => {
    try {
        const profession = await FranchiseeProfessionType.findByIdAndDelete(req.params.id);
        if (!profession) return res.status(404).json({ message: 'Profession not found' });
        res.status(200).json({ message: 'Profession deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
