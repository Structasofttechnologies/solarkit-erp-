import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects`;

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };
};

export const getProjects = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await axios.get(`${API_URL}?${query}`, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getProjectStats = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await axios.get(`${API_URL}/stats?${query}`, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createProject = async (data) => {
    try {
        const response = await axios.post(API_URL, data, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateProject = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteProject = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getProjectById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
