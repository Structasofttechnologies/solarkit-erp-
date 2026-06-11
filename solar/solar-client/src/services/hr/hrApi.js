import api from '../../api/axios';

// ===================== MODULES =====================
export const getModules = async () => {
    try {
        const res = await api.get('/hr/modules');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createModule = async (data) => {
    try {
        const res = await api.post('/hr/modules', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateModule = async (id, data) => {
    try {
        const res = await api.put(`/hr/modules/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteModule = async (id) => {
    try {
        const res = await api.delete(`/hr/modules/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// ===================== EMPLOYEES =====================
export const getEmployees = async () => {
    try {
        const res = await api.get('/hr/employees');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createEmployee = async (data) => {
    try {
        const res = await api.post('/hr/employees', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateEmployee = async (id, data) => {
    try {
        const res = await api.put(`/hr/employees/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteEmployee = async (id) => {
    try {
        const res = await api.delete(`/hr/employees/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// ===================== TEMPORARY INCHARGE =====================
export const assignTemporaryIncharge = async (data) => {
    // Actually the backend endpoint is 'createTemporaryIncharge' via POST to /hr/temporary-incharge
    try {
        const res = await api.post('/hr/temporary-incharge', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const createTemporaryIncharge = assignTemporaryIncharge; // Alias

export const updateTemporaryIncharge = async (id, data) => {
    try {
        const res = await api.put(`/hr/temporary-incharge/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getTemporaryIncharges = async (params) => {
    try {
        const res = await api.get('/hr/temporary-incharge', { params });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getTemporaryInchargeDashboard = async () => {
    try {
        const res = await api.get('/hr/temporary-incharge/dashboard');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const deleteTemporaryIncharge = async (id) => {
    // Note: delete is not strictly exposed in hrRoutes right now, 
    // but preserving shape so UI doesn't crash if called
    try {
        const res = await api.delete(`/hr/temporary-incharge/${id}`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Not implemented' };
    }
};

// ===================== RESIGNATIONS =====================
export const createResignationRequest = async (data) => {
    try {
        const res = await api.post('/hr/resignations', data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getResignationRequests = async () => {
    try {
        const res = await api.get('/hr/resignations');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const approveResignation = async (id, data = {}) => {
    try {
        const res = await api.put(`/hr/resignations/${id}/approve`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const rejectResignation = async (id, reason) => {
    try {
        const res = await api.put(`/hr/resignations/${id}/reject`, { reason });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
