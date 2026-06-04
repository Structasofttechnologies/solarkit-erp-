import axiosInstance from './axios';

// Generic fetcher
const fetchMaster = async (endpoint, params = {}) => {
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
};

export const masterApi = {
    // Products
    getCategories: (params) => fetchMaster('/masters/categories', params),
    getBrands: (params) => fetchMaster('/masters/brands', params),
    getUnits: (params) => fetchMaster('/masters/units', params),

    // HRMS
    getDepartments: (params) => fetchMaster('/masters/departments', params),
    getDesignations: (params) => fetchMaster('/masters/designations', params),
    getRoles: (params) => fetchMaster('/masters/roles', params),
    getPermissions: (params) => fetchMaster('/masters/permissions', params),

    // Custom
    getDesignationsByDepartment: (deptId) => fetchMaster(`/masters/departments/${deptId}/designations`),

    // Locations
    getCountries: (params) => fetchMaster('/locations/countries', params),
    getStates: (params) => fetchMaster('/locations/states', params),
    getDistricts: (params) => fetchMaster('/locations/districts', params),
    getClusters: (params) => fetchMaster('/locations/clusters', params),
    getZones: (params) => fetchMaster('/locations/zones', params),
    getAreas: (params) => fetchMaster('/locations/areas', params),
    
    // SKU Parameters
    saveSkuParameters: (data) => axiosInstance.post('/masters/skus/parameters', data),
    getSkuParameters: (skuCode) => fetchMaster(`/masters/skus/${skuCode}/parameters`),
    
    // SKU Image
    saveSkuImage: (data) => axiosInstance.post('/masters/skus/image', data),
    getSkuImage: (skuCode) => fetchMaster(`/masters/skus/${skuCode}/image`),
};
