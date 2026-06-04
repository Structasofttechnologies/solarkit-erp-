import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Check, Rocket, Edit, LayoutGrid, CircleUserRound, Building2, House,
  MapPin, Eye, CheckCircle2, ChevronUp, Plus, Trash2, X, RefreshCw, ClipboardList,
  Globe, Target, Layers, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSolarInstallerPlans,
  createSolarInstallerPlan,
  updateSolarInstallerPlan,
  deleteSolarInstallerPlan,
  getInstallerRatings
} from '../../../../services/installer/installerApi';
import { getStates, getCountries, getClustersHierarchy, getDistrictsHierarchy } from '../../../../services/core/locationApi';
import { productApi } from '../../../../api/productApi';


const DEFAULT_PLAN = {
  name: 'New Plan',
  description: 'Description for the new plan',
  minimumRating: 0,
  planColor: '#0070cc',
  state: null,
  eligibility: {
    aadharCard: false,
    panCard: false,
    agreement: false,
    requiredDocuments: []
  },
  coverage: 'Single District',
  selectedDistricts: [],
  selectedClusters: [],
  userLimits: 10,
  subUser: { supervisor: false },
  assignedProjectTypes: [],
  solarInstallationPoints: [],
  solarInstallationCharges: [],
  signupFees: 0,
  depositFees: 0,
  isActive: true
};


