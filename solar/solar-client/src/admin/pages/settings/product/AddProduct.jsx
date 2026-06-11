import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Save,
  Pencil,
  X,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Select from 'react-select';
import { productApi } from '../../../../api/productApi';
import { masterApi } from '../../../../api/masterApi';
import axiosInstance from '../../../../api/axios';
import {
  getSubCategories,
  getSubProjectTypes,
  getBrands
} from '../../../../services/settings/orderProcurementSettingApi';

const AddProduct = () => {
  const [view, setView] = useState('list'); // list, create, edit
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState([]);

  // Master Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [skus, setSkus] = useState([]);

  // Location Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Form State
  const initialFormState = {
    name: '',
    categoryIds: [],
    subCategoryIds: [],
    subProjectTypeIds: [],
    brandId: '',
    mechanicalParameters: [''],
    electricalParameters: [''],
    skuParameters: [''],
    description: '',
    status: true
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // Initial Fetch
  useEffect(() => {
    fetchProducts();
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [
        catRes, unitRes, skuRes, stateRes, subCatRes, subPTypeRes, brandRes
      ] = await Promise.all([
        productApi.getCategories(),
        productApi.getUnits(),
        productApi.getSkus(),
        axiosInstance.get('/locations/states'),
        getSubCategories(),
        getSubProjectTypes(),
        getBrands()
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (unitRes.data.success) setUnits(unitRes.data.data);
      if (skuRes.data.success) setSkus(skuRes.data.data);
      if (stateRes.data.success) setStates(stateRes.data.data);
      if (subCatRes?.data) setSubCategories(subCatRes.data);
      if (subPTypeRes?.data) setSubProjectTypes(subPTypeRes.data);
      if (brandRes) setBrands(Array.isArray(brandRes) ? brandRes : brandRes.data || []);
    } catch (error) {
      console.error("Error fetching masters", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const res = await axiosInstance.get(`/locations/cities?stateId=${stateId}`);
      if (res.data.success) setCities(res.data.data);
    } catch (error) { console.error(error); }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const res = await axiosInstance.get(`/locations/districts?cityId=${cityId}`);
      if (res.data.success) setDistricts(res.data.data);
    } catch (error) { console.error(error); }
  };

  // Handlers
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleCreateNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setView('create');
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData({ ...formData, stateId, cityId: '', districtId: '' });
    setCities([]);
    setDistricts([]);
    if (stateId) fetchCities(stateId);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setFormData({ ...formData, cityId, districtId: '' });
    setDistricts([]);
    if (cityId) fetchDistricts(cityId);
  };

  const formatOptions = (data) => data.map(item => ({
    value: item._id,
    label: item.name || item.companyName || 'Unnamed'
  }));



  const handleEdit = async (product) => {
    setEditingId(product._id);

    // Build initial form data
    const initialData = {
      name: product.name,
      categoryIds: product.categoryIds?.map(c => ({ value: c._id, label: c.name })) || 
                   (product.categoryId ? [{ value: product.categoryId._id, label: product.categoryId.name }] : []),
      subCategoryIds: product.subCategoryIds?.map(c => ({ value: c._id, label: c.name })) || 
                      (product.subCategoryId ? [{ value: product.subCategoryId._id, label: product.subCategoryId.name }] : []),
      subProjectTypeIds: product.subProjectTypeIds?.map(c => ({ value: c._id, label: c.name })) || 
                         (product.subProjectTypeId ? [{ value: product.subProjectTypeId._id, label: product.subProjectTypeId.name }] : []),
      brandId: product.brandId?._id || '',
      mechanicalParameters: product.mechanicalParameters?.length > 0 ? product.mechanicalParameters : [''],
      electricalParameters: product.electricalParameters?.length > 0 ? product.electricalParameters : [''],
      skuParameters: product.skuParameters?.length > 0 ? product.skuParameters : [''],
      description: product.description,
      status: product.status
    };

    setFormData(initialData);
    setView('edit'); // Switch view first
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name) {
      showToast('Product Name is required', 'error');
      return;
    }
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      showToast('Product Category is required', 'error');
      return;
    }

    // Filter out empty arrays and extract IDs from select objects
    const payload = {
      ...formData,
      categoryIds: formData.categoryIds.map(o => o.value),
      subCategoryIds: formData.subCategoryIds.map(o => o.value),
      subProjectTypeIds: formData.subProjectTypeIds.map(o => o.value),
      mechanicalParameters: formData.mechanicalParameters.filter(p => p.trim() !== ''),
      electricalParameters: formData.electricalParameters.filter(p => p.trim() !== ''),
      skuParameters: formData.skuParameters.filter(p => p.trim() !== '')
    }

    try {
      if (editingId) {
        await productApi.update(editingId, payload);
        showToast('Product Updated');
      } else {
        await productApi.create(payload);
        showToast('Product Created');
      }
      setView('list');
      fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete product?')) {
      try {
        await productApi.delete(id);
        showToast('Deleted');
        fetchProducts();
      } catch (error) {
        showToast('Failed to delete', 'error');
      }
    }
  };


  const filteredList = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !p.stateId && 
    !p.clusterId
  );

  // --- Create/Edit View ---
  if (view === 'create' || view === 'edit') {
    return (
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">{view === 'create' ? 'Create Product' : 'Edit Product'}</h3>
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Basic Info */}
          <div className="col-span-full">
            <h5 className="font-semibold text-blue-600 mb-3 block border-b pb-1">Basic Details</h5>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" className="w-full border rounded p-2"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Product Category *</label>
            <Select
              isMulti
              options={formatOptions(categories)}
              value={formData.categoryIds}
              onChange={(vals) => setFormData({ ...formData, categoryIds: vals || [], subCategoryIds: [] })}
              className="text-sm"
              placeholder="Select Categories"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sub Category</label>
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

          <div>
            <label className="block text-sm font-medium mb-1">Sub Project Type</label>
            <Select
              isMulti
              options={formatOptions(subProjectTypes)}
              value={formData.subProjectTypeIds}
              onChange={(vals) => setFormData({ ...formData, subProjectTypeIds: vals || [] })}
              className="text-sm"
              placeholder="Select Sub Project Types"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select className="w-full border rounded p-2"
              value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: e.target.value })}>
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b._id} value={b._id}>{b.name || b.companyName}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Dynamic Parameters */}
          <div className="border rounded-md p-4">
            <h5 className="font-semibold text-blue-600 mb-3">Mechanical</h5>
            {formData.mechanicalParameters.map((param, index) => (
              <div key={`mech-${index}`} className="flex items-center gap-2 mb-2">
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm" 
                  placeholder="Mechanical Parameter"
                  value={param}
                  onChange={(e) => {
                    const newArr = [...formData.mechanicalParameters];
                    newArr[index] = e.target.value;
                    setFormData({ ...formData, mechanicalParameters: newArr });
                  }}
                />
                {formData.mechanicalParameters.length > 1 && (
                  <button onClick={() => {
                      const newArr = formData.mechanicalParameters.filter((_, i) => i !== index);
                      setFormData({ ...formData, mechanicalParameters: newArr });
                  }} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={() => setFormData({ ...formData, mechanicalParameters: [...formData.mechanicalParameters, ''] })}
              className="mt-2 bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1 font-medium"
            >
              + Add More
            </button>
          </div>

          <div className="border rounded-md p-4">
            <h5 className="font-semibold text-blue-600 mb-3">Electrical</h5>
            {formData.electricalParameters.map((param, index) => (
              <div key={`elec-${index}`} className="flex items-center gap-2 mb-2">
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm" 
                  placeholder="Electrical Parameter"
                  value={param}
                  onChange={(e) => {
                    const newArr = [...formData.electricalParameters];
                    newArr[index] = e.target.value;
                    setFormData({ ...formData, electricalParameters: newArr });
                  }}
                />
                {formData.electricalParameters.length > 1 && (
                  <button onClick={() => {
                      const newArr = formData.electricalParameters.filter((_, i) => i !== index);
                      setFormData({ ...formData, electricalParameters: newArr });
                  }} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={() => setFormData({ ...formData, electricalParameters: [...formData.electricalParameters, ''] })}
              className="mt-2 bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1 font-medium"
            >
              + Add More
            </button>
          </div>

          <div className="border rounded-md p-4">
            <h5 className="font-semibold text-blue-600 mb-3">SKU</h5>
            {formData.skuParameters.map((param, index) => (
              <div key={`sku-${index}`} className="flex items-center gap-2 mb-2">
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm" 
                  placeholder="SKU Parameter"
                  value={param}
                  onChange={(e) => {
                    const newArr = [...formData.skuParameters];
                    newArr[index] = e.target.value;
                    setFormData({ ...formData, skuParameters: newArr });
                  }}
                />
                {formData.skuParameters.length > 1 && (
                  <button onClick={() => {
                      const newArr = formData.skuParameters.filter((_, i) => i !== index);
                      setFormData({ ...formData, skuParameters: newArr });
                  }} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={() => setFormData({ ...formData, skuParameters: [...formData.skuParameters, ''] })}
              className="mt-2 bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1 font-medium"
            >
              + Add More
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded p-2" rows="3"
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => setView('list')} className="px-5 py-2 border rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Save Product</button>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="container mx-auto p-4">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-lg shadow-lg flex items-center gap-2 text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6 p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
        <button onClick={handleCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} /> Create Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full border rounded-lg pl-10 pr-4 py-2"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#42A5F5] text-white border-b">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Mechanical</th>
                  <th className="p-3">Electrical</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(p => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 font-semibold">{p.categoryId?.name || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {p.mechanicalParameters?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.mechanicalParameters.map((param, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{param}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {p.electricalParameters?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.electricalParameters.map((param, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{param}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {p.skuParameters?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.skuParameters.map((param, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{param}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-blue-500 p-1"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;