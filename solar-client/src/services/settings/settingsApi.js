import axios from '../../api/axios';

const API_URL = '/approval-overdue';

export const fetchApprovalRules = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createApprovalRule = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateApprovalRule = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteApprovalRule = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const seedApprovalRules = async () => {
    try {
        const response = await axios.post(`${API_URL}/seed`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const OVERDUE_TASK_API_URL = '/overdue-task-settings';

export const fetchOverdueTaskSettings = async (params) => {
    try {
        const response = await axios.get(OVERDUE_TASK_API_URL, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAllOverdueTaskSettings = async () => {
    try {
        const response = await axios.get(`${OVERDUE_TASK_API_URL}/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateOverdueTaskSettings = async (data) => {
    try {
        const response = await axios.put(OVERDUE_TASK_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOverdueTaskSettings = async (id) => {
    try {
        const response = await axios.delete(`${OVERDUE_TASK_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const OVERDUE_STATUS_API_URL = '/overdue-status-settings';

export const fetchOverdueStatusSettings = async (params) => {
    try {
        const response = await axios.get(OVERDUE_STATUS_API_URL, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAllOverdueStatusSettings = async () => {
    try {
        const response = await axios.get(`${OVERDUE_STATUS_API_URL}/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOverdueStatusSettings = async (data) => {
    try {
        const response = await axios.put(OVERDUE_STATUS_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const FRANCHISEE_MANAGER_SETTINGS_API_URL = '/franchisee-manager-settings';

export const fetchFranchiseeManagerSettings = async (params) => {
    try {
        const response = await axios.get(FRANCHISEE_MANAGER_SETTINGS_API_URL, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateFranchiseeManagerSettings = async (data) => {
    try {
        const response = await axios.put(FRANCHISEE_MANAGER_SETTINGS_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const BUY_LEAD_SETTINGS_API_URL = '/buy-lead-settings';

export const fetchBuyLeadSettings = async () => {
    try {
        const response = await axios.get(BUY_LEAD_SETTINGS_API_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBuyLeadSetting = async (data) => {
    try {
        const response = await axios.post(BUY_LEAD_SETTINGS_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBuyLeadSetting = async (id, data) => {
    try {
        const response = await axios.put(`${BUY_LEAD_SETTINGS_API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBuyLeadSetting = async (id) => {
    try {
        const response = await axios.delete(`${BUY_LEAD_SETTINGS_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addLeadsToSetting = async (data) => {
    try {
        const response = await axios.post(`${BUY_LEAD_SETTINGS_API_URL}/add-leads`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchLeadsBySetting = async (id) => {
    try {
        const response = await axios.get(`${BUY_LEAD_SETTINGS_API_URL}/${id}/leads`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const CHECKLIST_API_URL = '/checklist';

export const seedChecklists = async () => {
    try {
        const response = await axios.post(`${CHECKLIST_API_URL}/seed`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${CHECKLIST_API_URL}/categories`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCategory = async (data) => {
    try {
        const response = await axios.post(`${CHECKLIST_API_URL}/categories`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchChecklists = async (clusterId) => {
    try {
        const url = clusterId ? `${CHECKLIST_API_URL}?clusterId=${clusterId}` : CHECKLIST_API_URL;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createChecklist = async (data) => {
    try {
        const response = await axios.post(CHECKLIST_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateChecklist = async (id, data) => {
    try {
        const response = await axios.put(`${CHECKLIST_API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteChecklist = async (id) => {
    try {
        const response = await axios.delete(`${CHECKLIST_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchModuleCompletions = async (clusterId) => {
    try {
        const url = clusterId ? `${CHECKLIST_API_URL}/completion?clusterId=${clusterId}` : `${CHECKLIST_API_URL}/completion`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateModuleCompletion = async (data) => {
    try {
        const response = await axios.post(`${CHECKLIST_API_URL}/completion/update`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const LOAN_API_URL = '/loan';

export const fetchLoanRules = async (clusterId) => {
    try {
        const response = await axios.get(LOAN_API_URL, {
            params: clusterId ? { clusterId } : {}
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createLoanRule = async (data) => {
    try {
        const response = await axios.post(LOAN_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateLoanRule = async (id, data) => {
    try {
        const response = await axios.put(`${LOAN_API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteLoanRule = async (id) => {
    try {
        const response = await axios.delete(`${LOAN_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const LOAN_PROVIDER_API_URL = '/loan-providers';

export const fetchLoanProviders = async () => {
    try {
        const response = await axios.get(LOAN_PROVIDER_API_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createLoanProvider = async (data) => {
    try {
        const response = await axios.post(LOAN_PROVIDER_API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateLoanProvider = async (id, data) => {
    try {
        const response = await axios.put(`${LOAN_PROVIDER_API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteLoanProvider = async (id) => {
    try {
        const response = await axios.delete(`${LOAN_PROVIDER_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
