import api from '../../api/api';

export const dealerManagerApi = {
    getOnboardingGoals: async () => {
        const response = await api.get('/dealer-manager/onboarding-goals');
        return response.data;
    },
    // Tickets - Franchisee / Customer mapping
    getMyDealers: async () => {
        const response = await api.get('/dealer-manager/my-dealers');
        return response.data;
    },
    getDealerCustomers: async (dealerId) => {
        const response = await api.get(`/dealer-manager/my-dealers/${dealerId}/customers`);
        return response.data;
    },
    getReportStats: async (period) => {
        const response = await api.get(`/dealer-manager/report-stats?period=${period}`);
        return response.data;
    }
};
