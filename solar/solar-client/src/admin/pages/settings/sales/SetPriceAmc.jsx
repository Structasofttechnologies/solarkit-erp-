import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, RefreshCw, MapPin, Layers, Save, X, Trash2, Edit } from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import salesSettingsService from '../../../../services/settings/salesSettingsApi';
import { productApi } from '../../../../api/productApi';

const LocationCard = ({ title, subtitle, isSelected, onClick, isState, count }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-md transition-all cursor-pointer flex flex-col items-center justify-center text-center h-20 shadow-sm relative hover:shadow-md ${
      isSelected
      ? isState ? 'border-2 border-[#007bff] bg-[#8ccdfa]' : 'border-2 border-[#007bff] bg-white'
      : 'border border-gray-200 bg-white'
      }`}
  >
    {count > 0 && (
      <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
        {count}
      </span>
    )}
    <div className="font-bold text-[14px] text-[#2c3e50] mb-0">{title}</div>
    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

export default function SetPriceAmc() {
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('');
  
  // Dynamic filter lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [projectTypesList, setProjectTypesList] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [subProjectTypesList, setSubProjectTypesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [allPlansForCount, setAllPlansForCount] = useState([]);
  
  const [filters, setFilters] = useState({
    category: 'All Categories',
    subCategory: 'All Sub Categories',
    projectType: 'All Project Types',
    subProjectType: 'All Sub Types',
    brand: 'All Brands',
    productType: 'All Products'
  });

  const [solarKits, setSolarKits] = useState([]);
  const [amcPlans, setAmcPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const { countries, states, districts, clusters, fetchStates, fetchDistricts, fetchClusters } = useLocations();
  const selectedStateObj = states.find((s) => s._id === selectedStateId) || null;
  const selectedClusterObj = clusters.find((c) => c._id === selectedClusterId) || null;
  const selectedDistrictObj = districts.find((d) => d._id === selectedDistrictId) || null;

  // 1. Fetch Dynamic Filter Data on Mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const results = await Promise.allSettled([
          productApi.getCategories(),
          productApi.getSubCategories(),
          productApi.getProjectTypes(),
          productApi.getSubProjectTypes(),
          productApi.getBrands(),
          productApi.getAll(),
          productApi.getProjectCategoryMappings(),
          salesSettingsService.getAMCPlans({})
        ]);
        
        const safeExtract = (result) => {
            if (result.status !== 'fulfilled') return [];
            const val = result.value;
            if (Array.isArray(val)) return val;
            if (val && Array.isArray(val.data)) return val.data;
            if (val && val.data && Array.isArray(val.data.data)) return val.data.data;
            return [];
        };
        
        setCategoriesList(safeExtract(results[0]));
        setSubCategoriesList(safeExtract(results[1]));
        setProjectTypesList(safeExtract(results[2]));
        setSubProjectTypesList(safeExtract(results[3]));
        setBrandsList(safeExtract(results[4]));
        setProductsList(safeExtract(results[5]));
        setMappingsList(safeExtract(results[6]));
        setAllPlansForCount(safeExtract(results[7]));

      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  // 2. Location Selection Handlers
  const handleCountrySelect = (countryId) => {
    setSelectedCountryId(countryId);
    setSelectedStateId('');
    setSelectedClusterId('');
    setSelectedDistrictId('');
    if (countryId && countryId !== 'all') fetchStates({ countryId });
  };

  const handleStateSelect = (stateId) => {
    setSelectedStateId(stateId);
    setSelectedClusterId('');
    setSelectedDistrictId('');
    if (stateId && stateId !== 'all') fetchClusters({ stateId });
  };

  const handleClusterSelect = (clusterId) => {
    setSelectedClusterId(clusterId);
    setSelectedDistrictId('');
    if (clusterId && clusterId !== 'all') fetchDistricts({ clusterId });
  };

  const handleDistrictSelect = (districtId) => setSelectedDistrictId(districtId);

  useEffect(() => {
    fetchPrices();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, filters]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const query = {};
      if (selectedCountryId && selectedCountryId !== 'all') query.country = selectedCountryId;
      if (selectedStateId && selectedStateId !== 'all') query.state = selectedStateId;
      if (selectedClusterId && selectedClusterId !== 'all') query.cluster = selectedClusterId;
      if (selectedDistrictId && selectedDistrictId !== 'all') query.district = selectedDistrictId;

      if (filters.category !== 'All Categories') query.category = filters.category;
      if (filters.subCategory !== 'All Sub Categories') query.subCategory = filters.subCategory;
      if (filters.projectType !== 'All Project Types') query.projectType = filters.projectType;
      if (filters.subProjectType !== 'All Sub Types') query.subProjectType = filters.subProjectType;

      const plans = await salesSettingsService.getAMCPlans(query);
      setAmcPlans(plans || []);
      
      if (solarKits.length === 0) {
        const kitsData = await salesSettingsService.getSolarKits();
        const uniqueConfigs = [];
        const seen = new Set();
        (kitsData || []).forEach(kit => {
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
      }
    } catch (error) {
      console.error("Error fetching AMC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayConfigurations = React.useMemo(() => {
    const plansByConfig = {};
    amcPlans.forEach(plan => {
      const key = `${plan.category || ''}|${plan.subCategory || ''}|${plan.projectType || ''}|${plan.subProjectType || ''}`;
      if (!plansByConfig[key]) plansByConfig[key] = plan;
    });

    return solarKits.map(kit => {
      const key = `${kit.category || ''}|${kit.subCategory || ''}|${kit.projectType || ''}|${kit.subProjectType || ''}`;
      return {
        ...kit,
        plan: plansByConfig[key] || null
      };
    });
  }, [solarKits, amcPlans]);

  const getAmcSummary = (plan) => {
    if (!plan) return '-';
    const visits = plan.monthlyVisits > 0 
      ? `${plan.monthlyVisits} visit/month` 
      : (plan.annualVisits ? `${plan.annualVisits} visits/year` : '-');
    const serviceNames = plan.services?.map(s => s.serviceName).slice(0, 2).join(', ');
    const moreServices = plan.services?.length > 2 ? '...' : '';
    return `${plan.paymentType || ''}, ${plan.amcDuration || ''}M, ${visits} | ${serviceNames}${moreServices}`;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      if (filterName === 'category') newFilters.subCategory = 'All Sub Categories';
      if (filterName === 'projectType') newFilters.subProjectType = 'All Sub Types';
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All Categories',
      subCategory: 'All Sub Categories',
      projectType: 'All Project Types',
      subProjectType: 'All Sub Types',
      brand: 'All Brands',
      productType: 'All Products'
    });
  };

  const handleDeletePrice = async (id) => {
    if (window.confirm("Are you sure you want to delete this AMC plan?")) {
      try {
        await salesSettingsService.deleteAMCPlan(id);
        setAmcPlans(prev => prev.filter(item => item._id !== id));
      } catch (error) {
        console.error("Error deleting AMC plan:", error);
        alert("Failed to delete AMC plan");
      }
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-[22px] font-bold text-[#14233c] mb-2">Set Price for AMC</h1>
        <button
          onClick={() => setShowLocationCards(!showLocationCards)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0076a8] text-white rounded text-xs font-bold shadow-sm hover:bg-blue-800 transition-all"
        >
          {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />} {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 pb-20">
        {showLocationCards && (
          <div className="space-y-10 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Country</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <LocationCard title="All Countries" subtitle="ALL" isSelected={selectedCountryId === 'all' || selectedCountryId === ''} onClick={() => handleCountrySelect('all')} />
                {countries.map(c => <LocationCard key={c._id} title={c.name} subtitle={c.code || c.name.substring(0, 2).toUpperCase()} isSelected={selectedCountryId === c._id} onClick={() => handleCountrySelect(c._id)} count={allPlansForCount.filter(p => (p.country?._id || p.country) === c._id || (p.country?.includes?.(c._id))).length} />)}
              </div>
            </div>

            {selectedCountryId && selectedCountryId !== 'all' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select State</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All States" subtitle="ALL" isSelected={selectedStateId === 'all' || selectedStateId === ''} onClick={() => handleStateSelect('all')} />
                  {states.map(s => <LocationCard key={s._id} title={s.name} subtitle={s.code || s.name.substring(0, 2).toUpperCase()} isSelected={selectedStateId === s._id} onClick={() => handleStateSelect(s._id)} isState={true} count={allPlansForCount.filter(p => (p.state?._id || p.state) === s._id || (p.state?.includes?.(s._id))).length} />)}
                </div>
              </div>
            )}

            {selectedStateId && selectedStateId !== 'all' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Cluster</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All Clusters" subtitle="ALL" isSelected={selectedClusterId === 'all' || selectedClusterId === ''} onClick={() => handleClusterSelect('all')} />
                  {clusters.map(c => <LocationCard key={c._id} title={c.name} subtitle={selectedStateObj?.code || 'CL'} isSelected={selectedClusterId === c._id} onClick={() => handleClusterSelect(c._id)} count={allPlansForCount.filter(p => (p.cluster?._id || p.cluster) === c._id || (p.cluster?.includes?.(c._id))).length} />)}
                </div>
              </div>
            )}

            {selectedClusterId && selectedClusterId !== 'all' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select District</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All Districts" subtitle="ALL" isSelected={selectedDistrictId === 'all' || selectedDistrictId === ''} onClick={() => handleDistrictSelect('all')} />
                  {districts.map(d => <LocationCard key={d._id} title={d.name} subtitle={selectedClusterObj?.name || 'DT'} isSelected={selectedDistrictId === d._id} onClick={() => handleDistrictSelect(d._id)} count={allPlansForCount.filter(p => (p.district?._id || p.district) === d._id || (p.districts?.some(dist => (dist._id || dist) === d._id))).length} />)}
                </div>
              </div>
            )}
          </div>
        )}

          <>
            <div className="bg-white rounded-lg shadow-sm mb-6 p-6 border border-gray-100">
              <h5 className="mb-4 text-xl font-bold text-gray-800">Selected Location</h5>
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#0076a8] text-white px-4 py-2 rounded font-bold text-sm">State: {selectedStateObj?.name || 'All'}</span>
                <span className="bg-[#0d6efd] text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-1"><Layers size={14} /> Cluster: {selectedClusterObj?.name || 'All'}</span>
                <span className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-1"><MapPin size={14} /> District: {selectedDistrictObj?.name || 'All'}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-8">
              <h5 className="font-bold text-[#14233c] mb-4 text-[15px]">Project Type Filters</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[13px] text-gray-600 mb-1.5">Category</label>
                  <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white focus:outline-none" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                    <option>All Categories</option>
                    {categoriesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] text-gray-600 mb-1.5">Sub Category</label>
                  <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white focus:outline-none" value={filters.subCategory} onChange={(e) => handleFilterChange('subCategory', e.target.value)} disabled={filters.category === 'All Categories'}>
                    <option>All Sub Categories</option>
                    {subCategoriesList.filter(sc => filters.category === 'All Categories' || sc.categoryId?.name === filters.category).map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] text-gray-600 mb-1.5">Project Type</label>
                  <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white focus:outline-none" value={filters.projectType} onChange={(e) => handleFilterChange('projectType', e.target.value)}>
                    <option>All Project Types</option>
                    {mappingsList.filter(m => (filters.category === 'All Categories' || m.categoryId?.name === filters.category) && (filters.subCategory === 'All Sub Categories' || m.subCategoryId?.name === filters.subCategory)).map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`).filter((v, i, a) => a.indexOf(v) === i).map((range, i) => <option key={i} value={range}>{range}</option>)}
                    {projectTypesList.length > 0 && <option disabled>──────────</option>}
                    {projectTypesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] text-gray-600 mb-1.5">Sub Project Type</label>
                  <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white focus:outline-none" value={filters.subProjectType} onChange={(e) => handleFilterChange('subProjectType', e.target.value)} disabled={filters.projectType === 'All Project Types'}>
                    <option>All Sub Types</option>
                    {subProjectTypesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[1200px]">
                  <thead className="bg-[#343a40] text-white">
                    <tr>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Category</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Sub Category</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Project Type</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Sub Project Type</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Services</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Pricing & Schedule</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider">Status</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider w-32">Basic Price/KW (₹)</th>
                      <th className="p-2 border-r border-white/20 text-center text-[10px] font-bold uppercase tracking-wider w-32">AMC Charges (₹)</th>
                      <th className="p-2 text-center text-[10px] font-bold uppercase tracking-wider w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="10" className="text-center py-10 text-gray-400 font-medium">Loading AMC plans...</td></tr>
                    ) : displayConfigurations.length === 0 ? (
                      <tr><td colSpan="10" className="text-center py-10 text-gray-400 font-medium">No configurations found.</td></tr>
                    ) : (
                      displayConfigurations.map((config, idx) => {
                        const plan = config.plan;
                        const isConfigured = !!plan;
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-[11px]">
                            <td className="p-2 border-r border-gray-100 text-center font-bold text-[#14233c]">{config.category}</td>
                            <td className="p-2 border-r border-gray-100 text-center">{config.subCategory}</td>
                            <td className="p-2 border-r border-gray-100 text-center font-medium">{config.projectType}</td>
                            <td className="p-2 border-r border-gray-100 text-center">{config.subProjectType}</td>
                            <td className="p-2 border-r border-gray-100 text-center">
                              {isConfigured ? (
                                <div className="flex flex-wrap justify-center gap-1">
                                  {plan.services?.map((s, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-100 whitespace-nowrap">{s.serviceName}</span>
                                  ))}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r border-gray-100 text-center">
                              {isConfigured ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-[#14233c]">{plan.paymentType}</span>
                                  <span className="text-[10px] text-gray-500">{plan.amcDuration} Months</span>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r border-gray-100 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                {isConfigured ? 'Configured' : 'No Plan'}
                              </span>
                            </td>
                            <td className="p-2 border-r border-gray-100 text-center">
                              {isConfigured ? (
                                <input 
                                  type="number" 
                                  className={`w-24 px-1.5 py-1 border rounded text-center font-bold outline-none ${plan.isEditing ? 'border-blue-500 bg-white shadow-sm' : 'border-transparent bg-transparent cursor-default'}`} 
                                  value={plan.basicPricePerKw} 
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setAmcPlans(prev => prev.map(p => p._id === plan._id ? { ...p, basicPricePerKw: val } : p));
                                  }} 
                                  readOnly={!plan.isEditing} 
                                />
                              ) : '-'}
                            </td>
                            <td className="p-2 border-r border-gray-100 text-center font-bold">
                              {isConfigured ? `₹${(plan.amcServiceCharges || 0).toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2 text-center">
                              {isConfigured ? (
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => {
                                      const planId = plan._id;
                                      if (plan.isEditing) {
                                        salesSettingsService.updateAMCPlan(planId, { basicPricePerKw: plan.basicPricePerKw }).catch(console.error);
                                      }
                                      setAmcPlans(prev => prev.map(p => p._id === planId ? { ...p, isEditing: !p.isEditing } : p));
                                  }} className={`p-1 rounded ${plan.isEditing ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {plan.isEditing ? <Save size={14} /> : <Edit size={14} />}
                                  </button>
                                  <button onClick={() => handleDeletePrice(plan._id)} className="p-1 bg-red-100 text-red-500 rounded"><Trash2 size={14} /></button>
                                </div>
                              ) : (
                                <span className="text-gray-300 italic text-[9px]">Inventory &gt; Create AMC</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                 <button className="bg-[#0076a8] text-white px-5 py-2 rounded shadow text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors" onClick={() => setShowAddModal(true)}><CheckCircle size={16} /> Add Price</button>
                 <button className="bg-gray-500 text-white px-5 py-2 rounded shadow text-sm font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors" onClick={handleResetFilters}><RefreshCw size={16} /> Reset Filters</button>
              </div>
            </div>
          </>

      </div>

      <div className="py-10 border-t border-gray-200 text-center">
        <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Copyright © 2025, Solarkits. All Rights Reserved.</p>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0b386a]">Add New AMC Price</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">AMC Plans should be created in the <span className="font-bold">ComboKit &gt; Create AMC Plans</span> section. This page allows editing basic pricing for those plans.</p>
            <button onClick={() => setShowAddModal(false)} className="w-full py-3 bg-[#0d6efd] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}