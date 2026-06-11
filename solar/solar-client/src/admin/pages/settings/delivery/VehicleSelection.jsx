import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  PlusCircle,
  Save,
  Edit,
  Trash2,
  Upload,
  Ruler,
  Package,
  MapPin,
  Layers,
  Loader,
  XCircle,
  CheckCircle,
  Search,
  EyeOff,
  Eye,
  Map
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import { locationAPI } from '../../../../api/api';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import Select from 'react-select';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getDeliveryTypes
} from '../../../../services/delivery/deliveryApi';

const VehicleManagement = () => {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Common Location State
  const { countries, states, fetchCountries, fetchStates } = useLocations();
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [deliveryStats, setDeliveryStats] = useState({ country: {}, state: {}, cluster: {}, district: {} });

  // Hierarchical Location Selection
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [clusterOptions, setClusterOptions] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedClusterName, setSelectedClusterName] = useState('');
  const [selectedAllClusters, setSelectedAllClusters] = useState(false);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedWarehouseName, setSelectedWarehouseName] = useState('');
  const [selectedAllWarehouses, setSelectedAllWarehouses] = useState(false);
  const [selectedAllStates, setSelectedAllStates] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    deliveryType: [],
    length: '',
    width: '',
    height: '',
    capacity: '',
    costPerKm: '', // Added as per user requirement
    kw: '',
    range: '',
    orderType: [],
    locationType: [],
    image: '',
    status: 'active'
  });

  const fileInputRef = useRef(null);

  // Options
  const vehicleTypeOptions = ['Open Truck', 'Container Truck', 'Pickup Van'];
  // const deliveryTypeOptions = ['Prime', 'Regular', 'Express']; // Removed hardcoded
  const orderTypeOptions = ['Combokit', 'CustomKit'];
  const locationTypeOptions = ['Rural', 'Urban'];

  // React Select Styles
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#0284c7' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#0284c7' : '#cbd5e1'
      },
      minHeight: '38px',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      fontSize: '14px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e0f2fe',
      borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#0369a1',
      fontSize: '13px',
      fontWeight: '500',
      padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#0284c7',
      '&:hover': {
        backgroundColor: '#bae6fd',
        color: '#0369a1',
        borderRadius: '0 4px 4px 0',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      zIndex: 100,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f1f5f9' : 'transparent',
      color: state.isSelected ? '#0284c7' : '#475569',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      '&:active': {
        backgroundColor: '#e2e8f0'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b'
      }
    })
  };

  // Initial Fetch
  useEffect(() => {
    fetchCountries();
    fetchDeliveryTypes();
  }, []);

  const fetchDeliveryStats = async () => {
    try {
      const res = await getVehicles(); // Fetch all
      if (res.success && res.data) {
        const stats = { country: {}, state: {}, cluster: {}, district: {}, warehouse: {} };

        res.data.forEach(vehicle => {
          if (vehicle.state?._id) stats.state[vehicle.state._id] = (stats.state[vehicle.state._id] || 0) + 1;
          if (vehicle.cluster?._id) stats.cluster[vehicle.cluster._id] = (stats.cluster[vehicle.cluster._id] || 0) + 1;
          if (vehicle.district?._id) stats.district[vehicle.district._id] = (stats.district[vehicle.district._id] || 0) + 1;
          if (vehicle.warehouse?._id) stats.warehouse[vehicle.warehouse._id] = (stats.warehouse[vehicle.warehouse._id] || 0) + 1;
        });

        // Calculate Country counts by summing state counts
        states.forEach(state => {
          const cId = state.country?._id || state.country;
          if (cId && stats.state[state._id]) {
            stats.country[cId] = (stats.country[cId] || 0) + stats.state[state._id];
          }
        });

        setDeliveryStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch vehicle stats", error);
    }
  };

  useEffect(() => {
    fetchDeliveryStats();
  }, [states, vehicles]); // Re-calculate when states or vehicles change

  const fetchVehiclesByLocation = async (warehouseId) => {
    if (!warehouseId) return;
    try {
      setLoading(true);
      const res = await getVehicles({ warehouse: warehouseId });
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (error) {
      showNotification('Failed to load vehicles for warehouse', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryTypes = async () => {
    try {
      const params = {
        status: 'active',
        includeGlobal: 'true'
      };

      if (selectedState && selectedState !== 'all') params.state = selectedState;
      if (selectedCluster && selectedCluster !== 'all') params.cluster = selectedCluster;
      if (selectedWarehouse && selectedWarehouse !== 'all') params.warehouse = selectedWarehouse;

      const response = await getDeliveryTypes(params);
      if (response.success) {
        setDeliveryTypes(response.data.map(type => type.name));
      }
    } catch (error) {
      console.error('Error fetching delivery types:', error);
    }
  };

  useEffect(() => {
    fetchDeliveryTypes();
  }, [selectedState, selectedCluster, selectedWarehouse]);

  // Location Handlers
  const handleCountrySelect = (countryId, countryName) => {
    setSelectedCountry(countryId);
    setSelectedCountryName(countryName);
    fetchStates({ countryId: countryId });

    // Reset subsequent selections
    setSelectedState('');
    setSelectedStateName('');
    setSelectedAllStates(false);
    setClusterOptions([]);
    setSelectedCluster('');
    setSelectedClusterName('');
    setSelectedAllClusters(false);
    setWarehouseOptions([]);
    setSelectedWarehouse('');
    setSelectedWarehouseName('');
    setSelectedAllWarehouses(false);
    setVehicles([]);
  };

  const handleStateSelect = async (stateId, stateName) => {
    if (stateId === 'all') {
      setSelectedState('all');
      setSelectedStateName('All States');
      setSelectedAllStates(true);
      setSelectedCluster('');
      setSelectedClusterName('');
      setSelectedAllClusters(false);
      setClusterOptions([]);
      setSelectedWarehouse('');
      setSelectedWarehouseName('');
      setSelectedAllWarehouses(false);
      setWarehouseOptions([]);
      setVehicles([]);

      try {
        const res = await locationAPI.getAllClusters({ countryId: selectedCountry, isActive: 'true' });
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
      setSelectedWarehouse('');
      setSelectedWarehouseName('');
      setSelectedAllWarehouses(false);
      setWarehouseOptions([]);
      setVehicles([]);

      try {
        const res = await locationAPI.getAllClusters({ stateId: stateId, isActive: 'true' });
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
      setSelectedWarehouse('');
      setSelectedWarehouseName('');
      setSelectedAllWarehouses(false);
      setWarehouseOptions([]);
      setVehicles([]);

      try {
        const queryParams = selectedState === 'all' ? { countryId: selectedCountry, isActive: 'true' } : { stateId: selectedState, isActive: 'true' };
        const res = await inventoryApi.getAllWarehouses(queryParams);
        if (res.data && res.data.data) {
          setWarehouseOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching all warehouses", e);
      }
    } else {
      setSelectedCluster(clusterId);
      setSelectedClusterName(clusterName);
      setSelectedAllClusters(false);
      setSelectedWarehouse('');
      setSelectedWarehouseName('');
      setSelectedAllWarehouses(false);
      setWarehouseOptions([]);
      setVehicles([]);

      try {
        const res = await inventoryApi.getAllWarehouses({ cluster: clusterId, status: 'Active' });
        if (res.data && res.data.data) {
          setWarehouseOptions(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching warehouses", e);
      }
    }
  };

  const handleWarehouseSelect = (warehouseId, warehouseName) => {
    if (warehouseId === 'all') {
      setSelectedWarehouse('all');
      setSelectedWarehouseName('All Warehouses');
      setSelectedAllWarehouses(true);
      setVehicles([]);
    } else {
      setSelectedWarehouse(warehouseId);
      setSelectedWarehouseName(warehouseName);
      setSelectedAllWarehouses(false);
      fetchVehiclesByLocation(warehouseId);
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (selectedOptions, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  // Handle image upload (Base64 for simplicity as no upload route specified)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showNotification('Image size should be less than 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      deliveryType: '',
      length: '',
      width: '',
      height: '',
      capacity: '',
      costPerKm: '',
      kw: '',
      range: '',
      orderType: [],
      locationType: [],
      image: '',
      status: 'active'
    });
    setEditId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.deliveryType || formData.deliveryType.length === 0) {
      showNotification('Please select at least one delivery type', 'error');
      return;
    }

    // Mapping form data to API payload
    const payload = {
      name: formData.name,
      type: formData.type,
      deliveryType: formData.deliveryType,
      dimensions: {
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height)
      },
      capacity: formData.capacity,
      costPerKm: Number(formData.costPerKm),
      kw: Number(formData.kw),
      range: Number(formData.range),
      orderType: formData.orderType,
      locationType: formData.locationType,
      image: formData.image,
      status: formData.status,
      country: selectedCountry,
      state: selectedState,
      cluster: selectedCluster,
      warehouse: selectedWarehouse
    };

    try {
      if (editId) {
        await updateVehicle(editId, payload);
        showNotification('Vehicle updated successfully!', 'success');
      } else {
        await createVehicle(payload);
        showNotification('Vehicle added successfully!', 'success');
      }
      fetchVehiclesByLocation(selectedWarehouse);
      fetchDeliveryStats();
      resetForm();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // Edit vehicle
  const editVehicle = (vehicle) => {
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      deliveryType: Array.isArray(vehicle.deliveryType) ? vehicle.deliveryType : (vehicle.deliveryType ? [vehicle.deliveryType] : []),
      length: vehicle.dimensions?.length || '',
      width: vehicle.dimensions?.width || '',
      height: vehicle.dimensions?.height || '',
      capacity: vehicle.capacity,
      costPerKm: vehicle.costPerKm || '',
      kw: vehicle.kw,
      range: vehicle.range,
      orderType: Array.isArray(vehicle.orderType) ? vehicle.orderType : (vehicle.orderType ? [vehicle.orderType] : []),
      locationType: Array.isArray(vehicle.locationType) ? vehicle.locationType : (vehicle.locationType ? [vehicle.locationType] : []),
      image: vehicle.image,
      status: vehicle.status
    });
    setEditId(vehicle._id);

    // If vehicle has location data but it's not currently selected, update it
    if (vehicle.country?._id && vehicle.country._id !== selectedCountry) handleCountrySelect(vehicle.country._id, vehicle.country.name);
    if (vehicle.state?._id && vehicle.state._id !== selectedState) handleStateSelect(vehicle.state._id, vehicle.state.name);
    if (vehicle.cluster?._id && vehicle.cluster._id !== selectedCluster) handleClusterSelect(vehicle.cluster._id, vehicle.cluster.name);
    if (vehicle.warehouse?._id && vehicle.warehouse._id !== selectedWarehouse) handleWarehouseSelect(vehicle.warehouse._id, vehicle.warehouse.name);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete vehicle
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        showNotification('Vehicle deleted successfully!', 'success');
        fetchVehiclesByLocation(selectedWarehouse);
        fetchDeliveryStats();
      } catch (error) {
        showNotification('Failed to delete vehicle', 'error');
      }
    }
  };

  // Toggle Status
  const handleStatusToggle = async (vehicle) => {
    try {
      const newStatus = vehicle.status === 'active' ? 'inactive' : 'active';
      await updateVehicle(vehicle._id, { status: newStatus });
      showNotification('Status updated', 'success');
      fetchVehiclesByLocation(selectedWarehouse);
      fetchDeliveryStats();
    } catch (error) {
      showNotification('Status update failed', 'error');
    }
  };

  // Filter
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center">
            <Truck className="w-6 h-6 text-blue-600 mr-2" />
            Vehicle Management
          </h1>
        </div>
        <button
          className="bg-[#0ea5e9] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 hover:bg-[#0284c7] transition"
          onClick={() => setLocationCardsVisible(!locationCardsVisible)}
        >
          {locationCardsVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          {locationCardsVisible ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      {/* Hierarchy Selection Cards */}
      {locationCardsVisible && (
        <div className="space-y-6 mb-8">
          {/* Country Selection */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Select Country</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {countries.map(country => (
                <div
                  key={country._id}
                  className={`relative border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedCountry === country._id
                    ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={() => handleCountrySelect(country._id, country.name)}
                >
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
                    {deliveryStats.country[country._id] || 0}
                  </div>
                  <div className="font-semibold text-sm">{country.name}</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase">{country.name.substring(0, 2)}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedCountry && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Select State</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {states.length > 0 && (
                  <div
                    className={`border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedState === 'all'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleStateSelect('all', 'All States')}
                  >
                    <div className="font-semibold text-sm">Select All</div>
                    <div className="text-xs text-gray-400 mt-1 uppercase">ALL IN</div>
                  </div>
                )}
                {states.map(state => (
                  <div
                    key={state._id}
                    className={`relative border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedState === state._id
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleStateSelect(state._id, state.name)}
                  >
                    <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-200 shadow-sm">
                      {deliveryStats.state[state._id] || 0}
                    </div>
                    <div className="font-semibold text-sm">{state.name}</div>
                    <div className="text-xs text-gray-400 mt-1 uppercase">{state.name.substring(0, 2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedState && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Select Cluster</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {clusterOptions.length > 0 && (
                  <div
                    className={`border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedCluster === 'all'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleClusterSelect('all', 'All Clusters')}
                  >
                    <div className="font-semibold text-sm">Select All</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedStateName}</div>
                  </div>
                )}
                {clusterOptions.map(cluster => (
                  <div
                    key={cluster._id}
                    className={`relative border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedCluster === cluster._id
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleClusterSelect(cluster._id, cluster.name)}
                  >
                    <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-200 shadow-sm">
                      {deliveryStats.cluster[cluster._id] || 0}
                    </div>
                    <div className="font-semibold text-sm">{cluster.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedStateName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCluster && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Select Warehouse</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {warehouseOptions.length > 0 && (
                  <div
                    className={`border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedWarehouse === 'all'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleWarehouseSelect('all', 'All Warehouses')}
                  >
                    <div className="font-semibold text-sm">Select All</div>
                    <div className="text-xs text-gray-400 mt-1">Apply to all warehouses</div>
                  </div>
                )}
                {warehouseOptions.map(warehouse => (
                  <div
                    key={warehouse._id}
                    className={`relative border rounded-md p-4 text-center cursor-pointer transition-colors shadow-sm ${selectedWarehouse === warehouse._id
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => handleWarehouseSelect(warehouse._id, warehouse.name)}
                  >
                    <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200 shadow-sm">
                      {deliveryStats.warehouse[warehouse._id] || 0}
                    </div>
                    <div className="font-semibold text-sm">{warehouse.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedClusterName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedWarehouse ? (
        <div className="animate-in fade-in duration-500">
          <div className="mb-4 flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 pl-10 pr-3 py-2 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

      {/* Add/Edit Vehicle Form */}
      <div className="bg-white border text-[14px] border-gray-200 shadow-sm rounded-md mb-8">
        <div className="bg-[#0284c7] text-white p-3 flex justify-between items-center">
          <h2 className="text-base font-semibold flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" />
            {editId ? 'Edit Vehicle' : 'Add/Edit Vehicle'}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-white hover:text-gray-200 text-sm">
              Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Vehicle Image Upload */}
              <div className="lg:w-1/4">
                <div className="border border-gray-200 rounded p-4 text-center">
                  <div className="w-full h-32 bg-white flex items-center justify-center overflow-hidden mb-4">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Truck className="w-full h-full text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden text-xs bg-white">
                    <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 cursor-pointer border-r border-gray-300 whitespace-nowrap">
                      Choose File
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <span className="px-3 text-gray-500 truncate">
                      {fileInputRef.current?.files[0]?.name || 'No file chosen'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Upload vehicle image (max 2MB)</p>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="lg:w-3/4 space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    {formData.name === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Vehicle Name</span>}
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" required />
                  </div>
                  <div>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-700" required>
                      <option value="">Vehicle Type</option>
                      {vehicleTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Select
                      isMulti
                      name="deliveryType"
                      value={deliveryTypes.filter(opt => formData.deliveryType.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                      onChange={(selected) => handleMultiSelectChange(selected, 'deliveryType')}
                      options={deliveryTypes.map(opt => ({ value: opt, label: opt }))}
                      placeholder="Delivery Type"
                      className="text-sm"
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    {formData.length === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Length (ft)</span>}
                    <input type="number" name="length" value={formData.length} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="relative">
                    {formData.width === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Width (ft)</span>}
                    <input type="number" name="width" value={formData.width} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="relative">
                    {formData.height === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Height (ft)</span>}
                    <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="relative">
                    {formData.capacity === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Load Capacity (Tons)</span>}
                    <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" required />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      {formData.kw === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Solar Panel Capacity</span>}
                      <input type="number" name="kw" value={formData.kw} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                    </div>
                    <span className="text-gray-600 font-medium ml-3 text-[13px]">KW</span>
                  </div>

                  <div className="flex items-center">
                    <div className="relative flex-1">
                      {formData.range === '' && <span className="absolute left-3 top-2 text-gray-400 text-[13px] pointer-events-none">Maximum Range</span>}
                      <input type="number" name="range" value={formData.range} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                    </div>
                    <span className="text-gray-600 font-medium ml-3 text-[13px]">KM</span>
                  </div>

                  <div className="flex-1">
                    <Select
                      isMulti
                      name="orderType"
                      value={orderTypeOptions.filter(opt => formData.orderType.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                      onChange={(selected) => handleMultiSelectChange(selected, 'orderType')}
                      options={orderTypeOptions.map(opt => ({ value: opt, label: opt }))}
                      placeholder="Order Type"
                      className="text-sm"
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex-1">
                    <Select
                      isMulti
                      name="locationType"
                      value={locationTypeOptions.filter(opt => formData.locationType.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                      onChange={(selected) => handleMultiSelectChange(selected, 'locationType')}
                      options={locationTypeOptions.map(opt => ({ value: opt, label: opt }))}
                      placeholder="Location Type"
                      className="text-sm"
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div>
                    <button type="submit" disabled={loading} className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2 rounded font-medium flex items-center transition-colors">
                      <Save className="w-4 h-4 mr-2" />
                      {editId ? 'Update Vehicle' : 'Save Vehicle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Vehicle List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-[#0284c7] animate-spin" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
          No vehicles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden relative">
              {/* Image Section */}
              <div className="h-56 bg-white flex items-center justify-center p-4">
                {vehicle.image ? (
                  <img src={vehicle.image} alt={vehicle.name} className="h-full object-contain" />
                ) : (
                  <Truck className="w-16 h-16 text-gray-300" />
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 pt-2 text-[14.5px] text-[#0f172a]">

                {/* Title & Badge */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">{vehicle.name}</h3>
                  <span className="bg-[#0284c7] text-white text-[12px] font-semibold px-3 py-1.5 rounded-md shadow-sm">
                    {vehicle.type || 'Vehicle'}
                  </span>
                </div>

                {/* Properties List */}
                <div className="space-y-3.5">
                  <div className="flex justify-between">
                    <span className="font-bold">Delivery</span>
                    <span className="text-gray-700">{Array.isArray(vehicle.deliveryType) ? vehicle.deliveryType.join(', ') : (vehicle.deliveryType || '-')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Dimensions</span>
                    <span className="text-gray-700">{vehicle.dimensions?.length || 0}×{vehicle.dimensions?.width || 0}×{vehicle.dimensions?.height || 0} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Capacity</span>
                    <span className="text-gray-700">{vehicle.capacity || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Solar KW</span>
                    <span className="text-gray-700">{vehicle.kw || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Range</span>
                    <span className="text-gray-700">{vehicle.range || 0} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Order Type</span>
                    <span className="text-gray-700">{Array.isArray(vehicle.orderType) ? vehicle.orderType.join(', ') : (vehicle.orderType || '-')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Location</span>
                    <span className="text-gray-700">{Array.isArray(vehicle.locationType) ? vehicle.locationType.join(', ') : (vehicle.locationType || '-')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 text-[13px] font-medium">
                  <button
                    onClick={() => editVehicle(vehicle)}
                    className="text-[#0284c7] hover:text-blue-800 flex items-center transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400 mt-8">
          <Truck size={48} className="text-gray-200 mb-4" />
          <p className="text-lg font-bold">Please select a Warehouse.</p>
          <p className="text-sm font-medium mt-1 text-gray-300 uppercase tracking-wider">Select a location from the cards above to manage vehicles.</p>
        </div>
      )}

      {/* Footer text */}
      <div className="mt-8 text-center text-[13px] text-gray-500 font-medium pb-4">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>
    </div>
  );
};

export default VehicleManagement;