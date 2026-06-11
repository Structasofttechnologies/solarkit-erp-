import api from '../../api/axios';

// Get all countries
export const getCountries = async (config = {}) => {
    try {
        const res = await api.get('/locations/countries', config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get all states (optionally by country)
export const getStates = async (params = {}, config = {}) => {
    try {
        const query = typeof params === 'string' ? `countryId=${params}` : new URLSearchParams(params).toString();
        const url = query ? `/locations/states?${query}` : '/locations/states';
        const res = await api.get(url, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get cities by state
export const getCities = async (params = {}, config = {}) => {
    try {
        const query = typeof params === 'string' ? `stateId=${params}` : new URLSearchParams(params).toString();
        const res = await api.get(`/locations/cities?${query}`, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get districts by city or state
export const getDistricts = async (params = {}, config = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const res = await api.get(`/locations/districts?${query}`, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get clusters by district
export const getClusters = async (params = {}, config = {}) => {
    try {
        const query = typeof params === 'string' ? `districtId=${params}` : new URLSearchParams(params).toString();
        const res = await api.get(`/locations/clusters?${query}`, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Hierarchy functions
export const getStatesHierarchy = async (config = {}) => {
    try {
        const res = await api.get('/locations/hierarchy/states', config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getClustersHierarchy = async (stateId, config = {}) => {
    try {
        const url = stateId ? `/locations/hierarchy/clusters?stateId=${stateId}` : '/locations/hierarchy/clusters';
        const res = await api.get(url, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getDistrictsHierarchy = async (clusterId, config = {}) => {
    try {
        const url = clusterId ? `/locations/hierarchy/districts?clusterId=${clusterId}` : '/locations/hierarchy/districts';
        const res = await api.get(url, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const getCitiesHierarchy = async (districtId, config = {}) => {
    try {
        const url = districtId ? `/locations/hierarchy/cities?districtId=${districtId}` : '/locations/hierarchy/cities';
        const res = await api.get(url, config);
        return res.data.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
