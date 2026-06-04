import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/delivery-settings`;

// Delivery Types
export const getDeliveryTypes = async (params = {}) => {
    const response = await axios.get(`${API_URL}/types`, { params });
    return response.data;
};

export const createDeliveryType = async (data) => {
    const response = await axios.post(`${API_URL}/types`, data);
    return response.data;
};

export const updateDeliveryType = async (id, data) => {
    const response = await axios.put(`${API_URL}/types/${id}`, data);
    return response.data;
};

export const deleteDeliveryType = async (id) => {
    const response = await axios.delete(`${API_URL}/types/${id}`);
    return response.data;
};

export const deleteApplicableCategory = async (id, categoryId) => {
    const response = await axios.delete(`${API_URL}/types/${id}/categories/${categoryId}`);
    return response.data;
};

export const addApplicableCategory = async (id, data) => {
    const response = await axios.post(`${API_URL}/types/${id}/categories`, data);
    return response.data;
};

export const updateApplicableCategory = async (id, categoryId, data) => {
    const response = await axios.put(`${API_URL}/types/${id}/categories/${categoryId}`, data);
    return response.data;
};

// Benchmark Prices
export const getBenchmarkPrices = async (params = {}) => {
    const response = await axios.get(`${API_URL}/benchmark-prices`, { params });
    return response.data;
};

export const createBenchmarkPrice = async (data) => {
    const response = await axios.post(`${API_URL}/benchmark-prices`, data);
    return response.data;
};

export const updateBenchmarkPrice = async (id, data) => {
    const response = await axios.put(`${API_URL}/benchmark-prices/${id}`, data);
    return response.data;
};

export const deleteBenchmarkPrice = async (id) => {
    const response = await axios.delete(`${API_URL}/benchmark-prices/${id}`);
    return response.data;
};

// Vehicles
export const getVehicles = async (params = {}) => {
    const response = await axios.get(`${API_URL}/vehicles`, { params });
    return response.data;
};

export const createVehicle = async (data) => {
    const response = await axios.post(`${API_URL}/vehicles`, data);
    return response.data;
};

export const updateVehicle = async (id, data) => {
    const response = await axios.put(`${API_URL}/vehicles/${id}`, data);
    return response.data;
};

export const deleteVehicle = async (id) => {
    const response = await axios.delete(`${API_URL}/vehicles/${id}`);
    return response.data;
};

// Vendor Delivery Config
export const getVendorDeliveryConfig = async () => {
    const response = await axios.get(`${API_URL}/vendor-config`);
    return response.data;
};

export const upsertVendorDeliveryConfig = async (data) => {
    const response = await axios.post(`${API_URL}/vendor-config`, data);
    return response.data;
};

// Vendor Delivery Plans
export const getVendorDeliveryPlans = async () => {
    const response = await axios.get(`${API_URL}/vendor-plans`);
    return response.data;
};

export const createVendorDeliveryPlan = async (data) => {
    const response = await axios.post(`${API_URL}/vendor-plans`, data);
    return response.data;
};

export const updateVendorDeliveryPlan = async (id, data) => {
    const response = await axios.put(`${API_URL}/vendor-plans/${id}`, data);
    return response.data;
};

export const deleteVendorDeliveryPlan = async (id) => {
    const response = await axios.delete(`${API_URL}/vendor-plans/${id}`);
    return response.data;
};
