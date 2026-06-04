import SubCategory from '../../models/inventory/SubCategory.js';

export const getAllSubCategories = async (req, res, next) => {
    try {
        const { projectTypeId, categoryId, status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (projectTypeId) query.projectTypeId = projectTypeId;
        if (categoryId) query.categoryId = categoryId;

        const subCategories = await SubCategory.find(query).populate('projectTypeId').populate('categoryId').sort({ createdAt: -1 });
        res.json({ success: true, count: subCategories.length, data: subCategories });
    } catch (err) {
        next(err);
    }
};

export const createSubCategory = async (req, res, next) => {
    try {
        const { name, projectTypeId, categoryId, description } = req.body;
        if (!name || !categoryId) return res.status(400).json({ success: false, message: 'Name and Category are required' });

        const subCategory = await SubCategory.create({
            name,
            projectTypeId,
            categoryId,
            description,
            createdBy: req.user?.id || req.user?.id
        });

        await subCategory.populate(['projectTypeId', 'categoryId']);

        res.status(201).json({ success: true, message: 'Sub Category created successfully', data: subCategory });
    } catch (err) {
        next(err);
    }
};

export const updateSubCategory = async (req, res, next) => {
    try {
        const { name, projectTypeId, categoryId, description, status } = req.body;

        const subCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { name, projectTypeId, categoryId, description, status, updatedBy: req.user?.id || req.user?.id },
            { new: true, runValidators: true }
        );

        if (!subCategory) return res.status(404).json({ success: false, message: 'Sub Category not found' });
        await subCategory.populate(['projectTypeId', 'categoryId']);

        res.json({ success: true, message: 'Sub Category updated successfully', data: subCategory });
    } catch (err) {
        next(err);
    }
};

export const deleteSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subCategory) return res.status(404).json({ success: false, message: 'Sub Category not found' });
        res.json({ success: true, message: 'Sub Category deleted successfully' });
    } catch (err) {
        next(err);
    }
};
