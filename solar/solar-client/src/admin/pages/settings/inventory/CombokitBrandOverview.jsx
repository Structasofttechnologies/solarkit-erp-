// CombokitBrandOverview.jsx
import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Factory, Loader, X } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import { locationAPI } from '../../../../api/api';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import { getPartners, getPartnerPlans } from '../../../../services/partner/partnerApi';

const LocationCard = ({ title, subtitle, isSelected, onClick, colorClass = 'bg-[#3c50e0]' }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl border-2 py-5 px-4 flex flex-col items-center justify-center text-center h-24 transition-all shadow-sm hover:shadow-md ${isSelected
        ? `${colorClass} border-transparent shadow-lg -translate-y-1`
        : 'border-transparent bg-white hover:border-gray-200'
      }`}
  >
    <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{title}</div>
    {subtitle && (
      <div className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
        {subtitle}
      </div>
    )}
  </div>
);

const CombokitBrandOverview = () => {
  // --- Independent Location State ---
  const [locData, setLocData] = useState({ countries: [], states: [], clusters: [], districts: [] });
  const [selCountry, setSelCountry] = useState('all');
  const [selState, setSelState] = useState('');
  const [selCluster, setSelCluster] = useState('');
  const [selDistrict, setSelDistrict] = useState('');

  const [partnerTypes, setPartnerTypes] = useState([]);
  const [selectedPartnerTypes, setSelectedPartnerTypes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [skus, setSkus] = useState([]);
  const [skuLoading, setSkuLoading] = useState(false);

  // ── On mount: countries & initial data ──────────────────────────────────
  useEffect(() => { 
    fetchCountries(); 
    fetchOverview();
  }, []);

  // ── country → states ───────────────────────────────────────────────────────
  useEffect(() => {
    if (selCountry) fetchStatesLocal(selCountry);
    else setLocData(p => ({ ...p, states: [], clusters: [], districts: [] }));
    setSelState(''); setSelCluster(''); setSelDistrict('');
  }, [selCountry]);

  // ── state → clusters ───────────────────────────────────────────────────────
  useEffect(() => {
    if (selState) fetchClustersLocal(selState);
    else setLocData(p => ({ ...p, clusters: [], districts: [] }));
    setSelCluster(''); setSelDistrict('');
  }, [selState]);

  // ── cluster → districts ────────────────────────────────────────────────────
  useEffect(() => {
    if (selCluster) fetchDistrictsLocal(selCluster);
    else setLocData(p => ({ ...p, districts: [] }));
    setSelDistrict('');
  }, [selCluster]);

  // ── Fetch brand overview when criteria changes ───────────────────────────
  useEffect(() => {
    if (selCountry) {
      fetchOverview();
    } else {
      setData([]);
    }
  }, [selCountry, selState, selCluster, selDistrict, selectedPlans]);

  // ── Fetch Partner Types ──────────────────────────────────────────────────
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const res = await getPartners();
        setPartnerTypes(res || []);
      } catch (err) {
        console.error('Failed to fetch partner types', err);
      }
    };
    loadPartners();
  }, []);

  // ── Fetch Plans based on Partner Type & State ───────────────────────────
  useEffect(() => {
    const loadPlans = async () => {
      if (selectedPartnerTypes.length === 0) {
        setPlans([]);
        setSelectedPlans([]);
        return;
      }

      try {
        // Since getPartnerPlans takes a single partnerType, and we might have multiple
        // We'll fetch plans for all selected partner types and merge them uniquely
        const allPlansPromises = selectedPartnerTypes.map(pt =>
          getPartnerPlans(pt, selState && selState !== 'all' ? selState : null)
        );
        const responses = await Promise.all(allPlansPromises);
        const mergedPlans = [];
        const planNames = new Set();

        responses.forEach(res => {
          if (Array.isArray(res)) {
            res.forEach(plan => {
              if (!planNames.has(plan.name)) {
                planNames.add(plan.name);
                mergedPlans.push(plan);
              }
            });
          }
        });

        setPlans(mergedPlans);
      } catch (err) {
        console.error('Failed to fetch plans', err);
      }
    };
    loadPlans();
  }, [selectedPartnerTypes, selState]);

  // ── Location Fetchers ─────────────────────────────────────────────────────
  const fetchCountries = async () => {
    try {
      const res = await locationAPI.getAllCountries({ isActive: true });
      setLocData(p => ({ ...p, countries: res.data?.data || [] }));
    } catch (err) { console.error('Failed to fetch countries', err); }
  };

  const fetchStatesLocal = async (countryId) => {
    try {
      const params = { isActive: true };
      if (countryId !== 'all') params.countryId = countryId;
      const res = await locationAPI.getAllStates(params);
      setLocData(p => ({ ...p, states: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch states', err);
      setLocData(p => ({ ...p, states: [] }));
    }
  };

  const fetchClustersLocal = async (stateId) => {
    try {
      const params = { isActive: true };
      if (stateId !== 'all') params.stateId = stateId;
      const res = await locationAPI.getAllClusters(params);
      setLocData(p => ({ ...p, clusters: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch clusters', err);
      setLocData(p => ({ ...p, clusters: [] }));
    }
  };

  const fetchDistrictsLocal = async (clusterId) => {
    try {
      const params = { isActive: true };
      if (clusterId !== 'all') params.clusterId = clusterId;
      else if (selState && selState !== 'all') params.stateId = selState;
      const res = await locationAPI.getAllDistricts(params);
      setLocData(p => ({ ...p, districts: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch districts', err);
      setLocData(p => ({ ...p, districts: [] }));
    }
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const params = {
        cpTypes: selectedPlans,
        ...(selCountry && selCountry !== 'all' && { country: selCountry }),
        ...(selState && selState !== 'all' && { state: selState }),
        ...(selCluster && selCluster !== 'all' && { cluster: selCluster }),
        ...(selDistrict && selDistrict !== 'all' && { district: selDistrict }),
      };
      const response = await inventoryApi.getBrandOverview(params);
      setData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch brand overview', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = async (brand, productName) => {
    try {
      setSelectedBrand({ ...brand, productName });
      setSkus([]);
      setSkuLoading(true);
      
      // Fetch SKUs for this specific brand and product
      const res = await productApi.getSkus({ 
        brand: brand.brandId,
        product: brand.productId
      });
      
      if (res.data.success) {
        setSkus(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
    } finally {
      setSkuLoading(false);
    }
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const handleCountrySelect = (id) => setSelCountry(p => p === id ? '' : id);
  const handleStateSelect = (id) => setSelState(p => p === id ? '' : id);
  const handleClusterSelect = (id) => setSelCluster(p => p === id ? '' : id);
  const handleDistrictSelect = (id) => setSelDistrict(p => p === id ? '' : id);
  const togglePartnerType = (type) => setSelectedPartnerTypes(p =>
    p.includes(type) ? p.filter(t => t !== type) : [...p, type]
  );
  const togglePlan = (name) => setSelectedPlans(p =>
    p.includes(name) ? p.filter(t => t !== name) : [...p, name]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 bg-[#f4f6fa] min-h-screen font-sans">

      {/* Header */}
      <div className="bg-white rounded border border-gray-200 mb-6 overflow-hidden">
        <h4 className="text-[#206bc4] text-xl font-bold py-4 px-6 border-l-4 border-l-blue-500">
          Combokit Brand SKU Overview
        </h4>
      </div>

      <div className="space-y-8 mb-8">

        {/* 1. Country */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> 1. Select Country
            </h5>
            <button
              onClick={() => handleCountrySelect('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
            >
              {selCountry === 'all' ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <LocationCard
              title="All Countries" subtitle="ALL"
              isSelected={selCountry === 'all'}
              onClick={() => handleCountrySelect('all')}
              colorClass="bg-[#6c5ce7]"
            />
            {locData.countries.map(c => (
              <LocationCard
                key={c._id} title={c.name} subtitle={c.code || c.shortName}
                isSelected={selCountry === c._id}
                onClick={() => handleCountrySelect(c._id)}
                colorClass="bg-[#6c5ce7]"
              />
            ))}
            {locData.countries.length === 0 && (
              <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">Loading countries…</div>
            )}
          </div>
        </section>

        {/* 2. State */}
        {selCountry && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> 2. Select State
              </h5>
              <button
                onClick={() => handleStateSelect('all')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
              >
                {selState === 'all' ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <LocationCard
                title="All States" subtitle="ALL"
                isSelected={selState === 'all'}
                onClick={() => handleStateSelect('all')}
                colorClass="bg-[#3c50e0]"
              />
              {locData.states.map(s => (
                <LocationCard
                  key={s._id} title={s.name} subtitle={s.code}
                  isSelected={selState === s._id}
                  onClick={() => handleStateSelect(s._id)}
                  colorClass="bg-[#3c50e0]"
                />
              ))}
              {locData.states.length === 0 && (
                <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">No states found for this country.</div>
              )}
            </div>
          </section>
        )}

        {/* 3. Cluster */}
        {selState && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Factory size={14} /> 3. Select Cluster
              </h5>
              <button
                onClick={() => handleClusterSelect('all')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
              >
                {selCluster === 'all' ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <LocationCard
                title="All Clusters" subtitle="ALL"
                isSelected={selCluster === 'all'}
                onClick={() => handleClusterSelect('all')}
                colorClass="bg-[#6a5cb8]"
              />
              {locData.clusters.map(cl => (
                <LocationCard
                  key={cl._id} title={cl.name}
                  isSelected={selCluster === cl._id}
                  onClick={() => handleClusterSelect(cl._id)}
                  colorClass="bg-[#6a5cb8]"
                />
              ))}
              {locData.clusters.length === 0 && (
                <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">No clusters found for this state.</div>
              )}
            </div>
          </section>
        )}

        {/* 4. District */}
        {selCluster && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> 4. Select District
              </h5>
              <button
                onClick={() => handleDistrictSelect('all')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
              >
                {selDistrict === 'all' ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <LocationCard
                title="All Districts" subtitle="ALL"
                isSelected={selDistrict === 'all'}
                onClick={() => handleDistrictSelect('all')}
                colorClass="bg-[#28a745]"
              />
              {locData.districts.map(d => (
                <LocationCard
                  key={d._id} title={d.name}
                  isSelected={selDistrict === d._id}
                  onClick={() => handleDistrictSelect(d._id)}
                  colorClass="bg-[#28a745]"
                />
              ))}
              {locData.districts.length === 0 && (
                <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">No districts found for this cluster.</div>
              )}
            </div>
          </section>
        )}

        {/* 5. Partner Types */}
        {selCountry && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Partner Types</h5>
              <div className="flex gap-3 text-xs font-bold">
                <button
                  onClick={() => setSelectedPartnerTypes(partnerTypes.map(p => p.name))}
                  className="text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setSelectedPartnerTypes([]);
                    setPlans([]);
                    setSelectedPlans([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {partnerTypes.map(p => (
                <div
                  key={p._id}
                  onClick={() => togglePartnerType(p.name)}
                  className={`cursor-pointer rounded-xl border-2 py-4 px-4 flex items-center justify-center text-center h-16 transition-all shadow-sm hover:shadow-md ${selectedPartnerTypes.includes(p.name)
                      ? 'bg-[#6c5ce7] border-transparent text-white shadow-lg -translate-y-1'
                      : 'border-transparent bg-white hover:border-gray-200 text-gray-800'
                    }`}
                >
                  <span className="font-bold text-sm">{p.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Plans */}
        {selectedPartnerTypes.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Plans</h5>
              <div className="flex gap-3 text-xs font-bold">
                <button
                  onClick={() => setSelectedPlans(plans.map(p => p.name))}
                  className="text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPlans([])}
                  className="text-gray-500 hover:text-gray-700 uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {plans.map(p => (
                <div
                  key={p._id}
                  onClick={() => togglePlan(p.name)}
                  className={`cursor-pointer rounded-xl border-2 py-4 px-4 flex items-center justify-center text-center h-16 transition-all shadow-sm hover:shadow-md ${selectedPlans.includes(p.name)
                      ? 'bg-[#007fb1] border-transparent text-white shadow-lg -translate-y-1'
                      : 'border-transparent bg-white hover:border-gray-200 text-gray-800'
                    }`}
                >
                  <span className="font-bold text-sm">{p.name}</span>
                </div>
              ))}
            </div>
            {selectedPlans.length > 0 && (
              <div className="mt-3 bg-white border border-gray-200 rounded px-4 py-2 text-sm">
                <span className="text-gray-500 font-medium">Selected Plans: </span>
                <span className="text-[#1c2434] font-bold">{selectedPlans.join(', ')}</span>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Brand Overview Table */}
      <div className="bg-white rounded shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-6">
          <h3 className="text-[#1c2434] text-[20px] font-bold mb-6">Brand Overview</h3>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-left align-middle border-collapse">
              <thead className="bg-gradient-to-r from-sky-400 to-blue-400 text-white">
                <tr>
                  <th className="py-3 px-6 font-bold text-[15px] border-r border-white/20">Product</th>
                  <th className="py-3 px-6 font-bold text-[15px] border-r border-white/20">Brand Names</th>
                  <th className="py-3 px-6 font-bold text-[15px]">Brand Logos + SKUs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <Loader className="animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400 italic">
                      No data found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-6 font-bold text-[#1c2434] border-r border-gray-200">{item._id}</td>
                      <td className="py-5 px-6 text-[#1c2434] border-r border-gray-200">
                        {item.brands?.map(b => b.brandName).join(', ')}
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-wrap gap-6">
                          {item.brands?.map((brand, bIndex) => (
                            <div 
                              key={bIndex} 
                              className="group flex flex-col items-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer min-w-[120px]"
                              onClick={() => handleBrandClick(brand, item._id)}
                              title="Click here and go inside for more details"
                            >
                              <div className="h-14 flex items-center justify-center mb-3">
                                {brand.logo ? (
                                  <img src={brand.logo} alt={brand.brandName} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                                ) : (
                                  <div className="text-gray-300 font-bold text-xs uppercase text-center">{brand.brandName}<br/>Logo</div>
                                )}
                              </div>
                              
                              <div className="w-full h-[1px] bg-gray-100 mb-3" />
                              
                              <div className="bg-[#3c50e0] text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-blue-600 transition-colors">
                                {brand.skus} SKUs
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 bg-white py-4 rounded shadow-sm border border-gray-100 flex justify-center items-center">
        <span className="text-[14px] text-[#1c2434] font-medium uppercase tracking-tight">
          Copyright © {new Date().getFullYear()} Solarkits. All Rights Reserved.
        </span>
      </div>

      {/* --- SKU Details Modal --- */}
      {selectedBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-5">
                <div className="bg-white p-2 rounded-xl border border-blue-50 shadow-sm">
                  {selectedBrand.logo ? (
                    <img src={selectedBrand.logo} alt="" className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-blue-600 text-white font-black text-xs rounded-lg uppercase">
                      {selectedBrand.brandName?.substring(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1c2434] tracking-tight">Generated SKUs</h2>
                  <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                    {selectedBrand.brandName} • {selectedBrand.productName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBrand(null)} 
                className="text-gray-400 hover:text-red-500 transition-all p-3 hover:bg-red-50 rounded-full"
              >
                <X size={26} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[65vh] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">General Information</h3>
                <span className="bg-[#3c50e0] text-white px-4 py-1.5 rounded-full text-[11px] font-black shadow-lg">
                   {skus.length} {skus.length === 1 ? 'SKU' : 'SKUs'} AVAILABLE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-100 transition-all">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Brand Name</span>
                  <span className="text-sm font-bold text-[#1c2434]">{selectedBrand.brandName}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-100 transition-all">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Product Category</span>
                  <span className="text-sm font-bold text-[#1c2434]">{selectedBrand.productName}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mt-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> All Generated SKUs
                </h4>
                
                <div className="space-y-3">
                  {skuLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3c50e0]"></div>
                      <span className="text-xs font-bold text-gray-400 animate-pulse">Fetching details...</span>
                    </div>
                  ) : skus.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="font-bold text-sm">No SKUs found</p>
                      <p className="text-[11px] mt-1">Add some SKUs from the Product module first.</p>
                    </div>
                  ) : (
                    skus.map((sku, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-[15px] font-black text-blue-600 tracking-tight group-hover:translate-x-1 transition-transform inline-block">
                            {sku.skuCode}
                          </span>
                          <div className="flex gap-3 text-[11px] text-gray-500 font-bold mt-2">
                            <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{sku.capacity || '-'}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{sku.phase || '-'}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{sku.wattage}W</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                           <span className="text-[11px] font-black text-gray-300 uppercase letter tracking-tighter">Active</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedBrand(null)}
                className="px-10 py-3 bg-[#1c2434] text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 uppercase tracking-widest active:translate-y-0"
              >
                Close Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombokitBrandOverview;
