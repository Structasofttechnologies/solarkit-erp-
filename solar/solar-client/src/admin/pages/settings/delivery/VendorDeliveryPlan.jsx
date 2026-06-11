import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit, Trash2, Search, Loader, User, Truck, Box
} from 'lucide-react';
import {
  getVendorDeliveryConfig, upsertVendorDeliveryConfig,
  getVendorDeliveryPlans, createVendorDeliveryPlan, updateVendorDeliveryPlan, deleteVendorDeliveryPlan,
  getDeliveryTypes, getVehicles
} from '../../../../services/delivery/deliveryApi';
import { getInstallerVendors, getSupplierVendors } from '../../../../services/vendor/vendorApi';

const VendorDeliveryPlan = () => {
  // Config state
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [config, setConfig] = useState({ distanceThreshold: 50, allowPickup: true, allowDelivery: true });

  // Plans state
  const [plans, setPlans] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    vendor: '', vendorModel: 'InstallerVendor', deliveryType: '', vehicle: '', pricePerDelivery: '', status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setConfigLoading(true);
      setPlansLoading(true);

      const [configRes, plansRes, installersRes, suppliersRes, typesRes, vehiclesRes] = await Promise.all([
        getVendorDeliveryConfig(),
        getVendorDeliveryPlans(),
        getInstallerVendors(),
        getSupplierVendors(),
        getDeliveryTypes(),
        getVehicles()
      ]);

      if (configRes.success && configRes.data) {
        setConfig({
          distanceThreshold: configRes.data.distanceThreshold,
          allowPickup: configRes.data.allowPickup,
          allowDelivery: configRes.data.allowDelivery
        });
      }

      if (plansRes.success) setPlans(plansRes.data);

      const installers = (installersRes.data || []).map(v => ({ ...v, type: 'Installer', model: 'InstallerVendor' }));
      const suppliers = (suppliersRes.data || []).map(v => ({ ...v, type: 'Supplier', model: 'SupplierVendor' }));
      setVendors([...installers, ...suppliers]);

      if (typesRes.success) setDeliveryTypes(typesRes.data);
      if (vehiclesRes.success) setVehicles(vehiclesRes.data);

    } catch (error) {
      showNotification('Failed to load data', 'error');
    } finally {
      setConfigLoading(false);
      setPlansLoading(false);
    }
  };

  const refreshPlans = async () => {
    try {
      const response = await getVendorDeliveryPlans();
      if (response.success) setPlans(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Config Handlers
  const handleConfigInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === 'checkbox') value = checked;
    else if (type === 'number') value = value === '' ? '' : Number(value);

    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveConfig = async () => {
    if (config.distanceThreshold === '' || isNaN(config.distanceThreshold)) {
      showNotification('Please enter a valid distance threshold', 'error');
      return;
    }
    try {
      setConfigSaving(true);
      const response = await upsertVendorDeliveryConfig(config);
      if (response.success) {
        showNotification('Configuration saved successfully', 'success');
        if (response.data) {
          setConfig({
            distanceThreshold: response.data.distanceThreshold,
            allowPickup: response.data.allowPickup,
            allowDelivery: response.data.allowDelivery
          });
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save configuration', 'error');
    } finally {
      setConfigSaving(false);
    }
  };

  // Plan Handlers
  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vendor') {
      const selectedVendor = vendors.find(v => v._id === value);
      setFormData({
        ...formData,
        vendor: value,
        vendorModel: selectedVendor ? selectedVendor.model : 'InstallerVendor'
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      vendor: '', vendorModel: 'InstallerVendor', deliveryType: '', vehicle: '', pricePerDelivery: '', status: 'active'
    });
    setEditingPlan(null);
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        vendor: plan.vendor?._id || '',
        vendorModel: plan.vendorModel || 'InstallerVendor',
        deliveryType: plan.deliveryType?._id || '',
        vehicle: plan.vehicle?._id || '',
        pricePerDelivery: plan.pricePerDelivery,
        status: plan.status
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formData.vendor || !formData.deliveryType || !formData.vehicle || !formData.pricePerDelivery) {
      showNotification('All fields are required', 'error');
      return;
    }
    try {
      if (editingPlan) {
        await updateVendorDeliveryPlan(editingPlan._id, formData);
        showNotification('Plan updated successfully', 'success');
      } else {
        await createVendorDeliveryPlan(formData);
        showNotification('Plan created successfully', 'success');
      }
      refreshPlans();
      handleCloseModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteVendorDeliveryPlan(id);
        showNotification('Plan deleted successfully', 'success');
        refreshPlans();
      } catch (error) {
        showNotification('Delete failed', 'error');
      }
    }
  };

  const handlePlanStatusToggle = async (plan) => {
    try {
      const newStatus = plan.status === 'active' ? 'inactive' : 'active';
      await updateVendorDeliveryPlan(plan._id, { status: newStatus });
      showNotification('Status updated', 'success');
      refreshPlans();
    } catch (error) {
      showNotification('Status update failed', 'error');
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (configLoading || plansLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {notification.message}
        </div>
      )}

      {/* 1. Global Setup Configuration Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-[#0284c7] px-6 py-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Delivery Type Configuration
          </h2>
        </div>
        <div className="p-8">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Set Distance Threshold</h3>
            <div className="flex items-center">
              <span className="text-gray-600 text-[15px] font-medium mr-4">
                Auto-select pickup if distance is under
              </span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  name="distanceThreshold"
                  value={config.distanceThreshold}
                  onChange={handleConfigInputChange}
                  min="0"
                  className="w-24 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 outline-none text-gray-800"
                />
              </div>
              <span className="text-gray-600 text-[15px] ml-4 font-medium">km</span>
            </div>
            <p className="text-gray-400 text-sm mt-4 tracking-wide font-medium">
              Orders under this distance will default to pickup
            </p>
          </div>

          <div className="mb-8 border border-gray-100 rounded-lg p-5">
            <h3 className="text-[16px] font-bold text-[#1e293b] mb-4">Current Configuration</h3>
            <div className="flex items-center space-x-6 mb-6 mt-2 ml-1 text-sm font-medium text-[#0284c7]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowPickup"
                  checked={config.allowPickup}
                  onChange={handleConfigInputChange}
                  className="w-3 h-3 mr-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Pickup
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowDelivery"
                  checked={config.allowDelivery}
                  onChange={handleConfigInputChange}
                  className="w-3 h-3 mr-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Delivery
              </label>
            </div>
            <div className="text-[15px] text-gray-500 mt-2">
              Currently: <span className="font-bold text-gray-700">Pickup</span> for &lt;{config.distanceThreshold}km, <span className="font-bold text-gray-700">Delivery</span> for &ge;{config.distanceThreshold}km
            </div>
          </div>
          <div>
            <button
              onClick={handleSaveConfig}
              disabled={configSaving}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-2 px-5 rounded text-sm transition-colors tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {configSaving ? (
                <><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Vendor Specific Plans Restored Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <div className="mb-6 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              Vendor Delivery Plans Map
            </h1>
            <p className="text-gray-600 text-sm mt-1">Manage unique delivery rates for individual vendors</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Plan
          </button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by vendor or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            No vendor delivery plans found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-6 py-3 text-left font-semibold">Delivery Type</th>
                  <th className="px-6 py-3 text-left font-semibold">Vehicle</th>
                  <th className="px-6 py-3 text-left font-semibold">Price/Delivery</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{plan.vendor?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{plan.vendor?.type || 'Vendor'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Box className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{plan.deliveryType?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{plan.vehicle?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{plan.pricePerDelivery}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePlanStatusToggle(plan)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {plan.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating/Editing Individual Vendor Plans */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              {editingPlan ? 'Edit Vendor Plan' : 'Add New Vendor Plan'}
            </h2>
            <form onSubmit={handleSavePlan}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handlePlanInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handlePlanInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Delivery Type</option>
                    {deliveryTypes.filter(t => t.status === 'active').map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handlePlanInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.filter(v => v.status === 'active').map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Delivery (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerDelivery"
                    value={formData.pricePerDelivery}
                    onChange={handlePlanInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handlePlanInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDeliveryPlan;