import ProjectCategoryMapping from '../../models/projects/ProjectCategoryMapping.js';

export const getAllMappings = async (req, res, next) => {
    try {
        const { stateId, clusterId, categoryId, status } = req.query;
        const query = {};

        if (status !== undefined) query.status = status === 'true';
        if (stateId) query.stateId = stateId;
        if (clusterId) query.clusterId = clusterId;
        if (categoryId) query.categoryId = categoryId;

        const mappings = await ProjectCategoryMapping.find(query)
            .populate('stateId')
            .populate('clusterId')
            .populate('categoryId')
            .populate('subCategoryId')
            .populate('subProjectTypeId')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: mappings.length, data: mappings });
    } catch (err) {
        next(err);
    }
};

export const createMapping = async (req, res, next) => {
    try {
        const { stateId, clusterIds, categoryId, subCategoryId, projectTypeFrom, projectTypeTo, subProjectTypeId, deliveryCharges } = req.body;

        if (!stateId || !clusterIds || !Array.isArray(clusterIds) || clusterIds.length === 0 || !categoryId || !subCategoryId || projectTypeFrom === undefined || projectTypeTo === undefined) {
            return res.status(400).json({ success: false, message: 'All required mapping fields must be provided, and clusters must be an array.' });
        }

        const mappingsToCreate = clusterIds.map(clusterId => ({
            stateId,
            clusterId,
            categoryId,
            subCategoryId,
            projectTypeFrom,
            projectTypeTo,
            subProjectTypeId,
            deliveryCharges: Number(deliveryCharges) || 0,
            createdBy: req.user?.id
        }));

        const result = await ProjectCategoryMapping.insertMany(mappingsToCreate, { ordered: false });

        res.status(201).json({
            success: true,
            message: `${result.length} Project Category Mappings created successfully`,
            data: result
        });
    } catch (err) {
        if (err.code === 11000) {
            const createdCount = err.insertedDocs ? err.insertedDocs.length : 0;
            return res.status(200).json({
                success: true,
                message: createdCount > 0 ? `${createdCount} mappings created successfully. Some duplicates were skipped.` : 'A mapping with these exact parameters already exists in the selected clusters.',
                data: err.insertedDocs || []
            });
        }
        next(err);
    }
};

export const updateMapping = async (req, res, next) => {
    try {
        const { stateId, clusterId, categoryId, subCategoryId, projectTypeFrom, projectTypeTo, subProjectTypeId, status, deliveryCharges } = req.body;

        const mapping = await ProjectCategoryMapping.findByIdAndUpdate(
            req.params.id,
            {
                stateId,
                clusterId,
                categoryId,
                subCategoryId,
                projectTypeFrom,
                projectTypeTo,
                subProjectTypeId,
                status,
                deliveryCharges: Number(deliveryCharges) || 0,
                updatedBy: req.user?.id
            },
            { new: true, runValidators: true }
        ).populate('stateId clusterId categoryId subCategoryId subProjectTypeId');

        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

        res.json({ success: true, message: 'Mapping updated successfully', data: mapping });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'A mapping with these exact parameters already exists in this cluster.' });
        }
        next(err);
    }
};

export const deleteMapping = async (req, res, next) => {
    try {
        const mapping = await ProjectCategoryMapping.findByIdAndDelete(req.params.id);
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });
        res.json({ success: true, message: 'Mapping deleted successfully' });
    } catch (err) {
        next(err);
    }
};
