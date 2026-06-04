// InventoryRestockLimit.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader, Globe, MapPin, Factory } from 'lucide-react';
import { locationAPI } from '../../../../api/api';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import toast from 'react-hot-toast';

const LocationCard = ({ title, subtitle, isSelected, onClick, colorClass = 'bg-[#206bc4]' }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl border-2 py-5 px-4 flex flex-col items-center justify-center text-center h-24 transition-all shadow-sm hover:shadow-md ${
      isSelected
        ? `${colorClass} border-transparent shadow-lg -translate-y-1 text-white`
        : 'border-transparent bg-white hover:border-gray-200 text-gray-800'
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

const InventoryRestockLimit = () => {
  // --- Location State (independent, direct API) ---
  const [locData, setLocData] = useState({ countries: [], states: [], clusters: [], warehouses: [] });
  const [selCountry, setSelCountry] = useState('');
  const [selState, setSelState]     = useState('');
  const [selCluster, setSelCluster] = useState('');
  const [selWarehouse, setSelWarehouse] = useState('');

  const [showLocationSection, setShowLocationSection] = useState(true);

  // Data
  const [products, setProducts]     = useState([]);
  const [limitInputs, setLimitInputs] = useState({});
  const [loading, setLoading]       = useState(false);

  // ── on mount: fetch countries ──────────────────────────────────────────────
  useEffect(() => { fetchCountries(); }, []);

  // ── country → states ───────────────────────────────────────────────────────
  useEffect(() => {
    if (selCountry) {
      fetchStates(selCountry);
    } else {
      setLocData(p => ({ ...p, states: [], clusters: [], warehouses: [] }));
    }
    setSelState(''); setSelCluster(''); setSelWarehouse('');
  }, [selCountry]);

  // ── state → clusters ───────────────────────────────────────────────────────
  useEffect(() => {
    if (selState) {
      fetchClusters(selState);
    } else {
      setLocData(p => ({ ...p, clusters: [], warehouses: [] }));
    }
    setSelCluster(''); setSelWarehouse('');
  }, [selState]);

  // ── cluster → districts ────────────────────────────────────────────────────
  useEffect(() => {
    if (selCluster) {
      fetchWarehouses(selCluster);
    } else {
      setLocData(p => ({ ...p, warehouses: [] }));
    }
    setSelWarehouse('');
  }, [selCluster]);

  const [editingId, setEditingId] = useState(null);

  // ── any selection → fetch restock limits ──────────────────────────────────
  useEffect(() => {
    fetchRestockLimits();
  }, [selCountry, selState, selCluster, selWarehouse]);

  // ── Location fetchers ─────────────────────────────────────────────────────
  const fetchCountries = async () => {
    try {
      const res = await locationAPI.getAllCountries({ isActive: true });
      setLocData(p => ({ ...p, countries: res.data?.data || [] }));
    } catch (err) { console.error('Failed to fetch countries', err); }
  };

  const fetchStates = async (countryId) => {
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

  const fetchClusters = async (stateId) => {
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

  const fetchWarehouses = async (clusterId) => {
    try {
      const params = { status: 'Active' };
      if (clusterId !== 'all') params.cluster = clusterId;
      if (selState && selState !== 'all') params.state = selState;
      
      const res = await inventoryApi.getAllWarehouses(params);
      setLocData(p => ({ ...p, warehouses: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch warehouses', err);
      setLocData(p => ({ ...p, warehouses: [] }));
    }
  };

  // ── Restock Limits fetch ───────────────────────────────────────────────────
  const fetchRestockLimits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selCountry && selCountry !== 'all') params.country = selCountry;
      if (selState   && selState   !== 'all') params.state   = selState;
      if (selCluster && selCluster !== 'all') params.cluster = selCluster;
      if (selWarehouse && selWarehouse !== 'all') {
        const selectedWh = locData.warehouses.find(w => w._id === selWarehouse);
        if (selectedWh?.district) {
          // If district is populated, use _id
          params.district = selectedWh.district._id || selectedWh.district;
        }
      }

      const response = await inventoryApi.getRestockLimits(params);
      const data = response.data || [];
      // Sort by name for better UX
      const sortedData = [...data].sort((a, b) => a.itemName.localeCompare(b.itemName));
      setProducts(sortedData);

      const initialInputs = {};
      sortedData.forEach(item => { initialInputs[item._id] = item.currentRestockLimit || ''; });
      setLimitInputs(initialInputs);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to fetch limits', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Selection handlers with Select All ────────────────────────────────────
  const handleCountrySelect = (id) => setSelCountry(p => p === id ? '' : id);
  const handleStateSelect   = (id) => setSelState(p => p === id ? '' : id);
  const handleClusterSelect = (id) => setSelCluster(p => p === id ? '' : id);
  const handleWarehouseSelect= (id) => setSelWarehouse(p => p === id ? '' : id);

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleAmountChange = (itemId, value) =>
    setLimitInputs(p => ({ ...p, [itemId]: value }));

  const handleSaveLimit = async (item) => {
    try {
      const threshold = limitInputs[item._id];
      if (threshold === '' || isNaN(threshold)) {
        toast.error('Please enter a valid amount');
        return;
      }
      await inventoryApi.setRestockLimit({ itemId: item._id, threshold: Number(threshold) });
      setProducts(pp => pp.map(p => p._id === item._id ? { ...p, currentRestockLimit: Number(threshold) } : p));
      setEditingId(null);
      toast.success(`Limit set to ₹${threshold} for ${item.itemName}`);
    } catch (error) {
      console.error('Failed to save limit', error);
      toast.error('Failed to save limit');
    }
  };

  const getDisplayValue = (item, field) => {
    if (item[field] && item[field] !== '-' && item[field] !== 'undefined') return item[field];
    const name = item.itemName || '';
    if (field === 'wattage') { const m = name.match(/(\d+(?:\.\d+)?)\s*W/i); if (m) return m[1]; }
    if (field === 'technology') {
      const techs = ['Mono Perc', 'Polycrystalline', 'Bifacial', 'Half Cut', 'Mono', 'Poly', 'Thin Film'];
      const found = techs.find(t => new RegExp(t, 'i').test(name));
      if (found) return found;
    }
    if (field === 'kitType') {
      if (item.kitType && item.kitType !== '-') return item.kitType;
      if (item.brand?.comboKit) return 'Combokit Available';
    }
    if (field === 'kitType' && name.includes('+')) {
      const parts = name.split('+');
      if (parts.length >= 2) return `${parts[0].trim().split(' ').pop()} + ${parts[1].trim().split(' ')[0]}`;
    }
    return '-';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 bg-[#f4f6fa] min-h-screen">

      {/* Header */}
      <div className="bg-white rounded border border-gray-200 mb-6 flex justify-between items-center pr-6 overflow-hidden">
        <h4 className="text-[#206bc4] text-xl font-bold py-4 px-6 border-l-4 border-l-blue-500">
          Inventory Restock Limit Setting
        </h4>
        <button
          onClick={() => setShowLocationSection(!showLocationSection)}
          className="text-[#3c50e0] hover:text-blue-700 text-sm flex items-center gap-1.5 font-semibold"
        >
          {showLocationSection ? <><EyeOff size={14} /> Hide Location Cards</> : <><Eye size={14} /> Show Location Cards</>}
        </button>
      </div>

      {/* Location Hierarchy */}
      {showLocationSection && (
        <div className="space-y-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">

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
                  colorClass="bg-[#1d64b2]"
                />
                {locData.states.map(s => (
                  <LocationCard
                    key={s._id} title={s.name} subtitle={s.code}
                    isSelected={selState === s._id}
                    onClick={() => handleStateSelect(s._id)}
                    colorClass="bg-[#1d64b2]"
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
                  colorClass="bg-[#17a2b8]"
                />
                {locData.clusters.map(cl => (
                  <LocationCard
                    key={cl._id} title={cl.name}
                    isSelected={selCluster === cl._id}
                    onClick={() => handleClusterSelect(cl._id)}
                    colorClass="bg-[#17a2b8]"
                  />
                ))}
                {locData.clusters.length === 0 && (
                  <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">No clusters found for this state.</div>
                )}
              </div>
            </section>
          )}

          {/* 4. Warehouse */}
          {selCluster && (
            <section className="animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Factory size={14} /> 4. Select Warehouse
                </h5>
                <button
                  onClick={() => handleWarehouseSelect('all')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                >
                  {selWarehouse === 'all' ? 'Unselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <LocationCard
                  title="All Warehouses" subtitle="ALL"
                  isSelected={selWarehouse === 'all'}
                  onClick={() => handleWarehouseSelect('all')}
                  colorClass="bg-[#28a745]"
                />
                {locData.warehouses.map(w => (
                  <LocationCard
                    key={w._id} title={w.name} subtitle={w.district?.name}
                    isSelected={selWarehouse === w._id}
                    onClick={() => handleWarehouseSelect(w._id)}
                    colorClass="bg-[#28a745]"
                  />
                ))}
                {locData.warehouses.length === 0 && (
                  <div className="col-span-full py-6 text-center text-gray-400 italic text-sm">No warehouses found for this cluster.</div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Table */}
      <h3 className="text-[22px] font-bold text-[#206bc4] mb-4">Inventory Restock Order Approval Table</h3>
      <div className="bg-white rounded overflow-hidden shadow-sm border border-gray-100 mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left align-middle whitespace-nowrap">
            <thead className="bg-[#75baff] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff]">Product</th>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff]">Brand</th>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff]">Combokit Selection</th>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff]">Technology</th>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff]">Watt</th>
                <th className="py-3 px-4 font-semibold border-r border-[#6eb0ff] min-w-[200px]">Restock Order Limit (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader className="animate-spin mx-auto text-blue-500" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No inventory items found.</td></tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 border-r border-gray-200 text-[#1c2434] font-medium">{item.itemName}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 text-[#1c2434]">{item.brand?.brand || '-'}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 text-[#1c2434]">{getDisplayValue(item, 'kitType')}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 text-[#1c2434] font-medium">{getDisplayValue(item, 'technology')}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 text-[#1c2434] font-medium">{getDisplayValue(item, 'wattage')}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200">
                        {editingId === item._id ? (
                            <input
                                type="number"
                                autoFocus
                                className="w-[90%] outline-none border border-gray-300 rounded focus:border-[#206bc4] text-gray-600 px-3 py-1.5 placeholder-gray-400 shadow-inner"
                                placeholder="Enter ₹ amount"
                                value={limitInputs[item._id] ?? ''}
                                onChange={(e) => handleAmountChange(item._id, e.target.value)}
                            />
                        ) : (
                            <div className="py-1.5 px-3 font-semibold text-gray-700">
                                ₹{item.currentRestockLimit || 0}
                            </div>
                        )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                        {editingId === item._id ? (
                            <button
                                onClick={() => handleSaveLimit(item)}
                                className="px-4 py-1.5 bg-[#28a745] text-white text-[13px] rounded hover:bg-[#218838] transition-colors font-bold flex items-center gap-1 mx-auto"
                            >
                                Done
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditingId(item._id)}
                                className="px-4 py-1.5 bg-[#007bff] text-white text-[13px] rounded hover:bg-[#0069d9] transition-colors font-bold flex items-center gap-1 mx-auto"
                            >
                                Edit
                            </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white py-4 rounded shadow-sm border border-gray-100 flex justify-center items-center">
        <span className="text-[14px] text-[#1c2434] font-medium">
          Copyright © {new Date().getFullYear()} Solarkits. All Rights Reserved.
        </span>
      </div>
    </div>
  );
};

export default InventoryRestockLimit;