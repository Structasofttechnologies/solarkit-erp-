import api from '../../api/axios';

// --- HRMS Settings (Department/Position Config) ---

// Get HRMS Settings (can filter by department, position)
export const getHRMSSettings = async (params) => {
    try {
        const res = await api.get('/hrms-settings/settings', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Create or Update HRMS Settings
export const saveHRMSSettings = async (data) => {
    try {
        const res = await api.post('/hrms-settings/settings', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateHRMSSettings = async (id, data) => {
    try {
        const res = await api.put(`/hrms-settings/settings/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteHRMSSettings = async (id) => {
    try {
        const res = await api.delete(`/hrms-settings/settings/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// --- Candidate Tests ---

export const getCandidateTests = async (params) => {
    try {
        const res = await api.get('/hrms-settings/tests', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createCandidateTest = async (data) => {
    try {
        const res = await api.post('/hrms-settings/tests', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateCandidateTest = async (id, data) => {
    try {
        const res = await api.put(`/hrms-settings/tests/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteCandidateTest = async (id) => {
    try {
        const res = await api.delete(`/hrms-settings/tests/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// --- Candidate Trainings ---

export const getCandidateTrainings = async (params) => {
    try {
        const res = await api.get('/hrms-settings/trainings', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createCandidateTraining = async (data) => {
    try {
        const res = await api.post('/hrms-settings/trainings', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateCandidateTraining = async (id, data) => {
    try {
        const res = await api.put(`/hrms-settings/trainings/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteCandidateTraining = async (id) => {
    try {
        const res = await api.delete(`/hrms-settings/trainings/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// --- Vacancies ---

export const getVacancies = async (params) => {
    try {
        const res = await api.get('/hrms-settings/vacancies', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createVacancy = async (data) => {
    try {
        const res = await api.post('/hrms-settings/vacancies', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateVacancy = async (id, data) => {
    try {
        const res = await api.put(`/hrms-settings/vacancies/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteVacancy = async (id) => {
    try {
        const res = await api.delete(`/hrms-settings/vacancies/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const addCandidate = async (vacancyId, data) => {
    try {
        const res = await api.post(`/hrms-settings/vacancies/${vacancyId}/candidates`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getCandidatesByVacancy = async (vacancyId) => {
    try {
        const res = await api.get(`/hrms-settings/vacancies/${vacancyId}/candidates`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateCandidateStatus = async (candidateId, status) => {
    try {
        const res = await api.put(`/hrms-settings/candidates/${candidateId}/status`, { status });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const recruitCandidate = async (candidateId, data) => {
    try {
        const res = await api.post(`/hrms-settings/candidates/${candidateId}/recruit`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getAllCandidates = async (params) => {
    try {
        const res = await api.get('/hrms-settings/candidates', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteCandidate = async (candidateId) => {
    try {
        const res = await api.delete(`/hrms-settings/candidates/${candidateId}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
