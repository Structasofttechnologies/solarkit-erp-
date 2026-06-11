import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Save, X, MapPin, Layers } from 'lucide-react';
import {
  getInstallationRates,
  createInstallationRate,
  updateInstallationRate,
  deleteInstallationRate
} from '../../../../services/installer/installerApi';
import { useLocations } from '../../../../hooks/useLocations';
import toast from 'react-hot-toast';

export default function RateSetting() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRateId, setCurrentRateId] = useState(null);

  const {
    states,
    clusters,
    districts,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
    loading: locationsLoading
  } = useLocations();

  const [formData, setFormData] = useState({
    rateType: 'perKW',
    amount: '',
    state: '',
    cluster: '',
    district: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRates();
  }, [selectedState, selectedCluster, selectedDistrict]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const params = {
        state: selectedState,
        cluster: selectedCluster,
        district: selectedDistrict
      };
      const data = await getInstallationRates(params);
      setRates(data);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error('Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.state || !formData.cluster || !formData.district) {
      toast.error('Amount and Location (S/C/D) are required');
      return;
    }

    try {
      if (isEditing && currentRateId) {
        await updateInstallationRate(currentRateId, formData);
        toast.success('Rate updated successfully');
      } else {
        await createInstallationRate(formData);
        toast.success('Rate added successfully');
      }
      resetForm();
      fetchRates();
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error('Failed to save rate');
    }
  };

  const handleEdit = (rate) => {
    setFormData({
      rateType: rate.rateType,
      amount: rate.amount,
      state: rate.state?._id || rate.state || '',
      cluster: rate.cluster?._id || rate.cluster || '',
      district: rate.district?._id || rate.district || '',
      status: rate.status
    });
    setCurrentRateId(rate._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        await deleteInstallationRate(id);
        toast.success('Rate deleted successfully');
        fetchRates();
      } catch (error) {
        console.error('Error deleting rate:', error);
        toast.error('Failed to delete rate');
      }
    }
  };

  const resetForm = () => {
    setFormData({ rateType: 'perKW', amount: '', state: '', cluster: '', district: '', status: 'Active' });
    setIsEditing(false);
    setCurrentRateId(null);
  };

  return (
    <div className="p-6 bg-[#f5f7fb] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <DollarSign className="w-6 h-6 text-green-600" />
                Installation Rate Settings
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage standard installation rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> STATE
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-gray-600 cursor-pointer bg-white text-sm"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Layers className="w-3 h-3" /> CLUSTER
              </label>
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                disabled={!selectedState}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-gray-600 cursor-pointer bg-white disabled:bg-gray-100 text-sm"
              >
                <option value="">All Clusters</option>
                {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> DISTRICT
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCluster}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-gray-600 cursor-pointer bg-white disabled:bg-gray-100 text-sm"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                {isEditing ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                {isEditing ? 'Edit Rate' : 'Add New Rate'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type</label>
                  <select
                    name="rateType"
                    value={formData.rateType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="perKW">Per KW</option>
                    <option value="perProject">Per Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, cluster: '', district: '' }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                    <select
                      name="cluster"
                      value={formData.cluster}
                      onChange={(e) => setFormData(prev => ({ ...prev, cluster: e.target.value, district: '' }))}
                      disabled={!formData.state}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 text-sm"
                      required
                    >
                      <option value="">Select Cluster</option>
                      {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      disabled={!formData.cluster}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 text-sm"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg ${isEditing
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
                      }`}
                  >
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Rate' : 'Add Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location (S/C/D)</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading rates...</td>
                      </tr>
                    ) : rates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <DollarSign className="w-12 h-12 text-gray-300 mb-2" />
                            <p>No rates added yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rates.map((rate) => (
                        <tr
                          key={rate._id}
                          className={`hover:bg-gray-50 transition-colors ${currentRateId === rate._id ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                            {rate.rateType === 'perKW' ? 'Per KW' : 'Per Project'}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-700">
                            ₹ {rate.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="font-semibold">{rate.state?.name || '---'}</div>
                            <div className="text-xs">{rate.cluster?.name || '---'} / {rate.district?.name || '---'}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {rate.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(rate)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(rate._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
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
          </div>
        </div>
      </div>
    </div>
  );
}