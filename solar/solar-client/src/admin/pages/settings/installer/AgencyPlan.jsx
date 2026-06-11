import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Check, Rocket, Edit, LayoutGrid, CircleUserRound, Building2, House,
  MapPin, Eye, CheckCircle2, ChevronUp, Plus, Trash2, X, RefreshCw, ClipboardList,
  Globe, Target, Layers, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getInstallerAgencyPlans,
  createInstallerAgencyPlan,
  updateInstallerAgencyPlan,
  deleteInstallerAgencyPlan,
  getInstallerRatings
} from '../../../../services/installer/installerApi';
import { getStates, getCountries, getClustersHierarchy, getDistrictsHierarchy } from '../../../../services/core/locationApi';
import { productApi } from '../../../../api/productApi';

const DEFAULT_PLAN = {
  name: 'New Agency Plan',
  description: 'Description for the new agency plan',
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
  subUser: { 
    sales: false,
    dealer: false,
    leadPartner: false,
    service: false,
    supervisor: false 
  },
  assignedProjectTypes: [],
  solarInstallationPoints: [],
  solarInstallationCharges: [],
  signupFees: 0,
  depositFees: 0,
  isActive: true
};

const AgencyPlan = () => {
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
        getInstallerAgencyPlans()
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
          const uniqueStates = Array.from(new Map(allStates.map(s => [s._id, s])).values());
          setStates(uniqueStates);
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

  // Fetch Plans based on hierarchy
  useEffect(() => {
    fetchPlans();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getInstallerAgencyPlans({
        countryIds: selectedCountryId,
        stateIds: selectedStateId,
        clusterIds: selectedClusterId,
        districtIds: selectedDistrictId
      });
      const pData = res.data || res || [];
      
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
        yearlyTargetKw: existing?.yearlyTargetKw || 0,
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



  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan._id);
    setFormData({
      ...DEFAULT_PLAN,
      ...plan,
      state: plan.state ? (typeof plan.state === 'object' ? plan.state._id : plan.state) : null
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
        const result = await createInstallerAgencyPlan(payload);
        toast.success('Agency Plan created successfully');
        const newPlan = result.data || result;
        setPlans([...plans, newPlan]);
        handleSelectPlan(newPlan);
      } else {
        const result = await updateInstallerAgencyPlan(selectedPlanId, payload);
        toast.success('Agency Plan updated successfully');
        const updatedPlan = result.data || result;
        setPlans(plans.map(p => p._id === updatedPlan._id ? updatedPlan : p));
        handleSelectPlan(updatedPlan);
      }
      // Refresh counts
      fetchInitialData();
    } catch (error) {
      console.error('Error saving plan', error);
      toast.error('Failed to save agency plan');
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanId || selectedPlanId === 'new') return;
    if (!window.confirm('Are you sure you want to delete this agency plan?')) return;

    try {
      await deleteInstallerAgencyPlan(selectedPlanId);
      toast.success('Plan deleted successfully');
      const newPlans = plans.filter(p => p._id !== selectedPlanId);
      setPlans(newPlans);
      if (newPlans.length > 0) handleSelectPlan(newPlans[0]);
      else handleAddNewPlan();
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting plan', error);
      toast.error('Failed to delete plan');
    }
  };

  if (loading && countries.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading Agency Plans...</div>;
  }

  const isNew = selectedPlanId === 'new';

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 font-sans text-gray-800 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2 shadow-sm mb-6">
        <Settings className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Installer Agency Plans</h1>
      </div>

      {/* Location Cascade Header with Counting */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8 flex flex-col gap-6">
        {/* Country */}
        <div>
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
      <div className="rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md transition-colors bg-[#0070cc]">
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
            <h2 className="text-2xl font-bold mb-1">{formData.name || 'Unnamed Agency Plan'}</h2>
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
          <button onClick={() => setIsEditingName(true)} className="bg-white text-blue-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-50 transition-colors">
            <Edit className="w-3.5 h-3.5" /> Edit Plan Name
          </button>
          <button onClick={() => setIsEditingDesc(true)} className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors backdrop-blur-sm">
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
                <Check className="w-4 h-4 text-green-500" /> <span>Eligibility</span>
              </div>
              <div onClick={() => scrollToSection('subUser')} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span>Agency Modules</span>
              </div>
              <div onClick={() => scrollToSection('capacity')} className="flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500 mt-0.5" /> <span className="leading-tight">Configuration</span>
              </div>
              <div onClick={() => scrollToSection('points')} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span className="leading-tight">Points</span>
              </div>
              <div onClick={() => scrollToSection('charges')} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer transition">
                <Check className="w-4 h-4 text-green-500" /> <span className="leading-tight">Charges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Main Content */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 pb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-gray-100 pb-6">
              <div className="flex gap-2 w-full md:w-auto">
                <Rocket className="w-8 h-8 text-blue-600 shrink-0" />
                <div className="w-full">
                  {isEditingName ? (
                    <input
                      className="text-2xl font-bold text-blue-700 w-full outline-none bg-blue-50/50 rounded px-1 border-b border-blue-200"
                      value={formData.name}
                      name="name"
                      onChange={handleInputChange}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                      <h3 className="text-2xl font-bold text-blue-700">{formData.name || 'Unnamed Agency Plan'}</h3>
                      <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {isEditingDesc ? (
                    <input
                      className="text-sm text-gray-500 font-medium mt-1 w-full outline-none bg-gray-50 rounded px-1 border-b border-gray-200"
                      value={formData.description}
                      name="description"
                      onChange={handleInputChange}
                      onBlur={() => setIsEditingDesc(false)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer mt-1" onClick={() => setIsEditingDesc(true)}>
                      <p className="text-sm text-gray-500 font-medium">{formData.description || 'No description provided'}</p>
                      <Edit className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                 <label className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Banner Color</label>
                 <div className="flex items-center gap-2">
                   <input type="color" name="planColor" value={formData.planColor} onChange={handleInputChange} className="h-8 w-16 cursor-pointer rounded border-0 p-0 overflow-hidden" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase">{formData.planColor}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Eligibility */}
              <section ref={sectionRefs.eligibility} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> Eligibility Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Documents Required</label>
                    <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer group">
                      <input type="checkbox" name="eligibility.aadharCard" checked={formData.eligibility.aadharCard} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" /> 
                      <span className="group-hover:text-blue-600 transition-colors">Aadhar Card</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer group">
                      <input type="checkbox" name="eligibility.panCard" checked={formData.eligibility.panCard} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" /> 
                      <span className="group-hover:text-blue-600 transition-colors">PAN Card</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer group">
                      <input type="checkbox" name="eligibility.agreement" checked={formData.eligibility.agreement} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" /> 
                      <span className="group-hover:text-blue-600 transition-colors">Agency Agreement</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Plan Coverage Scope</label>
                      <select name="coverage" value={formData.coverage} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                        <option value="Single District">Single District</option>
                        <option value="Multi District">Multi District</option>
                        <option value="Cluster">Cluster-wise</option>
                        <option value="State">State-wise</option>
                      </select>
                    </div>

                    {formData.coverage === 'Single District' && (
                       <div className="space-y-2">
                         <label className="block text-[10px] uppercase font-black text-gray-400">Assign Single District</label>
                         <select value={formData.selectedDistricts[0] || ''} onChange={(e) => handleDistrictToggle(e.target.value, true)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white font-semibold">
                           <option value="">Choose District</option>
                           {districts.map(d => <option key={d._id} value={d._id}>{d.name || d.districtName}</option>)}
                         </select>
                       </div>
                    )}

                    {formData.coverage === 'Multi District' && (
                       <div className="space-y-2">
                         <label className="block text-[10px] uppercase font-black text-gray-400">Assign Multiple Districts</label>
                         <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/30 max-h-40 overflow-y-auto space-y-1">
                           {districts.map(d => (
                             <label key={d._id} className="flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                               <input type="checkbox" checked={formData.selectedDistricts?.includes(d._id)} onChange={() => handleDistrictToggle(d._id, false)} className="w-3.5 h-3.5 accent-blue-600" /> {d.name || d.districtName}
                             </label>
                           ))}
                         </div>
                       </div>
                    )}

                    {formData.coverage === 'Cluster' && (
                       <div className="space-y-2">
                         <label className="block text-[10px] uppercase font-black text-gray-400">Assign Clusters</label>
                         <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/30 max-h-40 overflow-y-auto space-y-1">
                           {clusters.map(c => (
                             <label key={c._id} className="flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                               <input type="checkbox" checked={formData.selectedClusters?.includes(c._id)} onChange={() => handleClusterToggle(c._id)} className="w-3.5 h-3.5 accent-blue-600" /> {c.name || c.clusterName}
                             </label>
                           ))}
                         </div>
                       </div>
                    )}

                    {formData.coverage === 'State' && (
                       <div className="space-y-2">
                         <label className="block text-[10px] uppercase font-black text-gray-400">Assign Specific State (Optional)</label>
                         <select name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white font-semibold">
                            <option value="">All Active States</option>
                            {states.map(s => <option key={s._id} value={s._id}>{s.name || s.stateName}</option>)}
                         </select>
                       </div>
                    )}



                    <button onClick={fetchProjectMappings} disabled={isApplying} className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${isApplying ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isApplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isApplying ? 'Processing...' : 'Apply Location Config'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Sub User Modules */}
              <section ref={sectionRefs.subUser} className="scroll-mt-6">
                <h4 className="font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <CircleUserRound className="w-5 h-5 text-blue-600" /> Sub User Module
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <input type="checkbox" name="subUser.sales" checked={formData.subUser.sales} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-bold text-gray-700">Sales</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <input type="checkbox" name="subUser.dealer" checked={formData.subUser.dealer} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-bold text-gray-700">Dealer</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <input type="checkbox" name="subUser.leadPartner" checked={formData.subUser.leadPartner} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-bold text-gray-700">Lead Partner</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <input type="checkbox" name="subUser.service" checked={formData.subUser.service} onChange={handleInputChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-bold text-gray-700">Service</span>
                  </label>
                </div>
              </section>

              {/* Table 1: Capacity */}
              <section ref={sectionRefs.capacity} className="scroll-mt-6">
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-600" /> Project Configurations</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Auto-Synced</span>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">
                          <th className="px-3 py-4 border-r border-gray-100">Active</th>
                          <th className="px-3 py-4 border-r border-gray-100">Category</th>
                          <th className="px-3 py-4 border-r border-gray-100">Sub-Category</th>
                          <th className="px-3 py-4 border-r border-gray-100">Project Type</th>
                          <th className="px-3 py-4 border-r border-gray-100">Sub P.Type</th>
                          <th className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">Cap (kW)</th>
                          <th className="px-3 py-4 border-r border-gray-100 whitespace-nowrap">Days Req.</th>
                          <th className="px-3 py-4">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-[12px] font-bold">
                        {formData.assignedProjectTypes.length > 0 ? formData.assignedProjectTypes.map((row, idx) => (
                          <tr key={idx} className={`hover:bg-blue-50/30 transition-colors ${!row.active && 'opacity-50 grayscale'}`}>
                             <td className="px-3 py-4 text-center border-r border-gray-100">
                               <input type="checkbox" checked={row.active} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'active', e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                                <input type="text" value={row.category || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'category', e.target.value)} className="w-full bg-transparent outline-none focus:text-blue-600 transition-colors" placeholder="Category" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                                <input type="text" value={row.subCategory || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'subCategory', e.target.value)} className="w-full bg-transparent outline-none focus:text-blue-600 transition-colors font-black" placeholder="Sub-Cat" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                                <input type="text" value={row.projectType || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'projectType', e.target.value)} className="w-full bg-transparent outline-none focus:text-blue-600 transition-colors font-medium text-blue-500" placeholder="Type" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                                <input type="text" value={row.subProjectType || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'subProjectType', e.target.value)} className="w-full bg-transparent outline-none focus:text-blue-600 transition-colors uppercase text-[10px]" placeholder="Sub" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                               <input type="number" value={row.capacity || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'capacity', e.target.value)} className="w-16 border border-gray-100 rounded-lg px-2 py-1.5 focus:border-blue-500 outline-none text-center" placeholder="0" />
                             </td>
                             <td className="px-2 py-4 border-r border-gray-100">
                               <div className="flex items-center gap-1">
                                  <input type="number" value={row.daysRequiredVal || ''} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'daysRequiredVal', e.target.value)} className="w-10 border border-gray-100 rounded-lg px-1.5 py-1.5 focus:border-blue-500 outline-none" placeholder="0" />
                                  <select value={row.daysRequiredUnit || 'Weeks'} onChange={(e) => handleArrayChange('assignedProjectTypes', idx, 'daysRequiredUnit', e.target.value)} className="bg-transparent text-[9px] outline-none font-black text-gray-400">
                                     <option value="Days">D</option>
                                     <option value="Weeks">W</option>
                                     <option value="Months">M</option>
                                  </select>
                               </div>
                             </td>
                             <td className="px-2 py-4 text-center">
                                <button onClick={() => setFormData(prev => ({ ...prev, assignedProjectTypes: prev.assignedProjectTypes.filter((_, i) => i !== idx) }))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                             </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="8" className="p-12 text-center text-gray-400 font-bold italic">No configurations. Apply location or add manually.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>              {/* Table 2: Points */}
              <section ref={sectionRefs.points} className="scroll-mt-6">
                 <div className="flex justify-between items-center mb-4 pb-1">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Star className="w-5 h-5 text-blue-600" /> Solar Installation Points</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">Dynamic Sync Active</span>
                 </div>
                 <div className="border border-[#64748b] rounded-t-xl overflow-hidden shadow-md">
                    <div className="bg-[#64748b] p-3 flex items-center gap-2 text-white font-bold text-sm">
                       <CheckCircle2 className="w-4 h-4 text-white/80" /> Installation Point Settings
                    </div>
                    <div className="overflow-x-auto bg-white border-l border-r border-[#e2e8f0]">
                       <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                             <tr className="text-[11px] font-black text-[#64748b] uppercase tracking-wider">
                                <th className="px-4 py-6 text-center border-r border-[#e2e8f0] w-20">Active</th>
                                <th className="px-6 py-6 border-r border-[#e2e8f0]">Type Label / Category</th>
                                <th className="px-4 py-6 border-r border-[#e2e8f0] text-center whitespace-nowrap">Yearly Target<br/>(kW)</th>
                                <th className="px-4 py-6 border-r border-[#e2e8f0] text-center">Points (₹)</th>
                                <th className="px-4 py-6 border-r border-[#e2e8f0] text-center">Period<br/>(MO)</th>
                                <th className="px-4 py-6 text-center">Claim<br/>(MO)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-bold">
                             {formData.solarInstallationPoints.map((pt, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                   <td className="px-4 py-4 text-center border-r border-[#e2e8f0]">
                                      <input type="checkbox" checked={pt.active} onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'active', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                                   </td>
                                   <td className="px-6 py-4 border-r border-[#e2e8f0] text-gray-800 font-black">
                                      {pt.typeLabel}
                                   </td>
                                   <td className="px-4 py-4 border-r border-[#e2e8f0]">
                                      <div className="flex justify-center">
                                         <input type="number" value={pt.yearlyTargetKw || ''} onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'yearlyTargetKw', e.target.value)} className="w-24 border border-[#e2e8f0] rounded-lg px-3 py-2 focus:border-blue-500 outline-none shadow-sm font-medium" placeholder="0" />
                                      </div>
                                   </td>
                                   <td className="px-4 py-4 border-r border-[#e2e8f0]">
                                      <div className="flex items-center justify-center gap-1.5 text-[#94a3b8]">
                                         <span className="text-lg">₹</span>
                                         <input type="number" value={pt.points || ''} onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'points', e.target.value)} className="w-24 border border-[#e2e8f0] rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 outline-none shadow-sm font-medium" placeholder="0" />
                                      </div>
                                   </td>
                                   <td className="px-4 py-4 border-r border-[#e2e8f0]">
                                      <div className="flex justify-center">
                                         <input type="number" value={pt.periodInMonth || ''} onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'periodInMonth', e.target.value)} className="w-20 border border-[#e2e8f0] rounded-lg px-3 py-2 focus:border-blue-500 outline-none shadow-sm font-medium text-center" placeholder="0" />
                                      </div>
                                   </td>
                                   <td className="px-4 py-4">
                                      <div className="flex justify-center">
                                         <input type="number" value={pt.claimInMonth || ''} onChange={(e) => handleArrayChange('solarInstallationPoints', idx, 'claimInMonth', e.target.value)} className="w-20 border border-[#e2e8f0] rounded-lg px-3 py-2 focus:border-blue-500 outline-none shadow-sm font-medium text-center" placeholder="0" />
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="h-2 bg-[#f8fafc] border-t border-[#e2e8f0]"></div>
                 </div>
              </section>

              {/* Table 3: Charges */}
              <section ref={sectionRefs.charges} className="scroll-mt-6">
                 <div className="flex justify-between items-center mb-4 pt-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> Solar Installation Charges</h4>
                 </div>
                 <div className="border border-[#64748b] rounded-t-xl overflow-hidden shadow-md mb-8">
                    <div className="bg-[#64748b] p-3 flex items-center gap-2 text-white font-bold text-sm">
                       <MapPin className="w-4 h-4 text-white/80" /> Installation Charge Settings
                    </div>
                    <div className="overflow-x-auto bg-white border-l border-r border-[#e2e8f0]">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                             <tr className="text-[11px] font-black text-[#64748b] uppercase tracking-wider">
                                <th className="px-4 py-6 text-center border-r border-[#e2e8f0] w-20">Active</th>
                                <th className="px-6 py-6 border-r border-[#e2e8f0]">Type Label / Category</th>
                                <th className="px-6 py-6 text-center w-64">Charges (₹/KW)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-bold">
                             {formData.solarInstallationCharges.map((c, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                   <td className="px-4 py-4 text-center border-r border-[#e2e8f0]">
                                      <input type="checkbox" checked={c.active} onChange={(e) => handleArrayChange('solarInstallationCharges', idx, 'active', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                                   </td>
                                   <td className="px-6 py-4 border-r border-[#e2e8f0] text-gray-800 font-black">
                                      {c.typeLabel}
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1.5 text-[#94a3b8]">
                                         <span className="text-lg">₹</span>
                                         <input type="number" value={c.chargesPerKw || ''} onChange={(e) => handleArrayChange('solarInstallationCharges', idx, 'chargesPerKw', e.target.value)} className="w-48 border border-[#e2e8f0] rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 outline-none shadow-sm font-medium" placeholder="0" />
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="h-2 bg-[#f8fafc] border-t border-[#e2e8f0]"></div>
                 </div>
              </section>
            </div>
            
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                  <span className="font-bold text-gray-700">{formData.isActive ? 'Agency Plan is Active' : 'Agency Plan is Inactive'}</span>
                </label>
                <button onClick={handleSave} className="bg-[#0070cc] hover:bg-blue-700 text-white font-black px-12 py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                   <Rocket className="w-5 h-5" /> {isNew ? 'Create Agency Plan' : 'Update Agency Plan'}
                </button>
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-4">
            <div className="p-6 text-white text-center transition-all bg-[#0070cc]" style={{ backgroundColor: formData.planColor }}>
              <h3 className="text-xl font-black tracking-widest uppercase">{formData.name || 'AGENCY PLAN'}</h3>
              <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">Summary View</p>
            </div>
            <div className="p-6 space-y-8">
               <div className="text-center border-b border-gray-100 pb-6">
                  <div className="text-4xl font-black text-gray-800 flex justify-center items-baseline">
                     <span className="text-xl mr-1 opacity-40">₹</span>
                     <input type="number" name="signupFees" value={formData.signupFees} onChange={handleInputChange} className="w-32 bg-transparent text-center outline-none" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Signup Fees</p>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                     <div className="flex items-center gap-2"><CircleUserRound size={16} className="text-blue-600" /> Accounts</div>
                     <div className="text-gray-800">{formData.userLimits} Users</div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                     <div className="flex items-center gap-2"><LayoutGrid size={16} className="text-blue-600" /> Configs</div>
                     <div className="text-gray-800 font-black">{formData.assignedProjectTypes.filter(r => r.active).length}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                     <div className="flex items-center gap-2"><Star size={16} className="text-blue-600" /> Total Pts</div>
                     <div className="text-gray-800 font-black">{formData.solarInstallationPoints.reduce((sum, pt) => sum + (parseFloat(pt.points) || 0), 0)}</div>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase">Deposit Fees</label>
                  <div className="flex items-baseline font-black text-xl text-gray-700">
                     <span className="text-xs mr-1">₹</span>
                     <input type="number" name="depositFees" value={formData.depositFees} onChange={handleInputChange} className="w-full bg-transparent outline-none" />
                  </div>
               </div>

               <button className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-black">
                  UPGRADE AGENCY
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyPlan;
