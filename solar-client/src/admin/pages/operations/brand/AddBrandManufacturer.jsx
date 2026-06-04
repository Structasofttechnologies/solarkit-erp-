import React, { useState, useEffect, useRef } from 'react';
import {
  Edit2,
  Trash2,
  Upload,
  MapPin,
  Building2,
  Globe,
  Package,
  Search
} from 'lucide-react';
import {
  createManufacturer,
  getAllManufacturers,
  updateManufacturer,
  deleteManufacturer
} from '../../../../services/brand/brandApi';
import { getCountries, getStates, getClustersHierarchy, getDistrictsHierarchy, getCitiesHierarchy } from '../../../../services/core/locationApi';

const AddBrandManufacturer = () => {
  // State management
  const [selectedCountry, setSelectedCountry] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    company: '',
    product: ''
  });
  const [editMode, setEditMode] = useState({
    isEditing: false,
    isOtherEditing: false,
    editId: null,
    otherEditId: null
  });

  // Location Data
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  // Form state
  const [form, setForm] = useState({
    state: '',
    cluster: '',
    district: '',
    city: '',
    companyName: '',
    companyOriginCountry: '',
    brand: '',
    brandLogo: null,
    product: '',
    comboKit: false
  });

  // File inputs refs
  const brandLogoRef = useRef(null);

  // Fetch Initial Data
  useEffect(() => {
    fetchManufacturers();
    fetchStates();
    fetchCountriesList();
  }, []);

  // UseEffect to refresh list when filters change
  useEffect(() => {
    fetchManufacturers();
  }, [filters]);

  const fetchManufacturers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllManufacturers(filters);
      setManufacturers(data);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCountriesList = async () => {
    try {
      const data = await getCountries();
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const params = { isActive: true };
      if (countryId) params.countryId = countryId;
      const data = await getStates(params);
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchClusters = async (stateId) => {
    if (!stateId) { setClusters([]); return; }
    try {
      const data = await getClustersHierarchy(stateId);
      setClusters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    }
  };

  const fetchDistricts = async (clusterId) => {
    if (!clusterId) { setDistricts([]); return; }
    try {
      const data = await getDistrictsHierarchy(clusterId);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchCities = async (districtId) => {
    if (!districtId) { setCities([]); return; }
    try {
      const data = await getCitiesHierarchy(districtId);
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!Array.isArray(manufacturers)) {
      return { total: 0, indiaCompanies: 0, foreignCompanies: 0, comboKitCount: 0 };
    }
    const total = manufacturers.length;
    const indiaCompanies = manufacturers.filter(m => m.companyOriginCountry === 'India').length;
    const foreignCompanies = manufacturers.filter(m => m.companyOriginCountry !== 'India').length;
    const comboKitCount = manufacturers.filter(m => m.comboKit).length;

    return { total, indiaCompanies, foreignCompanies, comboKitCount };
  };

  const summary = calculateSummary();

  // Handle country selection
  const handleCountrySelect = (countryName, countryId) => {
    setSelectedCountry(countryName.toLowerCase());
    setEditMode({ ...editMode, isEditing: false, isOtherEditing: false });
    setForm(prev => ({
      ...prev,
      companyOriginCountry: countryName,
      state: '', cluster: '', district: '', city: ''
    }));
    setStates([]);
    setClusters([]);
    setDistricts([]);
    setCities([]);
    fetchStates(countryId);
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setForm({ ...form, state: stateId, cluster: '', district: '', city: '' });
    setClusters([]);
    setDistricts([]);
    setCities([]);
    if (stateId) fetchClusters(stateId);
  };

  const handleClusterChange = (e) => {
    const clusterId = e.target.value;
    setForm({ ...form, cluster: clusterId, district: '', city: '' });
    setDistricts([]);
    setCities([]);
    if (clusterId) fetchDistricts(clusterId);
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setForm({ ...form, district: districtId, city: '' });
    setCities([]);
    if (districtId) fetchCities(districtId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, brandLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addManufacturer = async () => {
    if (!form.companyName || !form.companyOriginCountry || !form.brand || !form.product || !form.state) {
      alert('Please fill all required fields (Company Name, Brand, Product, and at least State)');
      return;
    }
    try {
      await createManufacturer(form);
      alert('Manufacturer added successfully!');
      fetchManufacturers();
      resetForm();
    } catch (error) {
      alert('Error adding manufacturer: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit manufacturer
  const editManufacturerRecord = (manufacturer) => {
    setSelectedCountry(manufacturer.companyOriginCountry.toLowerCase());
    setForm({
      state:     manufacturer.state?._id     || manufacturer.state     || '',
      cluster:   manufacturer.cluster?._id   || manufacturer.cluster   || '',
      district:  manufacturer.district?._id  || manufacturer.district  || '',
      city:      manufacturer.city?._id      || manufacturer.city      || '',
      companyName: manufacturer.companyName,
      companyOriginCountry: manufacturer.companyOriginCountry,
      brand: manufacturer.brand,
      brandLogo: manufacturer.brandLogo,
      product: manufacturer.product,
      comboKit: manufacturer.comboKit
    });

    // Pre-fetch dependent dropdowns
    const stateId   = manufacturer.state?._id   || manufacturer.state;
    const clusterId = manufacturer.cluster?._id || manufacturer.cluster;
    const districtId = manufacturer.district?._id || manufacturer.district;

    if (stateId)    fetchClusters(stateId);
    if (clusterId)  fetchDistricts(clusterId);
    if (districtId) fetchCities(districtId);

    setEditMode({ ...editMode, isEditing: true, editId: manufacturer._id });
  };

  // Update India manufacturer
  const updateManufacturerData = async () => {
    try {
      await updateManufacturer(editMode.editId, form);
      alert('Manufacturer updated successfully!');
      fetchManufacturers();
      setEditMode({ ...editMode, isEditing: false, editId: null });
      resetForm();
    } catch (error) {
      alert('Error updating manufacturer: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete manufacturer
  const handleDelete = async (id, companyName) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      try {
        await deleteManufacturer(id);
        alert(`${companyName} has been deleted`);
        fetchManufacturers();
      } catch (error) {
        alert('Error deleting manufacturer: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  // Reset forms
  const resetForm = () => {
    setForm({
      state: '', cluster: '', district: '', city: '',
      companyName: '',
      companyOriginCountry: selectedCountry ? countries.find(c => c.name.toLowerCase() === selectedCountry)?.name || '' : '',
      brand: '', brandLogo: null, product: '', comboKit: false
    });
    setClusters([]);
    setDistricts([]);
    setCities([]);
  };

  const cancelEdit = () => {
    setEditMode({ ...editMode, isEditing: false, editId: null });
    resetForm();
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value === filters[filterType] ? null : value
    });
  };

  return (
    <div className="container-fluid p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Add Brand Manufacture</h1>
      </div>

      {/* Country Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Country</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {countries.map((country) => (
            <div
              key={country._id}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${selectedCountry === country.name.toLowerCase()
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => handleCountrySelect(country.name, country._id)}
            >
              <div className="text-center">
                <h3 className="text-lg font-medium">{country.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manufacturer Form */}
      {selectedCountry && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)} Manufacturer Details
          </h2>

          <div className="space-y-4">
            {/* Location Fields - 4 column hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select State: <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.state}
                  onChange={handleStateChange}
                >
                  <option value="">-- Select State --</option>
                  {states.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Cluster */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Cluster:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  value={form.cluster}
                  onChange={handleClusterChange}
                  disabled={!form.state}
                >
                  <option value="">-- Select Cluster --</option>
                  {clusters.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select District:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  value={form.district}
                  onChange={handleDistrictChange}
                  disabled={!form.cluster}
                >
                  <option value="">-- Select District --</option>
                  {districts.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select City:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  disabled={!form.district}
                >
                  <option value="">-- Select City --</option>
                  {cities.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name:
              </label>
              <input
                name="companyName"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
                value={form.companyName}
                onChange={handleInputChange}
              />
            </div>

            {/* Company Origin Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Origin Country:
              </label>
              <select
                name="companyOriginCountry"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.companyOriginCountry}
                disabled
              >
                <option value={form.companyOriginCountry}>{form.companyOriginCountry}</option>
              </select>
            </div>

            {/* Brand with Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand:
              </label>
              <input
                name="brand"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                placeholder="Enter brand name"
                value={form.brand}
                onChange={handleInputChange}
              />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => brandLogoRef.current?.click()}
                >
                  <Upload size={16} />
                  Upload Brand Logo
                </button>
                <input
                  type="file"
                  ref={brandLogoRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {form.brandLogo && (
                  <img
                    src={form.brandLogo}
                    alt="Brand logo preview"
                    className="w-10 h-10 object-contain"
                  />
                )}
              </div>
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product:
              </label>
              <select
                name="product"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.product}
                onChange={handleInputChange}
              >
                <option value="">-- Select Product --</option>
                <option value="inverter">Inverter</option>
                <option value="panel">Panel</option>
                <option value="battery">Battery</option>
                <option value="charge-controller">Charge Controller</option>
                <option value="mounting-structure">Mounting Structure</option>
              </select>
            </div>

            {/* Combo Kit Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Combo Kit:
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!form.comboKit ? 'font-medium' : 'text-gray-500'}`}>
                  No
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${form.comboKit ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  onClick={() => setForm({ ...form, comboKit: !form.comboKit })}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${form.comboKit ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className={`text-sm ${form.comboKit ? 'font-medium' : 'text-gray-500'}`}>
                  Yes
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!editMode.isEditing ? (
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={addManufacturer}
                >
                  Add Manufacturer
                </button>
              ) : (
                <>
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={updateManufacturerData}
                  >
                    Update Manufacturer
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manufacturers List Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Manufacturers List</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { key: null, label: 'Total Manufacturers', value: summary.total, icon: Building2 },
            { key: 'india', label: 'Indian Companies', value: summary.indiaCompanies, icon: MapPin },
            { key: 'foreign', label: 'Foreign Companies', value: summary.foreignCompanies, icon: Globe },
            { key: 'combo', label: 'Combo Kit Enabled', value: summary.comboKitCount, icon: Package }
          ].map((item) => (
            <div
              key={item.label}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${filters.type === item.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
                }`}
              onClick={() => handleFilterChange('type', item.key)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                </div>
                <item.icon className="text-gray-400" size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Company..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Product..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Logo</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Company</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Country</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">State</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">City</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">District</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Brand</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Product</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Combo Kit</th>
                <th className="p-3 border-b text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.length > 0 ? (
                manufacturers.map((manufacturer) => (
                  <tr key={manufacturer._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {manufacturer.brandLogo ? (
                        <img
                          src={manufacturer.brandLogo}
                          alt="Logo"
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-800">{manufacturer.companyName}</td>
                    <td className="p-3 text-gray-600">{manufacturer.companyOriginCountry}</td>
                    <td className="p-3 text-gray-600">{manufacturer.state?.name || '-'}</td>
                    <td className="p-3 text-gray-600">
                      {manufacturer.city?.name || '-'}
                    </td>
                    <td className="p-3 text-gray-600">{manufacturer.district?.name || '-'}</td>
                    <td className="p-3 text-gray-600">{manufacturer.brand}</td>
                    <td className="p-3 uppercase text-gray-600 text-sm">{manufacturer.product}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${manufacturer.comboKit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {manufacturer.comboKit ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => editManufacturerRecord(manufacturer)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDelete(manufacturer._id, manufacturer.companyName)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Loading...
                      </div>
                    ) : 'No manufacturers found matching your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddBrandManufacturer;