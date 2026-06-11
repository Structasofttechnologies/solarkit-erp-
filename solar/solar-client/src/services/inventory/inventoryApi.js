import api from '../../api/axios';

const inventoryApi = {
    // Inventory Items
    createItem: (data, config = {}) => api.post('/inventory/items', data, config),
    getItems: (params, config = {}) => {
        // Handle case where silent is passed inside params object (from old code)
        const { silent, ...restParams } = params || {};
        const finalConfig = { ...config, params: restParams };
        if (silent !== undefined) finalConfig.silent = silent;
        return api.get('/inventory/items', finalConfig);
    },
    updateItem: (id, data, config = {}) => api.patch(`/inventory/items/${id}`, data, config),
    deleteItem: (id, config = {}) => api.delete(`/inventory/items/${id}`, config),

    // Summary
    getSummary: (params, config = {}) => {
        const { silent, ...restParams } = params || {};
        const finalConfig = { ...config, params: restParams };
        if (silent !== undefined) finalConfig.silent = silent;
        return api.get('/inventory/summary', finalConfig);
    },

    // Projection
    getProjection: (params, config = {}) => {
        const { silent, ...restParams } = params || {};
        const finalConfig = { ...config, params: restParams };
        if (silent !== undefined) finalConfig.silent = silent;
        return api.get('/inventory/projection', finalConfig);
    },

    // Brands
    createBrand: (data, config = {}) => api.post('/inventory/brands', data, config),
    getBrands: (config = {}) => api.get('/inventory/brands', config),
    getBrandOverview: (params, config = {}) => api.get('/inventory/brand-overview', { params, ...config }),

    // Restock Limits
    getRestockLimits: (params, config = {}) => api.get('/inventory/restock-limits', { params, ...config }),
    setRestockLimit: (data, config = {}) => api.post('/inventory/restock-limits', data, config),

    // Warehouses
    getAllWarehouses: (params, config = {}) => api.get('/inventory/warehouses', { params, ...config }),
    getWarehouseById: (id, config = {}) => api.get(`/inventory/warehouses/${id}`, config),
    createWarehouse: (data, config = {}) => api.post('/inventory/warehouses', data, config),
    updateWarehouse: (id, data, config = {}) => api.patch(`/inventory/warehouses/${id}`, data, config),
    deleteWarehouse: (id, config = {}) => api.delete(`/inventory/warehouses/${id}`, config),

    // Inventory Settings
    getSettings: (config = {}) => api.get('/inventory/settings', config),
    updateSettings: (data, config = {}) => api.put('/inventory/settings', data, config),
};

export default inventoryApi;
