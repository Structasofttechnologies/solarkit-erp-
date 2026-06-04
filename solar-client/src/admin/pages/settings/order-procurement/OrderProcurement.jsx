import React, { useState, useEffect } from 'react';
import { Eye, Search, X, Plus, Trash, Edit, Save, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import {
  getAllOrderProcurementSettings,
  createOrderProcurementSetting,
  updateOrderProcurementSetting,
  deleteOrderProcurementSetting,
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProducts,
  getBrands,
  getComboKits,
  getSupplierTypes,
  getSkus,
  getProjectCategoryMappings
} from '../../../../services/settings/orderProcurementSettingApi';
import { getSupplierVendorPlans } from '../../../../services/vendor/vendorApi';
import { locationAPI } from '../../../../api/api';

import inventoryApi from '../../../../services/inventory/inventoryApi';
import { masterApi } from '../../../../api/masterApi';

export default function OrderProcurement() {
  // Data State
  const [settings, setSettings] = useState([]);
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [skusList, setSkusList] = useState([]);
  const [comboKits, setComboKits] = useState([]);
  const [supplierTypes, setSupplierTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [formProjectRanges, setFormProjectRanges] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loginTypes, setLoginTypes] = useState([]);


  // Form Dep Dropdowns
  const [formSubCategories, setFormSubCategories] = useState([]);
  const [formSubProjectTypes, setFormSubProjectTypes] = useState([]);
  const [formStates, setFormStates] = useState([]);
  const [formClusters, setFormClusters] = useState([]);
  const [formWarehouses, setFormWarehouses] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    state: '',
    cluster: '',
    warehouse: ''
  });

  // Filter Dropdowns
  const [filterSubCategories, setFilterSubCategories] = useState([]);
  const [filterSubProjectTypes, setFilterSubProjectTypes] = useState([]);
  const [filterClusters, setFilterClusters] = useState([]);
  const [filterWarehouses, setFilterWarehouses] = useState([]);

  // Current Setting Form Data
  const initialFormState = {
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    product: '',
    brand: '',
    paymentType: [],
    skus: [],
    skuSelectionOption: 'ComboKit',
    skuItems: [{ minRange: '', maxRange: '', assignModules: [], supplierType: [] }],
    state: '',
    cluster: '',
    warehouse: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Initial Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [
        settingsData,
        catData,
        pTypeData,
        prodData,
        brandData,
        skuData,
        comboData,
        suppTypeData,
        allSubCatData,
        allSubPTypeData,
        mappingData
      ] = await Promise.all([
        getAllOrderProcurementSettings(),
        getCategories(),
        getProjectTypes(),
        getProducts(),
        getBrands(),
        getSkus(),
        getComboKits(),
        getSupplierTypes(),
        getSubCategories(), // fetch all for list filters
        getSubProjectTypes(), // fetch all for list filters
        getProjectCategoryMappings()
      ]);

      setSettings(settingsData?.data || []);
      setFilteredSettings(settingsData?.data || []);
      setCategories(catData?.data || []);
      setProjectTypes(pTypeData?.data || []);
      setProducts(prodData?.data || []);
      setBrands(Array.isArray(brandData) ? brandData : brandData?.data || []);
      setSkusList(skuData?.data || []);
      setComboKits(Array.isArray(comboData) ? comboData : comboData?.data || []);
      setSupplierTypes(suppTypeData?.data || []);

      setSubCategories(allSubCatData?.data || []);
      setSubProjectTypes(allSubPTypeData?.data || []);
      setProjectMappings(mappingData?.data || []);

      const [countryRes, loginTypesRes] = await Promise.all([
        masterApi.getCountries(),
        getSupplierVendorPlans({ fetchAllNames: true })
      ]);

      setCountries(countryRes?.data || []);
      setLoginTypes(loginTypesRes?.data || []);

      if (countryRes?.data?.length > 0) {
        const stateRes = await masterApi.getStates({ countryId: countryRes.data[0]._id });
        setStates(stateRes?.data || []);
        setFormStates(stateRes?.data || []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = settings;

    if (filters.category) {
      result = result.filter(s => (s.category?.name || s.category) === filters.category);
    }
    if (filters.subCategory) {
      result = result.filter(s => (s.subCategory?.name || s.subCategory) === filters.subCategory);
    }
    if (filters.projectType) {
      result = result.filter(s => (s.projectType?.name || s.projectType) === filters.projectType);
    }
    if (filters.subProjectType) {
      result = result.filter(s => (s.subProjectType?.name || s.subProjectType) === filters.subProjectType);
    }
    if (filters.state) {
      result = result.filter(s => (s.state?._id || s.state) === filters.state);
    }
    if (filters.cluster) {
      result = result.filter(s => (s.cluster?._id || s.cluster) === filters.cluster);
    }
    if (filters.warehouse) {
      result = result.filter(s => (s.warehouse?._id || s.warehouse) === filters.warehouse);
    }

    setFilteredSettings(result);
  }, [filters, settings]);

  // Handle Filter Changes (Hierarchical)
  const handleFilterCategoryChange = async (e) => {
    const catName = e.target.value;
    setFilters(prev => ({ ...prev, category: catName, subCategory: '' }));
    setFilterSubCategories([]);
    if (catName) {
      try {
        const selCat = categories.find(c => c.name === catName);
        if (selCat) {
          const res = await getSubCategories(selCat._id);
          setFilterSubCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load sub categories for filter", err);
      }
    }
  };

  const handleFilterSubCategoryChange = (e) => {
    const subCatName = e.target.value;
    setFilters(prev => ({ ...prev, subCategory: subCatName, projectType: '', subProjectType: '' }));
  };

  const handleFilterProjectTypeChange = async (e) => {
    const ptName = e.target.value;
    setFilters(prev => ({ ...prev, projectType: ptName, subProjectType: '' }));
    setFilterSubProjectTypes([]);
    if (ptName) {
      try {
        const selPt = projectTypes.find(p => p.name === ptName);
        if (selPt) {
          const res = await getSubProjectTypes(selPt._id);
          setFilterSubProjectTypes(res.data || []);
        } else {
          const res = await getSubProjectTypes();
          setFilterSubProjectTypes(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load sub project types for filter", err);
      }
    }
  };

  const handleFilterStateChange = async (e) => {
    const stateId = e.target.value;
    setFilters(prev => ({ ...prev, state: stateId, cluster: '', warehouse: '' }));
    setFilterClusters([]);
    setFilterWarehouses([]);
    if (stateId) {
      try {
        const res = await locationAPI.getAllClusters({ stateId });
        setFilterClusters(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load clusters for filter", err);
      }
    }
  };

  const handleFilterClusterChange = async (e) => {
    const clusterId = e.target.value;
    setFilters(prev => ({ ...prev, cluster: clusterId, warehouse: '' }));
    setFilterWarehouses([]);
    if (clusterId) {
      try {
        const res = await inventoryApi.getAllWarehouses({ cluster: clusterId });
        setFilterWarehouses(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load warehouses for filter", err);
      }
    }
  };
  const handleCategoryChange = async (e) => {
    const catName = e.target.value;
    setFormData(prev => ({ ...prev, category: catName, subCategory: '', projectType: '', subProjectType: '' }));
    setFormSubCategories([]);
    setFormProjectRanges([]);
    if (catName) {
      try {
        const selCat = categories.find(c => c.name === catName);
        if (selCat) {
          const res = await getSubCategories(selCat._id);
          setFormSubCategories(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load sub categories");
      }
    }
  };

  const handleSubCategoryChange = async (e) => {
    const subCatName = e.target.value;
    setFormData(prev => ({ ...prev, subCategory: subCatName, projectType: '', subProjectType: '' }));

    // Filter mappings for ranges
    const selCat = categories.find(c => c.name === formData.category);
    const selSubCat = subCategories.find(sc => sc.name === subCatName);

    if (selCat && selSubCat) {
      const ranges = projectMappings
        .filter(m => (m.categoryId?._id || m.categoryId) === selCat._id && (m.subCategoryId?._id || m.subCategoryId) === selSubCat._id)
        .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
        .filter((v, i, a) => a.indexOf(v) === i);
      setFormProjectRanges(ranges);
    }
  };

  const handleProjectTypeChange = async (e) => {
    const ptName = e.target.value;
    setFormData(prev => ({ ...prev, projectType: ptName, subProjectType: '' }));
    setFormSubProjectTypes([]);
    if (ptName) {
      try {
        // Try to find if this ptName corresponds to a master ProjectType ID for sub-type filtering
        const selPt = projectTypes.find(p => p.name === ptName);
        if (selPt) {
          const res = await getSubProjectTypes(selPt._id);
          setFormSubProjectTypes(res.data || []);
        } else {
          // If it's a range, just show all sub-project types or those defined in mappings
          const res = await getSubProjectTypes();
          setFormSubProjectTypes(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load sub project types");
      }
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({ ...prev, state: stateId, cluster: '', warehouse: '' }));
    setFormClusters([]);
    setFormWarehouses([]);
    if (stateId) {
      try {
        const res = await locationAPI.getAllClusters({ stateId });
        setFormClusters(res.data?.data || []);
      } catch (err) {
        toast.error("Failed to load clusters");
      }
    }
  };

  const handleClusterChange = async (e) => {
    const clusterId = e.target.value;
    setFormData(prev => ({ ...prev, cluster: clusterId, warehouse: '' }));
    setFormWarehouses([]);
    if (clusterId) {
      try {
        const res = await inventoryApi.getAllWarehouses({ cluster: clusterId });
        setFormWarehouses(res.data?.data || []);
      } catch (err) {
        toast.error("Failed to load warehouses");
      }
    }
  };

  // Form Handlers
  const handleSkuItemChange = (index, field, value) => {
    const newItems = [...formData.skuItems];
    newItems[index][field] = value;
    setFormData({ ...formData, skuItems: newItems });
  };

  const addSkuItem = () => {
    setFormData({
      ...formData,
      skuItems: [...formData.skuItems, { minRange: '', maxRange: '', assignModules: [], supplierType: [] }]
    });
  };

  const removeSkuItem = (index) => {
    const newItems = formData.skuItems.filter((_, i) => i !== index);
    setFormData({ ...formData, skuItems: newItems });
  };

  // CRUD Actions
  const handleEdit = async (setting) => {
    setIsEdit(true);

    const catName = setting.category?.name || setting.category;
    const subCatName = setting.subCategory?.name || setting.subCategory;
    const ptName = setting.projectType?.name || setting.projectType;
    const sptName = setting.subProjectType?.name || setting.subProjectType;

    setFormData({
      category: catName,
      subCategory: subCatName,
      projectType: ptName,
      subProjectType: sptName,
      product: setting.product?._id || setting.product,
      brand: setting.brand?._id || setting.brand,
      paymentType: Array.isArray(setting.paymentType) ? setting.paymentType : (setting.paymentType && setting.paymentType !== 'None' ? [setting.paymentType] : []),
      skus: setting.skus?.map(s => s._id || s) || [],
      skuSelectionOption: setting.skuSelectionOption || 'ComboKit',
      skuItems: setting.skuItems.map(i => ({
        minRange: i.minRange,
        maxRange: i.maxRange,
        assignModules: i.assignModules || [],
        supplierType: Array.isArray(i.supplierType) ? i.supplierType.map(s => s._id || s) : (i.supplierType ? [i.supplierType._id || i.supplierType] : []),
        _id: i._id
      })),
      _id: setting._id,
      state: setting.state?._id || setting.state || '',
      cluster: setting.cluster?._id || setting.cluster || '',
      warehouse: setting.warehouse?._id || setting.warehouse || ''
    });

    // Load dependent location dropdowns
    if (setting.state) {
      const stateId = setting.state?._id || setting.state;
      const res = await locationAPI.getAllClusters({ stateId });
      setFormClusters(res.data?.data || []);

      if (setting.cluster) {
        const clusterId = setting.cluster?._id || setting.cluster;
        const whRes = await inventoryApi.getAllWarehouses({ cluster: clusterId });
        setFormWarehouses(whRes.data?.data || []);
      }
    }

    // Load dependent dropdowns for form
    const selCat = categories.find(c => c.name === catName);
    if (selCat) {
      const res = await getSubCategories(selCat._id);
      const subCats = res.data || [];
      setFormSubCategories(subCats);

      const selSubCat = subCats.find(sc => sc.name === subCatName);
      if (selSubCat) {
        const ranges = projectMappings
          .filter(m => (m.categoryId?._id || m.categoryId) === selCat._id && (m.subCategoryId?._id || m.subCategoryId) === selSubCat._id)
          .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
          .filter((v, i, a) => a.indexOf(v) === i);
        setFormProjectRanges(ranges);
      }
    }

    const selPt = projectTypes.find(p => p.name === ptName);
    if (selPt) {
      const res = await getSubProjectTypes(selPt._id);
      setFormSubProjectTypes(res.data || []);
    } else {
      const res = await getSubProjectTypes();
      setFormSubProjectTypes(res.data || []);
    }

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await deleteOrderProcurementSetting(id);
        toast.success('Setting deleted successfully');
        fetchInitialData();
      } catch (err) {
        toast.error(err.message || 'Failed to delete setting');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skuItems: formData.skuItems.map(item => {
          const newItem = { ...item };
          if (!newItem.assignModules || newItem.assignModules.length === 0) delete newItem.assignModules;
          if (!newItem.supplierType || newItem.supplierType.length === 0) delete newItem.supplierType;
          return newItem;
        }),
        state: formData.state || null,
        cluster: formData.cluster || null,
        warehouse: formData.warehouse || null
      };

      // Clean up empty ObjectId strings in the root
      if (!payload.state) delete payload.state;
      if (!payload.cluster) delete payload.cluster;
      if (!payload.warehouse) delete payload.warehouse;
      if (!payload.brand) delete payload.brand;
      if (!payload.product) delete payload.product;

      if (isEdit) {
        await updateOrderProcurementSetting(formData._id, payload);
        toast.success('Setting updated successfully');
      } else {
        await createOrderProcurementSetting(payload);
        toast.success('Setting created successfully');
      }
      setShowModal(false);
      fetchInitialData();
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFormSubCategories([]);
    setFormSubProjectTypes([]);
    setFormProjectRanges([]);
    setIsEdit(false);
    setFormClusters([]);
    setFormWarehouses([]);
  };

  const getDynamicLoginTypeOptions = (itemIndex) => {
    const { category, subCategory, projectType } = formData;
    if (!category || !subCategory || !projectType) return [];

    let filtered = supplierTypes.filter(s =>
      (Array.isArray(s.category) ? s.category.includes(category) : s.category === category) &&
      (Array.isArray(s.subCategory) ? s.subCategory.includes(subCategory) : s.subCategory === subCategory) &&
      (Array.isArray(s.projectType) ? s.projectType.includes(projectType) : s.projectType === projectType)
    );

    // Also filter by row's selected Supply Types (assignModules)
    const rowModules = formData.skuItems[itemIndex].assignModules;
    if (rowModules && rowModules.length > 0) {
      filtered = filtered.filter(s => {
        // Since supply types are now strings, and s.assignModules is [String], check for intersection
        if (Array.isArray(s.assignModules)) {
          return s.assignModules.some(m => rowModules.includes(m));
        }
        return rowModules.includes(s.assignModules);
      });
    }

    return filtered.map(s => ({
      label: s.loginTypeName || s.name,
      value: s._id
    }));
  };

  const getDynamicSupplyTypeOptions = () => {
    const { category, subCategory, projectType } = formData;
    if (!category || !subCategory || !projectType) return [];

    const filtered = supplierTypes.filter(s =>
      (Array.isArray(s.category) ? s.category.includes(category) : s.category === category) &&
      (Array.isArray(s.subCategory) ? s.subCategory.includes(subCategory) : s.subCategory === subCategory) &&
      (Array.isArray(s.projectType) ? s.projectType.includes(projectType) : s.projectType === projectType)
    );

    // Flatten all modules from all filtered supplier types and deduplicate
    const modules = [...new Set(filtered.flatMap(s => s.assignModules || []).filter(m => m))];
    return modules.map(m => ({ label: m, value: m }));
  };



  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header and Add Button inside one card */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-start gap-4">
        <h4 className="text-xl font-bold text-blue-600 mb-0">Order Procurement Setting</h4>

        {/* Filters Grid */}
        <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-4 items-center">
          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.category}
            onChange={handleFilterCategoryChange}
          >
            <option value="">Filter by Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.subCategory}
            onChange={handleFilterSubCategoryChange}
            disabled={!filters.category}
          >
            <option value="">Filter by Sub-Category</option>
            {filterSubCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.projectType}
            onChange={handleFilterProjectTypeChange}
            disabled={!filters.subCategory}
          >
            <option value="">Filter by Project type</option>
            {filters.category && filters.subCategory && projectMappings?.length > 0 ? (
              projectMappings
                .filter(m => {
                  const selCat = categories.find(c => c.name === filters.category);
                  const selSubCat = subCategories.find(sc => sc.name === filters.subCategory);
                  return (m.categoryId?._id || m.categoryId) === selCat?._id && (m.subCategoryId?._id || m.subCategoryId) === selSubCat?._id;
                })
                .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((range, i) => <option key={i} value={range}>{range}</option>)
            ) : (
              projectTypes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)
            )}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.subProjectType}
            onChange={(e) => setFilters({ ...filters, subProjectType: e.target.value })}
            disabled={!filters.projectType}
          >
            <option value="">Filter by Sub-Project type</option>
            {filterSubProjectTypes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.state}
            onChange={handleFilterStateChange}
          >
            <option value="">Filter by State</option>
            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.cluster}
            onChange={handleFilterClusterChange}
            disabled={!filters.state}
          >
            <option value="">Filter by Cluster</option>
            {filterClusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={filters.warehouse}
            onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
            disabled={!filters.cluster}
          >
            <option value="">Filter by Warehouse</option>
            {filterWarehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        </div>

        <div className="flex w-full justify-between items-center mt-2">
          <button
            onClick={() => setFilters({ category: '', subCategory: '', projectType: '', subProjectType: '' })}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X size={14} className="mr-1" /> Clear Filters
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-0 bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading settings...</div>
        ) : filteredSettings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p>No setting permutations found. Try adding a new configuration.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#5da5eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">ID</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Category</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Sub category</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Project type</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Sub Project type</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">State</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Cluster</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9]">Warehouse</th>
                <th className="px-4 py-3 font-medium border-b border-[#4791d9] text-center">action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettings.map((setting, idx) => (
                <tr key={setting._id} className="border-b hover:bg-blue-50/30 transition">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{setting.category?.name || setting.category || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.subCategory?.name || setting.subCategory || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.projectType?.name || setting.projectType || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.subProjectType?.name || setting.subProjectType || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.state?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.cluster?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{setting.warehouse?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-500 hover:text-blue-700"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    {/* Add delete optionally */}
                    <button
                      onClick={() => handleDelete(setting._id)}
                      className="text-red-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal matching exact structure */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 xl:p-0">
          <div className="bg-[#f0f4f8] rounded-xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">

            <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center rounded-t-xl">
              <h3 className="text-[22px] font-bold text-[#1f8dec] m-0 leading-tight">
                {isEdit ? 'Edit Order Procurement Setting' : 'Add Order Procurement Setting'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 flex items-center text-sm font-medium gap-1 uppercase tracking-wide">
                <span className="text-xl">&larr;</span> Back
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-white mx-0 my-0">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Row 1: Category, Sub Category, Project Type, Sub Project Type */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select
                      className="p-2 border border-gray-300 rounded-md"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Sub Category</label>
                    <select
                      className="p-2 border border-gray-300 rounded-md"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleSubCategoryChange}
                      disabled={!formData.category}
                    >
                      <option value="">Select Sub Category</option>
                      {formSubCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Project Type</label>
                    <select
                      className="p-2 border border-gray-300 rounded-md"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleProjectTypeChange}
                      disabled={!formData.subCategory}
                    >
                      <option value="">Select Project Type</option>
                      {formProjectRanges.length > 0 ? (
                        formProjectRanges.map((r, i) => <option key={i} value={r}>{r}</option>)
                      ) : (
                        projectTypes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Sub Project Type</label>
                    <select
                      className="p-2 border border-gray-300 rounded-md"
                      name="subProjectType"
                      value={formData.subProjectType}
                      onChange={e => setFormData({ ...formData, subProjectType: e.target.value })}
                      disabled={!formData.projectType}
                    >
                      <option value="">Select Sub Project Type</option>
                      {formSubProjectTypes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Product, Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Product</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      value={formData.product}
                      onChange={e => setFormData({ ...formData, product: e.target.value })}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Brand</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => <option key={b._id} value={b._id}>{b.companyName || b.brand || b.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Location Selection: State, Cluster, Warehouse */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase font-medium text-gray-600 mb-1.5">State</label>
                    <select
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      value={formData.state}
                      onChange={handleStateChange}
                    >
                      <option value="">Select State</option>
                      {formStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase font-medium text-gray-600 mb-1.5">Cluster</label>
                    <select
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      value={formData.cluster}
                      onChange={handleClusterChange}
                      disabled={!formData.state}
                    >
                      <option value="">Select Cluster</option>
                      {formClusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase font-medium text-gray-600 mb-1.5">Warehouse</label>
                    <select
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      value={formData.warehouse}
                      onChange={e => setFormData({ ...formData, warehouse: e.target.value })}
                      disabled={!formData.cluster}
                    >
                      <option value="">Select Warehouse</option>
                      {formWarehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* SKUs and Payment Type block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-8">
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <label className="block font-medium text-blue-600 mb-4">SKUs</label>
                    <Select
                      isMulti
                      placeholder="Select SKUs"
                      className="mb-4 text-sm"
                      options={skusList.map(s => ({ label: s.skuCode, value: s._id }))}
                      value={formData.skus.map(sId => {
                        const s = skusList.find(x => x._id === sId);
                        return { label: s?.skuCode || sId, value: sId };
                      })}
                      onChange={(selected) => setFormData({ ...formData, skus: selected ? selected.map(s => s.value) : [] })}
                    />

                    <div className="flex bg-gray-100 rounded overflow-hidden mt-4 shadow-inner">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium transition ${formData.skuSelectionOption === 'ComboKit' ? 'bg-white shadow text-blue-600 border border-gray-200' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        onClick={() => setFormData({ ...formData, skuSelectionOption: 'ComboKit' })}
                      >
                        ComboKit
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium transition ${formData.skuSelectionOption === 'Customize' ? 'bg-white shadow text-blue-600 border border-gray-200' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        onClick={() => setFormData({ ...formData, skuSelectionOption: 'Customize' })}
                      >
                        Customize
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm h-full">
                    <label className="block font-medium text-blue-600 mb-4">Payment Type</label>
                    <Select
                      isMulti
                      required
                      placeholder="Select Payment Type"
                      className="text-sm"
                      options={[
                        { label: 'Cash', value: 'Cash' },
                        { label: 'Loan', value: 'Loan' },
                        { label: 'EMI', value: 'EMI' }
                      ]}
                      value={(formData.paymentType || []).map(val => ({ label: val, value: val }))}
                      onChange={(selected) => setFormData({ ...formData, paymentType: selected ? selected.map(o => o.value) : [] })}
                    />
                    <p className="mt-4 text-xs text-gray-400 italic">
                      * Payment Type is selected once per SKU selection. It applies to all rows below.
                    </p>
                  </div>
                </div>

                {/* Red Arrow helper mapping UI visually */}
                {/* This represents the logic mapping on the UI image */}
                <div className="relative mt-8 bg-[#f8f9fa] border border-gray-200 rounded-xl p-6">

                  {/* Table headers for dynamic rows */}
                  <div className="flex mb-2">
                    <div className="w-[30%] text-[13px] font-medium text-gray-600">Range (kW)</div>
                    <div className="w-[30%] text-[13px] font-medium text-gray-600 ml-4">Supply Types</div>
                    <div className="w-[35%] text-[13px] font-medium text-gray-600 ml-4">Login Type</div>
                    <div className="w-10"></div>
                  </div>

                  <div className="space-y-4">
                    {formData.skuItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">

                        <div className="w-[30%] flex gap-2">
                          <input
                            required
                            type="number"
                            min="0"
                            placeholder="Min"
                            className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                            value={item.minRange}
                            onChange={(e) => handleSkuItemChange(index, 'minRange', e.target.value)}
                          />
                          <input
                            required
                            type="number"
                            min="0"
                            placeholder="Max"
                            className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                            value={item.maxRange}
                            onChange={(e) => handleSkuItemChange(index, 'maxRange', e.target.value)}
                          />
                        </div>

                        <div className="w-[30%]">
                          <Select
                            isMulti
                            required
                            placeholder="Select Supply Types"
                            className="text-sm"
                            options={getDynamicSupplyTypeOptions()}
                            noOptionsMessage={() => (!formData.category || !formData.subCategory || !formData.projectType)
                              ? "Please select Category, Sub-Category and Range first"
                              : "No matching supply types found"}
                            value={(item.assignModules || []).map(mVal => ({ label: mVal, value: mVal }))}
                            onChange={(selected) => handleSkuItemChange(index, 'assignModules', selected ? selected.map(o => o.value) : [])}
                          />
                        </div>


                        <div className="w-[35%]">
                          <Select
                            isMulti
                            required
                            placeholder="Select Login Types"
                            className="text-sm"
                            options={getDynamicLoginTypeOptions(index)}
                            noOptionsMessage={() => (!formData.category || !formData.subCategory || !formData.projectType)
                              ? "Please select Category, Sub-Category and Range first"
                              : "No matching login types found for current configuration"}
                            value={(item.supplierType || []).map(sId => {
                              const s = supplierTypes.find(x => x._id === sId);
                              return { label: s?.loginTypeName || s?.name || sId, value: sId };
                            })}
                            onChange={(selected) => handleSkuItemChange(index, 'supplierType', selected ? selected.map(o => o.value) : [])}
                          />
                        </div>


                        <div className="w-10 flex justify-center">
                          {formData.skuItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSkuItem(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addSkuItem}
                      className="text-[#1f8dec] text-sm font-medium hover:underline flex items-center"
                    >
                      <Plus size={16} className="mr-1" /> Add New Row
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 bg-[#1976d2] text-white font-medium rounded-md shadow hover:bg-blue-700 flex items-center gap-2 transition"
                  >
                    <Save size={18} /> Save
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white py-3 border-t text-center text-xs text-gray-500 border-gray-200">
              Copyright © {new Date().getFullYear()} Solarkits. All Rights Reserved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}