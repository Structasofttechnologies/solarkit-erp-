import api from '../../api/axios';

// Get Dashboard Metrics
export const getDashboardMetrics = async (params) => {
    try {
        const response = await api.get('/vendors/dashboard-metrics', { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Get Orders with Filters
export const getOrders = async (params) => {
    try {
        const response = await api.get('/vendors/orders', { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
// Get Supplier Types
export const getSupplierTypes = async () => {
    try {
        const response = await api.get('/vendors/supplier-types');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Get Supplier Vendors
export const getSupplierVendors = async (params) => {
    try {
        const response = await api.get('/vendors/supplier-vendors', { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
