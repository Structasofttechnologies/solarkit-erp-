import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Loader, Trash2, Edit } from 'lucide-react';
import {
  getSupplierVendorPlans,
  saveSupplierVendorPlan,
  deleteSupplierVendorPlan,
  getSupplierVendorPlanCounts
} from '../../../../services/vendor/vendorApi';
import { locationAPI } from '../../../../api/api';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import toast from 'react-hot-toast';

const LocationCard = ({ title, subtitle, isSelected, onClick, count = 0 }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-28 shadow-sm hover:shadow-md relative ${isSelected
      ? 'border-[#007bff] bg-blue-50 shadow-blue-100 shadow-lg -translate-y-1'
      : 'border-transparent bg-white hover:border-blue-200'
      }`}
  >
    {count > 0 && (
      <div className="absolute top-2 right-2 bg-[#007bff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        {count}
      </div>
    )}
    <div className="font-bold text-base text-[#333] mb-1">{title}</div>
    <div className="text-xs text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

export default function SupplierVendors() {
  const [activeTab, setActiveTab] = useState('Manufacturer');
  const [tabs, setTabs] = useState(['Manufacturer', 'Distributor', 'Dealer']);
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allFetchedPlans, setAllFetchedPlans] = useState([]);
  const [globalPlanNames, setGlobalPlanNames] = useState([]);
  const [planCounts, setPlanCounts] = useState({ byCountry: [], byState: [], byCluster: [], byWarehouse: [] });

  const fetchPlanCounts = async () => {
    try {
      const res = await getSupplierVendorPlanCounts();
      if (res.success && res.detailed) {
        setPlanCounts(res.detailed);
      }
    } catch (error) {
      console.error('Error fetching plan counts', error);
    }
  };

  const fetchGlobalNames = async () => {
    try {
      const res = await getSupplierVendorPlans({ fetchAllNames: true });
      if (res.success && res.data) {
        setGlobalPlanNames(res.data);
      }
    } catch (error) {
      console.error('Error fetching global plan names', error);
    }
  };

  useEffect(() => {
    fetchGlobalNames();
    fetchPlanCounts();
  }, []);

  // Form State
  const getDefaultFormState = () => ({
      kycDetails: [],
      subloginRole: '',
      subloginLimit: '',
      accessType: 'Full Access'
  });

  const [formSettings, setFormSettings] = useState({
      'Manufacturer': getDefaultFormState(),
      'Distributor': getDefaultFormState(),
      'Dealer': getDefaultFormState(),
  });

  const kycOptions = [
      "Company Name", "Company Address", "Email Address", "Contact Person", "Phone Number",
      "KYC Documents (Aadhar, PAN)", "Warehouse Image (JPG, PNG)", "Unit Details", "GST Number"
  ];

  // Location Hierarchy State
  const [locationData, setLocationData] = useState({ countries: [], states: [], clusters: [], warehouses: [] });
  const [selectedLocation, setSelectedLocation] = useState({ country: '', state: '', cluster: '', warehouse: '' });
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await locationAPI.getAllCountries({ isActive: true });
        if (res.data && res.data.data) setLocationData(prev => ({ ...prev, countries: res.data.data }));
      } catch (error) { console.error(error); }
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
        } catch (error) { console.error(error); }
      } else setLocationData(prev => ({ ...prev, states: [] }));
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
        } catch (error) { setLocationData(prev => ({ ...prev, clusters: [] })); }
      } else setLocationData(prev => ({ ...prev, clusters: [] }));
    };
    fetchClusters();
  }, [selectedLocation.state]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (selectedLocation.cluster) {
        try {
          if (selectedLocation.cluster !== 'all') {
            const res = await inventoryApi.getAllWarehouses({ cluster: selectedLocation.cluster });
            if (res.data && res.data.data) setLocationData(prev => ({ ...prev, warehouses: res.data.data }));
            else setLocationData(prev => ({ ...prev, warehouses: [] }));
          } else {
            const params = { status: 'Active' };
            if (selectedLocation.state && selectedLocation.state !== 'all') params.state = selectedLocation.state;
            const res = await inventoryApi.getAllWarehouses(params);
            if (res.data && res.data.data) setLocationData(prev => ({ ...prev, warehouses: res.data.data }));
            else setLocationData(prev => ({ ...prev, warehouses: [] }));
          }
        } catch (error) { setLocationData(prev => ({ ...prev, warehouses: [] })); }
      } else setLocationData(prev => ({ ...prev, warehouses: [] }));
    };
    fetchWarehouses();
  }, [selectedLocation.cluster, selectedLocation.state]);

  useEffect(() => {
    if (selectedLocation.warehouse) fetchPlans();
    else resetToDefaults();
  }, [selectedLocation.warehouse, selectedLocation.cluster, selectedLocation.state, selectedLocation.country, globalPlanNames]);

  const resetToDefaults = () => {
      const baseTabs = ['Manufacturer', 'Distributor', 'Dealer'];
      const currentNames = globalPlanNames.length > 0 ? globalPlanNames : baseTabs;
      const sortedTabs = Array.from(new Set(currentNames));

      setTabs(sortedTabs);
      setActiveTab(sortedTabs[0] || 'Manufacturer');
      setAllFetchedPlans([]);
      setFormSettings(sortedTabs.reduce((acc, tab) => ({ ...acc, [tab]: getDefaultFormState() }), {}));
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLocation.warehouse && selectedLocation.warehouse !== 'all') params.warehouseId = selectedLocation.warehouse;
      else if (selectedLocation.cluster && selectedLocation.cluster !== 'all') params.clusterId = selectedLocation.cluster;
      else if (selectedLocation.state && selectedLocation.state !== 'all') params.stateId = selectedLocation.state;
      else if (selectedLocation.country && selectedLocation.country !== 'all') params.countryId = selectedLocation.country;

      const res = await getSupplierVendorPlans(params);
      if (res.success && res.data.length > 0) {
        const dbPlans = res.data;
        setAllFetchedPlans(dbPlans);
        
        const currentPlans = selectedLocation.warehouse !== 'all' 
          ? dbPlans.filter(p => p.warehouseId?._id === selectedLocation.warehouse || p.warehouseId === selectedLocation.warehouse)
          : dbPlans;

        const baseTabs = ['Manufacturer', 'Distributor', 'Dealer'];
        const currentNames = globalPlanNames.length > 0 ? globalPlanNames : baseTabs;
        const uniqueTabs = Array.from(new Set([...currentNames, ...currentPlans.map(p => p.name)]));
        setTabs(uniqueTabs);
        if (!uniqueTabs.includes(activeTab)) setActiveTab(uniqueTabs[0]);

        const settings = {};
        uniqueTabs.forEach(name => {
            const match = currentPlans.find(p => p.name === name);
            settings[name] = match ? { ...match } : getDefaultFormState();
        });
        setFormSettings(settings);
      } else {
        resetToDefaults();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load supplier vendor settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (value) => {
      const current = formSettings[activeTab].kycDetails || [];
      const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
      setFormSettings(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], kycDetails: updated } }));
  };

  const handleInputChange = (field, value) => {
      setFormSettings(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [field]: value } }));
  };

  const handleSave = async () => {
      setSubmitting(true);
      try {
          const payload = {
              ...formSettings[activeTab],
              name: activeTab,
              countryId: selectedLocation.country === 'all' ? null : selectedLocation.country,
              stateId: selectedLocation.state === 'all' ? null : selectedLocation.state,
              clusterId: selectedLocation.cluster === 'all' ? null : selectedLocation.cluster,
          };
          if (selectedLocation.warehouse === 'all') payload.warehouseId = null;
          else payload.warehouseId = selectedLocation.warehouse;

          const response = await saveSupplierVendorPlan(payload);
          if (response.success) {
              toast.success(`${activeTab} saved successfully`);
              fetchPlans();
              fetchPlanCounts();
          }
      } catch (error) {
          console.error(error);
          toast.error('Failed to save settings');
      } finally {
          setSubmitting(false);
      }
  };

  const handleDelete = async (planName, providedId) => {
      try {
          if (providedId) {
              await deleteSupplierVendorPlan(providedId);
              toast.success('Configuration deleted');
          } else {
              if (!window.confirm(`Are you sure you want to completely delete "${planName}" and all its configurations?`)) return;
              
              await deleteSupplierVendorPlan('by-name', { name: planName });
              toast.success('Plan deleted globally');
              
              if (["Manufacturer", "Distributor", "Dealer"].includes(planName)) {
                  setFormSettings(prev => ({ ...prev, [planName]: getDefaultFormState() }));
              } else {
                  setTabs(prev => prev.filter(t => t !== planName));
                  if (activeTab === planName) {
                      const remainingTabs = tabs.filter(t => t !== planName);
                      setActiveTab(remainingTabs.length > 0 ? remainingTabs[0] : 'Manufacturer');
                  }
              }
          }

          await fetchGlobalNames();
          fetchPlans();
          fetchPlanCounts();
      } catch (error) {
          console.error(error);
          toast.error('Failed to delete configuration');
      }
  };

  const handleEdit = (plan) => {
      setActiveTab(plan.name);
      setFormSettings(prev => ({
          ...prev,
          [plan.name]: { ...plan }
      }));
      // Smooth scroll to the form container
      const formElement = document.querySelector('.bg-white.rounded-md.shadow-sm.border.border-gray-200.pt-8');
      if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
          window.scrollTo({ top: 350, behavior: 'smooth' });
      }
      toast.success(`Loaded ${plan.name} configuration for editing`);
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const handleAddTab = async () => {
      if (!newTabName.trim()) return toast.error('Name required');
      if (tabs.includes(newTabName.trim())) return toast.error('Already exists');
      const name = newTabName.trim();
      
      try {
          setSubmitting(true);
          const payload = {
              ...getDefaultFormState(),
              name: name,
              stateId: null,
              clusterId: null,
              warehouseId: null
          };
          
          const response = await saveSupplierVendorPlan(payload);
          if (response.success) {
              toast.success('Plan added');
              await fetchGlobalNames();
              fetchPlanCounts();
              setTabs(prev => Array.from(new Set([...prev, name])));
              setFormSettings(prev => ({ ...prev, [name]: getDefaultFormState() }));
              setActiveTab(name);
              setNewTabName('');
              setIsAddOpen(false);
          }
      } catch (error) {
          console.error(error);
          toast.error('Failed to add plan globally');
      } finally {
          setSubmitting(false);
      }
  }

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-xl font-bold text-[#14233c]">Supplier Vendor Management</h1>
        <button
          onClick={() => setShowLocationCards(!showLocationCards)}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#0076a8] text-white rounded text-[10px] font-bold shadow-sm hover:bg-blue-800 transition-all uppercase tracking-wider"
        >
          {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />} {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 pb-20">
        
        {/* Locations */}
        {showLocationCards && (
          <div className="space-y-10 mb-10">
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
                <LocationCard title="All Countries" subtitle="ALL" isSelected={selectedLocation.country === 'all'} onClick={() => setSelectedLocation({ country: 'all', state: '', cluster: '', warehouse: '' })} />
                {locationData.countries.map(c => {
                  const count = planCounts.byCountry.find(i => i._id === c._id)?.count || 0;
                  return (
                    <LocationCard 
                      key={c._id} 
                      title={c.name} 
                      subtitle={c.code || c.name.substring(0, 2).toUpperCase()} 
                      isSelected={selectedLocation.country === c._id} 
                      onClick={() => setSelectedLocation({ country: c._id, state: '', cluster: '', warehouse: '' })} 
                      count={count}
                    />
                  );
                })}
              </div>
            </div>

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
                  <LocationCard title="All States" subtitle="ALL" isSelected={selectedLocation.state === 'all'} onClick={() => setSelectedLocation(prev => ({ ...prev, state: 'all', cluster: '', warehouse: '' }))} />
                  {locationData.states.map(s => {
                    const count = planCounts.byState.find(i => i._id === s._id)?.count || 0;
                    return (
                      <LocationCard 
                        key={s._id} 
                        title={s.name} 
                        subtitle={s.code || s.name.substring(0, 2).toUpperCase()} 
                        isSelected={selectedLocation.state === s._id} 
                        onClick={() => setSelectedLocation(prev => ({ ...prev, state: s._id, cluster: '', warehouse: '' }))} 
                        count={count}
                      />
                    );
                  })}
                </div>
              </div>
            )}

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
                  <LocationCard title="All Clusters" subtitle="ALL" isSelected={selectedLocation.cluster === 'all'} onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: 'all', warehouse: '' }))} />
                  {locationData.clusters.map(c => {
                    const parentState = locationData.states.find(s => s._id === c.state) || locationData.states.find(s => s._id === selectedLocation.state);
                    const count = planCounts.byCluster.find(i => i._id === c._id)?.count || 0;
                    return (
                      <LocationCard 
                        key={c._id} 
                        title={c.name} 
                        subtitle={parentState ? (parentState.code || parentState.name.substring(0, 2).toUpperCase()) : 'CL'} 
                        isSelected={selectedLocation.cluster === c._id} 
                        onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: c._id, warehouse: '' }))} 
                        count={count}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {selectedLocation.cluster && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#333]">Select Warehouse</h2>
                  <button
                    onClick={() => setSelectedLocation(prev => ({ ...prev, warehouse: 'all' }))}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <LocationCard title="All Warehouses" subtitle="ALL" isSelected={selectedLocation.warehouse === 'all'} onClick={() => setSelectedLocation(prev => ({ ...prev, warehouse: 'all' }))} />
                  {locationData.warehouses.map(w => {
                    const parentCluster = locationData.clusters.find(c => c._id === selectedLocation.cluster);
                    const count = planCounts.byWarehouse.find(i => i._id === w._id)?.count || 0;
                    return (
                      <LocationCard 
                        key={w._id} 
                        title={w.name} 
                        subtitle={parentCluster ? parentCluster.name : 'WH'} 
                        isSelected={selectedLocation.warehouse === w._id} 
                        onClick={() => setSelectedLocation(prev => ({ ...prev, warehouse: w._id }))} 
                        count={count}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Container */}
        {selectedLocation.warehouse && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 pt-8 pb-10 px-10 mb-16 relative">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                 {tabs.map(tab => (
                    <div key={tab} className="relative group">
                        <button
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded font-bold text-sm shadow-sm transition-all ${activeTab === tab ? 'bg-[#007bff] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {tab}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(tab); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                ))}
                {isAddOpen ? (
                    <div className="flex bg-[#2c3e50] p-1 rounded">
                        <input className="px-2 py-1 text-sm rounded-l outline-none text-black w-32" value={newTabName} onChange={e=>setNewTabName(e.target.value)} placeholder="Name..." autoFocus />
                        <button className="bg-green-500 text-white px-3 font-bold text-xs" onClick={handleAddTab}>Add</button>
                        <button className="bg-red-500 text-white px-2 font-bold text-xs rounded-r" onClick={() => setIsAddOpen(false)}>X</button>
                    </div>
                ) : (
                    <button onClick={() => setIsAddOpen(true)} className="bg-[#2c3e50] text-white px-6 py-2 rounded font-bold text-sm shadow-sm hover:bg-[#1a252f] transition-colors">
                        Add More
                    </button>
                )}
             </div>

             {loading ? (
                <div className="py-20 flex justify-center"><Loader className="animate-spin text-blue-500" size={40} /></div>
             ) : formSettings[activeTab] && (
                <div className="mt-6 space-y-8">
                    {/* Header line mimicking PHP */}
                    <div className="border-b border-gray-200 pb-2">
                        <label className="text-sm font-bold text-gray-700">Type of Login</label>
                        <h2 className="text-xl font-bold text-[#007bff] mt-2">{activeTab} Type</h2>
                    </div>

                    {/* KYC Details Card */}
                    <div className="border border-gray-200 rounded-md bg-gray-50 p-6">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">KYC Details</h3>
                        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                            {kycOptions.map(option => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={(formSettings[activeTab].kycDetails || []).includes(option)}
                                        onChange={() => handleCheckboxToggle(option)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                                    />
                                    <span className="text-sm font-medium text-[#2c3e50]">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sublogin Details Card */}
                    <div className="border border-gray-200 rounded-md bg-gray-50 p-6">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">Sublogin Details</h3>
                        
                        <div className="grid grid-cols-2 gap-10 mb-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-[#2c3e50] mb-2 pointer-events-none">
                                    <input type="checkbox" checked={true} readOnly className="w-4 h-4 text-blue-600 rounded" />
                                    Assign Sublogin Role
                                </label>
                                <div className="pl-6">
                                    <select 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                                        value={formSettings[activeTab].subloginRole}
                                        onChange={e => handleInputChange('subloginRole', e.target.value)}
                                    >
                                        <option value="">Choose sublogin type</option>
                                        <option value="Distributor">Distributor</option>
                                        <option value="Dealer">Dealer</option>
                                        <option value="Sales Agent">Sales Agent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-[#2c3e50] mb-2 pointer-events-none">
                                    <input type="checkbox" checked={true} readOnly className="w-4 h-4 text-blue-600 rounded" />
                                    Sublogin Limit (Max Allowed)
                                </label>
                                <div className="pl-6">
                                    <input 
                                        placeholder="e.g. 5"
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                                        value={formSettings[activeTab].subloginLimit}
                                        onChange={e => handleInputChange('subloginLimit', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-[#2c3e50] mb-2 pointer-events-none">
                                    <input type="checkbox" checked={true} readOnly className="w-4 h-4 text-blue-600 rounded" />
                                    Access Type
                                </label>
                                <div className="pl-6">
                                    <select 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                                        value={formSettings[activeTab].accessType}
                                        onChange={e => handleInputChange('accessType', e.target.value)}
                                    >
                                        <option value="Full Access">Full Access</option>
                                        <option value="View Only">View Only</option>
                                        <option value="Create Orders">Create Orders</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSave}
                            disabled={submitting}
                            className={`bg-[#007bff] text-white px-6 py-2 rounded text-sm font-bold hover:bg-blue-700 transition ${submitting ? 'opacity-50' : ''}`}
                        >
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* Dashboard table mapping the saved forms */}
        {selectedLocation.warehouse && !loading && allFetchedPlans.length > 0 && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-10">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h3 className="font-bold text-gray-800">Saved Configurations Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-max">
                <thead className="bg-[#2c3e50] text-white">
                  <tr>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap">State</th>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap">Cluster</th>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap">Warehouse</th>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap">Role Type</th>
                    {kycOptions.map(opt => (
                        <th key={opt} className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap text-center max-w-[150px] truncate" title={opt}>{opt}</th>
                    ))}
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap text-center">Sublogin Role</th>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap text-center">Limit</th>
                    <th className="p-4 font-semibold border-r border-[#3a4752] whitespace-nowrap text-center">Access</th>
                    <th className="p-4 font-semibold text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allFetchedPlans.map(plan => (
                    <tr key={plan._id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200">
                        {plan.stateId ? plan.stateId.name : <span className="text-blue-600">All States</span>}
                      </td>
                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200">
                        {plan.clusterId ? plan.clusterId.name : <span className="text-blue-600">All Clusters</span>}
                      </td>
                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200">
                        {plan.warehouseId ? plan.warehouseId.name : <span className="text-blue-600">All Warehouses</span>}
                      </td>
                      <td className="p-4 font-bold text-[#007bff] border-r border-gray-200">{plan.name}</td>
                      
                      {kycOptions.map(opt => {
                          const hasKyc = plan.kycDetails && plan.kycDetails.includes(opt);
                          return (
                              <td key={opt} className="p-4 border-r border-gray-200 text-center">
                                  {hasKyc ? (
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full font-bold">✓</span>
                                  ) : (
                                      <span className="text-gray-300 font-bold">-</span>
                                  )}
                              </td>
                          )
                      })}

                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200 text-center">
                        {plan.subloginRole ? plan.subloginRole : '---'}
                      </td>
                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200 text-center">
                        {plan.subloginLimit || '0'}
                      </td>
                      <td className="p-4 text-gray-800 font-bold border-r border-gray-200 text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                          {plan.accessType}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(plan)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition-colors"
                            title="Edit Configuration"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(plan.name, plan._id)}
                            className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-colors"
                            title="Delete Configuration"
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
          </div>
        )}

      </div>
    </div>
  );
}