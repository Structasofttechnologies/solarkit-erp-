import axios from 'axios';

const ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${ROOT_URL}/installer`;

// --- Solar Installers ---
export const getSolarInstallers = async (params = {}) => {
    const response = await axios.get(`${API_URL}/installers`, { params });
    return response.data;
};

export const createSolarInstaller = async (data) => {
    const response = await axios.post(`${API_URL}/installers`, data);
    return response.data;
};

export const updateSolarInstaller = async (id, data) => {
    const response = await axios.put(`${API_URL}/installers/${id}`, data);
    return response.data;
};

export const deleteSolarInstaller = async (id) => {
    const response = await axios.delete(`${API_URL}/installers/${id}`);
    return response.data;
};

// --- Installer Tools ---
export const getInstallerTools = async (params = {}) => {
    const response = await axios.get(`${API_URL}/tools`, { params });
    return response.data;
};

export const createInstallerTool = async (data) => {
    const response = await axios.post(`${API_URL}/tools`, data);
    return response.data;
};

export const updateInstallerTool = async (id, data) => {
    const response = await axios.put(`${API_URL}/tools/${id}`, data);
    return response.data;
};

export const deleteInstallerTool = async (id) => {
    const response = await axios.delete(`${API_URL}/tools/${id}`);
    return response.data;
};

// --- Installer Ratings ---
export const getInstallerRatings = async () => {
    const response = await axios.get(`${API_URL}/ratings`);
    return response.data;
};

export const createInstallerRating = async (data) => {
    const response = await axios.post(`${API_URL}/ratings`, data);
    return response.data;
};

export const updateInstallerRating = async (id, data) => {
    const response = await axios.put(`${API_URL}/ratings/${id}`, data);
    return response.data;
};

export const deleteInstallerRating = async (id) => {
    const response = await axios.delete(`${API_URL}/ratings/${id}`);
    return response.data;
};

// --- Installer Agencies ---
export const getInstallerAgencies = async () => {
    const response = await axios.get(`${API_URL}/agencies`);
    return response.data;
};

export const createInstallerAgency = async (data) => {
    const response = await axios.post(`${API_URL}/agencies`, data);
    return response.data;
};

export const updateInstallerAgency = async (id, data) => {
    const response = await axios.put(`${API_URL}/agencies/${id}`, data);
    return response.data;
};

export const deleteInstallerAgency = async (id) => {
    const response = await axios.delete(`${API_URL}/agencies/${id}`);
    return response.data;
};

// ---------------------------------------------------------------------------
// Installer Agency Plan functions
// ---------------------------------------------------------------------------

// Get all installer agency plans (filtered by location hierarchy)
export const getInstallerAgencyPlans = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/agency-plans?${query}` : `${API_URL}/agency-plans`;
    const response = await axios.get(url);
    return response.data;
};

export const createInstallerAgencyPlan = async (data) => {
    const response = await axios.post(`${API_URL}/agency-plans`, data);
    return response.data;
};

export const updateInstallerAgencyPlan = async (id, data) => {
    const response = await axios.put(`${API_URL}/agency-plans/${id}`, data);
    return response.data;
};

export const deleteInstallerAgencyPlan = async (id) => {
    const response = await axios.delete(`${API_URL}/agency-plans/${id}`);
    return response.data;
};

// ---------------------------------------------------------------------------
// Solar Installer Individual Plan functions
// ---------------------------------------------------------------------------

export const getSolarInstallerPlans = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/installer-plans?${query}` : `${API_URL}/installer-plans`;
    const response = await axios.get(url);
    return response.data;
};

export const createSolarInstallerPlan = async (data) => {
    const response = await axios.post(`${API_URL}/installer-plans`, data);
    return response.data;
};

export const updateSolarInstallerPlan = async (id, data) => {
    const response = await axios.put(`${API_URL}/installer-plans/${id}`, data);
    return response.data;
};

export const deleteSolarInstallerPlan = async (id) => {
    const response = await axios.delete(`${API_URL}/installer-plans/${id}`);
    return response.data;
};
