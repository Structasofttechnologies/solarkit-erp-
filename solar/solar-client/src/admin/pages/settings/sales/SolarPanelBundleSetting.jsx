import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, CheckCircle, Save, LayoutGrid, Package, Settings, RefreshCw, Pencil, X 
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import salesSettingsService from '../../../../services/settings/salesSettingsApi';
import { productApi } from '../../../../api/productApi';

const LocationCard = ({ title, subtitle, isSelected, onClick, isState, count }) => (
  <div
    onClick={onClick}
    className={`relative p-4 rounded-md transition-all cursor-pointer flex flex-col items-center justify-center text-center h-20 shadow-sm hover:shadow-md ${
      isSelected
      ? 'border-2 border-[#007bff] bg-[#eef6ff]'
      : 'border border-gray-200 bg-white'
      }`}
  >
    {count > 0 && (
      <span className="absolute top-1.5 right-1.5 bg-[#007bff] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        {count}
      </span>
    )}
    <div className="font-bold text-[14px] text-[#2c3e50] mb-0">{title}</div>
    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

export default function SolarPanelBundleSetting() {
  const { countries, states, districts, clusters, fetchCountries, fetchStates, fetchDistricts, fetchClusters } = useLocations();
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [dynamicBrands, setDynamicBrands] = useState([]);
  const [dynamicSkus, setDynamicSkus] = useState([]);
  const [dynamicTechnologies, setDynamicTechnologies] = useState([]);
  const [dynamicWattages, setDynamicWattages] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editablePlans, setEditablePlans] = useState([]);
  const [allGlobalBundles, setAllGlobalBundles] = useState([]);

  const [planRows, setPlanRows] = useState([{
    product: '', brand: '', sku: '', technology: '', wattage: '', kwOption: '', duration: '', startDate: '', discount: '', status: 'Inactive', isSelectedForActivation: false
  }]);

  // Temporary static dropdown options 
  const dropdownOptions = {
    products: ["Solar Panel", "Solar Inverter"],
    brands: {
      "Solar Panel": ["Adani", "Tata", "Waaree", "Vikram"],
      "Solar Inverter": ["SMA", "Growatt", "Huawei"]
    },
    skus: {
      "Solar Panel": [
        { value: "SP-330", display: "SP-330 (330W Mono)", quantity: 25 },
        { value: "SP-400", display: "SP-400 (400W LG)", quantity: 18 }
      ],
      "Solar Inverter": [
        { value: "SI-3KW", display: "SI-3KW SMA", quantity: 12 },
        { value: "SI-5KW", display: "SI-5KW Growatt", quantity: 8 }
      ]
    },
    technologies: ["Mono PERC", "Poly", "Half Cut"],
    wattages: ["330W", "400W", "500W", "540W"]
  };

  const selectedCountryObj = countries.find(c => c._id === selectedCountryId);
  const selectedStateObj = states.find(s => s._id === selectedStateId);
  const selectedClusterObj = clusters.find(c => c._id === selectedClusterId);
  const selectedDistrictObj = districts.find(d => d._id === selectedDistrictId);

  useEffect(() => {
    fetchCountries();
    const loadDynamicData = async () => {
       try {
          const [pRes, bRes, sRes] = await Promise.all([
             productApi.getAll(),
             productApi.getBrands(),
             productApi.getSkus()
          ]);
          setDynamicProducts(Array.isArray(pRes.data?.data) ? pRes.data.data : (Array.isArray(pRes.data) ? pRes.data : (Array.isArray(pRes) ? pRes : [])));
          setDynamicBrands(Array.isArray(bRes.data?.data) ? bRes.data.data : (Array.isArray(bRes.data) ? bRes.data : (Array.isArray(bRes) ? bRes : [])));
          const skus = Array.isArray(sRes.data?.data) ? sRes.data.data : (Array.isArray(sRes.data) ? sRes.data : (Array.isArray(sRes) ? sRes : []));
          setDynamicSkus(skus);

          // Extract unique technologies and wattages
          const techs = [...new Set(skus.map(s => s.technology).filter(Boolean))];
          const watts = [...new Set(skus.map(s => s.wattage).filter(Boolean))].sort((a,b) => a-b);
          setDynamicTechnologies(techs);
          setDynamicWattages(watts);
       } catch (err) {
          console.error("Error loading product data:", err);
       }
    };
    loadDynamicData();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
       setSelectedStateId('');
       setSelectedClusterId('');
       setSelectedDistrictId('');
       if (selectedCountryId !== 'all') fetchStates({ countryId: selectedCountryId });
       else fetchStates();
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      setSelectedClusterId('');
      setSelectedDistrictId('');
      if (selectedStateId !== 'all') fetchClusters({ stateId: selectedStateId }); 
      else fetchClusters();
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedClusterId) {
       setSelectedDistrictId('');
       if (selectedClusterId !== 'all') fetchDistricts({ clusterId: selectedClusterId }); 
       else fetchDistricts();
    }
  }, [selectedClusterId]);

  useEffect(() => {
    fetchBundlePlans();
  }, [selectedStateId, selectedClusterId, selectedDistrictId]);

  const fetchBundlePlans = async () => {
    setLoading(true);
    try {
      const allBundles = await salesSettingsService.getBundles();
      setAllGlobalBundles(allBundles);
      const filtered = allBundles.filter(b => 
        (selectedStateId === 'all' || b.state === selectedStateId) &&
        (selectedClusterId === 'all' || b.cluster === selectedClusterId) &&
        (selectedDistrictId === 'all' || b.district === selectedDistrictId)
      );
      setPlans(filtered);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPlanRow = () => {
    setPlanRows([...planRows, {
      product: '', brand: '', sku: '', technology: '', wattage: '', kwOption: '', duration: '', startDate: '', discount: '', status: 'Inactive', isSelectedForActivation: false
    }]);
  };

  const updatePlanRow = (index, field, value) => {
    const updatedRows = [...planRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    if (field === 'product') {
      updatedRows[index].brand = '';
      updatedRows[index].sku = '';
    }
    setPlanRows(updatedRows);
  };

  const toggleRowActivationChoice = (index) => {
    const updatedRows = [...planRows];
    updatedRows[index].isSelectedForActivation = !updatedRows[index].isSelectedForActivation;
    updatedRows[index].status = updatedRows[index].isSelectedForActivation ? 'Active' : 'Inactive';
    setPlanRows(updatedRows);
  };

   const startEditingRow = (plan) => {
     if (plan.status === 'Active') return;
     setEditingPlanId(plan._id);
     setEditablePlans([plan]);
   };

   const cancelEditingRow = () => {
     setEditingPlanId(null);
     setEditablePlans([]);
   };

   const updateEditablePlanInPlace = (field, value) => {
     const updated = [...editablePlans];
     updated[0] = { ...updated[0], [field]: value };
     setEditablePlans(updated);
   };

   const saveRowEdits = async () => {
     const plan = editablePlans[0];
     try {
       setLoading(true);
       await salesSettingsService.updateBundle(plan._id, {
         ...plan,
         kwOption: Number(plan.kwOption),
         duration: Number(plan.duration),
         discount: Number(plan.discount)
       });
       alert("Plan updated successfully!");
       setEditingPlanId(null);
       setEditablePlans([]);
       fetchBundlePlans();
     } catch (error) {
       console.error("Error saving plan:", error);
       alert("Failed to save changes.");
     } finally {
       setLoading(false);
     }
   };

  const handleGenerate = async () => {
    if(!selectedStateId || !selectedClusterId || !selectedDistrictId || selectedStateId === 'all' || selectedClusterId === 'all' || selectedDistrictId === 'all') {
       return alert("Please select a specific State, Cluster and District before generating plans.");
    }

    const validPlans = planRows.filter(row => row.product && row.brand && row.sku && row.kwOption && row.duration);

    if (validPlans.length === 0) {
      alert("Please fill in at least one valid plan row with all required attributes (Product, Brand, SKU, KW, Duration).");
      return;
    }

    try {
      await Promise.all(validPlans.map(plan => {
        const skuData = dynamicSkus?.find(s => s.skuCode === plan.sku);
        return salesSettingsService.createBundle({
          ...plan,
          skuQuantity: skuData?.quantity || 0,
          kwOption: Number(plan.kwOption),
          duration: Number(plan.duration),
          discount: Number(plan.discount),
          country: selectedCountryId,
          state: selectedStateId,
          district: selectedDistrictId,
          cluster: selectedClusterId
        });
      }));

      alert("Bundle Plans Generated Successfully!");
      setPlanRows([{
        product: '', brand: '', sku: '', technology: '', wattage: '', kwOption: '', duration: '', startDate: '', discount: '', status: 'Inactive', isSelectedForActivation: false
      }]);
      fetchBundlePlans(); 
    } catch (error) {
      console.error("Error creating bundles:", error);
      alert("Failed to create bundles");
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this bundle plan?")) {
      try {
        await salesSettingsService.deleteBundle(id);
        fetchBundlePlans();
      } catch (error) {
        console.error("Error deleting bundle:", error);
      }
    }
  };

  const activePlansCount = plans.filter(p => p.status === 'Active').length;

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-[22px] font-bold text-[#14233c] mb-2">Solar Panel Bundle Plan Management</h1>
      </div>

      <div className="px-12 pb-12">
        
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm transition-all">
           <div className="mb-6">
              <h2 className="text-[16px] font-bold text-[#6c757d] mb-3">Select Country</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  <LocationCard 
                    title="All Countries" subtitle="ALL" isSelected={selectedCountryId === 'all' || selectedCountryId === ''} 
                    onClick={() => { setSelectedCountryId('all'); setSelectedStateId(''); setSelectedClusterId(''); setSelectedDistrictId(''); }} 
                  />
                  {countries.map((c) => (
                    <LocationCard 
                       key={c._id} title={c.name} subtitle={c.code || c.name.substring(0,2).toUpperCase()} 
                       isSelected={selectedCountryId === c._id}
                       count={allGlobalBundles.filter(b => b.country === c._id).length}
                       onClick={() => setSelectedCountryId(c._id)} 
                    />
                  ))}
              </div>
           </div>

           {selectedCountryId && (
              <div className="mb-6 border-t border-gray-100 pt-6 animate-in slide-in-from-left duration-300">
                <h2 className="text-[16px] font-bold text-[#6c757d] mb-3">Select State</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    <LocationCard 
                      title="All States" subtitle="ALL" isSelected={selectedStateId === 'all' || (selectedCountryId && selectedStateId === '')} isState={true}
                      onClick={() => { setSelectedStateId('all'); setSelectedClusterId(''); setSelectedDistrictId(''); }} 
                    />
                    {states.map((s) => (
                      <LocationCard 
                         key={s._id} title={s.name} subtitle={s.code || s.name.substring(0,2).toUpperCase()} 
                         isSelected={selectedStateId === s._id} isState={true}
                         count={allGlobalBundles.filter(b => b.state === s._id).length}
                         onClick={() => setSelectedStateId(s._id)} 
                      />
                    ))}
                </div>
              </div>
           )}

           {selectedStateId && (
              <div className="mb-6 border-t border-gray-100 pt-6">
                <h2 className="text-[16px] font-bold text-[#6c757d] mb-3">Select Cluster</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                   <LocationCard 
                      title="All Clusters" subtitle="ALL" isSelected={selectedClusterId === 'all' || selectedClusterId === ''} 
                      onClick={() => { setSelectedClusterId('all'); setSelectedDistrictId(''); }} 
                   />
                   {clusters.map((c) => (
                      <LocationCard 
                        key={c._id} title={c.name} subtitle={selectedStateObj?.name || 'State'} 
                        isSelected={selectedClusterId === c._id} 
                        count={allGlobalBundles.filter(b => b.cluster === c._id).length}
                        onClick={() => setSelectedClusterId(c._id)} 
                      />
                   ))}
                </div>
              </div>
           )}

           {selectedClusterId && (
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-[16px] font-bold text-[#6c757d] mb-3">Select District</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                   <LocationCard 
                      title="All Districts" subtitle="ALL" isSelected={selectedDistrictId === 'all' || selectedDistrictId === ''} 
                      onClick={() => setSelectedDistrictId('all')} 
                   />
                   {districts.map((d) => (
                      <LocationCard 
                        key={d._id} title={d.name} subtitle={'District'} 
                        isSelected={selectedDistrictId === d._id} 
                        count={allGlobalBundles.filter(b => b.district === d._id).length}
                        onClick={() => setSelectedDistrictId(d._id)} 
                      />
                   ))}
                </div>
              </div>
           )}
        </div>

        <div className="mb-8">
           <h2 className="text-[18px] font-bold text-[#6c757d] mb-3">Solar Panel Bundle Plan Setup</h2>
           <div className="bg-white rounded shadow-sm border border-[#0076a8] overflow-hidden">
               <div className="bg-[#0076a8] text-white p-3 flex justify-between items-center">
                   <h3 className="font-bold text-[16px]">Configure Bundle Plans</h3>
                   <button onClick={addPlanRow} className="bg-white text-[#0076a8] hover:bg-gray-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                       <Plus size={16} /> Add Row
                   </button>
               </div>

               <div className="overflow-x-auto w-full">
                   <table className="w-full text-left whitespace-nowrap min-w-max">
                       <thead className="bg-[#64b5f6] text-white">
                           <tr>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Product</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Brand</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">SKU Number</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Technology</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Wattage Option</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">KW Option</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Time Duration<br/><span className="text-xs font-normal">(Days)</span></th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Start Date</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Discount (₹/KW)</th>
                               <th className="p-3 text-sm font-bold border-r border-[#64b5f6]">Status</th>
                               <th className="p-3 text-sm font-bold text-center">Activate</th>
                           </tr>
                       </thead>
                       <tbody>
                           {planRows.map((row, index) => (
                               <tr key={index} className="border-b border-gray-200">
                                   <td className="p-2 align-top">
                                       <div className="flex items-center">
                                          {planRows.length > 1 && (
                                              <button onClick={() => { const r = [...planRows]; r.splice(index, 1); setPlanRows(r); }} className="text-gray-400 hover:text-red-500 mr-2 opacity-50"><Trash2 size={14}/></button>
                                          )}
                                          <select className="flex-1 border border-gray-300 rounded p-2 text-sm bg-white" value={row.product} onChange={e => updatePlanRow(index, 'product', e.target.value)}>
                                              <option value="">Select Product</option>
                                              {dynamicProducts?.map(p => <option key={p._id} value={p.productName || p.name}>{p.productName || p.name}</option>)}
                                          </select>
                                       </div>
                                   </td>
                                   <td className="p-2 align-top">
                                        <select className="w-40 border border-gray-300 rounded p-2 text-sm bg-white" value={row.brand} onChange={e => updatePlanRow(index, 'brand', e.target.value)} disabled={!row.product}>
                                            <option value="">Select Brand</option>
                                            {dynamicBrands?.map(b => (
                                               <option key={b._id} value={b.brand || b.name || b.companyName}>{b.brand || b.name || b.companyName}</option>
                                            ))}
                                        </select>
                                   </td>
                                   <td className="p-2 align-top">
                                        <select className="w-40 border border-gray-300 rounded p-2 text-sm bg-white" value={row.sku} onChange={e => updatePlanRow(index, 'sku', e.target.value)} disabled={!row.product}>
                                            <option value="">Select SKU</option>
                                            {(() => {
                                               const selectedProd = dynamicProducts?.find(p => (p.productName || p.name) === row.product);
                                               const selectedBrand = dynamicBrands?.find(b => (b.brand || b.name || b.companyName) === row.brand);
                                               
                                               const filtered = dynamicSkus?.filter(s => {
                                                  const pId = s.product?._id || s.product;
                                                  const bId = s.brand?._id || s.brand;
                                                  
                                                  const matchesProd = !selectedProd || pId === selectedProd._id;
                                                  const matchesBrand = !selectedBrand || bId === selectedBrand._id;
                                                  
                                                  return matchesProd && matchesBrand;
                                               });

                                               return filtered?.map(s => (
                                                  <option key={s._id} value={s.skuCode}>
                                                     {s.skuCode}
                                                  </option>
                                               ));
                                            })()}
                                        </select>
                                   </td>
                                   <td className="p-2 align-top">
                                       <select className="w-40 border border-gray-300 rounded p-2 text-sm bg-white" value={row.technology} onChange={e => updatePlanRow(index, 'technology', e.target.value)}>
                                           <option value="">Select Technology</option>
                                           {(row.sku ? dynamicSkus?.filter(s => s.skuCode === row.sku) : dynamicSkus)
                                              ?.map(s => s.technology).filter((v, i, a) => v && a.indexOf(v) === i)
                                              ?.map(t => <option key={t} value={t}>{t}</option>)}
                                       </select>
                                   </td>
                                   <td className="p-2 align-top">
                                       <select className="w-40 border border-gray-300 rounded p-2 text-sm bg-white" value={row.wattage} onChange={e => updatePlanRow(index, 'wattage', e.target.value)}>
                                           <option value="">Select Wattage</option>
                                           {(row.sku ? dynamicSkus?.filter(s => s.skuCode === row.sku) : dynamicSkus)
                                              ?.map(s => s.wattage).filter((v, i, a) => v && a.indexOf(v) === i)
                                              ?.sort((a,b) => a-b)
                                              ?.map(w => <option key={w} value={w}>{w}W</option>)}
                                       </select>
                                   </td>
                                   <td className="p-2 align-top">
                                       <input type="number" placeholder="Enter KW" className="w-28 border border-gray-300 rounded p-2 text-sm" value={row.kwOption} onChange={e => updatePlanRow(index, 'kwOption', e.target.value)} />
                                   </td>
                                   <td className="p-2 align-top">
                                       <input type="number" placeholder="Days" className="w-24 border border-gray-300 rounded p-2 text-sm" value={row.duration} onChange={e => updatePlanRow(index, 'duration', e.target.value)} />
                                   </td>
                                   <td className="p-2 align-top">
                                       <input type="date" className="border border-gray-300 rounded p-2 text-sm" value={row.startDate} onChange={e => updatePlanRow(index, 'startDate', e.target.value)} />
                                   </td>
                                   <td className="p-2 align-top">
                                       <div className="relative">
                                          <input type="number" placeholder="₹/KW" className="w-28 border border-gray-300 rounded p-2 pl-3 text-sm" value={row.discount} onChange={e => updatePlanRow(index, 'discount', e.target.value)} />
                                       </div>
                                   </td>
                                   <td className="p-2 align-top">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Active' ? 'bg-[#d4eddb] text-[#28a745]' : 'bg-[#f8d7da] text-[#dc3545]'}`}>
                                           {row.status}
                                       </span>
                                   </td>
                                   <td className="p-2 align-top text-center">
                                       <input type="checkbox" className="w-4 h-4 mt-2 cursor-pointer" checked={row.isSelectedForActivation} onChange={() => toggleRowActivationChoice(index)} />
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
               
               <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-200">
                   <button onClick={handleGenerate} className="bg-[#28a745] hover:bg-green-600 text-white px-5 py-2 rounded text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                      <Save size={16} /> Generate
                   </button>
               </div>
           </div>
        </div>

        {plans.length >= 0 && (
           <div className="mb-12">
               <h2 className="text-[18px] font-bold text-[#6c757d] mb-3">Plan Summary</h2>
               <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                   <div className="bg-[#28a745] text-white p-3">
                       <h3 className="font-bold text-[16px]">Bundle Plan Summary</h3>
                   </div>

                   <div className="p-6 border-b border-gray-100 flex justify-between items-end">
                       <div className="flex gap-x-24">
                           <div className="border-l-2 border-[#007bff] pl-3">
                               <h6 className="text-gray-800 text-[14px] font-bold mb-1">Country</h6>
                               <p className="font-bold text-[#007bff] text-[16px]">{selectedCountryId === 'all' ? 'All Countries' : (selectedCountryObj?.name || '-')}</p>
                           </div>
                           <div className="border-l-2 border-[#007bff] pl-3">
                               <h6 className="text-gray-800 text-[14px] font-bold mb-1">State</h6>
                               <p className="font-bold text-[#007bff] text-[16px]">{selectedStateId === 'all' ? 'All States' : (selectedStateObj?.name || '-')}</p>
                           </div>
                           <div className="border-l-2 border-[#007bff] pl-3">
                               <h6 className="text-gray-800 text-[14px] font-bold mb-1">Cluster</h6>
                               <p className="font-bold text-[#007bff] text-[16px]">{selectedClusterId === 'all' ? 'All Clusters' : (selectedClusterObj?.name || '-')}</p>
                           </div>
                           <div className="border-l-2 border-[#007bff] pl-3">
                               <h6 className="text-gray-800 text-[14px] font-bold mb-1">District</h6>
                               <p className="font-bold text-[#007bff] text-[16px]">{selectedDistrictId === 'all' ? 'All Districts' : (selectedDistrictObj?.name || '-')}</p>
                           </div>
                       </div>
                   </div>

                   <div className="px-6 py-4 flex justify-between items-center">
                       <h3 className="font-bold text-[16px] text-gray-800">Bundle Plans</h3>
                       <div className="flex gap-3">
                           <span className="bg-[#007bff] text-white px-3 py-1 rounded shadow-sm text-sm font-bold">Total Plans: {plans.length}</span>
                           <span className="bg-[#28a745] text-white px-3 py-1 rounded shadow-sm text-sm font-bold">Active Plans: {activePlansCount}</span>
                       </div>
                   </div>

                   <div className="overflow-x-auto w-full px-6 pb-6 w-full">
                       <table className="w-full text-left whitespace-nowrap min-w-max">
                           <thead className="bg-[#64b5f6] text-white">
                               <tr>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">#</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Product</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Brand</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">SKU Number</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Technology</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Wattage</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">KW Option</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Duration</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Start Date</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Discount (₹/KW)</th>
                                   <th className="p-3 text-[13px] font-bold border-r border-[#64b5f6]">Status</th>
                                   <th className="p-3 text-[13px] font-bold text-center">Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                               {plans.length === 0 ? (
                                   <tr><td colSpan="12" className="text-center p-6 text-gray-400">No Bundle Plans active for this location logic.</td></tr>
                               ) : plans.map((plan, idx) => (
                                   <tr key={plan._id} className="border-b border-gray-100 hover:bg-gray-50 border-x">
                                       <td className="p-3 text-sm text-gray-500 font-medium">{idx + 1}</td>
                                       <td className="p-3 text-sm font-medium text-gray-800">{plan.product}</td>
                                       <td className="p-3 text-sm text-gray-600">{plan.brand}</td>
                                       <td className="p-3 text-sm text-gray-600">{plan.sku}</td>
                                       <td className="p-3 text-sm text-gray-600">{plan.technology || '-'}</td>
                                        <td className="p-3 text-sm text-gray-600">{plan.wattage || '-'}</td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {editingPlanId === plan._id ? (
                                                <input type="number" className="w-16 border rounded p-1" value={editablePlans[0]?.kwOption} onChange={e => updateEditablePlanInPlace('kwOption', e.target.value)} />
                                            ) : `${plan.kwOption || '-'} KW`}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {editingPlanId === plan._id ? (
                                                <input type="number" className="w-16 border rounded p-1" value={editablePlans[0]?.duration} onChange={e => updateEditablePlanInPlace('duration', e.target.value)} />
                                            ) : `${plan.duration || '-'} Days`}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {editingPlanId === plan._id ? (
                                                <input type="date" className="border rounded p-1" value={editablePlans[0]?.startDate?.split('T')[0]} onChange={e => updateEditablePlanInPlace('startDate', e.target.value)} />
                                            ) : (plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '-')}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {editingPlanId === plan._id ? (
                                                <input type="number" className="w-20 border rounded p-1" value={editablePlans[0]?.discount} onChange={e => updateEditablePlanInPlace('discount', e.target.value)} />
                                            ) : (plan.discount ? `₹${plan.discount}` : '₹0')}
                                        </td>
                                        <td className="p-3 text-sm text-center">
                                            {editingPlanId === plan._id ? (
                                                <select className="border rounded p-1" value={editablePlans[0]?.status} onChange={e => updateEditablePlanInPlace('status', e.target.value)}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-[11px] font-bold ${plan.status === 'Active' ? 'bg-[#d4eddb] text-[#28a745]' : 'bg-[#f8d7da] text-[#dc3545]'}`}>
                                                    {plan.status || 'Active'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-center">
                                            <div className="flex justify-center gap-2">
                                                {editingPlanId === plan._id ? (
                                                    <>
                                                        <button onClick={saveRowEdits} className="text-green-500 hover:text-green-700 bg-green-50 p-2 rounded-full transition-colors" title="Save changes">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={cancelEditingRow} className="text-gray-500 hover:text-gray-700 bg-gray-50 p-2 rounded-full transition-colors" title="Cancel edit">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {plan.status === 'Inactive' && (
                                                            <button onClick={() => startEditingRow(plan)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors" title="Edit plan">
                                                                <Pencil size={16} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDeletePlan(plan._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors" title="Delete plan">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                       
                       {plans.length > 0 && (
                          <div className="mt-4 flex gap-3">
                              <button onClick={() => alert('Changes are now saved row-by-row.')} className="bg-[#28a745] hover:bg-green-600 text-white px-4 py-2 rounded text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                                 <CheckCircle size={14} /> Final Save Plan
                              </button>
                          </div>
                       )}
                   </div>
               </div>
           </div>
        )}

      </div>
    </div>
  );
}