import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects`;

export const getAllProjects = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        // Add filters to query params
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== 'all') {
                queryParams.append(key, filters[key]);
            }
        });

        const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export const getProjectStats = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) queryParams.append(key, filters[key]);
        });

        const response = await axios.get(`${API_URL}/stats?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project stats:', error);
        throw error;
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await axios.post(API_URL, projectData);
        return response.data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const updateProject = async (id, projectData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, projectData);
        return response.data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

export const deleteProject = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

export const getProjectById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project by id:', error);
        throw error;
    }
};
