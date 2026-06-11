import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quote-settings`;

// --- Quote Settings ---
export const createQuoteSetting = async (data) => {
    const response = await axios.post(`${API_URL}/settings`, data);
    return response.data;
};

export const getQuoteSettings = async () => {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
};

export const updateQuoteSetting = async (id, data) => {
    const response = await axios.put(`${API_URL}/settings/${id}`, data);
    return response.data;
};

export const deleteQuoteSetting = async (id) => {
    const response = await axios.delete(`${API_URL}/settings/${id}`);
    return response.data;
};

// --- Survey BOM ---
export const createSurveyBOM = async (data) => {
    const response = await axios.post(`${API_URL}/survey-bom`, data);
    return response.data;
};

export const getSurveyBOMs = async () => {
    const response = await axios.get(`${API_URL}/survey-bom`);
    return response.data;
};

export const updateSurveyBOM = async (id, data) => {
    const response = await axios.put(`${API_URL}/survey-bom/${id}`, data);
    return response.data;
};

export const deleteSurveyBOM = async (id) => {
    const response = await axios.delete(`${API_URL}/survey-bom/${id}`);
    return response.data;
};

// --- Terrace Types ---
export const createTerraceType = async (data) => {
    const response = await axios.post(`${API_URL}/terrace-types`, data);
    return response.data;
};

export const getTerraceTypes = async () => {
    const response = await axios.get(`${API_URL}/terrace-types`);
    return response.data;
};

export const updateTerraceType = async (id, data) => {
    const response = await axios.put(`${API_URL}/terrace-types/${id}`, data);
    return response.data;
};

export const deleteTerraceType = async (id) => {
    const response = await axios.delete(`${API_URL}/terrace-types/${id}`);
    return response.data;
};

// --- Structure Types ---
export const createStructureType = async (data) => {
    const response = await axios.post(`${API_URL}/structure-types`, data);
    return response.data;
};

export const getStructureTypes = async () => {
    const response = await axios.get(`${API_URL}/structure-types`);
    return response.data;
};

export const updateStructureType = async (id, data) => {
    const response = await axios.put(`${API_URL}/structure-types/${id}`, data);
    return response.data;
};

export const deleteStructureType = async (id) => {
    const response = await axios.delete(`${API_URL}/structure-types/${id}`);
    return response.data;
};

// --- Building Types ---
export const createBuildingType = async (data) => {
    const response = await axios.post(`${API_URL}/building-types`, data);
    return response.data;
};

export const getBuildingTypes = async () => {
    const response = await axios.get(`${API_URL}/building-types`);
    return response.data;
};

export const updateBuildingType = async (id, data) => {
    const response = await axios.put(`${API_URL}/building-types/${id}`, data);
    return response.data;
};

export const deleteBuildingType = async (id) => {
    const response = await axios.delete(`${API_URL}/building-types/${id}`);
    return response.data;
};

// --- Discoms ---
export const createDiscom = async (data) => {
    const response = await axios.post(`${API_URL}/discoms`, data);
    return response.data;
};

export const getDiscoms = async (params = {}) => {
    const response = await axios.get(`${API_URL}/discoms`, { params });
    return response.data;
};

export const getDiscomsByState = async (stateId) => {
    const response = await axios.get(`${API_URL}/discoms/state/${stateId}`);
    return response.data;
};

export const updateDiscom = async (id, data) => {
    const response = await axios.put(`${API_URL}/discoms/${id}`, data);
    return response.data;
};

export const deleteDiscom = async (id) => {
    const response = await axios.delete(`${API_URL}/discoms/${id}`);
    return response.data;
};

