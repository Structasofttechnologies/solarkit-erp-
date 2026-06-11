import api from '../../api/axios';

// Get all settings
export const getAllOrderProcurementSettings = async () => {
    try {
        const res = await api.get('/settings/order-procurement');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get single setting
export const getOrderProcurementSettingById = async (id) => {
    try {
        const res = await api.get(`/settings/order-procurement/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Create setting
export const createOrderProcurementSetting = async (settingData) => {
    try {
        const res = await api.post('/settings/order-procurement', settingData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Update setting
export const updateOrderProcurementSetting = async (id, settingData) => {
    try {
        const res = await api.put(`/settings/order-procurement/${id}`, settingData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Delete setting
export const deleteOrderProcurementSetting = async (id) => {
    try {
        const res = await api.delete(`/settings/order-procurement/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// --- Helper Data Fetchers for Dropdowns ---
// Reusing some existing endpoints from other modules or assuming standard ones

export const getCategories = async () => {
    try {
        const res = await api.get('/masters/categories');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSubCategories = async (categoryId) => {
    try {
        const url = categoryId ? `/masters/sub-categories?categoryId=${categoryId}` : '/masters/sub-categories';
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getProjectTypes = async () => {
    try {
        const res = await api.get('/masters/project-types');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSubProjectTypes = async (projectTypeId) => {
    try {
        const url = projectTypeId ? `/masters/sub-project-types?projectTypeId=${projectTypeId}` : '/masters/sub-project-types';
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getProducts = async () => {
    try {
        const res = await api.get('/products');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getBrands = async () => {
    try {
        const res = await api.get('/brand/manufacturer');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getSkus = async (params) => {
    try {
        const res = await api.get('/masters/skus', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getComboKits = async () => {
    try {
        const res = await api.get('/combokit/assignments');
        // Handle both raw array and { success: true, data: [] } formats
        const assignments = Array.isArray(res.data) ? res.data : (res.data.data || []);

        return assignments.map(item => {
            // Priority: solarkitName -> First Kit Name -> Unnamed
            let name = item.solarkitName;
            if (!name || name === "Solarkit Name" || name === "0 ComboKits") {
                if (item.comboKits && item.comboKits.length > 0) {
                    name = item.comboKits[0].name || item.solarkitName;
                }
            }
            if (!name || name === "Solarkit Name" || name === "0 ComboKits") {
                name = 'Custom Assignment';
            }

            // Add location and project type info to name for better identification
            const stateName = item.state?.name || (item.state && typeof item.state === 'object' ? item.state.name : '');
            const pt = item.projectType || '';
            const displayName = `${name}${pt ? ` [${pt}]` : ''}${stateName ? ` (${stateName})` : ''}`;

            return {
                ...item,
                name: displayName
            };
        });
    } catch (err) {
        console.error("Error in getComboKits API:", err);
        throw err.response?.data || err.message;
    }
};

export const getSupplierTypes = async () => {
    try {
        const res = await api.get('/supplier-types');
        return res.data;
    } catch (err) {
        console.error("Error fetching supplier types from /supplier-types:", err);
        throw err.response?.data || err.message;
    }
};

export const getModules = async () => {
    try {
        const res = await api.get('/modules');
        return res.data;
    } catch (err) {
        console.error("Error fetching modules from /modules:", err);
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
