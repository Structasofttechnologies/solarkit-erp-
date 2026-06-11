// InventoryLevelManagementSetting.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Filter, RefreshCw, Settings, Search, X, Loader, MapPin, Globe, Factory, Package } from 'lucide-react';
import { locationAPI } from '../../../../api/api';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import { productApi } from '../../../../api/productApi';
import { getAllManufacturers } from '../../../../services/brand/brandApi';
import toast from 'react-hot-toast';

const InventoryLevelManagementSetting = () => {
  // --- Independent Location State (avoids cascading hook effects and CastErrors) ---
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: []
  });
  const [selCountry, setSelCountry] = useState('');
  const [selState, setSelState] = useState('');
  const [selCluster, setSelCluster] = useState('');
  const [selDistrict, setSelDistrict] = useState('');

  // Dynamic Master API States
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [dynamicSubCategories, setDynamicSubCategories] = useState([]);
  const [dynamicProjectTypes, setDynamicProjectTypes] = useState([]);
  const [dynamicSubProjectTypes, setDynamicSubProjectTypes] = useState([]);

  const [showSelectionPanel, setShowSelectionPanel] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [activeFilters, setActiveFilters] = useState({
    brand: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    productName: '',
    sku: ''
  });

  // Load Initial Data on mount
  useEffect(() => {
    loadBrands();
    loadFiltersData();
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selCountry) {
      fetchStatesLocal(selCountry);
    } else {
      setLocationData(prev => ({ ...prev, states: [], clusters: [], districts: [] }));
    }
    setSelState('');
    setSelCluster('');
    setSelDistrict('');
  }, [selCountry]);

  // Fetch clusters when state changes
  useEffect(() => {
    if (selState) {
      fetchClustersLocal(selState);
    } else {
      setLocationData(prev => ({ ...prev, clusters: [], districts: [] }));
    }
    setSelCluster('');
    setSelDistrict('');
  }, [selState]);

  // Fetch districts when cluster changes
  useEffect(() => {
    if (selCluster) {
      fetchDistrictsLocal(selCluster);
    } else {
      setLocationData(prev => ({ ...prev, districts: [] }));
    }
    setSelDistrict('');
  }, [selCluster]);

  // Fetch inventory whenever selections or filters change
  useEffect(() => {
    if (selCountry) {
      fetchInventory();
    } else {
      setInventoryData([]);
    }
  }, [selCountry, selState, selCluster, selDistrict, activeFilters]);

  // --- Location Fetchers (direct API — avoids [object Object] CastError from hook internals) ---
  const fetchCountries = async () => {
    try {
      const res = await locationAPI.getAllCountries({ isActive: true });
      setLocationData(prev => ({ ...prev, countries: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch countries', err);
    }
  };

  const fetchStatesLocal = async (countryId) => {
    try {
      const params = { isActive: true };
      if (countryId !== 'all') params.countryId = countryId;
      const res = await locationAPI.getAllStates(params);
      setLocationData(prev => ({ ...prev, states: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch states', err);
      setLocationData(prev => ({ ...prev, states: [] }));
    }
  };

  const fetchClustersLocal = async (stateId) => {
    try {
      const params = { isActive: true };
      if (stateId !== 'all') params.stateId = stateId;
      const res = await locationAPI.getAllClusters(params);
      setLocationData(prev => ({ ...prev, clusters: res.data?.data || [] }));
    } catch (err) {
      console.error('Failed to fetch clusters', err);
      setLocationData(prev => ({ ...prev, clusters: [] }));
    }
  };

  const fetchDistrictsLocal = async (clusterId) => {
    try {
      if (clusterId === 'all') {
        const params = { isActive: true };
        if (selState && selState !== 'all') params.stateId = selState;
        const res = await locationAPI.getAllDistricts(params);
        setLocationData(prev => ({ ...prev, districts: res.data?.data || [] }));
      } else {
        const res = await locationAPI.getClusterById(clusterId);
        setLocationData(prev => ({ ...prev, districts: res.data?.data?.districts || [] }));
      }
    } catch (err) {
      console.error('Failed to fetch districts', err);
      setLocationData(prev => ({ ...prev, districts: [] }));
    }
  };

  const loadBrands = async () => {
    try {
      const res = await getAllManufacturers();
      // res is response.data from brandApi (already unwrapped)
      const manufacturers = Array.isArray(res) ? res : (res?.data || res?.manufacturers || []);
      // Deduplicate by brandName
      const seen = new Set();
      const unique = manufacturers.filter(m => {
        const name = m.brandName || m.companyName || m.company || '';
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      });
      setBrands(unique);
    } catch (error) {
      console.error("Failed to load brands", error);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [catRes, subCatRes, subPTypeRes, mappingsRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getSubCategories(),
        productApi.getSubProjectTypes(),
        productApi.getProjectCategoryMappings()   // Real source for project type ranges
      ]);

      // Handle different possible response shapes from the API
      const extract = (res) => {
        const d = res?.data;
        if (!d) return [];
        if (Array.isArray(d)) return d;
        if (Array.isArray(d.data)) return d.data;
        return [];
      };

      setDynamicCategories(extract(catRes));
      setDynamicSubCategories(extract(subCatRes));
      setDynamicSubProjectTypes(extract(subPTypeRes));

      // Build unique project type ranges from mappings (e.g. "3 to 30 kW")
      const mappings = extract(mappingsRes);
      const seen = new Set();
      const uniqueRanges = [];
      mappings.forEach(m => {
        if (m.projectTypeFrom !== undefined && m.projectTypeTo !== undefined) {
          const key = `${m.projectTypeFrom}-${m.projectTypeTo}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueRanges.push({
              _id: key,
              name: `${m.projectTypeFrom} to ${m.projectTypeTo} kW`,
              from: m.projectTypeFrom,
              to: m.projectTypeTo
            });
          }
        }
      });
      // Sort by projectTypeFrom ascending
      uniqueRanges.sort((a, b) => a.from - b.from);
      setDynamicProjectTypes(uniqueRanges);
    } catch (error) {
      console.error("Failed to load master filter data:", error);
    }
  };


  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        country: selCountry === 'all' ? undefined : selCountry,
        state: selState === 'all' ? undefined : selState,
        cluster: selCluster === 'all' ? undefined : selCluster,
        district: selDistrict === 'all' ? undefined : selDistrict,
        ...activeFilters
      };
      // Remove empty/undefined params
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === '') && delete params[key]);

      const response = await inventoryApi.getItems(params);
      setInventoryData(response.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const handleCountrySelect = (countryId) => {
    if (countryId === 'all') {
      setSelCountry(selCountry === 'all' ? '' : 'all');
    } else {
      setSelCountry(prev => prev === countryId ? '' : countryId);
    }
  };

  const handleStateSelect = (stateId) => {
    if (stateId === 'all') {
      setSelState(selState === 'all' ? '' : 'all');
    } else {
      setSelState(prev => prev === stateId ? '' : stateId);
    }
  };

  const handleClusterSelect = (clusterId) => {
    if (clusterId === 'all') {
      setSelCluster(selCluster === 'all' ? '' : 'all');
    } else {
      setSelCluster(prev => prev === clusterId ? '' : clusterId);
    }
  };

  const handleDistrictSelect = (districtId) => {
    if (districtId === 'all') {
      setSelDistrict(selDistrict === 'all' ? '' : 'all');
    } else {
      setSelDistrict(prev => prev === districtId ? '' : districtId);
    }
  };

  const LocationCard = ({ title, subtitle, isSelected, onClick, colorClass = 'border-blue-500 bg-blue-50' }) => (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-24 shadow-sm hover:shadow-md ${isSelected
        ? `${colorClass} shadow-lg -translate-y-1 text-white border-transparent`
        : 'border-transparent bg-white hover:border-gray-200'
        }`}
    >
      <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-800'} mb-1`}>{title}</div>
      {subtitle && <div className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{subtitle}</div>}
    </div>
  );

  // --- Filter Handlers ---
  const handleResetFilters = () => {
    setActiveFilters({
      brand: '',
      category: '',
      subCategory: '',
      projectType: '',
      subProjectType: '',
      productName: '',
      sku: ''
    });
  };

  // Extract unique products and SKUs for filter dropdowns from current view data
  const uniqueProducts = useMemo(() => {
    const products = new Set(inventoryData.map(item => item.itemName));
    return Array.from(products).filter(Boolean).sort();
  }, [inventoryData]);

  const uniqueSkus = useMemo(() => {
    const skus = new Set(inventoryData.map(item => item.sku));
    return Array.from(skus).filter(Boolean).sort();
  }, [inventoryData]);

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditForm({
      sku: product.sku || '',
      brand: product.brand?._id || '',
      itemName: product.itemName || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      quantity: product.quantity || 0,
      cluster: product.cluster?._id || product.cluster || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      await inventoryApi.updateItem(id, editForm);
      toast.success('Item updated successfully');
      setEditingId(null);
      fetchInventory();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // --- Render Clusters ---
  // Removed old renderClusters as it is integrated into the main flow

  // --- Component ---
  return (
    <div className="container mx-auto px-4 py-6 bg-[#f4f6fa] min-h-screen">
      {/* Title with Toggle Button */}
      <div className="bg-white rounded border border-gray-200 mb-6 flex justify-between items-center pr-6 overflow-hidden">
        <h4 className="text-[#206bc4] text-xl font-bold py-4 px-6 border-l-4 border-l-blue-500">Inventory Level Management Setting</h4>
        <div className="flex items-center">
          <div className="flex overflow-hidden">
            <button
              onClick={() => setShowSelectionPanel(true)}
              className={`px-4 py-2 flex items-center text-sm font-semibold rounded-l border border-r-0 ${showSelectionPanel
                ? 'bg-[#206bc4] text-white border-[#206bc4]'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Eye size={16} className="mr-2" />
              Show
            </button>
            <button
              onClick={() => setShowSelectionPanel(false)}
              className={`px-4 py-2 flex items-center text-sm font-semibold rounded-r border ${!showSelectionPanel
                ? 'bg-[#206bc4] text-white border-[#206bc4]'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
            >
              <EyeOff size={16} className="mr-2" />
              Hide
            </button>
          </div>
        </div>
      </div>

      {/* Selection Panel */}
      {showSelectionPanel && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Country Selection */}
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
                title="All Countries"
                subtitle="ALL"
                isSelected={selCountry === 'all'}
                onClick={() => handleCountrySelect('all')}
                colorClass="bg-[#6c5ce7] border-[#6c5ce7] shadow-purple-100"
              />
              {locationData.countries.map(country => (
                <LocationCard
                  key={country._id}
                  title={country.name}
                  subtitle={country.code}
                  isSelected={selCountry === country._id}
                  onClick={() => handleCountrySelect(country._id)}
                  colorClass="bg-[#6c5ce7] border-[#6c5ce7] shadow-purple-100"
                />
              ))}
              {locationData.countries.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 italic">No Countries found.</div>}
            </div>
          </section>

          {/* State Selection */}
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
                  title="All States"
                  subtitle="ALL"
                  isSelected={selState === 'all'}
                  onClick={() => handleStateSelect('all')}
                  colorClass="bg-[#1d64b2] border-[#1d64b2] shadow-blue-100"
                />
                {locationData.states.map(state => (
                  <LocationCard
                    key={state._id}
                    title={state.name}
                    subtitle={state.code}
                    isSelected={selState === state._id}
                    onClick={() => handleStateSelect(state._id)}
                    colorClass="bg-[#1d64b2] border-[#1d64b2] shadow-blue-100"
                  />
                ))}
                {locationData.states.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 italic">No States found for this country.</div>}
              </div>
            </section>
          )}

          {/* Cluster Selection */}
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
                  title="All Clusters"
                  subtitle="ALL"
                  isSelected={selCluster === 'all'}
                  onClick={() => handleClusterSelect('all')}
                  colorClass="bg-[#17a2b8] border-[#17a2b8] shadow-teal-100"
                />
                {locationData.clusters.map(cluster => (
                  <LocationCard
                    key={cluster._id}
                    title={cluster.name}
                    isSelected={selCluster === cluster._id}
                    onClick={() => handleClusterSelect(cluster._id)}
                    colorClass="bg-[#17a2b8] border-[#17a2b8] shadow-teal-100"
                  />
                ))}
                {locationData.clusters.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 italic">No Clusters found for this state.</div>}
              </div>
            </section>
          )}

          {/* District Selection */}
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
                  title="All Districts"
                  subtitle="ALL"
                  isSelected={selDistrict === 'all'}
                  onClick={() => handleDistrictSelect('all')}
                  colorClass="bg-[#28a745] border-[#28a745] shadow-green-100"
                />
                {locationData.districts.map(district => (
                  <LocationCard
                    key={district._id}
                    title={district.name}
                    isSelected={selDistrict === district._id}
                    onClick={() => handleDistrictSelect(district._id)}
                    colorClass="bg-[#28a745] border-[#28a745] shadow-green-100"
                  />
                ))}
                {locationData.districts.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 italic">No Districts found for this cluster.</div>}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Inventory Table */}
      {selCountry && (
        <div className="mt-8">
          {/* FILTER SECTION */}
          <div className="bg-white rounded border border-gray-200 mb-6 p-6">
            <h5 className="text-[#206bc4] text-lg font-bold mb-4">Filter Options</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Brand</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={activeFilters.brand}
                  onChange={(e) => setActiveFilters({ ...activeFilters, brand: e.target.value })}
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.brandName || b.companyName || b.company || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={activeFilters.category}
                  onChange={(e) => setActiveFilters({ ...activeFilters, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {dynamicCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name || c.categoryName || c._id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Sub Category</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={activeFilters.subCategory}
                  onChange={(e) => setActiveFilters({ ...activeFilters, subCategory: e.target.value })}
                >
                  <option value="">Sub Category</option>
                  {dynamicSubCategories.map(sc => (
                    <option key={sc._id} value={sc._id}>{sc.name || sc.subCategoryName || sc._id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Project Type (kW)</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={activeFilters.projectType}
                  onChange={(e) => setActiveFilters({ ...activeFilters, projectType: e.target.value })}
                >
                  <option value="">Select Range</option>
                  {dynamicProjectTypes.map(pt => (
                    <option key={pt._id} value={pt._id}>{pt.name || pt.projectTypeName || pt._id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Sub Project Type</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={activeFilters.subProjectType}
                  onChange={(e) => setActiveFilters({ ...activeFilters, subProjectType: e.target.value })}
                >
                  <option value="">Sub Project Type</option>
                  {dynamicSubProjectTypes.map(spt => (
                    <option key={spt._id} value={spt._id}>{spt.name || spt.subProjectTypeName || spt._id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 mt-4 items-center">
              <button
                className="px-4 py-2 bg-[#206bc4] text-white rounded text-sm font-semibold flex items-center mr-4"
              >
                <Filter size={14} className="mr-2" />
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold flex items-center"
              >
                <RefreshCw size={14} className="mr-1" />
                Reset Filters
              </button>
            </div>
          </div>

          {/* Product Inventory Table */}
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 bg-gray-50 border-b">
              <h5 className="text-lg font-bold text-[#1a237e]">Product Inventory</h5>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#343a40] text-white text-sm">
                  <tr>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">#</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Serial No</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Brand</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Product</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Product Name</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Sub Category</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Project Category</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Project Type</th>
                    <th className="py-3 px-4 text-left whitespace-nowrap font-medium">Sub Project Type</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="py-8 text-center"><Loader className="animate-spin mx-auto" /></td></tr>
                  ) : inventoryData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        <Search className="mx-auto mb-2" size={32} />
                        <p>No products found matching your criteria</p>
                      </td>
                    </tr>
                  ) : (
                    inventoryData.map((product, index) => (
                      <tr key={product._id} className="border-b hover:bg-gray-50 text-sm text-gray-800">
                        <td className="py-3 px-4 whitespace-nowrap font-medium">{index + 1}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.sku || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.brand?.brandName || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.category || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap font-semibold">{product.itemName || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.subCategory || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.projectCategory || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.projectType || 'N/A'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{product.subProjectType || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryLevelManagementSetting;