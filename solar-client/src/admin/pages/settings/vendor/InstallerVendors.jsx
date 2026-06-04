import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, Trash2, X, Eye, EyeOff, Edit, Check, Boxes } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { locationAPI } from '../../../../api/api';
import { productApi } from '../../../../api/productApi';
import {
  getInstallerVendorPlans,
  saveInstallerVendorPlan,
  deleteInstallerVendorPlan
} from '../../../../services/vendor/vendorApi';
import { getSubCategories } from '../../../../services/core/masterApi';

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

const signupRequirements = [
  'Aadhar Card', 'PAN Card', 'GST Number', 'Electronic Licence'
];

const paymentMethods = ['Cash', 'UPI'];

export default function InstallerVendors() {
  const [activePlan, setActivePlan] = useState('Starter Plan');
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [plans, setPlans] = useState(["Starter Plan", "Silver Plan", "Gold Plan", "Platinum Plan"]);
  const [allFetchedPlans, setAllFetchedPlans] = useState([]); // Array of all saved plan objects
  const [globalPlanNames, setGlobalPlanNames] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [masterProjectTypeRanges, setMasterProjectTypeRanges] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [mappings, setMappings] = useState([]);

  // Location Hierarchy State
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: []
  });

  const [selectedLocation, setSelectedLocation] = useState({
    country: '',
    state: '',
    cluster: '',
    district: ''
  });

  // Initialize state for a plan
  const getDefaultPlanState = () => ({
    requirements: [],
    coverage: "1 District",
    projectTypes: [],
    categories: [],
    subProjectTypes: [],
    projectTypeRanges: [],
    subscription: "0",
    paymentMethods: [],
    teams: {},
    rates: {},
    weeklyKWAssign: {}
  });

  const [planSettings, setPlanSettings] = useState({});

  useEffect(() => {
    fetchGlobalNames();
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const [res, catRes, subPTRes, mappingRes] = await Promise.all([
        getSubCategories({ silent: true }),
        productApi.getCategories({ silent: true }),
        productApi.getSubProjectTypes({ silent: true }),
        productApi.getProjectCategoryMappings({ silent: true })
      ]);
      if (res.data) setSubCategories(res.data);
      if (catRes.data?.data) setMasterCategories(catRes.data.data);
      if (subPTRes.data?.data) setMasterSubProjectTypes(subPTRes.data.data);
      
      if (mappingRes.data?.data) {
        setMappings(mappingRes.data.data);
        const ranges = mappingRes.data.data.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`);
        setMasterProjectTypeRanges([...new Set(ranges)]);
      }
    } catch (err) {
      console.error('Failed to fetch sub-categories', err);
    }
  };

  const fetchGlobalNames = async () => {
    try {
      const response = await getInstallerVendorPlans({ fetchAllNames: true });
      if (response.success && response.data) {
        setGlobalPlanNames(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch global names', err);
    }
  };

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
      } else setLocationData(prev => ({ ...prev, clusters: [] }));
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
      } else setLocationData(prev => ({ ...prev, districts: [] }));
    };
    fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state]);

  // Fetch plans from DB
  useEffect(() => {
    if (selectedLocation.district) {
      fetchPlans();
    } else {
      const baseOrder = ["Starter Plan", "Silver Plan", "Gold Plan", "Platinum Plan"];
      const fetchedNames = globalPlanNames.length > 0 ? globalPlanNames : baseOrder;
      const sortedNames = Array.from(new Set([...baseOrder, ...fetchedNames]));
      setPlans(sortedNames);
      setPlanSettings(sortedNames.reduce((acc, name) => ({ ...acc, [name]: getDefaultPlanState() }), {}));
      setActivePlan(sortedNames[0] || 'Starter Plan');
      setAllFetchedPlans([]);
    }
  }, [selectedLocation.district, selectedLocation.cluster, selectedLocation.state, selectedLocation.country, globalPlanNames]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const params = {};
      if (selectedLocation.district && selectedLocation.district !== 'all') {
        params.districtId = selectedLocation.district;
      } else if (selectedLocation.cluster && selectedLocation.cluster !== 'all') {
        params.clusterId = selectedLocation.cluster;
      } else if (selectedLocation.state && selectedLocation.state !== 'all') {
        params.stateId = selectedLocation.state;
      } else if (selectedLocation.country && selectedLocation.country !== 'all') {
        params.countryId = selectedLocation.country;
      }

      const response = await getInstallerVendorPlans(params);
      if (response.success && response.data.length > 0) {
        const dbPlans = response.data;
        setAllFetchedPlans(dbPlans);
        
        // If specific district is selected, populate form. If "all", just list them (or populate if they want to mass-edit one).
        // Standardizing on always populating form with the FIRST available plan match or defaults.
        const districtPlans = selectedLocation.district !== 'all' 
          ? dbPlans.filter(p => p.districtId?._id === selectedLocation.district || p.districtId === selectedLocation.district)
          : dbPlans; // Just take any to populate form

        // Ensure defaults are always shown in tabs
        const baseOrder = ["Starter Plan", "Silver Plan", "Gold Plan", "Platinum Plan"];
        const fetchedNames = globalPlanNames.length > 0 ? globalPlanNames : baseOrder;
        const planNames = Array.from(new Set([...baseOrder, ...fetchedNames, ...districtPlans.map(p => p.name)]));
        setPlans(planNames);
        if(!activePlan || !planNames.includes(activePlan)) setActivePlan(planNames[0]);

        const settings = {};
        planNames.forEach(name => {
          const dbPlan = districtPlans.find(p => p.name === name);
          // Only keep global settings (subscription, requirements, payment methods) if available
          // But ALWAYS reset the product selection matrix and related dynamic fields for the "Add New" workflow
          const defaults = getDefaultPlanState();
          settings[name] = dbPlan ? { 
            ...dbPlan, 
            categories: [], 
            projectTypes: [], 
            subProjectTypes: [], 
            projectTypeRanges: [],
            teams: {},
            rates: {},
            weeklyKWAssign: {},
            _id: undefined // Don't pre-fill with existing ID for the append form
          } : defaults;
        });
        setPlanSettings(settings);
      } else {
        const baseOrder = ["Starter Plan", "Silver Plan", "Gold Plan", "Platinum Plan"];
        const fetchedNames = globalPlanNames.length > 0 ? globalPlanNames : baseOrder;
        const sortedNames = Array.from(new Set([...baseOrder, ...fetchedNames]));

        setPlans(sortedNames);
        setPlanSettings(sortedNames.reduce((acc, name) => ({ ...acc, [name]: getDefaultPlanState() }), {}));
        setAllFetchedPlans([]);
        setActivePlan(sortedNames[0] || 'Starter Plan');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  // 1. Cascading Matrix Logic: Use sub-categories and mappings to filter columns
  const filteredSubCategories = useMemo(() => {
    const selectedCats = planSettings[activePlan]?.categories || [];
    if (selectedCats.length === 0) return subCategories;
    
    // Get IDs of selected categories
    const selectedCatIds = masterCategories.filter(c => selectedCats.includes(c.name)).map(c => c._id);
    
    // Filter sub-categories that belong to these categories
    // In our model, mappings link categoryId and subCategoryId
    const subCatIdsInSelectedCats = mappings
      .filter(m => selectedCatIds.includes(m.categoryId?._id || m.categoryId))
      .map(m => m.subCategoryId?._id || m.subCategoryId);
    
    return subCategories.filter(sc => subCatIdsInSelectedCats.includes(sc._id));
  }, [activePlan, planSettings, subCategories, masterCategories, mappings]);

  const filteredProjectTypeRanges = useMemo(() => {
    const selectedSubCats = planSettings[activePlan]?.projectTypes || [];
    if (selectedSubCats.length === 0) return masterProjectTypeRanges;

    const selectedSubCatIds = subCategories.filter(sc => selectedSubCats.includes(sc.name)).map(sc => sc._id);
    
    const relevantMappings = mappings.filter(m => selectedSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId));
    const ranges = relevantMappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`);
    return [...new Set(ranges)];
  }, [activePlan, planSettings, subCategories, masterProjectTypeRanges, mappings]);

  const filteredSubProjectTypes = useMemo(() => {
    const selectedSubCats = planSettings[activePlan]?.projectTypes || [];
    if (selectedSubCats.length === 0) return masterSubProjectTypes;

    const selectedSubCatIds = subCategories.filter(sc => selectedSubCats.includes(sc.name)).map(sc => sc._id);
    const subPTIds = mappings
      .filter(m => selectedSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId))
      .map(m => m.subProjectTypeId?._id || m.subProjectTypeId)
      .filter(id => id); // Remove nulls
      
    return masterSubProjectTypes.filter(spt => subPTIds.includes(spt._id));
  }, [activePlan, planSettings, subCategories, masterSubProjectTypes, mappings]);

  const handleInputChange = (field, value, subfield = null) => {
    setPlanSettings(prev => ({
      ...prev,
      [activePlan]: {
        ...prev[activePlan],
        [field]: subfield ? { ...prev[activePlan][field], [subfield]: value } : value
      }
    }));
  };

  const handleCheckboxToggle = (field, value) => {
    const current = planSettings[activePlan][field] || [];
    const updated = current.includes(value)
      ? current.filter(i => i !== value)
      : [...current, value];
    handleInputChange(field, updated);
  };

  const handleSaveSettings = async () => {
    try {
      const currentPlanData = planSettings[activePlan];
      
      // EXCLUDE _id to always CREATE a new configuration when saving from the main form (Append behavior)
      const { _id, ...safePlanData } = currentPlanData;

      const payload = {
        ...safePlanData,
        name: activePlan,
        categories: currentPlanData.categories || [],
        subProjectTypes: currentPlanData.subProjectTypes || [],
        projectTypeRanges: currentPlanData.projectTypeRanges || [],
        countryId: selectedLocation.country === 'all' ? null : selectedLocation.country,
        stateId: selectedLocation.state === 'all' ? null : selectedLocation.state,
        clusterId: selectedLocation.cluster === 'all' ? null : selectedLocation.cluster,
      };

      if (selectedLocation.district === 'all') {
         payload.districtId = null;
      } else {
         payload.districtId = selectedLocation.district;
      }

      const response = await saveInstallerVendorPlan(payload);
      if (response.success) {
        toast.success(`${activePlan} settings saved!`);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleAddPlan = async () => {
    if (!newPlanName.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (plans.includes(newPlanName.trim())) {
      toast.error('Plan already exists');
      return;
    }

    const name = newPlanName.trim();
    
    try {
      // Save globally so it persists
      const payload = {
        ...getDefaultPlanState(),
        name,
        stateId: null,
        clusterId: null,
        districtId: null
      };
      await saveInstallerVendorPlan(payload);

      setPlans(prev => [...prev, name]);
      setPlanSettings(prev => ({ ...prev, [name]: getDefaultPlanState() }));
      setActivePlan(name);
      setNewPlanName('');
      setIsAddPlanModalOpen(false);
      toast.success(`Plan "${name}" added.`);
      fetchGlobalNames();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add plan globally');
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlan({ ...plan });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field, value, subfield = null) => {
    setEditingPlan(prev => ({
      ...prev,
      [field]: subfield ? { ...prev[field], [subfield]: value } : value
    }));
  };

  const handleEditCheckboxToggle = (field, value) => {
    const current = editingPlan[field] || [];
    const updated = current.includes(value)
      ? current.filter(i => i !== value)
      : [...current, value];
    handleEditInputChange(field, updated);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editingPlan,
        categories: editingPlan.categories || [],
        subProjectTypes: editingPlan.subProjectTypes || [],
        projectTypeRanges: editingPlan.projectTypeRanges || [],
        countryId: editingPlan.countryId?._id || editingPlan.countryId,
        stateId: editingPlan.stateId?._id || editingPlan.stateId,
        clusterId: editingPlan.clusterId?._id || editingPlan.clusterId,
        districtId: editingPlan.districtId?._id || editingPlan.districtId,
      };

      const response = await saveInstallerVendorPlan(payload);
      if (response.success) {
        toast.success(`Plan settings updated!`);
        setIsEditModalOpen(false);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleDeletePlan = async (planName, providedPlanId) => {
    try {
      if (providedPlanId) {
        await deleteInstallerVendorPlan(providedPlanId);
        toast.success(`Configuration for ${planName} deleted`);
      } else {
        if (!window.confirm(`Are you sure you want to completely delete "${planName}" and all its configurations?`)) return;
        
        await deleteInstallerVendorPlan('by-name', { name: planName });
        toast.success(`Plan "${planName}" entirely deleted`);
        
        // Remove from local states
        setPlans(prev => prev.filter(p => p !== planName));
        if (activePlan === planName) {
          const remainingPlans = plans.filter(p => p !== planName);
          setActivePlan(remainingPlans.length > 0 ? remainingPlans[0] : null);
        }
      }
      
      await fetchGlobalNames();
      fetchPlans(); // Refresh the table immediately
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      {/* Header Block */}
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-xl font-bold text-[#14233c]">Installer Vendor Management</h1>
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
          <div className="space-y-10 mb-16">
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
                        subtitle={parentCluster ? parentCluster.name : 'DT'}
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

          {/* Plan Configuration Area */}
          {(selectedLocation.district && plans.length > 0) && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {/* Plan Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {plans.map(plan => {
                const isActive = activePlan === plan;
                let textStyle = "text-gray-600";
                if (!isActive) {
                  if (plan === "Starter Plan") textStyle = "text-[#3b8bc6]";
                  else if (plan === "Silver Plan") textStyle = "text-gray-500";
                  else if (plan === "Gold Plan") textStyle = "text-[#fbbf24]";
                  else if (plan === "Platinum Plan") textStyle = "text-[#10b981]";
                }

                return (
                  <div key={plan} className="relative group">
                    <button
                      onClick={() => setActivePlan(plan)}
                      className={`px-6 py-2 rounded-md text-[15px] font-bold transition-all tracking-wide ${isActive
                        ? 'bg-[#4096d2] text-white ring-2 ring-blue-200 shadow-sm'
                        : `bg-transparent ${textStyle} hover:bg-gray-100`
                        }`}
                    >
                      {plan}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setIsAddPlanModalOpen(true)}
                className="px-6 py-2 rounded-md text-[15px] font-bold bg-[#343a40] text-white hover:bg-gray-800 transition-all shadow-md ml-2"
              >
                Add More Plan
              </button>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : planSettings[activePlan] ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto overflow-hidden mb-16 px-8 py-10">
                {/* Plan Title Header to replicate PHP layout */}
                <div className="mb-8 border-b-2 border-blue-500 pb-4">
                  <h2 className="text-3xl font-bold text-gray-500">{activePlan}</h2>
                </div>

                {/* NEW Space-Optimized Layout */}
                  <div className="space-y-8">
                    {/* Top Section: Standard Controls (2 Columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      {/* Left: Signup & Subscription */}
                      <div className="space-y-8">
                        <section>
                          <h5 className="font-bold text-gray-800 mb-6 text-base flex border-l-4 border-blue-500 pl-3 uppercase tracking-wider">App Signup Requirements</h5>
                          <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            {signupRequirements.map((req) => (
                              <label key={req} className="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-xl hover:bg-white transition-all duration-200">
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={planSettings[activePlan].requirements.includes(req)}
                                    onChange={() => handleCheckboxToggle('requirements', req)}
                                    className="w-5 h-5 accent-green-600 rounded-md cursor-pointer shadow-sm"
                                  />
                                </div>
                                <span className="text-gray-700 font-semibold text-xs group-hover:text-green-700 transition-colors uppercase tracking-tight">{req}</span>
                              </label>
                            ))}
                          </div>
                        </section>

                        <section>
                          <h5 className="font-bold text-gray-800 mb-4 text-base flex border-l-4 border-blue-500 pl-3 uppercase tracking-wider">Monthly Subscription (₹)</h5>
                          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            <input
                              type="number"
                              name="subscription"
                              value={planSettings[activePlan].subscription}
                              onChange={(e) => handleInputChange('subscription', e.target.value)}
                              className="w-full text-base font-bold text-blue-600 p-4 rounded-xl border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all shadow-sm outline-none"
                              placeholder="Enter Price Amount"
                            />
                          </div>
                        </section>
                      </div>

                      {/* Right: Coverage & Payments */}
                      <div className="space-y-8">
                        <section>
                          <h5 className="font-bold text-gray-800 mb-4 text-base flex border-l-4 border-blue-500 pl-3 uppercase tracking-wider">Coverage</h5>
                          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-inner space-y-6">
                            <div className="flex items-center gap-8 bg-white/50 p-3 rounded-xl border border-gray-100">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="radio"
                                  name="districtMode"
                                  checked={!planSettings[activePlan].isMultipleDistricts}
                                  onChange={() => handleInputChange('isMultipleDistricts', false)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600">Single District</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="radio"
                                  name="districtMode"
                                  checked={planSettings[activePlan].isMultipleDistricts}
                                  onChange={() => handleInputChange('isMultipleDistricts', true)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600">Multiple District</span>
                              </label>
                            </div>

                            <div className="relative">
                              <select
                                value={planSettings[activePlan].isMultipleDistricts ? (planSettings[activePlan].districts || []) : (planSettings[activePlan].districts?.[0] || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (planSettings[activePlan].isMultipleDistricts) {
                                    const currentValues = planSettings[activePlan].districts || [];
                                    const newValues = currentValues.includes(val) ? currentValues.filter(v => v !== val) : [...currentValues, val];
                                    handleInputChange('districts', newValues);
                                  } else {
                                    handleInputChange('districts', [val]);
                                  }
                                }}
                                className="w-full text-xs font-bold p-4 pr-10 rounded-xl border-2 border-transparent focus:border-blue-400 bg-white shadow-sm outline-none appearance-none"
                              >
                                <option value="">{planSettings[activePlan].isMultipleDistricts ? 'Select Warehouse(s)' : 'Select Warehouse'}</option>
                                {locationData.districts.map(d => (
                                  <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={18} /></div>
                            </div>

                            {planSettings[activePlan].isMultipleDistricts && (planSettings[activePlan].districts || []).length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {planSettings[activePlan].districts.map(d => (
                                  <span key={d} className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-200">
                                    {d}
                                    <X size={12} className="cursor-pointer hover:text-red-200" onClick={() => handleInputChange('districts', planSettings[activePlan].districts.filter(v => v !== d))} />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </section>

                        <section>
                          <h5 className="font-bold text-gray-800 mb-4 text-base flex border-l-4 border-blue-500 pl-3 uppercase tracking-wider">Payment Methods</h5>
                          <div className="flex gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            {paymentMethods.map((method) => (
                              <label key={method} className="flex items-center gap-3 cursor-pointer group hover:bg-white p-2 rounded-xl transition-all">
                                <input
                                  type="checkbox"
                                  checked={planSettings[activePlan].paymentMethods.includes(method)}
                                  onChange={() => handleCheckboxToggle('paymentMethods', method)}
                                  className="w-5 h-5 accent-green-600 rounded-md cursor-pointer shadow-sm"
                                />
                                <span className="text-gray-700 font-bold text-xs group-hover:text-green-700 uppercase tracking-tighter">{method}</span>
                              </label>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>

                    {/* Bottom Section: Modern Sequential Drops */}
                    <div className="space-y-4">
                      <div className="bg-[#0b386a] p-5 rounded-t-2xl flex justify-between items-center bg-gradient-to-r from-[#0b386a] to-[#1a5a9b]">
                        <h5 className="font-bold text-white text-sm mb-0 uppercase tracking-widest flex items-center gap-3">
                          <span className="bg-white/20 p-2 rounded-lg"><Boxes size={18} /></span>
                          Product Selection Matrix (Sequential)
                        </h5>
                        <div className="flex gap-4">
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg text-white/80 text-[10px] font-bold">Total Selected Categories: {planSettings[activePlan].categories?.length || 0}</div>
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg text-white/80 text-[10px] font-bold">Total Selected Sub-Categories: {planSettings[activePlan].projectTypes?.length || 0}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-b-2xl border-x border-b border-gray-200 shadow-xl">
                        {/* 1. Category */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center justify-between">
                            1. Category
                            <button onClick={() => handleInputChange('categories', planSettings[activePlan].categories?.length === masterCategories.length ? [] : masterCategories.map(c => c.name))} className="text-blue-500 hover:underline lowercase italic text-[9px]">Select All</button>
                          </label>
                          <Select
                            isMulti
                            options={masterCategories.map(c => ({ value: c.name, label: c.name }))}
                            value={planSettings[activePlan].categories?.map(c => ({ value: c, label: c })) || []}
                            onChange={(val) => handleInputChange('categories', val ? val.map(v => v.value) : [])}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select Categories..."
                            styles={{
                              control: (base) => ({ ...base, borderRadius: '12px', borderColor: '#e2e8f0', padding: '2px', fontSize: '12px', fontWeight: 'bold' }),
                              multiValue: (base) => ({ ...base, backgroundColor: '#eff6ff', borderRadius: '8px' }),
                              multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontWeight: 'bold' })
                            }}
                          />
                        </div>

                        {/* 2. Sub-Category */}
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${planSettings[activePlan].categories?.length ? 'text-green-900' : 'text-gray-300'}`}>
                            2. Sub-Category
                            {planSettings[activePlan].categories?.length > 0 && <button onClick={() => handleInputChange('projectTypes', planSettings[activePlan].projectTypes?.length === filteredSubCategories.length ? [] : filteredSubCategories.map(s => s.name))} className="text-green-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                          </label>
                          <Select
                            isMulti
                            isDisabled={!planSettings[activePlan].categories?.length}
                            options={filteredSubCategories.map(sc => ({ value: sc.name, label: sc.name }))}
                            value={planSettings[activePlan].projectTypes?.map(pt => ({ value: pt, label: pt })) || []}
                            onChange={(val) => handleInputChange('projectTypes', val ? val.map(v => v.value) : [])}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder={planSettings[activePlan].categories?.length ? "Select Sub-Categories..." : "Select category first..."}
                            styles={{
                              control: (base) => ({ ...base, borderRadius: '12px', borderColor: '#e2e8f0', padding: '2px', fontSize: '12px', fontWeight: 'bold' }),
                              multiValue: (base) => ({ ...base, backgroundColor: '#f0fdf4', borderRadius: '8px' }),
                              multiValueLabel: (base) => ({ ...base, color: '#166534', fontWeight: 'bold' })
                            }}
                          />
                        </div>

                        {/* 3. Project Type (kW) */}
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${planSettings[activePlan].projectTypes?.length ? 'text-emerald-900' : 'text-gray-300'}`}>
                            3. Project Type (kW)
                            {planSettings[activePlan].projectTypes?.length > 0 && <button onClick={() => handleInputChange('projectTypeRanges', planSettings[activePlan].projectTypeRanges?.length === filteredProjectTypeRanges.length ? [] : filteredProjectTypeRanges)} className="text-emerald-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                          </label>
                          <Select
                            isMulti
                            isDisabled={!planSettings[activePlan].projectTypes?.length}
                            options={filteredProjectTypeRanges.map(range => ({ value: range, label: range }))}
                            value={planSettings[activePlan].projectTypeRanges?.map(r => ({ value: r, label: r })) || []}
                            onChange={(val) => handleInputChange('projectTypeRanges', val ? val.map(v => v.value) : [])}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder={planSettings[activePlan].projectTypes?.length ? "Select Capacity Ranges..." : "Select sub-category first..."}
                            styles={{
                              control: (base) => ({ ...base, borderRadius: '12px', borderColor: '#e2e8f0', padding: '2px', fontSize: '12px', fontWeight: 'black' }),
                              multiValue: (base) => ({ ...base, backgroundColor: '#ecfdf5', borderRadius: '8px' }),
                              multiValueLabel: (base) => ({ ...base, color: '#065f46', fontWeight: 'black' })
                            }}
                          />
                        </div>

                        {/* 4. Sub-Project Type */}
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${planSettings[activePlan].projectTypes?.length ? 'text-purple-900' : 'text-gray-300'}`}>
                            4. Sub-Project Type
                            {planSettings[activePlan].projectTypes?.length > 0 && <button onClick={() => handleInputChange('subProjectTypes', planSettings[activePlan].subProjectTypes?.length === filteredSubProjectTypes.length ? [] : filteredSubProjectTypes.map(c => c.name))} className="text-purple-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                          </label>
                          <Select
                            isMulti
                            isDisabled={!planSettings[activePlan].projectTypes?.length}
                            options={filteredSubProjectTypes.map(spt => ({ value: spt.name, label: spt.name }))}
                            value={planSettings[activePlan].subProjectTypes?.map(spt => ({ value: spt, label: spt })) || []}
                            onChange={(val) => handleInputChange('subProjectTypes', val ? val.map(v => v.value) : [])}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder={planSettings[activePlan].projectTypes?.length ? "Select Sub-Project Types..." : "Select sub-category first..."}
                            styles={{
                              control: (base) => ({ ...base, borderRadius: '12px', borderColor: '#e2e8f0', padding: '2px', fontSize: '12px', fontWeight: 'bold' }),
                              multiValue: (base) => ({ ...base, backgroundColor: '#f5f3ff', borderRadius: '8px' }),
                              multiValueLabel: (base) => ({ ...base, color: '#5b21b6', fontWeight: 'bold' })
                            }}
                          />
                        </div>
                      </div>
                    </div>

                      <section>
                        <h5 className="font-bold text-gray-800 mb-6 text-base flex border-l-4 border-orange-500 pl-3 uppercase tracking-wider">Team Allocation</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-orange-50/20 p-8 rounded-[2rem] border-2 border-orange-100/50 shadow-inner">
                          {(planSettings[activePlan]?.projectTypes || []).length > 0 ? (
                            planSettings[activePlan].projectTypes.map((type) => (
                              <div key={type} className="flex items-center justify-between gap-4 py-3 bg-white px-6 rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                                <span className="text-gray-700 text-[11px] font-black title-capitalize leading-tight line-clamp-2 uppercase group-hover:text-orange-700">{type}</span>
                                <div className="flex items-center bg-orange-50/80 rounded-xl px-3 py-2 border border-orange-100">
                                  <input
                                    type="number"
                                    value={planSettings[activePlan].teams?.[type] || 0}
                                    onChange={(e) => handleInputChange('teams', parseInt(e.target.value) || 0, type)}
                                    className="w-12 bg-transparent text-center text-xs font-black text-orange-700 outline-none"
                                  />
                                  <span className="text-[9px] text-orange-300 font-black uppercase ml-1 tracking-tighter">Team</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-12 text-center">
                               <div className="inline-block bg-orange-100/50 p-4 rounded-full mb-3 text-orange-400"><Boxes size={40} /></div>
                               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Select Sub-Categories in the matrix above to allocate teams</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 pt-12 border-t border-gray-100">
                    {/* Row 3: Rates & KW Assign */}
                    <div className="col-span-1">
                      <h5 className="font-bold text-gray-800 mb-3 text-base">Installer Rate Setting</h5>
                      <div className="space-y-4">
                        {(planSettings[activePlan]?.projectTypes || []).map((type) => (
                           <div key={`rate-group-${type}`} className="space-y-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                             <p className="text-gray-900 font-black text-xs uppercase tracking-widest border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                               {type} Rates (Per KW)
                             </p>
                             <div className="space-y-2.5">
                               {(planSettings[activePlan]?.subProjectTypes || []).map((subType) => {
                                 const rateKey = `${type}_${subType}`;
                                 return (
                                   <div key={rateKey} className="flex items-center gap-4 pl-2 group">
                                     <span className="w-24 text-gray-500 text-[10px] font-bold uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{subType}</span>
                                     <div className="relative flex-1">
                                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">₹</span>
                                       <input
                                         type="text"
                                         value={planSettings[activePlan].rates?.[rateKey] || "0"}
                                         onChange={(e) => handleInputChange('rates', e.target.value, rateKey)}
                                         className="w-full pl-6 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                                         placeholder="0"
                                       />
                                     </div>
                                   </div>
                                 );
                               })}
                               {(!planSettings[activePlan]?.subProjectTypes || planSettings[activePlan].subProjectTypes.length === 0) && (
                                 <p className="text-[10px] text-gray-400 italic text-center py-2">Select Sub-Project Types to set rates</p>
                               )}
                             </div>
                           </div>
                        ))}
                        {(!planSettings[activePlan]?.projectTypes || planSettings[activePlan].projectTypes.length === 0) && (
                           <div className="border-2 border-dashed border-gray-100 p-8 rounded-xl text-center">
                             <p className="text-gray-400 text-xs italic">Select Sub-Categories to enable rate settings</p>
                           </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <h5 className="font-bold text-gray-800 mb-4 text-base">Weekly KW Assign (Sub-Category)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50/30 p-5 rounded-xl border border-gray-100">
                        {(planSettings[activePlan]?.projectTypes || []).length > 0 ? (
                          planSettings[activePlan].projectTypes.map((type) => (
                            <div key={`kw-${type}`} className="flex items-center justify-between gap-4 group p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
                              <span className="text-gray-700 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1 pr-2">{type} Capacity</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={planSettings[activePlan].weeklyKWAssign?.[type] || "0"}
                                  onChange={(e) => handleInputChange('weeklyKWAssign', e.target.value, type)}
                                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                                />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">KW</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full border-2 border-dashed border-gray-100 p-8 rounded-xl text-center">
                             <p className="text-gray-400 text-xs italic">Select Sub-Categories in the top section to enable capacity settings</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-start">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-[#0076a8] hover:bg-blue-800 text-white font-bold py-2.5 px-8 rounded-md shadow-sm transition-all text-sm"
                    >
                      + Append This Configuration
                    </button>
                  </div>
                </div>
              ) : null}

            {/* Display Saved Plans (Summary) */}
            {!loadingPlans && allFetchedPlans.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-[100%] mx-auto overflow-hidden mt-10 p-6">
                <h3 className="font-bold text-lg text-[#0b386a] mb-4 border-b pb-2">Saved Configuration Overview</h3>
                <div className="overflow-x-auto pb-4">
                    <table className="w-full text-left border-collapse text-sm min-w-[1200px]">
                        <thead className="bg-[#82c5fa] text-white">
                            <tr>
                                <th className="p-3 border-r border-white/20 whitespace-nowrap">Plan Name</th>
                                <th className="p-3 border-r border-white/20">Location (S/C/D)</th>
                                <th className="p-3 border-r border-white/20 text-center">Price / Month</th>
                                <th className="p-3 border-r border-white/20 text-center">App Requirements</th>
                                <th className="p-3 border-r border-white/20 text-center">Payment Methods</th>
                                <th className="p-3 border-r border-white/20 text-center">Category Matrix</th>
                                <th className="p-3 border-r border-white/20 text-center">Sub-Category</th>
                                <th className="p-3 border-r border-white/20 text-center">Project Type (KW)</th>
                                <th className="p-3 border-r border-white/20 text-center">Sub-Project Type</th>
                                <th className="p-3 border-r border-white/20 text-center">Teams Allocation</th>
                                <th className="p-3 border-r border-white/20 text-center">Rates (R/C)</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allFetchedPlans.map((plan, idx) => (
                                <tr key={plan._id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 border-r border-gray-100 font-bold text-gray-800 whitespace-nowrap">{plan.name}</td>
                                    <td className="p-3 border-r border-gray-100 text-[10px] leading-tight text-gray-600">
                                        <span className="font-bold text-blue-800">{plan.stateId?.name || 'All'}</span> / {plan.clusterId?.name || 'All'} / <span className="text-gray-400 italic">{plan.districtId?.name || 'All'}</span>
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-blue-700 font-black">₹{plan.subscription}</td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[9px] leading-[1.1] text-gray-500 max-w-[100px]">
                                        {plan.requirements?.join(', ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-xs text-green-700 font-bold">
                                      {plan.paymentMethods?.join(' / ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[10px] text-gray-600 font-black leading-tight max-w-[100px]">
                                        {plan.categories?.join(', ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[10px] text-gray-600 leading-tight max-w-[100px]">
                                        {plan.projectTypes?.join(', ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-xs font-black text-emerald-700">
                                        {plan.projectTypeRanges?.join(', ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[10px] text-purple-700 font-bold max-w-[80px]">
                                        {plan.subProjectTypes?.join(', ') || '-'}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[9px] leading-tight text-gray-600">
                                      {Object.entries(plan.teams || {}).map(([key, val]) => (
                                          <div key={`table-team-${key}`} className="whitespace-nowrap">
                                              <span className="font-bold text-gray-400">{key}:</span> <span className="font-black text-orange-600">{val}</span>
                                          </div>
                                      ))}
                                    </td>
                                    <td className="p-3 border-r border-gray-100 text-center text-[9px] leading-tight text-gray-500">
                                        {Object.entries(plan.rates || {}).map(([key, val]) => (
                                          <div key={`table-rate-${key}`} className="whitespace-nowrap">
                                            <span className="font-bold text-gray-400 capitalize">{key.replace('_', ' ')}:</span> <span className="font-black text-blue-600">₹{val}</span>
                                          </div>
                                        ))}
                                    </td>

                                    <td className="p-3 text-center flex items-center justify-center gap-2">
                                       <button 
                                          onClick={() => handleEditClick(plan)} className="text-blue-500 hover:text-blue-700 mr-2"><Edit size={16} /></button><button onClick={() => handleDeletePlan(plan.name, plan._id)}
                                          className="text-red-500 hover:text-red-700 mx-auto"
                                        >
                                          <Trash2 size={16} />
                                       </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Plan Modal */}
        {isEditModalOpen && editingPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-2xl font-bold text-[#0b386a]">Edit Configuration</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
                    {editingPlan.name} | {editingPlan.districtId?.name || editingPlan.clusterId?.name || editingPlan.stateId?.name || 'Global'}
                  </p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Section 1 */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-blue-500 pl-3">Signup Requirements</h5>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                        {signupRequirements.map(item => (
                          <label key={item} className="flex items-center gap-3 cursor-pointer group hover:bg-white p-2 rounded-lg transition-all">
                            <input
                              type="checkbox"
                              checked={editingPlan.requirements?.includes(item)}
                              onChange={() => handleEditCheckboxToggle('requirements', item)}
                              className="w-4 h-4 accent-blue-600 rounded"
                            />
                            <span className="text-gray-700 text-xs font-bold group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-green-500 pl-3">Coverage</h5>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <input
                          type="text"
                          value={editingPlan.coverage || ""}
                          onChange={(e) => handleEditInputChange('coverage', e.target.value)}
                          placeholder="e.g. Ahmedabad, Surat"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-[10px] text-gray-400 italic">Separate multiple districts with commas</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-purple-500 pl-3">Payment & Subscription</h5>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Monthly Fee (₹)</label>
                          <input
                            type="number"
                            value={editingPlan.subscription}
                            onChange={(e) => handleEditInputChange('subscription', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {paymentMethods.map(method => (
                            <label key={method} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm hover:border-purple-200 transition-all">
                              <input
                                type="checkbox"
                                checked={editingPlan.paymentMethods?.includes(method)}
                                onChange={() => handleEditCheckboxToggle('paymentMethods', method)}
                                className="w-4 h-4 accent-purple-600 rounded"
                              />
                              <span className="text-gray-700 text-[10px] font-black uppercase tracking-tighter">{method}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>                  {/* Sequential Dropdowns Section In Modal */}
                  <div className="col-span-full mt-10">
                    <div className="bg-[#0b386a] p-4 rounded-t-2xl bg-gradient-to-r from-[#0b386a] to-[#1a5a9b]">
                      <h5 className="font-bold text-white text-xs mb-0 uppercase tracking-widest flex items-center gap-3">
                        Product Classification (Sequential)
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/50 p-8 rounded-b-2xl border-x border-b border-gray-200">
                      {/* 1. Category */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center justify-between">
                          1. Category
                          <button onClick={() => {
                            const all = masterCategories.map(c => c.name);
                            handleEditInputChange('categories', editingPlan.categories?.length === all.length ? [] : all);
                          }} className="text-blue-500 hover:underline lowercase italic text-[9px]">Select All</button>
                        </label>
                        <Select
                          isMulti
                          options={masterCategories.map(c => ({ value: c.name, label: c.name }))}
                          value={editingPlan.categories?.map(c => ({ value: c, label: c })) || []}
                          onChange={(val) => handleEditInputChange('categories', val ? val.map(v => v.value) : [])}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select Categories..."
                          styles={{
                            control: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }),
                          }}
                        />
                      </div>

                      {/* 2. Sub-Category */}
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${editingPlan.categories?.length ? 'text-green-900' : 'text-gray-300'}`}>
                          2. Sub-Category
                          {editingPlan.categories?.length > 0 && <button onClick={() => {
                            const filtered = subCategories.filter(sc => {
                              const selCatIds = masterCategories.filter(c => editingPlan.categories.includes(c.name)).map(c => c._id);
                              const validSubCatIds = mappings.filter(m => selCatIds.includes(m.categoryId?._id || m.categoryId)).map(m => m.subCategoryId?._id || m.subCategoryId);
                              return validSubCatIds.includes(sc._id);
                            });
                            const all = filtered.map(s => s.name);
                            handleEditInputChange('projectTypes', editingPlan.projectTypes?.length === all.length ? [] : all);
                          }} className="text-green-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                        </label>
                        <Select
                          isMulti
                          isDisabled={!editingPlan.categories?.length}
                          options={subCategories.filter(sc => {
                            const selCatIds = masterCategories.filter(c => editingPlan.categories?.includes(c.name)).map(c => c._id);
                            const validSubCatIds = mappings.filter(m => selCatIds.includes(m.categoryId?._id || m.categoryId)).map(m => m.subCategoryId?._id || m.subCategoryId);
                            return validSubCatIds.includes(sc._id);
                          }).map(s => ({ value: s.name, label: s.name }))}
                          value={editingPlan.projectTypes?.map(pt => ({ value: pt, label: pt })) || []}
                          onChange={(val) => handleEditInputChange('projectTypes', val ? val.map(v => v.value) : [])}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select Sub-Categories..."
                          styles={{
                            control: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }),
                          }}
                        />
                      </div>

                      {/* 3. Project Type (kW) */}
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${editingPlan.projectTypes?.length ? 'text-emerald-900' : 'text-gray-300'}`}>
                          3. Project Type (kW)
                          {editingPlan.projectTypes?.length > 0 && <button onClick={() => {
                            const selSubCatIds = subCategories.filter(sc => editingPlan.projectTypes.includes(sc.name)).map(sc => sc._id);
                            const all = mappings.filter(m => selSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId)).map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`);
                            const uniqueAll = [...new Set(all)];
                            handleEditInputChange('projectTypeRanges', editingPlan.projectTypeRanges?.length === uniqueAll.length ? [] : uniqueAll);
                          }} className="text-emerald-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                        </label>
                        <Select
                          isMulti
                          isDisabled={!editingPlan.projectTypes?.length}
                          options={[...new Set(mappings.filter(m => {
                            const selSubCatIds = subCategories.filter(sc => editingPlan.projectTypes?.includes(sc.name)).map(sc => sc._id);
                            return selSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId);
                          }).map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`))].map(r => ({ value: r, label: r }))}
                          value={editingPlan.projectTypeRanges?.map(r => ({ value: r, label: r })) || []}
                          onChange={(val) => handleEditInputChange('projectTypeRanges', val ? val.map(v => v.value) : [])}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select Capacity..."
                          styles={{
                            control: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }),
                          }}
                        />
                      </div>

                      {/* 4. Sub-Project Type */}
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${editingPlan.projectTypes?.length ? 'text-purple-900' : 'text-gray-300'}`}>
                          4. Sub-Project Type
                          {editingPlan.projectTypes?.length > 0 && <button onClick={() => {
                            const selSubCatIds = subCategories.filter(sc => editingPlan.projectTypes.includes(sc.name)).map(sc => sc._id);
                            const all = mappings.filter(m => selSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId)).map(m => m.subProjectTypeId?.name).filter(Boolean);
                            const uniqueAll = [...new Set(all)];
                            handleEditInputChange('subProjectTypes', editingPlan.subProjectTypes?.length === uniqueAll.length ? [] : uniqueAll);
                          }} className="text-purple-500 hover:underline lowercase italic text-[9px]">Select All</button>}
                        </label>
                        <Select
                          isMulti
                          isDisabled={!editingPlan.projectTypes?.length}
                          options={[...new Set(mappings.filter(m => {
                            const selSubCatIds = subCategories.filter(sc => editingPlan.projectTypes?.includes(sc.name)).map(sc => sc._id);
                            return selSubCatIds.includes(m.subCategoryId?._id || m.subCategoryId);
                          }).map(m => m.subProjectTypeId?.name).filter(Boolean))].map(s => ({ value: s, label: s }))}
                          value={editingPlan.subProjectTypes?.map(s => ({ value: s, label: s })) || []}
                          onChange={(val) => handleEditInputChange('subProjectTypes', val ? val.map(v => v.value) : [])}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select Sub-Project Type..."
                          styles={{
                            control: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full mt-10">
                    <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-blue-400 pl-3 uppercase tracking-wider">Team Allocation</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50/20 p-6 rounded-3xl border border-blue-50">
                      {(editingPlan.projectTypes || []).map((type) => (
                        <div key={`edit-team-${type}`} className="flex items-center justify-between gap-4 py-3 bg-white px-5 rounded-2xl border border-blue-50 shadow-sm">
                          <span className="text-gray-700 text-[10px] font-black line-clamp-2 uppercase leading-tight">{type}</span>
                          <input
                            type="number"
                            value={editingPlan.teams?.[type] || 0}
                            onChange={(e) => {
                              const newTeams = { ...editingPlan.teams, [type]: parseInt(e.target.value) || 0 };
                              handleEditInputChange('teams', newTeams);
                            }}
                            className="w-14 py-2 border border-blue-100 rounded-xl text-center text-xs font-black text-blue-800 outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-blue-50/30"
                          />
                        </div>
                      ))}
                      {(editingPlan.projectTypes || []).length === 0 && <div className="col-span-full py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-[9px] opacity-50">Select classifications first</div>}
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-red-500 pl-3">Rate Comparison</h5>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Residential Rates</p>
                          <div className="grid grid-cols-2 gap-3 pl-2">
                             <div className="space-y-1">
                               <label className="text-[9px] text-gray-500">On-Grid</label>
                               <input type="text" value={editingPlan.rates?.resOnGrid} onChange={e => handleEditInputChange('rates', e.target.value, 'resOnGrid')} className="w-full p-2 border border-gray-200 rounded text-xs font-bold" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] text-gray-500">Off-Grid</label>
                               <input type="text" value={editingPlan.rates?.resOffGrid} onChange={e => handleEditInputChange('rates', e.target.value, 'resOffGrid')} className="w-full p-2 border border-gray-200 rounded text-xs font-bold" />
                             </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Commercial Rates</p>
                          <div className="grid grid-cols-2 gap-3 pl-2">
                             <div className="space-y-1">
                               <label className="text-[9px] text-gray-500">On-Grid</label>
                               <input type="text" value={editingPlan.rates?.comOnGrid} onChange={e => handleEditInputChange('rates', e.target.value, 'comOnGrid')} className="w-full p-2 border border-gray-200 rounded text-xs font-bold" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] text-gray-500">Off-Grid</label>
                               <input type="text" value={editingPlan.rates?.comOffGrid} onChange={e => handleEditInputChange('rates', e.target.value, 'comOffGrid')} className="w-full p-2 border border-gray-200 rounded text-xs font-bold" />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 mb-4 text-base border-l-4 border-cyan-500 pl-3">Weekly Capacity</h5>
                      <div className="bg-cyan-50/30 p-4 rounded-xl border border-cyan-100 max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                        {(editingPlan.projectTypes || []).map((type) => (
                          <div key={`edit-kw-${type}`} className="flex flex-col gap-1.5 py-1.5 border-b border-cyan-100 last:border-0">
                            <span className="text-gray-700 text-[10px] font-bold truncate uppercase">{type}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingPlan.weeklyKWAssign?.[type] || "0"}
                                onChange={(e) => {
                                  const newKW = { ...editingPlan.weeklyKWAssign, [type]: e.target.value };
                                  handleEditInputChange('weeklyKWAssign', newKW);
                                }}
                                className="flex-1 py-1.5 px-3 border border-cyan-200 rounded-lg text-xs font-bold text-cyan-800 outline-none"
                              />
                              <span className="text-[9px] font-bold text-cyan-400">KW</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-3 bg-white text-gray-600 border border-gray-300 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-8 py-3 bg-[#0076a8] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-800 transition-all font-sans"
                >
                  Apply Configuration Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Plan Modal */}
        {isAddPlanModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-[#0b386a]">Add New Plan</h3>
                <button onClick={() => setIsAddPlanModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Platinum Plan"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsAddPlanModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPlan}
                    className="flex-1 px-4 py-3 bg-[#0d6efd] text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-600 transition-all font-sans"
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="py-10 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Copyright © 2025, Solarkits. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
