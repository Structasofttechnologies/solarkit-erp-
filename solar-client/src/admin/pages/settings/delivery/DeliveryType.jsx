import React, { useState, useEffect } from 'react';
import {
  Truck, Plus, Search, Loader, EyeOff, Eye,
  Settings, Map, Tag, Clock, DollarSign, AlertCircle, Save, Check,
  Edit2, Trash2, X
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import Select from 'react-select';
import {
  getDeliveryTypes,
  createDeliveryType,
  updateDeliveryType,
  deleteDeliveryType,
  deleteApplicableCategory,
  addApplicableCategory,
  updateApplicableCategory
} from '../../../../services/delivery/deliveryApi';
import { getAllOrderProcurementSettings } from '../../../../services/settings/orderProcurementSettingApi';
import { locationAPI } from '../../../../api/api';
import { productApi } from '../../../../api/productApi';
import inventoryApi from '../../../../services/inventory/inventoryApi';

const SECTION_OPTIONS = [
  { id: 'setup', label: 'Delivery Type Setup' },
  { id: 'coverage', label: 'Coverage Area' },
  { id: 'categories', label: 'Category Types' },
  { id: 'timing', label: 'Delivery Charges & Timing' },
  // { id: 'cost', label: 'Cost & Charges' },
  { id: 'restrictions', label: 'Restrictions' },
];

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  coverageRange: '',
  applicableCategories: [],
  deliveryTiming: {
    minDays: 3,
    maxDays: 5,
    estimatedDelivery: '3-5 Days',
    deliveryCharges: 500,
    procurementResults: []
  },
  coverageType: [],
  restrictions: {
    warehouses: []
  },
  status: 'active'
};

