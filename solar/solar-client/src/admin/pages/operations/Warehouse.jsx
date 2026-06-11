'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Phone,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Package,
  Layers,
  X,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';
import inventoryApi from '../../../services/inventory/inventoryApi';
import {
  getClustersHierarchy,
  getDistrictsHierarchy,
  getCitiesHierarchy
} from '../../../services/core/locationApi';
import toast from 'react-hot-toast';

export default function OurWarehouse() {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    activeWarehouses: 0,
    totalCapacity: 0,
    utilizationRate: 0
  });

  // Global Page Filters (using hook)
  const {
    states: allStates, // Rename to avoid confusion with form states
    clusters: filterClusters,
    districts: filterDistricts,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
  } = useLocations();

  // Form Local State
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    contact: '',
    address: '',
    capacity: '',
    state: '',
    cluster: '',
    district: '',
    city: '',
    status: 'Active'
  });

  // Form Location Options (Independent of page filters)
  const [formClusters, setFormClusters] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);
  const [formCities, setFormCities] = useState([]);

  useEffect(() => {
    fetchWarehouses();
  }, [selectedState, selectedCluster, selectedDistrict]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const params = {
        state: selectedState,
        cluster: selectedCluster,
        district: selectedDistrict
      };

      // Filter out empty params
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));

      const res = await inventoryApi.getAllWarehouses(cleanParams);
      const list = res.data?.data || [];
      setWarehouses(list);

      // Basic stats calculation
      const totalCap = list.reduce((sum, wh) => sum + (Number(wh.capacity) || 0), 0);
      const activeCount = list.filter(wh => wh.status === 'Active').length;

      setStats({
        totalWarehouses: list.length,
        activeWarehouses: activeCount,
        totalCapacity: totalCap,
        utilizationRate: totalCap > 0 ? Math.round((list.reduce((sum, wh) => sum + (Number(wh.usedCapacity) || 0), 0) / totalCap) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form Location Handlers
  const handleFormStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: stateId,
      cluster: '',
      district: '',
      city: ''
    }));
    setFormClusters([]);
    setFormDistricts([]);
    setFormCities([]);

    if (stateId) {
      try {
        const clusters = await getClustersHierarchy(stateId);
        setFormClusters(clusters || []);
      } catch (err) {
        console.error("Error fetching clusters for form", err);
      }
    }
  };

  const handleFormClusterChange = async (e) => {
    const clusterId = e.target.value;
    setFormData(prev => ({
      ...prev,
      cluster: clusterId,
      district: '',
      city: ''
    }));
    setFormDistricts([]);
    setFormCities([]);

    if (clusterId) {
      try {
        const districts = await getDistrictsHierarchy(clusterId);
        setFormDistricts(districts || []);
      } catch (err) {
        console.error("Error fetching districts for form", err);
      }
    }
  };

  const handleFormDistrictChange = async (e) => {
    const districtId = e.target.value;
    setFormData(prev => ({
      ...prev,
      district: districtId,
      city: ''
    }));
    setFormCities([]);

    if (districtId) {
      try {
        const cities = await getCitiesHierarchy(districtId);
        setFormCities(cities || []);
      } catch (err) {
        console.error("Error fetching cities for form", err);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.manager || !formData.contact || !formData.state || !formData.cluster || !formData.district || !formData.address || !formData.capacity) {
      toast.error('Please fill all required fields including Address and Capacity');
      return;
    }

    try {
      setLoading(true);
      if (currentWarehouse) {
        await inventoryApi.updateWarehouse(currentWarehouse._id, formData);
        toast.success('Warehouse updated successfully');
      } else {
        await inventoryApi.createWarehouse(formData);
        toast.success('Warehouse created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast.error(error.message || 'Failed to save warehouse');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (warehouse) => {
    setCurrentWarehouse(warehouse);

    const stateId = warehouse.state?._id || warehouse.state || '';
    const clusterId = warehouse.cluster?._id || warehouse.cluster || '';
    const districtId = warehouse.district?._id || warehouse.district || '';
    const cityId = warehouse.city?._id || warehouse.city || '';

    // Pre-fetch hierarchies for the form based on existing values
    try {
      setLoading(true); // temporary loading state for modal prep
      if (stateId) {
        const cList = await getClustersHierarchy(stateId);
        setFormClusters(cList || []);
      }
      if (clusterId) {
        const dList = await getDistrictsHierarchy(clusterId);
        setFormDistricts(dList || []);
      }
      if (districtId) {
        const cityList = await getCitiesHierarchy(districtId);
        setFormCities(cityList || []);
      }
    } catch (err) {
      console.error("Error pre-fetching form locations", err);
    } finally {
      setLoading(false);
    }

    setFormData({
      name: warehouse.name,
      manager: warehouse.manager,
      contact: warehouse.contact,
      address: warehouse.address,
      capacity: warehouse.capacity,
      state: stateId,
      cluster: clusterId,
      district: districtId,
      city: cityId,
      status: warehouse.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await inventoryApi.deleteWarehouse(id);
        toast.success('Warehouse deleted successfully');
        fetchWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        toast.error('Failed to delete warehouse');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manager: '',
      contact: '',
      address: '',
      capacity: '',
      state: '',
      cluster: '',
      district: '',
      city: '',
      status: 'Active'
    });
    setFormClusters([]);
    setFormDistricts([]);
    setFormCities([]);
    setCurrentWarehouse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                <WarehouseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-gray-500 text-sm">Dynamic location-based storage system</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Warehouse
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-white font-medium">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90 uppercase tracking-wider">TOTAL</span>
            <WarehouseIcon className="w-6 h-6 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold">{stats.totalWarehouses}</h3>
          <p className="text-xs opacity-80 mt-1">Managed Warehouses</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90 uppercase tracking-wider">ACTIVE</span>
            <Package className="w-6 h-6 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold">{stats.activeWarehouses}</h3>
          <p className="text-xs opacity-80 mt-1">Operational Units</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90 uppercase tracking-wider">CAPACITY</span>
            <MapPin className="w-6 h-6 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold">{stats.totalCapacity.toLocaleString()}</h3>
          <p className="text-xs opacity-80 mt-1">Total sq ft stored</p>
        </div>

        <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90 uppercase tracking-wider">UTILIZATION</span>
            <RefreshCw className="w-6 h-6 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold">{stats.utilizationRate}%</h3>
          <p className="text-xs opacity-80 mt-1">Average usage rate</p>
        </div>
      </div>

      {/* Dynamic Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 font-medium">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4" /> Geographical Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50/50 hover:bg-white transition-all cursor-pointer shadow-sm"
            >
              <option value="">All States</option>
              {allStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cluster</label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              disabled={!selectedState}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50/50 hover:bg-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <option value="">All Clusters</option>
              {filterClusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedCluster}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50/50 hover:bg-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {filterDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Warehouse Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name & Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Capacity</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !isModalOpen ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading warehouses...</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No warehouses found in this location</td></tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <WarehouseIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{wh.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {wh.address || 'No address provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-700">{wh.state?.name || '---'}</p>
                        <p className="text-xs text-gray-400">{wh.cluster?.name || wh.district?.name || '---'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                        <span className="font-bold text-gray-700">{wh.capacity?.toLocaleString() || '0'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">sq ft</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${wh.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {wh.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEdit(wh)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(wh._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {currentWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Configure storage facility details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-gray-600 transition-all border border-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Warehouse Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Capacity (sq ft)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Total area"
                    required
                  />
                </div>
              </div>

              {/* Manager & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Manager Name</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter manager name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Street address, landmark, pin code..."
                  required
                />
              </div>

              {/* Location Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleFormStateChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.2rem' }}
                    required
                  >
                    <option value="">Select State</option>
                    {allStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cluster</label>
                  <select
                    name="cluster"
                    value={formData.cluster}
                    onChange={handleFormClusterChange}
                    disabled={!formData.state}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="">Select Cluster</option>
                    {formClusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleFormDistrictChange}
                    disabled={!formData.cluster}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="">Select District</option>
                    {formDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">City/Town (Optional)</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!formData.district}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="">Select City</option>
                    {formCities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                >
                  <Save className="w-4 h-4" />
                  {currentWarehouse ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}