import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/brand`;

// --- Manufacturer API ---

export const createManufacturer = async (data) => {
    const response = await axios.post(`${API_URL}/manufacturer`, data);
    return response.data;
};

export const getAllManufacturers = async (filters = {}) => {
    // Construct query string from filters
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.company) params.append('company', filters.company);
    if (filters.product) params.append('product', filters.product);

    const response = await axios.get(`${API_URL}/manufacturer`, { params });
    return response.data.data || response.data;
};

export const updateManufacturer = async (id, data) => {
    const response = await axios.put(`${API_URL}/manufacturer/${id}`, data);
    return response.data;
};

export const deleteManufacturer = async (id) => {
    const response = await axios.delete(`${API_URL}/manufacturer/${id}`);
    return response.data;
};

// --- Supplier API ---

export const createSupplier = async (data) => {
    const response = await axios.post(`${API_URL}/supplier`, data);
    return response.data;
};

export const getAllSuppliers = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.manufacturerId) params.append('manufacturerId', filters.manufacturerId);
    // Add other filters if backend supports them directly, otherwise frontend filters.

    const response = await axios.get(`${API_URL}/supplier`, { params });
    return response.data.data || response.data;
};

export const updateSupplier = async (id, data) => {
    const response = await axios.put(`${API_URL}/supplier/${id}`, data);
    return response.data;
};

export const deleteSupplier = async (id) => {
    const response = await axios.delete(`${API_URL}/supplier/${id}`);
    return response.data;
};
