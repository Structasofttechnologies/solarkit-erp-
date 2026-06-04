import ProjectType from '../../models/projects/ProjectType.js';

export const getAllProjectTypes = async (req, res, next) => {
    try {
        const { status, subCategoryId } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (subCategoryId) query.subCategoryId = subCategoryId;

        const types = await ProjectType.find(query).populate('subCategoryId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, count: types.length, data: types });
    } catch (err) {
        next(err);
    }
};

export const createProjectType = async (req, res, next) => {
    try {
        const { name, subCategoryId } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const type = await ProjectType.create({
            name,
            subCategoryId: subCategoryId || null,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Project Type created successfully', data: type });
    } catch (err) {
        next(err);
    }
};

export const updateProjectType = async (req, res, next) => {
    try {
        const { name, status, subCategoryId } = req.body;

        const type = await ProjectType.findByIdAndUpdate(
            req.params.id,
            { name, status, subCategoryId: subCategoryId || null, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        ).populate('subCategoryId', 'name');

        if (!type) return res.status(404).json({ success: false, message: 'Project Type not found' });

        res.json({ success: true, message: 'Project Type updated successfully', data: type });
    } catch (err) {
        next(err);
    }
};

export const deleteProjectType = async (req, res, next) => {
    try {
        const type = await ProjectType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ success: false, message: 'Project Type not found' });
        res.json({ success: true, message: 'Project Type deleted successfully' });
    } catch (err) {
        next(err);
    }
}
