import api from '../../api/axios';

const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'undefined' && value !== '' && value !== 'all') {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    value.forEach(v => searchParams.append(key, v));
                }
            } else {
                searchParams.append(key, value);
            }
        }
    });
    return searchParams.toString();
};

const performanceApi = {
    getFranchiseManagerPerformance: async (params = {}) => {
        try {
            const query = buildQueryString(params);
            const res = await api.get(`/performance/franchise-manager?${query}`);
            return res.data;
        } catch (err) {
            throw err.response?.data || err.message;
        }
    },

    getFranchiseePerformance: async (params = {}) => {
        try {
            const query = buildQueryString(params);
            const res = await api.get(`/performance/franchise?${query}`);
            return res.data;
        } catch (err) {
            throw err.response?.data || err.message;
        }
    },

    getDealerManagerPerformance: async (params = {}) => {
        try {
            const query = buildQueryString(params);
            const res = await api.get(`/performance/dealer-manager?${query}`);
            return res.data;
        } catch (err) {
            throw err.response?.data || err.message;
        }
    },

    getDealerPerformance: async (params = {}) => {
        try {
            const query = buildQueryString(params);
            const res = await api.get(`/performance/dealer?${query}`);
            return res.data;
        } catch (err) {
            throw err.response?.data || err.message;
        }
    },

    getDashboardData: async (role, params = {}) => {
        try {
            const query = buildQueryString(params);
            const res = await api.get(`/performance/${role}?${query}`);
            return res.data;
        } catch (err) {
            throw err.response?.data || err.message;
        }
    }
};

export default performanceApi;
