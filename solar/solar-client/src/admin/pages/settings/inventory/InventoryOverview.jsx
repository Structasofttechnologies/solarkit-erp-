// InventoryManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, X, Filter, RefreshCw, Settings, AlertTriangle,
  ChevronUp, ChevronDown, Save, Plus, Minus,
  Factory, MapPin, Users, Package, Loader, Pencil, Trash2
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import inventoryApi from '../../../../services/inventory/inventoryApi';
import * as partnerApi from '../../../../services/partner/partnerApi';
import { getCategories, getSubCategories, getProjectTypes, getSubProjectTypes, getProjectCategoryMappings } from '../../../../services/combokit/combokitApi';
import { getAllManufacturers } from '../../../../services/brand/brandApi';
import { productApi } from '../../../../api/productApi';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  // --- Location Hook ---
  const {
    countries,
    states,
    clusters,
    districts,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
    loading: locationsLoading,
    fetchStates
  } = useLocations();

  const [selectedCountry, setSelectedCountry] = useState('');

  const [selectedPartner, setSelectedPartner] = useState('');
  const [partnerPlans, setPartnerPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Inventory Data
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0
  });

  // Settings / Thresholds
  const [settings, setSettings] = useState({
    globalLowStockThreshold: 10,
    brandThresholds: [],
    productThresholds: []
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);

  // Actions State
  const [editingItem, setEditingItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPartnerTypes();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, subCats, projs, subProjs, mappings] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getProjectTypes(),
        getSubProjectTypes(),
        getProjectCategoryMappings()
      ]);

      setMasterCategories(cats || []);
      setMasterSubCategories(subCats || []);

      const uniqueProjectTypes = (mappings?.length > 0)
        ? Array.from(new Set(mappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`))).filter(Boolean).sort()
        : projs?.map(p => p.name) || [];

      setMasterProjectTypes(uniqueProjectTypes);
      setMasterSubProjectTypes(subProjs || []);
      setProjectMappings(mappings || []);
    } catch (err) {
      console.error("Failed to fetch master data", err);
    }
  };

  const fetchPartnerTypes = async () => {
    try {
      const res = await partnerApi.getPartners();
      // res could be the array directly or a wrapper object
      const data = Array.isArray(res) ? res : (res.data || []);
      setPartnerTypes(data);
    } catch (err) {
      console.error("Failed to fetch partner types", err);
      setPartnerTypes([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await inventoryApi.getSettings();
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const getThresholdForItem = useCallback((item) => {
    // 1. Product-wise
    const prodThresh = settings.productThresholds?.find(p => p.productId === item._id);
    if (prodThresh && prodThresh.threshold !== null && prodThresh.threshold !== undefined) return prodThresh.threshold;

    // 2. Brand-wise
    const brandId = item.brand?._id || item.brand;
    const brandThresh = settings.brandThresholds?.find(b => b.brandId === brandId);
    if (brandThresh && brandThresh.threshold !== null && brandThresh.threshold !== undefined) return brandThresh.threshold;

    // 3. Global
    return settings.globalLowStockThreshold || 10;
  }, [settings]);

  // Filtering & Sorting
  const [currentSortField, setCurrentSortField] = useState('createdAt');
  const [currentSortOrder, setCurrentSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    kitType: ''
  });

  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates({ countryId: selectedCountry === 'all' ? undefined : selectedCountry });
    }
  }, [selectedCountry, fetchStates]);

  const fetchInventory = useCallback(async () => {
    // Only fetch if minimum location criteria met (state and cluster, or district)
    if (!selectedDistrict && !(selectedState && selectedCluster)) {
      setInventoryData([]);
      return;
    }

    // Don't fetch while locations are still loading
    if (locationsLoading) return;

    try {
      setLoading(true);
      const baseParams = {
        country: selectedCountry,
        state: selectedState,
        cluster: selectedCluster,
        district: selectedDistrict,
        cpType: selectedPlan,
        search: searchQuery,
        ...activeFilters,
        lowStock: showOnlyLowStock,
        sort: currentSortField,
        order: currentSortOrder
      };

      // Create a new params object and filter out 'all' values and empty strings
      const params = {};
      for (const key in baseParams) {
        if (baseParams[key] !== 'all' && baseParams[key] !== '' && baseParams[key] !== undefined && baseParams[key] !== null) {
          params[key] = baseParams[key];
        }
      }

      const [itemsResponse, summaryResponse] = await Promise.all([
        inventoryApi.getItems({ ...params, silent: true }),
        inventoryApi.getSummary({ ...params, silent: true })
      ]);

      setInventoryData(itemsResponse.data.items || itemsResponse.data || []);
      setSummary(summaryResponse.data || summaryResponse);

    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict, selectedPartner, selectedPlan, activeFilters, searchQuery, showOnlyLowStock, currentSortField, currentSortOrder, locationsLoading]);

  useEffect(() => {
    fetchInventory();
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict, selectedPartner, selectedPlan, activeFilters, searchQuery, showOnlyLowStock, currentSortField, currentSortOrder, fetchInventory]);

  useEffect(() => {
    if (selectedPartner) {
      fetchPartnerPlans();
    } else {
      setPartnerPlans([]);
      setSelectedPlan('');
    }
  }, [selectedPartner, selectedState, partnerTypes]); // Added selectedState and partnerTypes to dependencies

  const fetchPartnerPlans = async () => {
    try {
      // Ensure partnerTypes is an array before calling find
      if (!Array.isArray(partnerTypes)) return;

      const partnerObj = partnerTypes.find(p => p._id === selectedPartner);
      const partnerName = partnerObj ? (partnerObj.name || partnerObj.label) : '';

      const res = await partnerApi.getPartnerPlans(partnerName, selectedState);
      const plans = Array.isArray(res) ? res : (res.data || []);
      setPartnerPlans(plans);
    } catch (err) {
      console.error("Failed to fetch partner plans", err);
      setPartnerPlans([]);
    }
  };

  // --- Helper Functions ---
  const getUniqueBrands = () => {
    return [...new Set(inventoryData.map(product => product.brand?.brand || product.brand?.brandName || product.brand?.companyName || 'Unknown'))];
  };

  // --- Selection Handlers ---
  const handleCountrySelect = (countryId) => {
    setSelectedCountry(countryId);
    setSelectedState('');
    setSelectedCluster('');
    setSelectedDistrict('');
    setSelectedPartner('');
    setSelectedPlan('');
    fetchStates({ countryId: countryId === 'all' ? undefined : countryId });
  };

  const handleStateSelect = (stateId) => {
    setSelectedState(stateId);
    setSelectedCluster('');
    setSelectedDistrict('');
    setSelectedPartner('');
    setSelectedPlan('');
  };

  const handleClusterSelect = (clusterId) => {
    setSelectedCluster(clusterId);
    setSelectedDistrict('');
    setSelectedPartner('');
    setSelectedPlan('');
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedPartner('');
    setSelectedPlan('');
  };

  const handlePartnerSelect = (partnerId) => {
    setSelectedPartner(prev => prev === partnerId ? '' : partnerId);
    setSelectedPlan('');
  };

  const handlePlanSelect = (planName) => {
    setSelectedPlan(prev => prev === planName ? '' : planName);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      await inventoryApi.deleteItem(id);
      toast.success('Item deleted successfully');
      fetchInventory(); // Refresh table
    } catch (error) {
      console.error('Delete failed', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };


  // --- Render Functions ---
  const renderClusters = () => {
    if (!selectedState) return null;

    return (
      <div className="mt-6 mb-6">
        <h5 className="text-lg font-bold text-gray-700 mb-4">Select Clusters</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedCluster === 'all'
              ? 'bg-[#17a2b8] text-white border-[#17a2b8]'
              : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400'
              }`}
            onClick={() => handleClusterSelect('all')}
          >
            <div className="font-bold text-sm tracking-wide">All Clusters</div>
          </div>
          {clusters.map(cluster => (
            <div
              key={cluster._id}
              className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedCluster === cluster._id
                ? 'bg-[#17a2b8] text-white border-[#17a2b8]'
                : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400'
                }`}
              onClick={() => handleClusterSelect(cluster._id)}
            >
              <div className="font-bold text-sm tracking-wide">{cluster.name}</div>
            </div>
          ))}
          {clusters.length === 0 && <div className="col-span-4 text-center text-gray-500">No clusters found for this state.</div>}
        </div>
      </div>
    );
  };

  const renderDistricts = () => {
    if (!selectedCluster) return null;

    return (
      <div className="mt-6 mb-6">
        <h5 className="text-lg font-bold text-gray-700 mb-4">Select Districts</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedDistrict === 'all'
              ? 'bg-[#28a745] text-white border-[#28a745]'
              : 'bg-white border-gray-300 text-gray-800 hover:border-green-400'
              }`}
            onClick={() => handleDistrictSelect('all')}
          >
            <div className="font-bold text-sm tracking-wide">All Districts</div>
          </div>
          {districts.map(district => (
            <div
              key={district._id}
              className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedDistrict === district._id
                ? 'bg-[#28a745] text-white border-[#28a745]'
                : 'bg-white border-gray-300 text-gray-800 hover:border-green-400'
                }`}
              onClick={() => handleDistrictSelect(district._id)}
            >
              <div className="font-bold text-sm tracking-wide">{district.name}</div>
            </div>
          ))}
          {districts.length === 0 && <div className="col-span-4 text-center text-gray-500">No districts found for this cluster.</div>}
        </div>
      </div>
    );
  };

  const LocationCard = ({ title, subtitle, isSelected, onClick, colorClass = 'border-[#007bff] bg-blue-50 shadow-blue-100' }) => (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-28 shadow-sm hover:shadow-md ${isSelected
        ? `${colorClass} shadow-lg -translate-y-1`
        : 'border-transparent bg-white hover:border-blue-200'
        }`}
    >
      <div className="font-bold text-base text-[#333] mb-1">{title}</div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-tight">{subtitle || ''}</div>
    </div>
  );

  const renderPartnerSection = () => {
    if (!selectedDistrict) return null;

    return (
      <div className="mt-8 mb-8">
        <h5 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          Select Partner
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnerTypes.map(partner => (
            <LocationCard
              key={partner._id}
              title={partner.name || partner.label}
              isSelected={selectedPartner === partner._id}
              onClick={() => handlePartnerSelect(partner._id)}
              colorClass="border-blue-600 bg-blue-600 text-white shadow-blue-200"
            />
          ))}
          {partnerTypes.length === 0 && <div className="col-span-4 text-center text-gray-500 py-4 border-2 border-dashed rounded-xl">No Partner Types found.</div>}
        </div>

        {selectedPartner && (
          <div className="mt-10 animate-fade-in-down">
            <h5 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-green-500" />
              Select Plans for {Array.isArray(partnerTypes) ? partnerTypes.find(p => p._id === selectedPartner)?.name : ''}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnerPlans.map(plan => (
                <LocationCard
                  key={plan._id}
                  title={plan.name}
                  isSelected={selectedPlan === plan.name}
                  onClick={() => handlePlanSelect(plan.name)}
                  colorClass="border-green-600 bg-green-600 text-white shadow-green-200"
                />
              ))}
              {partnerPlans.length === 0 && (
                <div className="col-span-4 text-center text-gray-500 py-8 border-2 border-dashed rounded-xl bg-gray-50">
                  No plans found for this partner in {states.find(s => s._id === selectedState)?.name}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Settings Modal ---
  const SettingsModal = () => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('global');
    const [brands, setBrands] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      // Fetch Brands for Brand-wise settings
      fetchBrands();
      // Fetch all products (masters) for Product-wise settings
      fetchMasterProducts();
    }, []);

    const fetchBrands = async () => {
      try {
        const res = await getAllManufacturers();
        // The API might return an array directly or a wrapped object
        const data = Array.isArray(res) ? res : (res.data || res.data?.data || []);

        // Map manufacturers to unique brand objects for the settings list
        // and ensure we handle cases where multiple manufacturers might have the same brand name
        const uniqueBrandMap = new Map();
        data.forEach(m => {
          if (m.brand && !uniqueBrandMap.has(m.brand)) {
            uniqueBrandMap.set(m.brand, {
              _id: m._id, // Using manufacturer ID as brand identifier for thresholds
              brandName: m.brand,
              logo: m.brandLogo
            });
          }
        });

        setBrands(Array.from(uniqueBrandMap.values()));
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };

    const fetchMasterProducts = async () => {
      try {
        const res = await productApi.getAll();
        const data = res.data?.data || res.data || [];
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to fetch master products", err);
      }
    };

    const handleSaveSettings = async () => {
      try {
        setSaving(true);
        // Clean up empty thresholds
        const payload = {
          globalLowStockThreshold: localSettings.globalLowStockThreshold,
          brandThresholds: localSettings.brandThresholds.filter(b => b.threshold !== '' && b.threshold !== null && !isNaN(b.threshold)),
          productThresholds: localSettings.productThresholds.filter(p => p.threshold !== '' && p.threshold !== null && !isNaN(p.threshold))
        };
        const res = await inventoryApi.updateSettings(payload);
        setSettings(res.data.data);
        setSettingsModalOpen(false);
        toast.success("Settings saved successfully!");
      } catch (error) {
        toast.error("Failed to save settings");
        console.error(error);
      } finally {
        setSaving(false);
      }
    };

    const handleBrandChange = (brandId, value) => {
      const thresholds = [...(localSettings.brandThresholds || [])];
      const index = thresholds.findIndex(b => b.brandId === brandId);
      const valNum = value === '' ? '' : Number(value);
      if (index >= 0) {
        thresholds[index].threshold = valNum;
      } else {
        thresholds.push({ brandId, threshold: valNum });
      }
      setLocalSettings({ ...localSettings, brandThresholds: thresholds });
    };

    const handleProductChange = (productId, value) => {
      const thresholds = [...(localSettings.productThresholds || [])];
      const index = thresholds.findIndex(p => p.productId === productId);
      const valNum = value === '' ? '' : Number(value);
      if (index >= 0) {
        thresholds[index].threshold = valNum;
      } else {
        thresholds.push({ productId, threshold: valNum });
      }
      setLocalSettings({ ...localSettings, productThresholds: thresholds });
    };

    const getBrandThreshold = (brandId) => {
      const found = localSettings.brandThresholds?.find(b => b.brandId === brandId);
      return found ? found.threshold : '';
    };

    const getProductThreshold = (productId) => {
      const found = localSettings.productThresholds?.find(p => p.productId === productId);
      return found ? found.threshold : '';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded w-[700px] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-[#206bc4] text-lg font-bold">Inventory Settings</h3>
            <button onClick={() => setSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex border-b border-gray-200 text-sm">
            <button
              className={`px-6 py-3 text-center transition-colors font-medium -mb-[1px] ${activeTab === 'global' ? 'border-t-2 border-t-transparent border-l border-r border-b-white bg-white text-gray-800' : 'border-b text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('global')}
            >
              Global Settings
            </button>
            <button
              className={`px-6 py-3 text-center transition-colors font-medium -mb-[1px] ${activeTab === 'brand' ? 'border-t-2 border-t-[#206bc4] border-l border-r border-[#e0e6ed] border-b-white bg-white text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('brand')}
            >
              Brand-wise Settings
            </button>
            <button
              className={`px-6 py-3 text-center transition-colors font-medium -mb-[1px] ${activeTab === 'product' ? 'border-t-2 border-t-[#206bc4] border-l border-r border-[#e0e6ed] border-b-white bg-white text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('product')}
            >
              Product-wise Settings
            </button>
            <div className="flex-1 border-b border-gray-200"></div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'global' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Default Low Stock Threshold</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 px-3 py-2"
                  value={localSettings.globalLowStockThreshold}
                  onChange={(e) => setLocalSettings({ ...localSettings, globalLowStockThreshold: Number(e.target.value) })}
                  min="0"
                />
                <p className="text-xs text-gray-400 mt-2">
                  This threshold will be used for brands and products without specific settings.
                </p>
              </div>
            )}

            {activeTab === 'brand' && (
              <div>
                <p className="text-sm text-gray-600 mb-6">Set low stock thresholds for specific brands</p>
                <div className="space-y-0">
                  {brands.map((brand, index) => (
                    <div key={brand._id} className={`flex justify-between items-start py-4 ${index !== brands.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="font-semibold text-sm text-gray-800 w-1/3 pt-2">{brand.brandName || brand.name}</span>
                      <div className="w-2/3">
                        <input
                          type="number"
                          placeholder="Use default threshold"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400"
                          value={getBrandThreshold(brand._id)}
                          onChange={(e) => handleBrandChange(brand._id, e.target.value)}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Leave empty to use default threshold</p>
                      </div>
                    </div>
                  ))}
                  {brands.length === 0 && <span className="text-sm text-gray-500">No brands found.</span>}
                </div>
              </div>
            )}

            {activeTab === 'product' && (
              <div>
                <p className="text-sm text-gray-600 mb-6">Set low stock thresholds for specific products</p>
                <div className="space-y-0 max-h-[500px]">
                  {allProducts.map((item, index) => (
                    <div key={item._id} className={`flex justify-between items-start py-4 ${index !== allProducts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex flex-col w-1/3 pt-2">
                        <span className="font-semibold text-sm text-gray-800">{item.name || item.itemName}</span>
                        <span className="text-[11px] text-gray-500">{(item.brandId?.name || item.brandId?.companyName) || item.brand?.brand || item.brand?.brandName || item.brand?.companyName || 'Unknown'}</span>
                      </div>
                      <div className="w-2/3">
                        <input
                          type="number"
                          placeholder="Use brand/default threshold"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400"
                          value={getProductThreshold(item._id)}
                          onChange={(e) => handleProductChange(item._id, e.target.value)}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Leave empty to use brand or default threshold</p>
                      </div>
                    </div>
                  ))}
                  {allProducts.length === 0 && <span className="text-sm text-gray-500">No products found.</span>}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#e0e6ed] flex justify-end space-x-3 bg-white">
            <button onClick={() => setSettingsModalOpen(false)} className="px-4 py-2 text-sm font-medium bg-[#5b6e88] text-white rounded hover:bg-gray-600 transition-colors">
              Close
            </button>
            <button onClick={handleSaveSettings} disabled={saving} className="px-4 py-2 text-sm font-medium bg-[#206bc4] text-white rounded hover:bg-blue-700 transition-colors flex items-center">
              {saving ? <Loader className="animate-spin mr-2" size={14} /> : null}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditItemModal = () => {
    const [formData, setFormData] = useState({
      itemName: editingItem?.itemName || '',
      quantity: editingItem?.quantity || 0,
      price: editingItem?.price || 0,
      minLevel: editingItem?.minLevel || 0
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
      e.preventDefault();
      try {
        setSaving(true);
        await inventoryApi.updateItem(editingItem._id, formData);
        toast.success('Inventory updated successfully');
        setEditModalOpen(false);
        fetchInventory();
      } catch (error) {
        console.error('Update failed', error);
        toast.error(error.response?.data?.message || 'Failed to update inventory');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-xl w-[500px] overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-gray-800 font-bold flex items-center gap-2 text-sm">
              <Pencil size={16} className="text-blue-500" />
              Edit Inventory: <span className="text-blue-600">{editingItem.sku}</span>
            </h3>
            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Name</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Low Stock Threshold (Min Level)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: Number(e.target.value) })}
                required
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setEditModalOpen(false)} 
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                disabled={saving}
              >
                {saving && <Loader className="animate-spin" size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <h4 className="text-[#206bc4] text-xl font-bold border border-gray-200 border-l-4 border-l-blue-500 bg-white p-4">Inventory Overview</h4>
      </div>

      {/* Country Selection */}
      <div className="mb-6">
        <h5 className="text-lg font-bold text-gray-700 mb-4">Select Country</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedCountry === 'all'
              ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]'
              : 'bg-white border-gray-300 text-gray-800 hover:border-purple-400'
              }`}
            onClick={() => handleCountrySelect('all')}
          >
            <h6 className="font-bold text-sm tracking-wide">All Countries</h6>
            <div className="font-bold text-xs mt-1">ALL</div>
          </div>
          {countries.map(country => (
            <div
              key={country._id}
              className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedCountry === country._id
                ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]'
                : 'bg-white border-gray-300 text-gray-800 hover:border-purple-400'
                }`}
              onClick={() => handleCountrySelect(country._id)}
            >
              <h6 className="font-bold text-sm tracking-wide">{country.name}</h6>
              <div className="font-bold text-xs mt-1">{country.code || 'N/A'}</div>
            </div>
          ))}
          {countries.length === 0 && <div className="col-span-4 text-center text-gray-500">Loading countries...</div>}
        </div>
      </div>

      {/* State Selection */}
      {selectedCountry && (
        <div className="mb-6">
          <h5 className="text-lg font-bold text-gray-700 mb-4">Select States</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedState === 'all'
                ? 'bg-[#1d64b2] text-white border-[#1d64b2]'
                : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400'
                }`}
              onClick={() => handleStateSelect('all')}
            >
              <h6 className="font-bold text-sm tracking-wide">All States</h6>
              <div className="font-bold text-xs mt-1">ALL</div>
            </div>
            {states.map(state => (
              <div
                key={state._id}
                className={`cursor-pointer border rounded p-4 text-center transition-all duration-200 hover:scale-105 ${selectedState === state._id
                  ? 'bg-[#1d64b2] text-white border-[#1d64b2]'
                  : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400'
                  }`}
                onClick={() => handleStateSelect(state._id)}
              >
                <h6 className="font-bold text-sm tracking-wide">{state.name}</h6>
                <div className="font-bold text-xs mt-1">{state.code || 'N/A'}</div>
              </div>
            ))}
            {states.length === 0 && <div className="col-span-4 text-center text-gray-500">Loading states...</div>}
          </div>
        </div>
      )}

      {/* Cluster Section */}
      {renderClusters()}

      {/* District Section */}
      {renderDistricts()}

      {/* Partner Section */}
      {renderPartnerSection()}

      {/* Inventory Content (Summary + Table) */}
      {selectedPlan && (
        <div className="animate-fade-in">
          {/* Inventory Summary */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 p-6 mb-8 rounded-xl shadow-sm">
              <h5 className="text-sm font-bold text-gray-800 mb-6 text-left uppercase tracking-wider">Inventory Summary</h5>
              {loading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin text-blue-500" /></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h6 className="text-[10px] font-bold text-blue-600 mb-2 uppercase">Total Products</h6>
                    <h4 className="text-2xl font-bold text-gray-900">{summary.totalProducts}</h4>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h6 className="text-[10px] font-bold text-purple-600 mb-2 uppercase">Total Quantity</h6>
                    <h4 className="text-2xl font-bold text-gray-900">{summary.totalQuantity}</h4>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h6 className="text-[10px] font-bold text-emerald-600 mb-2 uppercase">Total Value</h6>
                    <h4 className="text-2xl font-bold text-gray-900">₹{summary.totalValue.toLocaleString()}</h4>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h6 className="text-[10px] font-bold text-orange-600 mb-2 uppercase">Status</h6>
                    <h4 className="text-2xl font-bold text-gray-900">{summary.lowStockCount > 0 ? 'Action Reqd' : 'Optimal'}</h4>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Section */}
            <div className="bg-white border border-gray-200 mb-8 p-6 rounded-xl shadow-sm">
              <h5 className="text-[#206bc4] text-lg font-bold mb-6 flex items-center gap-2">
                <Filter size={20} />
                Refine Search
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={activeFilters.category}
                    onChange={(e) => setActiveFilters({ ...activeFilters, category: e.target.value, subCategory: '' })}
                  >
                    <option value="">Select Category</option>
                    {masterCategories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sub Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={activeFilters.subCategory}
                    onChange={(e) => setActiveFilters({ ...activeFilters, subCategory: e.target.value })}
                  >
                    <option value="">Sub Category</option>
                    {masterSubCategories
                      .filter(sub => {
                        if (!activeFilters.category) return true;
                        const selCat = masterCategories.find(c => c.name === activeFilters.category);
                        const subCatId = sub.categoryId?._id || sub.categoryId;
                        return selCat && subCatId === selCat._id;
                      })
                      .map(sub => (
                        <option key={sub._id} value={sub.name}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project Type (kW)</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={activeFilters.projectType}
                    onChange={(e) => setActiveFilters({ ...activeFilters, projectType: e.target.value, subProjectType: '' })}
                  >
                    <option value="">Select Range</option>
                    {masterProjectTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sub Project Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={activeFilters.subProjectType}
                    onChange={(e) => setActiveFilters({ ...activeFilters, subProjectType: e.target.value })}
                  >
                    <option value="">Sub Project Type</option>
                    {masterSubProjectTypes
                      .filter(sub => {
                        if (!activeFilters.projectType) return true;
                        const activeMapping = projectMappings.find(m =>
                          `${m.projectTypeFrom} to ${m.projectTypeTo} kW` === activeFilters.projectType
                        );
                        if (activeMapping && activeMapping.subProjectTypeId) {
                          const subId = sub._id || sub;
                          const mappingSubId = activeMapping.subProjectTypeId._id || activeMapping.subProjectTypeId;
                          return subId === mappingSubId;
                        }
                        return true;
                      })
                      .map(sub => (
                        <option key={sub._id} value={sub.name}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kit Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={activeFilters.kitType}
                    onChange={(e) => setActiveFilters({ ...activeFilters, kitType: e.target.value })}
                  >
                    <option value="">Select Kit Type</option>
                    <option value="Combo Kit">Combo Kit</option>
                    <option value="Customize Kit">Customize Kit</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveFilters({
                        category: '',
                        subCategory: '',
                        projectType: '',
                        subProjectType: '',
                        kitType: ''
                      });
                      setSearchQuery('');
                      setShowOnlyLowStock(false);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Reset
                  </button>
                  <button
                    className="px-8 py-2 bg-[#206bc4] text-white rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 shadow-lg shadow-blue-100 transition gap-2"
                  >
                    <Filter size={14} />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex flex-wrap justify-between items-center bg-gray-50 gap-4">
                <h5 className="flex items-center text-lg font-bold text-gray-800">
                  Product Inventory
                  {summary.lowStockCount > 0 && (
                    <span className="ml-3 bg-[#dc3545] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      {summary.lowStockCount} Low Stock
                    </span>
                  )}
                </h5>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
                    className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center transition ${showOnlyLowStock
                      ? 'text-white bg-red-600 shadow-lg shadow-red-100'
                      : 'text-red-500 border border-red-200 hover:bg-red-50'
                      }`}
                  >
                    <AlertTriangle size={14} className="mr-2" />
                    {showOnlyLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
                  </button>
                  <button
                    onClick={() => setSettingsModalOpen(true)}
                    className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center transition"
                  >
                    <Settings size={14} className="mr-2" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Search & Sort */}
              <div className="p-6 border-b flex flex-col md:flex-row gap-4 bg-white">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Search by name, SKU or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setSearchQuery('')}>
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="md:w-64">
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] outline-none"
                    value={currentSortField}
                    onChange={(e) => setCurrentSortField(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="price">Sort by Price</option>
                    <option value="createdAt">Sort by Date</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#343a40] text-gray-100">
                    <tr>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">#</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Product Name</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Brand</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">SKU</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Quantity</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Price (₹)</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Total (₹)</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px]">Status</th>
                      <th className="p-4 border-b border-gray-700 font-bold uppercase tracking-wider text-[11px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="8" className="p-16 text-center"><Loader className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
                    ) : inventoryData.length === 0 ? (
                      <tr><td colSpan="8" className="p-16 text-center text-gray-400 italic">No inventory matching your criteria</td></tr>
                    ) : (
                      inventoryData.map((item, index) => {
                        const isLowStock = item.quantity <= getThresholdForItem(item);
                        const totalValue = item.price * item.quantity;
                        return (
                          <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${isLowStock ? 'bg-red-50/50' : 'bg-white'}`}>
                            <td className="p-4 text-gray-400 font-medium">{index + 1}</td>
                            <td className="p-4">
                              <div className="font-bold text-gray-900">{item.itemName}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-tight">{item.category}</div>
                            </td>
                            <td className="p-4 text-gray-600">{item.brand?.brand || item.brand?.brandName || item.brand?.companyName || 'Unknown'}</td>
                            <td className="p-4"><code className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded font-mono">{item.sku}</code></td>
                            <td className="p-4 font-bold text-gray-900">{item.quantity}</td>
                            <td className="p-4 text-gray-600">₹{item.price.toLocaleString()}</td>
                            <td className="p-4 font-bold text-blue-600">₹{totalValue.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {isLowStock ? 'Low' : 'OK'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Item"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Item"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t text-sm text-gray-400 font-medium flex justify-between bg-gray-50">
                <span>Total Items Found</span>
                <span>{inventoryData.length} records</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsModalOpen && <SettingsModal />}
      {editModalOpen && editingItem && <EditItemModal />}
    </div>
  );
};

export default InventoryManagement;