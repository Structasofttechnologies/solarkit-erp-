import SolarKit from '../../models/inventory/SolarKit.js';

// @desc    Get all solar kits
// @route   GET /api/solar-kits
// @access  Public (or Private depending on requirements, usually dealers need to see them)
export const getAllSolarKits = async (req, res) => {
    try {
        const { category, type, status, subCategory, kwRange } = req.query;
        let query = {};

        if (category && category !== 'All') query.category = category;
        if (type && type !== 'All') query.type = type;
        if (status && status !== 'All') query.status = status;
        if (subCategory && subCategory !== 'All') query.subCategory = subCategory;
        if (kwRange && kwRange !== 'All') query.kw = kwRange;

        const solarKits = await SolarKit.find(query);
        res.status(200).json(solarKits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single solar kit
// @route   GET /api/solar-kits/:id
// @access  Public
export const getSolarKitById = async (req, res) => {
    try {
        const solarKit = await SolarKit.findById(req.params.id);
        if (solarKit) {
            res.status(200).json(solarKit);
        } else {
            res.status(404).json({ message: 'Solar kit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a solar kit
// @route   POST /api/solar-kits
// @access  Private/Admin/Dealer (Assuming dealers can add)
export const createSolarKit = async (req, res) => {
    try {
        const newSolarKit = new SolarKit(req.body);
        const savedSolarKit = await newSolarKit.save();
        res.status(201).json(savedSolarKit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a solar kit
// @route   PUT /api/solar-kits/:id
// @access  Private/Admin/Dealer
export const updateSolarKit = async (req, res) => {
    try {
        const solarKit = await SolarKit.findById(req.params.id);
        if (solarKit) {
            Object.assign(solarKit, req.body);
            const updatedSolarKit = await solarKit.save();
            res.status(200).json(updatedSolarKit);
        } else {
            res.status(404).json({ message: 'Solar kit not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a solar kit
// @route   DELETE /api/solar-kits/:id
// @access  Private/Admin/Dealer
export const deleteSolarKit = async (req, res) => {
    try {
        const solarKit = await SolarKit.findById(req.params.id);
        if (solarKit) {
            await solarKit.deleteOne();
            res.status(200).json({ message: 'Solar kit removed' });
        } else {
            res.status(404).json({ message: 'Solar kit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
