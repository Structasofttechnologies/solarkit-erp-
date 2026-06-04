import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/dealer-settings`;

// Plans
export const getDealerPlans = async () => {
    try {
        const response = await axios.get(`${API_URL}/plans`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dealer plans:', error);
        throw error;
    }
};

export const createDealerPlan = async (planData) => {
    try {
        const response = await axios.post(`${API_URL}/plans`, planData);
        return response.data;
    } catch (error) {
        console.error('Error creating dealer plan:', error);
        throw error;
    }
};

export const updateDealerPlan = async (id, planData) => {
    try {
        const response = await axios.put(`${API_URL}/plans/${id}`, planData);
        return response.data;
    } catch (error) {
        console.error('Error updating dealer plan:', error);
        throw error;
    }
};

export const deleteDealerPlan = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/plans/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting dealer plan:', error);
        throw error;
    }
};

// Rewards
export const getDealerRewards = async () => {
    try {
        const response = await axios.get(`${API_URL}/rewards`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dealer rewards:', error);
        throw error;
    }
};

export const createDealerReward = async (rewardData) => {
    try {
        const response = await axios.post(`${API_URL}/rewards`, rewardData);
        return response.data;
    } catch (error) {
        console.error('Error creating dealer reward:', error);
        throw error;
    }
};

export const updateDealerReward = async (id, rewardData) => {
    try {
        const response = await axios.put(`${API_URL}/rewards/${id}`, rewardData);
        return response.data;
    } catch (error) {
        console.error('Error updating dealer reward:', error);
        throw error;
    }
};

export const deleteDealerReward = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/rewards/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting dealer reward:', error);
        throw error;
    }
};

// Goals
export const getDealerGoals = async () => {
    try {
        const response = await axios.get(`${API_URL}/goals`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dealer goals:', error);
        throw error;
    }
};

export const createDealerGoal = async (goalData) => {
    try {
        const response = await axios.post(`${API_URL}/goals`, goalData);
        return response.data;
    } catch (error) {
        console.error('Error creating dealer goal:', error);
        throw error;
    }
};

export const deleteDealerGoal = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/goals/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting dealer goal:', error);
        throw error;
    }
};

// Professions
export const getDealerProfessions = async (stateId = null) => {
    try {
        const url = stateId ? `${API_URL}/professions?stateId=${stateId}` : `${API_URL}/professions`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching dealer professions:', error);
        throw error;
    }
};

export const createDealerProfession = async (professionData) => {
    try {
        const response = await axios.post(`${API_URL}/professions`, professionData);
        return response.data;
    } catch (error) {
        console.error('Error creating dealer profession:', error);
        throw error;
    }
};

export const deleteDealerProfession = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/professions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting dealer profession:', error);
        throw error;
    }
};
