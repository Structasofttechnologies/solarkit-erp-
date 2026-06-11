import Category from '../../models/inventory/Category.js';
import Brand from '../../models/inventory/Brand.js';
import Department from '../../models/hr/Department.js';
import Designation from '../../models/hr/Designation.js';
import Role from '../../models/users/Role.js';
import Permission from '../../models/users/Permission.js';

// Helper for standard CRUD
const createMasterHandler = (Model, name) => ({
    getAll: async (req, res, next) => {
        try {
            const { isActive, ...filters } = req.query;
            let query = filters || {};
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }
            const items = await Model.find(query).sort({ name: 1 });
            res.json({ success: true, count: items.length, data: items });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const item = await Model.findById(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
            res.json({ success: true, data: item });
        } catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            const item = await Model.create({ ...req.body, createdBy: req.user?.id });
            res.status(201).json({ success: true, message: `${name} created successfully`, data: item });
        } catch (err) {
            next(err);
        }
    },
    update: async (req, res, next) => {
        try {
            const item = await Model.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedBy: req.user?.id },
                { new: true, runValidators: true }
            );
            if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
            res.json({ success: true, message: `${name} updated successfully`, data: item });
        } catch (err) {
            next(err);
        }
    },
    delete: async (req, res, next) => {
        try {
            const item = await Model.findByIdAndDelete(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
            res.json({ success: true, message: `${name} deleted successfully` });
        } catch (err) {
            next(err);
        }
    }
});

export const CATEGORY = createMasterHandler(Category, 'Category');
export const BRAND = createMasterHandler(Brand, 'Brand');
export const DEPARTMENT = createMasterHandler(Department, 'Department');
export const DESIGNATION = createMasterHandler(Designation, 'Designation');
export const ROLE = createMasterHandler(Role, 'Role');
export const PERMISSION = createMasterHandler(Permission, 'Permission');

// Custom handlers for specific logic (e.g. fetching designations by department)
export const getDesignationsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const designations = await Designation.find({ department: departmentId }).sort({ level: 1 });
        res.json({ success: true, count: designations.length, data: designations });
    } catch (err) {
        next(err);
    }
};
