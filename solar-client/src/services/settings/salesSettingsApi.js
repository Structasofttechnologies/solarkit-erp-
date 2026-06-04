import api from '../../api/axios';

const salesSettingsService = {
  // --- Dashboard Stats ---
  getDashboardStats: async (config = {}) => {
    try {
      const res = await api.get('/sales-settings/dashboard-stats', config);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },

  // --- Set Price ---
  getSetPrices: async (params) => {
    try {
      const res = await api.get('/sales-settings/set-price', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  createSetPrice: async (data) => {
    try {
      const res = await api.post('/sales-settings/set-price', data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  updateSetPrice: async (id, data) => {
    try {
      const res = await api.put(`/sales-settings/set-price/${id}`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  deleteSetPrice: async (id) => {
    try {
      const res = await api.delete(`/sales-settings/set-price/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },

  // --- Set Price AMC ---
  getSetPriceAmcs: async (params) => {
    try {
      const res = await api.get('/sales-settings/set-price-amc', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  createSetPriceAmc: async (data) => {
    try {
      const res = await api.post('/sales-settings/set-price-amc', data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  updateSetPriceAmc: async (id, data) => {
    try {
      const res = await api.put(`/sales-settings/set-price-amc/${id}`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  deleteSetPriceAmc: async (id) => {
    try {
      const res = await api.delete(`/sales-settings/set-price-amc/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },

  // --- Offers ---
  getOffers: async (params) => {
    try {
      const res = await api.get('/sales-settings/offers', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  createOffer: async (data) => {
    try {
      const res = await api.post('/sales-settings/offers', data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  updateOffer: async (id, data) => {
    try {
      const res = await api.put(`/sales-settings/offers/${id}`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  deleteOffer: async (id) => {
    try {
      const res = await api.delete(`/sales-settings/offers/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },

  // --- Bundles ---
  getBundles: async (params) => {
    try {
      const res = await api.get('/sales-settings/bundles', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  createBundle: async (data) => {
    try {
      const res = await api.post('/sales-settings/bundles', data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  updateBundle: async (id, data) => {
    try {
      const res = await api.put(`/sales-settings/bundles/${id}`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  deleteBundle: async (id) => {
    try {
      const res = await api.delete(`/sales-settings/bundles/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },

  getSolarKits: async () => {
    try {
      const res = await api.get('/combokit/solarkits'); // Adjusting based on common patterns
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error("Error fetching solarkits:", err);
      return [];
    }
  },

  // --- AMC Plans (Inventory/ComboKit) ---
  getAMCPlans: async (params) => {
    try {
      const res = await api.get('/combokit/amc-plans', { params });
      return res.data?.data || res.data || [];
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  updateAMCPlan: async (id, data) => {
    try {
      const res = await api.put(`/combokit/amc-plans/${id}`, data);
      return res.data?.data || res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  deleteAMCPlan: async (id) => {
    try {
      const res = await api.delete(`/combokit/amc-plans/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  getAssignments: async (params) => {
    try {
      const res = await api.get('/combokit/assignments', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async getAllCombokits() {
    try {
      const res = await api.get('/combokit/all-combokits');
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async getAllCustomizedCombokits() {
    try {
      const res = await api.get('/combokit/all-customized-combokits');
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async getPartnerTypes() {
    try {
      const res = await api.get('/partner-settings/types');
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async getPartnerPlans(params) {
    try {
      const res = await api.get('/partner-settings/plans', { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async getCompanyMargins() {
    try {
      const res = await api.get('/sales-settings/company-margin');
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
  async updateCompanyMargin(data) {
    try {
      const res = await api.put('/sales-settings/company-margin', data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  },
};

export default salesSettingsService;
