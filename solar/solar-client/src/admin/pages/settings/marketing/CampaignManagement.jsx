import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, Trash2, Layout, Globe, IndianRupee, BarChart2, Facebook, Instagram, Twitter, Linkedin, Search, MapPin, Target, Layers, Users, CheckSquare } from 'lucide-react';
import {
  getCampaignConfig,
  updateCampaignConfig,
  getAllCampaignConfigs,
  deleteCampaignConfig,
  getAllSocialPlatforms,
  createSocialPlatform,
  updateSocialPlatform,
  deleteSocialPlatform
} from '../../../../api/campaigns';
import { locationAPI } from '../../../../api/api';
import {
  getCountries,
  getStates,
  getClustersHierarchy,
  getDistrictsHierarchy
} from '../../../../services/core/locationApi';
import {
  getPartners,
  getPartnerPlans
} from '../../../../services/partner/partnerApi';
import toast from 'react-hot-toast';

const DEFAULT_PLATFORMS = [
  'Google', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter / X', 'TikTok',
  'YouTube', 'Pinterest', 'Snapchat', 'Reddit', 'Quora', 'Threads',
  'WhatsApp Business', 'Telegram', 'Discord', 'Medium', 'Substack'
];

const renderPlatformIcon = (platformName, size = 16) => {
  const name = (platformName || '').toLowerCase();
  if (name.includes('facebook')) return <Facebook size={size} className="text-blue-600" />;
  if (name.includes('instagram')) return <Instagram size={size} className="text-pink-600" />;
  if (name.includes('twitter') || name === 'x') return <Twitter size={size} className="text-blue-400" />;
  if (name.includes('linkedin')) return <Linkedin size={size} className="text-blue-700" />;
  
  const firstLetter = (platformName || 'O')[0].toUpperCase();
  return (
    <div 
      className="rounded flex items-center justify-center font-bold shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
      style={{ width: size, height: size, fontSize: size * 0.7 }}
    >
      {firstLetter}
    </div>
  );
};

