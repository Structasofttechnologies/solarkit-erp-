import Category from '../../models/inventory/Category.js';

export const getAllCategories = async (req, res, next) => {
    try {
        const { projectTypeId, status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (projectTypeId) query.projectTypeId = projectTypeId;

        const categories = await Category.find(query).populate('projectTypeId').sort({ createdAt: -1 });
        res.json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        next(err);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { name, projectTypeId, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const category = await Category.create({
            name,
            projectTypeId,
            description,
            createdBy: req.user?.id
        });

        await category.populate('projectTypeId');

        res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { name, projectTypeId, description, status } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, projectTypeId, description, status, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );

        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        await category.populate('projectTypeId');

        res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        next(err);
    }
}
