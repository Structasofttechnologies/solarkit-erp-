import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Leads ---
export const getCompanyLeadsSummary = async () => {
    const response = await axios.get(`${API_URL}/dealer-manager/leads/company-summary`, getAuthHeader());
    return response.data;
};

export const getLeads = async (params = {}) => {
    const response = await axios.get(`${API_URL}/dealer-manager/leads`, { ...getAuthHeader(), params });
    return response.data;
};

export const createLead = async (data) => {
    const response = await axios.post(`${API_URL}/dealer-manager/leads`, data, getAuthHeader());
    return response.data;
};

export const updateLead = async (id, data) => {
    const response = await axios.put(`${API_URL}/dealer-manager/leads/${id}`, data, getAuthHeader());
    return response.data;
};

export const deleteLead = async (id) => {
    const response = await axios.delete(`${API_URL}/dealer-manager/leads/${id}`, getAuthHeader());
    return response.data;
};

export const convertLeadToDealer = async (id) => {
    const response = await axios.post(`${API_URL}/dealer-manager/leads/${id}/convert`, {}, getAuthHeader());
    return response.data;
};

// --- Follow-ups ---
export const getFollowUps = async () => {
    const response = await axios.get(`${API_URL}/dealer-manager/follow-ups`, getAuthHeader());
    return response.data;
};

export const scheduleFollowUp = async (data) => {
    const response = await axios.post(`${API_URL}/dealer-manager/follow-ups`, data, getAuthHeader());
    return response.data;
};

// --- App Demos ---
export const getAppDemoLeads = async () => {
    const response = await axios.get(`${API_URL}/dealer-manager/app-demos`, getAuthHeader());
    return response.data;
};

export const scheduleAppDemo = async (data) => {
    const response = await axios.post(`${API_URL}/dealer-manager/app-demos`, data, getAuthHeader());
    return response.data;
};

export const createAppDemoLead = async (data) => {
    // Specifically creating a lead for the app demo section
    const response = await axios.post(`${API_URL}/dealer-manager/leads`, { ...data, sourceOfMedia: 'applead' }, getAuthHeader());
    return response.data;
};

// --- Dealer KYC ---
export const getDealerKYCLists = async (params = {}) => {
    const response = await axios.get(`${API_URL}/dealer-manager/dealer-kyc`, { ...getAuthHeader(), params });
    return response.data;
};

export const updateDealerKYC = async (dealerId, data) => {
    const response = await axios.put(`${API_URL}/dealer-manager/dealer-kyc/${dealerId}`, data, getAuthHeader());
    return response.data;
};
