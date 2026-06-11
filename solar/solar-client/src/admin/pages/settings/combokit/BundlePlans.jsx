import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Building, Users, Package, Filter,
  Plus, Edit, Trash2, Eye, Check, X, CheckSquare,
  ChevronDown, ChevronUp, Search, Settings,
  Loader
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  getBundlePlans,
  createBundlePlan,
  updateBundlePlan,
  deleteBundlePlan,
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProjectCategoryMappings
} from '../../../../services/combokit/combokitApi';
import {
  getBrands,
  getSkus
} from '../../../../services/settings/orderProcurementSettingApi';
import { locationAPI } from '../../../../api/api';
import toast from 'react-hot-toast';



const BundlePlans = () => {
  const { countries, states, fetchCountries, fetchStates, fetchClusters, fetchDistricts, fetchCities, loading: locationLoading } = useLocations();

  // Selections
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedDistricts, setSelectedDistricts] = useState(new Set());
  const [selectedCities, setSelectedCities] = useState(new Set());


  // Dynamic Options
  const [availableStates, setAvailableStates] = useState([]);
  const [clusterOptions, setClusterOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  // Data
  const [bundlePlans, setBundlePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState({});

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [currentPlan, setCurrentPlan] = useState(null);

  // Master Data
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [availablePanelBrands, setAvailablePanelBrands] = useState([]);
  const [isWattageLoading, setIsWattageLoading] = useState(false);

  // Plan Form
  const [planForm, setPlanForm] = useState({
    bundleName: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    panelBrands: [],
    technologyType: [],
    wattage: [],
    kw: '',
    cashback: '',
    timeDuration: []
  });

  const [availableWattages, setAvailableWattages] = useState(['330W', '440W', '450W', '535W', '540W', '550W']);

  // Custom CSS for refined scrollbars and UI
  const scrollbarStyles = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .selection-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .selection-card:hover {
      transform: translateY(-2px);
    }
  `;

  // Initial Data
  useEffect(() => {
    fetchCountries();
    loadBundlePlans();
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

      // Fetch dynamic brands
      const brandsRes = await getBrands();
      // Handle both array and { data: [] } formats
      const brandsData = Array.isArray(brandsRes) ? brandsRes : (brandsRes?.data || []);

      // Filter for Product = PANEL and Combo Kit = Enabled (true)
      const filteredPanelBrands = brandsData
        .filter(m =>
          (m.product?.toUpperCase() === 'PANEL' || (m.brand || '').toLowerCase().includes('panel')) &&
          m.comboKit === true &&
          m.isActive !== false
        );

      setAvailablePanelBrands(filteredPanelBrands);
    } catch (error) {
      console.error("Error fetching project settings masters", error);
    }
  };

  // Set default country if available
  useEffect(() => {
    if (countries.length > 0 && selectedCountries.size === 0) {
      const india = countries.find(c => c.name === 'India');
      if (india) setSelectedCountries(new Set([india._id]));
      else setSelectedCountries(new Set([countries[0]._id]));
    }
  }, [countries]);

  // Fetch States when Countries Selected
  useEffect(() => {
    const loadStates = async () => {
      if (selectedCountries.size === 0) {
        setAvailableStates([]);
        return;
      }
      try {
        const uniqueStates = new Map();
        for (const countryId of selectedCountries) {
          // Use 'countryId' as expected by the backend
          const res = await locationAPI.getAllStates({ countryId: countryId, isActive: 'true' });
          if (res.data && res.data.data) {
            res.data.data.forEach(s => {
              // Frontend verification
              const sCountryId = s.country?._id || s.country;
              if (!sCountryId || sCountryId === countryId) {
                uniqueStates.set(s._id, s);
              }
            });
          }
        }
        setAvailableStates(Array.from(uniqueStates.values()));
      } catch (err) {
        console.error("Error loading states", err);
      }
    };
    loadStates();
  }, [selectedCountries]);

  // Use 'states' from hook as options

  // Fetch Clusters when States change
  useEffect(() => {
    const fetchClustersForStates = async () => {
      if (selectedStates.size === 0) {
        setClusterOptions([]);
        return;
      }
      try {
        const uniqueClustersMap = new Map();
        const promises = Array.from(selectedStates).map(stateId =>
          locationAPI.getAllClusters({ stateId: stateId, isActive: 'true' })
        );
        const responses = await Promise.all(promises);
        responses.forEach((res, index) => {
          const stateId = Array.from(selectedStates)[index];
          if (res.data && res.data.data) {
            res.data.data.forEach(item => {
              // Frontend verification
              const sStateId = item.state?._id || item.state;
              if (!sStateId || sStateId === stateId) {
                uniqueClustersMap.set(item._id, item);
              }
            });
          }
        });
        setClusterOptions(Array.from(uniqueClustersMap.values()));
      } catch (error) {
        console.error("Error fetching clusters", error);
      }
    };
    fetchClustersForStates();
  }, [selectedStates]);

  // Fetch Districts when Clusters change
  useEffect(() => {
    const fetchDistrictsForClusters = async () => {
      if (selectedClusters.size === 0) {
        setDistrictOptions([]);
        return;
      }
      try {
        const uniqueDistrictsMap = new Map();
        const promises = Array.from(selectedClusters).map(clusterId =>
          locationAPI.getAllDistricts({ clusterId: clusterId, isActive: 'true' })
        );
        const responses = await Promise.all(promises);
        responses.forEach((res, index) => {
          const clusterId = Array.from(selectedClusters)[index];
          if (res.data && res.data.data) {
            res.data.data.forEach(item => {
              // Frontend verification
              const cId = item.cluster?._id || item.cluster;
              if (!cId || cId === clusterId) {
                uniqueDistrictsMap.set(item._id, item);
              }
            });
          }
        });
        setDistrictOptions(Array.from(uniqueDistrictsMap.values()));
      } catch (error) {
        console.error("Error fetching districts", error);
      }
    };
    fetchDistrictsForClusters();
  }, [selectedClusters]);

  // Fetch Cities when Districts change
  useEffect(() => {
    const fetchCitiesForDistricts = async () => {
      if (selectedDistricts.size === 0) {
        setCityOptions([]);
        return;
      }
      try {
        const uniqueCitiesMap = new Map();
        const promises = Array.from(selectedDistricts).map(districtId =>
          locationAPI.getAllCities({ districtId: districtId, isActive: 'true' })
        );
        const responses = await Promise.all(promises);
        responses.forEach((res, index) => {
          const districtId = Array.from(selectedDistricts)[index];
          if (res.data && res.data.data) {
            res.data.data.forEach(item => {
              // Frontend verification
              const dId = item.district?._id || item.district;
              if (!dId || dId === districtId) {
                uniqueCitiesMap.set(item._id, item);
              }
            });
          }
        });
        setCityOptions(Array.from(uniqueCitiesMap.values()));
      } catch (error) {
        console.error("Error fetching cities", error);
      }
    };
    fetchCitiesForDistricts();
  }, [selectedDistricts]);

  // Load Bundle Plans
  const loadBundlePlans = async () => {
    try {
      setLoading(true);
      const data = await getBundlePlans();
      setBundlePlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load bundle plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Wattages dynamically when Panel Brands change
  useEffect(() => {
    const fetchWattagesForBrands = async () => {
      if (planForm.panelBrands.length === 0) {
        setAvailableWattages(['330W', '440W', '450W', '535W', '540W', '550W']);
        return;
      }

      setIsWattageLoading(true);
      try {
        // Fetch SKUs for each selected brand
        const allWattages = new Set();

        // Map names to IDs
        const brandIds = planForm.panelBrands.map(name => {
          const m = availablePanelBrands.find(item =>
            (item.brand || item.companyName || item.name || '').toLowerCase() === name.toLowerCase()
          );
          return m?._id;
        }).filter(Boolean);

        if (brandIds.length === 0) {
          setIsWattageLoading(false);
          return;
        }

        // Use Promise.all to fetch in parallel
        const responses = await Promise.all(
          brandIds.map(brandId =>
            getSkus({ brand: brandId })
          )
        );

        responses.forEach(res => {
          // Handle both direct array or { data: [] } response
          const skus = Array.isArray(res) ? res : (res?.data || []);

          skus.forEach(sku => {
            // Check both wattage and capacity fields
            const wattageVal = sku.wattage || (sku.capacity ? parseFloat(sku.capacity) : null);

            if (wattageVal) {
              const w = wattageVal.toString().toUpperCase().endsWith('W')
                ? wattageVal.toString().toUpperCase()
                : `${wattageVal}W`;
              allWattages.add(w);
            } else if (sku.capacity && typeof sku.capacity === 'string') {
              // Extract numerical part if it's like "225 kW"
              const match = sku.capacity.match(/(\d+(\.\d+)?)/);
              if (match) {
                const w = `${match[1]}W`;
                allWattages.add(w);
              }
            }
          });
        });

        // Combine with currently selected wattages to avoid losing them
        planForm.wattage.forEach(w => allWattages.add(w));

        if (allWattages.size > 0) {
          setAvailableWattages(Array.from(allWattages).sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
          }));
        } else {
          setAvailableWattages([]);
        }
      } catch (error) {
        console.error("Error fetching wattages:", error);
        toast.error("Failed to fetch dynamic wattages");
      } finally {
        setIsWattageLoading(false);
      }
    };

    fetchWattagesForBrands();
  }, [planForm.panelBrands]);

  // Filtered Plans Logic
  const filteredPlans = useMemo(() => {
    if (selectedCountries.size === 0 && selectedStates.size === 0 && selectedClusters.size === 0 && selectedDistricts.size === 0 && selectedCities.size === 0) {
      return bundlePlans;
    }

    return bundlePlans.filter(plan => {
      const pCountry = plan.country?._id || plan.country || plan.Country?._id || plan.Country;
      const pState = plan.state?._id || plan.state || plan.State?._id || plan.State;
      const pClusters = (plan.clusters || []).map(c => c._id || c);
      const pDistricts = (plan.districts || []).map(d => d._id || d);
      const pCities = (plan.cities || []).map(c => c._id || c);

      const matchCountry = selectedCountries.size === 0 || selectedCountries.has(pCountry);
      const matchState = selectedStates.size === 0 || selectedStates.has(pState);

      const matchCluster = selectedClusters.size === 0 || (pClusters.length > 0 ? pClusters.some(id => selectedClusters.has(id)) : true);
      const matchDistrict = selectedDistricts.size === 0 || (pDistricts.length > 0 ? pDistricts.some(id => selectedDistricts.has(id)) : true);
      const matchCity = selectedCities.size === 0 || (pCities.length > 0 ? pCities.some(id => selectedCities.has(id)) : true);

      return matchCountry && matchState && matchCluster && matchDistrict && matchCity;
    });
  }, [bundlePlans, selectedCountries, selectedStates, selectedClusters, selectedDistricts, selectedCities]);

  // Save Bundle (Modal Version)
  const saveBundle = async () => {
    if (!planForm.bundleName || selectedStates.size === 0) {
      toast.error('Bundle name and at least one state/locations are required');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...planForm,
        Country: Array.from(selectedCountries)[0],
        country: Array.from(selectedCountries)[0],
        state: Array.from(selectedStates)[0],
        clusters: Array.from(selectedClusters),
        districts: Array.from(selectedDistricts),
        cities: Array.from(selectedCities)
      };

      if (currentPlan) {
        await updateBundlePlan(currentPlan._id, payload);
        toast.success('Bundle plan updated successfully');
      } else {
        await createBundlePlan(payload);
        toast.success('Bundle plan created successfully');
      }
      setShowConfigureModal(false);
      loadBundlePlans();
      // Reset form
      setPlanForm({
        bundleName: '',
        category: '',
        subCategory: '',
        projectType: '',
        subProjectType: '',
        panelBrands: [],
        technologyType: [],
        wattage: [],
        kw: '',
        cashback: '',
        timeDuration: []
      });
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast.error(error.message || 'Failed to save bundle plan');
    } finally {
      setLoading(false);
    }
  };

  const deleteBundle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle plan?')) return;
    try {
      await deleteBundlePlan(id);
      toast.success('Bundle plan removed permanently');
      loadBundlePlans();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to remove bundle');
    }
  };

  // Toggles
  // Hierarchy Management
  const handleToggleCountry = (id) => {
    const newSet = new Set(selectedCountries);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCountries(newSet);
    // Cascade clear
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedCities(new Set());
  };

  const handleSelectAllCountries = () => {
    if (selectedCountries.size === countries.length) setSelectedCountries(new Set());
    else setSelectedCountries(new Set(countries.map(c => c._id)));
    clearAllStates();
  };

  const toggleState = (stateId) => {
    const newSelected = new Set(selectedStates);
    if (newSelected.has(stateId)) {
      newSelected.delete(stateId);
      // Cascade clear: Remove clusters, districts, etc. that belong to this state
      // For simplicity in a multi-select context, we can clear children to force re-selection
      // or filter them out. Clearing is safer for hierarchy integrity.
      setSelectedClusters(new Set());
      setSelectedDistricts(new Set());
      setSelectedCities(new Set());
    } else {
      newSelected.add(stateId);
      // Optional: Auto-select from plan remains here if needed
    }
    setSelectedStates(newSelected);
  };

  const selectAllStates = () => {
    if (selectedStates.size === availableStates.length) setSelectedStates(new Set());
    else setSelectedStates(new Set(availableStates.map(s => s._id)));
  };

  const clearAllStates = () => {
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedCities(new Set());
  };

  const toggleCluster = (id) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      // Cascade clear
      setSelectedDistricts(new Set());
      setSelectedCities(new Set());
    } else {
      newSelected.add(id);
    }
    setSelectedClusters(newSelected);
  };

  const selectAllClusters = () => {
    if (selectedClusters.size === clusterOptions.length) setSelectedClusters(new Set());
    else setSelectedClusters(new Set(clusterOptions.map(c => c._id)));
  };

  const clearAllClusters = () => {
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedCities(new Set());
  };

  const toggleDistrict = (id) => {
    const newSelected = new Set(selectedDistricts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      // Cascade clear
      setSelectedCities(new Set());
    } else {
      newSelected.add(id);
    }
    setSelectedDistricts(newSelected);
  };

  const selectAllDistricts = () => {
    if (selectedDistricts.size === districtOptions.length) setSelectedDistricts(new Set());
    else setSelectedDistricts(new Set(districtOptions.map(d => d._id)));
  };

  const clearAllDistricts = () => {
    setSelectedDistricts(new Set());
    setSelectedCities(new Set());
  };

  const toggleCity = (id) => {
    const newSelected = new Set(selectedCities);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedCities(newSelected);
  };

  const selectAllCities = () => {
    if (selectedCities.size === cityOptions.length) setSelectedCities(new Set());
    else setSelectedCities(new Set(cityOptions.map(c => c._id)));
  };

  const clearAllCities = () => setSelectedCities(new Set());



  const enableEditMode = (plan) => {
    // availableWattages will be updated by the useEffect when planForm is set
    setPlanForm({
      bundleName: plan.bundleName || '',
      category: plan.category || '',
      subCategory: plan.subCategory || '',
      projectType: plan.projectType || '',
      subProjectType: plan.subProjectType || '',
      panelBrands: plan.panelBrands || [],
      technologyType: plan.technologyType || [],
      wattage: plan.wattage || [],
      kw: plan.kw || '',
      cashback: plan.cashback || '',
      timeDuration: plan.timeDuration || []
    });
    setCurrentPlan(plan._id ? plan : null);
    setShowConfigureModal(true);
  };

  const handleAddNew = () => {
    // Start with empty wattages until a brand is selected
    setAvailableWattages([]);
    setPlanForm({
      bundleName: '',
      category: '',
      subCategory: '',
      projectType: '',
      subProjectType: '',
      panelBrands: [],
      technologyType: [],
      wattage: [],
      kw: '',
      cashback: '',
      timeDuration: []
    });
    setCurrentPlan(null);
    setShowConfigureModal(true);
  };



  // Details
  const openDetailsModal = (plan) => {
    setModalContent({
      title: `${plan.bundleName || 'Unnamed'} Bundle Details`,
      clusters: (plan.clusters || []).map(c => typeof c === 'object' ? c.name : 'Unknown'),
      districts: (plan.districts || []).map(d => typeof d === 'object' ? d.name : 'Unknown'),
      cities: (plan.cities || []).map(c => typeof c === 'object' ? c.name : 'Unknown'),
      panelBrands: plan.panelBrands || [],
      technologyType: plan.technologyType || [],
      wattage: plan.wattage || [],
      kw: plan.kw,
      cashback: plan.cashback,
      timeDuration: plan.timeDuration || []
    });
    setShowDetailsModal(true);
  };

  // Helpers for Count Display
  const getSelectedClustersForState = (stateId) => clusterOptions.filter(c => selectedClusters.has(c._id) && c.state?._id === stateId);
  const getSelectedDistrictsForState = (stateId) => {
    const validClusters = getSelectedClustersForState(stateId).map(c => c._id);
    return districtOptions.filter(d => selectedDistricts.has(d._id) && validClusters.includes(typeof d.cluster === 'object' ? d.cluster._id : d.cluster));
  };
  const getSelectedCitiesForState = (stateId) => {
    const validDistricts = getSelectedDistrictsForState(stateId).map(d => d._id);
    return cityOptions.filter(c => selectedCities.has(c._id) && validDistricts.includes(typeof c.district === 'object' ? c.district._id : c.district));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <style>{scrollbarStyles}</style>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 mx-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Package className="text-indigo-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Solarkit Bundle Plans</h1>
            <p className="text-sm text-gray-500 mt-1">Configure and manage solar kit bundles across location hierarchy</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {/* Country Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800">Select Country</h2>
            {selectedCountries.size > 0 && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedCountries.size} Selected
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              <button
                onClick={handleSelectAllCountries}
                className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedCountries.size === countries.length && countries.length > 0
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                    : 'border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100'
                  }`}
              >
                <div className="text-sm font-bold">{selectedCountries.size === countries.length ? 'Deselect All' : 'Select All'}</div>
                <div className="text-[10px] uppercase font-bold opacity-70">Countries</div>
              </button>

              {countries.map((country) => (
                <button
                  key={country._id}
                  onClick={() => handleToggleCountry(country._id)}
                  className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedCountries.has(country._id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 bg-white hover:border-blue-300'
                    }`}
                >
                  <div className="text-sm font-bold text-gray-800">{country.name}</div>
                  {selectedCountries.has(country._id) && (
                    <div className="absolute top-2 right-2"><CheckSquare size={14} className="text-blue-500" /></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Selection */}
        {selectedCountries.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select State</h2>
              {selectedStates.size > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {selectedStates.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button
                  onClick={selectAllStates}
                  className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedStates.size === availableStates.length && availableStates.length > 0
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                      : 'border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                >
                  <div className="text-sm font-bold">{selectedStates.size === availableStates.length ? 'Deselect All' : 'Select All'}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70">States</div>
                </button>

                {availableStates.map((state) => (
                  <button
                    key={state._id}
                    onClick={() => toggleState(state._id)}
                    className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedStates.has(state._id) ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 bg-white hover:border-indigo-300'
                      }`}
                  >
                    <div className="text-sm font-bold text-gray-800">{state.name}</div>
                    {bundlePlans[state._id] && (
                      <div className="mt-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">Configured</div>
                    )}
                    {selectedStates.has(state._id) && (
                      <div className="absolute top-2 right-2"><CheckSquare size={14} className="text-indigo-500" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {selectedStates.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select Cluster</h2>
              {selectedClusters.size > 0 && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  {selectedClusters.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button
                  onClick={selectAllClusters}
                  className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedClusters.size === clusterOptions.length && clusterOptions.length > 0
                      ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                      : 'border-purple-200 bg-purple-50/50 text-purple-600 hover:bg-purple-100'
                    }`}
                >
                  <div className="text-sm font-bold">{selectedClusters.size === clusterOptions.length ? 'Deselect All' : 'Select All'}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70">Clusters</div>
                </button>

                {clusterOptions.map((cluster) => (
                  <button
                    key={cluster._id}
                    onClick={() => toggleCluster(cluster._id)}
                    className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedClusters.has(cluster._id) ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 bg-white hover:border-purple-300'
                      }`}
                  >
                    <div className="text-sm font-bold text-gray-800">{cluster.name}</div>
                    <div className="text-[10px] text-gray-400">({cluster.state?.name})</div>
                    {selectedClusters.has(cluster._id) && (
                      <div className="absolute top-2 right-2"><CheckSquare size={14} className="text-purple-500" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* District Selection */}
        {selectedClusters.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select District</h2>
              {selectedDistricts.size > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {selectedDistricts.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button
                  onClick={selectAllDistricts}
                  className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedDistricts.size === districtOptions.length && districtOptions.length > 0
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                >
                  <div className="text-sm font-bold">{selectedDistricts.size === districtOptions.length ? 'Deselect All' : 'Select All'}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70">Districts</div>
                </button>

                {districtOptions.map((district) => (
                  <button
                    key={district._id}
                    onClick={() => toggleDistrict(district._id)}
                    className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedDistricts.has(district._id) ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-100 bg-white hover:border-emerald-300'
                      }`}
                  >
                    <div className="text-sm font-bold text-gray-800">{district.name}</div>
                    {selectedDistricts.has(district._id) && (
                      <div className="absolute top-2 right-2"><CheckSquare size={14} className="text-emerald-500" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* City Selection */}
        {selectedDistricts.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Select City</h2>
              {selectedCities.size > 0 && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {selectedCities.size} Selected
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button
                  onClick={selectAllCities}
                  className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedCities.size === cityOptions.length && cityOptions.length > 0
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                      : 'border-orange-200 bg-orange-50/50 text-orange-600 hover:bg-orange-100'
                    }`}
                >
                  <div className="text-sm font-bold">{selectedCities.size === cityOptions.length ? 'Deselect All' : 'Select All'}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70">Cities</div>
                </button>

                {cityOptions.map((city) => (
                  <button
                    key={city._id}
                    onClick={() => toggleCity(city._id)}
                    className={`flex-shrink-0 w-48 p-4 rounded-xl border-2 selection-card text-center relative ${selectedCities.has(city._id) ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-orange-300'
                      }`}
                  >
                    <div className="text-sm font-bold text-gray-800">{city.name}</div>
                    {selectedCities.has(city._id) && (
                      <div className="absolute top-2 right-2"><CheckSquare size={14} className="text-orange-500" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Configuration Table Section */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 mb-20">
          <div className="p-5 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Bundle Plan Configurations</h3>
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md shadow-indigo-100"
            >
              <Plus size={16} />
              Configure New Bundle
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Identity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hierarchy Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Panel Brands</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Technology</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Wattage</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Package size={40} className="text-gray-200 mb-2" />
                        <p className="text-sm font-bold text-gray-400">No Bundle Plans Configured</p>
                        <p className="text-[10px] text-gray-300">Select locations and click "Configure New Bundle"</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPlans.map(plan => {
                  const stateId = plan.state?._id || plan.state;
                  // const stateObj = availableStates.find(s => s._id === stateId);
                  // const isEditing = editMode[stateId];

                  return (
                    <tr key={plan._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{plan.bundleName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            {plan.category} • {plan.subCategory}
                          </span>
                          <span className="text-[10px] text-indigo-500 font-black">{plan.projectType} • {plan.subProjectType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">{plan.clusters?.length || 0} CL</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">{plan.districts?.length || 0} DS</span>
                          <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded">{plan.cities?.length || 0} CT</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {plan.panelBrands?.map(p => <span key={p} className="bg-gray-100 text-[9px] font-bold px-1.5 py-0.5 rounded text-gray-600">{p}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[100px]">
                          {plan.technologyType?.map(t => <span key={t} className="bg-indigo-50 text-[9px] font-bold px-1.5 py-0.5 rounded text-indigo-600">{t}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {plan.wattage?.map(w => <span key={w} className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1 rounded">{w}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{plan.kw} kW</span>
                          <span className="text-[10px] font-bold text-emerald-600">₹{plan.cashback} Cashback</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDetailsModal(plan)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => enableEditMode(plan)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteBundle(plan._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight">Bundle Plan Specification</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Package className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">{modalContent.title}</h4>
                  <p className="text-sm text-slate-400 font-medium">Detailed configuration breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hierarchy Coverage</label>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">{modalContent.clusters.length} Clusters</span>
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-bold">{modalContent.districts.length} Districts</span>
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold">{modalContent.cities.length} Cities</span>
                  </div>
                </div>



                <div className="col-span-2 h-px bg-slate-100"></div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Panel Brands</label>
                  <p className="text-sm font-bold text-slate-700">{modalContent.panelBrands.join(', ') || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Technology Type</label>
                  <p className="text-sm font-bold text-indigo-600">{modalContent.technologyType.join(', ') || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Wattage & Power</label>
                  <p className="text-sm font-bold text-slate-700">{modalContent.wattage.join(', ') || 'N/A'} • {modalContent.kw} kW</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Commercials</label>
                  <p className="text-sm font-bold text-emerald-600">₹{modalContent.cashback} Cashback • {modalContent.timeDuration.join(', ')} Days</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Configure Modal */}
      {showConfigureModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-auto animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0c2340] text-white px-8 py-6 relative">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">Configuration Wizard</span>
                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                  <Settings className="text-cyan-400 animate-spin-slow" size={24} />
                  {currentPlan ? 'Update' : 'Create'} Bundle Plan
                </h3>
              </div>
              <button
                onClick={() => setShowConfigureModal(false)}
                className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 text-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Section 1: Identity */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
                    Plan Identity
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bundle Name</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-cyan-500 hover:border-slate-200 transition-all"
                        placeholder="e.g. Gujarat Solar Power Bundle"
                        value={planForm.bundleName}
                        onChange={(e) => setPlanForm({ ...planForm, bundleName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <select
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                          value={planForm.category}
                          onChange={(e) => setPlanForm({ ...planForm, category: e.target.value, subCategory: '' })}
                        >
                          <option value="">Select</option>
                          {masterCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Category</label>
                        <select
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                          value={planForm.subCategory}
                          onChange={(e) => setPlanForm({ ...planForm, subCategory: e.target.value })}
                        >
                          <option value="">Select</option>
                          {masterSubCategories.filter(s => {
                            const cat = masterCategories.find(c => c.name === planForm.category);
                            return cat && (s.categoryId?._id === cat._id || s.categoryId === cat._id);
                          }).map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project Type Range</label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                        value={planForm.projectType}
                        onChange={(e) => setPlanForm({ ...planForm, projectType: e.target.value })}
                      >
                        <option value="">Select Range</option>
                        {Array.from(new Set(projectMappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)))
                          .map(range => <option key={range} value={range}>{range}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Project Type</label>
                      <select
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                        value={planForm.subProjectType}
                        onChange={(e) => setPlanForm({ ...planForm, subProjectType: e.target.value })}
                      >
                        <option value="">Select Option</option>
                        {masterSubProjectTypes.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Technical Specs */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
                    Technical & Commercials
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Capacity (kW)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                          value={planForm.kw}
                          onChange={(e) => setPlanForm({ ...planForm, kw: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cashback (₹)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 focus:outline-none"
                          value={planForm.cashback}
                          onChange={(e) => setPlanForm({ ...planForm, cashback: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Panel Brands</label>
                      <div className="flex flex-wrap gap-2">
                        {availablePanelBrands.length > 0 ? availablePanelBrands.map(m => {
                          const b = m.brand || m.companyName || m.name;
                          return (
                            <button
                              key={m._id}
                              onClick={() => {
                                const next = new Set(planForm.panelBrands);
                                if (next.has(b)) next.delete(b);
                                else next.add(b);
                                setPlanForm({ ...planForm, panelBrands: Array.from(next) });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border-2 ${planForm.panelBrands.includes(b) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                            >
                              {b}
                            </button>
                          );
                        }) : (
                          <div className="text-[10px] text-slate-400 italic">No brands found. Enable "Combo Kit" in Brand Manufacturer settings.</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Wattage</label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                        {isWattageLoading ? (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Loader size={14} className="animate-spin text-indigo-500" />
                            Fetching available wattages...
                          </div>
                        ) : availableWattages.length > 0 ? (
                          availableWattages.map(w => (
                            <div key={w} className="relative group">
                              <button
                                onClick={() => {
                                  const next = new Set(planForm.wattage);
                                  if (next.has(w)) next.delete(w);
                                  else next.add(w);
                                  setPlanForm({ ...planForm, wattage: Array.from(next) });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border-2 ${planForm.wattage.includes(w) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                  }`}
                              >
                                {w}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">Select a brand to see available wattages.</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Technology & Duration</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          multiple
                          className="bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold h-24"
                          value={planForm.technologyType}
                          onChange={(e) => setPlanForm({ ...planForm, technologyType: Array.from(e.target.selectedOptions, o => o.value) })}
                        >
                          <option value="Mono Perc">Mono Perc</option>
                          <option value="Bi Facial">Bi Facial</option>
                          <option value="Topcon">Topcon</option>
                        </select>
                        <select
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                          value={planForm.timeDuration[0] || ""}
                          onChange={(e) => setPlanForm({ ...planForm, timeDuration: e.target.value ? [Number(e.target.value)] : [] })}
                        >
                          <option value="">Select Duration</option>
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <MapPin size={12} className="text-cyan-500" />
                Applying to {selectedStates.size} State, {selectedCities.size} Cities
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfigureModal(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBundle}
                  className="px-8 py-3 bg-cyan-500 text-white text-sm font-bold rounded-xl hover:bg-cyan-600 shadow-lg shadow-cyan-100 transition-all uppercase tracking-widest"
                >
                  {currentPlan ? 'Update Plan' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundlePlans;