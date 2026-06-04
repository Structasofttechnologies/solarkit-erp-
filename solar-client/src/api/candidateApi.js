import axios from 'axios';
import candidateStore from '../store/candidateStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const candidateApiInstance = axios.create({
    baseURL: `${API_URL}/candidate-portal`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
candidateApiInstance.interceptors.request.use(
    (config) => {
        const candidateToken = candidateStore.getState().candidateToken;
        if (candidateToken) {
            config.headers['Authorization'] = `Bearer ${candidateToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
candidateApiInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Logic to handle token expiry for candidate
            candidateStore.getState().logoutCandidate();
        }
        return Promise.reject(error);
    }
);

export const candidateApi = {
    // Auth
    login: (credentials) => candidateApiInstance.post('/login', credentials),
    getMe: () => candidateApiInstance.get('/me'),

    // Workflows
    startTest: () => candidateApiInstance.post('/start-test'),
    submitTest: (data) => candidateApiInstance.post('/submit-test', data),
    submitApplication: (data) => candidateApiInstance.post('/submit-application', data),
    signAgreement: () => candidateApiInstance.post('/sign-agreement'),
};
