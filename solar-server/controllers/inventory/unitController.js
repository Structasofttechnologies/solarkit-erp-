import Unit from '../../models/inventory/Unit.js';

export const getAllUnits = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';

        const units = await Unit.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: units.length, data: units });
    } catch (err) {
        next(err);
    }
};

export const createUnit = async (req, res, next) => {
    try {
        const { unitName, symbol, unitType, description } = req.body;
        if (!unitName || !symbol || !unitType) return res.status(400).json({ success: false, message: 'Name, Symbol, and Unit Type are required' });

        const unit = await Unit.create({
            unitName,
            symbol,
            unitType,
            description,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Unit created successfully', data: unit });
    } catch (err) {
        next(err);
    }
};

export const updateUnit = async (req, res, next) => {
    try {
        const { unitName, symbol, unitType, description, status } = req.body;

        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            { unitName, symbol, unitType, description, status, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );

        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

        res.json({ success: true, message: 'Unit updated successfully', data: unit });
    } catch (err) {
        next(err);
    }
};

export const deleteUnit = async (req, res, next) => {
    try {
        const unit = await Unit.findByIdAndDelete(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
        res.json({ success: true, message: 'Unit deleted successfully' });
    } catch (err) {
        next(err);
    }
}
