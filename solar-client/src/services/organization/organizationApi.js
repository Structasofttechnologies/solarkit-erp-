import api from '../../api/axios';

export const organizationApi = {
    getChartData: (params) => api.get('/organization/chart-data', { params }),
    getEmployees: (params) => api.get('/organization/employees', { params }),
    getStats: () => api.get('/organization/stats'),
};
