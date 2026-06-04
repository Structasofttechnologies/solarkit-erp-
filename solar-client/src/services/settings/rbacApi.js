import axios from '../../api/axios';

const BASE_URL = '/rbac';

// Panel requests
export const getPanels = async () => {
  const response = await axios.get(`${BASE_URL}/panels`);
  return response.data;
};

export const createPanel = async (data) => {
  const response = await axios.post(`${BASE_URL}/panels`, data);
  return response.data;
};

export const updatePanel = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/panels/${id}`, data);
  return response.data;
};

export const deletePanel = async (id) => {
  const response = await axios.delete(`${BASE_URL}/panels/${id}`);
  return response.data;
};

export const clonePanel = async (data) => {
  const response = await axios.post(`${BASE_URL}/panels/clone`, data);
  return response.data;
};

// Module requests
export const getModules = async () => {
  const response = await axios.get(`${BASE_URL}/modules`);
  return response.data;
};

export const createModule = async (data) => {
  const response = await axios.post(`${BASE_URL}/modules`, data);
  return response.data;
};

export const syncModules = async (modulesList) => {
  const response = await axios.post(`${BASE_URL}/modules/sync`, { modulesList });
  return response.data;
};

export const updateModule = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/modules/${id}`, data);
  return response.data;
};

export const deleteModule = async (id) => {
  const response = await axios.delete(`${BASE_URL}/modules/${id}`);
  return response.data;
};

// Permission Matrix requests
export const getPermissionMatrix = async () => {
  const response = await axios.get(`${BASE_URL}/matrix`);
  return response.data;
};

export const updatePermissionMatrix = async (updates) => {
  const response = await axios.post(`${BASE_URL}/matrix/update`, { updates });
  return response.data;
};

// User-Panel Assignment requests
export const getUsersAndPanels = async () => {
  const response = await axios.get(`${BASE_URL}/users-panels`);
  return response.data;
};

export const assignUserPanel = async (data) => {
  const response = await axios.post(`${BASE_URL}/users-panels`, data);
  return response.data;
};

export const removeUserPanel = async (id) => {
  const response = await axios.delete(`${BASE_URL}/users-panels/${id}`);
  return response.data;
};

// Audit Logs requests
export const getActivityLogs = async () => {
  const response = await axios.get(`${BASE_URL}/logs`);
  return response.data;
};
