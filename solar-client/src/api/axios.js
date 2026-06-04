import axios from 'axios';
import authStore from '../store/authStore.js';
import useLoaderStore from '../store/loaderStore.js';

const envApiUrl = import.meta.env.VITE_API_URL;
const baseURL = envApiUrl || (import.meta.env.PROD
  ? 'https://solar-f008.onrender.com/api'
  : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Ignore background polling or specific silent requests if passed via config in the future
  if (!config.silent) {
    useLoaderStore.getState().startRequest();
  }

  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  useLoaderStore.getState().endRequest();
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    if (!response.config?.silent) {
      useLoaderStore.getState().endRequest();
    }
    return response;
  },
  (error) => {
    if (!error.config?.silent) {
      useLoaderStore.getState().endRequest();
    }

    // Only handle 401 for authenticated requests, not for login attempts
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Only logout and redirect for non-login requests
      authStore.getState().logout();
      window.location.href = '/login';
    }

    // For login requests, just reject the promise without redirecting
    return Promise.reject(error);
  }
);

export default api;
