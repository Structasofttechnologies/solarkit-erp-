import axios from 'axios';

// Get backend URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// API Configuration helper
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const disputeApi = {
    // Get all disputes with optional filters
    getDisputes: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);

            const response = await axios.get(`${API_URL}/api/disputes?${params.toString()}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error fetching disputes:', error);
            throw error.response?.data || error;
        }
    },

    // Create a new dispute
    createDispute: async (disputeData) => {
        try {
            const response = await axios.post(`${API_URL}/api/disputes`, disputeData, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error creating dispute:', error);
            throw error.response?.data || error;
        }
    },

    // Update dispute (e.g., status, assignTo, adding note)
    updateDispute: async (id, updateData) => {
        try {
            const response = await axios.put(`${API_URL}/api/disputes/${id}`, updateData, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error updating dispute:', error);
            throw error.response?.data || error;
        }
    }
};
