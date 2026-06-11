import api from '../../api/axios';

export const getLoanApplications = async (params = {}) => {
    try {
        const res = await api.get('/loan-applications', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getLoanStats = async (params = {}) => {
    try {
        const res = await api.get('/loan-applications/stats', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createLoanApplication = async (data) => {
    try {
        const res = await api.post('/loan-applications', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
export const getLoanCountsByLocation = async () => {
    try {
        const res = await api.get('/loan-applications/location-counts');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
