import Department from '../../models/hr/Department.js';
import Module from '../../models/hr/Module.js';
import DepartmentModuleAccess from '../../models/hr/DepartmentModuleAccess.js';

// Get all departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select('name _id').sort({ name: 1 });
        res.status(200).json({ success: true, departments });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all modules
export const getModules = async (req, res) => {
    try {
        const modules = await Module.find({ isActive: true }).select('name key defaultLevel _id').sort({ name: 1 });
        res.status(200).json({ success: true, modules });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get module access for a department
export const getDepartmentModules = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { level } = req.query;

        let query = { departmentId };
        if (level) {
            query.accessLevel = level.toLowerCase();
        }

        const accessList = await DepartmentModuleAccess.find(query).populate('moduleId', 'name key defaultLevel description');
        res.status(200).json({ success: true, accessList });
    } catch (error) {
        console.error('Error fetching department modules:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Save or Update module access
export const saveDepartmentModules = async (req, res) => {
    try {
        const { departmentId, mappings } = req.body; // mappings = [{ moduleId, moduleKey, moduleName, moduleCategory, accessLevel, enabled }]

        if (!departmentId || !Array.isArray(mappings)) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const operations = [];

        for (const mapping of mappings) {
            let moduleId = mapping.moduleId;

            // Dynamic Find-or-Create Module based on sidebar config
            if (!moduleId && mapping.moduleKey) {
                let existingModule = await Module.findOne({ key: mapping.moduleKey });
                if (!existingModule) {
                    try {
                        existingModule = await Module.create({
                            name: mapping.moduleName || mapping.moduleKey,
                            key: mapping.moduleKey,
                            description: mapping.moduleCategory || '', // storing outer module here temporarily
                            isActive: true,
                            status: 'active'
                        });
                    } catch (error) {
                        // Handle race condition where another concurrent request creates it
                        if (error.code === 11000) {
                            existingModule = await Module.findOne({ key: mapping.moduleKey });
                            if (!existingModule) {
                                // Sometimes it's the name that crashed it but key was different
                                existingModule = await Module.findOne({ name: mapping.moduleName || mapping.moduleKey });
                            }
                        } else {
                            throw error;
                        }
                    }
                }
                moduleId = existingModule._id.toString();
            }

            if (!moduleId) continue;

            operations.push({
                updateOne: {
                    filter: { departmentId, moduleId: moduleId },
                    update: {
                        $set: {
                            accessLevel: mapping.accessLevel,
                            enabled: mapping.enabled,
                            updatedBy: req.user?.id
                        },
                        $setOnInsert: {
                            departmentId,
                            moduleId: moduleId,
                            createdBy: req.user?.id
                        }
                    },
                    upsert: true
                }
            });
        }

        if (operations.length > 0) {
            await DepartmentModuleAccess.bulkWrite(operations);
        }

        res.status(200).json({ success: true, message: 'Department modules updated successfully' });
    } catch (error) {
        console.error('Error saving department modules:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get stats for a department
export const getDepartmentStats = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const totalEnabled = await DepartmentModuleAccess.countDocuments({ departmentId, enabled: true });
        res.status(200).json({ success: true, stats: { totalEnabled } });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// Get stats for all departments
export const getAllDepartmentStats = async (req, res) => {
    try {
        const stats = await DepartmentModuleAccess.aggregate([
            { $match: { enabled: true } },
            {
                $group: {
                    _id: { departmentId: "$departmentId", accessLevel: "$accessLevel" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.departmentId",
                    levels: {
                        $push: {
                            level: "$_id.accessLevel",
                            count: "$count"
                        }
                    }
                }
            }
        ]);

        // Format into a more friendly map: { departmentId: { country: 0, state: 0, cluster: 0, district: 0 } }
        const formattedStats = {};
        stats.forEach(deptStat => {
            formattedStats[deptStat._id] = { country: 0, state: 0, cluster: 0, district: 0 };
            deptStat.levels.forEach(lv => {
                if (formattedStats[deptStat._id][lv.level] !== undefined) {
                    formattedStats[deptStat._id][lv.level] = lv.count;
                }
            });
        });

        res.status(200).json({ success: true, stats: formattedStats });
    } catch (error) {
        console.error('Error fetching all stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a module access mapping
export const deleteDepartmentModule = async (req, res) => {
    try {
        const { mappingId } = req.params;
        const result = await DepartmentModuleAccess.findByIdAndDelete(mappingId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Module mapping not found' });
        }

        res.status(200).json({ success: true, message: 'Module removed successfully' });
    } catch (error) {
        console.error('Error deleting mapping:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
