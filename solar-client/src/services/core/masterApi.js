import api from '../../api/axios';

// ===================== DEPARTMENTS =====================
export const getDepartments = async (params) => {
    try {
        const res = await api.get('/masters/departments', { params });
        return res.data; 
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createDepartment = async (data) => {
    try {
        const res = await api.post('/masters/departments', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateDepartment = async (id, data) => {
    try {
        const res = await api.put(`/masters/departments/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteDepartment = async (id) => {
    try {
        const res = await api.delete(`/masters/departments/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// ===================== DESIGNATIONS =====================
export const getDesignations = async () => {
    try {
        const res = await api.get('/masters/designations');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getDesignationsByDepartment = async (departmentId) => {
    try {
        const res = await api.get(`/masters/departments/${departmentId}/designations`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// ===================== ROLES =====================
export const getRoles = async () => {
    try {
        const res = await api.get('/masters/roles');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createRole = async (data) => {
    try {
        const res = await api.post('/masters/roles', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateRole = async (id, data) => {
    try {
        const res = await api.put(`/masters/roles/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteRole = async (id) => {
    try {
        const res = await api.delete(`/masters/roles/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// ===================== OTHERS =====================
export const getProjectTypes = async () => {
    try {
        const res = await api.get('/masters/project-types');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getCategories = async () => {
    try {
        const res = await api.get('/masters/categories');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSubCategories = async (params) => {
    try {
        const res = await api.get('/masters/sub-categories', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSubProjectTypes = async (params) => {
    try {
        const res = await api.get('/masters/sub-project-types', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getUnits = async () => {
    try {
        const res = await api.get('/masters/units');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSKUs = async () => {
    try {
        const res = await api.get('/masters/skus');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getProjectCategoryMappings = async (params) => {
    try {
        const res = await api.get('/masters/project-category-mappings', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getUsersByRole = async (role) => {
    try {
        const res = await api.get('/users', { params: { role } });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getPartnerPlans = async () => {
    try {
        const res = await api.get('/partner-settings/plans');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getPartnerTypes = async () => {
    try {
        const res = await api.get('/partner-settings/types');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
