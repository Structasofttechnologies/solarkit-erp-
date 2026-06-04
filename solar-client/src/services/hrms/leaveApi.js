import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const createLeaveRequest = async (payload) => {
    return await axios.post(`${API_URL}/leave-approvals`, payload, getAuthHeaders());
};

export const getLeaveRequests = async () => {
    return await axios.get(`${API_URL}/leave-approvals`, getAuthHeaders());
};

export const getLeaveRequestDetails = async (id) => {
    return await axios.get(`${API_URL}/leave-approvals/${id}`, getAuthHeaders());
};

export const approveLeaveRequest = async (id, temporaryIncharge) => {
    return await axios.put(`${API_URL}/leave-approvals/${id}/approve`, { temporaryIncharge }, getAuthHeaders());
};

export const rejectLeaveRequest = async (id, rejectionReason) => {
    return await axios.put(`${API_URL}/leave-approvals/${id}/reject`, { rejectionReason }, getAuthHeaders());
};
