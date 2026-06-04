import api from '../../api/axios';

export const getApprovals = async (filters) => {
    try {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/approvals?${params}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createApproval = async (data) => {
    try {
        const response = await api.post('/approvals', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateApprovalStatus = async (id, status, remarks) => {
    try {
        const response = await api.put(`/approvals/${id}/status`, { status, remarks });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteApproval = async (id) => {
    try {
        const response = await api.delete(`/approvals/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
