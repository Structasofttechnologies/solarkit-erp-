import api from './axios.js';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  update: (id, data) => api.put(`/users/${id}`, data),
  approveUser: (id) => api.put(`/users/${id}/approve`),
  rejectUser: (id) => api.put(`/users/${id}/reject`),
  approve: (id) => api.put(`/users/${id}/approve`),
  reject: (id) => api.put(`/users/${id}/reject`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getSubCategories: (params) => api.get('/products/subcategories', { params }),
};

export const orderAPI = {
  getAllOrders: () => api.get('/orders'),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  delete: (id) => api.delete(`/orders/${id}`),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getStats: () => api.get('/orders/stats'),
};

export const deliveryAPI = {
  getAllDeliveries: () => api.get('/deliveries'),
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  updateDelivery: (id, data) => api.put(`/deliveries/${id}`, data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  updateStatus: (id, data) => api.put(`/deliveries/${id}/status`, data),
  deleteDelivery: (id) => api.delete(`/deliveries/${id}`),
  delete: (id) => api.delete(`/deliveries/${id}`),
  getByPartner: (partnerId) => api.get(`/deliveries/partner/${partnerId}`),
};

export const installationAPI = {
  getAllInstallations: () => api.get('/installations'),
  getAll: (params) => api.get('/installations', { params }),
  getById: (id) => api.get(`/installations/${id}`),
  create: (data) => api.post('/installations', data),
  updateInstallation: (id, data) => api.put(`/installations/${id}`, data),
  update: (id, data) => api.put(`/installations/${id}`, data),
  updateStatus: (id, data) => api.put(`/installations/${id}/status`, data),
  complete: (id, data) => api.put(`/installations/${id}/complete`, data),
  deleteInstallation: (id) => api.delete(`/installations/${id}`),
  delete: (id) => api.delete(`/installations/${id}`),
  getByInstaller: (installerId) => api.get(`/installations/installer/${installerId}`),
};

export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin-stats'),
  getInstallerStats: (filters = {}) => api.get('/dashboard/installer-stats', { params: filters }),
  getAdmin: (params) => api.get('/dashboard/admin', { params }),
  getInventory: (params) => api.get('/dashboard/inventory', { params }),
  getInstaller: (params) => api.get('/dashboard/installer', { params }),
  getDelivery: (params) => api.get('/dashboard/delivery', { params }),
  getDealer: () => api.get('/dashboard/dealer'),
  getFranchisee: () => api.get('/dashboard/franchisee'),
};

export const adminConfigAPI = {
  get: (section, key) => api.get(`/admin-config/${section}/${key}`),
  save: (section, key, data) => api.put(`/admin-config/${section}/${key}`, { data }),
};

export const locationAPI = {
  // Country APIs
  getAllCountries: (params) => api.get('/locations/countries', { params }),
  getMasterCountries: () => api.get('/locations/countries/master'),
  activateCountry: (data) => api.post('/locations/countries/activate', data),
  getCountryById: (id) => api.get(`/locations/countries/${id}`),
  createCountry: (data) => api.post('/locations/countries', data),
  updateCountry: (id, data) => api.put(`/locations/countries/${id}`, data),
  deleteCountry: (id) => api.delete(`/locations/countries/${id}`),

  // City APIs
  getAllCities: (params) => api.get('/locations/cities', { params }),
  getCityById: (id) => api.get(`/locations/cities/${id}`),
  createCity: (data) => api.post('/locations/cities', data),
  bulkCreateCities: (data) => api.post('/locations/cities/bulk', data),
  updateCity: (id, data) => api.put(`/locations/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/locations/cities/${id}`),

  checkDuplicate: (params) => api.get('/locations/check-duplicate', { params }),

  // State APIs
  getAllStates: (params) => api.get('/locations/states', { params }),
  getStateById: (id) => api.get(`/locations/states/${id}`),
  createState: (data) => api.post('/locations/states', data),
  updateState: (id, data) => api.put(`/locations/states/${id}`, data),
  deleteState: (id) => api.delete(`/locations/states/${id}`),

  // District APIs
  getAllDistricts: (params) => api.get('/locations/districts', { params }),
  getDistrictById: (id) => api.get(`/locations/districts/${id}`),
  createDistrict: (data) => api.post('/locations/districts', data),
  updateDistrict: (id, data) => api.put(`/locations/districts/${id}`, data),
  deleteDistrict: (id) => api.delete(`/locations/districts/${id}`),

  // Cluster APIs
  getAllClusters: (params) => api.get('/locations/clusters', { params }),
  getClusterById: (id) => api.get(`/locations/clusters/${id}`),
  createCluster: (data) => api.post('/locations/clusters', data),
  updateCluster: (id, data) => api.put(`/locations/clusters/${id}`, data),
  deleteCluster: (id) => api.delete(`/locations/clusters/${id}`),

  // Zone APIs
  getAllZones: (params) => api.get('/locations/zones', { params }),
  getZoneById: (id) => api.get(`/locations/zones/${id}`),
  createZone: (data) => api.post('/locations/zones', data),
  updateZone: (id, data) => api.put(`/locations/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/locations/zones/${id}`),
};

