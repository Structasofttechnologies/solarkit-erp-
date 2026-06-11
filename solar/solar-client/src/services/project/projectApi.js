import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/project-settings`;

// Helper to get headers with token
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };
};

export const projectApi = {
    // Journey Stages
    getJourneyStages: async () => {
        const response = await axios.get(`${API_URL}/stages`, getAuthHeaders());
        return response.data;
    },

    createJourneyStage: async (data) => {
        const response = await axios.post(`${API_URL}/stages`, data, getAuthHeaders());
        return response.data;
    },

    updateJourneyStage: async (id, data) => {
        const response = await axios.put(`${API_URL}/stages/${id}`, data, getAuthHeaders());
        return response.data;
    },

    deleteJourneyStage: async (id) => {
        const response = await axios.delete(`${API_URL}/stages/${id}`, getAuthHeaders());
        return response.data;
    },

    updateJourneyStageOrder: async (stages) => {
        const response = await axios.put(`${API_URL}/stages/order`, { stages }, getAuthHeaders());
        return response.data;
    },

    // Overdue Settings
    getOverdueSettings: async () => {
        const response = await axios.get(`${API_URL}/overdue`, getAuthHeaders());
        return response.data;
    },

    saveOverdueSetting: async (data) => {
        const response = await axios.post(`${API_URL}/overdue`, data, getAuthHeaders());
        return response.data;
    },

    // Project Configuration
    getConfigurations: async () => {
        const response = await axios.get(`${API_URL}/config`, getAuthHeaders());
        return response.data;
    },

    getConfigurationByKey: async (key) => {
        const response = await axios.get(`${API_URL}/config/${key}`, getAuthHeaders());
        return response.data;
    },

    saveConfiguration: async (key, value) => {
        const response = await axios.post(`${API_URL}/config`, { configKey: key, configValue: value }, getAuthHeaders());
        return response.data;
    },
    
    deleteConfiguration: async (key) => {
        const response = await axios.delete(`${API_URL}/config/${key}`, getAuthHeaders());
        return response.data;
    },

    // Project Documents
    getProjectDocuments: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const response = await axios.get(`${API_URL}/documents?${query}`, getAuthHeaders());
        return response.data;
    },

    createProjectDocument: async (data) => {
        const response = await axios.post(`${API_URL}/documents`, data, getAuthHeaders());
        return response.data;
    },

    updateProjectDocument: async (id, data) => {
        const response = await axios.put(`${API_URL}/documents/${id}`, data, getAuthHeaders());
        return response.data;
    },

    deleteProjectDocument: async (id) => {
        const response = await axios.delete(`${API_URL}/documents/${id}`, getAuthHeaders());
        return response.data;
    },

    // Placeholder Names
    getPlaceholders: async () => {
        const response = await axios.get(`${API_URL}/placeholders`, getAuthHeaders());
        return response.data;
    },

    savePlaceholder: async (data) => {
        const response = await axios.post(`${API_URL}/placeholders`, data, getAuthHeaders());
        return response.data;
    },

    deletePlaceholder: async (id) => {
        const response = await axios.delete(`${API_URL}/placeholders/${id}`, getAuthHeaders());
        return response.data;
    },

    deletePlaceholderByKey: async (key) => {
        const response = await axios.delete(`${API_URL}/placeholders/key/${key}`, getAuthHeaders());
        return response.data;
    }
};
