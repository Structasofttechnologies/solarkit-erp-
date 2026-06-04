import SubProjectType from '../../models/projects/SubProjectType.js';

export const getAllSubProjectTypes = async (req, res, next) => {
    try {
        const { projectTypeId, status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (projectTypeId) query.projectTypeId = projectTypeId;

        const subProjectTypes = await SubProjectType.find(query).populate('projectTypeId').sort({ createdAt: -1 });
        res.json({ success: true, count: subProjectTypes.length, data: subProjectTypes });
    } catch (err) {
        next(err);
    }
};

export const createSubProjectType = async (req, res, next) => {
    try {
        const { name, projectTypeId, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const subProjectType = await SubProjectType.create({
            name,
            projectTypeId,
            description,
            createdBy: req.user?.id || req.user?.id
        });

        await subProjectType.populate('projectTypeId');

        res.status(201).json({ success: true, message: 'Sub Project Type created successfully', data: subProjectType });
    } catch (err) {
        next(err);
    }
};

export const updateSubProjectType = async (req, res, next) => {
    try {
        const { name, projectTypeId, description, status } = req.body;

        const subProjectType = await SubProjectType.findByIdAndUpdate(
            req.params.id,
            { name, projectTypeId, description, status, updatedBy: req.user?.id || req.user?.id },
            { new: true, runValidators: true }
        );

        if (!subProjectType) return res.status(404).json({ success: false, message: 'Sub Project Type not found' });
        await subProjectType.populate('projectTypeId');

        res.json({ success: true, message: 'Sub Project Type updated successfully', data: subProjectType });
    } catch (err) {
        next(err);
    }
};

export const deleteSubProjectType = async (req, res, next) => {
    try {
        const subProjectType = await SubProjectType.findByIdAndDelete(req.params.id);
        if (!subProjectType) return res.status(404).json({ success: false, message: 'Sub Project Type not found' });
        res.json({ success: true, message: 'Sub Project Type deleted successfully' });
    } catch (err) {
        next(err);
    }
};
