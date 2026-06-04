import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token if needed
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const getDepartments = async () => {
    const response = await api.get('/department-modules/departments');
    return response.data; // { success: true, departments: [] }
};

export const getModules = async () => {
    const response = await api.get('/department-modules/modules');
    return response.data; // { success: true, modules: [] }
};

export const getDepartmentModules = async (departmentId, level = '') => {
    let url = `/department-modules/department-modules/${departmentId}`;
    if (level) {
        url += `?level=${level}`;
    }
    const response = await api.get(url);
    return response.data; // { success: true, accessList: [] }
};

export const saveDepartmentModules = async (data) => {
    const response = await api.post('/department-modules/department-modules/save', data);
    return response.data; // { success: true, message: '' }
};

export const getDepartmentStats = async (departmentId) => {
    const response = await api.get(`/department-modules/department-modules/stats/${departmentId}`);
    return response.data; // { success: true, stats: {} }
};

export const getAllDepartmentStats = async () => {
    const response = await api.get(`/department-modules/department-modules/stats/all`);
    return response.data; // { success: true, stats: { deptId: { country: N, ... } } }
};

export const deleteDepartmentModule = async (mappingId) => {
    const response = await api.delete(`/department-modules/department-modules/mapping/${mappingId}`);
    return response.data;
};
