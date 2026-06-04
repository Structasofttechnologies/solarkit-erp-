import api from '../../api/axios';

export const dashboardApi = {
    getInventoryDashboard: async (filters) => {
        try {
            const response = await api.get('/dashboard/inventory', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Wrapper for location APIs if needed, or we can use locationApi directly in component.
    // Including here for completeness if requested context implies a single service file for dashboard.
};

export default dashboardApi;
