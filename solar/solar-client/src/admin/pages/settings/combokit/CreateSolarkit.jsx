import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Save, RefreshCw, Cog, List,
  Edit2, Trash2, CheckSquare, XSquare,
  Search, Filter, MoreVertical, ChevronRight,
  AlertCircle, Info, Settings, Eye, Package,
  Loader, Upload, FileText
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  createSolarKit as createSolarkit,
  getSolarKits as getSolarkits,
  updateSolarKit as updateSolarkit,
  deleteSolarKit as deleteSolarkit,
  updateSolarKitStatus as updateSolarkitStatus,
  saveSolarKitBOM as saveSolarkitBOM,
  getSolarKitBOM as getSolarkitBOM
} from '../../../../services/combokit/combokitApi';
import { productApi } from '../../../../api/productApi';
import toast from 'react-hot-toast';

const CreateSolarkit = () => {
  const { countries, loading: locationLoading, fetchCountries } = useLocations();

  // State management
  const [activeCountry, setActiveCountry] = useState('India');
  const [solarkits, setSolarkits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Master Data States
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Form states
  const [solarkitForm, setSolarkitForm] = useState({
    name: '',
    products: [''],
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: ''
  });

  // BOM State
  const [bomData, setBomData] = useState([{
    bosKitName: '',
    kitType: 'Combokit',
    kitCategory: '',
    items: [{ name: '', type: '', qty: '', unit: '', price: 0 }]
  }]);
  const [currentKitId, setCurrentKitId] = useState(null);

  const countriesList = [
    { name: 'India', code: 'IN', flag: '🇮🇳' },
    { name: 'USA', code: 'US', flag: '🇺🇸' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchCountries();
    fetchSolarkits();
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [catRes, subCatRes, mappingRes, subPTypeRes, prodRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getSubCategories(),
        productApi.getProjectCategoryMappings(),
        productApi.getSubProjectTypes(),
        productApi.getAll()
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (subCatRes.data.success) setSubCategories(subCatRes.data.data);
      
      if (mappingRes.data.success) {
        // Extract unique project type strings (e.g., "1 to 10 kW")
        const uniqueProjectTypes = Array.from(new Set(
          mappingRes.data.data.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
        )).sort();
        setProjectTypes(uniqueProjectTypes);
      }

      if (subPTypeRes.data.success) setSubProjectTypes(subPTypeRes.data.data);
      if (prodRes.data.success) setProductsList(prodRes.data.data);
    } catch (error) {
      console.error('Error fetching masters:', error);
      toast.error('Failed to load form options');
    }
  };

  // Update activeCountry when countries load
  useEffect(() => {
    if (countries && countries.length > 0 && !activeCountry) {
      setActiveCountry(countries[0].name);
    }
  }, [countries]);

  // Fetch Solarkits
  const fetchSolarkits = async () => {
    try {
      setLoading(true);
      const data = await getSolarkits();
      setSolarkits(data);
    } catch (error) {
      console.error('Error fetching solarkits:', error);
      toast.error('Failed to load solarkits');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSolarkitForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product changes
  const handleProductChange = (index, value) => {
    const newProducts = [...solarkitForm.products];
    newProducts[index] = value;
    setSolarkitForm(prev => ({
      ...prev,
      products: newProducts
    }));
  };

  // Add product field
  const addProductField = () => {
    setSolarkitForm(prev => ({
      ...prev,
      products: [...prev.products, '']
    }));
  };

  // Remove product field
  const removeProductField = (index) => {
    const newProducts = solarkitForm.products.filter((_, i) => i !== index);
    setSolarkitForm(prev => ({
      ...prev,
      products: newProducts
    }));
  };

  // Save solarkit
  const saveSolarkit2 = async () => {
    if (!solarkitForm.name) {
      toast.error('Please enter a kit name');
      return;
    }

    const countryObj = countries.find(c => c.name.toLowerCase() === activeCountry.toLowerCase());
    if (!countryObj) {
      toast.error('Country configuration error');
      return;
    }

    const payload = {
      ...solarkitForm,
      country: countryObj._id,
      products: solarkitForm.products.filter(p => p.trim() !== '')
    };

    try {
      if (currentRow) {
        await updateSolarkit(currentRow._id, payload);
        toast.success('Solarkit updated successfully');
      } else {
        await createSolarkit(payload);
        toast.success('Solarkit created successfully');
      }
      setModalOpen(false);
      fetchSolarkits();
      setSolarkitForm({
        name: '',
        products: [''],
        category: '',
        subCategory: '',
        projectType: '',
        subProjectType: ''
      });
      setCurrentRow(null);
    } catch (error) {
      console.error('Error saving solarkit:', error);
      toast.error('Failed to save solarkit');
    }
  };

  // Edit solarkit
  const handleEdit = (kit) => {
    setCurrentRow(kit);
    setSolarkitForm({
      name: kit.name,
      products: kit.products || ['Panel'],
      category: kit.category || 'Solar Panel',
      subCategory: kit.subCategory || 'Residential',
      projectType: kit.projectType || '1kW - 10kW',
      subProjectType: kit.subProjectType || 'On Grid'
    });
    setModalOpen(true);
  };

  // Delete solarkit
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solarkit?')) {
      try {
        await deleteSolarkit(id);
        toast.success('Solarkit deleted successfully');
        fetchSolarkits();
      } catch (error) {
        console.error('Error deleting solarkit:', error);
        toast.error('Failed to delete solarkit');
      }
    }
  };

  // Toggle status
  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateSolarkitStatus(id, !currentStatus);
      toast.success('Status updated successfully');
      fetchSolarkits();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // BOM Management
  const openBomModal = async (kit) => {
    setCurrentKitId(kit._id);
    setCurrentRow(kit);
    try {
      const data = await getSolarkitBOM(kit._id);
      const initialBOM = data.bom && data.bom.length > 0
        ? data.bom.map(section => ({
          ...section,
          items: section.items?.map(item => ({
            ...item,
            itemType: item.itemType || item.type // Backward compatibility
          })) || []
        }))
        : [{
          bosKitName: '',
          kitType: 'Combokit',
          kitCategory: '',
          items: [{ name: '', itemType: '', qty: '', unit: '', price: 0 }]
        }];
      setBomData(initialBOM);
      setBomModalOpen(true);
    } catch (error) {
      console.error('Error fetching BOM:', error);
      toast.error('Failed to load BOM');
    }
  };

  const addBomSection = () => {
    setBomData([...bomData, {
      bosKitName: '',
      kitType: 'Combokit',
      kitCategory: '',
      items: [{ name: '', itemType: '', qty: '', unit: '', price: 0 }]
    }]);
  };

  const removeBomSection = (index) => {
    const newData = bomData.filter((_, i) => i !== index);
    setBomData(newData);
  };

  const updateBomSection = (index, field, value) => {
    const newData = [...bomData];
    newData[index][field] = value;
    setBomData(newData);
  };

  const addBomItem = (sectionIndex) => {
    const newData = [...bomData];
    newData[sectionIndex].items.push({ name: '', itemType: '', qty: '', unit: '', price: 0 });
    setBomData(newData);
  };

  const removeBomItem = (sectionIndex, itemIndex) => {
    const newData = [...bomData];
    newData[sectionIndex].items = newData[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setBomData(newData);
  };

  const updateBomItem = (sectionIndex, itemIndex, field, value) => {
    const newData = [...bomData];
    newData[sectionIndex].items[itemIndex][field] = value;
    setBomData(newData);
  };

  const saveBOM = async () => {
    try {
      await saveSolarkitBOM(currentKitId, bomData);
      toast.success('BOM saved successfully');
      setBomModalOpen(false);
      fetchSolarkits();
    } catch (error) {
      console.error('Error saving BOM:', error);
      toast.error('Failed to save BOM');
    }
  };

  const openViewModal = (kit) => {
    setCurrentRow(kit);
    setViewModalOpen(true);
  };

  const filteredSolarkits = solarkits.filter(kit => {
    const countryName = kit.country?.name || '';
    if (countryName.toLowerCase() !== activeCountry.toLowerCase()) return false;
    if (searchQuery) {
      return kit.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          Add Solarkits - {activeCountry}
        </h1>
        <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
      </div>

      {/* Country Tabs - Dynamic from database */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {countries.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveCountry(c.name)}
            className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 group shadow-sm hover:shadow ${activeCountry === c.name
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-100 text-gray-500 hover:border-blue-200"
              }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider">{c.name}</span>
            <span className="text-base font-black opacity-80">{c.code || c.name.substring(0, 2).toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* List Header */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <List className="text-blue-600" size={18} />
          SolarKits List
        </h2>
        <div className="relative flex-1 max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b] text-white border-b border-gray-700">
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Create</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Name</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Country</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Category</th>
                <th className="px-4 py-4 font-bold uppercase text-[11px] tracking-wider">Sub Category</th>
                <th className="px-4 py-4 font-bold uppercase text-[11px] tracking-wider">Project Type</th>
                <th className="px-4 py-4 font-bold uppercase text-[11px] tracking-wider">Sub Project Type</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider text-center">View</th>
                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-20">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader className="animate-spin text-blue-600" size={40} />
                      <p className="text-gray-500 font-bold">Synchronizing Regional Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSolarkits.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No solar kits found for this region. Initialize your first kit below.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSolarkits.map((kit) => (
                  <tr key={kit._id} className="hover:bg-blue-50/20 transition-colors group border-b border-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(kit)}
                          className="bg-[#0ea5e9] text-white px-3 py-1.5 rounded text-[11px] font-bold hover:bg-[#0284c7] transition-all shadow-sm"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => openBomModal(kit)}
                          className="bg-[#64748b] text-white px-3 py-1.5 rounded text-[11px] font-bold hover:bg-[#475569] transition-all shadow-sm"
                        >
                          Add BOM
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(kit._id, kit.status === 'Active')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${kit.status === 'Active'
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                      >
                        {kit.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 text-sm">{kit.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{kit.country?.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{kit.category}</td>
                    <td className="px-4 py-4 text-gray-600 text-[13px]">{kit.subCategory}</td>
                    <td className="px-4 py-4 text-gray-600 text-[13px]">{kit.projectType}</td>
                    <td className="px-4 py-4 text-gray-600 text-[13px]">{kit.subProjectType}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openViewModal(kit)}
                        className="bg-[#06b6d4] text-white px-4 py-1.5 rounded text-[11px] font-bold hover:bg-[#0891b2] transition-all shadow-sm"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(kit)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                          title="Edit SolarKit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(kit._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                          title="Delete SolarKit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              <tr className="bg-gray-50/30">
                <td colSpan="11" className="px-6 py-6 text-center">
                  <button
                    onClick={() => {
                      setSolarkitForm({
                        name: '',
                        products: [''],
                        category: '',
                        subCategory: '',
                        projectType: '',
                        subProjectType: ''
                      });
                      setCurrentRow(null);
                      setModalOpen(true);
                    }}
                    className="group bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
                  >
                    <PlusCircle size={18} />
                    CREATE NEW SOLAR KIT
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center p-4">
        <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">
          Copyright © 2025 Solarkits. All Rights Reserved.
        </p>
      </div>

      {/* Internal Modals */}
      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[60] flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-3xl shadow-2xl rounded-md overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-8 py-6 flex justify-between items-center bg-white">
              <h3 className="text-2xl font-bold text-[#1e293b]">
                {currentRow ? 'Update SolarKit' : 'Create New SolarKit'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XSquare size={28} />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="space-y-6">
                {/* SolarKit Name */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">SolarKit Name</label>
                  <input
                    type="text"
                    name="name"
                    value={solarkitForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 text-lg"
                    placeholder="Enter kit name"
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={solarkitForm.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Sub Category</label>
                    <select
                      name="subCategory"
                      value={solarkitForm.subCategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 cursor-pointer"
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories
                        .filter(sub => !solarkitForm.category || sub.categoryId?.name === solarkitForm.category || sub.category?.name === solarkitForm.category)
                        .map(sub => (
                          <option key={sub._id} value={sub.name}>{sub.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Project Type</label>
                    <select
                      name="projectType"
                      value={solarkitForm.projectType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 cursor-pointer"
                    >
                      <option value="">Select Project Type</option>
                      {projectTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Sub Project Type</label>
                    <select
                      name="subProjectType"
                      value={solarkitForm.subProjectType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 cursor-pointer"
                    >
                      <option value="">Select Sub Project Type</option>
                      {subProjectTypes.map(type => (
                        <option key={type._id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products Section */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Products</label>
                  <div className="space-y-4">
                    {solarkitForm.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <select
                          value={product}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 cursor-pointer"
                        >
                          <option value="">Select Product</option>
                          {productsList.map(prod => (
                            <option key={prod._id} value={prod.name}>{prod.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeProductField(index)}
                          className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                        >
                          <span className="text-2xl font-light">&times;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addProductField}
                    className="mt-4 text-[#0ea5e9] hover:text-[#0284c7] font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-12 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-8 py-2.5 bg-[#6b7280] text-white rounded font-bold text-sm hover:bg-[#4b5563] transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSolarkit2}
                  className="px-8 py-2.5 bg-[#0284c7] text-white rounded font-bold text-sm hover:bg-[#0369a1] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} />
                  {currentRow ? 'Save' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOM Configuration Modal */}
      {bomModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden animate-slideUp">
            {/* BOM Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Package className="text-cyan-400" size={18} />
                  <h3 className="text-base font-bold tracking-tight">Bill of Materials (BOM)</h3>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  CONFIGURING <ChevronRight size={10} className="text-slate-600" /> <span className="text-cyan-400">{currentRow?.name || 'SolarKit'}</span>
                </p>
              </div>
              <button onClick={() => setBomModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-all border border-slate-700/50">
                <XSquare size={18} className="text-slate-300" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              <div className="space-y-5">
                {bomData.map((section, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 relative animate-fadeIn shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="bg-cyan-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">0{idx + 1}</span>
                        BOM SECTION
                      </h4>
                      {idx > 0 && (
                        <button
                          onClick={() => removeBomSection(idx)}
                          className="text-rose-500 hover:text-rose-700 px-2 py-1 rounded-md font-bold text-[9px] flex items-center gap-1 transition-all bg-rose-50 border border-rose-100"
                        >
                          <Trash2 size={10} /> REMOVE
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">BOS KIT NAME</label>
                        <input
                          type="text"
                          value={section.bosKitName}
                          onChange={(e) => updateBomSection(idx, 'bosKitName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none font-bold text-slate-700 bg-white placeholder:text-slate-300 text-xs transition-all"
                          placeholder="e.g. Inverter Kit"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">KIT TYPE</label>
                        <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg h-[38px] items-center">
                          <button
                            onClick={() => updateBomSection(idx, 'kitType', 'CP')}
                            className={`flex-1 h-full rounded-md text-[10px] font-black transition-all ${section.kitType === 'CP' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            CP
                          </button>
                          <button
                            onClick={() => updateBomSection(idx, 'kitType', 'Combokit')}
                            className={`flex-1 h-full rounded-md text-[10px] font-black transition-all ${section.kitType === 'Combokit' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            COMBOKIT
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">KIT CATEGORY</label>
                        <input
                          type="text"
                          value={section.kitCategory}
                          onChange={(e) => updateBomSection(idx, 'kitCategory', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none font-bold text-slate-700 bg-white placeholder:text-slate-300 text-xs transition-all"
                          placeholder="e.g. Structure"
                        />
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm mb-4">
                      <table className="w-full text-left">
                        <thead className="bg-slate-800 text-white">
                          <tr>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest">Item Name</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest">Type</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest">Qty</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest">Unit</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest">Price</th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {section.items.map((item, itemIdx) => (
                            <tr key={itemIdx} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="p-2">
                                <select
                                  value={item.name}
                                  onChange={(e) => updateBomItem(idx, itemIdx, 'name', e.target.value)}
                                  className="w-full border border-slate-100 rounded-md p-1.5 font-bold text-slate-700 bg-slate-50/50 group-hover:bg-white transition-all text-[11px] focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="">Select Item</option>
                                  <option>Panel</option>
                                  <option>Inverter</option>
                                  <option>Rail</option>
                                  <option>Clamp</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <select
                                  value={item.itemType}
                                  onChange={(e) => updateBomItem(idx, itemIdx, 'itemType', e.target.value)}
                                  className="w-full border border-slate-100 rounded-md p-1.5 font-bold text-slate-700 bg-slate-50/50 group-hover:bg-white transition-all text-[11px] focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="">Select Type</option>
                                  <option>Hardware</option>
                                  <option>Electronics</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.qty}
                                  onChange={(e) => updateBomItem(idx, itemIdx, 'qty', e.target.value)}
                                  className="w-full border border-slate-100 rounded-md p-1.5 font-bold text-slate-700 bg-slate-50/50 group-hover:bg-white transition-all text-[11px] focus:outline-none focus:border-cyan-500"
                                  placeholder="1"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={item.unit}
                                  onChange={(e) => updateBomItem(idx, itemIdx, 'unit', e.target.value)}
                                  className="w-full border border-slate-100 rounded-md p-1.5 font-bold text-slate-700 bg-slate-50/50 group-hover:bg-white transition-all text-[11px] focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="">Select Unit</option>
                                  <option>Nos</option>
                                  <option>Kgs</option>
                                  <option>Mtrs</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateBomItem(idx, itemIdx, 'price', e.target.value)}
                                  className="w-full border border-slate-100 rounded-md p-1.5 font-bold text-slate-700 bg-slate-50/50 group-hover:bg-white transition-all text-[11px] focus:outline-none focus:border-cyan-500"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => removeBomItem(idx, itemIdx)}
                                  className="text-slate-300 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={() => addBomItem(idx)}
                      className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-slate-400 font-bold text-[10px] hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50/50 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <PlusCircle size={12} /> Add New Item
                    </button>
                  </div>
                ))}

                <button
                  onClick={addBomSection}
                  className="w-full py-4 border-2 border-dashed border-cyan-100 rounded-xl text-cyan-600 font-black text-xs hover:bg-cyan-50/50 transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-widest"
                >
                  <PlusCircle size={16} /> Add New BOM Section
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setBomModalOpen(false)}
                  className="px-6 py-2 text-slate-400 font-bold text-xs hover:text-slate-600 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBOM}
                  className="px-8 py-2.5 bg-cyan-600 text-white rounded-lg font-black text-xs hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 flex items-center gap-2 uppercase tracking-widest"
                >
                  <Save size={14} /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden animate-slideUp">
            <div className="bg-cyan-600 p-6 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold uppercase tracking-wider">SolarKit Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all">
                <XSquare size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <tbody>
                    {[
                      { label: 'Name', value: currentRow?.name || '(Not Created)', color: 'text-blue-600' },
                      { label: 'Products', value: currentRow?.products?.join(', ') || 'No products added' },
                      { label: 'Country', value: currentRow?.country?.name || 'Unknown' },
                      { label: 'Category', value: currentRow?.category },
                      { label: 'Sub Category', value: currentRow?.subCategory },
                      { label: 'Project Type', value: currentRow?.projectType },
                      { label: 'Sub Project Type', value: currentRow?.subProjectType },
                      { label: 'Status', value: currentRow?.status, badge: true },
                      { label: 'BOM Details', value: currentRow?.bom?.length > 0 ? `${currentRow.bom.length} Sections Defined` : 'No BOM data available', color: 'text-sky-600' }
                    ].map((row, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} border-b border-gray-100 last:border-0`}>
                        <td className="px-6 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] w-40">{row.label}</td>
                        <td className={`px-6 py-3 font-semibold text-sm ${row.color || 'text-gray-700'}`}>
                          {row.badge ? (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${row.value === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {row.value}
                            </span>
                          ) : row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold text-xs hover:bg-black transition-all shadow-md"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSolarkit;