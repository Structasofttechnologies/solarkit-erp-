import React, { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  MapPin,
  Building2,
  Package,
  Filter,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import {
  createSupplier,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
  getAllManufacturers
} from '../../../../services/brand/brandApi';
import {
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProducts,
  getProjectCategoryMappings
} from '../../../../services/settings/orderProcurementSettingApi';

const BrandSupplierOverview = () => {
  // --- Data State ---
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Filter State ---
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedDistricts, setSelectedDistricts] = useState(new Set());
  const [selectedManufactures, setSelectedManufactures] = useState(new Set());
  
  const [showStates, setShowStates] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [showManufactures, setShowManufactures] = useState(false);

  const [supplierTypes, setSupplierTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [procurementTypes, setProcurementTypes] = useState([]);

  // --- Location Master Data (for Filters) ---
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allClusters, setAllClusters] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);

  // --- Master Data for Dropdowns ---
  const [masterProducts, setMasterProducts] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [masterProjectMappings, setMasterProjectMappings] = useState([]);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalForm, setModalForm] = useState({
    type: 'Dealer',
    name: '',
    state: '',
    cluster: '', // City ID
    district: '',
    manufacturer: '',
    product: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    procurementType: '',
    contact: '',
    email: ''
  });

  // --- Modal Specific Options ---
  const [modalCities, setModalCities] = useState([]);
  const [modalDistricts, setModalDistricts] = useState([]);
  const [modalSubCategories, setModalSubCategories] = useState([]);
  const [modalProjectTypes, setModalProjectTypes] = useState([]);
  const [modalSubProjectTypes, setModalSubProjectTypes] = useState([]);

  // --- Dropdown States ---
  const [openDropdown, setOpenDropdown] = useState(null);

  // Reusable Filter Dropdown Component
  const FilterDropdown = ({ label, options, selectedValues, onSelect, isOpen, onToggle }) => {
    return (
      <div className="relative">
        <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>
        <div
          className="w-full border border-gray-300 rounded-md p-2 bg-white flex justify-between items-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={onToggle}
        >
          <span className="text-sm text-gray-600 truncate">
            {selectedValues.length === 0
              ? `Select ${label}`
              : `${selectedValues.length} Selected`}
          </span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                onClick={() => onSelect(option)}
              >
                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedValues.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                  {selectedValues.includes(option) && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
            {options.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500 italic">No options available</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- Initial Fetch ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        suppliersData, 
        manuData, 
        countryResp,
        prodResp,
        catResp,
        subCatResp,
        ptResp,
        subPtResp,
        mappingResp
      ] = await Promise.all([
        getAllSuppliers(),
        getAllManufacturers(),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/countries?isActive=true`),
        getProducts(),
        getCategories(),
        getSubCategories(),
        getProjectTypes(),
        getSubProjectTypes(),
        getProjectCategoryMappings()
      ]);

      setSuppliers(suppliersData);
      setManufacturers(manuData);
      if (countryResp.data.success) {
        setAllCountries(countryResp.data.data);
      }

      setMasterProducts(prodResp?.data || []);
      setMasterCategories(catResp?.data || []);
      setMasterSubCategories(subCatResp?.data || []);
      
      // Derive unique project types from mappings (e.g., "3 to 30 kW")
      const mappings = mappingResp?.data || [];
      const derivedProjectTypes = mappings.length > 0 
        ? Array.from(new Set(mappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`))).filter(Boolean).sort()
        : ptResp?.data?.map(p => p.name) || [];

      setMasterProjectTypes(derivedProjectTypes);
      setMasterSubProjectTypes(subPtResp?.data || []);
      setMasterProjectMappings(mappings);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Cities/Districts for Filters (Aggregated from DB or fetched all?)
  // For filters, we want *relevant* locations. 
  // But strictly adhering to "Dynamic", we should fetch location lists based on selection.
  // Using the same API pattern as AddBrandManufacturer.

  // --- Dynamic Location Fetchers for Filters ---
  useEffect(() => {
    const fetchFilterStates = async () => {
      if (selectedCountries.size === 0) {
        setAllStates([]);
        return;
      }
      const promises = Array.from(selectedCountries).map(countryId =>
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/states?countryId=${countryId}&isActive=true`)
      );
      try {
        const responses = await Promise.all(promises);
        const mergedStates = responses.flatMap(r => r.data.success ? r.data.data : []);
        const uniqueStates = Array.from(new Map(mergedStates.map(item => [item._id, item])).values());
        setAllStates(uniqueStates);
      } catch (err) { console.error(err); }
    };
    fetchFilterStates();
  }, [selectedCountries]);

  useEffect(() => {
    const fetchFilterClusters = async () => {
      if (selectedStates.size === 0) {
        setAllClusters([]);
        return;
      }
      const promises = Array.from(selectedStates).map(stateId =>
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/clusters?stateId=${stateId}&isActive=true`)
      );
      try {
        const responses = await Promise.all(promises);
        const mergedClusters = responses.flatMap(r => r.data.success ? r.data.data : []);
        const uniqueClusters = Array.from(new Map(mergedClusters.map(item => [item._id, item])).values());
        setAllClusters(uniqueClusters);
      } catch (err) { console.error(err); }
    };
    fetchFilterClusters();
  }, [selectedStates]);

  useEffect(() => {
    const fetchFilterDistricts = async () => {
      if (selectedClusters.size === 0) {
        setAllDistricts([]);
        return;
      }
      const promises = Array.from(selectedClusters).map(clusterId =>
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/districts?clusterId=${clusterId}&isActive=true`)
      );
      try {
        const responses = await Promise.all(promises);
        const mergedDistricts = responses.flatMap(r => r.data.success ? r.data.data : []);
        const uniqueDistricts = Array.from(new Map(mergedDistricts.map(item => [item._id, item])).values());
        setAllDistricts(uniqueDistricts);
      } catch (err) { console.error(err); }
    };
    fetchFilterDistricts();
  }, [selectedClusters]);


  // --- Filter Logic ---
  const filteredSuppliers = suppliers.filter(supplier => {
    if (selectedCountries.size > 0 && !selectedCountries.has(supplier.country?._id || supplier.country)) return false;
    if (selectedStates.size > 0 && !selectedStates.has(supplier.state?._id || supplier.state)) return false;
    if (selectedClusters.size > 0 && !selectedClusters.has(supplier.cluster?._id || supplier.cluster)) return false;
    if (selectedDistricts.size > 0 && !selectedDistricts.has(supplier.district?._id || supplier.district)) return false;
    if (selectedManufactures.size > 0) {
      // Manufacturer name or ID?
      // Filter UI uses names usually. Let's check what we store in Set.
      // We can use Manufacturer Name from populated field.
      const manuName = supplier.manufacturer?.companyName || '';
      if (!selectedManufactures.has(manuName)) return false;
    }

    if (supplierTypes.length > 0 && !supplierTypes.includes(supplier.type)) return false;
    if (products.length > 0 && !products.includes(supplier.product)) return false;
    if (categories.length > 0 && !categories.includes(supplier.category)) return false;
    if (subCategories.length > 0 && !subCategories.includes(supplier.subCategory)) return false;
    if (projectTypes.length > 0 && !projectTypes.includes(supplier.projectType)) return false;
    if (subProjectTypes.length > 0 && !subProjectTypes.includes(supplier.subProjectType)) return false;
    if (procurementTypes.length > 0 && !procurementTypes.includes(supplier.procurementType)) return false;

    return true;
  });

  // --- Stats ---
  const dealerCount = filteredSuppliers.filter(s => s.type === "Dealer").length;
  const distributorCount = filteredSuppliers.filter(s => s.type === "Distributor").length;

  // --- Filter Handlers ---
  const handleCountrySelect = (countryId) => {
    const newSet = new Set(selectedCountries);
    if (newSet.has(countryId)) newSet.delete(countryId);
    else newSet.add(countryId);
    setSelectedCountries(newSet);
    setShowStates(newSet.size > 0);
    // Reset lower filters
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setShowClusters(false);
    setShowDistricts(false);
  };

  const handleStateSelect = (stateId) => {
    const newSet = new Set(selectedStates);
    if (newSet.has(stateId)) newSet.delete(stateId);
    else newSet.add(stateId);
    setSelectedStates(newSet);
    setShowClusters(newSet.size > 0);
    // Reset lower filters
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setShowDistricts(false);
  };

  const handleClusterSelect = (clusterId) => {
    const newSet = new Set(selectedClusters);
    if (newSet.has(clusterId)) newSet.delete(clusterId);
    else newSet.add(clusterId);
    setSelectedClusters(newSet);
    setShowDistricts(newSet.size > 0);
    setSelectedDistricts(new Set());
  };

  const handleDistrictSelect = (districtId) => {
    const newSet = new Set(selectedDistricts);
    if (newSet.has(districtId)) newSet.delete(districtId);
    else newSet.add(districtId);
    setSelectedDistricts(newSet);
    setShowManufactures(newSet.size > 0);
  };

  const handleManufactureSelect = (manuName) => {
    const newSet = new Set(selectedManufactures);
    if (newSet.has(manuName)) newSet.delete(manuName);
    else newSet.add(manuName);
    setSelectedManufactures(newSet);
  };

  // --- CRUD Handlers ---
  const handleAdd = () => {
    setEditId(null);
    setModalForm({
      type: 'Dealer',
      name: '',
      state: '',
      cluster: '',
      district: '',
      manufacturer: '',
      product: '',
      category: '',
      subCategory: '',
      projectType: '',
      subProjectType: '',
      procurementType: '',
      contact: '',
      email: ''
    });
    setModalCities([]);
    setModalDistricts([]);
    setModalSubCategories([]);
    setModalProjectTypes([]);
    setModalSubProjectTypes([]);
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setEditId(supplier._id);
    const stateId = supplier.state?._id || supplier.state;
    const cityId = supplier.cluster?._id || supplier.cluster;

    setModalForm({
      type: supplier.type,
      name: supplier.name,
      state: stateId,
      cluster: cityId,
      district: supplier.district?._id || supplier.district,
      manufacturer: supplier.manufacturer?._id || supplier.manufacturer,
      product: supplier.product,
      category: supplier.category,
      subCategory: supplier.subCategory,
      projectType: supplier.projectType,
      subProjectType: supplier.subProjectType,
      procurementType: supplier.procurementType,
      contact: supplier.contact || '',
      email: supplier.email || ''
    });

    // Fetch lists for modal
    if (stateId) fetchModalCities(stateId);
    if (cityId) fetchModalDistricts(cityId);

    // Load dependent categories/types for edit
    if (supplier.category) {
      const selCat = masterCategories.find(c => c.name === supplier.category);
      if (selCat) {
        getSubCategories(selCat._id).then(res => {
          setModalSubCategories(res.data || []);
          if (supplier.subCategory) {
            const selSub = (res.data || []).find(sc => sc.name === supplier.subCategory);
            if (selSub) {
              const ranges = masterProjectMappings
                .filter(m => (m.categoryId?._id || m.categoryId) === selCat._id && (m.subCategoryId?._id || m.subCategoryId) === selSub._id)
                .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                .filter((v, i, a) => a.indexOf(v) === i);
              setModalProjectTypes(ranges);
            }
          }
        });
      }
    }

    if (supplier.projectType) {
      const selPt = masterProjectTypes.find(p => p.name === supplier.projectType);
      if (selPt) {
        getSubProjectTypes(selPt._id).then(res => setModalSubProjectTypes(res.data || []));
      } else {
        getSubProjectTypes().then(res => setModalSubProjectTypes(res.data || []));
      }
    }

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        fetchInitialData();
      } catch (err) {
        alert('Failed to delete supplier');
      }
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.name || !modalForm.state || !modalForm.cluster || !modalForm.district || !modalForm.manufacturer) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editId) {
        await updateSupplier(editId, modalForm);
        alert('Supplier updated successfully');
      } else {
        await createSupplier(modalForm);
        alert('Supplier created successfully');
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // --- Modal Specific Location Fetchers ---
  const fetchModalCities = async (stateId) => {
    if (!stateId) { setModalCities([]); return; }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/cities?stateId=${stateId}&isActive=true`);
      if (res.data.success) setModalCities(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchModalDistricts = async (cityId) => {
    if (!cityId) { setModalDistricts([]); return; }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/locations/districts?cityId=${cityId}&isActive=true`);
      if (res.data.success) setModalDistricts(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleModalStateChange = (e) => {
    const val = e.target.value;
    setModalForm({ ...modalForm, state: val, cluster: '', district: '' });
    setModalCities([]); setModalDistricts([]);
    fetchModalCities(val);
  };

  const handleModalCityChange = (e) => {
    const val = e.target.value;
    setModalForm({ ...modalForm, cluster: val, district: '' }); // cluster = City ID
    setModalDistricts([]);
    fetchModalDistricts(val);
  };

  const handleModalCategoryChange = async (e) => {
    const catName = e.target.value;
    setModalForm({ ...modalForm, category: catName, subCategory: '', projectType: '', subProjectType: '' });
    setModalSubCategories([]);
    setModalProjectTypes([]);
    
    if (catName) {
      const selCat = masterCategories.find(c => c.name === catName);
      if (selCat) {
        try {
          const res = await getSubCategories(selCat._id);
          setModalSubCategories(res.data || []);
        } catch (err) { console.error(err); }
      }
    }
  };

  const handleModalSubCategoryChange = (e) => {
    const subCatName = e.target.value;
    setModalForm({ ...modalForm, subCategory: subCatName, projectType: '', subProjectType: '' });
    setModalProjectTypes([]);

    const selCat = masterCategories.find(c => c.name === modalForm.category);
    const selSub = masterSubCategories.find(sc => sc.name === subCatName);

    if (selCat && selSub) {
      const ranges = masterProjectMappings
        .filter(m => (m.categoryId?._id || m.categoryId) === selCat._id && (m.subCategoryId?._id || m.subCategoryId) === selSub._id)
        .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
        .filter((v, i, a) => a.indexOf(v) === i);
      setModalProjectTypes(ranges);
    }
  };

  const handleModalProjectTypeChange = async (e) => {
    const ptName = e.target.value;
    setModalForm({ ...modalForm, projectType: ptName, subProjectType: '' });
    setModalSubProjectTypes([]);

    if (ptName) {
      const selPt = masterProjectTypes.find(p => p.name === ptName);
      try {
        const res = await getSubProjectTypes(selPt?._id);
        setModalSubProjectTypes(res.data || []);
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="container-fluid p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Brand Supplier Overview</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Supplier
        </button>
      </div>

      {/* Country Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Select Country</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setSelectedCountries(new Set(allCountries.map(c => c._id)))} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">Select All</button>
          <button onClick={() => setSelectedCountries(new Set())} className="px-4 py-2 border border-gray-400 text-gray-600 rounded">Clear All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allCountries.map((country) => (
            <div
              key={country._id}
              className={`border rounded-lg cursor-pointer p-4 text-center transition-all duration-200 ${selectedCountries.has(country._id) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-100 hover:border-indigo-300'}`}
              onClick={() => handleCountrySelect(country._id)}
            >
              <p className="font-bold">{country.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* State Selection */}
      {selectedCountries.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Select States</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSelectedStates(new Set(allStates.map(s => s._id)))} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">Select All</button>
            <button onClick={() => setSelectedStates(new Set())} className="px-4 py-2 border border-gray-400 text-gray-600 rounded">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allStates.map((state) => (
              <div
                key={state._id}
                className={`border rounded-lg cursor-pointer p-4 text-center transition-all duration-200 ${selectedStates.has(state._id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-blue-200 hover:border-blue-300'}`}
                onClick={() => handleStateSelect(state._id)}
              >
                <p className="font-bold">{state.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cluster Selection */}
      {selectedStates.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Select Clusters</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSelectedClusters(new Set(allClusters.map(c => c._id)))} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">Select All</button>
            <button onClick={() => setSelectedClusters(new Set())} className="px-4 py-2 border border-gray-400 text-gray-600 rounded">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allClusters.map((cluster) => (
              <div
                key={cluster._id}
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${selectedClusters.has(cluster._id) ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200'}`}
                onClick={() => handleClusterSelect(cluster._id)}
              >
                {cluster.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* District Selection */}
      {selectedClusters.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Select Districts</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSelectedDistricts(new Set(allDistricts.map(d => d._id)))} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">Select All</button>
            <button onClick={() => setSelectedDistricts(new Set())} className="px-4 py-2 border border-gray-400 text-gray-600 rounded">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allDistricts.map((district) => (
              <div
                key={district._id}
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${selectedDistricts.has(district._id) ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200'}`}
                onClick={() => handleDistrictSelect(district._id)}
              >
                {district.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manufacture Selection */}
      {selectedDistricts.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Select Manufacture</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSelectedManufactures(new Set(manufacturers.map(m => m.companyName)))} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">Select All</button>
            <button onClick={() => setSelectedManufactures(new Set())} className="px-4 py-2 border border-gray-400 text-gray-600 rounded">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {manufacturers.map((manu) => (
              <div
                key={manu._id}
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${selectedManufactures.has(manu.companyName) ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200'}`}
                onClick={() => handleManufactureSelect(manu.companyName)}
              >
                {manu.companyName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Filter Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Supplier Type */}
          <FilterDropdown
            label="Supplier Type"
            options={['Dealer', 'Distributor']}
            selectedValues={supplierTypes}
            onSelect={(val) => {
              const newTypes = supplierTypes.includes(val)
                ? supplierTypes.filter(t => t !== val)
                : [...supplierTypes, val];
              setSupplierTypes(newTypes);
            }}
            isOpen={openDropdown === 'type'}
            onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
          />

          {/* Helper function for dynamic options */}
          {(() => {
            const getDynamicOptions = (field, currentFilters) => {
              return Array.from(new Set(
                suppliers
                  .filter(s => {
                    // Filter by location
                    if (selectedCountries.size > 0 && !selectedCountries.has(s.country?._id || s.country)) return false;
                    if (selectedStates.size > 0 && !selectedStates.has(s.state?._id || s.state)) return false;
                    if (selectedClusters.size > 0 && !selectedClusters.has(s.cluster?._id || s.cluster)) return false;
                    if (selectedDistricts.size > 0 && !selectedDistricts.has(s.district?._id || s.district)) return false;

                    // Filter by ALL other advanced filters except the current one
                    if (currentFilters.supplierTypes?.length > 0 && !currentFilters.supplierTypes.includes(s.type)) return false;
                    if (field !== 'product' && products.length > 0 && !products.includes(s.product)) return false;
                    if (field !== 'category' && categories.length > 0 && !categories.includes(s.category)) return false;
                    if (field !== 'subCategory' && subCategories.length > 0 && !subCategories.includes(s.subCategory)) return false;
                    if (field !== 'projectType' && projectTypes.length > 0 && !projectTypes.includes(s.projectType)) return false;
                    if (field !== 'subProjectType' && subProjectTypes.length > 0 && !subProjectTypes.includes(s.subProjectType)) return false;
                    if (field !== 'procurementType' && procurementTypes.length > 0 && !procurementTypes.includes(s.procurementType)) return false;

                    return true;
                  })
                  .map(s => s[field])
              )).filter(val => val).sort();
            };

            return (
              <>
                {/* Products */}
                <FilterDropdown
                  label="Products"
                  options={masterProducts.map(p => p.name).filter(Boolean).sort()}
                  selectedValues={products}
                  onSelect={(val) => {
                    const newProds = products.includes(val)
                      ? products.filter(p => p !== val)
                      : [...products, val];
                    setProducts(newProds);
                  }}
                  isOpen={openDropdown === 'product'}
                  onToggle={() => setOpenDropdown(openDropdown === 'product' ? null : 'product')}
                />

                {/* Categories */}
                <FilterDropdown
                  label="Categories"
                  options={masterCategories.map(c => c.name).filter(Boolean).sort()}
                  selectedValues={categories}
                  onSelect={(val) => {
                    const newCats = categories.includes(val)
                      ? categories.filter(c => c !== val)
                      : [...categories, val];
                    setCategories(newCats);
                  }}
                  isOpen={openDropdown === 'category'}
                  onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                />

                {/* Sub Categories */}
                <FilterDropdown
                  label="Sub Categories"
                  options={masterSubCategories.map(sc => sc.name).filter(Boolean).sort()}
                  selectedValues={subCategories}
                  onSelect={(val) => {
                    const newSubCats = subCategories.includes(val)
                      ? subCategories.filter(c => c !== val)
                      : [...subCategories, val];
                    setSubCategories(newSubCats);
                  }}
                  isOpen={openDropdown === 'subCategory'}
                  onToggle={() => setOpenDropdown(openDropdown === 'subCategory' ? null : 'subCategory')}
                />

                {/* Project Types */}
                <FilterDropdown
                  label="Project Types"
                  options={masterProjectTypes.map(pt => pt.name || pt).filter(Boolean).sort()}
                  selectedValues={projectTypes}
                  onSelect={(val) => {
                    const newTypes = projectTypes.includes(val)
                      ? projectTypes.filter(c => c !== val)
                      : [...projectTypes, val];
                    setProjectTypes(newTypes);
                  }}
                  isOpen={openDropdown === 'projectType'}
                  onToggle={() => setOpenDropdown(openDropdown === 'projectType' ? null : 'projectType')}
                />

                {/* Sub Project Types */}
                <FilterDropdown
                  label="Sub Project Types"
                  options={masterSubProjectTypes.map(spt => spt.name).filter(Boolean).sort()}
                  selectedValues={subProjectTypes}
                  onSelect={(val) => {
                    const newTypes = subProjectTypes.includes(val)
                      ? subProjectTypes.filter(c => c !== val)
                      : [...subProjectTypes, val];
                    setSubProjectTypes(newTypes);
                  }}
                  isOpen={openDropdown === 'subProjectType'}
                  onToggle={() => setOpenDropdown(openDropdown === 'subProjectType' ? null : 'subProjectType')}
                />

                {/* Procurement Types */}
                <FilterDropdown
                  label="Procurement Types"
                  options={getDynamicOptions('procurementType', { supplierTypes })}
                  selectedValues={procurementTypes}
                  onSelect={(val) => {
                    const newTypes = procurementTypes.includes(val)
                      ? procurementTypes.filter(c => c !== val)
                      : [...procurementTypes, val];
                    setProcurementTypes(newTypes);
                  }}
                  isOpen={openDropdown === 'procurementType'}
                  onToggle={() => setOpenDropdown(openDropdown === 'procurementType' ? null : 'procurementType')}
                />
              </>
            );
          })()}
        </div>
        {/* Reset All Filters Button */}
        {(supplierTypes.length > 0 || products.length > 0 || categories.length > 0 || subCategories.length > 0 || projectTypes.length > 0 || subProjectTypes.length > 0 || procurementTypes.length > 0) && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setSupplierTypes([]);
                setProducts([]);
                setCategories([]);
                setSubCategories([]);
                setProjectTypes([]);
                setSubProjectTypes([]);
                setProcurementTypes([]);
              }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <X size={16} /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-l-4 border-blue-500 rounded-lg shadow-md bg-white p-6 flex justify-between items-center">
            <div><h3 className="text-sm font-medium text-gray-600">DEALERS</h3><p className="text-3xl font-bold text-blue-600">{dealerCount}</p></div>
            <Users size={32} className="text-blue-500" />
          </div>
          <div className="border-l-4 border-green-500 rounded-lg shadow-md bg-white p-6 flex justify-between items-center">
            <div><h3 className="text-sm font-medium text-gray-600">DISTRIBUTORS</h3><p className="text-3xl font-bold text-green-600">{distributorCount}</p></div>
            <Truck size={32} className="text-green-500" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Supplier Results</h2>
        <div className="overflow-x-auto max-h-[500px] border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0 z-0">
              <tr>
                {['Type', 'Name', 'State', 'Cluster', 'District', 'Manufacture', 'Product', 'Category', 'Sub Category', 'Project Type', 'Sub Project Type', 'Procurement Type', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{supplier.type}</td>
                    <td className="px-6 py-4 text-sm font-medium">{supplier.name}</td>
                    <td className="px-6 py-4 text-sm">{supplier.state?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">{supplier.cluster?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">{supplier.district?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">{supplier.manufacturer?.companyName || '-'}</td>
                    <td className="px-6 py-4 text-sm">{supplier.product}</td>
                    <td className="px-6 py-4 text-sm">{supplier.category}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{supplier.subCategory || '-'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{supplier.projectType || '-'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{supplier.subProjectType || '-'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{supplier.procurementType || '-'}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(supplier._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="px-6 py-10 text-center text-gray-500 italic">
                    No suppliers found matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Type*</label>
                  <select className="w-full border p-2 rounded" value={modalForm.type} onChange={e => setModalForm({ ...modalForm, type: e.target.value })}>
                    <option value="Dealer">Dealer</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Name*</label>
                  <input type="text" className="w-full border p-2 rounded" value={modalForm.name} onChange={e => setModalForm({ ...modalForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Manufacturer*</label>
                  <select className="w-full border p-2 rounded" value={modalForm.manufacturer} onChange={e => setModalForm({ ...modalForm, manufacturer: e.target.value })} required>
                    <option value="">Select Manufacturer</option>
                    {manufacturers.map(m => <option key={m._id} value={m._id}>{m.companyName}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium">State*</label>
                  <select className="w-full border p-2 rounded" value={modalForm.state} onChange={handleModalStateChange} required>
                    <option value="">Select State</option>
                    {allStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">City*</label>
                  <select className="w-full border p-2 rounded" value={modalForm.cluster} onChange={handleModalCityChange} required disabled={!modalForm.state}>
                    <option value="">Select City</option>
                    {modalCities.map(c => <option key={c._id} value={c._id}>{c.name || `Zones: ${c.zones?.map(z => z.name).join(', ') || 'N/A'}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">District*</label>
                  <select className="w-full border p-2 rounded" value={modalForm.district} onChange={e => setModalForm({ ...modalForm, district: e.target.value })} required disabled={!modalForm.cluster}>
                    <option value="">Select District</option>
                    {modalDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium">Product</label>
                  <select className="w-full border p-2 rounded" value={modalForm.product} onChange={e => setModalForm({ ...modalForm, product: e.target.value })}>
                    <option value="">Select Product</option>
                    {masterProducts.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select className="w-full border p-2 rounded" value={modalForm.category} onChange={handleModalCategoryChange}>
                    <option value="">Select Category</option>
                    {masterCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Sub Category</label>
                  <select className="w-full border p-2 rounded" value={modalForm.subCategory} onChange={handleModalSubCategoryChange} disabled={!modalForm.category}>
                    <option value="">Select Sub Category</option>
                    {modalSubCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Project Type</label>
                  <select className="w-full border p-2 rounded" value={modalForm.projectType} onChange={handleModalProjectTypeChange} disabled={!modalForm.subCategory}>
                    <option value="">Select Project Type</option>
                    {modalProjectTypes.length > 0 ? (
                      modalProjectTypes.map((r, i) => <option key={i} value={r}>{r}</option>)
                    ) : (
                      masterProjectTypes.map((pt, i) => <option key={i} value={pt}>{pt}</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Sub Project Type</label>
                  <select className="w-full border p-2 rounded" value={modalForm.subProjectType} onChange={e => setModalForm({ ...modalForm, subProjectType: e.target.value })} disabled={!modalForm.projectType}>
                    <option value="">Select Sub Project Type</option>
                    {modalSubProjectTypes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Procurement Type</label>
                  <select className="w-full border p-2 rounded" value={modalForm.procurementType} onChange={e => setModalForm({ ...modalForm, procurementType: e.target.value })}>
                    <option value="">Select Type</option>
                    <option value="Direct">Direct</option>
                    <option value="Indirect">Indirect</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSupplierOverview;