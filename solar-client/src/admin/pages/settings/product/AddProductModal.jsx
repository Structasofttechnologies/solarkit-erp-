import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Select from 'react-select';
import { productApi } from '../../../../api/productApi';

const AddProductModal = ({ isOpen, onClose, selectedStates, selectedClusters, states, clusters, onSuccess, editingProduct }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingMasters, setFetchingMasters] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Master Data States
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [skus, setSkus] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [availableSkuParams, setAvailableSkuParams] = useState([]);
  const [skuValues, setSkuValues] = useState([]); // [{ key: string, value: string }]
  const [isProjectTypeDropdownOpen, setIsProjectTypeDropdownOpen] = useState(false);
  const [isSubProjectTypeDropdownOpen, setIsSubProjectTypeDropdownOpen] = useState(false);
  const [isSkuParamDropdownOpen, setIsSkuParamDropdownOpen] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [techOptions, setTechOptions] = useState(['bifacial', 'topcon', 'monocrystalline']);
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [hasTolerance, setHasTolerance] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryIds: [],
    subCategoryIds: [],
    projectTypes: [], // [{from, to}]
    subProjectTypeIds: [],
    brandId: '',
    skuId: '',
    serialNo: '',
    subtype: '',
    technology: [], // Managed as array for checkboxes
    tolerance: '+/- 3%',
    dcr: 'DCR',
    datasheet: '',
    description: '',
    status: true
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProjectTypeDropdownOpen && !event.target.closest('.project-type-dropdown')) {
        setIsProjectTypeDropdownOpen(false);
      }
      if (isSubProjectTypeDropdownOpen && !event.target.closest('.sub-project-type-dropdown')) {
        setIsSubProjectTypeDropdownOpen(false);
      }
      if (isSkuParamDropdownOpen && !event.target.closest('.sku-param-dropdown')) {
        setIsSkuParamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectTypeDropdownOpen, isSubProjectTypeDropdownOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name || '',
          categoryIds: editingProduct.categoryIds?.map(c => ({ value: c._id, label: c.name })) ||
            (editingProduct.categoryId ? [{ value: editingProduct.categoryId?._id || editingProduct.categoryId, label: editingProduct.categoryId?.name || 'Category' }] : []),
          subCategoryIds: editingProduct.subCategoryIds?.map(c => ({ value: c._id, label: c.name })) ||
            (editingProduct.subCategoryId ? [{ value: editingProduct.subCategoryId?._id || editingProduct.subCategoryId, label: editingProduct.subCategoryId?.name || 'Sub Category' }] : []),
          projectTypes: editingProduct.projectTypes || (editingProduct.projectTypeFrom !== undefined && editingProduct.projectTypeTo !== undefined ? [{ from: editingProduct.projectTypeFrom, to: editingProduct.projectTypeTo }] : []),
          subProjectTypeIds: editingProduct.subProjectTypeIds?.map(p => ({ value: p._id || p, label: p.name || 'Sub Project Type' })) ||
            (editingProduct.subProjectTypeId ? [{ value: editingProduct.subProjectTypeId?._id || editingProduct.subProjectTypeId, label: editingProduct.subProjectTypeId?.name || 'Sub Project Type' }] : []),
          brandId: editingProduct.brandId?._id || editingProduct.brandId || '',
          serialNo: editingProduct.serialNo || '',
          subtype: editingProduct.subtype || '',
          technology: typeof editingProduct.technology === 'string' ? editingProduct.technology.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(editingProduct.technology) ? editingProduct.technology : []),
          tolerance: editingProduct.tolerance || '+/- 3%',
          dcr: editingProduct.dcr || 'DCR',
          datasheet: editingProduct.datasheet || '',
          description: editingProduct.description || '',
          status: editingProduct.status ?? true
        });

        // Initialize filter states for edit mode
        setProductTypeFilter(editingProduct.categoryId?._id || editingProduct.categoryId || '');
        setBrandFilter(editingProduct.brandId?._id || editingProduct.brandId || '');
      } else {
        setFormData({
          name: '',
          categoryIds: [],
          subCategoryIds: [],
          projectTypes: [],
          subProjectTypeIds: [],
          brandId: '',
          serialNo: '',
          subtype: '',
          technology: [],
          tolerance: '+/- 3%',
          dcr: 'DCR',
          datasheet: '',
          description: '',
          status: true
        });
        setHasTolerance(false);
      }
      fetchMasters();
    }
  }, [isOpen, editingProduct]);

  // Sync available parameters from template when name or templates changes (especially for Edit mode)
  useEffect(() => {
    if (formData.name && templates.length > 0) {
      const template = templates.find(t => t.name === formData.name);
      if (template) {
        setAvailableSkuParams(template.skuParameters || []);
      }
    }
  }, [formData.name, templates]);

  const fetchMasters = async () => {
    try {
      setFetchingMasters(true);
      const [catRes, subPTypeRes, mappingRes, brandRes, subCatRes, skusRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getSubProjectTypes(),
        productApi.getProjectCategoryMappings(),
        productApi.getBrands(),
        productApi.getSubCategories(),
        productApi.getSkus()
      ]);

      setCategories(catRes?.data?.data || []);
      setSubProjectTypes(subPTypeRes?.data?.data || []);
      setMappings(mappingRes?.data?.data || []);
      setBrands(Array.isArray(brandRes?.data) ? brandRes.data : brandRes?.data?.data || []);
      setSubCategories(subCatRes?.data?.data || []);
      setSkus(skusRes?.data?.data || []);

      const allProducts = (await productApi.getAll())?.data?.data || [];
      const productTemplates = allProducts.filter(p => !p.stateId && !p.clusterId);
      setTemplates(productTemplates);

    } catch (error) {
      console.error("Error fetching masters for modal:", error);
      showToast("Failed to load master data", "error");
    } finally {
      setFetchingMasters(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.categoryIds.length === 0) {
      showToast("Product Name and Category are required", "error");
      return;
    }

    if (selectedStates.length === 0 || selectedClusters.length === 0) {
      showToast("Please select at least one State and Cluster first", "error");
      return;
    }

    try {
      setLoading(true);
      // Construct payload including selected geographic context
      const payload = {
        ...formData,
        categoryIds: formData.categoryIds.map(o => o.value),
        subCategoryIds: formData.subCategoryIds.map(o => o.value),
        subProjectTypeIds: formData.subProjectTypeIds.map(o => o.value),
        stateId: (selectedStates[0] || (editingProduct ? (editingProduct.stateId?._id || editingProduct.stateId) : undefined)),
        clusterId: (selectedClusters[0] || (editingProduct ? (editingProduct.clusterId?._id || editingProduct.clusterId) : undefined)),
        technology: Array.isArray(formData.technology) ? formData.technology.join(', ') : formData.technology,
        skuParameters: skuValues.map(sv => `${sv.key}: ${sv.value}`)
      };

      let res;
      if (editingProduct) {
        res = await productApi.update(editingProduct._id, payload);
      } else {
        res = await productApi.create(payload);
      }

      if (res.data.success) {
        showToast(editingProduct ? "Product updated successfully" : "Product created successfully");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStatesNames = () => {
    if (selectedStates.length > 0) {
      return selectedStates.map(id => states?.find(s => s._id === id)?.name).filter(Boolean).join(', ');
    }
    if (editingProduct) {
      return editingProduct.stateId?.name || states?.find(s => s._id === (editingProduct.stateId?._id || editingProduct.stateId))?.name || 'None';
    }
    return 'None';
  };

  const getSelectedClustersNames = () => {
    if (selectedClusters.length > 0) {
      return selectedClusters.map(id => clusters?.find(c => c._id === id)?.name).filter(Boolean).join(', ');
    }
    if (editingProduct) {
      return editingProduct.clusterId?.name || clusters?.find(c => c._id === (editingProduct.clusterId?._id || editingProduct.clusterId))?.name || 'None';
    }
    return 'None';
  };

  const selectedStatesNames = getSelectedStatesNames();
  const selectedClustersNames = getSelectedClustersNames();

  const formatOptions = (data) => data.map(item => ({
    value: item._id,
    label: item.name || item.companyName || 'Unnamed'
  }));

  // Derived options
  const filteredMappings = mappings.filter(m =>
    (!formData.categoryIds.length || formData.categoryIds.some(cat => (m.categoryId?._id || m.categoryId) === cat.value)) &&
    (!formData.subCategoryIds.length || formData.subCategoryIds.some(sub => (m.subCategoryId?._id || m.subCategoryId) === sub.value))
  );

  // Eliminate duplicates for the dropdown display
  const projectTypeOptions = Array.from(new Map(
    filteredMappings.filter(m => m.projectTypeFrom !== undefined && m.projectTypeTo !== undefined).map(m => {
      const label = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
      return [label, { from: m.projectTypeFrom, to: m.projectTypeTo, label }];
    })
  ).values());

  // Template filtering logic based on Image 1 (Product Type + Brand filter templates)
  const filteredTemplates = templates.filter(t =>
    (!productTypeFilter || (t.categoryId?._id || t.categoryId) === productTypeFilter) &&
    (!brandFilter || (t.brandId?._id || t.brandId) === brandFilter)
  );

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white rounded shadow-sm border border-gray-200 mt-2 font-sans mb-6">
      {/* Toasts inside inline component */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded shadow-lg flex items-center gap-2 text-white animate-fadeIn ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <div className="w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-blue-600 font-bold text-lg">Add New Product</h2>
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm">
            Back to List
          </button>
        </div>

        {/* Selected Locations Summary */}
        <div className="p-4 bg-[#ebf3fc] rounded mb-6 text-sm">
          <div className="font-bold text-[#003366] mb-1">Selected Locations</div>
          <div className="flex flex-col xl:flex-row xl:gap-24">
            <div className="truncate"><span className="font-bold text-gray-800">States:</span> <span className="text-gray-600">{selectedStatesNames}</span></div>
            <div className="truncate"><span className="font-bold text-gray-800">Clusters:</span> <span className="text-gray-600">{selectedClustersNames}</span></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Product Type Dropdown (Now using Template names) */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Product Type</label>
            <select
              className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white"
              value={productTypeFilter}
              onChange={(e) => {
                const val = e.target.value;
                setProductTypeFilter(val);
              }}
            >
              <option value="" className="text-gray-400">Select Product Type</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Product Name (Reverted to Manual Input) */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Product Name</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-blue-50/10 font-bold focus:border-blue-400 transition"
              placeholder="Enter Product Name manually"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* 3. Brand Filter */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Brand</label>
            <select
              className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white"
              value={brandFilter}
              onChange={(e) => {
                const val = e.target.value;
                setBrandFilter(val);
                setFormData(prev => ({ ...prev, brandId: val })); // Actually save the brandId
              }}
            >
              <option value="" className="text-gray-400">Select Brand</option>
              {Array.from(new Map(brands.map(b => [b.name || b.companyName, b])).values()).map(b => (
                <option key={b._id} value={b._id}>{b.name || b.companyName}</option>
              ))}
            </select>
          </div>

          {/* 4. Project Category */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Project Category</label>
            <Select
              isMulti
              options={formatOptions(categories)}
              value={formData.categoryIds}
              onChange={(vals) => setFormData({ ...formData, categoryIds: vals || [], subCategoryIds: [] })}
              className="text-sm"
              placeholder="Select Project Categories"
            />
          </div>

          {/* 5. Sub Category */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Sub Category</label>
            <Select
              isMulti
              options={formatOptions(subCategories.filter(c => {
                const parentId = c.categoryId?._id || c.category?._id || c.categoryId || c.category;
                return formData.categoryIds.some(cat => cat.value === parentId);
              }))}
              value={formData.subCategoryIds}
              onChange={(vals) => setFormData({ ...formData, subCategoryIds: vals || [] })}
              className="text-sm"
              placeholder="Select Sub Categories"
              isDisabled={formData.categoryIds.length === 0}
            />
          </div>

          {/* 6. Project Type Multi-Select */}
          <div className="relative project-type-dropdown">
            <label className="block text-gray-500 text-xs mb-1">Project Type</label>
            <div
              className={`w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white cursor-pointer flex flex-wrap gap-1 min-h-[42px]`}
              onClick={() => setIsProjectTypeDropdownOpen(!isProjectTypeDropdownOpen)}
            >
              {formData.projectTypes.length === 0 ? (
                <span className="text-gray-400">Select Project Type</span>
              ) : (
                formData.projectTypes.map((pt, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    {pt.from} to {pt.to} kW
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, projectTypes: prev.projectTypes.filter((_, idx) => idx !== i) }));
                    }} />
                  </span>
                ))
              )}
            </div>
            {isProjectTypeDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                {projectTypeOptions.map((opt, i) => {
                  const isSelected = formData.projectTypes.some(pt => pt.from === opt.from && pt.to === opt.to);
                  return (
                    <label key={i} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            projectTypes: isSelected
                              ? prev.projectTypes.filter(pt => !(pt.from === opt.from && pt.to === opt.to))
                              : [...prev.projectTypes, { from: opt.from, to: opt.to }]
                          }));
                        }}
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Sub Project Type Multi-Select */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Sub Project Type</label>
            <Select
              isMulti
              options={formatOptions(subProjectTypes)}
              value={formData.subProjectTypeIds}
              onChange={(vals) => setFormData({ ...formData, subProjectTypeIds: vals || [] })}
              className="text-sm"
              placeholder="Select Sub Project Types"
            />
          </div>

          {/* 8. Product Serial No */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Product Serial No</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white"
              value={formData.serialNo}
              onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
            />
          </div>

          {/* 9. Product Subtype */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Product Subtype</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white"
              value={formData.subtype}
              onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
            />
          </div>

          {/* Tolerance Toggle */}
          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <label className="block text-gray-700 font-bold text-xs mb-3">Does this product have Tolerance?</label>
            <div className="flex gap-12">
              <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer group">
                <input
                  type="radio"
                  name="hasTolerance"
                  checked={hasTolerance}
                  onChange={() => setHasTolerance(true)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                />
                <span className="group-hover:text-blue-600 transition font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer group">
                <input
                  type="radio"
                  name="hasTolerance"
                  checked={!hasTolerance}
                  onChange={() => {
                    setHasTolerance(false);
                    setFormData(prev => ({ ...prev, tolerance: 'None' }));
                  }}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                />
                <span className="group-hover:text-blue-600 transition font-medium">No</span>
              </label>
            </div>
          </div>

          {/* Tolerance Input (Conditional) */}
          {hasTolerance && (
            <div>
              <label className="block text-gray-500 text-xs mb-1">Tolerance (%)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white shadow-sm"
                placeholder="Enter tolerance (e.g., +/- 3%)"
                value={formData.tolerance === 'None' ? '' : formData.tolerance}
                onChange={(e) => setFormData({ ...formData, tolerance: e.target.value })}
              />
            </div>
          )}

          {/* 10. Product Technology (Checkboxes) */}
          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <label className="block text-gray-700 font-bold text-xs mb-3">Product Technology</label>
            <div className="flex flex-wrap gap-6 items-center mb-4">
              {techOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.technology.includes(opt)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        technology: checked
                          ? [...prev.technology, opt]
                          : prev.technology.filter(t => t !== opt)
                      }));
                    }}
                    className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                  <span className="group-hover:text-blue-600 transition capitalize">{opt}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add technology"
                className="flex-1 border border-gray-200 rounded p-2 text-sm outline-none focus:border-blue-400 transition"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-1.5 rounded text-sm font-bold hover:bg-blue-700 transition shadow-sm"
                onClick={() => {
                  if (newTech.trim() && !techOptions.includes(newTech.trim().toLowerCase())) {
                    const tech = newTech.trim().toLowerCase();
                    setTechOptions([...techOptions, tech]);
                    setFormData(prev => ({ ...prev, technology: [...prev.technology, tech] }));
                    setNewTech('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* 11. DCR Type (Radios) */}
          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <label className="block text-gray-700 font-bold text-xs mb-3">DCR Type</label>
            <div className="flex gap-12">
              {['DCR', 'Non-DCR', 'NA'].map(opt => (
                <label key={opt} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer group">
                  <input
                    type="radio"
                    name="dcrType"
                    checked={formData.dcr === opt}
                    onChange={() => setFormData({ ...formData, dcr: opt })}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                  <span className="group-hover:text-blue-600 transition font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 12. Upload Datasheet */}
          <div>
            <label className="block text-gray-500 text-xs mb-1">Upload Datasheet</label>
            <input
              type="file"
              className="w-full border border-gray-200 rounded p-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // In a real app, you'd upload here. For now, we'll store a mock URL if needed or handle via handler
                  setFormData({ ...formData, datasheet: file.name });
                }
              }}
            />
          </div>

          {/* SKU Parameters Section (Existing Logic, kept but polished) */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-tight mb-4 text-center">SKU Parameters</h3>
            <div className="space-y-3">
              {skuValues.map((sv, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="flex-1">
                    <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">{sv.key}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded p-2 outline-none text-sm text-gray-700 bg-white shadow-inner"
                      placeholder={`Enter ${sv.key}`}
                      value={sv.value}
                      onChange={(e) => {
                        const next = [...skuValues];
                        next[idx].value = e.target.value;
                        setSkuValues(next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSkuValues(skuValues.filter((_, i) => i !== idx))}
                    className="mt-5 text-red-400 hover:text-red-600 transition p-1 bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {availableSkuParams.length > 0 && (
                <div className="relative sku-param-dropdown">
                  <button
                    type="button"
                    onClick={() => setIsSkuParamDropdownOpen(!isSkuParamDropdownOpen)}
                    className="w-full py-2 border-2 border-dashed border-blue-200 rounded text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add SKU Parameter
                  </button>
                  {isSkuParamDropdownOpen && (
                    <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-200 rounded shadow-2xl max-h-48 overflow-y-auto">
                      {availableSkuParams
                        .filter(key => !skuValues.some(sv => sv.key === key))
                        .map((key, i) => (
                          <div
                            key={i}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-center justify-between font-medium group"
                            onClick={() => {
                              setSkuValues([...skuValues, { key, value: '' }]);
                              setIsSkuParamDropdownOpen(false);
                            }}
                          >
                            <span>{key}</span>
                            <Plus size={14} className="text-blue-300 group-hover:text-blue-500" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#0066cc] text-white rounded text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