const DeliveryType = () => {
  // Common Location State
  const { countries, states, fetchCountries, fetchStates } = useLocations();

  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Data
  const [deliveryTypes, setDeliveryTypes] = useState([]);

  // Tab State
  const [activeTabId, setActiveTabId] = useState('new'); // 'new' or valid mapped delivery type ID
  const [activeSection, setActiveSection] = useState('setup');
  const [deliveryStats, setDeliveryStats] = useState({ country: {}, state: {}, cluster: {}, warehouse: {} });

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

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [procurementOptions, setProcurementOptions] = useState([]);

  // Master Mapping Edit Modal State
  const [isEditMappingModalOpen, setIsEditMappingModalOpen] = useState(false);
  const [editMappingForm, setEditMappingForm] = useState({
    mappingIds: [],
    categoryId: '',
    subCategoryId: '',
    projectTypeFrom: '',
    projectTypeTo: '',
    subProjectTypeId: '',
    clusterIds: [],
    stateId: '',
    deliveryCharges: 0
  });
  const [allClustersForState, setAllClustersForState] = useState([]);


  const [masterData, setMasterData] = useState({
    categories: [],
    subCategories: [],
    subProjectTypes: [],
    projectTypes: [],
    mappings: []
  });
  const [allProcurementSettings, setAllProcurementSettings] = useState([]);

  // Initial Fetch
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchDeliveryStats = async () => {
    try {
      const res = await getDeliveryTypes(); // Fetch all
      if (res.success && res.data) {
        const stats = { country: {}, state: {}, cluster: {}, warehouse: {} };

        // We need state-to-country mapping because DeliveryType doesn't store country
        // but states list from useLocations has it.
        // If states isn't loaded yet, country counts will be updated later.

        res.data.forEach(type => {
          if (type.state?._id) stats.state[type.state._id] = (stats.state[type.state._id] || 0) + 1;
          if (type.cluster?._id) stats.cluster[type.cluster._id] = (stats.cluster[type.cluster._id] || 0) + 1;
          if (type.warehouse?._id) stats.warehouse[type.warehouse._id] = (stats.warehouse[type.warehouse._id] || 0) + 1;
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
      console.error("Failed to fetch delivery stats", error);
    }
  };

  useEffect(() => {
    fetchDeliveryStats();
  }, [states]); // Re-calculate country stats when states are loaded

  useEffect(() => {
    const fetchProcurementSettings = async () => {
      try {
        const res = await getAllOrderProcurementSettings();
        if (res.success && res.data) {
          setAllProcurementSettings(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch procurement settings", error);
      }
    };
    fetchProcurementSettings();

    const fetchMasterData = async () => {
      try {
        const [catRes, subCatRes, subPTypeRes, mappingRes] = await Promise.all([
          productApi.getCategories(),
          productApi.getSubCategories(),
          productApi.getSubProjectTypes(),
          productApi.getProjectCategoryMappings()
        ]);

        const getArr = (res) => res?.data?.data || res?.data || [];
        const mappings = getArr(mappingRes);

        // Extract unique project type ranges (e.g., "3 to 30 kW")
        const dynamicProjectTypes = [...new Set(mappings.map(m =>
          `${m.projectTypeFrom} to ${m.projectTypeTo} kW`
        ))].sort();

        setMasterData({
          categories: getArr(catRes),
          subCategories: getArr(subCatRes),
          subProjectTypes: getArr(subPTypeRes),
          projectTypes: dynamicProjectTypes,
          mappings: mappings
        });
      } catch (err) {
        console.error("Failed to fetch master data", err);
      }
    };
    fetchMasterData();
  }, []);

  // Group mappings exactly like AddProjectCategory.jsx for consistent display
  const groupedMappings = Object.values(masterData.mappings.reduce((acc, curr) => {
    // Filter out rows with missing core categorization data
    if (!curr.categoryId || !curr.subCategoryId) return acc;

    // Unique key: category, subCategory, subProjectType, ranges
    const key = `${curr.categoryId?._id || curr.categoryId}-${curr.subCategoryId?._id || curr.subCategoryId}-${curr.subProjectTypeId?._id || 'none'}-${curr.projectTypeFrom}-${curr.projectTypeTo}`;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        mappingIds: [curr._id],
        clusters: curr.clusterId ? [curr.clusterId] : []
      };
    } else {
      if (curr.clusterId && !acc[key].clusters.find(c => c._id === curr.clusterId._id)) {
        acc[key].clusters.push(curr.clusterId);
        acc[key].mappingIds.push(curr._id);
      }
    }
    return acc;
  }, {})).filter(m => {
    // Double check that names are available to avoid N/A rows
    const catName = m.categoryId?.name || (typeof m.categoryId === 'string' ? m.categoryId : null);
    const subCatName = m.subCategoryId?.name || (typeof m.subCategoryId === 'string' ? m.subCategoryId : null);
    return catName && subCatName;
  });

  // Filter Procurement Options by Location
  useEffect(() => {
    if (!allProcurementSettings.length) return;

    let activeCombinations = [];

    if (selectedCluster && selectedCluster !== 'all') {
      // Find mappings for specific cluster
      activeCombinations = masterData.mappings
        .filter(m => (m.clusterId?._id || m.clusterId) === selectedCluster)
        .map(m => {
          const ptRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
          return `${m.categoryId?.name || m.categoryId}|${m.subCategoryId?.name || m.subCategoryId}|${ptRange}|${m.subProjectTypeId?.name || m.subProjectTypeId || 'none'}`;
        });
    } else if (selectedState && selectedState !== 'all') {
      // Find mappings for whole state
      activeCombinations = masterData.mappings
        .filter(m => (m.stateId?._id || m.stateId) === selectedState)
        .map(m => {
          const ptRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
          return `${m.categoryId?.name || m.categoryId}|${m.subCategoryId?.name || m.subCategoryId}|${ptRange}|${m.subProjectTypeId?.name || m.subProjectTypeId || 'none'}`;
        });
    }

    const options = [];
    allProcurementSettings.forEach(item => {
      // Check if this setting matches any active mapping for the selected location
      const itemCat = item.category?.name || item.category;
      const itemSubCat = item.subCategory?.name || item.subCategory;
      const itemPt = item.projectType?.name || item.projectType;
      const itemSubPt = item.subProjectType?.name || item.subProjectType || 'none';

      const comboKey = `${itemCat}|${itemSubCat}|${itemPt}|${itemSubPt}`;

      // Only show if it matches an active mapping in the selected cluster/state OR if no cluster/state is selected yet
      const isRelevant = !selectedState || activeCombinations.includes(comboKey);

      if (isRelevant) {
        item.skuItems.forEach(skuItem => {
          let loginTypes = "No Login Type";
          if (skuItem.supplierType && Array.isArray(skuItem.supplierType)) {
            const names = skuItem.supplierType
              .map(st => st.loginTypeName || st.name || st.loginAccessType || (typeof st === 'string' ? null : "N/A"))
              .filter(Boolean);
            if (names.length > 0) loginTypes = names.join(', ');
          } else if (skuItem.supplierType && typeof skuItem.supplierType === 'object') {
            loginTypes = skuItem.supplierType.loginTypeName || skuItem.supplierType.name || skuItem.supplierType.loginAccessType || "No Login Type";
          }

          const label = `${itemCat} - ${itemSubCat} (${itemPt}) | No Kit | ${loginTypes}`;
          options.push({
            value: `${item._id}_${skuItem._id}`,
            label: label
          });
        });
      }
    });

    setProcurementOptions(options);
  }, [selectedState, selectedCluster, allProcurementSettings, masterData.mappings]);


  const loadDeliveryTypes = async (warehouseId) => {
    if (!warehouseId) return;
    try {
      setDataLoading(true);
      const res = await getDeliveryTypes({ warehouse: warehouseId });
      if (res.success) {
        setDeliveryTypes(res.data);
        if (res.data.length > 0) {
          handleTabSwitch(res.data[0]);
        } else {
          setActiveTabId('new');
        }
      }
    } catch (error) {
      showNotification('Failed to load delivery types for warehouse', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Location Handlers
  const handleCountrySelect = (countryId, countryName) => {
    setSelectedCountry(countryId);
    setSelectedCountryName(countryName);

    // Fetch states for this country
    // Note: useLocations hook uses fetchStates({ countryId: ... })
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
    setDeliveryTypes([]);
    setActiveTabId('new');
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
      setDeliveryTypes([]);
      setActiveTabId('new');

      try {
        // Fetch ALL clusters across all states in the selected country
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
      setDeliveryTypes([]);
      setActiveTabId('new');

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
      setDeliveryTypes([]);
      setActiveTabId('new');

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
      setDeliveryTypes([]);
      setActiveTabId('new');

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
      setDeliveryTypes([]);
      setActiveTabId('new');
    } else {
      setSelectedWarehouse(warehouseId);
      setSelectedWarehouseName(warehouseName);
      setSelectedAllWarehouses(false);
      loadDeliveryTypes(warehouseId);
    }
  };

  // Form Handlers
  const handleTabSwitch = (type) => {
    if (type === 'new') {
      setActiveTabId('new');
      setFormData(INITIAL_FORM_STATE);
    } else {
      setActiveTabId(type._id);
      setFormData({
        name: type.name || '',
        description: type.description || '',
        coverageRange: type.coverageRange || '',
        applicableCategories: type.applicableCategories?.length ? type.applicableCategories : INITIAL_FORM_STATE.applicableCategories,
        deliveryTiming: {
          ...INITIAL_FORM_STATE.deliveryTiming,
          ...(type.deliveryTiming || {})
        },
        coverageType: type.coverageType || [],
        restrictions: type.restrictions || { warehouses: [] },
        status: type.status || 'active'
      });
    }
    setActiveSection('setup');
  };

  const handleMappingEdit = async (mapping) => {
    try {
      setLoading(true);
      // Fetch all clusters for this mapping's state for the selection list
      const stateId = mapping.stateId?._id || mapping.stateId;
      if (stateId) {
        const res = await locationAPI.getAllClusters({ stateId, isActive: 'true' });
        if (res.data?.data) {
          setAllClustersForState(res.data.data);
        }
      }

      setEditMappingForm({
        mappingIds: mapping.mappingIds || [mapping._id],
        categoryId: mapping.categoryId?._id || mapping.categoryId,
        subCategoryId: mapping.subCategoryId?._id || mapping.subCategoryId,
        projectTypeFrom: mapping.projectTypeFrom || '',
        projectTypeTo: mapping.projectTypeTo || '',
        subProjectTypeId: mapping.subProjectTypeId?._id || mapping.subProjectTypeId || '',
        clusterIds: mapping.clusters ? mapping.clusters.map(c => c._id) : (mapping.clusterId?._id ? [mapping.clusterId._id] : []),
        stateId: mapping.stateId?._id || mapping.stateId,
        deliveryCharges: mapping.deliveryCharges || 0
      });
      setIsEditMappingModalOpen(true);
    } catch (error) {
      showNotification('Failed to prepare edit form', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMappingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Follow the AddProjectCategory.jsx pattern: Delete old ones and create new
      // This is because a grouped edit might change the number of cluster mapping documents
      if (editMappingForm.mappingIds.length > 0) {
        await Promise.all(editMappingForm.mappingIds.map(id => productApi.deleteProjectCategoryMapping(id)));
      }

      const payload = {
        stateId: editMappingForm.stateId,
        categoryId: editMappingForm.categoryId,
        subCategoryId: editMappingForm.subCategoryId,
        projectTypeFrom: Number(editMappingForm.projectTypeFrom),
        projectTypeTo: Number(editMappingForm.projectTypeTo),
        subProjectTypeId: editMappingForm.subProjectTypeId,
        clusterIds: editMappingForm.clusterIds,
        deliveryCharges: Number(editMappingForm.deliveryCharges) || 0
      };

      await productApi.createProjectCategoryMapping(payload);
      showNotification('Classification updated successfully', 'success');

      // Refresh
      const mappingRes = await productApi.getProjectCategoryMappings();
      const getArr = (res) => res?.data?.data || res?.data || [];
      setMasterData(prev => ({ ...prev, mappings: getArr(mappingRes) }));

      setIsEditMappingModalOpen(false);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMasterDelete = async (mappingIds) => {

    if (window.confirm("CRITICAL: This will delete this category mapping permanently from ALL master data. Are you sure?")) {
      try {
        setLoading(true);
        const ids = Array.isArray(mappingIds) ? mappingIds : [mappingIds];
        await Promise.all(ids.map(id => productApi.deleteProjectCategoryMapping(id)));
        showNotification('Master mapping deleted successfully', 'success');

        // Refresh master data to reflect the change
        const mappingRes = await productApi.getProjectCategoryMappings();
        const getArr = (res) => res?.data?.data || res?.data || [];
        setMasterData(prev => ({ ...prev, mappings: getArr(mappingRes) }));
      } catch (error) {
        showNotification('Failed to delete master mapping', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'coverageRange' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleTimingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      deliveryTiming: {
        ...prev.deliveryTiming,
        [name]: name === 'estimatedDelivery' ? value : Number(value)
      }
    }));
  };

  const handleProcurementChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      deliveryTiming: {
        ...prev.deliveryTiming,
        procurementResults: selectedOptions ? selectedOptions.map(opt => opt.value) : []
      }
    }));
  };


  const handleDeleteType = async (typeId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this delivery type?')) {
      try {
        setLoading(true);
        await deleteDeliveryType(typeId);
        showNotification('Delivery type deleted successfully', 'success');
        loadDeliveryTypes(selectedWarehouse);
        fetchDeliveryStats();
        if (activeTabId === typeId) {
          setActiveTabId('new');
          setFormData(INITIAL_FORM_STATE);
        }
      } catch (error) {
        showNotification('Failed to delete delivery type', 'error');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleSave = async () => {
    if (!selectedWarehouse) {
      showNotification('Please select a warehouse first', 'error');
      return;
    }
    if (!formData.name) {
      showNotification('Delivery Type Name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        state: selectedState,
        cluster: selectedCluster,
        warehouse: selectedWarehouse
      };

      if (activeTabId === 'new') {
        await createDeliveryType(payload);
        showNotification('Delivery type created successfully', 'success');
        loadDeliveryTypes(selectedWarehouse);
      } else {
        await updateDeliveryType(activeTabId, payload);
        showNotification('Delivery type updated successfully', 'success');
        loadDeliveryTypes(selectedWarehouse);
      }
      fetchDeliveryStats();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Master Mapping Edit Modal */}
      {isEditMappingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 scale-in-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                  <Edit2 size={24} />
                  Edit Project Category Mapping
                </h3>
                <p className="text-blue-100 text-xs mt-1 uppercase tracking-widest font-semibold">Master Configuration Update</p>
              </div>
              <button onClick={() => setIsEditMappingModalOpen(false)} className="text-white/80 hover:text-white transition-all bg-white/10 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateMappingSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                  <select
                    value={editMappingForm.categoryId}
                    onChange={e => setEditMappingForm({ ...editMappingForm, categoryId: e.target.value, subCategoryId: '' })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {masterData.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sub Category</label>
                  <select
                    value={editMappingForm.subCategoryId}
                    onChange={e => setEditMappingForm({ ...editMappingForm, subCategoryId: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all disabled:bg-gray-50"
                    disabled={!editMappingForm.categoryId}
                    required
                  >
                    <option value="">Select Sub Category</option>
                    {masterData.subCategories
                      .filter(s => (s.categoryId?._id || s.categoryId || s.category?._id || s.category) === editMappingForm.categoryId)
                      .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project Type From (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editMappingForm.projectTypeFrom}
                    onChange={e => setEditMappingForm({ ...editMappingForm, projectTypeFrom: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project Type To (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editMappingForm.projectTypeTo}
                    onChange={e => setEditMappingForm({ ...editMappingForm, projectTypeTo: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sub Project Type</label>
                  <select
                    value={editMappingForm.subProjectTypeId}
                    onChange={e => setEditMappingForm({ ...editMappingForm, subProjectTypeId: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  >
                    <option value="">Select Sub Project Type</option>
                    {masterData.subProjectTypes.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Clusters</label>
                  <div className="relative group">
                    <div className="w-full min-h-[44px] px-4 py-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap gap-1.5 items-center bg-white cursor-pointer transition-all">
                      {editMappingForm.clusterIds.length === 0 ? (
                        <span className="text-gray-400 text-sm italic">Nothing Selected</span>
                      ) : (
                        editMappingForm.clusterIds.map(id => {
                          const cluster = allClustersForState.find(c => c._id === id);
                          return (
                            <span key={id} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100 shadow-sm animate-in fade-in scale-in-95 duration-150">
                              {cluster?.name || 'Loading...'}
                              <X size={12} className="cursor-pointer hover:text-red-500 transition-colors" onClick={(e) => {
                                e.stopPropagation();
                                setEditMappingForm(prev => ({
                                  ...prev,
                                  clusterIds: prev.clusterIds.filter(cid => cid !== id)
                                }));
                              }} />
                            </span>
                          );
                        })
                      )}
                    </div>
                    {/* Simplified Multi-select list - shown on group hover for speed, but better as a scrollable menu */}
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[110] hidden group-hover:block transition-all opacity-0 group-hover:opacity-100">
                      {allClustersForState.map(c => (
                        <label key={c._id} className="flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0">
                          <input
                            type="checkbox"
                            className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all cursor-pointer"
                            checked={editMappingForm.clusterIds.includes(c._id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditMappingForm(prev => ({
                                ...prev,
                                clusterIds: checked ? [...prev.clusterIds, c._id] : prev.clusterIds.filter(id => id !== c._id)
                              }));
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Hover box to select clusters</p>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Delivery Charges (Master)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={editMappingForm.deliveryCharges}
                      onChange={e => setEditMappingForm({ ...editMappingForm, deliveryCharges: e.target.value })}
                      className="w-full h-11 pl-7 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Default charge for this mapping</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold h-12 rounded-xl hover:translate-y-[-1px] hover:shadow-lg active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                  Update Classification
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMappingModalOpen(false)}
                  className="px-8 h-12 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center">
            <Truck className="w-6 h-6 text-blue-600 mr-2" />
            Delivery Management
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

      {/* Main Configuration Content (Shown when warehouse selected) */}
      {selectedWarehouse ? (
        <div className="mt-8 animate-in fade-in duration-500">
          {/* Dynamic Tabs */}
          <div className="flex items-center space-x-4 mb-6 pb-2 overflow-x-auto justify-center">
            {selectedAllWarehouses ? (
              <div className="text-slate-600 font-medium italic">
                Creating delivery configuration for all selected warehouses at once.
              </div>
            ) : (
              <>
                {deliveryTypes.map((type, index) => {
                  const isActive = activeTabId === type._id;
                  // Cycle through some colors if inactive to match screenshot (blue, green)
                  let inactiveColor = 'text-[#0ea5e9]';
                  if (index % 2 !== 0) inactiveColor = 'text-[#22c55e]';

                  return (
                    <button
                      key={type._id}
                      onClick={() => handleTabSwitch(type)}
                      className={`group px-4 py-2 rounded-md font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${isActive
                        ? 'bg-[#64748b] text-white shadow-md'
                        : `bg-white border-transparent ${inactiveColor} hover:bg-gray-100 hover:border-gray-200 shadow-sm border`
                        }`}
                    >
                      <Truck size={16} />
                      <span>{type.name}</span>
                      <X
                        size={14}
                        className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${isActive ? 'text-gray-300' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}
                        onClick={(e) => handleDeleteType(type._id, e)}
                      />
                    </button>
                  )
                })}
                <button
                  onClick={() => handleTabSwitch('new')}
                  className={`px-4 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap flex items-center bg-[#1e293b] text-white hover:bg-slate-800 shadow-sm ${activeTabId === 'new' ? 'ring-2 ring-offset-2 ring-[#1e293b]' : ''
                    }`}
                >
                  <Plus size={16} className="mr-1" /> Add Delivery Type
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Left Sidebar - Navigation */}
            <div className="xl:col-span-3">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden sticky top-6">
                <div className="bg-[#0284c7] text-white p-4 font-bold rounded-t-lg flex items-center">
                  <Truck size={18} className="mr-2" /> Delivery Sections
                </div>
                <div className="p-2 space-y-1 bg-white pt-2 rounded-b-lg">
                  {SECTION_OPTIONS.map(opt => {
                    const isActive = activeSection === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setActiveSection(opt.id);
                          document.getElementById(opt.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive
                          ? 'bg-[#007bff] text-white rounded-md'
                          : 'text-slate-600 hover:bg-gray-50'
                          }`}
                      >
                        <Check size={16} strokeWidth={3} className={`mr-3 ${isActive ? 'text-white' : 'text-green-500'}`} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Middle Content - Form */}
            <div className="xl:col-span-6">
              <div className="mb-6 flex justify-between items-center border-b pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#0284c7] flex items-center">
                    <Truck size={24} className="mr-2" />
                    {activeTabId === 'new' ? 'Standard Delivery' : formData.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Configure settings for {formData.name || 'Standard Delivery'}</p>
                </div>
              </div>

              {/* Dynamic Form Sections Based on activeSection */}
              <div className="space-y-6">

                {/* Setup */}
                <div id="setup" className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block scroll-mt-6">
                  <div className="bg-[#0284c7] text-white p-3 font-bold text-sm flex justify-between">
                    <span>Delivery Type Setup</span>
                    <span className="bg-white text-blue-700 text-xs px-2 py-0.5 rounded font-bold">Required</span>
                  </div>
                  <div className="p-4 bg-white">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Delivery Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g. Standard Delivery"
                    />
                  </div>
                </div>

                {/* Coverage */}
                <div id="coverage" className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block scroll-mt-6">
                  <div className="bg-[#22c55e] text-white p-3 font-bold text-sm">
                    Coverage Area
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                      <div className="flex-1 max-w-xs">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Coverage Type
                        </label>
                        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg text-gray-500 text-sm italic">
                          <span>Auto-calculated by Kms</span>
                        </div>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Coverage Range (Kms)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="coverageRange"
                            value={formData.coverageRange}
                            onChange={handleInputChange}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                            placeholder="e.g. 50"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">Kms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="categories" className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block scroll-mt-6">
                  <div className="bg-[#0ea5e9] text-white p-3 font-bold text-sm flex justify-between items-center">
                    <span>Applicable Categories</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">Real-time sync enabled</span>
                  </div>
                  <div className="p-0 bg-white overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#7dd3fc] text-white font-semibold">
                        <tr>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Applicable</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Category</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Sub Category</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Project Type</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Sub Project Type</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Cluster</th>
                          <th className="px-4 py-2 border-r border-[#38bdf8]">Delivery Charges (₹)</th>
                          <th className="px-4 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {groupedMappings.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                              <div className="flex flex-col items-center gap-2">
                                <Search size={32} className="text-gray-200" />
                                <p className="italic">No Categories Found in Master Data.</p>
                                <p className="text-[10px]">Add categories in Project Management → Project Category to see them here.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          groupedMappings.map((mapping, i) => {
                            const catName = mapping.categoryId?.name || (typeof mapping.categoryId === 'string' ? mapping.categoryId : 'N/A');
                            const subCatName = mapping.subCategoryId?.name || (typeof mapping.subCategoryId === 'string' ? mapping.subCategoryId : 'N/A');
                            const prjType = `${mapping.projectTypeFrom} to ${mapping.projectTypeTo} kW`;
                            const subPrjTypeName = mapping.subProjectTypeId?.name || (typeof mapping.subProjectTypeId === 'string' ? mapping.subProjectTypeId : 'N/A');
                            const clusterNames = mapping.clusters && mapping.clusters.length > 0
                              ? mapping.clusters.map(c => c.name || c).join(', ')
                              : (mapping.clusterId?.name || mapping.clusterId || 'N/A');

                            // Find if this group is selected
                            const selectedIndex = formData.applicableCategories.findIndex(cat =>
                              cat.category === catName &&
                              cat.subCategory === subCatName &&
                              cat.projectType === prjType &&
                              cat.subProjectType === subPrjTypeName
                              // Note: Cluster matching might be tricky if stored differently, but usually we match by categorization
                            );
                            const isSelected = selectedIndex !== -1;

                            return (
                              <tr key={i} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-4 py-3 text-center border-r border-gray-100">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        // Add to selected
                                        const newCat = {
                                          category: catName,
                                          subCategory: subCatName,
                                          projectType: prjType,
                                          subProjectType: subPrjTypeName,
                                          cluster: clusterNames,
                                          cost: 0,
                                          isActive: true
                                        };
                                        setFormData(prev => ({
                                          ...prev,
                                          applicableCategories: [...prev.applicableCategories, newCat]
                                        }));
                                      } else {
                                        // Remove from selected
                                        setFormData(prev => ({
                                          ...prev,
                                          applicableCategories: prev.applicableCategories.filter((_, idx) => idx !== selectedIndex)
                                        }));
                                      }
                                    }}
                                    className="rounded text-[#0284c7] focus:ring-[#0284c7] w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-3 border-r border-gray-100 text-gray-700 font-medium">{catName}</td>
                                <td className="px-4 py-3 border-r border-gray-100 text-gray-600">{subCatName}</td>
                                <td className="px-4 py-3 border-r border-gray-100 text-gray-600 font-semibold">{prjType}</td>
                                <td className="px-4 py-3 border-r border-gray-100 text-gray-400 uppercase font-bold text-[10px]">{subPrjTypeName}</td>
                                <td className="px-4 py-3 border-r border-gray-100 text-gray-500 italic text-[11px] max-w-[200px] truncate" title={clusterNames}>{clusterNames}</td>
                                <td className="px-4 py-3">
                                  {isSelected ? (
                                    <div className="relative max-w-[120px]">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={formData.applicableCategories[selectedIndex].cost}
                                        onChange={(e) => {
                                          const newCats = [...formData.applicableCategories];
                                          newCats[selectedIndex].cost = Number(e.target.value);
                                          setFormData(prev => ({ ...prev, applicableCategories: newCats }));
                                        }}
                                        className="w-full pl-5 pr-2 py-1 border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none text-xs font-bold text-blue-700 bg-blue-50/50"
                                        placeholder="0"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex flex-col">
                                      {mapping.deliveryCharges ? (
                                        <span className="text-blue-600 font-bold text-xs">₹ {mapping.deliveryCharges}</span>
                                      ) : (
                                        <span className="text-gray-300 text-xs italic">Select to set cost</span>
                                      )}
                                      <p className="text-[8px] text-gray-400 uppercase tracking-tighter"></p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleMappingEdit(mapping)}
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                                      title="Edit classification"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleMasterDelete(mapping.mappingIds || mapping._id)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                                      title="Delete mapping permanently"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery Timing */}
                <div id="timing" className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block scroll-mt-6">
                  <div className="bg-[#eab308] text-white p-3 font-bold text-sm">
                    Delivery Charges & Timing
                  </div>
                  <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Days</label>
                      <input
                        type="number"
                        name="minDays"
                        value={formData.deliveryTiming.minDays}
                        onChange={handleTimingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#eab308] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Maximum Days</label>
                      <input
                        type="number"
                        name="maxDays"
                        value={formData.deliveryTiming.maxDays}
                        onChange={handleTimingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#eab308] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Delivery (Text)</label>
                      <input
                        type="text"
                        name="estimatedDelivery"
                        value={formData.deliveryTiming.estimatedDelivery}
                        onChange={handleTimingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#eab308] outline-none text-sm"
                        placeholder="e.g. 3-5 Days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Charges (Per kW)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          name="deliveryCharges"
                          value={formData.deliveryTiming.deliveryCharges}
                          onChange={handleTimingChange}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#eab308] outline-none text-sm"
                          placeholder="Enter amount (e.g. 500)"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-4 border-t border-gray-100 pt-5 mt-2">
                      <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        <Tag size={14} className="mr-2 text-[#eab308]" />
                        Procurement Results Mapping
                      </label>
                      <Select
                        isMulti
                        name="procurementResults"
                        options={procurementOptions}
                        value={procurementOptions.filter(opt => formData.deliveryTiming.procurementResults?.includes(opt.value))}
                        onChange={handleProcurementChange}
                        className="text-sm shadow-sm"
                        placeholder="Select Results..."
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '44px',
                            borderColor: '#e5e7eb',
                            '&:hover': { borderColor: '#eab308' },
                            boxShadow: 'none',
                            borderRadius: '10px',
                            backgroundColor: '#f9f9fb'
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#fef9c3',
                            borderRadius: '6px',
                            paddingLeft: '4px'
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: '#854d0e',
                            fontWeight: '600',
                            fontSize: '12px'
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: '#854d0e',
                            '&:hover': { backgroundColor: '#fde047', color: '#854d0e' },
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.2)',
                            marginTop: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            zIndex: 9999
                          }),
                          menuList: (base) => ({
                            ...base,
                            padding: '4px',
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-track': { background: '#fefce8' },
                            '&::-webkit-scrollbar-thumb': { background: '#fef08a', borderRadius: '10px' },
                            '&::-webkit-scrollbar-thumb:hover': { background: '#fde047' }
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? '#fef9c3' : state.isFocused ? '#fefce8' : 'white',
                            color: state.isSelected ? '#854d0e' : '#71717a',
                            fontWeight: state.isSelected ? '700' : '500',
                            fontSize: '13px',
                            padding: '10px 15px',
                            margin: '2px 0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:active': { backgroundColor: '#fef08a' }
                          })
                        }}
                        menuPortalTarget={document.body}
                      />
                    </div>
                  </div>
                </div>
                {/* Restrictions */}
                <div id="restrictions" className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block scroll-mt-6">
                  <div className="bg-[#f43f5e] text-white p-3 font-bold text-sm">
                    Restrictions
                  </div>
                  <div className="p-4 bg-white">
                    <div className="max-w-md">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Partner Plan Restrictions
                      </label>
                      <Select
                        name="restrictedDistricts"
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' }
                        ]}
                        value={formData.restrictions?.warehouses?.length > 0 ? { value: 'yes', label: 'Yes' } : { value: 'no', label: 'No' }}
                        onChange={(opt) => {
                          setFormData(prev => ({
                            ...prev,
                            restrictions: {
                              ...prev.restrictions,
                              warehouses: opt.value === 'yes' ? [selectedWarehouse] : []
                            }
                          }));
                        }}
                        className="text-sm"
                        placeholder="Apply Restriction?"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '38px',
                            borderColor: '#d1d5db',
                            '&:hover': { borderColor: '#f43f5e' },
                            boxShadow: 'none',
                            borderRadius: '8px'
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            marginTop: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            zIndex: 9999
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? '#fee2e2' : state.isFocused ? '#fff1f2' : 'white',
                            color: state.isSelected ? '#991b1b' : '#71717a',
                            fontWeight: state.isSelected ? '700' : '500',
                            fontSize: '13px',
                            padding: '10px 15px',
                            margin: '2px 0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          })
                        }}
                        menuPortalTarget={document.body}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 italic">
                        * Select specific warehouses where this delivery type is restricted or applicable.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Save Layout Action */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-start">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#0284c7] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm hover:bg-[#0369a1] transition-all flex items-center"
                >
                  {loading ? <Loader size={12} className="animate-spin mr-1" /> : null}
                  Save Delivery Settings
                </button>
              </div>

            </div>

            {/* Right Sidebar - Live Preview Card */}
            <div className="xl:col-span-3 hidden xl:block">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg w-full text-sm overflow-hidden pb-4 sticky top-6">
                <div className="p-4 flex justify-between items-start bg-[#0284c7] text-white">
                  <div className="font-bold uppercase tracking-wider text-sm leading-tight max-w-[140px]">
                    {formData.name || 'STANDARD DELIVERY'}
                  </div>
                  <span className="text-[10px] bg-white text-[#0284c7] px-2 py-1 rounded-sm shadow-sm font-bold whitespace-nowrap">Standard Access</span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-500 mb-6 italic">{formData.description || 'Reliable delivery for standard orders'}</div>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 leading-none mb-1">₹{formData.deliveryTiming?.deliveryCharges || '0'}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">per kw charges</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800 text-sm mb-1">{formData.deliveryTiming.estimatedDelivery || '3-5 Days'}</div>
                      <div className="text-[10px] text-gray-500">Delivery Time</div>
                    </div>
                  </div>
                  <div className="text-xs space-y-2 text-gray-700">
                    <p>Coverage: <span className="font-medium text-gray-900">{formData.coverageRange !== '' ? `${formData.coverageRange}km Radius` : '50km Radius'}</span></p>
                    <p className="flex items-center text-[#0284c7] font-medium"><Truck size={14} className="mr-1" />Access: <span className="text-gray-900 font-medium ml-1">Standard Access</span></p>
                    <p className="font-bold mt-4 mb-2 text-gray-900 text-[13px]">Features:</p>
                    <div className="flex items-center mb-2">
                      <div className="bg-[#e0f2fe] rounded-full p-0.5 mr-2 shadow-sm"><Check size={12} className="text-[#0ea5e9]" strokeWidth={3} /></div>
                      <span>{formData.deliveryTiming.estimatedDelivery || '3-5 Day'} Delivery</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="bg-[#e0f2fe] rounded-full p-0.5 mr-2 shadow-sm"><Check size={12} className="text-[#0ea5e9]" strokeWidth={3} /></div>
                      <span>{formData.coverageRange !== '' ? `${formData.coverageRange}km Coverage` : '50km Coverage'}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-[#e0f2fe] rounded-full p-0.5 mr-2 shadow-sm"><Check size={12} className="text-[#0ea5e9]" strokeWidth={3} /></div>
                      <span>Standard Support</span>
                    </div>
                  </div>
                  <div className="mt-6 px-2">
                    <button className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors flex justify-center items-center">
                      <Check size={14} className="mr-1 hover:animate-pulse" /> @Apply {formData.name ? formData.name.toUpperCase() : 'STANDARD DELIVERY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
          <Truck size={48} className="text-gray-200 mb-4" />
          <p className="text-lg">Please select a Location Scope.</p>
          <p className="text-sm font-medium mt-1 text-gray-300">Delivery configurations need a warehouse or "all warehouses" scope to apply.</p>
        </div>
      )}

      {/* Footer text matching screenshot */}
      <div className="mt-8 text-center text-xs text-gray-400 font-medium pb-4">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>
    </div>
  );
};

export default DeliveryType;