const CampaignManagement = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    campaignTypes: [],
    conversions: {},
    cprmConversion: 0,
    companyConversion: 0,
    defaultCompanyBudget: 0,
    defaultCprmBudget: 0,
    country: '',
    state: '',
    cluster: '',
    district: '',
    partnerType: '',
    plans: []
  });

  const [socialPlatforms, setSocialPlatforms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [plans, setPlans] = useState([]);
  const [campaignConfigs, setCampaignConfigs] = useState([]);
  const [newType, setNewType] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [configRes, socialRes, countriesData, partnersData, allConfigsRes] = await Promise.all([
        getCampaignConfig(),
        getAllSocialPlatforms(),
        getCountries(),
        getPartners(),
        getAllCampaignConfigs()
      ]);

      if (configRes.success && configRes.data) {
        const fetchedConfig = configRes.data;
        if (!fetchedConfig.campaignTypes) fetchedConfig.campaignTypes = [];
        if (!fetchedConfig.conversions) fetchedConfig.conversions = {};
        if (!fetchedConfig.plans) fetchedConfig.plans = [];
        // Reset all regional selections on refresh to ensure a clean start
        setConfig(prev => ({ 
          ...prev, 
          ...fetchedConfig, 
          country: '',
          state: '',
          cluster: '',
          district: '',
          partnerType: '' 
        }));
      }
      
      if (allConfigsRes.success) setCampaignConfigs(allConfigsRes.data);
      if (socialRes.success) setSocialPlatforms(socialRes.data);
      setCountries(countriesData || []);
      setPartners(partnersData || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const params = {};
      if (countryId && countryId !== 'all') params.countryId = countryId;
      const data = await getStates(params);
      setStates(data || []);
    } catch (error) {
      console.error('Failed to fetch states', error);
    }
  };

  const fetchClusters = async (stateId) => {
    try {
      const data = await getClustersHierarchy(stateId === 'all' ? undefined : stateId);
      setClusters(data || []);
    } catch (error) {
      console.error('Failed to fetch clusters', error);
    }
  };

  const fetchDistricts = async (clusterId) => {
    try {
      const data = await getDistrictsHierarchy(clusterId === 'all' ? undefined : clusterId);
      setDistricts(data || []);
    } catch (error) {
      console.error('Failed to fetch districts', error);
    }
  };

  const fetchPlans = async (partnerType, countryId, stateId, clusterId, districtId) => {
    try {
      const data = await getPartnerPlans(partnerType, stateId, countryId, clusterId, districtId);
      
      // Safety filter: Deduplicate by name as per other sections
      const uniqueData = [];
      const seenNames = new Set();
      data.forEach(plan => {
        if (!seenNames.has(plan.name)) {
          seenNames.add(plan.name);
          uniqueData.push(plan);
        }
      });
      setPlans(uniqueData || []);
      
      // Also try to load the config for this specific combination
      loadSpecificConfig(partnerType, countryId, stateId, clusterId, districtId);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };

  const loadSpecificConfig = async (partnerType, country, state, cluster, district) => {
    try {
       // Only fetch if we have some criteria
       if (!partnerType && !country) return;
       
       const params = {};
       if (country) params.country = country;
       if (state) params.state = state;
       if (cluster) params.cluster = cluster;
       if (district) params.district = district;
       if (partnerType) params.partnerType = partnerType;
       
       const res = await getCampaignConfig(params);
       if (res.success && res.data && res.data._id) {
          const fetched = res.data;
          setConfig(prev => ({
            ...prev,
            campaignTypes: fetched.campaignTypes || prev.campaignTypes,
            conversions: fetched.conversions || prev.conversions,
            plans: fetched.plans?.map(p => p._id || p) || []
          }));
       }
    } catch (error) {
      console.error("Failed to load specific config", error);
    }
  };

  // Cascading update handlers
  const handleCountryChange = (countryId) => {
    setConfig({ ...config, country: countryId, state: '', cluster: '', district: '', plans: [] });
    setStates([]);
    setClusters([]);
    setDistricts([]);
    setPlans([]);
    if (countryId) fetchStates(countryId);
  };

  const handleStateChange = (stateId) => {
    setConfig({ ...config, state: stateId, cluster: '', district: '', plans: [] });
    setClusters([]);
    setDistricts([]);
    setPlans([]);
    if (stateId) {
      fetchClusters(stateId);
      if (config.partnerType) fetchPlans(config.partnerType, config.country, stateId === 'all' ? undefined : stateId, '', '');
    }
  };

  const handleClusterChange = (clusterId) => {
    setConfig({ ...config, cluster: clusterId, district: '', plans: [] });
    setDistricts([]);
    setPlans([]);
    if (clusterId) {
      fetchDistricts(clusterId);
      if (config.partnerType) fetchPlans(config.partnerType, config.country, config.state, clusterId === 'all' ? undefined : clusterId, '');
    }
  };

  const handleDistrictChange = (districtId) => {
    setConfig({ ...config, district: districtId, plans: [] });
    if (districtId && config.partnerType) {
      fetchPlans(config.partnerType, config.country, config.state, config.cluster, districtId);
    }
  };

  const handlePartnerTypeChange = (partnerType) => {
    setConfig({ ...config, partnerType, plans: [] });
    if (partnerType) {
      fetchPlans(partnerType, config.country, config.state, config.cluster, config.district);
    } else {
      setPlans([]);
    }
  };

  const handlePlanToggle = (planId) => {
    const currentPlans = [...(config.plans || [])];
    const index = currentPlans.indexOf(planId);
    if (index > -1) {
      currentPlans.splice(index, 1);
    } else {
      currentPlans.push(planId);
    }
    setConfig({ ...config, plans: currentPlans });
  };

  const handleConfigSave = async () => {
    try {
      setLoading(true);

      // Auto-add pending type if exists
      let finalConfig = { ...config };
      if (newType.trim() && !config.campaignTypes.includes(newType.trim())) {
        finalConfig.campaignTypes = [...config.campaignTypes, newType.trim()];
        finalConfig.conversions = { ...config.conversions, [newType.trim()]: 0 };
        setConfig(finalConfig);
        setNewType('');
      }

      const res = await updateCampaignConfig(finalConfig);
      if (res.success) {
        setConfig({
          ...res.data,
          plans: res.data.plans?.map(p => p._id || p) || []
        });
        
        // Refresh the list
        const listRes = await getAllCampaignConfigs();
        if (listRes.success) setCampaignConfigs(listRes.data);
        
        toast.success('Campaign settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;
    try {
      setLoading(true);
      const res = await deleteCampaignConfig(id);
      if (res.success) {
        setCampaignConfigs(campaignConfigs.filter(c => c._id !== id));
        toast.success('Configuration removed');
      }
    } catch (error) {
      toast.error('Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = () => {
    if (!newType.trim()) return;
    if (config.campaignTypes.includes(newType.trim())) {
      toast.error('Type already exists');
      return;
    }
    const updatedConversions = { ...config.conversions };
    if (updatedConversions[newType.trim()] === undefined) {
      updatedConversions[newType.trim()] = 0;
    }
    setConfig({ 
      ...config, 
      campaignTypes: [...config.campaignTypes, newType.trim()],
      conversions: updatedConversions
    });
    setNewType('');
  };

  const handleRemoveType = (typeToRemove) => {
    const updatedConversions = { ...config.conversions };
    delete updatedConversions[typeToRemove];
    setConfig({
      ...config,
      campaignTypes: config.campaignTypes.filter(t => t !== typeToRemove),
      conversions: updatedConversions
    });
  };

  const handleConversionChange = (type, value) => {
    setConfig({
      ...config,
      conversions: {
        ...config.conversions,
        [type]: Number(value)
      }
    });
  };

  const handleAddPlatform = () => {
    if (!config.country || config.country === 'all' || !config.state || config.state === 'all' || !config.cluster || config.cluster === 'all' || !config.district || config.district === 'all') {
      toast.error('Please select Country, State, Cluster, and District from the region selection above to add a platform.');
      return;
    }

    const countryObj = countries.find(c => c._id === config.country);
    const stateObj = states.find(s => s._id === config.state);
    const clusterObj = clusters.find(c => c._id === config.cluster);
    const districtObj = districts.find(d => d._id === config.district);

    const newPlatform = {
      _id: 'temp-' + Date.now(),
      platform: '',
      status: 'Active',
      quarter: 'January-March',
      budget: 0,
      country: countryObj ? { _id: countryObj._id, name: countryObj.name } : null,
      state: stateObj ? { _id: stateObj._id, name: stateObj.name } : null,
      cluster: clusterObj ? { _id: clusterObj._id, name: clusterObj.name || clusterObj.clusterName } : null,
      district: districtObj ? { _id: districtObj._id, name: districtObj.name || districtObj.districtName } : null,
      isNew: true,
      isModified: true
    };

    setSocialPlatforms([...socialPlatforms, newPlatform]);
  };

  const handleLocalUpdate = (id, updates) => {
    setSocialPlatforms(socialPlatforms.map(p => 
      p._id === id ? { ...p, ...updates, isModified: true } : p
    ));
  };

  const handleCampaignLocalUpdate = (id, updates) => {
    setCampaignConfigs(campaignConfigs.map(c => 
      c._id === id ? { ...c, ...updates, isModified: true } : c
    ));
  };

  const handleSaveCampaignBudget = async (id) => {
    const row = campaignConfigs.find(c => c._id === id);
    if (!row) return;

    try {
      setLoading(true);
      const res = await updateCampaignConfig(row);
      if (res.success) {
        setCampaignConfigs(campaignConfigs.map(c => c._id === id ? { ...res.data, isModified: false } : c));
        toast.success('Campaign budget updated');
      }
    } catch (error) {
      toast.error('Failed to update campaign budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlatform = async (id) => {
    const row = socialPlatforms.find(p => p._id === id);
    if (row && row.isNew) {
       setSocialPlatforms(socialPlatforms.filter(p => p._id !== id));
       return;
    }
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    try {
      const res = await deleteSocialPlatform(id);
      if (res.success) {
        setSocialPlatforms(socialPlatforms.filter(p => p._id !== id));
        toast.success('Platform deleted');
      }
    } catch (error) {
      toast.error('Failed to delete platform');
    }
  };

  const filteredPlatforms = socialPlatforms.filter(p => {
    let match = true;
    if (config.country && config.country !== 'all') {
      const pCountryId = p.country?._id || p.country;
      if (pCountryId !== config.country) match = false;
    }
    if (config.state && config.state !== 'all') {
      const pStateId = p.state?._id || p.state;
      if (pStateId !== config.state) match = false;
    }
    if (config.cluster && config.cluster !== 'all') {
      const pClusterId = p.cluster?._id || p.cluster;
      if (pClusterId !== config.cluster) match = false;
    }
    if (config.district && config.district !== 'all') {
      const pDistrictId = p.district?._id || p.district;
      if (pDistrictId !== config.district) match = false;
    }
    return match;
  });

  const filteredCampaignConfigs = campaignConfigs.filter(c => {
    let match = true;
    if (config.country && config.country !== 'all') {
      const pCountryId = c.country?._id || c.country;
      if (pCountryId !== config.country) match = false;
    }
    if (config.state && config.state !== 'all') {
      const pStateId = c.state?._id || c.state;
      if (pStateId !== config.state) match = false;
    }
    if (config.cluster && config.cluster !== 'all') {
      const pClusterId = c.cluster?._id || c.cluster;
      if (pClusterId !== config.cluster) match = false;
    }
    if (config.district && config.district !== 'all') {
      const pDistrictId = c.district?._id || c.district;
      if (pDistrictId !== config.district) match = false;
    }
    return match;
  });

  const getConfigCount = (level, id) => {
    return campaignConfigs.filter(c => {
       if (level === 'country') return (c.country?._id || c.country) === id;
       if (level === 'state') return (c.state?._id || c.state) === id;
       if (level === 'cluster') return (c.cluster?._id || c.cluster) === id;
       if (level === 'district') return (c.district?._id || c.district) === id;
       return false;
    }).length;
  };

  const calculateBudgetSummary = () => {
    const platformNames = [...new Set(filteredPlatforms.map(p => p.platform))].join(', ');
    const clusterNames = [...new Set(filteredPlatforms.map(p => p.cluster?.name || p.cluster?.clusterName).filter(Boolean))].join(', ');
    const stateNames = [...new Set(filteredPlatforms.map(p => p.state?.name).filter(Boolean))].join(', ');
    const totalBudget = filteredPlatforms.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const totalPlatforms = filteredPlatforms.length;

    return { platformNames, clusterNames, stateNames, totalBudget, totalPlatforms };
  };

  const TABS = [
    { id: 'settings', label: 'Campaign Settings' },
    { id: 'social', label: 'Social Media' },
    { id: 'budget', label: 'Budget Controls' },
  ];

  const { totalBudget, totalPlatforms } = calculateBudgetSummary();

  const unifiedBudgetData = useMemo(() => {
    const social = filteredPlatforms.map(p => ({
      ...p,
      rowType: 'Social',
      displayName: p.platform,
      uniqueKey: `social-${p._id}`
    }));
    
    const campaigns = filteredCampaignConfigs.map(c => ({
      ...c,
      rowType: 'Campaign',
      displayName: c.partnerType || 'General Campaign',
      uniqueKey: `campaign-${c._id}`
    }));
    
    return [...social, ...campaigns];
  }, [filteredPlatforms, filteredCampaignConfigs]);

  if (loading && config.campaignTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#e9ecef] min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-[#00669c] mb-6 px-4">Admin Campaign Management</h1>

      {/* Region Selection: Card Style */}
      <div className="bg-white rounded-lg p-8 mb-6 shadow-sm border border-gray-100 flex flex-col gap-10">
        
        {/* Country Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" /> Select Country
          </h2>
          <div className="flex flex-wrap gap-4">
            {countries.length > 0 && (
              <div
                onClick={() => handleCountryChange('all')}
                className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] transition-all bg-white border ${
                  config.country === 'all'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                <div className={`font-bold text-lg ${config.country === 'all' ? 'text-blue-600' : 'text-gray-800'}`}>
                  Select All
                </div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-wider font-semibold">
                  Global Region
                </div>
              </div>
            )}
            {countries.map((country) => {
              const count = getConfigCount('country', country._id);
              return (
              <div
                key={country._id}
                onClick={() => handleCountryChange(country._id)}
                className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] relative transition-all bg-white border ${
                  config.country === country._id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                {count > 0 && (
                   <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
                     {count}
                   </span>
                )}
                <div className={`font-bold text-lg ${config.country === country._id ? 'text-blue-600' : 'text-gray-800'}`}>
                  {country.name}
                </div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-wider font-semibold">
                  {country.code || country.name.substring(0, 3).toUpperCase()} Region
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* State Cards */}
        {config.country && states.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Select State
            </h2>
            <div className="flex flex-wrap gap-4">
              <div
                onClick={() => handleStateChange('all')}
                className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] transition-all bg-white border ${
                  config.state === 'all'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                <div className={`font-bold text-lg ${config.state === 'all' ? 'text-blue-600' : 'text-gray-800'}`}>
                  Select All
                </div>
                <div className="text-gray-400 text-xs mt-1 uppercase font-semibold">
                  All States
                </div>
              </div>
              {states.map((s) => {
                const count = getConfigCount('state', s._id);
                return (
                <div
                  key={s._id}
                  onClick={() => handleStateChange(s._id)}
                  className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] relative transition-all bg-white border ${
                    config.state === s._id
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  {count > 0 && (
                     <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
                       {count}
                     </span>
                  )}
                  <div className={`font-bold text-lg ${config.state === s._id ? 'text-blue-600' : 'text-gray-800'}`}>
                    {s.name}
                  </div>
                  <div className="text-gray-400 text-xs mt-1 uppercase font-semibold">
                    State Office
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Cluster Cards */}
        {config.state && clusters.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Select Cluster
            </h2>
            <div className="flex flex-wrap gap-4">
              <div
                onClick={() => handleClusterChange('all')}
                className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[160px] transition-all bg-white border ${
                  config.cluster === 'all'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                <div className={`font-bold ${config.cluster === 'all' ? 'text-blue-600' : 'text-gray-800'}`}>
                  Select All
                </div>
              </div>
              {clusters.map((c) => {
                const count = getConfigCount('cluster', c._id);
                return (
                <div
                  key={c._id}
                  onClick={() => handleClusterChange(c._id)}
                  className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[160px] relative transition-all bg-white border ${
                    config.cluster === c._id
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  {count > 0 && (
                     <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
                       {count}
                     </span>
                  )}
                  <div className={`font-bold ${config.cluster === c._id ? 'text-blue-600' : 'text-gray-800'}`}>
                    {c.name || c.clusterName}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* District Cards */}
        {config.cluster && districts.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" /> Select District
            </h2>
            <div className="flex flex-wrap gap-4">
              <div
                onClick={() => handleDistrictChange('all')}
                className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[160px] transition-all bg-white border ${
                  config.district === 'all'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                 <div className={`font-bold ${config.district === 'all' ? 'text-blue-600' : 'text-gray-800'}`}>
                  Select All
                </div>
              </div>
              {districts.map((d) => {
                const count = getConfigCount('district', d._id);
                return (
                <div
                  key={d._id}
                  onClick={() => handleDistrictChange(d._id)}
                  className={`cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[160px] relative transition-all bg-white border ${
                    config.district === d._id
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-300'
                  }`}
                >
                  {count > 0 && (
                     <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
                       {count}
                     </span>
                  )}
                   <div className={`font-bold ${config.district === d._id ? 'text-blue-600' : 'text-gray-800'}`}>
                    {d.name || d.districtName}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px] flex flex-col">
        {/* Tabs - Boxed style */}
        <div className="flex space-x-0 mb-10 border border-gray-200 rounded-lg w-fit overflow-hidden shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-8 font-semibold text-sm transition-all border-r last:border-r-0 ${activeTab === tab.id
                ? 'bg-[#f0f7ff] text-[#00669c] border-b-2 border-b-[#00669c]'
                : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'settings' && (
            <div className="space-y-12 animate-fadeIn text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Format */}
                {/* Remove format field as per user request */}

                {/* Partner and Plans Selection */}
                <div className="col-span-full space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          <Users size={18} className="text-blue-500" /> Partner Type
                        </label>
                        <select 
                          value={config.partnerType}
                          onChange={(e) => handlePartnerTypeChange(e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none text-gray-700 bg-white shadow-sm"
                        >
                          <option value="">Select Partner Type</option>
                          {partners.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          <CheckSquare size={18} className="text-blue-500" /> Available Plans (Multiple Selection)
                        </label>
                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-[180px] overflow-y-auto grid grid-cols-1 gap-2 shadow-inner">
                           {plans.length > 0 ? plans.map(plan => (
                             <div 
                                onClick={() => handlePlanToggle(plan._id)}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  config.plans?.includes(plan._id) ? 'bg-blue-100 border-blue-200 border' : 'bg-white border-gray-200 border hover:bg-gray-50'
                                }`}
                             >
                                <input 
                                  type="checkbox" 
                                  checked={config.plans?.includes(plan._id)}
                                  onChange={() => {}} // Handled by div click
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-gray-700">{plan.name}</span>
                             </div>
                           )) : (
                             <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">
                               {config.partnerType ? 'No plans found for this selection' : 'Select a partner type first'}
                             </div>
                           )}
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Types and Conversions Side-by-Side */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Layout size={20} className="text-[#00669c]" /> 
                    Campaign Types & Dynamic Conversion Ratio
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {config.campaignTypes.map((type, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-fadeInSlow">
                      <div className="md:col-span-6 flex items-center space-x-2">
                        <div className="flex-1 p-4 bg-white border border-gray-200 rounded-md text-gray-700 font-bold shadow-sm flex items-center justify-between">
                          <span>{type}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-1 flex items-center justify-center">
                        <div className="w-8 h-[2px] bg-gray-300 hidden md:block"></div>
                      </div>

                      <div className="md:col-span-4 flex items-center space-x-4">
                         <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 shadow-sm relative">
                            <div className="px-4 py-4 bg-gray-50 border-r border-gray-200 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                              {type} Conversion
                            </div>
                            <input
                              type="number"
                              value={config.conversions?.[type] || 0}
                              onChange={(e) => handleConversionChange(type, e.target.value)}
                              className="w-full p-4 outline-none text-right font-bold text-blue-600 pr-12"
                            />
                            <div className="absolute right-4 text-blue-400 font-bold text-lg pointer-events-none">%</div>
                         </div>
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => handleRemoveType(type)}
                          className="p-3 text-gray-400 hover:text-red-500 transition-all bg-gray-50 rounded-full hover:bg-red-50 shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-4">
                    <div className="md:col-span-6 flex items-center space-x-2">
                      <input
                        type="text"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="flex-1 p-4 border border-dashed border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none text-gray-700 bg-gray-50/30"
                        placeholder="Add new campaign type..."
                      />
                    </div>
                    <div className="md:col-span-1"></div>
                    <div className="md:col-span-4">
                      <button
                        onClick={handleAddType}
                        className="w-full flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-md font-bold"
                      >
                        <Plus size={20} />
                        <span>Add New Type</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex justify-start">
                <button
                  onClick={handleConfigSave}
                  disabled={loading}
                  className="flex items-center space-x-2 py-3 px-8 bg-[#28a745] text-white rounded font-bold text-sm hover:bg-green-700 transition-all shadow-md"
                >
                  <Save size={18} />
                  <span>Save All Settings</span>
                </button>
              </div>

              {/* Table showing all created plans/configs */}
              <div className="mt-16 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={20} className="text-[#00669c]" /> 
                    Configured Campaign Settings & Regional Plans
                  </h2>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[1000px]">
                      <thead className="bg-[#f8f9fa] text-xs font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                         <tr>
                            <th className="px-6 py-4">Country/State</th>
                            <th className="px-6 py-4">Cluster/District</th>
                            <th className="px-6 py-4">Partner Type</th>
                            <th className="px-6 py-4">Selected Plans</th>
                            <th className="px-6 py-4">Conversions</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm font-medium">
                         {filteredCampaignConfigs.length > 0 ? filteredCampaignConfigs.map(c => (
                           <tr key={c._id} className="hover:bg-gray-50/50 transition-all">
                              <td className="px-6 py-4">
                                <div className="text-gray-900 font-bold">{c.country?.name || 'All'}</div>
                                <div className="text-gray-400 text-xs">{c.state?.name || 'All States'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-700">{c.cluster?.name || c.cluster?.clusterName || 'All Clusters'}</div>
                                <div className="text-gray-400 text-xs lowercase italic">{c.district?.name || c.district?.districtName || 'all districts'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{c.partnerType || 'All Partners'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[250px]">
                                  {c.plans && c.plans.length > 0 ? c.plans.map((p, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{p.name || p}</span>
                                  )) : <span className="text-gray-300 italic">No plans selected</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="space-y-1">
                                    {Object.entries(c.conversions || {}).map(([type, val]) => (
                                      <div key={type} className="flex items-center justify-between text-xs min-w-[100px]">
                                        <span className="text-gray-500">{type}:</span>
                                        <span className="font-bold text-blue-600">{val}%</span>
                                      </div>
                                    ))}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <button 
                                  onClick={() => handleDeleteConfig(c._id)}
                                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </td>
                           </tr>
                         )) : (
                           <tr>
                              <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                                No configurations saved yet.
                              </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-[#f8f9fa] text-xs font-bold text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4">Quarter</th>
                      <th className="px-6 py-4">Budget</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium text-sm">
                    {filteredPlatforms.map((p, idx) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {renderPlatformIcon(p.platform, 16)}
                            <input
                              value={p.platform}
                              onChange={(e) => handleLocalUpdate(p._id, { platform: e.target.value })}
                              className={`bg-transparent border-b ${p.isModified ? 'border-blue-400' : 'border-dashed border-gray-300'} focus:border-blue-500 outline-none w-32 px-1 py-0.5 text-sm font-semibold text-gray-700`}
                              placeholder="Type platform..."
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleLocalUpdate(p._id, { status: p.status === 'Active' ? 'Inactive' : 'Active' })}
                            className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${p.status === 'Active'
                              ? 'bg-[#28a745] text-white'
                              : 'bg-gray-200 text-gray-600'
                              }`}
                          >
                            {p.status}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={p.quarter}
                            onChange={(e) => handleLocalUpdate(p._id, { quarter: e.target.value })}
                            className={`bg-transparent outline-none border ${p.isModified ? 'border-blue-300' : 'border-gray-300'} rounded-md p-2 text-sm`}
                          >
                            <option value="January-March">January-March</option>
                            <option value="April-June">April-June</option>
                            <option value="July-September">July-September</option>
                            <option value="October-December">October-December</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={p.budget}
                            onChange={(e) => handleLocalUpdate(p._id, { budget: Number(e.target.value) })}
                            className={`w-24 border ${p.isModified ? 'border-blue-300' : 'border-gray-300'} rounded-md p-2 text-sm outline-none`}
                            placeholder="Budget"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-4">
                            <button 
                              onClick={() => handleSaveRow(p._id)}
                              className={`text-sm font-bold transition-colors ${p.isModified || p.isNew ? 'text-blue-600 hover:text-blue-800' : 'text-[#28a745] hover:opacity-80'}`}
                            >
                              {p.isModified || p.isNew ? 'Save' : 'Done'}
                            </button>
                            <button
                              onClick={() => handleDeletePlatform(p._id)}
                              className="text-red-400 hover:text-red-600 transition-all border border-red-200 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={handleAddPlatform}
                  className="flex items-center space-x-2 py-2.5 px-6 bg-[#28a745] text-white rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
                >
                  <Plus size={18} />
                  <span>Add New Platform</span>
                </button>
              </div>

              {/* Dynamic Platform Summary Cards */}
              <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <BarChart2 className="text-[#00669c]" size={20} />
                    <span>Platform Wise Budget Summary</span>
                  </h3>
                  <div className="bg-[#00669c] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Total Platforms: {filteredPlatforms.length}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto text-left">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-[#f8f9fa] text-xs font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Platform</th>
                        <th className="px-6 py-4">Location Area</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4">Quarter</th>
                        <th className="px-6 py-4 text-right">Budget</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm font-medium text-gray-800">
                      {filteredPlatforms.length > 0 ? filteredPlatforms.map((p, idx) => (
                        <tr key={p._id || idx} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {renderPlatformIcon(p.platform, 18)}
                              <span className="font-bold text-gray-700">{p.platform}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                               <div className="flex justify-between items-center w-full min-w-[180px]">
                                 <span className="text-gray-400 font-semibold mr-4">Country:</span>
                                 <span className="text-gray-800 font-bold">{p.country?.name || 'N/A'}</span>
                               </div>
                               <div className="flex justify-between items-center w-full">
                                 <span className="text-gray-400 font-semibold mr-4">State:</span>
                                 <span className="text-gray-800 font-bold">{p.state?.name || 'N/A'}</span>
                               </div>
                               <div className="flex justify-between items-center w-full">
                                 <span className="text-gray-400 font-semibold mr-4">Cluster:</span>
                                 <span className="text-gray-800 font-bold">{p.cluster?.name || p.cluster?.clusterName || 'N/A'}</span>
                               </div>
                               <div className="flex justify-between items-center w-full">
                                 <span className="text-gray-400 font-semibold mr-4">District:</span>
                                 <span className="text-gray-800 font-bold">{p.district?.name || p.district?.districtName || 'N/A'}</span>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase ${p.status === 'Active' ? 'bg-[#28a745]' : 'bg-gray-400'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#00669c]">{p.quarter}</td>
                          <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                            <span className="text-sm mr-1 text-gray-500">₹</span>
                            {Number(p.budget).toLocaleString() || '0'}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No platforms added yet. Add a platform above to see the summary.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md shadow-sm mb-6 flex items-center gap-3">
                 <MapPin size={20} className="mt-0.5" />
                 <span className="font-semibold text-[15px]">
                    Location: {
                      [
                        countries.find(c => c._id === config.country)?.name || 'All Countries',
                        states.find(s => s._id === config.state)?.name || 'All States',
                        clusters.find(c => c._id === config.cluster)?.name || clusters.find(c => c._id === config.cluster)?.clusterName || 'All Clusters',
                        districts.find(d => d._id === config.district)?.name || districts.find(d => d._id === config.district)?.districtName || 'All Districts'
                      ].join(' — ')
                    }
                 </span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto">
                <div className="bg-[#f8f9fa] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                   <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" /> Unified Budget Management
                   </h3>
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Total Entries: {unifiedBudgetData.length}
                   </div>
                </div>
                <table className="w-full text-left min-w-[1200px]">
                  <thead className="bg-[#f8f9fa] text-[10px] font-bold text-gray-500 border-b border-gray-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Name / Platform</th>
                      <th className="px-6 py-4">Location Details</th>
                      <th className="px-6 py-4">Partner & Plans</th>
                      <th className="px-6 py-4">Conversions</th>
                      <th className="px-6 py-4 text-center">Budget (₹)</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium text-[13px]">
                    {unifiedBudgetData.length > 0 ? unifiedBudgetData.map((row) => (
                      <tr key={row.uniqueKey} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                             row.rowType === 'Social' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                              {row.rowType}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {row.rowType === 'Social' ? renderPlatformIcon(row.displayName, 18) : <Target size={18} className="text-orange-400" />}
                            <span className="font-bold text-gray-800">{row.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {row.rowType === 'Campaign' ? (
                             <div className="space-y-0.5">
                                <div className="text-gray-900 font-bold">{row.country?.name || 'All'}</div>
                                <div className="text-gray-400 text-[11px]">{row.state?.name || 'All States'}</div>
                                <div className="text-[10px] text-gray-400 italic">
                                   {row.cluster?.name || row.cluster?.clusterName || 'All'} / {row.district?.name || row.district?.districtName || 'All'}
                                </div>
                             </div>
                           ) : <span className="text-gray-300 italic">-</span>}
                        </td>
                        <td className="px-6 py-4">
                           {row.rowType === 'Campaign' ? (
                             <div className="flex flex-col gap-1">
                                <span className="text-blue-600 font-bold">{row.partnerType}</span>
                                <div className="flex flex-wrap gap-1">
                                   {row.plans?.map((p, i) => (
                                      <span key={i} className="text-[9px] text-gray-400 border border-gray-100 px-1 rounded bg-gray-50">{p.name || p}</span>
                                   ))}
                                </div>
                             </div>
                           ) : <span className="text-gray-300 italic">-</span>}
                        </td>
                        <td className="px-6 py-4">
                           {row.rowType === 'Campaign' ? (
                             <div className="space-y-1">
                                {Object.entries(row.conversions || {}).map(([type, val]) => (
                                  <div key={type} className="flex items-center justify-between text-[11px] min-w-[110px]">
                                    <span className="text-gray-400">{type}:</span>
                                    <span className="font-bold text-blue-500">{val}%</span>
                                  </div>
                                ))}
                             </div>
                           ) : (
                             <div className="text-gray-400 text-[11px] italic">
                               Quarterly: <span className="text-gray-600 font-bold">{row.quarter}</span>
                             </div>
                           )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="relative w-36">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                value={row.budget || 0}
                                onChange={(e) => row.rowType === 'Social' 
                                  ? handleLocalUpdate(row._id, { budget: Number(e.target.value) })
                                  : handleCampaignLocalUpdate(row._id, { budget: Number(e.target.value) })
                                }
                                className={`w-full border ${row.isModified ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/30' : 'border-gray-200'} rounded-md py-2 px-8 text-sm outline-none text-right font-bold transition-all text-gray-800 shadow-inner`}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => row.rowType === 'Social' ? handleSaveRow(row._id) : handleSaveCampaignBudget(row._id)}
                             disabled={!row.isModified}
                             className={`text-xs py-1.5 px-6 rounded-md font-bold transition-all shadow-sm ${
                               row.isModified 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-100 text-gray-400 cursor-default'
                             }`}
                           >
                             {row.isModified ? 'Sync Budget' : 'Synced'}
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center">
                           <div className="flex flex-col items-center gap-2 text-gray-400">
                              <Search size={40} className="opacity-20" />
                              <p className="italic">No budget data available for the current selection.</p>
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-6 bg-white rounded-lg p-8 shadow-sm border border-gray-200 flex justify-center">
        <p className="text-base font-semibold text-gray-700 tracking-wide">
          Copyright © {new Date().getFullYear()} Solarkits. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default CampaignManagement;