const SolarInstaller = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allPlansForCount, setAllPlansForCount] = useState([]);

  const [selectedCountryId, setSelectedCountryId] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState([]);
  const [selectedClusterId, setSelectedClusterId] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [maxRating, setMaxRating] = useState(5);

  // Refs for scrolling
  const sectionRefs = {
    eligibility: useRef(null),
    subUser: useRef(null),
    capacity: useRef(null),
    points: useRef(null),
    charges: useRef(null)
  };

  const getRowLabel = (row) => {
    const main = row.subCategory || row.category || 'Unknown';
    const type = row.projectType || '';
    const sub = (row.subProjectType && row.subProjectType !== '-' && row.subProjectType !== 'On-Grid') ? ` (${row.subProjectType})` : '';
    return `${main} ${type}${sub}`.trim();
  };


  const scrollToSection = (sectionKey) => {
    sectionRefs[sectionKey].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Form State
  const [formData, setFormData] = useState({ ...DEFAULT_PLAN });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // We removed old fetchers

  const fetchProjectMappings = async () => {
    try {
      setIsApplying(true);
      const params = {};

      if (formData.coverage === 'State' && formData.state) {
        params.stateId = formData.state;
      } else if (formData.coverage === 'Single District' && formData.selectedDistricts?.[0]) {
        params.districtId = formData.selectedDistricts[0];
      } else if (formData.coverage === 'Multi District' && formData.selectedDistricts?.length > 0) {
        params.districtIds = formData.selectedDistricts;
      } else if (formData.coverage === 'Cluster' && formData.selectedClusters?.length > 0) {
        params.clusterIds = formData.selectedClusters;
      }

      const res = await productApi.getProjectCategoryMappings(params);
      if (res.data.success) {
        const mappings = res.data.data || [];
        setProjectMappings(mappings);

        // Immediately sync to the table
        setFormData(prev => handleSyncLogic(prev, mappings));

        if (mappings.length === 0) {
          toast("No configurations found for this location", { icon: 'ℹ️' });
        } else {
          toast.success("Applied new configurations");
        }
      }
    } catch (err) {
      console.error('Failed to fetch project mappings', err);
      toast.error("Failed to fetch configurations");
    } finally {
      setIsApplying(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [countriesData, ratingsData, plansRes] = await Promise.all([
        getCountries(),
        getInstallerRatings(),
        getSolarInstallerPlans()
      ]);
      setCountries(countriesData);
      setAllPlansForCount(plansRes.data || plansRes || []);
      if (ratingsData.length > 0) {
        setMaxRating(ratingsData[0].maxRating || 5);
      }
      if (countriesData.length > 0) {
        setSelectedCountryId([countriesData[0]._id]);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  // Plan Counting Helper
  const getPlanCount = (type, id) => {
    return allPlansForCount.filter(p => {
      if (type === 'country') return (p.country?._id || p.country) === id || (p.country?.includes?.(id));
      if (type === 'state') return (p.state?._id || p.state) === id || (p.state?.includes?.(id));
      if (type === 'cluster') return (p.cluster?._id || p.cluster) === id || (p.cluster?.includes?.(id)) || p.selectedClusters?.includes?.(id);
      if (type === 'district') return (p.districts?.some(d => (d._id || d) === id)) || p.selectedDistricts?.includes?.(id);
      return false;
    }).length;
  };

  // Cascading: States
  useEffect(() => {
    if (selectedCountryId.length > 0) {
      const fetchStatesForCountry = async () => {
        try {
          const promises = selectedCountryId.map(id => getStates({ countryId: id }));
          const results = await Promise.all(promises);
          const allStates = results.flat();
          // Unique by _id
          const uniqueStates = Array.from(new Map(allStates.map(s => [s._id, s])).values());
          setStates(uniqueStates);
          
          // Clear children
          setSelectedStateId(prev => prev.filter(id => uniqueStates.some(s => s._id === id)));
        } catch (error) {
          console.error(error);
        }
      };
      fetchStatesForCountry();
    } else {
      setStates([]);
      setSelectedStateId([]);
    }
  }, [selectedCountryId]);

  // Cascading: Clusters
  useEffect(() => {
    if (selectedStateId.length > 0) {
      const fetchClustersForState = async () => {
        try {
          const promises = selectedStateId.map(id => getClustersHierarchy(id));
          const results = await Promise.all(promises);
          const allClusters = results.flat();
          const uniqueClusters = Array.from(new Map(allClusters.map(c => [c._id, c])).values());
          setClusters(uniqueClusters);
          setSelectedClusterId(prev => prev.filter(id => uniqueClusters.some(c => c._id === id)));
        } catch (error) {
          console.error(error);
        }
      };
      fetchClustersForState();
    } else {
      setClusters([]);
      setSelectedClusterId([]);
    }
  }, [selectedStateId]);

  // Cascading: Districts
  useEffect(() => {
    if (selectedClusterId.length > 0) {
      const fetchDistrictsForCluster = async () => {
        try {
          const promises = selectedClusterId.map(id => getDistrictsHierarchy(id));
          const results = await Promise.all(promises);
          const allDistricts = results.flat();
          const uniqueDistricts = Array.from(new Map(allDistricts.map(d => [d._id, d])).values());
          setDistricts(uniqueDistricts);
          setSelectedDistrictId(prev => prev.filter(id => uniqueDistricts.some(d => d._id === id)));
        } catch (error) {
          console.error(error);
        }
      };
      fetchDistrictsForCluster();
    } else {
      setDistricts([]);
      setSelectedDistrictId([]);
    }
  }, [selectedClusterId]);

  // Fetch Plans based on hierarchy or lack thereof
  useEffect(() => {
    fetchPlans();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getSolarInstallerPlans({
        countryIds: selectedCountryId,
        stateIds: selectedStateId,
        clusterIds: selectedClusterId,
        districtIds: selectedDistrictId
      });
      const pData = res.data || res || [];
      
      // Deduplicate by name if backend has legacy duplicates or overlapping filters
      const uniqueData = [];
      const seenNames = new Set();
      pData.forEach(plan => {
          if (!seenNames.has(plan.name)) {
              seenNames.add(plan.name);
              uniqueData.push(plan);
          }
      });
      
      setPlans(uniqueData);
      if (uniqueData.length > 0) {
        handleSelectPlan(uniqueData[0]);
      } else {
        setFormData({ ...DEFAULT_PLAN });
        setSelectedPlanId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // We removed auto-fetch to implement the "Apply" button logic
    // fetchProjectMappings(); 
  }, []); // Only once or never, we use the button now


  const handleSyncLogic = (prevData, mappings) => {
    const currentAssigned = prevData.assignedProjectTypes || [];
    const grouped = Object.values(mappings.reduce((acc, curr) => {
      if (!curr.categoryId?.name || !curr.subCategoryId?.name) return acc;
      const key = `${curr.categoryId?._id}-${curr.subCategoryId?._id}-${curr.subProjectTypeId?._id || 'none'}-${curr.projectTypeFrom}-${curr.projectTypeTo}`;
      if (!acc[key]) acc[key] = curr;
      return acc;
    }, {}));

    const updatedAssigned = grouped.map(m => {
      const projectTypeStr = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
      const subPType = m.subProjectTypeId?.name || (m.subProjectTypeId ? (m.subProjectTypeId.name || m.subProjectTypeId) : '-');
      const existing = currentAssigned.find(pt =>
        pt.category === m.categoryId?.name &&
        pt.subCategory === m.subCategoryId?.name &&
        pt.projectType === projectTypeStr &&
        pt.subProjectType === subPType
      );

      return {
        category: m.categoryId?.name,
        categoryId: m.categoryId?._id,
        subCategory: m.subCategoryId?.name,
        subCategoryId: m.subCategoryId?._id,
        projectType: projectTypeStr,
        subProjectType: subPType,
        subProjectTypeId: m.subProjectTypeId?._id || null,
        yearlyTargetKw: existing?.yearlyTargetKw || '',
        incentiveAmount: existing?.incentiveAmount || '',
        installationCharges: existing?.installationCharges || '',
        capacity: existing?.capacity || '',
        daysRequiredUnit: existing?.daysRequiredUnit || 'Weeks',
        daysRequiredVal: existing?.daysRequiredVal || '',
        active: existing ? existing.active : true
      };
    });

    const activeRows = updatedAssigned.filter(r => r.active);
    const nextPoints = activeRows.map(row => {
      const label = getRowLabel(row);
      const existing = prevData.solarInstallationPoints.find(p => p.typeLabel === label);
      return {
        typeLabel: label,
        category: row.categoryId,
        subCategory: row.subCategoryId,
        projectType: row.projectType,
        subProjectType: row.subProjectTypeId,
        points: existing?.points || 0,
        periodInMonth: existing?.periodInMonth || 0,
        claimInMonth: existing?.claimInMonth || 0,
        active: true
      };
    });

    const nextCharges = activeRows.map(row => {
      const label = getRowLabel(row);
      const existing = prevData.solarInstallationCharges?.find(c => c.typeLabel === label);
      return {
        typeLabel: label,
        category: row.categoryId,
        subCategory: row.subCategoryId,
        projectType: row.projectType,
        subProjectType: row.subProjectTypeId,
        chargesPerKw: row.installationCharges || existing?.chargesPerKw || 0,
        active: true
      };
    });

    return {
      ...prevData,
      assignedProjectTypes: updatedAssigned,
      solarInstallationPoints: nextPoints,
      solarInstallationCharges: nextCharges
    };
  };

  const syncFromGlobal = () => {
    if (projectMappings.length > 0) {
      setFormData(prev => handleSyncLogic(prev, projectMappings));
      toast.success("Synced with Global Settings");
    }
  };



  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan._id);
    setFormData({
      ...DEFAULT_PLAN,
      ...plan,
      state: plan.state ? plan.state._id || plan.state : null
    });
    setIsEditingName(false);
    setIsEditingDesc(false);
  };

  const handleAddNewPlan = () => {
    setSelectedPlanId('new');
    setFormData({ ...DEFAULT_PLAN });
    setIsEditingName(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      let val = type === 'checkbox' ? checked : value;
      if (name === 'minimumRating') {
        val = Math.max(0, Math.min(maxRating, Number(value)));
      }
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleDocToggle = (doc) => {
    setFormData(prev => {
      const docs = prev.eligibility.requiredDocuments || [];
      const newDocs = docs.includes(doc) ? docs.filter(d => d !== doc) : [...docs, doc];
      return {
        ...prev,
        eligibility: { ...prev.eligibility, requiredDocuments: newDocs }
      };
    });
  };

  const handleClusterToggle = (clusterId) => {
    setFormData(prev => {
      const current = prev.selectedClusters || [];
      const next = current.includes(clusterId) ? current.filter(id => id !== clusterId) : [...current, clusterId];
      return { ...prev, selectedClusters: next };
    });
  };

  const handleDistrictToggle = (districtId, isSingle = false) => {
    setFormData(prev => {
      const current = prev.selectedDistricts || [];
      let next;
      if (isSingle) {
        next = [districtId];
      } else {
        next = current.includes(districtId) ? current.filter(id => id !== districtId) : [...current, districtId];
      }
      return { ...prev, selectedDistricts: next };
    });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };

      let nextData = { ...prev, [arrayName]: newArray };

      // Link Charges between Table 1 and Table 3
      if (arrayName === 'assignedProjectTypes' && field === 'installationCharges') {
        const label = getRowLabel(newArray[index]);
        nextData.solarInstallationCharges = prev.solarInstallationCharges.map(c =>
          c.typeLabel === label ? { ...c, chargesPerKw: value } : c
        );
      } else if (arrayName === 'solarInstallationCharges' && field === 'chargesPerKw') {
        const label = newArray[index].typeLabel;
        nextData.assignedProjectTypes = prev.assignedProjectTypes.map(apt =>
          getRowLabel(apt) === label ? { ...apt, installationCharges: value } : apt
        );
      }

      return nextData;
    });
  };

  const handleAddNewProjectType = () => {
    setFormData(prev => ({
      ...prev,
      assignedProjectTypes: [
        ...prev.assignedProjectTypes,
        {
          category: 'Residential',
          subCategory: 'Residential',
          projectType: '0 to 10 kW',
          subProjectType: 'On-Grid',
          yearlyTargetKw: '',
          incentiveAmount: '',
          installationCharges: '',
          capacity: '',
          daysRequiredUnit: 'Weeks',
          daysRequiredVal: '',
          active: true
        }
      ]
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        country: (Array.isArray(selectedCountryId) ? selectedCountryId[0] : selectedCountryId) || null,
        state: (Array.isArray(selectedStateId) ? selectedStateId[0] : selectedStateId) || null,
        cluster: (Array.isArray(selectedClusterId) ? selectedClusterId[0] : selectedClusterId) || null,
        districts: Array.isArray(selectedDistrictId) ? selectedDistrictId : (selectedDistrictId ? [selectedDistrictId] : [])
      };

      if (selectedPlanId === 'new') {
        const result = await createSolarInstallerPlan(payload);
        toast.success('Plan created successfully');
        const newPlan = result.data || result;
        setPlans([...plans, newPlan]);
        handleSelectPlan(newPlan);
      } else {
        const result = await updateSolarInstallerPlan(selectedPlanId, payload);
        toast.success('Plan updated successfully');
        const updatedPlan = result.data || result;
        setPlans(plans.map(p => p._id === updatedPlan._id ? updatedPlan : p));
        handleSelectPlan(updatedPlan);
      }
    } catch (error) {
      console.error('Error saving plan', error);
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanId || selectedPlanId === 'new') return;
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await deleteSolarInstallerPlan(selectedPlanId);
      toast.success('Plan deleted successfully');

      const newPlans = plans.filter(p => p._id !== selectedPlanId);
      setPlans(newPlans);

      if (newPlans.length > 0) {
        handleSelectPlan(newPlans[0]);
      } else {
        handleAddNewPlan();
      }
    } catch (error) {
      console.error('Error deleting plan', error);
      toast.error('Failed to delete plan');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
  }

  const isNew = selectedPlanId === 'new';

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 font-sans text-gray-800 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2 shadow-sm mb-6">
        <Settings className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Solar Installer Settings</h1>
      </div>

      {/* Location Cascade Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8 flex flex-col gap-6">
        {/* Country */}
        <div className="animate-in fade-in slide-in-from-top-1">
           <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-blue-600" /> Select Country
              </h3>
              <button 
                onClick={() => setSelectedCountryId(selectedCountryId.length === countries.length ? [] : countries.map(c => c._id))}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
              >
                {selectedCountryId.length === countries.length ? 'Deselect All' : 'Select All'}
              </button>
           </div>
           <div className="flex flex-wrap gap-2">
              {countries.map(c => {
                const count = getPlanCount('country', c._id);
                const isSelected = selectedCountryId.includes(c._id);
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCountryId(prev => isSelected ? prev.filter(id => id !== c._id) : [...prev, c._id])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    {c.name}
                    {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{count}</span>}
                  </button>
                );
              })}
           </div>
        </div>

        {/* State */}
        {selectedCountryId.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-1 border-t pt-6">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-blue-600" /> Select State
                </h3>
                <button 
                  onClick={() => setSelectedStateId(selectedStateId.length === states.length ? [] : states.map(s => s._id))}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                >
                  {selectedStateId.length === states.length ? 'Deselect All' : 'Select All'}
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                 {states.map(s => {
                   const count = getPlanCount('state', s._id);
                   const isSelected = selectedStateId.includes(s._id);
                   return (
                     <button
                       key={s._id}
                       onClick={() => setSelectedStateId(prev => isSelected ? prev.filter(id => id !== s._id) : [...prev, s._id])}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                     >
                       {s.name}
                       {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{count}</span>}
                     </button>
                   );
                 })}
              </div>
          </div>
        )}

        {/* Cluster */}
        {selectedStateId.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-1 border-t pt-6">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Layers className="w-4 h-4 text-blue-600" /> Select Cluster
                </h3>
                <button 
                  onClick={() => setSelectedClusterId(selectedClusterId.length === clusters.length ? [] : clusters.map(c => c._id))}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                >
                  {selectedClusterId.length === clusters.length ? 'Deselect All' : 'Select All'}
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                 {clusters.map(c => {
                    const count = getPlanCount('cluster', c._id);
                    const isSelected = selectedClusterId.includes(c._id);
                    return (
                      <button
                        key={c._id}
                        onClick={() => setSelectedClusterId(prev => isSelected ? prev.filter(id => id !== c._id) : [...prev, c._id])}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                      >
                        {c.name || c.clusterName}
                        {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{count}</span>}
                      </button>
                    );
                 })}
              </div>
          </div>
        )}

        {/* District */}
        {selectedClusterId.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-1 border-t pt-6">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Target className="w-4 h-4 text-blue-600" /> Select District
                </h3>
                <button 
                  onClick={() => setSelectedDistrictId(selectedDistrictId.length === districts.length ? [] : districts.map(d => d._id))}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                >
                  {selectedDistrictId.length === districts.length ? 'Deselect All' : 'Select All'}
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                 {districts.map(d => {
                    const count = getPlanCount('district', d._id);
                    const isSelected = selectedDistrictId.includes(d._id);
                    return (
                      <button
                        key={d._id}
                        onClick={() => setSelectedDistrictId(prev => isSelected ? prev.filter(id => id !== d._id) : [...prev, d._id])}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                      >
                        {d.name || d.districtName}
                        {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{count}</span>}
                      </button>
                    );
                 })}
              </div>
          </div>
        )}
      </div>

      {/* Blue Banner */}
      <div
        className="rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md transition-colors bg-[#0070cc]"
      >
        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="text-2xl font-bold mb-1 bg-white/20 border border-white/40 rounded px-2 py-1 outline-none focus:bg-white/30 text-white w-full max-w-sm"
              onBlur={() => setIsEditingName(false)}
              autoFocus
            />
          ) : (
            <h2 className="text-2xl font-bold mb-1">{formData.name || 'Unnamed Plan'}</h2>
          )}

          {isEditingDesc ? (
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="text-sm bg-white/20 border border-white/40 rounded px-2 py-1 outline-none focus:bg-white/30 text-white w-full max-w-lg mt-1"
              onBlur={() => setIsEditingDesc(false)}
              autoFocus
            />
          ) : (
            <p className="text-blue-100 text-sm opacity-90">{formData.description || 'No description provided'}</p>
          )}
        </div>

        <div className="flex gap-3 mt-4 md:mt-0 shadow-sm shrink-0">
          <button
            onClick={() => setIsEditingName(true)}
            className="bg-white text-blue-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Plan Name
          </button>
          <button
            onClick={() => setIsEditingDesc(true)}
            className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors backdrop-blur-sm"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Description
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Plan Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-6 mb-8 text-sm font-semibold">
        {plans.map((p) => (
          <button
            key={p._id}
            onClick={() => handleSelectPlan(p)}
            className={`px-6 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition ${selectedPlanId === p._id
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
              : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            {selectedPlanId === p._id && <Rocket className="w-4 h-4" />}
            {p.name}
          </button>
        ))}
        {isNew && (
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:bg-blue-700 transition">
            <Rocket className="w-4 h-4" /> New Plan
          </button>
        )}
        <button
          onClick={handleAddNewPlan}
          className="bg-[#3b4351] text-white px-5 py-2.5 rounded-full flex items-center gap-1 shadow-sm hover:bg-gray-800 transition ml-2"
        >
          <Plus className="w-4 h-4" /> Add More Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

        {/* Left Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] overflow-hidden border border-blue-100 sticky top-4">
            <div className="bg-[#2e68f3] text-white p-4 font-bold text-sm flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" /> Plan Sections
            </div>
            <div className="flex flex-col text-[13px] text-gray-700 font-medium">
              <div onClick={() => scrollToSection('eligibility')} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span>Eligibility Requirements</span>
              </div>
              <div onClick={() => scrollToSection('subUser')} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span>App User</span>
              </div>
              <div onClick={() => scrollToSection('capacity')} className="flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500 mt-0.5" /> <span className="leading-tight">Project Types vise Installation Capacity</span>
              </div>
              <div onClick={() => scrollToSection('points')} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span className="leading-tight">Solar Installation Points</span>
              </div>
              <div onClick={() => scrollToSection('charges')} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span className="leading-tight">Solar Installation Charges</span>
              </div>

            </div>
          </div>
        </div>

        {/* Center Main Content */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 pb-8">

          <div className="p-6 md:p-8">
            {/* Header Form Top */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-gray-100 pb-6">
              <div className="flex gap-2 w-full md:w-auto">
                <Rocket className="w-8 h-8 text-blue-600 shrink-0" />
                <div className="w-full">
                  <input
                    className="text-2xl font-bold text-blue-700 w-full outline-none border-b border-transparent focus:border-blue-300"
                    value={formData.name}
                    name="name"
                    onChange={handleInputChange}
                    placeholder="Plan Name"
                  />
                  <input
                    className="text-sm text-gray-500 font-medium mt-1 w-full outline-none border-b border-transparent focus:border-gray-300"
                    value={formData.description}
                    name="description"
                    onChange={handleInputChange}
                    placeholder="Plan Description"
                  />
                </div>
              </div>
              <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100 shrink-0">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Banner Color :</label>
                  <input
                    type="color"
                    name="planColor"
                    value={formData.planColor}
                    onChange={handleInputChange}
                    className="h-6 w-full cursor-pointer rounded border-0 p-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10">

              {/* Eligibility Requirements */}
              <section ref={sectionRefs.eligibility} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Eligibility Requirements</h4>
                <div className="flex flex-wrap items-start gap-8 md:gap-12">
                  <div className="flex flex-col gap-3 min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Documents Required</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          name="eligibility.aadharCard"
                          checked={formData.eligibility.aadharCard}
                          onChange={handleInputChange}
                          className="w-3.5 h-3.5 accent-blue-600"
                        /> Aadhar Card
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          name="eligibility.panCard"
                          checked={formData.eligibility.panCard}
                          onChange={handleInputChange}
                          className="w-3.5 h-3.5 accent-blue-600"
                        /> PAN Card
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          name="eligibility.agreement"
                          checked={formData.eligibility.agreement}
                          onChange={handleInputChange}
                          className="w-3.5 h-3.5 accent-blue-600"
                        /> Business Agreement RAM
                      </label>

                    </div>
                  </div>


                  <div className="flex flex-col gap-4 min-w-[200px]">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Coverage</label>
                      <select
                        name="coverage"
                        value={formData.coverage}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-blue-500 bg-white"
                      >
                        <option value="Single District">Single District</option>
                        <option value="Multi District">Multi District</option>
                        <option value="State">State-wise</option>
                        <option value="Cluster">Cluster-wise</option>
                      </select>
                    </div>

                    {formData.coverage === 'Single District' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Select District</label>
                        <select
                          value={formData.selectedDistricts[0] || ''}
                          onChange={(e) => handleDistrictToggle(e.target.value, true)}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-blue-500 bg-white"
                        >
                          <option value="">Choose District</option>
                          {districts.map(d => <option key={d._id} value={d._id}>{d.name || d.districtName}</option>)}
                        </select>
                      </div>
                    )}

                    {formData.coverage === 'Multi District' && (
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50/50">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Select Districts</label>
                        {districts.map(d => (
                          <label key={d._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.selectedDistricts?.includes(d._id)}
                              onChange={() => handleDistrictToggle(d._id, false)}
                              className="w-3.5 h-3.5 accent-blue-600"
                            /> {d.name || d.districtName}
                          </label>
                        ))}
                      </div>
                    )}

                    {formData.coverage === 'State' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Specific State (Optional)</label>
                        <select
                          name="state"
                          value={formData.state || ''}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-blue-500 bg-white"
                        >
                          <option value="">All States</option>
                          {states.map(s => <option key={s._id} value={s._id}>{s.name || s.stateName}</option>)}
                        </select>
                      </div>
                    )}

                    {formData.coverage === 'Cluster' && (
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50/50">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Select Clusters</label>
                        {clusters.map(c => (
                          <label key={c._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.selectedClusters?.includes(c._id)}
                              onChange={() => handleClusterToggle(c._id)}
                              className="w-3.5 h-3.5 accent-blue-600"
                            /> {c.name || c.clusterName}
                          </label>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={fetchProjectMappings}
                      disabled={isApplying}
                      className={`mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm ${isApplying
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                      {isApplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isApplying ? 'Applying...' : 'Apply Selection'}
                    </button>
                  </div>

                  <div className="min-w-[150px]">
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      Minimum Rating Req.
                      <span className="text-[10px] text-gray-400 font-medium">(Out of {maxRating})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="minimumRating"
                        step="0.1"
                        min="0"
                        max={maxRating}
                        value={formData.minimumRating ?? 0}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value);
                          if (val > maxRating) val = maxRating;
                          if (val < 0) val = 0;
                          handleInputChange({ target: { name: 'minimumRating', value: isNaN(val) ? '' : val } });
                        }}
                        placeholder={`e.g. ${maxRating - 0.5}`}
                        className="border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm w-full focus:outline-blue-500 bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">/{maxRating}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sub User */}
              <section ref={sectionRefs.subUser} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">App User</h4>
                <div className="flex items-start gap-12">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mt-5">
                    <input
                      type="checkbox"
                      name="subUser.supervisor"
                      checked={formData.subUser.supervisor}
                      onChange={handleInputChange}
                      className="w-3.5 h-3.5 accent-green-600"
                    /> Supervisor
                  </label>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">User Limits</label>
                    <input
                      type="number"
                      name="userLimits"
                      value={formData.userLimits ?? 0}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-24 focus:outline-blue-500 bg-white"
                    />
                  </div>
                </div>
              </section>

              <section ref={sectionRefs.capacity} className="scroll-mt-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800">Project Type Vise Installation Capacity</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tighter font-black shadow-sm flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Auto-Generated
                    </span>

                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#6b7280] text-white flex items-center gap-2 px-4 py-2 text-sm font-medium">
                    <MapPin className="w-4 h-4" /> Project Type Vise Installation Capacity
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f3f4f6] text-[#4b5563] border-b border-gray-200 text-xs font-semibold">
                        <tr>
                          <th className="px-3 py-4 text-center w-12 border-l border-gray-200">Active</th>
                          <th className="px-3 py-4 border-l border-gray-200">Category</th>
                          <th className="px-3 py-4 border-l border-gray-200">Sub-Category</th>
                          <th className="px-3 py-4 border-l border-gray-200">Project Type</th>
                          <th className="px-3 py-4 border-l border-gray-200 whitespace-nowrap">Sub ProjectType</th>
                          <th className="px-3 py-4 border-l border-gray-200">Max Capacity (kW)</th>
                          <th className="px-3 py-4 border-l border-gray-200">Time Required</th>
                          <th className="px-3 py-4 border-l border-gray-200">Days Required</th>
                          <th className="px-3 py-4 border-l border-gray-200 text-center w-12">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.assignedProjectTypes.length > 0 ? (
                          formData.assignedProjectTypes.map((row, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50 text-[13px] font-medium transition-colors ${row.active ? 'bg-white' : 'text-gray-500'}`}>
                              <td className="px-3 py-3 text-center border-l border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={row.active}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'active', e.target.checked)}
                                  className="w-3.5 h-3.5 accent-blue-600"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <input
                                  type="text"
                                  value={row.category || ''}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'category', e.target.value)}
                                  className="w-full text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-200"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <input
                                  type="text"
                                  value={row.subCategory || ''}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'subCategory', e.target.value)}
                                  className="w-full text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-200"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <input
                                  type="text"
                                  value={row.projectType || ''}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'projectType', e.target.value)}
                                  className="w-full text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 outline-none focus:ring-1 focus:ring-blue-300"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <input
                                  type="text"
                                  value={row.subProjectType || ''}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'subProjectType', e.target.value)}
                                  className="w-full text-[11px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 outline-none uppercase tracking-tighter text-center focus:ring-1 focus:ring-gray-300"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <input
                                  type="number"
                                  value={row.capacity ?? ''}
                                  onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'capacity', e.target.value)}
                                  className="w-16 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white"
                                />
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={row.timeRequiredUnit || 'Weeks'}
                                    onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'timeRequiredUnit', e.target.value)}
                                    className="w-24 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white text-xs cursor-pointer"
                                  >
                                    <option value="Days">Days</option>
                                    <option value="Weeks">Weeks</option>
                                    <option value="Months">Months</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={row.timeRequiredVal ?? ''}
                                    onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'timeRequiredVal', e.target.value)}
                                    className="w-16 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={row.daysRequiredUnit || 'Weeks'}
                                    onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'daysRequiredUnit', e.target.value)}
                                    className="w-24 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white text-xs cursor-pointer"
                                  >
                                    <option value="Days">Days</option>
                                    <option value="Weeks">Weeks</option>
                                    <option value="Months">Months</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={row.daysRequiredVal ?? ''}
                                    onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'daysRequiredVal', e.target.value)}
                                    className="w-16 border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3 border-l border-gray-200 text-center">
                                <button
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      assignedProjectTypes: prev.assignedProjectTypes.filter((_, i) => i !== idx)
                                    }))
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="p-12 text-center bg-gray-50/30">
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                  <ClipboardList className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-gray-800 font-bold">No Configurations Active</p>
                                  <p className="text-xs text-gray-500">Please select a location and click <span className="text-blue-600 font-bold uppercase">'Apply Selection'</span></p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Solar Installation Points */}
              <section ref={sectionRefs.points} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                  Solar Installation Points
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">Dynamic Sync Active</span>

                  </div>
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#64748b] text-white flex items-center gap-2 px-4 py-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Installation Point Settings
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] text-[#475569] border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-4 text-center w-12 border-l border-gray-200">Active</th>
                          <th className="px-3 py-4 border-l border-gray-200">Type Label / Category</th>
                          <th className="px-3 py-4 border-l border-gray-200">Yearly Target (kW)</th>
                          <th className="px-3 py-4 border-l border-gray-200">Points</th>
                          <th className="px-3 py-4 border-l border-gray-200">Rupees per Point (₹)</th>
                          <th className="px-3 py-4 border-l border-gray-200">Period (Mo)</th>
                          <th className="px-3 py-4 border-l border-gray-200">Claim (Mo)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.solarInstallationPoints.length > 0 ? (
                          formData.solarInstallationPoints.map((pt, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50/80 transition-colors ${pt.active ? 'bg-white' : 'text-gray-400 bg-gray-50/30'}`}>
                              <td className="px-3 py-3 text-center border-l border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={pt.active}
                                  onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'active', e.target.checked)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <span className="font-bold text-gray-800 block px-1 truncate max-w-[200px]" title={pt.typeLabel}>
                                  {pt.typeLabel}
                                </span>
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <input
                                  type="number"
                                  value={pt.yearlyTargetKw ?? 0}
                                  onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'yearlyTargetKw', e.target.value)}
                                  className="w-20 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                                />
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <div className="flex items-center gap-1 group">
                                  <input
                                    type="number"
                                    value={pt.points ?? 0}
                                    onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'points', Number(e.target.value))}
                                    className="w-20 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <div className="flex items-center gap-1 group">
                                  <span className="text-gray-400 font-bold">₹</span>
                                  <input
                                    type="number"
                                    value={pt.rupeesPerPoint ?? 0}
                                    onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'rupeesPerPoint', Number(e.target.value))}
                                    className="w-20 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <input
                                  type="number"
                                  value={pt.periodInMonth ?? 0}
                                  onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'periodInMonth', Number(e.target.value))}
                                  className="w-16 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white text-center"
                                />
                              </td>
                              <td className="px-3 py-3 border-l border-gray-200">
                                <input
                                  type="number"
                                  value={pt.claimInMonth ?? 0}
                                  onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'claimInMonth', Number(e.target.value))}
                                  className="w-16 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white text-center"
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="6" className="py-8 text-center text-gray-400 font-medium">No installation points added yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Solar Installation Charges */}
              <section ref={sectionRefs.charges} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                  Solar Installation Charges
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">Dynamic Sync Active</span>

                  </div>
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#64748b] text-white flex items-center gap-2 px-4 py-2 text-sm font-medium">
                    <MapPin className="w-4 h-4" /> Installation Charge Settings
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] text-[#475569] border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-4 text-center w-12 border-l border-gray-200">Active</th>
                          <th className="px-4 py-4 border-l border-gray-200">Type Label / Category</th>
                          <th className="px-4 py-4 border-l border-gray-200">Charges (₹/kW)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.solarInstallationCharges.length > 0 ? (
                          formData.solarInstallationCharges.map((pt, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50/80 transition-colors ${pt.active ? 'bg-white' : 'text-gray-400 bg-gray-50/30'}`}>
                              <td className="px-4 py-3 text-center border-l border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={pt.active}
                                  onChange={(e) => handleArrayChange('solarInstallationCharges', idx, 'active', e.target.checked)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 border-l border-gray-200">
                                <span className="font-bold text-gray-800 block px-1 truncate max-w-[250px]" title={pt.typeLabel}>
                                  {pt.typeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 border-l border-gray-200">
                                <div className="flex items-center gap-1 group">
                                  <span className="text-gray-400 font-bold">₹</span>
                                  <input
                                    type="number"
                                    value={pt.chargesPerKw || ''}
                                    onChange={(e) => handleArrayChange('solarInstallationCharges', idx, 'chargesPerKw', e.target.value)}
                                    className="w-24 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="py-8 text-center text-gray-400 font-medium">No installation charges added yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>


              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Plan is {formData.isActive ? 'Active' : 'Inactive'}
                </label>
                <button
                  onClick={handleSave}
                  className="bg-[#0070cc] hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-md shadow-sm transition flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  {isNew ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Sidebar (Summary Card) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 sticky top-4">
            {/* Header */}
            <div className="text-white p-5 text-center transition-colors relative" style={{ backgroundColor: formData.planColor || '#1264a3' }}>
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              
              {/* Rating Required Badge */}
              {formData.minimumRating > 0 && (
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-bold shadow-sm border border-white/30 whitespace-nowrap">
                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> 
                    {formData.minimumRating} / 5
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold tracking-wide uppercase relative z-10">{formData.name || 'PLAN'}</h3>
              <p className="text-xs font-medium text-white/80 mt-1 relative z-10">Summary View</p>
            </div>

            <div className="p-5 pb-8 relative pt-8">


              {/* Price */}
              <div className="text-center mb-6 relative">
                <div className="flex items-baseline justify-center">
                  <span className="text-2xl font-bold text-gray-600 mr-1">₹</span>
                  <input
                    type="number"
                    name="signupFees"
                    value={formData.signupFees || ''}
                    onChange={handleInputChange}
                    className="text-4xl font-extrabold text-[#2d3748] w-32 text-center bg-transparent border-none p-0 outline-none hover:bg-gray-50 focus:ring-1 focus:ring-blue-300 rounded"
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium mt-1">signup fees</p>
              </div>

              {/* Target Box - Auto Calculated */}
              <div className="bg-[#00aaff] rounded-xl text-white p-4 shadow-md relative overflow-hidden transition-colors" style={{ backgroundColor: formData.planColor ? `${formData.planColor}dd` : '#00aaff' }}>
                <div className="flex items-center gap-3 mb-2 px-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-white text-[10px] font-bold">↑</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/80">Yearly Target:</span>
                    <div className="flex items-center gap-1 font-black text-sm">
                      {formData.solarInstallationPoints.filter(r => r.active).reduce((sum, r) => sum + (parseFloat(r.yearlyTargetKw) || 0), 0)} kw
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white text-[10px] text-gray-800 font-bold">$</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/80">Incentive:</span>
                    <div className="flex items-center gap-1 font-black text-sm text-yellow-200">
                      ₹ {formData.assignedProjectTypes.filter(r => r.active).reduce((sum, r) => sum + (parseFloat(r.incentiveAmount) || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden mb-6">
                <div className="h-2.5 rounded-full" style={{ width: '60%', backgroundColor: formData.planColor || '#22c55e' }}></div>
              </div>

              {/* User / Cashback info */}
              <div className="flex items-center gap-4 py-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600" style={{ color: formData.planColor, backgroundColor: `${formData.planColor}15` }}>
                  <CircleUserRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[15px]">Single User</h4>
                  <p className="text-xs text-gray-500">{formData.userLimits} user account{formData.userLimits !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${formData.planColor}15` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white" style={{ backgroundColor: formData.planColor || '#0073b7' }}>PT</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-600 text-[13px] leading-tight opacity-80 uppercase tracking-tight">Points as per <br /> Project Type</h4>
                    <div className="text-xl font-black text-gray-800 mt-0.5">
                      {formData.solarInstallationPoints
                        ? formData.solarInstallationPoints
                          .filter(p => p.active)
                          .reduce((sum, p) => sum + (parseFloat(p.points) || 0), 0)
                        : 0}
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Project Types */}
              <div className="mt-5">
                <h4 className="text-[13px] font-bold text-gray-800 mb-3">Project Types:</h4>
                <div className="space-y-3 pl-1">
                  {Array.from(new Set(formData.assignedProjectTypes.filter(r => r.active).map(r => r.subCategory))).map((subType, i) => (
                    <div key={i} className="flex items-center gap-2 font-bold text-[14px] text-gray-700">
                      {subType === 'Residential' ? <House className="w-4 h-4 text-gray-600" /> : <Building2 className="w-4 h-4 text-gray-600" />}
                      {subType}
                    </div>
                  ))}
                  {formData.assignedProjectTypes.filter(r => r.active).length === 0 && (
                    <span className="text-xs text-gray-400 font-normal">None active</span>
                  )}
                </div>
              </div>



              {/* Required Documents */}
              <div className="mt-6">
                <h4 className="text-[13px] font-bold text-gray-800 mb-3">Required Documents:</h4>
                <div className="space-y-2 pl-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <CheckCircle2 className={`w-4 h-4 ${formData.eligibility.aadharCard ? 'text-green-500 fill-green-50' : 'text-gray-300 fill-gray-50'}`} /> Aadhar Card
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <CheckCircle2 className={`w-4 h-4 ${formData.eligibility.panCard ? 'text-green-500 fill-green-50' : 'text-gray-300 fill-gray-50'}`} /> PAN Card
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <CheckCircle2 className={`w-4 h-4 ${formData.eligibility.agreement ? 'text-green-500 fill-green-50' : 'text-gray-300 fill-gray-50'}`} /> Business RAM
                  </div>
                </div>
              </div>

              {/* Deposit Fees */}
              <div className="mt-6 bg-gray-50 p-3 rounded-lg text-center border border-gray-100 flex flex-col items-center justify-center">
                <h4 className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">Deposit Fees <Edit className="w-3 h-3 text-gray-400" /></h4>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-800 mr-0.5">₹</span>
                  <input
                    type="number"
                    name="depositFees"
                    value={formData.depositFees || ''}
                    onChange={handleInputChange}
                    className="text-lg font-bold text-gray-800 bg-transparent outline-none w-20 text-center border-b border-transparent hover:border-gray-300 focus:border-blue-400 p-0 transition-colors"
                  />
                </div>
              </div>

              {/* Upgrade Plan button */}
              <div className="mt-6">
                <button
                  className="w-full text-white py-3 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-1 group hover:opacity-90"
                  style={{ backgroundColor: formData.planColor || '#0070cc' }}
                >
                  UPGRADE PLAN <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-medium text-gray-500 mt-12 pb-4">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>
    </div>
  );
};

export default SolarInstaller;