export const masterAPI = {
  // Category APIs
  getAllCategories: (params) => api.get('/masters/categories', { params }),
  createCategory: (data) => api.post('/masters/categories', data),
  updateCategory: (id, data) => api.put(`/masters/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/masters/categories/${id}`),

  // Sub Category APIs
  getAllSubCategories: (params) => api.get('/masters/sub-categories', { params }),
  createSubCategory: (data) => api.post('/masters/sub-categories', data),
  updateSubCategory: (id, data) => api.put(`/masters/sub-categories/${id}`, data),
  deleteSubCategory: (id) => api.delete(`/masters/sub-categories/${id}`),

  // Project Type APIs
  getAllProjectTypes: (params) => api.get('/masters/project-types', { params }),
  createProjectType: (data) => api.post('/masters/project-types', data),
  updateProjectType: (id, data) => api.put(`/masters/project-types/${id}`, data),
  deleteProjectType: (id) => api.delete(`/masters/project-types/${id}`),

  // Sub Project Type APIs
  getAllSubProjectTypes: (params) => api.get('/masters/sub-project-types', { params }),
  createSubProjectType: (data) => api.post('/masters/sub-project-types', data),
  updateSubProjectTypes: (id, data) => api.put(`/masters/sub-project-types/${id}`, data),
  deleteSubProjectTypes: (id) => api.delete(`/masters/sub-project-types/${id}`),
};

export const vendorAPI = {
  // Installer Vendor
  getInstallerVendors: () => api.get('/vendors/installer-vendors'),
  createInstallerVendor: (data) => api.post('/vendors/installer-vendors', data),
  updateInstallerVendor: (id, data) => api.put(`/vendors/installer-vendors/${id}`, data),
  deleteInstallerVendor: (id) => api.delete(`/vendors/installer-vendors/${id}`),

  // Supplier Type
  getSupplierTypes: () => api.get('/vendors/supplier-types'),
  createSupplierType: (data) => api.post('/vendors/supplier-types', data),
  updateSupplierType: (id, data) => api.put(`/vendors/supplier-types/${id}`, data),
  deleteSupplierType: (id) => api.delete(`/vendors/supplier-types/${id}`),

  // Supplier Vendor
  getSupplierVendors: () => api.get('/vendors/supplier-vendors'),
  createSupplierVendor: (data) => api.post('/vendors/supplier-vendors', data),
  updateSupplierVendor: (id, data) => api.put(`/vendors/supplier-vendors/${id}`, data),
  deleteSupplierVendor: (id) => api.delete(`/vendors/supplier-vendors/${id}`),
};

export const leadAPI = {
  createLead: (data) => api.post('/leads', data),
  getAllLeads: (params) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
};

export const surveyAPI = {
  getSurveyByLead: (leadId) => api.get(`/surveys/${leadId}`),
  createOrUpdateSurvey: (leadId, data) => api.post(`/surveys/${leadId}`, data),
  completeSurvey: (leadId) => api.put(`/surveys/${leadId}/complete`),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  signProject: (leadId) => api.post(`/projects/sign-project/${leadId}`),
};


export const loanAPI = {
  create: (data) => api.post('/loan-applications', data),
  getAll: (params) => api.get('/loan-applications', { params }),
  getStats: (params) => api.get('/loan-applications/stats', { params }),
};

export const solarKitAPI = {
  getAll: (params) => api.get('/solar-kits', { params }),
  getById: (id) => api.get(`/solar-kits/${id}`),
  create: (data) => api.post('/solar-kits', data),
  update: (id, data) => api.put(`/solar-kits/${id}`, data),
  delete: (id) => api.delete(`/solar-kits/${id}`),
};

export const campaignAPI = {
  // Config
  getConfig: () => api.get('/campaigns/settings/config'),
  updateConfig: (data) => api.put('/campaigns/settings/config', data),

  // Social Platforms
  getAllSocialPlatforms: () => api.get('/campaigns/social/platforms'),
  createSocialPlatform: (data) => api.post('/campaigns/social/platforms', data),
  updateSocialPlatform: (id, data) => api.put(`/campaigns/social/platforms/${id}`, data),
  deleteSocialPlatform: (id) => api.delete(`/campaigns/social/platforms/${id}`),
};

export const departmentAPI = {
  getAll: () => api.get('/department-modules/departments'),
};

export default api;
