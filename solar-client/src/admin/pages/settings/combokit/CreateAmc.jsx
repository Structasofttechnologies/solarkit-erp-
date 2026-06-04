import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Save, RefreshCw, Cog, List,
  Edit2, Trash2, CheckSquare, XSquare,
  Search, Filter, MoreVertical, ChevronRight,
  AlertCircle, Info, Settings, Eye, Package,
  Loader
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  getAMCServices,
  createAMCPlan,
  updateAMCPlan,
  getAMCPlans,
  deleteAMCPlan,
  getSolarKits,
  createAMCService,
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProjectCategoryMappings
} from '../../../../services/combokit/combokitApi';
import * as locationApi from '../../../../services/core/locationApi';
import toast from 'react-hot-toast';

const CreateAmc = () => {
  const { countries, states: hookStates, clusters: hookClusters, districts: hookDistricts, loading: locationLoading, fetchCountries, fetchStates, fetchClusters, fetchDistricts } = useLocations();
  
  // Multi-select states
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedDistricts, setSelectedDistricts] = useState(new Set());

  // Aggregate Data Lists
  const [availableStates, setAvailableStates] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  
  // Child loading states
  const [statesLoading, setStatesLoading] = useState(false);
  const [clustersLoading, setClustersLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  const [amcPlans, setAmcPlans] = useState([]);
  const [solarKits, setSolarKits] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Master lists for dropdowns
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);

  // Filter plans based on selected levels
  const getFilteredPlans = () => {
    return amcPlans.filter(plan => {
      // 1. Country Filter
      if (selectedCountries.size > 0) {
        const countryId = plan.state?.country?._id || plan.state?.country;
        if (countryId && !selectedCountries.has(countryId)) return false;
      }

      // 2. State Filter
      if (selectedStates.size > 0) {
        const stateId = plan.state?._id || plan.state;
        if (stateId && !selectedStates.has(stateId)) return false;
      }
      
      // 3. Cluster Filter
      if (selectedClusters.size > 0) {
        const clusterId = plan.cluster?._id || plan.cluster;
        // If plan has a cluster, it must match. If it's state-wide (no cluster), we keep it.
        if (clusterId && !selectedClusters.has(clusterId)) return false;
      }
      
      // 4. District Filter
      if (selectedDistricts.size > 0) {
        const districtId = plan.district?._id || plan.district;
        // If plan has a district, it must match. If it's cluster-wide or state-wide, we keep it.
        if (districtId && !selectedDistricts.has(districtId)) return false;
      }
      
      return true;
    });
  };

  // Memoized table data merging solar kits and active AMC plans
  const displayConfigurations = useMemo(() => {
    // Index plans by their unique configuration key
    const plansByConfig = {};
    
    // We only care about plans that are currently filtered by location
    const filteredPlans = getFilteredPlans();
    
    filteredPlans.forEach(plan => {
      // Configuration key: category|subCategory|projectType|subProjectType
      const key = `${plan.category || ''}|${plan.subCategory || ''}|${plan.projectType || ''}|${plan.subProjectType || ''}`;
      
      // If there are multiple plans for the same config (in different locations),
      // we take the first one found as representative for the summary/status.
      if (!plansByConfig[key]) {
        plansByConfig[key] = plan;
      }
    });

    return solarKits.map(kit => {
      const key = `${kit.category || ''}|${kit.subCategory || ''}|${kit.projectType || ''}|${kit.subProjectType || ''}`;
      return {
        ...kit,
        plan: plansByConfig[key] || null
      };
    });
  }, [solarKits, amcPlans, selectedCountries, selectedStates, selectedClusters, selectedDistricts]);

  // Helper to generate a short summary for the row
  const getAmcSummary = (plan) => {
    if (!plan) return '-';
    
    const visits = plan.monthlyVisits > 0 
      ? `${plan.monthlyVisits} visit/month` 
      : (plan.annualVisits ? `${plan.annualVisits} visits/year` : '-');
      
    const serviceNames = plan.services?.map(s => s.serviceName).slice(0, 2).join(', ');
    const moreServices = plan.services?.length > 2 ? '...' : '';
    
    return `${plan.paymentType}, ${plan.amcDuration}M, ${visits} | ${serviceNames}${moreServices}`;
  };

  // Live Counts Calculation
  const locationCounts = useMemo(() => {
    const counts = {
      countries: {},
      states: {},
      clusters: {},
      districts: {}
    };

    amcPlans.forEach(plan => {
      const countryId = plan.state?.country?._id || plan.state?.country;
      const stateId = plan.state?._id || plan.state;
      const clusterId = plan.cluster?._id || plan.cluster;
      const districtId = plan.district?._id || plan.district;

      if (countryId) counts.countries[countryId] = (counts.countries[countryId] || 0) + 1;
      if (stateId) counts.states[stateId] = (counts.states[stateId] || 0) + 1;
      if (clusterId) counts.clusters[clusterId] = (counts.clusters[clusterId] || 0) + 1;
      if (districtId) counts.districts[districtId] = (counts.districts[districtId] || 0) + 1;
    });

    return counts;
  }, [amcPlans]);

  // Available services
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Auto-fill AMC Service Charges from selected services
  useEffect(() => {
    const total = availableServices
      .filter(s => selectedServices.includes(s._id))
      .reduce((sum, s) => sum + (s.basePrice || 0), 0);
    
    setPlanForm(prev => ({
      ...prev,
      amcServiceCharges: total
    }));
  }, [selectedServices, availableServices]);

  // Form states for configuration
  const [planForm, setPlanForm] = useState({
    planName: 'Basic Plan',
    category: 'Solar Rooftop',
    subCategory: 'Residential',
    projectType: '3-5 kW',
    subProjectType: 'On-Grid',
    monthlyCharge: 0,
    yearlyCharge: 0,
    paymentType: 'Monthly',
    amcDuration: 12,
    monthlyVisits: 1,
    annualVisits: 4,
    basicPricePerKw: 0,
    amcServiceCharges: 0,
    includeOncePowerGuarantee: false,
    annual_generation_per_kw_units: 0,
    description: 'Standard residential AMC plan'
  });

  // Fetch initial data
  useEffect(() => {
    fetchCountries();
    fetchServices();
    fetchSolarKits();
    fetchAllPlans();
    fetchAllMasters();
  }, []);

  const fetchAllMasters = async () => {
    try {
      const [cats, subCats, projs, subProjs, mappings] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getProjectTypes(),
        getSubProjectTypes(),
        getProjectCategoryMappings()
      ]);
      setMasterCategories(cats || []);
      setMasterSubCategories(subCats || []);
      setMasterProjectTypes(projs || []);
      setMasterSubProjectTypes(subProjs || []);
      setProjectMappings(mappings || []);
    } catch (error) {
      console.error("Error fetching project settings masters", error);
    }
  };

  // When countries load, auto-select India if available
  useEffect(() => {
    if (countries.length > 0 && selectedCountries.size === 0) {
      const india = countries.find(c => c.name === 'India');
      if (india) {
        handleToggleCountry(india._id);
      }
    }
  }, [countries]);

  // Hierarchical Data Fetching (AGGREGATE)
  useEffect(() => {
    const loadStates = async () => {
      if (selectedCountries.size === 0) {
        setAvailableStates([]);
        return;
      }
      setStatesLoading(true);
      try {
        const results = await Promise.all(
          Array.from(selectedCountries).map(id => locationApi.getStates(id))
        );
        setAvailableStates(results.flat());
      } catch (err) {
        console.error("Error fetching aggregate states", err);
      } finally {
        setStatesLoading(false);
      }
    };
    loadStates();
  }, [selectedCountries]);

  useEffect(() => {
    const loadClusters = async () => {
      if (selectedStates.size === 0) {
        setAvailableClusters([]);
        return;
      }
      setClustersLoading(true);
      try {
        const results = await Promise.all(
          Array.from(selectedStates).map(id => locationApi.getClustersHierarchy(id))
        );
        setAvailableClusters(results.flat());
      } catch (err) {
        console.error("Error fetching aggregate clusters", err);
      } finally {
        setClustersLoading(false);
      }
    };
    loadClusters();
  }, [selectedStates]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedClusters.size === 0) {
        setAvailableDistricts([]);
        return;
      }
      setDistrictsLoading(true);
      try {
        const results = await Promise.all(
          Array.from(selectedClusters).map(id => locationApi.getDistrictsHierarchy(id))
        );
        setAvailableDistricts(results.flat());
      } catch (err) {
        console.error("Error fetching aggregate districts", err);
      } finally {
        setDistrictsLoading(false);
      }
    };
    loadDistricts();
  }, [selectedClusters]);

  // Handlers
  const handleToggleCountry = (id) => {
    const next = new Set(selectedCountries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCountries(next);
    // Cascade Reset
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
  };

  const handleSelectAllCountries = () => {
    if (selectedCountries.size === countries.length) setSelectedCountries(new Set());
    else setSelectedCountries(new Set(countries.map(c => c._id)));
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
  };

  const handleToggleState = (id) => {
    const next = new Set(selectedStates);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStates(next);
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
  };

  const handleSelectAllStates = () => {
    if (selectedStates.size === availableStates.length) setSelectedStates(new Set());
    else setSelectedStates(new Set(availableStates.map(s => s._id)));
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
  };

  const handleToggleCluster = (id) => {
    const next = new Set(selectedClusters);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClusters(next);
    setSelectedDistricts(new Set());
  };

  const handleSelectAllClusters = () => {
    if (selectedClusters.size === availableClusters.length) setSelectedClusters(new Set());
    else setSelectedClusters(new Set(availableClusters.map(c => c._id)));
    setSelectedDistricts(new Set());
  };

  const handleToggleDistrict = (id) => {
    const next = new Set(selectedDistricts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDistricts(next);
  };

  const handleSelectAllDistricts = () => {
    if (selectedDistricts.size === availableDistricts.length) setSelectedDistricts(new Set());
    else setSelectedDistricts(new Set(availableDistricts.map(d => d._id)));
  };

  const fetchSolarKits = async () => {
    try {
      // Use any country to get unique configurations
      const data = await getSolarKits();

      // Extract unique configurations based on category, subCategory, projectType, subProjectType
      const uniqueConfigs = [];
      const seen = new Set();

      data.forEach(kit => {
        const key = `${kit.category}-${kit.subCategory}-${kit.projectType}-${kit.subProjectType}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueConfigs.push({
            category: kit.category || 'Solar Rooftop',
            subCategory: kit.subCategory || 'Residential',
            projectType: kit.projectType || '3-5 kW',
            subProjectType: kit.subProjectType || 'On-Grid'
          });
        }
      });

      setSolarKits(uniqueConfigs);
    } catch (error) {
      console.error('Error fetching SolarKits:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const data = await getAMCServices();
      setAvailableServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchAllPlans = async () => {
    try {
      setLoading(true);
      // Pass empty state to get all plans
      const data = await getAMCPlans('');
      setAmcPlans(data);
    } catch (error) {
      console.error('Error fetching AMC plans:', error);
      toast.error('Failed to load AMC plans');
    } finally {
      setLoading(false);
    }
  };

  // Derive unique options from solarKits for the dynamic dropdowns
  const uniqueCategories = [...new Set(solarKits.map(k => k.category))].filter(Boolean);
  const uniqueSubCategories = [...new Set(solarKits.map(k => k.subCategory))].filter(Boolean);
  const uniqueProjectTypes = [...new Set(solarKits.map(k => k.projectType))].filter(Boolean);
  const uniqueSubProjectTypes = [...new Set(solarKits.map(k => k.subProjectType))].filter(Boolean);

  // Open configuration modal
  const openConfigureModal = (config) => {
    if (selectedStates.size === 0) {
      toast.error('Please select at least one state');
      return;
    }

    const plan = config?.plan;
    setSelectedConfig(config);

    if (plan) {
      // Editing an existing plan based on a configuration
      setCurrentPlan(plan);
      setSelectedServices(plan.services?.map(s => s._id) || []);
      setPlanForm({
        planName: plan.planName || 'Basic Plan',
        category: plan.category || config.category,
        subCategory: plan.subCategory || config.subCategory,
        projectType: plan.projectType || config.projectType,
        subProjectType: plan.subProjectType || config.subProjectType,
        monthlyCharge: plan.monthlyCharge || 0,
        yearlyCharge: plan.yearlyCharge || 0,
        paymentType: plan.paymentType || 'Monthly',
        amcDuration: Array.isArray(plan.amcDuration) ? (parseInt(plan.amcDuration[0]) || 12) : (plan.amcDuration || 12),
        monthlyVisits: plan.monthlyVisits || (plan.annualVisits ? Math.ceil(plan.annualVisits / 12) : 1),
        annualVisits: plan.annualVisits || 4,
        basicPricePerKw: plan.basicPricePerKw || 0,
        amcServiceCharges: plan.amcServiceCharges || 0,
        includeOncePowerGuarantee: plan.includeOncePowerGuarantee || false,
        annual_generation_per_kw_units: plan.annual_generation_per_kw_units || 0,
        description: plan.description || ''
      });
    } else {
      // Creating a new AMC for these configurations
      setCurrentPlan(null);
      setSelectedServices([]);
      setPlanForm({
        planName: 'Basic Plan',
        category: config.category || 'Solar Rooftop',
        subCategory: config.subCategory || '',
        projectType: config.projectType || '',
        subProjectType: config.subProjectType || 'On-Grid',
        monthlyCharge: 0,
        yearlyCharge: 0,
        paymentType: 'Monthly',
        amcDuration: 12,
        monthlyVisits: 1,
        annualVisits: 4,
        basicPricePerKw: 0,
        amcServiceCharges: 0,
        includeOncePowerGuarantee: false,
        annual_generation_per_kw_units: 0,
        description: 'Standard residential AMC plan'
      });
    }

    setConfigureModalOpen(true);
  };

  // Toggle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Save configuration
  const saveConfiguration = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    try {
      setLoading(true);
      
      // Determine targets
      let targets = [];
      if (selectedDistricts.size > 0) {
        targets = availableDistricts.filter(d => selectedDistricts.has(d._id)).map(d => ({
          stateId: d.state?._id || d.state,
          clusterId: d.cluster?._id || d.cluster,
          districtId: d._id
        }));
      } else if (selectedClusters.size > 0) {
        targets = availableClusters.filter(c => selectedClusters.has(c._id)).map(c => ({
          stateId: c.state?._id || c.state,
          clusterId: c._id,
          districtId: null
        }));
      } else {
        targets = Array.from(selectedStates).map(id => ({
          stateId: id,
          clusterId: null,
          districtId: null
        }));
      }

      const finalServiceIds = [...selectedServices];
      const annualVisitsValue = (parseInt(planForm.monthlyVisits) || 1) * 12;

      if (currentPlan && currentPlan._id) {
        // Updating a specific existing plan
        const payload = {
          ...planForm,
          annualVisits: annualVisitsValue,
          serviceIds: finalServiceIds
        };
        await updateAMCPlan(currentPlan._id, payload);
        toast.success('AMC Plan updated successfully!');
      } else {
        // Creating new plans in bulk for selected locations
        const batchPromises = targets.map(target => {
          const payload = {
            ...target,
            ...planForm,
            annualVisits: annualVisitsValue,
            serviceIds: finalServiceIds
          };
          return createAMCPlan(payload);
        });

        await Promise.all(batchPromises);
        toast.success(`AMC Plans created for ${targets.length} locations!`);
      }

      setConfigureModalOpen(false);
      fetchAllPlans();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  // Delete plan
  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this AMC plan?')) {
      try {
        await deleteAMCPlan(planId);
        toast.success('AMC Plan deleted successfully');
        fetchAllPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        toast.error('Failed to delete plan');
      }
    }
  };

  // View details
  const openViewModal = (plan) => {
    if (!plan) {
      toast.error('Plan not configured for this selection');
      return;
    }

    setViewPlan(plan);
    setViewModalOpen(true);
  };

  // Get state name from ID
  const getStateName = (stateId) => {
    // If state object is passed directly (from populated data)
    if (typeof stateId === 'object' && stateId !== null) {
      return stateId.name;
    }
    // If ID is passed, find in states list
    const state = states.find(s => s._id === stateId);
    return state ? state.name : 'Unknown State';
  };

  const filteredPlans = getFilteredPlans();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50/50 rounded-lg flex items-center justify-center">
            <Cog className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">AMC Management</h1>
            <p className="text-sm text-gray-500 mt-1">Configure Annual Maintenance Contract plans for different states</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {/* Country Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800">Select Country</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              {/* Select All Countries */}
              <button
                onClick={handleSelectAllCountries}
                className={`
                  flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                  ${selectedCountries.size === countries.length && countries.length > 0
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                    : 'border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100'}
                `}
              >
                <div className="text-sm font-bold">
                  {selectedCountries.size === countries.length ? 'Deselect All' : 'Select All'}
                </div>
                <div className="text-[10px] uppercase font-bold opacity-70">Countries</div>
              </button>

              {countries.map((country) => (
                <button
                  key={country._id}
                  onClick={() => handleToggleCountry(country._id)}
                  className={`
                    flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                    ${selectedCountries.has(country._id)
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                  `}
                >
                  <div className="text-sm font-bold text-gray-800">
                    {country.name}
                  </div>
                  {locationCounts.countries[country._id] > 0 && (
                    <div className="mt-1">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                        {locationCounts.countries[country._id]} Plans
                      </span>
                    </div>
                  )}
                  {selectedCountries.has(country._id) && (
                    <div className="absolute top-2 right-2">
                       <CheckSquare size={14} className="text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Selection */}
        {selectedCountries.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select State</h2>
              {selectedStates.size > 0 && (
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedStates.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {/* Select All States */}
                <button
                  onClick={handleSelectAllStates}
                  className={`
                    flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                    ${selectedStates.size === availableStates.length && availableStates.length > 0
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                      : 'border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100'}
                  `}
                >
                  <div className="text-sm font-bold">
                    {selectedStates.size === availableStates.length ? 'Deselect All' : 'Select All'}
                  </div>
                </button>

                {statesLoading && availableStates.length === 0 ? (
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="w-48 h-20 bg-slate-100 animate-pulse rounded-xl"></div>)}
                  </div>
                ) : availableStates.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4">No states found.</p>
                ) : (
                  availableStates.map((state) => (
                    <button
                      key={state._id}
                      onClick={() => handleToggleState(state._id)}
                      className={`
                        flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                        ${selectedStates.has(state._id)
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}
                      `}
                    >
                      <div className="text-sm font-bold text-gray-800">{state.name}</div>
                      {locationCounts.states[state._id] > 0 && (
                        <div className="mt-1">
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            {locationCounts.states[state._id]} Plans
                          </span>
                        </div>
                      )}
                      {selectedStates.has(state._id) && (
                        <div className="absolute top-2 right-2">
                          <CheckSquare size={14} className="text-blue-500" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {selectedStates.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select Cluster</h2>
              {selectedClusters.size > 0 && (
                <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                  {selectedClusters.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {/* Select All Clusters */}
                <button
                  onClick={handleSelectAllClusters}
                  className={`
                    flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                    ${selectedClusters.size === availableClusters.length && availableClusters.length > 0
                      ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                      : 'border-purple-200 bg-purple-50/50 text-purple-600 hover:bg-purple-100'}
                  `}
                >
                  <div className="text-sm font-bold">
                    {selectedClusters.size === availableClusters.length ? 'Deselect All' : 'Select All'}
                  </div>
                </button>

                {clustersLoading && availableClusters.length === 0 ? (
                   <div className="flex gap-4">
                    {[1, 2].map(i => <div key={i} className="w-48 h-20 bg-slate-100 animate-pulse rounded-xl"></div>)}
                  </div>
                ) : availableClusters.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4">No clusters found.</p>
                ) : (
                  availableClusters.map((cluster) => (
                    <button
                      key={cluster._id}
                      onClick={() => handleToggleCluster(cluster._id)}
                      className={`
                        flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                        ${selectedClusters.has(cluster._id)
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'}
                      `}
                    >
                      <div className="text-sm font-bold text-gray-800">{cluster.name}</div>
                      {locationCounts.clusters[cluster._id] > 0 && (
                        <div className="mt-1">
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                            {locationCounts.clusters[cluster._id]} Plans
                          </span>
                        </div>
                      )}
                      {selectedClusters.has(cluster._id) && (
                        <div className="absolute top-2 right-2">
                          <CheckSquare size={14} className="text-purple-500" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* District Selection */}
        {selectedClusters.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select District</h2>
              {selectedDistricts.size > 0 && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {selectedDistricts.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {/* Select All Districts */}
                <button
                  onClick={handleSelectAllDistricts}
                  className={`
                    flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                    ${selectedDistricts.size === availableDistricts.length && availableDistricts.length > 0
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100'}
                  `}
                >
                  <div className="text-sm font-bold">
                    {selectedDistricts.size === availableDistricts.length ? 'Deselect All' : 'Select All'}
                  </div>
                </button>

                {districtsLoading && availableDistricts.length === 0 ? (
                   <div className="flex gap-4">
                    {[1, 2].map(i => <div key={i} className="w-48 h-20 bg-slate-100 animate-pulse rounded-xl"></div>)}
                  </div>
                ) : availableDistricts.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4">No districts found.</p>
                ) : (
                  availableDistricts.map((district) => (
                    <button
                      key={district._id}
                      onClick={() => handleToggleDistrict(district._id)}
                      className={`
                        flex-shrink-0 w-48 p-4 rounded-xl border-2 transition-all duration-300 text-center relative
                        ${selectedDistricts.has(district._id)
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm'}
                      `}
                    >
                      <div className="text-sm font-bold text-gray-800">{district.name}</div>
                      {locationCounts.districts[district._id] > 0 && (
                        <div className="mt-1">
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {locationCounts.districts[district._id]} Plans
                          </span>
                        </div>
                      )}
                      {selectedDistricts.has(district._id) && (
                        <div className="absolute top-2 right-2">
                          <CheckSquare size={14} className="text-emerald-500" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Header when active */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-[6px] border-blue-600">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {selectedStates.size > 0 ? (
                <>
                  AMC Plans for <span className="text-blue-600">
                    {selectedStates.size === 1 
                      ? (availableStates.find(s => selectedStates.has(s._id))?.name || 'Selected State')
                      : `${selectedStates.size} States`
                    }
                  </span>
                </>
              ) : (
                "All AMC Plans"
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedStates.size > 0 
                ? `Configure and manage AMC plans for the selected ${selectedStates.size > 1 ? 'states' : 'state'}`
                : "Showing all available AMC plans in the system"
              }
            </p>
          </div>
          <button
            onClick={() => openConfigureModal(null)}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-200"
          >
            <PlusCircle size={18} />
            Create AMC Plan
          </button>
        </div>

        {/* AMC Configuration Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">
              AMC Configuration
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center">
                <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={32} />
                <p className="text-slate-500 text-xs font-medium tracking-wide italic">Fetching AMC plans...</p>
              </div>
            ) : displayConfigurations.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Package size={32} className="text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-bold mb-1">No Configurations Available</h4>
                <p className="text-slate-500 text-xs">Ensure Solar Kits are defined in the inventory.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Project Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AMC Summary</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Configuration</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">View</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayConfigurations.map((config, index) => {
                    const isConfigured = !!config.plan;
                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-700">{config.category}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-700">{config.subCategory}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-700">{config.projectType}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-600">{config.subProjectType}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-slate-500 leading-relaxed italic">
                            {getAmcSummary(config.plan)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            isConfigured 
                            ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {isConfigured ? 'Configured' : 'Not Configured'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => openConfigureModal(config)}
                              className={`px-5 py-2 text-white text-xs font-bold rounded flex items-center gap-2 transition-all shadow-sm ${
                                isConfigured 
                                ? 'bg-amber-500 hover:bg-amber-600' 
                                : 'bg-[#17a2b8] hover:bg-[#138496]'
                              }`}
                            >
                              {isConfigured ? <Edit2 size={14} /> : <Settings size={14} />}
                              {isConfigured ? 'Edit' : 'Configure'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => openViewModal(config.plan)}
                              className={`px-5 py-2 text-white text-xs font-bold rounded flex items-center gap-2 transition-all shadow-sm ${
                                isConfigured 
                                ? 'bg-[#6c757d] hover:bg-[#5a6268]' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              disabled={!isConfigured}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => isConfigured && handleDeletePlan(config.plan._id)}
                              className={`p-2 rounded-lg transition-all ${
                                isConfigured 
                                ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-slate-50 text-slate-200 cursor-not-allowed'
                              }`}
                              title={isConfigured ? "Delete Plan" : "No Plan to Delete"}
                              disabled={!isConfigured}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Copyright Footer Replicating Image 1 */}
        <div className="mt-auto py-8 text-center border-t border-slate-100 bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
          <p className="text-sm font-bold text-slate-600">
            Copyright &copy; 2025 Solarkits. All Rights Reserved.
          </p>
        </div>

        {/* Break Time Button Replicating Image 1 */}
        <div className="fixed bottom-6 right-8 z-[100]">
          <button className="flex items-center gap-2 bg-[#0c2340] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-xl hover:scale-105 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Break Time
          </button>
        </div>
      </div>

      {/* Premium Configure Modal */}
      {configureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-4xl shadow-2xl rounded-2xl bg-white overflow-hidden border border-slate-200">
            <div className="bg-[#0c2340] text-white p-6 relative flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">Configuration Wizard</div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Cog className="text-cyan-400" size={20} />
                  Bulk Configure AMC ({selectedDistricts.size || selectedClusters.size || selectedStates.size} Locations)
                </h3>
              </div>
              <button
                onClick={() => setConfigureModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-all text-slate-300 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-0 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <div className="space-y-10">
                  {/* Plan Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-[3px] border-cyan-500 pl-3 leading-none h-4">
                        PLAN IDENTITY
                      </h4>
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">CATEGORY</label>
                            <div className="relative">
                              <select
                                value={planForm.category}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPlanForm({ ...planForm, category: val, subCategory: '' });
                                }}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:border-slate-200"
                              >
                                <option value="">Select Category</option>
                                {planForm.category && !masterCategories.some(c => c.name === planForm.category) && (
                                  <option value={planForm.category}>{planForm.category}</option>
                                )}
                                {masterCategories.map((cat, i) => (
                                  <option key={i} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6L0 0H10L5 6Z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">SUB CATEGORY</label>
                            <div className="relative">
                              <select
                                value={planForm.subCategory}
                                onChange={(e) => setPlanForm({ ...planForm, subCategory: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:border-slate-200"
                                disabled={!planForm.category}
                              >
                                <option value="">Select Sub Category</option>
                                {planForm.subCategory && !masterSubCategories.some(s => s.name === planForm.subCategory) && (
                                  <option value={planForm.subCategory}>{planForm.subCategory}</option>
                                )}
                                {masterSubCategories
                                  .filter(sub => {
                                    const selectedCat = masterCategories.find(c => c.name === planForm.category);
                                    if (!selectedCat) return true;
                                    const subCatId = sub.categoryId?._id || sub.categoryId;
                                    return subCatId === selectedCat._id;
                                  })
                                  .map((sub, i) => (
                                    <option key={i} value={sub.name}>{sub.name}</option>
                                  ))
                                }
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6L0 0H10L5 6Z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">PROJECT TYPE</label>
                            <div className="relative">
                              <select
                                value={planForm.projectType}
                                onChange={(e) => setPlanForm({ ...planForm, projectType: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:border-slate-200"
                              >
                                <option value="">Select Project Type</option>
                                {planForm.projectType && (
                                  <option value={planForm.projectType}>{planForm.projectType}</option>
                                )}
                                {Array.from(new Set(projectMappings.map(m => `${m.projectTypeFrom}kW - ${m.projectTypeTo}kW`)))
                                  .map((range, i) => (
                                    <option key={i} value={range}>{range}</option>
                                  ))
                                }
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6L0 0H10L5 6Z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">SUB PROJECT TYPE</label>
                            <div className="relative">
                              <select
                                value={planForm.subProjectType}
                                onChange={(e) => setPlanForm({ ...planForm, subProjectType: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:border-slate-200"
                              >
                                <option value="">Select Sub Project Type</option>
                                {planForm.subProjectType && !masterSubProjectTypes.some(s => s.name === planForm.subProjectType) && (
                                  <option value={planForm.subProjectType}>{planForm.subProjectType}</option>
                                )}
                                {masterSubProjectTypes.map((spt, i) => (
                                  <option key={i} value={spt.name}>{spt.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6L0 0H10L5 6Z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">PLAN NAME</label>
                          <input
                            type="text"
                            value={planForm.planName}
                            onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                            className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all hover:border-slate-200"
                            placeholder="Basic Plan"
                          />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">BASIC PRICE PER KW (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={planForm.basicPricePerKw}
                              onChange={(e) => setPlanForm({ ...planForm, basicPricePerKw: Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all hover:border-slate-200"
                              placeholder="0"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">AMC SERVICE CHARGES (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={planForm.amcServiceCharges}
                              onChange={(e) => setPlanForm({ ...planForm, amcServiceCharges: Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 transition-all hover:border-slate-200"
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>

                        {/* Example Calculation Box */}
                        <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 mb-2 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                              <Info size={18} />
                            </div>
                            <div>
                              <h5 className="text-[12px] font-bold text-slate-700">Example Calculation</h5>
                              <p className="text-[10px] text-slate-500 font-medium tracking-tight">How the total AMC price is calculated</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            {/* Basic Price per KW Section */}
                            <div className="space-y-2">
                              <h6 className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                                Basic Price per KW
                              </h6>
                              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                                <ul className="text-[10px] text-slate-500 space-y-1 ml-3">
                                  <li className="list-disc">This is a <span className="font-bold text-slate-700">one-time AMC base price</span> calculated per kilowatt (kW) of the system.</li>
                                  <li className="list-disc">The system capacity (kW) is multiplied by this base price.</li>
                                  <li className="list-disc">This charge is applied <span className="font-bold text-slate-700">once for the entire AMC plan duration</span>.</li>
                                </ul>
                                <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 italic">Example: Basic Price (₹{planForm.basicPricePerKw || 1000}) × 3 kW =</span>
                                  <span className="text-[11px] font-bold text-slate-700">₹{(planForm.basicPricePerKw || 1000) * 3}</span>
                                </div>
                              </div>
                            </div>

                            {/* AMC Service Charges Section */}
                            <div className="space-y-2">
                              <h6 className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                                AMC Service Charges
                              </h6>
                              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                                <ul className="text-[10px] text-slate-500 space-y-1 ml-3">
                                  <li className="list-disc">These are <span className="font-bold text-slate-700">service visit charges</span> applied per visit.</li>
                                  <li className="list-disc">Charges apply <span className="font-bold text-slate-700">per visit</span> depending on scheduled maintenance visits.</li>
                                  <li className="list-disc">Each visit adds an additional service cost.</li>
                                </ul>

                                {selectedServices.length > 0 ? (
                                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                                    <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tight">Included Services:</p>
                                    {availableServices.filter(s => selectedServices.includes(s._id)).map(s => (
                                      <div key={s._id} className="flex justify-between text-[10px] font-bold text-slate-600">
                                        <span>• {s.serviceName}</span>
                                        <span>₹{s.basePrice || 0} / per visit</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                   <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                                      <p className="text-[10px] text-slate-400 italic font-medium">No services selected</p>
                                   </div>
                                )}

                                <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center">
                                  <span className="text-[10px] font-bold text-slate-400 italic">Example: Service Charge (₹{planForm.amcServiceCharges || 500} / per visit)</span>
                                </div>
                              </div>
                            </div>

                            </div>
                          </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">PLAN DESCRIPTION</label>
                          <textarea
                            value={planForm.description}
                            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                            className="w-full bg-white border-2 border-cyan-400 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-50 transition-all min-h-[100px]"
                            placeholder="Standard residential AMC plan"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-[3px] border-emerald-500 pl-3 leading-none h-4">
                        PRICING & SCHEDULE
                      </h4>
                      <div className="grid grid-cols-2 gap-5">
                        {/* Payment Type Selection */}
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">PAYMENT TYPE</label>
                          <div className="relative">
                            <select
                              value={planForm.paymentType}
                              onChange={(e) => setPlanForm({ ...planForm, paymentType: e.target.value })}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:border-slate-200"
                            >
                              <option value="Monthly">Monthly</option>
                              <option value="Annually">Annually</option>
                              <option value="Both">Both</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 6L0 0H10L5 6Z"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Duration of AMC Input */}
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">DURATION OF AMC (MONTHS)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={planForm.amcDuration}
                              onChange={(e) => setPlanForm({ ...planForm, amcDuration: Math.max(1, parseInt(e.target.value) || 0) })}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all hover:border-slate-200"
                              placeholder="12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                              Months
                            </div>
                          </div>
                        </div>

                        {/* Monthly Visits Input */}
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">MONTHLY VISITS (NOS)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={planForm.monthlyVisits}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 1;
                                if (val > 30) val = 30;
                                if (val < 1) val = 1;
                                setPlanForm({ ...planForm, monthlyVisits: val });
                              }}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all hover:border-slate-200"
                              placeholder="1-30"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                              Max 30
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 pb-4">
                      <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-[3px] border-blue-500 pl-3 leading-none h-4">
                        INCLUDED SERVICES
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        {availableServices.map((service) => {
                          const isSelected = selectedServices.includes(service._id);
                          return (
                            <button
                              key={service._id}
                              type="button"
                              onClick={() => toggleService(service._id)}
                              className={`
                                relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
                                ${isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                  : 'border-slate-100 bg-white hover:border-slate-200'}
                              `}
                            >
                              <div className="flex flex-col text-left">
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                  {service.serviceName}
                                </span>
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-400' : 'text-slate-400'} uppercase tracking-wider`}>
                                  Base Price: ₹{service.basePrice || 0}
                                </span>
                              </div>
                              {isSelected ? (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckSquare size={12} className="text-white" strokeWidth={4} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-slate-200 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 pb-4">
                      <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-l-[3px] border-blue-500 pl-3 leading-none h-4">
                        POWER GENERATION GUARANTEE (OPTIONAL)
                      </h4>
                      
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                          <input
                            type="checkbox"
                            checked={planForm.includeOncePowerGuarantee}
                            onChange={(e) => setPlanForm({ ...planForm, includeOncePowerGuarantee: e.target.checked })}
                            className="hidden"
                          />
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${planForm.includeOncePowerGuarantee ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200' : 'border-slate-300 bg-white'}`}>
                            {planForm.includeOncePowerGuarantee && <CheckSquare className="text-white w-4 h-4" strokeWidth={4} />}
                          </div>
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Include Once Power Generation Guarantee</span>
                        </label>

                        {planForm.includeOncePowerGuarantee && (
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Annual Generate Per kW Units</label>
                            <input
                              type="number"
                              min="0"
                              value={planForm.annual_generation_per_kw_units}
                              onChange={(e) => setPlanForm({ ...planForm, annual_generation_per_kw_units: Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all hover:border-blue-200 shadow-sm shadow-blue-50"
                              placeholder="Enter units"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="border-t border-slate-100 bg-white p-6 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-medium tracking-wide">
                      Bulk Creation targeting {selectedDistricts.size || selectedClusters.size || selectedStates.size} areas.
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setConfigureModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-8 py-3 bg-[#8b919a] hover:bg-[#727882] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                      onClick={saveConfiguration}
                      disabled={loading || selectedServices.length === 0}
                    >
                      {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium View Modal */}
      {viewModalOpen && viewPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-3xl shadow-xl rounded-xl bg-white overflow-hidden border border-gray-100 p-8 pb-4">
            
            {/* Header Content */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{viewPlan.planName}</h2>
              <p className="text-[#3b82f6] text-sm mt-0.5">{viewPlan.description || 'Standard residential AMC plan'}</p>
            </div>
            
            {/* Thin blue separator matching screenshot perfectly */}
            <div className="w-full h-[2px] bg-[#3b82f6] mt-4 mb-6"></div>

            <div className="space-y-6">
              {/* Plan Details */}
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-3">Plan Details</h4>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Category</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Sub Category</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.subCategory}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Project Type</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.projectType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Sub Project Type</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.subProjectType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Basic Price per kW</div>
                    <div className="text-[13px] font-bold text-gray-800">₹{viewPlan.basicPricePerKw || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Service Charges</div>
                    <div className="text-[13px] font-bold text-gray-800">₹{viewPlan.amcServiceCharges || 0}</div>
                  </div>
                </div>
              </div>

              {/* Power Generation Guarantee */}
              {viewPlan.includeOncePowerGuarantee && (
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 mb-3">Power Generation Guarantee</h4>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <CheckSquare size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Annual Generation Per kW</div>
                        <div className="text-[14px] font-black text-blue-800">{viewPlan.annual_generation_per_kw_units || 0} Units</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-3">Pricing & Payment</h4>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Payment Type</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.paymentType || 'Monthly'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Duration</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.amcDuration ? `${viewPlan.amcDuration} Months` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">Included Services</h4>
                <div className="flex flex-wrap gap-2">
                  {viewPlan.services && viewPlan.services.map((service, idx) => (
                    <span key={idx} className="bg-gray-100/80 text-gray-600 text-xs px-3 py-1 rounded-full whitespace-nowrap">
                      {service.serviceName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visits and State */}
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-3">Visits & Location</h4>
                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-1">
                    <div className="text-xs text-gray-400 mb-1">Monthly Visits</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.monthlyVisits || 1} Nos</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-400 mb-1">Annual Visits</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.annualVisits} visits</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-400 mb-1">State</div>
                    <div className="text-[13px] font-bold text-gray-800">{viewPlan.state?.name || 'Local State'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white text-sm font-medium rounded-md transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAmc;