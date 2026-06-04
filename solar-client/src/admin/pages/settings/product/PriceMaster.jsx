import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, AlertCircle, Loader2, Save, Pencil, Trash2, Plus } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import { masterApi } from '../../../../api/masterApi';
import {
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getBrands
} from '../../../../services/settings/orderProcurementSettingApi';

const PriceMaster = () => {
  // UI Data State
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectAllCountries, setSelectAllCountries] = useState(false);

  const [states, setStates] = useState([]);
  const [activeStateId, setActiveStateId] = useState(null);

  const [clusters, setClusters] = useState([]);
  const [activeClusterId, setActiveClusterId] = useState(null);

  // Dropdown Master Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]); // Sub Types depend on Project Types or mapped directly?
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    subProjectType: '',
    product: '',
    brand: '',
    search: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    subCategory: '',
    subProjectType: '',
    product: '',
    brand: '',
    search: ''
  });

  // Price Data
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceToEdit, setPriceToEdit] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    skuPrices: [] // [{ sku: '', skuCode: '', capacity: '', price: '', gst: '', basePrice: '' }]
  });
  const [skuLoading, setSkuLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Initial Boot
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [
        countryRes, stateRes, catRes, subCatRes, subPTypeRes, brandRes, prodRes, skuRes
      ] = await Promise.all([
        masterApi.getCountries(),
        masterApi.getStates(),
        getCategories(),
        getSubCategories(), // all sub categories
        getSubProjectTypes(), // all sub project types
        getBrands(),
        productApi.getAll(),
        productApi.getSkus()
      ]);

      const fetchedCountries = countryRes?.data || countryRes || [];
      setCountries(fetchedCountries);
      if (fetchedCountries.length > 0) {
        setSelectedCountries([fetchedCountries[0]._id]);
      }

      const fetchedStates = stateRes?.data || stateRes || [];
      setStates(fetchedStates);

      // Auto-select first state from the first country on load
      const filteredForFirstCountry = fetchedStates.filter(s =>
        fetchedCountries.length > 0 && (s.country?._id || s.country || s.countryId) === fetchedCountries[0]._id
      );

      if (filteredForFirstCountry.length > 0) {
        const firstStateId = filteredForFirstCountry[0]._id;
        setActiveStateId(firstStateId);
        fetchClusters(firstStateId);
      }

      setCategories(catRes?.data || []);

      const uniqueSubCats = Array.from(new Map((subCatRes?.data || []).map(item => [item.name, item])).values());
      const uniqueSubPTypes = Array.from(new Map((subPTypeRes?.data || []).map(item => [item.name, item])).values());

      setSubCategories(uniqueSubCats);
      setSubProjectTypes(uniqueSubPTypes);
      setBrands(Array.isArray(brandRes) ? brandRes : brandRes?.data || []);
      setAllProducts(prodRes?.data?.data || prodRes?.data || []);

      const skus = skuRes?.data?.data || skuRes?.data || [];
      const uniqueTechs = [...new Set(skus.map(s => s.technology).filter(Boolean))];
      setTechnologies(uniqueTechs);

    } catch (error) {
      console.error(error);
      showToast("Failed to fetch initial masters", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCountryToggle = (countryId) => {
    setSelectedCountries(prev => {
      const next = prev.includes(countryId) ? prev.filter(id => id !== countryId) : [...prev, countryId];
      // Reset lower selections when boundaries change
      setActiveStateId(null);
      setActiveClusterId(null);
      setSelectAllCountries(false);
      return next;
    });
  };

  const toggleSelectAllCountries = () => {
    if (selectAllCountries) {
      setSelectedCountries([]);
      setActiveStateId(null);
      setActiveClusterId(null);
    } else {
      setSelectedCountries(countries.map(c => c._id));
    }
    setSelectAllCountries(!selectAllCountries);
  };

  // Filter states based on selected countries
  const filteredStates = states.filter(s =>
    selectedCountries.length > 0 && selectedCountries.includes(s.country?._id || s.country || s.countryId)
  );

  const fetchClusters = async (stateId) => {
    try {
      if (!stateId) return;
      const res = await masterApi.getClusters({ stateId });
      const fetchedClusters = res?.data || res || [];
      setClusters(fetchedClusters);
      if (fetchedClusters.length > 0) {
        setActiveClusterId(fetchedClusters[0]._id);
      } else {
        setActiveClusterId(null);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch clusters", "error");
    }
  };

  // When State Changes, fetch new clusters
  useEffect(() => {
    if (activeStateId) fetchClusters(activeStateId);
  }, [activeStateId]);

  // When Active State & Cluster is ready, fetch prices for this geofence
  useEffect(() => {
    if (activeStateId && activeClusterId) {
      fetchPrices(activeStateId, activeClusterId);
    } else {
      setPrices([]);
    }
  }, [activeStateId, activeClusterId]);

  const fetchPrices = async (stateId, clusterId) => {
    try {
      setLoading(true);
      const res = await productApi.getProductPrices({ stateId, clusterId });
      if (res.data.success) {
        setPrices(res.data.data);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch prices for this region", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter computation
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  // Determine the display list of products based on applied filters
  const filteredProducts = allProducts.filter(p => {
    let match = true;
    if (appliedFilters.category && p.categoryId?._id !== appliedFilters.category && p.categoryId !== appliedFilters.category) match = false;
    if (appliedFilters.subCategory && p.subCategoryId?._id !== appliedFilters.subCategory && p.subCategoryId !== appliedFilters.subCategory) match = false;

    if (appliedFilters.subProjectType) {
      const filterId = appliedFilters.subProjectType;
      const hasSingleMatch = p.subProjectTypeId?._id === filterId || p.subProjectTypeId === filterId || p.subProjectTypeId?.name === filterId;
      const hasMultiMatch = Array.isArray(p.subProjectTypeIds) && p.subProjectTypeIds.some(s => s._id === filterId || s === filterId || s.name === filterId);
      if (!hasSingleMatch && !hasMultiMatch) match = false;
    }

    if (appliedFilters.brand && p.brandId?._id !== appliedFilters.brand && p.brandId !== appliedFilters.brand) match = false;
    if (appliedFilters.product && p._id !== appliedFilters.product) match = false;

    if (appliedFilters.search) {
      const s = appliedFilters.search.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(s);
      const brandMatch = (p.brandId?.name || p.brandId?.brand || p.brandId?.companyName || '').toLowerCase().includes(s);
      if (!nameMatch && !brandMatch) match = false;
    }

    return match;
  });

  // Summary Metrics based on SKUs
  const allSkusOfFilteredProducts = filteredProducts.reduce((acc, p) => [...acc, ...(p.skuId ? [p.skuId] : []), ...(p.additionalSkus || []).map(code => ({ skuCode: code, productId: p._id }))], []);
  const totalSkus = allSkusOfFilteredProducts.length;
  // Note: Finding SKUs with price is complex since we don't have all SKU objects loaded here, 
  // but we can estimate based on products that have at least one price entry in 'prices' state
  const productsWithAtLeastOnePrice = filteredProducts.filter(p => prices.some(pr => pr.product?._id === p._id || pr.product === p._id));
  const skusWithPriceCount = productsWithAtLeastOnePrice.length; // Simplified for now since we usually set all SKUs together
  const skusWithoutPriceCount = filteredProducts.length - skusWithPriceCount;

  // Calculation Logic for SKU rows
  const updateSkuPrice = (index, field, value) => {
    const updated = [...formData.skuPrices];
    updated[index][field] = value;

    if (field === 'price' || field === 'gst') {
      const p = parseFloat(updated[index].price) || 0;
      const g = parseFloat(updated[index].gst) || 0;
      updated[index].basePrice = Number(p / (1 + g / 100)).toFixed(2);
    }

    setFormData({ ...formData, skuPrices: updated });
  };

  const handleOpenSetPrice = async (product) => {
    setIsModalOpen(true);
    setSkuLoading(true);
    setFormData({ productId: product._id, skuPrices: [] });

    try {
      // 1. Fetch all SKUs for this product
      const skuRes = await productApi.getSkusByProduct(product._id);
      const skus = skuRes.data.data || [];

      // 2. Fetch existing prices for these SKUs in current cluster
      const priceRes = await productApi.getProductPrices({
        productId: product._id,
        clusterId: activeClusterId
      });
      const existingPrices = priceRes.data.data || [];

      // 3. Map SKUs to pricing rows
      const skuPrices = skus.map(sku => {
        const ep = existingPrices.find(p => p.sku?._id === sku._id || p.sku === sku._id);
        return {
          sku: sku._id,
          skuCode: sku.skuCode,
          capacity: sku.capacity,
          price: ep?.price || '',
          gst: ep?.gst || '5', // Default 5%
          basePrice: ep?.basePrice || '0.00'
        };
      });

      setFormData(prev => ({ ...prev, skuPrices }));
    } catch (error) {
      console.error("Error loading SKUs/Prices:", error);
      showToast("Failed to load SKU data", "error");
    } finally {
      setSkuLoading(false);
    }
  };

  const handleSubmitPrice = async () => {
    if (!activeStateId || !activeClusterId) {
      showToast("State and Cluster are required", "error");
      return;
    }

    try {
      const payload = {
        prices: formData.skuPrices.map(sp => ({
          product: formData.productId,
          sku: sp.sku,
          state: activeStateId,
          cluster: activeClusterId,
          price: parseFloat(sp.price) || 0,
          gst: parseFloat(sp.gst) || 0,
          basePrice: parseFloat(sp.basePrice) || 0
        }))
      };

      await productApi.bulkUpsertPriceMaster(payload);
      showToast("Prices saved successfully");
      setIsModalOpen(false);
      fetchPrices(activeStateId, activeClusterId);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save prices', 'error');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-lg shadow-lg flex items-center gap-2 text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Price Master</h2>
      </div>

      {/* Select Country */}
      <div className="bg-white border border-gray-200 mb-6 font-sans">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-blue-500 font-bold text-sm uppercase tracking-tight">Select Country</h2>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="selectAllCountries"
              className="w-3.5 h-3.5 text-blue-500 rounded focus:ring-blue-500 border-gray-300"
              checked={selectAllCountries}
              onChange={toggleSelectAllCountries}
            />
            <label htmlFor="selectAllCountries" className="text-gray-500 text-xs cursor-pointer">Select All Countries</label>
          </div>

          <div className="flex flex-wrap gap-4 overflow-hidden pb-2">
            {countries.map((country) => (
              <button
                key={country._id}
                onClick={() => handleCountryToggle(country._id)}
                className={`min-w-[176px] h-24 flex flex-col justify-center items-center border rounded transition-all duration-200 ${selectedCountries.includes(country._id)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-blue-200 text-gray-700 hover:border-blue-300'
                  }`}
              >
                <span className="font-bold uppercase tracking-wider text-xs">{country.name}</span>
                <span className="text-xs mt-1 opacity-80">{country.shortName || country.name.substring(0, 2).toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Select State */}
      <div className="bg-white border border-gray-200 mb-6 font-sans">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-blue-500 font-bold text-sm uppercase tracking-tight">Select State (Filtered by Country)</h2>
        </div>
        <div className="p-4 overflow-hidden">
          <div className="flex flex-wrap gap-4">
            {filteredStates.map(state => (
              <button
                key={state._id}
                onClick={() => setActiveStateId(state._id)}
                className={`p-4 border border-[#42A5F5] text-center rounded shadow-sm hover:shadow-md transition-all min-w-[176px] ${activeStateId === state._id ? 'bg-[#1976D2] text-white' : 'bg-white text-gray-700'
                  }`}
              >
                <div className="text-sm font-semibold">{state.name.toUpperCase()}</div>
                <div className={`text-xs mt-1 ${activeStateId === state._id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {state.code || state.name.substring(0, 2).toUpperCase()}
                </div>
              </button>
            ))}
            {filteredStates.length === 0 && <div className="text-gray-400 text-sm p-4 w-full text-center">No states found for selected country.</div>}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Select Cluster</h3>

      {/* Clusters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {clusters.length === 0 ? (
          <div className="col-span-full text-gray-400 p-4 border rounded bg-white text-center">No clusters available for this state</div>
        ) : (
          clusters.map(cluster => (
            <button
              key={cluster._id}
              onClick={() => setActiveClusterId(cluster._id)}
              className={`p-3 text-center rounded shadow-sm hover:shadow-md transition-all ${activeClusterId === cluster._id ? 'bg-[#7E57C2] text-white' : 'bg-gray-100 text-gray-700 border'
                }`}
            >
              <div className="text-sm">{cluster.name}</div>
            </button>
          ))
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select className="w-full border rounded p-2 text-sm" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sub Category</label>
            <select className="w-full border rounded p-2 text-sm" value={filters.subCategory} onChange={e => setFilters({ ...filters, subCategory: e.target.value })}>
              <option value="">All Sub Categories</option>
              {subCategories.map(sc => <option key={sc._id} value={sc.name}>{sc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sub Project Type</label>
            <select className="w-full border rounded p-2 text-sm" value={filters.subProjectType} onChange={e => setFilters({ ...filters, subProjectType: e.target.value })}>
              <option value="">All Sub Types</option>
              {subProjectTypes.map(spt => <option key={spt._id} value={spt.name}>{spt.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product</label>
            <select className="w-full border rounded p-2 text-sm" value={filters.product} onChange={e => setFilters({ ...filters, product: e.target.value })}>
              <option value="">All Products</option>
              {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Brand</label>
            <select className="w-full border rounded p-2 text-sm" value={filters.brand} onChange={e => setFilters({ ...filters, brand: e.target.value })}>
              <option value="">All Brands</option>
              {brands.map(b => <option key={b._id} value={b.name}>{b.name || b.companyName}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Search Product / Brand</label>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="Type to search..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleApplyFilters} className="bg-[#1976D2] hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2">
            <Search size={16} /> Apply Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
          <h4 className="text-gray-800 font-semibold mb-2">Total SKUs</h4>
          <div className="text-2xl font-bold text-blue-600">{totalSkus}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-indigo-500">
          <h4 className="text-gray-800 font-semibold mb-2">SKUs With Price</h4>
          <div className="text-2xl font-bold text-indigo-600">{skusWithPriceCount}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500">
          <h4 className="text-gray-800 font-semibold mb-2">SKUs Without Price</h4>
          <div className="text-2xl font-bold text-red-600">{skusWithoutPriceCount}</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border">
        <div className="bg-[#1976D2] p-4 text-white font-bold flex justify-between items-center">
          <span>Products</span>
        </div>

        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#90CAF9] text-gray-800 border-b">
                <tr>
                  <th className="p-3 font-semibold">Brand</th>
                  <th className="p-3 font-semibold">Product Name</th>
                  <th className="p-3 font-semibold">Sub Category</th>
                  <th className="p-3 font-semibold">Project Category</th>
                  <th className="p-3 font-semibold">Sub Project Type</th>
                  <th className="p-3 font-semibold">Technology</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No products found matching filters</td></tr>
                ) : (
                  filteredProducts.map(p => {
                    // Check if price exists
                    const existingPrice = prices.find(price => price.product?._id === p._id || price.product === p._id);

                    return (
                      <tr key={p._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{p.brandId?.name || p.brandId?.companyName || '-'}</td>
                        <td className="p-3 font-medium text-blue-800">{p.name}</td>
                        <td className="p-3">{p.subCategoryId?.name || '-'}</td>
                        <td className="p-3">{p.categoryId?.name || '-'}</td>
                        <td className="p-3">
                          {p.subProjectTypeIds && p.subProjectTypeIds.length > 0
                            ? p.subProjectTypeIds.map(s => s.name || s.subProjectType || s.type).join(', ')
                            : (p.subProjectTypeId?.name || p.subProjectTypeId?.subProjectType || '-')}
                        </td>
                        <td className="p-3">{p.technology || '-'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenSetPrice(p)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${existingPrice
                                ? 'bg-[#FFB347] text-white hover:bg-[#FFA31A]'
                                : 'bg-[#28a745] text-white hover:bg-[#218838]'
                              }`}
                          >
                            {existingPrice ? (
                              <><Pencil size={12} /> Edit Price</>
                            ) : (
                              <><Plus size={12} /> Add Price</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Price Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-bold text-gray-800">Set Price</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex justify-between items-center mb-6">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Product</span>
                  <span className="text-blue-700 font-bold">
                    {allProducts.find(p => p._id === formData.productId)?.name || 'Loading...'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Cluster</span>
                  <span className="text-gray-700 font-bold">
                    {clusters.find(c => c._id === activeClusterId)?.name || '-'}
                  </span>
                </div>
              </div>

              {skuLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="text-gray-500 font-medium tracking-tight">Loading SKUs and Existing Prices...</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-100/80 text-gray-700 border-b">
                      <tr>
                        <th className="p-4 font-bold uppercase tracking-tight text-[10px]">SKU Code</th>
                        <th className="p-4 font-bold uppercase tracking-tight text-[10px]">Capacity</th>
                        <th className="p-4 font-bold uppercase tracking-tight text-[10px] w-48">Price (₹)</th>
                        <th className="p-4 font-bold uppercase tracking-tight text-[10px] w-32">GST (%)</th>
                        <th className="p-4 font-bold uppercase tracking-tight text-[10px] w-40">Base Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.skuPrices.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-gray-400 italic">
                            No SKUs generated for this product.
                            <br />
                            <span className="text-xs not-italic text-blue-500 font-medium">Please generate SKUs first in the SKUs page.</span>
                          </td>
                        </tr>
                      ) : (
                        formData.skuPrices.map((sp, idx) => (
                          <tr key={sp.sku} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 font-mono text-xs font-bold text-blue-600">{sp.skuCode}</td>
                            <td className="p-4 font-medium text-gray-700">{sp.capacity}</td>
                            <td className="p-4">
                              <input
                                type="number"
                                className="w-full border border-gray-200 rounded px-3 py-1.5 focus:ring-1 focus:ring-blue-400 outline-none transition-shadow shadow-sm"
                                placeholder="Enter price"
                                value={sp.price}
                                onChange={(e) => updateSkuPrice(idx, 'price', e.target.value)}
                              />
                            </td>
                            <td className="p-4">
                              <select
                                className="w-full border border-gray-200 rounded px-3 py-1.5 focus:ring-1 focus:ring-blue-400 outline-none bg-white shadow-sm"
                                value={sp.gst}
                                onChange={(e) => updateSkuPrice(idx, 'gst', e.target.value)}
                              >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </td>
                            <td className="p-4 font-bold text-gray-900 bg-gray-50/50">
                              ₹{Number(sp.basePrice).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded hover:bg-gray-100 font-medium">Cancel</button>
              <button onClick={handleSubmitPrice} className="px-6 py-2 bg-[#2E5BFF] text-white rounded hover:bg-blue-700 font-bold">Save Price</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PriceMaster;