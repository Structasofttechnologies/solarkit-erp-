'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Upload,
  Download,
  Package
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { locationAPI } from '../../../../api/api';
import LocationSelector from './LocationSelector';

const toId = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v?._id || '';
};

const normalizeItemToForm = (item) => {
  const country = toId(item?.country);
  const state = toId(item?.state);
  const district = toId(item?.district);
  const districts = (item?.districts || []).map(d => toId(d));
  const cluster = toId(item?.cluster);
  const clusters = (item?.clusters || []).map(c => toId(c));
  const zone = toId(item?.zone);
  const zones = (item?.zones || []).map(z => toId(z));

  return {
    name: item?.name || '',
    country,
    state,
    district: districts.length > 0 ? districts : district,
    districts,
    cluster: clusters.length > 0 ? clusters : cluster,
    clusters,
    zone: zones.length > 0 ? zones : zone,
    zones,
    city: '',
    areaType: item?.areaType || 'Urban',
    pincodes: item?.pincodes || [],
    isActive: item?.isActive !== undefined ? item.isActive : true,
  };
};

export default function SetupLocations() {
  const [activeTab, setActiveTab] = useState('countries');
  const [countries, setCountries] = useState([]);
  const [masterCountries, setMasterCountries] = useState([]); // New state for all master countries
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]); // New state for Cities
  const [districts, setDistricts] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    state: '',
    district: '',
    districts: [], // Multi-select
    cluster: '',
    clusters: [], // Multi-select
    zone: '',
    zones: [], // Multi-select
    city: '',
    areaType: 'Urban',
    pincodes: [],
    isActive: true,
  });

  const [pendingCities, setPendingCities] = useState([]); // Preview for Bulk Upload
  const [selectedMasterId, setSelectedMasterId] = useState(''); // New state for selected master country to activate
  const [activating, setActivating] = useState(false); // New state for activation loading
  const [uploadingExcel, setUploadingExcel] = useState(false); // State for Excel Bulk Upload
  const [pincodeStr, setPincodeStr] = useState(''); // Local state for pincode input string
  const [nameError, setNameError] = useState(''); // New state for duplicate validation error
  const [checkingName, setCheckingName] = useState(false); // State for loader when checking name

  // Load base data on mount
  useEffect(() => {
    loadCountries();
    loadMasterCountries(); // Load all master countries
  }, []);

  // Load data whenever tab changes
  useEffect(() => {
    setSearchQuery('');
    setError('');
    setSuccess('');
    setSelectedMasterId(''); // Reset selected master ID on tab change

    if (activeTab === 'countries') loadCountries();
    else if (activeTab === 'states') loadStates();
    else if (activeTab === 'cities') loadCities(); // Load cities
    else if (activeTab === 'districts') loadDistricts();
    else if (activeTab === 'clusters') loadClusters();
    else if (activeTab === 'zones') loadZones();
  }, [activeTab]);

  const loadMasterCountries = async () => {
    try {
      const response = await locationAPI.getMasterCountries();
      setMasterCountries(response.data.data || []);
    } catch (err) {
      console.error('Failed to load master countries:', err);
    }
  };

  const handleActivateCountry = async () => {
    if (!selectedMasterId) return;
    try {
      setActivating(true);
      setError('');
      setSuccess('');
      await locationAPI.activateCountry({ countryId: selectedMasterId });
      setSuccess('Country activated successfully');
      setSelectedMasterId('');
      loadCountries(); // Reload active countries
      loadMasterCountries(); // Reload master countries to update dropdown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate country');
    } finally {
      setActivating(false);
    }
  };

  const loadCountries = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllCountries();
      setCountries(response.data.data || []);
    } catch (err) {
      setError('Failed to load countries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async (params) => {
    try {
      const response = await locationAPI.getAllStates(params);
      setStates(response.data.data || []);
    } catch (err) {
      console.error('Failed to load states:', err);
    }
  };

  const loadCities = async (params) => {
    try {
      const response = await locationAPI.getAllCities(params);
      setCities(response.data.data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  const loadDistricts = async (params) => {
    try {
      const response = await locationAPI.getAllDistricts(params);
      setDistricts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load districts:', err);
    }
  };

  const loadClusters = async (params) => {
    try {
      const response = await locationAPI.getAllClusters(params);
      setClusters(response.data.data || []);
    } catch (err) {
      console.error('Failed to load clusters:', err);
    }
  };

  const loadZones = async (params) => {
    try {
      const response = await locationAPI.getAllZones(params);
      setZones(response.data.data || []);
    } catch (err) {
      console.error('Failed to load zones:', err);
    }
  };

  // Load states when country changes
  useEffect(() => {
    if (!showForm) return; // Only load for form filtering
    const countryId = formData.country;
    if (countryId) {
      loadStates({ countryId });
    } else {
      setStates([]);
      setFormData((prev) => ({ ...prev, state: '', district: '', districts: [], cluster: '', clusters: [], zone: '', zones: [], city: '' }));
    }
  }, [formData.country, showForm]);

  // Load districts when state changes
  useEffect(() => {
    if (!showForm) return;
    const stateId = formData.state;
    if (stateId) {
      loadDistricts({ stateId });
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, district: '', districts: [], cluster: '', clusters: [], zone: '', zones: [], city: '' }));
    }
  }, [formData.state, showForm]);

  // Load clusters when district changes
  useEffect(() => {
    if (!showForm) return;
    const districtId = formData.district;
    if (districtId) {
      loadClusters({ districtId });
    } else {
      setClusters([]);
      setFormData((prev) => ({ ...prev, cluster: '', clusters: [], zone: '', zones: [], city: '' }));
    }
  }, [formData.district, showForm]);

  // Load zones when cluster changes
  useEffect(() => {
    if (!showForm) return;
    const clusterId = formData.cluster;
    if (clusterId) {
      loadZones({ clusterId });
    } else {
      setZones([]);
      setFormData((prev) => ({ ...prev, zone: '', zones: [], city: '' }));
    }
  }, [formData.cluster, showForm]);

  // Load cities when zone changes
  useEffect(() => {
    if (!showForm) return;
    const zoneId = formData.zone;
    if (zoneId) {
      loadCities({ zoneId });
    } else {
      setCities([]);
      setFormData((prev) => ({ ...prev, city: '' }));
    }
  }, [formData.zone, showForm]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      // Don't validate if form is hidden or name is empty
      if (!formData.name || !showForm) {
        setNameError('');
        return;
      }

      setCheckingName(true);
      try {
        let parentId = '';
        if (activeTab === 'states') parentId = toId(formData.country);
        else if (activeTab === 'districts') parentId = toId(formData.state);
        else if (activeTab === 'clusters') parentId = toId(formData.state);
        else if (activeTab === 'zones') parentId = toId(formData.state);
        else if (activeTab === 'cities') parentId = toId(formData.district);

        // For countries, parentId is not needed
        if (activeTab !== 'countries' && !parentId) {
          setCheckingName(false);
          return;
        }
        const response = await locationAPI.checkDuplicate({
          type: activeTab,
          name: formData.name,
          parentId,
          currentId: editingId
        });

        if (response.data.exists) {
          setNameError(`🔴 ${activeTab.slice(0, -1)} already exists`);
        } else {
          setNameError('');
        }
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData.name, activeTab, editingId, showForm, formData.country, formData.state, formData.district]);

  // When closing available form, reload list for the active tab
  useEffect(() => {
    if (showForm) return;
    if (activeTab === 'countries') loadCountries();
    if (activeTab === 'states') loadStates();
    if (activeTab === 'cities') loadCities();
    if (activeTab === 'districts') loadDistricts();
    if (activeTab === 'clusters') loadClusters();
    if (activeTab === 'zones') loadZones();
  }, [showForm, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Common fields
      const payload = {
        name: formData.name,
        isActive: formData.isActive,
        country: toId(formData.country),
        state: toId(formData.state),
      };

      // 2. Tab-specific mapping (Ensuring correct singular/plural names for backend)
      if (activeTab === 'states') {
        // No special fields
      } else if (activeTab === 'districts') {
        // No special fields
      } else if (activeTab === 'clusters') {
        // districts (plural) is required for Cluster model
        payload.districts = Array.isArray(formData.district) ? formData.district : (formData.districts || []);
      } else if (activeTab === 'zones') {
        // cluster (single) and districts (plural) are required for custom Zone mode
        payload.districts = Array.isArray(formData.district) ? formData.district : (formData.districts || []);
        payload.cluster = toId(formData.cluster);
      } else if (activeTab === 'cities') {
        // Cities now attach directly to districts
        payload.district = toId(formData.district);
        payload.areaType = formData.areaType;
        payload.pincodes = formData.pincodes;
        // Name is optional for cities
        if (formData.name) payload.name = formData.name;
        else delete payload.name;
      }

      // 3. API Call
      if (activeTab === 'countries') {
        const countryPayload = { name: formData.name, isActive: formData.isActive };
        if (editingId) await locationAPI.updateCountry(editingId, countryPayload);
        else await locationAPI.createCountry(countryPayload);
        setSuccess(`Country ${editingId ? 'updated' : 'created'} successfully`);
        loadCountries();
      } else if (activeTab === 'states') {
        if (editingId) await locationAPI.updateState(editingId, payload);
        else await locationAPI.createState(payload);
        setSuccess(`State ${editingId ? 'updated' : 'created'} successfully`);
        loadStates({ countryId: formData.country });
      } else if (activeTab === 'districts') {
        if (editingId) await locationAPI.updateDistrict(editingId, payload);
        else await locationAPI.createDistrict(payload);
        setSuccess(`District ${editingId ? 'updated' : 'created'} successfully`);
        loadDistricts({ stateId: formData.state });
      } else if (activeTab === 'clusters') {
        if (editingId) await locationAPI.updateCluster(editingId, payload);
        else await locationAPI.createCluster(payload);
        setSuccess(`Cluster ${editingId ? 'updated' : 'created'} successfully`);
        loadClusters({ stateId: formData.state }); // Refresh by state
      } else if (activeTab === 'zones') {
        if (editingId) await locationAPI.updateZone(editingId, payload);
        else await locationAPI.createZone(payload);
        setSuccess(`Zone ${editingId ? 'updated' : 'created'} successfully`);
        loadZones({ stateId: formData.state });
      } else if (activeTab === 'cities') {
        if (pendingCities.length > 0) {
          // Bulk Create
          const response = await locationAPI.bulkCreateCities({ cities: pendingCities });
          const { summary } = response.data;
          
          let msg = `Bulk Upload Complete!`;
          if (summary) {
            msg = `✅ ${summary.added} added, ⏭️ ${summary.skipped} skipped (duplicates or existing). Total processed: ${summary.total}`;
          }
          setSuccess(msg);
          loadCities({ stateId: formData.state });
        } else {
          // Single Create/Update
          if (editingId) await locationAPI.updateCity(editingId, payload);
          else await locationAPI.createCity(payload);
          setSuccess(`City ${editingId ? 'updated' : 'created'} successfully`);
          loadCities({ stateId: formData.state });
        }
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        setLoading(true);
        if (activeTab === 'countries') {
          await locationAPI.deleteCountry(id);
          loadCountries();
          loadMasterCountries();
        } else if (activeTab === 'states') {
          await locationAPI.deleteState(id);
          loadStates({ countryId: formData.country });
        } else if (activeTab === 'districts') {
          await locationAPI.deleteDistrict(id);
          loadDistricts({ stateId: formData.state });
        } else if (activeTab === 'clusters') {
          await locationAPI.deleteCluster(id);
          loadClusters({ districtId: formData.district });
        } else if (activeTab === 'zones') {
          await locationAPI.deleteZone(id);
          loadZones({ clusterId: formData.cluster });
        } else if (activeTab === 'cities') {
          await locationAPI.deleteCity(id);
          loadCities({ zoneId: formData.zone });
        }
        setSuccess('Deleted successfully');
      } catch (err) {
        setError('Failed to delete');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate that district is selected (Country, State, District hierarchy must be chosen)
    if (!formData.district || !formData.state || !formData.country) {
      setError('Please select Country, State, and District before uploading cities.');
      return;
    }

    try {
      setUploadingExcel(true);
      setError('');
      setSuccess('');

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            throw new Error('Excel file is empty or invalid.');
          }

          const newCities = jsonData.map((row) => {
            const cityName = row['City Name'] || row['city name'] || row['Name'] || row['name'];
            const pincodesRaw = row['Pincodes'] || row['pincodes'] || row['Pincode'] || row['pincode'];
            // Prioritize the radio button selection from formData.areaType
            const areaType = formData.areaType || row['Area Type'] || row['area type'] || 'Urban';

            if (!cityName) {
              throw new Error('A column named "City Name" is required for all rows.');
            }

            // Split comma separated pincodes
            let pincodesArray = [];
            if (pincodesRaw) {
              pincodesArray = String(pincodesRaw).split(',').map(p => p.trim()).filter(p => p);
            }

            return {
              name: String(cityName).trim(),
              areaType: String(areaType).trim(),
              pincodes: pincodesArray,
              country: toId(formData.country),
              state: toId(formData.state),
              district: toId(formData.district)
            };
          });

          // 1. FILTER INTERNAL DUPLICATES (Local to Excel File)
          const uniqueExcelCities = [];
          const excelSeen = new Set();
          let internalDuplicates = 0;

          newCities.forEach(city => {
            const key = `${city.name.toLowerCase()}-${(city.pincodes || []).sort().join(',')}`;
            if (!excelSeen.has(key)) {
              excelSeen.add(key);
              uniqueExcelCities.push(city);
            } else {
              internalDuplicates++;
            }
          });

          // Store for preview instead of immediate upload
          setPendingCities(uniqueExcelCities);
          let parseMsg = `Excel parsed! Found ${uniqueExcelCities.length} unique cities.`;
          if (internalDuplicates > 0) parseMsg += ` (${internalDuplicates} duplicates in file ignored)`;
          setSuccess(parseMsg);

        } catch (err) {
          setError(err.message || 'Error processing Excel file. Make sure it has "City Name" and "Pincodes" columns.');
        } finally {
          setUploadingExcel(false);
          // Reset file input
          e.target.value = null;
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error reading file.');
      setUploadingExcel(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      state: '',
      district: '',
      districts: [],
      cluster: '',
      clusters: [],
      zone: '',
      zones: [],
      city: '',
      areaType: 'Urban',
      pincodes: [],
      isActive: true,
    });
    setPendingCities([]);
    setNameError('');
    setSelectedMasterId('');
    setPincodeStr('');
    setEditingId(null);
    setShowForm(false);
  };

  const downloadSampleExcel = () => {
    const data = [
      { 'City Name': 'Surat', 'Pincodes': '395007, 395008' },
      { 'City Name': 'Ahmedabad', 'Pincodes': '380001, 380002' },
      { 'City Name': 'Mumbai', 'Pincodes': '400001' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cities Sample");
    XLSX.writeFile(workbook, "cities_upload_sample.xlsx");
  };

  const getDisplayData = () => {
    let data = [];
    if (activeTab === 'countries') data = countries;
    else if (activeTab === 'states') data = states;
    else if (activeTab === 'cities') data = cities;
    else if (activeTab === 'districts') data = districts;
    else if (activeTab === 'clusters') data = clusters;
    else if (activeTab === 'zones') data = zones;

    return data.filter(item => {
      const name = item.name || (activeTab === 'cities' ? item.zones?.map(z => z.name).join(', ') : '');
      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const getCountByParent = () => {
    if (activeTab === 'countries') return `${countries.filter(c => c.isActive).length}/${masterCountries.length}`; // Show Active/Total Master
    if (activeTab === 'states') return states.length;
    if (activeTab === 'cities') return cities.length;
    if (activeTab === 'districts') return districts.length;
    if (activeTab === 'clusters') return clusters.length;
    if (activeTab === 'zones') return zones.length;
    return 0;
  };

  // Tabs list
  const TABS = ['countries', 'states', 'districts', 'clusters', 'zones', 'cities'];

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-2xl flex items-center gap-2 text-gray-800">
                <Globe className="text-blue-500" size={28} />
                Location Management
              </h4>
              <p className="text-gray-500 mt-2 text-sm">
                Manage countries, states, districts, clusters, zones and cities
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-3xl text-blue-500">{getCountByParent()}</h3>
              <small className="text-gray-500 text-sm capitalize">
                {activeTab === 'countries' ? 'Active/Total Global' : `Total ${activeTab}`}
              </small>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  resetForm();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl bg-red-50 shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-4 border border-red-200 flex gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} className="text-red-500" />
            </button>
          </div>
        )}
        {success && (
          <div className="rounded-2xl bg-green-50 shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-4 border border-green-200 flex gap-2">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-500" />
            </button>
          </div>
        )}

        {/* Specialized Country Activation Flow */}
        {activeTab === 'countries' && (
          <div className="rounded-2xl bg-white shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="text-blue-500" size={24} />
              <h5 className="font-bold text-xl text-gray-800">Activate New Country</h5>
            </div>
            <p className="text-gray-500 text-sm mb-6">Select a country to activate and start managing regions</p>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-1">
                  <Globe size={14} className="text-gray-400" />
                  Select Country
                </label>
                <select
                  value={selectedMasterId}
                  onChange={(e) => setSelectedMasterId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="">-- Select Country --</option>
                  {masterCountries.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleActivateCountry}
                disabled={!selectedMasterId || activating}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                {activating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
                Activate Country
              </button>
            </div>
          </div>
        )}

        {/* Standard Add Form for other tabs */}
        {showForm && (
          <div className="rounded-2xl bg-gray-50 shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-6 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-lg">{editingId ? 'Edit' : 'Add New'} {activeTab === 'cities' ? 'City' : activeTab.slice(0, -1)}</h5>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab !== 'countries' && (
                <LocationSelector
                  values={formData}
                  onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                  upto={
                    activeTab === 'states' ? 'country' :
                      activeTab === 'districts' ? 'state' :
                        activeTab === 'clusters' ? 'district' :
                          activeTab === 'zones' ? 'district' :
                            activeTab === 'cities' ? 'district' : null
                  }
                  multiple={{
                    district: ['clusters', 'zones'].includes(activeTab)
                  }}
                  isZoneMode={activeTab === 'zones'}
                  layout="stack"
                />
              )}



              {activeTab !== 'cities' && (
                <div>
                  <label className="font-semibold text-gray-700 block mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  />
                  {checkingName && <p className="text-xs text-blue-500 mt-1 italic">Checking availability...</p>}
                  {nameError && <p className="text-sm text-red-500 mt-1 font-semibold">{nameError}</p>}
                </div>
              )}

              {activeTab === 'cities' && (
                <>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Area Type</label>
                    <div className="flex gap-4">
                      {['Urban', 'Rural'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="areaType"
                            checked={formData.areaType === type}
                            onChange={() => {
                              const newType = type;
                              setFormData(prev => {
                                const updated = { ...prev, areaType: newType };
                                // If we have pending cities, update their area type to match the new selection
                                if (pendingCities.length > 0) {
                                  setPendingCities(pendingCities.map(c => ({ ...c, areaType: newType })));
                                }
                                return updated;
                              });
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {pendingCities.length > 0 ? (
                    <div className="bg-white border border-orange-200 rounded-xl overflow-hidden mt-4">
                      <div className="p-3 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                        <span className="font-bold text-orange-800 text-sm">Preview: {pendingCities.length} {formData.areaType} Cities found</span>
                        <button
                          type="button"
                          onClick={() => setPendingCities([])}
                          className="text-orange-600 hover:text-orange-800 text-xs font-bold underline"
                        >
                          Clear Preview
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 text-gray-600 font-bold">
                            <tr>
                              <th className="p-2">#</th>
                              <th className="p-2">City Name</th>
                              <th className="p-2 text-center">Type</th>
                              <th className="p-2">Pincodes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pendingCities.slice(0, 50).map((city, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-2 text-gray-400">{idx + 1}</td>
                                <td className="p-2 font-semibold text-gray-800">{city.name}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${city.areaType === 'Rural' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {city.areaType}
                                  </span>
                                </td>
                                <td className="p-2 text-gray-500">{city.pincodes.join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <>
                        <div className="flex gap-4 items-center p-6 bg-orange-50/50 border border-orange-200 rounded-2xl mt-4 shadow-sm">
                          <div className="flex-1">
                            <label className="font-bold text-orange-900 block text-xl mb-1 flex items-center gap-2">
                              <Upload size={24} className="text-orange-500" /> Bulk Upload Cities
                            </label>
                            <p className="text-sm text-orange-700/80 mb-2">Upload Excel to import cities as <b className="text-orange-900">{formData.areaType}</b>.</p>
                            <button
                              type="button"
                              onClick={downloadSampleExcel}
                              className="text-orange-600 hover:text-orange-800 text-xs font-bold flex items-center gap-1 underline decoration-2 underline-offset-4"
                            >
                              <Download size={12} /> Download Sample File
                            </button>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-orange-400 text-orange-600 rounded-xl font-bold hover:bg-orange-50 cursor-pointer shadow-sm transition-all disabled:opacity-50">
                              {uploadingExcel ? <Loader2 size={20} className="animate-spin" /> : <Package size={18} />}
                              {uploadingExcel ? 'Processing...' : 'Choose Excel File'}
                              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" disabled={uploadingExcel || editingId} />
                            </label>
                          </div>
                        </div>

                      <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 font-bold uppercase text-xs tracking-wider">OR ENTER MANUALLY</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          required={!formData.name && !uploadingExcel}
                        />
                        {checkingName && <p className="text-xs text-blue-500 mt-1 italic">Checking availability...</p>}
                        {nameError && <p className="text-sm text-red-500 mt-1 font-semibold">{nameError}</p>}
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Pincodes (Comma separated)</label>
                        <input
                          type="text"
                          value={pincodeStr}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPincodeStr(val);
                            setFormData({
                              ...formData,
                              pincodes: val.split(',').map(p => p.trim()).filter(p => p)
                            });
                          }}
                          placeholder="e.g. 380001, 380002"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}


              <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex-1">
                  <h6 className="font-bold text-gray-800">Active Status</h6>
                  <p className="text-xs text-gray-500">Enable or disable this {activeTab.slice(0, -1)} across the system</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-14 h-7 rounded-full transition-all relative ${formData.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !!nameError || checkingName}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={20} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button for tabs other than countries */}
        {!showForm && activeTab !== 'countries' && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-2xl bg-blue-50 shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-4 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle size={20} />
            Add New {activeTab === 'cities' ? 'City' : activeTab.slice(0, -1)}
          </button>
        )}

        {/* List Section Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Globe className="text-green-500" size={20} />
            <h5 className="font-bold text-lg text-gray-800">
              {activeTab === 'countries' ? 'Active Countries' : `Active ${activeTab}`}
            </h5>
          </div>
          {activeTab === 'countries' && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
              {countries.filter(c => c.isActive).length} Active
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 shadow-sm transition-all"
            placeholder={activeTab === 'countries' ? "Search active countries..." : `Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {getDisplayData().length > 0 ? (
            getDisplayData().map((item) => (
              <div key={item._id} className="group rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.06)] p-5 bg-white border border-gray-100 hover:border-blue-300 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h5 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                        {activeTab === 'cities'
                          ? (item.name || `Zones: ${item.zones?.map(z => z.name).join(', ') || 'N/A'}`)
                          : item.name}
                      </h5>
                      {item.isActive ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase border border-blue-100">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded uppercase border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    {activeTab === 'states' && item.code && <p className="text-sm text-gray-500 font-medium">Code: {item.code}</p>}
                    {activeTab === 'states' && item.description && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">{item.description}</p>}

                    {/* Hierarchy details */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeTab !== 'countries' && item.country?.name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                          Country: {item.country.name}
                        </span>
                      )}
                      {['states', 'districts', 'clusters', 'zones', 'cities'].includes(activeTab) && item.state?.name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                          State: {item.state.name}
                        </span>
                      )}
                      {['districts', 'clusters', 'cities'].includes(activeTab) && item.district?.name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                          District: {item.district.name}
                        </span>
                      )}
                      {['zones'].includes(activeTab) && item.cluster?.name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                          Cluster: {item.cluster.name}
                        </span>
                      )}
                      {activeTab === 'clusters' && item.districts?.length > 0 && (
                        <div className="w-full mt-2">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Districts:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.districts.map(d => (
                              <span key={d._id} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === 'zones' && item.districts?.length > 0 && (
                        <div className="w-full mt-2">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Districts:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.districts.map(d => (
                              <span key={d._id} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'cities' && (
                        <>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">
                            Type: {item.areaType || 'Urban'}
                          </span>
                          {item.pincodes?.length > 0 && (
                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold">
                              Pincodes: {item.pincodes.join(', ')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(normalizeItemToForm(item));
                        setEditingId(item._id);
                        setShowForm(true);
                        if (activeTab === 'cities') {
                          setPincodeStr((item.pincodes || []).join(', '));
                        }
                        // For countries, we don't use the standard form but we might want to edit basic info
                        if (activeTab === 'countries') {
                          // Special handling if needed, e.g., a dedicated modal for country details
                        }
                      }}
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white shadow-[0px_3px_10px_rgba(0,0,0,0.08)] p-12 text-center text-gray-500 border border-dashed border-gray-200">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-xl text-gray-400">No {activeTab} available</p>
              <p className="text-sm mt-2">
                {activeTab === 'countries'
                  ? "Select a country from the dropdown above to activate it."
                  : `Add a new ${activeTab.slice(0, -1)} to get started.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
