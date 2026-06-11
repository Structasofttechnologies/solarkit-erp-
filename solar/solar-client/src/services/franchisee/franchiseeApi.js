import api from '../../api/axios';

// Plans
export const getProPlans = async (state) => {
    const query = state ? `?state=${state}` : '';
    const response = await api.get(`/franchisee/plans${query}`);
    return response.data;
};

export const createProPlan = async (data) => {
    const response = await api.post('/franchisee/plans', data);
    return response.data;
};

export const updateProPlan = async (id, data) => {
    const response = await api.put(`/franchisee/plans/${id}`, data);
    return response.data;
};

export const deleteProPlan = async (id) => {
    const response = await api.delete(`/franchisee/plans/${id}`);
    return response.data;
};

// Rewards
export const getFranchiseeRewards = async (type) => {
    const query = type ? `?type=${type}` : '';
    const response = await api.get(`/franchisee/rewards${query}`);
    return response.data;
};

export const createFranchiseeReward = async (data) => {
    const response = await api.post('/franchisee/rewards', data);
    return response.data;
};

export const updateFranchiseeReward = async (id, data) => {
    const response = await api.put(`/franchisee/rewards/${id}`, data);
    return response.data;
};

export const deleteFranchiseeReward = async (id) => {
    const response = await api.delete(`/franchisee/rewards/${id}`);
    return response.data;
};

// Redeem Settings
export const getRedeemSettings = async () => {
    const response = await api.get('/franchisee/redeem-settings');
    return response.data;
}

export const saveRedeemSettings = async (data) => {
    const response = await api.post('/franchisee/redeem-settings', data);
    return response.data;
}

// Goals
export const getOnboardingGoals = async (state) => {
    const query = state ? `?state=${state}` : '';
    const response = await api.get(`/franchisee/goals${query}`);
    return response.data;
};

export const createOnboardingGoal = async (data) => {
    const response = await api.post('/franchisee/goals', data);
    return response.data;
};

export const updateOnboardingGoal = async (id, data) => {
    const response = await api.put(`/franchisee/goals/${id}`, data);
    return response.data;
};

export const deleteOnboardingGoal = async (id) => {
    const response = await api.delete(`/franchisee/goals/${id}`);
    return response.data;
};

// Professions
export const getProfessionTypes = async (state) => {
    const query = state ? `?state=${state}` : '';
    const response = await api.get(`/franchisee/professions${query}`);
    return response.data;
};

export const createProfessionType = async (data) => {
    const response = await api.post('/franchisee/professions', data);
    return response.data;
};

export const updateProfessionType = async (id, data) => {
    const response = await api.put(`/franchisee/professions/${id}`, data);
    return response.data;
};

export const deleteProfessionType = async (id) => {
    const response = await api.delete(`/franchisee/professions/${id}`);
    return response.data;
};

// Order Settings
export const getFranchiseeOrderSettings = async (state) => {
    const query = state ? `?state=${state}` : ''; // Updated to handle basic state identifier if string, or object handling in caller
    // NOTE: Controller supports filtering by multiple fields. Frontend mostly filters by State.
    // If complex filters are needed, logic should stay same. 
    // The previous implementation assumed `filters` object. 
    // `OrderSetting.jsx` calls it with `stateId` (string).
    // So let's handle string input as state query.

    // Check if input is object or string
    let queryString = '?';
    if (typeof state === 'object') {
        if (state.state) queryString += `state=${state.state}&`;
        if (state.settingType) queryString += `settingType=${state.settingType}&`;
        if (state.planType) queryString += `planType=${state.planType}&`;
    } else if (state) {
        queryString += `state=${state}`;
    }

    const response = await api.get(`/franchisee/order-settings${queryString}`);
    return response.data;
};

export const createFranchiseeOrderSetting = async (data) => {
    const response = await api.post('/franchisee/order-settings', data);
    return response.data;
};

export const updateFranchiseeOrderSetting = async (id, data) => {
    const response = await api.put(`/franchisee/order-settings/${id}`, data);
    return response.data;
};

export const deleteFranchiseeOrderSetting = async (id) => {
    const response = await api.delete(`/franchisee/order-settings/${id}`);
    return response.data;
};
