import api from '../../api/api'; // Assuming standard api setup

// Partner Management
export const getPartners = async () => {
    const res = await api.get('/partner-settings/types');
    return res.data?.data || res.data;
};
export const createPartner = async (data) => {
    const res = await api.post('/partner-settings/types', data);
    return res.data;
};
export const updatePartner = async (id, data) => {
    const res = await api.put(`/partner-settings/types/${id}`, data);
    return res.data;
};
export const deletePartner = async (id) => {
    const res = await api.delete(`/partner-settings/types/${id}`);
    return res.data;
};

// Partner Plans
export const getPartnerPlans = async (partnerType, stateId, countryId, clusterId, districtId) => {
    const params = {};
    if (partnerType) params.partnerType = partnerType;
    if (countryId) params.countryId = countryId;
    if (stateId) params.stateId = stateId;
    if (clusterId) params.clusterId = clusterId;
    if (districtId) params.districtId = districtId;
    const res = await api.get('/partner-settings/plans', { params });
    return res.data;
};
export const createPartnerPlan = async (data) => {
    const res = await api.post('/partner-settings/plans', data);
    return res.data;
};
export const updatePartnerPlan = async (id, data) => {
    const res = await api.put(`/partner-settings/plans/${id}`, data);
    return res.data;
};
export const deletePartnerPlan = async (id) => {
    const res = await api.delete(`/partner-settings/plans/${id}`);
    return res.data;
};

// Partner Rewards
export const getPartnerRewards = async (partnerType, plan) => {
    const params = {};
    if (partnerType) params.partnerType = partnerType;
    if (plan) params.plan = plan;
    const res = await api.get('/partner-settings/rewards', { params });
    return res.data;
};
export const createPartnerReward = async (data) => {
    const res = await api.post('/partner-settings/rewards', data);
    return res.data;
};
export const updatePartnerReward = async (id, data) => {
    const res = await api.put(`/partner-settings/rewards/${id}`, data);
    return res.data;
};
export const deletePartnerReward = async (id) => {
    const res = await api.delete(`/partner-settings/rewards/${id}`);
    return res.data;
};

// Partner Goals
export const getPartnerGoals = async (partnerType, stateId) => {
    const params = {};
    if (partnerType) params.partnerType = partnerType;
    if (stateId) params.stateId = stateId;
    const res = await api.get('/partner-settings/goals', { params });
    return res.data;
};
export const createPartnerGoal = async (data) => {
    const res = await api.post('/partner-settings/goals', data);
    return res.data;
};
export const updatePartnerGoal = async (id, data) => {
    const res = await api.put(`/partner-settings/goals/${id}`, data);
    return res.data;
};
export const deletePartnerGoal = async (id) => {
    const res = await api.delete(`/partner-settings/goals/${id}`);
    return res.data;
};

// Partner Professions
export const getPartnerProfessions = async (partnerType, stateId, plan) => {
    const params = {};
    if (partnerType) params.partnerType = partnerType;
    if (stateId) params.stateId = stateId;
    if (plan) params.plan = plan;
    const res = await api.get('/partner-settings/professions', { params });
    return res.data;
};
export const createPartnerProfession = async (data) => {
    const res = await api.post('/partner-settings/professions', data);
    return res.data;
};
export const deletePartnerProfession = async (id) => {
    const res = await api.delete(`/partner-settings/professions/${id}`);
    return res.data;
};
