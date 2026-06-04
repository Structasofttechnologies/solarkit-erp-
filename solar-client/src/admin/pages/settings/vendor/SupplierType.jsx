import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Loader, Trash2, X, ChevronRight } from 'lucide-react';
import {
  getSupplierTypes,
  createSupplierType,
  updateSupplierType,
  deleteSupplierType,
  getSupplierVendorPlans
} from '../../../../services/vendor/vendorApi';
import { locationAPI, masterAPI } from '../../../../api/api';
import { productApi } from '../../../../api/productApi';
import toast from 'react-hot-toast';

const AVAILABLE_MODULES = [
  'Order Management(Bidding)',
  'Inventory Management',
  'Create Delivery Plan',
  'Delivery',
  'Pickup',
  'Add Product',
  'Add Price',
  'Setting'
];

const LocationCard = ({ title, subtitle, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-28 shadow-sm hover:shadow-md ${isSelected
      ? 'border-[#007bff] bg-blue-50 shadow-blue-100 shadow-lg -translate-y-1'
      : 'border-transparent bg-white hover:border-blue-200'
      }`}
  >
    <div className="font-bold text-base text-[#333] mb-1">{title}</div>
    <div className="text-xs text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

export default function SupplierType() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginTypes, setLoginTypes] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    loginTypeName: '',
    categories: [],
    subCategories: [],
    projectTypes: [],
    subTypes: [],
    assignModules: [],
    orderTat: '10 Days',
    modulesTasks: []
  });

  const [openSelect, setOpenSelect] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tempModules, setTempModules] = useState([]);
  const [editFormData, setEditFormData] = useState({
    loginTypeName: '',
    categories: [],
    subCategories: [],
    projectTypes: [],
    subTypes: [],
    assignModules: [],
    orderTat: '',
    modulesTasks: []
  });
  const [editingTypeId, setEditingTypeId] = useState(null); // null = creating, id = editing existing row



  const handleOpenTaskModal = () => {
    setEditingTypeId(null); // new row creation
    setTempModules(formData.modulesTasks || []);
    setShowTaskModal(true);
  };

  const handleOpenEditTaskModal = (type) => {
    setEditingTypeId(type._id);
    setEditFormData({
      loginTypeName: type.loginTypeName || '',
      categories: Array.isArray(type.category) ? type.category : (type.category ? [type.category] : []),
      subCategories: Array.isArray(type.subCategory) ? type.subCategory : (type.subCategory ? [type.subCategory] : []),
      projectTypes: Array.isArray(type.projectType) ? type.projectType : (type.projectType ? [type.projectType] : []),
      subTypes: Array.isArray(type.subType) ? type.subType : (type.subType ? [type.subType] : []),
      assignModules: Array.isArray(type.assignModules) ? type.assignModules : (type.assignModules ? [type.assignModules] : []),
      orderTat: type.orderTat || '10 Days',
      modulesTasks: Array.isArray(type.modulesTasks) ? type.modulesTasks : []
    });
    setShowTaskModal(true);
  };

  const handleSaveTasks = async () => {
    if (editingTypeId) {
      // Update existing supplier type (all fields)
      try {
        const payload = {
          loginTypeName: editFormData.loginTypeName,
          category: editFormData.categories,
          subCategory: editFormData.subCategories,
          projectType: editFormData.projectTypes,
          subType: editFormData.subTypes,
          assignModules: editFormData.assignModules,
          orderTat: editFormData.orderTat,
          modulesTasks: editFormData.modulesTasks
        };
        await updateSupplierType(editingTypeId, payload);
        toast.success('Supplier Type updated successfully');
        fetchTypes();
      } catch (error) {
        console.error('Error updating supplier type:', error);
        toast.error('Failed to update supplier type');
      }
    } else {
      // New row - only tasks come from modal
      setFormData(prev => ({ ...prev, modulesTasks: tempModules }));
    }
    setShowTaskModal(false);
    setEditingTypeId(null);
  };

  const handleToggleTempModule = (name) => {
    if (editingTypeId) {
      setEditFormData(prev => ({
        ...prev,
        modulesTasks: prev.modulesTasks.includes(name)
          ? prev.modulesTasks.filter(m => m !== name)
          : [...prev.modulesTasks, name]
      }));
    } else {
      setTempModules(prev =>
        prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
      );
    }
  };

  const handleToggleOption = (field, value, isEdit = false) => {
    const setState = isEdit ? setEditFormData : setFormData;
    setState(prev => {
      const current = prev[field] || [];
      const isSelected = current.includes(value);
      const updated = isSelected
        ? current.filter(item => item !== value)
        : [...current, value];

      let nextState = { ...prev, [field]: updated };
 
      // Auto-assign tasks based on module selection
      if (field === 'assignModules') {
        const dependentTasks = {
          'Bidding': 'Order Management(Bidding)'
        };
        const taskName = dependentTasks[value];
        if (taskName) {
          const currentTasks = prev.modulesTasks || [];
          if (updated.includes(value)) {
            if (!currentTasks.includes(taskName)) {
              nextState.modulesTasks = [...currentTasks, taskName];
            }
          } else {
            nextState.modulesTasks = currentTasks.filter(t => t !== taskName);
          }
        }
      }

      // If categories changed, clear dependent fields to avoid invalid combinations
      if (field === 'categories' && isSelected) {
        nextState.subCategories = [];
        nextState.projectTypes = [];
        nextState.subTypes = [];
      } else if (field === 'subCategories' && isSelected) {
        nextState.projectTypes = [];
        nextState.subTypes = [];
      } else if (field === 'projectTypes' && isSelected) {
        nextState.subTypes = [];
      }
 
      return nextState;
    });
  };

  // Location Hierarchy State
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: []
  });

  // Master Lists State
  const [masterLists, setMasterLists] = useState({
    categories: [],
    subCategories: [],
    projectTypes: [],
    subProjectTypes: [],
    mappings: []
  });

  const [selectedLocation, setSelectedLocation] = useState({
    country: '',
    state: '',
    cluster: '',
    district: ''
  });

  // Click outside to close custom selects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openSelect && !event.target.closest('.relative')) {
        setOpenSelect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openSelect]);

  // Location Fetching Logic
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await locationAPI.getAllCountries({ isActive: true });
        if (res.data && res.data.data) setLocationData(prev => ({ ...prev, countries: res.data.data }));
      } catch (error) {
        console.error('Failed to fetch countries', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchLoginTypes = async () => {
      try {
        const res = await getSupplierVendorPlans({ fetchAllNames: true });
        if (res.success && res.data) {
          const baseNames = ['Manufacturer', 'Distributor', 'Dealer'];
          const finalNames = res.data.length > 0 ? res.data : baseNames;
          setLoginTypes(finalNames);
        }
      } catch (error) {
        console.error('Error fetching login types:', error);
      }
    };
    fetchLoginTypes();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (selectedLocation.country) {
        try {
          const params = { isActive: true };
          if (selectedLocation.country !== 'all') params.countryId = selectedLocation.country;
          const res = await locationAPI.getAllStates(params);
          if (res.data && res.data.data) setLocationData(prev => ({ ...prev, states: res.data.data }));
        } catch (error) {
          console.error('Failed to fetch states', error);
          setLocationData(prev => ({ ...prev, states: [] }));
        }
      } else {
        setLocationData(prev => ({ ...prev, states: [] }));
      }
    };
    fetchStates();
  }, [selectedLocation.country]);

  useEffect(() => {
    const fetchClusters = async () => {
      if (selectedLocation.state) {
        try {
          const params = { isActive: true };
          if (selectedLocation.state !== 'all') params.stateId = selectedLocation.state;
          const res = await locationAPI.getAllClusters(params);
          setLocationData(prev => ({ ...prev, clusters: res.data?.data || [] }));
        } catch (error) {
          setLocationData(prev => ({ ...prev, clusters: [] }));
        }
      } else {
        setLocationData(prev => ({ ...prev, clusters: [] }));
      }
    };
    fetchClusters();
  }, [selectedLocation.state]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedLocation.cluster) {
        try {
          if (selectedLocation.cluster !== 'all') {
            const res = await locationAPI.getClusterById(selectedLocation.cluster);
            if (res.data?.data?.districts) {
              setLocationData(prev => ({ ...prev, districts: res.data.data.districts }));
            } else setLocationData(prev => ({ ...prev, districts: [] }));
          } else {
            const params = { isActive: true };
            if (selectedLocation.state && selectedLocation.state !== 'all') params.stateId = selectedLocation.state;
            const res = await locationAPI.getAllDistricts(params);
            setLocationData(prev => ({ ...prev, districts: res.data?.data || [] }));
          }
        } catch (error) {
          setLocationData(prev => ({ ...prev, districts: [] }));
        }
      }
    };
    fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state]);

  // Fetch Mappings and All Categories when location changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLocation.state) return;
      try {
        const params = { status: 'true' };
        if (selectedLocation.cluster && selectedLocation.cluster !== 'all') {
          params.clusterId = selectedLocation.cluster;
        } else if (selectedLocation.state && selectedLocation.state !== 'all') {
          params.stateId = selectedLocation.state;
        }

        const [mappingRes, catRes] = await Promise.all([
          productApi.getProjectCategoryMappings(params),
          masterAPI.getAllCategories({ status: 'true' })
        ]);

        setMasterLists(prev => ({
          ...prev,
          mappings: mappingRes.data?.data || [],
          categories: catRes.data?.data || []
        }));
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [selectedLocation.state, selectedLocation.cluster]);

  // Cascading logic based on Mappings
  useEffect(() => {
    const activeCategories = editingTypeId ? editFormData.categories : formData.categories;
    
    if (activeCategories.length > 0) {
      const selectedCatMappings = masterLists.mappings.filter(m => activeCategories.includes(m.categoryId?.name));

      // Extract unique subCategories
      const uniqueSubs = [];
      const seenSubs = new Set();
      selectedCatMappings.forEach(m => {
        if (m.subCategoryId && !seenSubs.has(m.subCategoryId._id)) {
          seenSubs.add(m.subCategoryId._id);
          uniqueSubs.push(m.subCategoryId);
        }
      });
      setMasterLists(prev => ({ ...prev, subCategories: uniqueSubs }));
    } else {
      setMasterLists(prev => ({ ...prev, subCategories: [] }));
    }
  }, [formData.categories, editFormData.categories, masterLists.mappings, editingTypeId]);

  useEffect(() => {
    const activeCategories = editingTypeId ? editFormData.categories : formData.categories;
    const activeSubCategories = editingTypeId ? editFormData.subCategories : formData.subCategories;

    if (activeCategories.length > 0 && activeSubCategories.length > 0) {
      const filteredMappings = masterLists.mappings.filter(m =>
        activeCategories.includes(m.categoryId?.name) &&
        activeSubCategories.includes(m.subCategoryId?.name)
      );

      // Extract unique Project Type Ranges
      const ranges = [];
      const seenRanges = new Set();
      filteredMappings.forEach(m => {
        const rangeText = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
        if (!seenRanges.has(rangeText)) {
          seenRanges.add(rangeText);
          ranges.push({ id: rangeText, name: rangeText, ...m });
        }
      });
      setMasterLists(prev => ({ ...prev, projectTypes: ranges }));
    } else {
      setMasterLists(prev => ({ ...prev, projectTypes: [] }));
    }
  }, [formData.categories, formData.subCategories, editFormData.categories, editFormData.subCategories, masterLists.mappings, editingTypeId]);

  useEffect(() => {
    const activeCategories = editingTypeId ? editFormData.categories : formData.categories;
    const activeSubCategories = editingTypeId ? editFormData.subCategories : formData.subCategories;
    const activeProjectTypes = editingTypeId ? editFormData.projectTypes : formData.projectTypes;

    if (activeCategories.length > 0 && activeSubCategories.length > 0 && activeProjectTypes.length > 0) {
      const filteredMappings = masterLists.mappings.filter(m =>
        activeCategories.includes(m.categoryId?.name) &&
        activeSubCategories.includes(m.subCategoryId?.name) &&
        activeProjectTypes.includes(`${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
      );

      // Extract unique Sub Project Types
      const subTypes = [];
      const seenSubTypes = new Set();
      filteredMappings.forEach(m => {
        if (m.subProjectTypeId && !seenSubTypes.has(m.subProjectTypeId._id)) {
          seenSubTypes.add(m.subProjectTypeId._id);
          subTypes.push(m.subProjectTypeId);
        }
      });
      setMasterLists(prev => ({ ...prev, subProjectTypes: subTypes }));
    } else {
      setMasterLists(prev => ({ ...prev, subProjectTypes: [] }));
    }
  }, [formData.categories, formData.subCategories, formData.projectTypes, editFormData.categories, editFormData.subCategories, editFormData.projectTypes, masterLists.mappings, editingTypeId]);

  // Remove the old master fetching effects if they exist
  // (I already replace the previous effects block in the next chunk)

  // Fetch Types from DB
  useEffect(() => {
    if (selectedLocation.district) {
      fetchTypes();
    } else {
      setTypes([]);
    }
  }, [selectedLocation.district, selectedLocation.cluster, selectedLocation.state, selectedLocation.country]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLocation.country && selectedLocation.country !== 'all') params.countryId = selectedLocation.country;
      if (selectedLocation.state && selectedLocation.state !== 'all') params.stateId = selectedLocation.state;
      if (selectedLocation.cluster && selectedLocation.cluster !== 'all') params.clusterId = selectedLocation.cluster;
      if (selectedLocation.district && selectedLocation.district !== 'all') params.districtId = selectedLocation.district;

      const res = await getSupplierTypes(params);
      if (res.success) {
        setTypes(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching supplier types:', error);
      toast.error('Failed to load supplier types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.loginTypeName.trim()) {
      toast.error('Login Type name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        loginTypeName: formData.loginTypeName,
        category: formData.categories,
        subCategory: formData.subCategories,
        projectType: formData.projectTypes,
        subType: formData.subTypes,
        assignModules: formData.assignModules,
        orderTat: formData.orderTat,
        modulesTasks: formData.modulesTasks,
        countryId: selectedLocation.country === 'all' ? null : selectedLocation.country,
        stateId: selectedLocation.state === 'all' ? null : selectedLocation.state,
        clusterId: selectedLocation.cluster === 'all' ? null : selectedLocation.cluster,
        districtId: selectedLocation.district === 'all' ? null : selectedLocation.district,
      };

      const res = await createSupplierType(payload);
      if (res.success) {
        toast.success('Supplier type created/updated successfully');
        setFormData({
          loginTypeName: '', categories: [], subCategories: [], projectTypes: [], subTypes: [], assignModules: [], orderTat: '10 Days', modulesTasks: []
        });
        fetchTypes();
      }
    } catch (error) {
      console.error('Error saving supplier type:', error);
      toast.error(error.response?.data?.message || 'Failed to align type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSupplierType(id);
      toast.success('Supplier type deleted successfully');
      fetchTypes();
    } catch (error) {
      console.error('Error deleting supplier type:', error);
      toast.error('Failed to delete supplier type');
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      {/* Header Block */}
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-xl font-bold text-[#14233c]">Supplier Type</h1>
        <button
          onClick={() => setShowLocationCards(!showLocationCards)}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#0076a8] text-white rounded text-[10px] font-bold shadow-sm hover:bg-blue-800 transition-all uppercase tracking-wider"
        >
          {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />} {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 pb-20">

        {/* Location Selection Section */}
        {showLocationCards && (
          <div className="space-y-10 mb-10">
            {/* Countries */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#333]">Select Country</h2>
                <button
                  onClick={() => setSelectedLocation({ country: 'all', state: '', cluster: '', district: '' })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <LocationCard
                  title="All Countries"
                  subtitle="ALL"
                  isSelected={selectedLocation.country === 'all'}
                  onClick={() => setSelectedLocation({ country: 'all', state: '', cluster: '', district: '' })}
                />
                {locationData.countries.map(c => (
                  <LocationCard
                    key={c._id}
                    title={c.name}
                    subtitle={c.code || c.name.substring(0, 2).toUpperCase()}
                    isSelected={selectedLocation.country === c._id}
                    onClick={() => setSelectedLocation({ country: c._id, state: '', cluster: '', district: '' })}
                  />
                ))}
              </div>
            </div>

            {/* States */}
            {selectedLocation.country && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#333]">Select State</h2>
                  <button
                    onClick={() => setSelectedLocation(prev => ({ ...prev, state: 'all', cluster: '', district: '' }))}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <LocationCard
                    title="All States"
                    subtitle="ALL"
                    isSelected={selectedLocation.state === 'all'}
                    onClick={() => setSelectedLocation(prev => ({ ...prev, state: 'all', cluster: '', district: '' }))}
                  />
                  {locationData.states.map(s => (
                    <LocationCard
                      key={s._id}
                      title={s.name}
                      subtitle={s.code || s.name.substring(0, 2).toUpperCase()}
                      isSelected={selectedLocation.state === s._id}
                      onClick={() => setSelectedLocation(prev => ({ ...prev, state: s._id, cluster: '', district: '' }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Clusters */}
            {selectedLocation.state && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#333]">Select Cluster</h2>
                  <button
                    onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: 'all', district: '' }))}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <LocationCard
                    title="All Clusters"
                    subtitle="ALL"
                    isSelected={selectedLocation.cluster === 'all'}
                    onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: 'all', district: '' }))}
                  />
                  {locationData.clusters.map(c => {
                    const parentState = locationData.states.find(s => s._id === c.state) || locationData.states.find(s => s._id === selectedLocation.state);
                    return (
                      <LocationCard
                        key={c._id}
                        title={c.name}
                        subtitle={parentState ? (parentState.code || parentState.name.substring(0, 2).toUpperCase()) : 'CL'}
                        isSelected={selectedLocation.cluster === c._id}
                        onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: c._id, district: '' }))}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Districts */}
            {selectedLocation.cluster && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#333]">Select District</h2>
                  <button
                    onClick={() => setSelectedLocation(prev => ({ ...prev, district: 'all' }))}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <LocationCard
                    title="All Districts"
                    subtitle="ALL"
                    isSelected={selectedLocation.district === 'all'}
                    onClick={() => setSelectedLocation(prev => ({ ...prev, district: 'all' }))}
                  />
                  {locationData.districts.map(d => {
                    const parentCluster = locationData.clusters.find(c => c._id === selectedLocation.cluster);
                    return (
                      <LocationCard
                        key={d._id}
                        title={d.name}
                        subtitle={parentCluster ? parentCluster.name : 'DIST'}
                        isSelected={selectedLocation.district === d._id}
                        onClick={() => setSelectedLocation(prev => ({ ...prev, district: d._id }))}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Supplier Type Table */}
        {selectedLocation.district && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[#2a3642] text-white">
                  <tr>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Type Of Login</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Category</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Sub Category</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Project Type</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Sub Type</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Modules Tasks</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">Assign Modules</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap">No. of Days</th>
                    <th className="p-3 text-sm font-semibold border-r border-[#3a4752] whitespace-nowrap text-center">Set Modules</th>
                    <th className="p-3 text-sm font-semibold text-center whitespace-nowrap">Create</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Create Row */}
                  <tr className="bg-[#f8f9fc] border-b border-gray-200">
                    <td className="p-3 border-r border-gray-200">
                      <select
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 bg-white"
                        value={formData.loginTypeName}
                        onChange={e => setFormData({ ...formData, loginTypeName: e.target.value })}
                      >
                        <option value="">Select Login Type</option>
                        {loginTypes.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 border-r border-gray-200 min-w-[200px]">
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'cat' ? null : 'cat')}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[34px]"
                        >
                          {formData.categories.length === 0 ? (
                            <span className="text-gray-400">Select Categories</span>
                          ) : (
                            formData.categories.map(name => (
                              <span key={name} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('categories', name); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'cat' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.categories.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">No categories found</div>
                            ) : (
                              masterLists.categories.map(cat => (
                                <label key={cat._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={formData.categories.includes(cat.name)}
                                    onChange={() => handleToggleOption('categories', cat.name)}
                                  />
                                  <span className="text-xs text-gray-700">{cat.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200 min-w-[200px]">
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'subCat' ? null : 'subCat')}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[34px]"
                        >
                          {formData.subCategories.length === 0 ? (
                            <span className="text-gray-400">Select Sub Categories</span>
                          ) : (
                            formData.subCategories.map(name => (
                              <span key={name} className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('subCategories', name); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'subCat' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.subCategories.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">{formData.categories.length === 0 ? 'Select Category first' : 'No sub categories'}</div>
                            ) : (
                              masterLists.subCategories.map(sub => (
                                <label key={sub._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={formData.subCategories.includes(sub.name)}
                                    onChange={() => handleToggleOption('subCategories', sub.name)}
                                  />
                                  <span className="text-xs text-gray-700">{sub.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200 min-w-[200px]">
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'pType' ? null : 'pType')}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[34px]"
                        >
                          {formData.projectTypes.length === 0 ? (
                            <span className="text-gray-400">Select Project Types</span>
                          ) : (
                            formData.projectTypes.map(name => (
                              <span key={name} className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('projectTypes', name); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'pType' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.projectTypes.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">Select Category & Sub Category first</div>
                            ) : (
                              masterLists.projectTypes.map(proj => (
                                <label key={proj.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={formData.projectTypes.includes(proj.name)}
                                    onChange={() => handleToggleOption('projectTypes', proj.name)}
                                  />
                                  <span className="text-xs text-gray-700">{proj.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200 min-w-[200px]">
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'subType' ? null : 'subType')}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[34px]"
                        >
                          {formData.subTypes.length === 0 ? (
                            <span className="text-gray-400">Select Sub Types</span>
                          ) : (
                            formData.subTypes.map(name => (
                              <span key={name} className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('subTypes', name); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'subType' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.subProjectTypes.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">Select Project Type first</div>
                            ) : (
                              masterLists.subProjectTypes.map(sub => (
                                <label key={sub._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={formData.subTypes.includes(sub.name)}
                                    onChange={() => handleToggleOption('subTypes', sub.name)}
                                  />
                                  <span className="text-xs text-gray-700">{sub.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200 text-center text-gray-500 font-medium">
                      -
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'assignModules' ? null : 'assignModules')}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[34px]"
                        >
                          {formData.assignModules.length === 0 ? (
                            <span className="text-gray-400">Select Modules</span>
                          ) : (
                            formData.assignModules.map(mod => (
                              <span key={mod} className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {mod} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('assignModules', mod); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'assignModules' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {['Bidding', 'P.O Order', 'Customize Kit Supply', 'Supply Contract'].map(mod => (
                              <label key={mod} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                <input
                                  type="checkbox"
                                  className="mr-2 h-3.5 w-3.5"
                                  checked={formData.assignModules.includes(mod)}
                                  onChange={() => handleToggleOption('assignModules', mod)}
                                />
                                <span className="text-xs text-gray-700">{mod}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      <input
                        type="text"
                        value={formData.orderTat}
                        onChange={e => setFormData({ ...formData, orderTat: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 bg-white"
                        placeholder="e.g. 10"
                      />
                    </td>
                    <td className="p-3 border-r border-gray-200 text-center">
                      <button
                        onClick={handleOpenTaskModal}
                        className="bg-[#00babc] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-[#009ca0] transition-colors whitespace-nowrap"
                      >
                        Set Task
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={handleCreate}
                        disabled={submitting}
                        className={`bg-[#00babc] text-white px-5 py-1.5 rounded text-xs font-bold hover:bg-[#009ca0] transition-colors whitespace-nowrap ${submitting ? 'opacity-50' : ''}`}
                      >
                        {submitting ? 'Saving' : 'Create'}
                      </button>
                    </td>
                  </tr>

                  {/* Saved Rows */}
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="p-8 text-center"><Loader className="animate-spin mx-auto text-blue-500" /></td>
                    </tr>
                  ) : types.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-gray-500 font-medium tracking-wide">
                        No types assigned to this location yet. Create one above.
                      </td>
                    </tr>
                  ) : (
                    types.map(type => (
                      <tr key={type._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-100 text-sm font-bold text-gray-800">{type.loginTypeName}</td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.category) ? type.category.map(c => <span key={c} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">{c}</span>) : type.category || '-'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.subCategory) ? type.subCategory.map(c => <span key={c} className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[10px]">{c}</span>) : type.subCategory || '-'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.projectType) ? type.projectType.map(c => <span key={c} className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px]">{c}</span>) : type.projectType || '-'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.subType) ? type.subType.map(c => <span key={c} className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">{c}</span>) : type.subType || '-'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.modulesTasks) ? type.modulesTasks.map(t => (
                              <div key={t} className="flex items-center gap-1.5 text-[11px] text-gray-600 w-full mb-0.5">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {t}
                              </div>
                            )) : '-'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(type.assignModules) ? (
                              type.assignModules.map(mod => (
                                <span key={mod} className="bg-cyan-50 text-cyan-600 px-1.5 py-0.5 rounded text-[10px]">{mod}</span>
                              ))
                            ) : (
                              type.assignModules || '-'
                            )}
                          </div>
                        </td>
                        <td className="p-3 border-r border-gray-100 text-sm text-gray-600">{type.orderTat || '-'}</td>
                        <td className="p-3 border-r border-gray-100 text-center">
                          <button
                            onClick={() => handleOpenEditTaskModal(type)}
                            className="text-[#00babc] text-xs font-bold hover:underline"
                          >
                            Edit Task
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(type._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors inline-block"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>

            <div className="bg-white border-t border-gray-200 py-4 w-full">
              <p className="text-center text-xs font-semibold text-gray-600 uppercase tracking-widest mt-2">
                Copyright © 2025 Solarkits. All Rights Reserved.
              </p>
            </div>
          </div>
        )}

      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8f9fa]">
              <h2 className="text-xl font-bold text-[#14233c]">{editingTypeId ? 'Edit Supplier Type' : 'Select Modules Tasks'}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {editingTypeId ? (
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-5">


                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'editCat' ? null : 'editCat')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[38px]"
                        >
                          {editFormData.categories.length === 0 ? (
                            <span className="text-gray-400">Select Categories</span>
                          ) : (
                            editFormData.categories.map(name => (
                              <span key={name} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('categories', name, true); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'editCat' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.categories.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">No categories found</div>
                            ) : (
                              masterLists.categories.map(cat => (
                                <label key={cat._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={editFormData.categories.includes(cat.name)}
                                    onChange={() => handleToggleOption('categories', cat.name, true)}
                                  />
                                  <span className="text-xs text-gray-700">{cat.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Sub Category</label>
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'editSubCat' ? null : 'editSubCat')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[38px]"
                        >
                          {editFormData.subCategories.length === 0 ? (
                            <span className="text-gray-400">Select Sub Categories</span>
                          ) : (
                            editFormData.subCategories.map(name => (
                              <span key={name} className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('subCategories', name, true); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'editSubCat' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.subCategories.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">Select Category first</div>
                            ) : (
                              masterLists.subCategories.map(sub => (
                                <label key={sub._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={editFormData.subCategories.includes(sub.name)}
                                    onChange={() => handleToggleOption('subCategories', sub.name, true)}
                                  />
                                  <span className="text-xs text-gray-700">{sub.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Assign Modules</label>
                      <div className="grid grid-cols-1 gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {['Bidding', 'P.O Order', 'Customize Kit Supply', 'Supply Contract'].map(mod => (
                          <label key={mod} className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                              checked={editFormData.assignModules.includes(mod)}
                              onChange={() => handleToggleOption('assignModules', mod, true)}
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-cyan-600 transition-colors font-medium">
                              {mod}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Project Info & TAT */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Type</label>
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'editProj' ? null : 'editProj')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[38px]"
                        >
                          {editFormData.projectTypes.length === 0 ? (
                            <span className="text-gray-400">Select Project Types</span>
                          ) : (
                            editFormData.projectTypes.map(name => (
                              <span key={name} className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('projectTypes', name, true); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'editProj' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.projectTypes.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">Select Category & Sub Category first</div>
                            ) : (
                              masterLists.projectTypes.map(proj => (
                                <label key={proj.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={editFormData.projectTypes.includes(proj.name)}
                                    onChange={() => handleToggleOption('projectTypes', proj.name, true)}
                                  />
                                  <span className="text-xs text-gray-700">{proj.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Sub Type</label>
                      <div className="relative">
                        <div
                          onClick={() => setOpenSelect(openSelect === 'editSubType' ? null : 'editSubType')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-pointer flex flex-wrap gap-1 min-h-[38px]"
                        >
                          {editFormData.subTypes.length === 0 ? (
                            <span className="text-gray-400">Select Sub Types</span>
                          ) : (
                            editFormData.subTypes.map(name => (
                              <span key={name} className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {name} <X size={10} onClick={(e) => { e.stopPropagation(); handleToggleOption('subTypes', name, true); }} />
                              </span>
                            ))
                          )}
                        </div>
                        {openSelect === 'editSubType' && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {masterLists.subProjectTypes.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">Select Project Type first</div>
                            ) : (
                              masterLists.subProjectTypes.map(sub => (
                                <label key={sub._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-3.5 w-3.5"
                                    checked={editFormData.subTypes.includes(sub.name)}
                                    onChange={() => handleToggleOption('subTypes', sub.name, true)}
                                  />
                                  <span className="text-xs text-gray-700">{sub.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">No. of Days</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-100 rounded outline-none focus:border-blue-500 bg-gray-50 font-bold text-gray-800"
                        value={(editFormData.orderTat || "").toString().replace(/[^0-9]/g, '')}
                        onChange={e => setEditFormData({ ...editFormData, orderTat: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-5">Assign Tasks To Modules:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_MODULES.map((module) => {
                    const isAutoAssigned = module === 'Order Management(Bidding)' && (editingTypeId ? editFormData.assignModules : formData.assignModules).includes('Bidding');
                    return (
                      <label key={module} className={`flex items-center group cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors border border-gray-100 ${isAutoAssigned ? 'opacity-70 bg-gray-50' : ''}`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                          checked={(editingTypeId ? editFormData.modulesTasks : tempModules).includes(module)}
                          onChange={() => !isAutoAssigned && handleToggleTempModule(module)}
                          disabled={isAutoAssigned}
                        />
                        <span className={`ml-3 text-xs group-hover:text-blue-600 transition-colors font-medium ${isAutoAssigned ? 'text-blue-600 font-bold italic' : 'text-gray-700'}`}>
                          {module} {isAutoAssigned && '(Auto)'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 bg-[#f8f9fa] border-t border-gray-100">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTasks}
                className="px-8 py-2.5 text-sm font-bold text-white bg-[#0076a8] rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                {editingTypeId ? 'Save Changes' : 'Save Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};