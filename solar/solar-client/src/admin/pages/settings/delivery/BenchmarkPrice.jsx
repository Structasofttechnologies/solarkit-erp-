import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit, Trash2, Loader, X } from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  getDeliveryTypes,
  getBenchmarkPrices,
  createBenchmarkPrice,
  updateBenchmarkPrice,
  deleteBenchmarkPrice
} from '../../../../services/delivery/deliveryApi';
import { locationAPI } from '../../../../api/api';

const DeliveryBenchmarkPrice = () => {
  // Common Location State
  const { countries, states, fetchCountries, fetchStates } = useLocations();

  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Data
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [benchmarkPrices, setBenchmarkPrices] = useState([]);

  // Hierarchical Location Selection
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [clusterOptions, setClusterOptions] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedClusterName, setSelectedClusterName] = useState('');
  const [districtOptions, setDistrictOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');

  const [selectedAllStates, setSelectedAllStates] = useState(false);
  const [selectedAllClusters, setSelectedAllClusters] = useState(false);
  const [selectedAllDistricts, setSelectedAllDistricts] = useState(false);

  const [formData, setFormData] = useState({
    deliveryType: '',
    benchmarkPrice: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    combokit: ''
  });

  const [editingId, setEditingId] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Initial Fetch
  useEffect(() => {
    fetchCountries();
    loadDeliveryTypes();
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find(c => c.name === 'India');
      if (india) fetchStates({ country: india._id });
      else fetchStates({ country: countries[0]._id });
    }
  }, [countries]);

  const loadDeliveryTypes = async () => {
    try {
      const typesRes = await getDeliveryTypes();
      if (typesRes.success) setDeliveryTypes(typesRes.data);
    } catch (error) {
      console.error("Failed to load delivery types");
    }
  };

  const loadBenchmarkPrices = async (districtId = selectedDistrict, clusterId = selectedCluster, stateId = selectedState) => {
    // If we haven't reached district selection (even 'all'), don't load yet unless explicitly asked
    if (!districtId && districtId !== 'all') return;

    try {
      setDataLoading(true);
      let params = {};

      if (districtId && districtId !== 'all') {
        params.district = districtId;
      } else if (clusterId && clusterId !== 'all') {
        params.cluster = clusterId;
      } else if (stateId && stateId !== 'all') {
        params.state = stateId;
      }

      const res = await getBenchmarkPrices(params);
      if (res.success) setBenchmarkPrices(res.data);
    } catch (error) {
      showNotification('Failed to load prices', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const refreshPrices = () => {
    if (selectedDistrict || selectedAllDistricts) {
      loadBenchmarkPrices();
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Location Handlers
  const handleStateSelect = async (stateId, stateName) => {
    if (stateId === 'all') {
      setSelectedState('all');
      setSelectedStateName('All States');
      setSelectedAllStates(true);
      setSelectedCluster('');
      setSelectedClusterName('');
      setSelectedAllClusters(false);
      setClusterOptions([]);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      setSelectedAllDistricts(false);
      setDistrictOptions([]);
      setBenchmarkPrices([]);

      try {
        const res = await locationAPI.getAllClusters({ isActive: 'true' });
        if (res.data && res.data.data) {
          setClusterOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching all clusters", e);
      }
    } else {
      setSelectedState(stateId);
      setSelectedStateName(stateName);
      setSelectedAllStates(false);
      setSelectedCluster('');
      setSelectedClusterName('');
      setSelectedAllClusters(false);
      setClusterOptions([]);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      setSelectedAllDistricts(false);
      setDistrictOptions([]);
      setBenchmarkPrices([]);

      try {
        const res = await locationAPI.getAllClusters({ state: stateId, isActive: 'true' });
        if (res.data && res.data.data) {
          setClusterOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching clusters", e);
      }
    }
  };

  const handleClusterSelect = async (clusterId, clusterName) => {
    if (clusterId === 'all') {
      setSelectedCluster('all');
      setSelectedClusterName('All Clusters');
      setSelectedAllClusters(true);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      setSelectedAllDistricts(false);
      setDistrictOptions([]);
      setBenchmarkPrices([]);

      try {
        const queryParams = selectedState === 'all' ? { isActive: 'true' } : { state: selectedState, isActive: 'true' };
        const res = await locationAPI.getAllDistricts(queryParams);
        if (res.data && res.data.data) {
          setDistrictOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching districts", e);
      }
    } else {
      setSelectedCluster(clusterId);
      setSelectedClusterName(clusterName);
      setSelectedAllClusters(false);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      setSelectedAllDistricts(false);
      setDistrictOptions([]);
      setBenchmarkPrices([]);

      try {
        const res = await locationAPI.getAllDistricts({ cluster: clusterId, isActive: 'true' });
        if (res.data && res.data.data) {
          setDistrictOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching districts", e);
      }
    }
  };

  const handleDistrictSelect = (districtId, districtName) => {
    if (districtId === 'all') {
      setSelectedDistrict('all');
      setSelectedDistrictName('All Districts');
      setSelectedAllDistricts(true);
      loadBenchmarkPrices('all', selectedCluster, selectedState);
    } else {
      setSelectedDistrict(districtId);
      setSelectedDistrictName(districtName);
      setSelectedAllDistricts(false);
      loadBenchmarkPrices(districtId, selectedCluster, selectedState);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      deliveryType: '',
      benchmarkPrice: '',
      category: 'All',
      subCategory: 'All',
      projectType: 'All',
      subProjectType: 'All',
      combokit: 'All'
    });
    setEditingId(null);
  };

  const handleEdit = (price) => {
    setEditingId(price._id);
    setFormData({
      deliveryType: price.deliveryType?._id || price.deliveryType || '',
      benchmarkPrice: price.benchmarkPrice || '',
      category: price.category || 'All',
      subCategory: price.subCategory || 'All',
      projectType: price.projectType || 'All',
      subProjectType: price.subProjectType || 'All',
      combokit: price.combokit || 'All'
    });
  };

  const handleSubmit = async () => {
    if (selectedAllStates) {
      if (!selectedCluster) {
        showNotification('Please select a cluster first', 'error');
        return;
      }
      if (!selectedDistrict) {
        showNotification('Please select a district first', 'error');
        return;
      }
    }

    if (!selectedDistrict && !selectedAllDistricts) {
      showNotification('Please select a district first', 'error');
      return;
    }
    if (!formData.deliveryType || !formData.benchmarkPrice) {
      showNotification('Delivery Type and Benchmark Price are required', 'error');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const payload = { ...formData, status: 'active' };
        // Carry over any explicitly selected district if available, otherwise rely on the existing record's reference
        if (selectedDistrict && selectedDistrict !== 'all') {
          payload.state = selectedState;
          payload.cluster = selectedCluster;
          payload.district = selectedDistrict;
        }

        await updateBenchmarkPrice(editingId, payload);
        showNotification('Benchmark price updated successfully', 'success');
        refreshPrices();
        resetForm();
      } else if (selectedAllDistricts) {
        for (const district of districtOptions) {
          const payload = {
            ...formData,
            state: district.state?._id || district.state || selectedState,
            cluster: district.cluster?._id || district.cluster || selectedCluster,
            district: district._id,
            status: 'active'
          };
          if (payload.state === 'all' || payload.cluster === 'all') continue;
          await createBenchmarkPrice(payload);
        }
        showNotification('Benchmark prices created for all selected districts', 'success');
        refreshPrices();
        resetForm();
      } else {
        const payload = {
          ...formData,
          state: selectedState,
          cluster: selectedCluster,
          district: selectedDistrict,
          status: 'active'
        };

        await createBenchmarkPrice(payload);
        showNotification('Benchmark price created successfully', 'success');
        refreshPrices();
        resetForm();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this benchmark price?')) {
      try {
        await deleteBenchmarkPrice(id);
        showNotification('Benchmark price deleted', 'success');
        refreshPrices();
      } catch (error) {
        showNotification('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Delivery Benchmark Price</h1>
          <button
            className="mt-2 bg-[#0ea5e9] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 hover:bg-[#0284c7] transition"
            onClick={() => setLocationCardsVisible(!locationCardsVisible)}
          >
            {locationCardsVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            {locationCardsVisible ? 'Hide Location Cards' : 'Show Location Cards'}
          </button>
        </div>
      </div>

      {/* Hierarchy Selection Cards */}
      {locationCardsVisible && (
        <div className="space-y-6 mb-8">
          {/* State Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Select State</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedAllStates
                  ? 'bg-[#7dd3fc] border-[#38bdf8] text-slate-800'
                  : 'bg-white border-gray-200 hover:border-[#38bdf8]'
                  }`}
                onClick={() => handleStateSelect('all', 'All States')}
              >
                <div>
                  <div className="font-semibold text-sm text-[#0284c7]">Select All</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase">ALL IN</div>
                </div>
              </div>

              {states.map(state => (
                <div
                  key={state._id}
                  className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedState === state._id
                    ? 'bg-[#7dd3fc] border-[#38bdf8] text-slate-800'
                    : 'bg-white border-gray-200 hover:border-[#38bdf8]'
                    }`}
                  onClick={() => handleStateSelect(state._id, state.name)}
                >
                  <div>
                    <div className="font-semibold text-sm">{state.name}</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase">{state.name.substring(0, 2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cluster Section */}
          {selectedState && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Select Cluster</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                  className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedAllClusters
                    ? 'bg-[#e0f2fe] border-[#7dd3fc] text-slate-800'
                    : 'bg-white border-gray-200 hover:border-[#7dd3fc]'
                    }`}
                  onClick={() => handleClusterSelect('all', 'All Clusters')}
                >
                  <div>
                    <div className="font-semibold text-sm text-[#0284c7]">Select All</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedStateName}</div>
                  </div>
                </div>

                {clusterOptions.length === 0 ? <p className="text-sm text-gray-500">No clusters found.</p> :
                  clusterOptions.map(cluster => (
                    <div
                      key={cluster._id}
                      className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedCluster === cluster._id
                        ? 'bg-[#e0f2fe] border-[#7dd3fc] text-slate-800'
                        : 'bg-white border-gray-200 hover:border-[#7dd3fc]'
                        }`}
                      onClick={() => handleClusterSelect(cluster._id, cluster.name)}
                    >
                      <div>
                        <div className="font-semibold text-sm">{cluster.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{selectedStateName}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* District Section */}
          {selectedCluster && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Select District</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                  className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedAllDistricts
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-slate-800'
                    : 'bg-white border-gray-200 hover:border-[#bae6fd]'
                    }`}
                  onClick={() => handleDistrictSelect('all', 'All Districts')}
                >
                  <div>
                    <div className="font-semibold text-sm text-[#0284c7]">Select All</div>
                    <div className="text-xs text-gray-400 mt-1">Apply to all districts</div>
                  </div>
                </div>

                {districtOptions.length === 0 ? <p className="text-sm text-gray-500">No districts found.</p> :
                  districtOptions.map(district => (
                    <div
                      key={district._id}
                      className={`border rounded-md p-4 text-center cursor-pointer transition-colors flex justify-center items-center h-20 shadow-sm ${selectedDistrict === district._id
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-slate-800'
                        : 'bg-white border-gray-200 hover:border-[#bae6fd]'
                        }`}
                      onClick={() => handleDistrictSelect(district._id, district.name)}
                    >
                      <div>
                        <div className="font-semibold text-sm">{district.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{selectedClusterName}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Matrix & Data Table (Only visible when District is selected) */}
      {(selectedDistrict || selectedAllDistricts) ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6 animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[15px] border-collapse bg-[#f8fafc]">
              <thead className="bg-[#2d3748] text-white font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Delivery Type</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Cluster</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Betchmark Price</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Category Type</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Sub Category</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Project Type</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Sub Project Type</th>
                  <th className="px-4 py-3 text-center border-r border-[#3f4a5a]">Combokit Selection</th>
                  <th className="px-4 py-3 text-center">{editingId ? 'Actions' : 'Create'}</th>
                </tr>
              </thead>

              <tbody className="bg-[#f4f7f9] border-b-8 border-white">
                {/* Creation Form Row */}
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-3">
                    <select
                      name="deliveryType"
                      value={formData.deliveryType}
                      onChange={handleInputChange}
                      className="w-[140px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="">Select Type</option>
                      {deliveryTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    {selectedAllDistricts ? (
                      <div className="text-[12px] font-bold text-[#0284c7] italic px-1">
                        All Selected
                      </div>
                    ) : (
                      <select
                        disabled
                        className="w-[120px] text-[14px] px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 cursor-not-allowed appearance-none"
                      >
                        <option>{selectedClusterName}</option>
                      </select>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      name="benchmarkPrice"
                      value={formData.benchmarkPrice}
                      onChange={handleInputChange}
                      placeholder="e.g. 1222"
                      className="w-[100px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-[120px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="All">All</option>
                      <option value="Solar Rooftop">Solar Rooftop</option>
                      <option value="Water Heater">Water Heater</option>
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      className="w-[120px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="All">All</option>
                      <option value="Residential">Residential</option>
                      <option value="Commerical">Commerical</option>
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-[120px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="All">All</option>
                      <option value="3kw-5kw">3kw-5kw</option>
                      <option value="10kw-25kw">10kw-25kw</option>
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <select
                      name="subProjectType"
                      value={formData.subProjectType}
                      onChange={handleInputChange}
                      className="w-[120px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="All">All</option>
                      <option value="On-Grid">On-Grid</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Off-Grid">Off-Grid</option>
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <select
                      name="combokit"
                      value={formData.combokit}
                      onChange={handleInputChange}
                      className="w-[140px] text-[14px] px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-700"
                    >
                      <option value="All">All</option>
                      <option value="Adani+Waree">Adani+Waree</option>
                      <option value="Vsole+Waree">Vsole+Waree</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center min-w-[140px]">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#0284c7] text-white px-3 py-2 rounded text-[14px] font-medium hover:bg-[#0369a1] transition min-w-[70px]"
                      >
                        {loading ? <Loader size={12} className="animate-spin text-center mx-auto" /> : (editingId ? 'Update' : 'Create')}
                      </button>
                      {editingId && (
                        <button
                          onClick={resetForm}
                          disabled={loading}
                          className="bg-gray-400 text-white px-3 py-2 rounded text-[14px] font-medium hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Existing Prices Data Table */}
            <table className="w-full text-center text-[15px] border-collapse bg-white">
              <thead className="bg-[#2d3748] text-white font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center">Delivery Type</th>
                  <th className="px-4 py-3 text-center">Cluster</th>
                  <th className="px-4 py-3 text-center">Betchmark Price</th>
                  <th className="px-4 py-3 text-center">Category Type</th>
                  <th className="px-4 py-3 text-center">Sub Category</th>
                  <th className="px-4 py-3 text-center">Project Type</th>
                  <th className="px-4 py-3 text-center">Sub Project Type</th>
                  <th className="px-4 py-3 text-center">Combokit Selection</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {dataLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Loading prices for {selectedDistrictName}...</p>
                    </td>
                  </tr>
                ) : benchmarkPrices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500 text-sm">
                      No benchmark prices set for {selectedDistrictName}. Create one above!
                    </td>
                  </tr>
                ) : (
                  benchmarkPrices.map((price, idx) => (
                    <tr key={price._id} className={`${idx % 2 === 0 ? 'bg-[#f4f7f9]' : 'bg-white'} text-gray-700`}>
                      <td className="px-4 py-4">{price.deliveryType?.name || 'N/A'}</td>
                      <td className="px-4 py-4">{price.cluster?.name || selectedClusterName}</td>
                      <td className="px-4 py-4">{price.benchmarkPrice}</td>
                      <td className="px-4 py-4">{price.category || 'All'}</td>
                      <td className="px-4 py-4">{price.subCategory || 'All'}</td>
                      <td className="px-4 py-4">{price.projectType || 'All'}</td>
                      <td className="px-4 py-4">{price.subProjectType || 'All'}</td>
                      <td className="px-4 py-4">{price.combokit || 'All'}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center space-x-0">
                          <button
                            onClick={() => handleEdit(price)}
                            className="bg-[#eab308] text-white px-3 py-1 text-xs font-medium rounded-l hover:bg-yellow-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(price._id)}
                            className="bg-[#ef4444] text-white px-3 py-1 text-xs font-medium rounded-r hover:bg-red-600 transition"
                          >
                            Delete
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
      ) : (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
          <p>Please navigate the locations and select a District to view/set Benchmark Prices.</p>
        </div>
      )}

      {/* Footer text matching screenshot */}
      <div className="mt-8 text-center text-xs text-gray-400 font-medium">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>
    </div>
  );
};

export default DeliveryBenchmarkPrice;