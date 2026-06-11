import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileText, Users, PlusCircle, CheckCircle, Trash2, Edit2, X, Info, Loader, Download, Upload, Globe, MapPin, LayoutGrid, Search, Check, ChevronDown } from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import { fetchBuyLeadSettings, createBuyLeadSetting, updateBuyLeadSetting, deleteBuyLeadSetting, addLeadsToSetting, fetchLeadsBySetting } from '../../../../services/settings/settingsApi';
import { productApi } from '../../../../api/productApi';
import toast from 'react-hot-toast';

const PartnerBuyLeadSetting = () => {
  const {
    countries, selectedCountry, setSelectedCountry,
    states, selectedState, setSelectedState,
    districts, selectedDistrict, setSelectedDistrict,
    clusters, selectedCluster, setSelectedCluster
  } = useLocations();

  const [searchTerm, setSearchTerm] = useState('');
  // Store all lead settings
  const [leadSettings, setLeadSettings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [expandedLeadsId, setExpandedLeadsId] = useState(null);
  const [currentLeads, setCurrentLeads] = useState([]);
  const [addMethod, setAddMethod] = useState('manual'); // 'manual' or 'bulk'
  const [manualLeads, setManualLeads] = useState([{ name: '', mobile: '', email: '', location: '' }]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    district: '',
    cluster: '',
    areaType: '',
    numLeads: 10,
    totalKW: 500,
    totalRupees: 0,
    perLeadRupees: 0
  });

  // Dynamic data for dropdowns
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [dynamicSubCategories, setDynamicSubCategories] = useState([]);
  const [dynamicProjectTypes, setDynamicProjectTypes] = useState([]);
  const [dynamicSubProjectTypes, setDynamicSubProjectTypes] = useState([]);
  const [dynamicProjectMappings, setDynamicProjectMappings] = useState([]); // New: For KW ranges

  // Initialize the app
  useEffect(() => {
    loadSettings();
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      const [catRes, subCatRes, pTypeRes, subPTypeRes, mappingRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getSubCategories(),
        productApi.getProjectTypes(),
        productApi.getSubProjectTypes(),
        productApi.getProjectCategoryMappings() // Fetch mappings for KW ranges
      ]);

      setDynamicCategories(catRes?.data?.data || []);
      setDynamicSubCategories(subCatRes?.data?.data || []);
      setDynamicProjectTypes(pTypeRes?.data?.data || []);
      setDynamicSubProjectTypes(subPTypeRes?.data?.data || []);
      setDynamicProjectMappings(mappingRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch dynamic dropdown data", err);
    }
  };

  useEffect(() => {
    calculatePerLeadRupees();
  }, [formData.totalRupees, formData.numLeads]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchBuyLeadSettings();
      setLeadSettings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load settings", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate per lead rupees when total rupees or number of leads changes
  const calculatePerLeadRupees = () => {
    const totalRupees = parseFloat(formData.totalRupees) || 0;
    const numLeads = parseInt(formData.numLeads) || 1;

    if (numLeads > 0) {
      const perLead = totalRupees / numLeads;
      setFormData(prev => ({
        ...prev,
        perLeadRupees: parseFloat(perLead.toFixed(2))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        perLeadRupees: 0
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Map existing settingName to name
    const key = id === 'settingName' ? 'name' : id;

    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Validate form
  const validateForm = (data) => {
    if (!data.name.trim()) {
      alert('Please enter a setting name');
      return false;
    }

    if (!data.category || !data.subCategory || !data.projectType || !data.subProjectType) {
      alert('Please select all project type fields');
      return false;
    }

    if (!data.district || !data.areaType) {
      alert('Please select district and area type');
      return false;
    }

    if (!data.numLeads || data.numLeads < 1) {
      alert('Please enter a valid number of leads (minimum 1)');
      return false;
    }

    if (!data.totalKW || data.totalKW < 1) {
      alert('Please enter a valid total KW (minimum 1)');
      return false;
    }

    if (!data.totalRupees) {
      alert('Please enter a valid total rupees');
      return false;
    }

    return true;
  };

  // Add new lead setting
  const addLeadSetting = async () => {
    if (!validateForm(formData)) {
      return;
    }

    // Enforce positive values for numeric fields
    if (formData.numLeads <= 0 || formData.totalKW <= 0 || formData.totalRupees < 0) {
        toast.error("Leads, KW, and Rupees must be positive values.");
        return;
    }

    try {
      const newSetting = {
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        projectType: formData.projectType,
        subProjectType: formData.subProjectType,
        district: formData.district,
        areaType: formData.areaType,
        numLeads: parseInt(formData.numLeads),
        totalKW: parseFloat(formData.totalKW),
        totalRupees: parseFloat(formData.totalRupees),
        perLeadRupees: parseFloat(formData.perLeadRupees),
        status: 'inactive' // Requirement: Always start as inactive
      };

      const savedSetting = await createBuyLeadSetting(newSetting);
      setLeadSettings(prev => [savedSetting, ...prev]);
      clearForm();
      toast.success('Setting created successfully with Inactive status');
    } catch (err) {
      console.error("Failed to add setting", err);
      toast.error("Failed to add setting. Please try again.");
    }
  };

  // Update existing lead setting
  const updateLeadSetting = async () => {
    if (!validateForm(formData)) {
      return;
    }

    try {
      const updatedSetting = {
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        projectType: formData.projectType,
        subProjectType: formData.subProjectType,
        district: formData.district,
        areaType: formData.areaType,
        numLeads: parseInt(formData.numLeads),
        totalKW: parseFloat(formData.totalKW),
        totalRupees: parseFloat(formData.totalRupees),
        perLeadRupees: parseFloat(formData.perLeadRupees)
      };

      const saved = await updateBuyLeadSetting(editingId, updatedSetting);

      setLeadSettings(prev =>
        prev.map(setting =>
          setting._id === editingId ? saved : setting
        )
      );
      cancelEdit();
      alert('Setting updated successfully');
    } catch (err) {
      console.error("Failed to update setting", err);
      alert("Failed to update setting. Please try again.");
    }
  };

  // Edit a lead setting
  const editSetting = (id) => {
    const setting = leadSettings.find(s => s._id === id);
    if (!setting) return;

    setEditingId(id);
    setFormData({
      name: setting.name,
      category: setting.category,
      subCategory: setting.subCategory,
      projectType: setting.projectType,
      subProjectType: setting.subProjectType,
      district: setting.district,
      areaType: setting.areaType,
      numLeads: setting.numLeads,
      totalKW: setting.totalKW,
      totalRupees: setting.totalRupees,
      perLeadRupees: setting.perLeadRupees
    });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    clearForm();
  };

  // Delete a lead setting
  const deleteSetting = async (id) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await deleteBuyLeadSetting(id);
        setLeadSettings(prev => prev.filter(setting => setting._id !== id));

        // If we're editing this setting, cancel edit
        if (editingId === id) {
          cancelEdit();
        }
        alert('Setting deleted successfully');
      } catch (err) {
        console.error("Failed to delete setting", err);
        alert("Failed to delete setting. Please try again.");
      }
    }
  };

  // Clear all settings - Not supported by API yet without loop or new endpoint
  const clearAllSettings = async () => {
    if (leadSettings.length === 0) {
      alert('No settings to clear');
      return;
    }

    if (window.confirm('Are you sure you want to delete all settings? This will delete them one by one.')) {
      // Sequentially delete to avoid overwhelming server if array is large, or use Promise.all
      // For now, let's just warn it might take time or strictly allow one by one? 
      // User asked to mimic existing features. Existing had "Clear All".
      // I'll implement a simple loop.
      try {
        setLoading(true);
        // Delete one by one
        for (const setting of leadSettings) {
          await deleteBuyLeadSetting(setting._id);
        }
        setLeadSettings([]);
        if (editingId) cancelEdit();
        alert('All settings cleared successfully');
      } catch (err) {
        console.error("Failed to clear all settings", err);
        alert("Failed to clear some settings.");
        loadSettings(); // Reload to see what remains
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear the form
  const clearForm = () => {
    setFormData({
      name: '',
      category: '',
      subCategory: '',
      projectType: '',
      subProjectType: '',
      district: '',
      areaType: '',
      numLeads: 10,
      totalKW: 500,
      totalRupees: 0,
      perLeadRupees: 0
    });
  };
  
  const toggleLeadsVisibility = async (id) => {
    if (expandedLeadsId === id) {
      setExpandedLeadsId(null);
      setCurrentLeads([]);
    } else {
      setLoading(true);
      try {
        const leads = await fetchLeadsBySetting(id);
        setCurrentLeads(leads);
        setExpandedLeadsId(id);
      } catch (err) {
        toast.error("Failed to load leads");
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddLeadsModal = (setting) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
    setManualLeads([{ name: '', mobile: '', email: '', location: '' }]);
  };

  const handleManualLeadChange = (index, field, value) => {
    const updatedLeads = [...manualLeads];
    updatedLeads[index][field] = value;
    setManualLeads(updatedLeads);
  };

  const addManualLeadRow = () => {
    setManualLeads([...manualLeads, { name: '', mobile: '', email: '', location: '' }]);
  };

  const removeManualLeadRow = (index) => {
    if (manualLeads.length > 1) {
      setManualLeads(manualLeads.filter((_, i) => i !== index));
    }
  };

  const submitLeads = async () => {
    if (addMethod === 'manual') {
      const validLeads = manualLeads.filter(l => l.name.trim() && l.mobile.trim());
      if (validLeads.length === 0) {
        toast.error("Please add at least one lead with Name and Mobile");
        return;
      }

      setLoading(true);
      try {
        const response = await addLeadsToSetting({
          settingId: selectedSetting._id,
          leads: validLeads
        });

        toast.success(response.message || "Leads added successfully");
        
        // Update local state
        setLeadSettings(prev => prev.map(s => 
          s._id === selectedSetting._id ? response.setting : s
        ));

        setIsModalOpen(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add leads");
      } finally {
        setLoading(false);
      }
    } else {
        // Bulk upload logic (mocked for now)
        toast.error("Please upload a file first");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          toast.error("The file appears to be empty.");
          return;
        }

        // Map data to the expected format with flexible header matching
        const leads = data.map(row => {
          // Find value for Name (case insensitive)
          const nameKey = Object.keys(row).find(k => k.toLowerCase() === 'name');
          // Find value for Mobile/Phone (case insensitive)
          const mobileKey = Object.keys(row).find(k => ['mobile', 'phone', 'contact', 'number'].includes(k.toLowerCase()));
          // Find value for Email (case insensitive)
          const emailKey = Object.keys(row).find(k => k.toLowerCase() === 'email');
          // Find value for Location/Address (case insensitive)
          const locationKey = Object.keys(row).find(k => ['location', 'address', 'city', 'district'].includes(k.toLowerCase()));

          return {
            name: nameKey ? row[nameKey] : '',
            mobile: mobileKey ? String(row[mobileKey]) : '',
            email: emailKey ? row[emailKey] : '',
            location: locationKey ? row[locationKey] : ''
          };
        }).filter(l => l.name && l.mobile);

        if (leads.length === 0) {
          toast.error("No valid leads found. Please ensure your file has 'Name' and 'Mobile' columns.");
          return;
        }

        setLoading(true);
        const response = await addLeadsToSetting({
          settingId: selectedSetting._id,
          leads: leads
        });

        toast.success(`Successfully uploaded ${leads.length} leads from ${file.name}`);
        setLeadSettings(prev => prev.map(s => 
          s._id === selectedSetting._id ? response.setting : s
        ));
        setIsModalOpen(false);
      } catch (err) {
        console.error("Excel Parse Error:", err);
        toast.error("Failed to parse Excel file. Please try a CSV or standard Excel file.");
      } finally {
        setLoading(false);
        // Reset file input
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleFile = () => {
    const headers = "Name,Mobile,Email,Location\nArjun Kumar,9988776655,arjun@example.com,Mumbai\nSneha Sharma,9988776644,sneha@example.com,Delhi";
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Get badge class based on area type
  const getAreaTypeBadgeClass = (areaType) => {
    switch (areaType) {
      case 'urban':
        return 'bg-blue-100 text-blue-800';
      case 'rural':
        return 'bg-green-100 text-green-800';
      case 'both':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals for summary
  const calculateTotals = () => {
    if (leadSettings.length === 0) {
      return {
        totalSettings: 0,
        totalLeads: 0,
        totalKWSum: 0,
        totalRupeesSum: 0
      };
    }

    const totalLeads = leadSettings.reduce((sum, setting) => sum + setting.numLeads, 0);
    const totalKWSum = leadSettings.reduce((sum, setting) => sum + setting.totalKW, 0);
    const totalRupeesSum = leadSettings.reduce((sum, setting) => sum + setting.totalRupees, 0);

    return {
      totalSettings: leadSettings.length,
      totalLeads,
      totalKWSum: totalKWSum.toFixed(1),
      totalRupeesSum
    };
  };

  const totals = calculateTotals();

  if (loading && leadSettings.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hierarchical Location Selection */}
      <div className="space-y-6 mb-10 transition-all animate-in slide-in-from-top-4 duration-500">
        
        {/* 1. Country Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" /> Select Country
            </h4>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Select All Countries */}
            <button
                onClick={() => setSelectedCountry('all')}
                className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedCountry === 'all' ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
            >
                <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-bold text-xs truncate ${selectedCountry === 'all' ? 'text-blue-700' : 'text-gray-800'}`}>Select All</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Countries</span>
                {selectedCountry === 'all' && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
            </button>

            {countries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
              <button
                key={c._id}
                onClick={() => setSelectedCountry(c._id)}
                className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedCountry === c._id ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-bold text-xs truncate ${selectedCountry === c._id ? 'text-blue-700' : 'text-gray-800'}`}>{c.name}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.code || 'IN'}</span>
                {selectedCountry === c._id && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* 2. State Selection */}
        {selectedCountry && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-green-600" /> Select State
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Select All States */}
              <button
                onClick={() => setSelectedState('all')}
                className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedState === 'all' ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
              >
                <span className={`font-bold text-xs truncate block ${selectedState === 'all' ? 'text-blue-700' : 'text-gray-800'}`}>Select All</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">States</span>
                {selectedState === 'all' && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
              </button>

              {states.map(s => (
                <button
                  key={s._id}
                  onClick={() => setSelectedState(s._id)}
                  className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedState === s._id ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                >
                  <span className={`font-bold text-xs truncate block ${selectedState === s._id ? 'text-blue-700' : 'text-gray-800'}`}>{s.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.code || s.name.substring(0, 2).toUpperCase()}</span>
                  {selectedState === s._id && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. District Selection */}
        {selectedState && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <LayoutGrid className="w-4 h-4 text-orange-600" /> Select District
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Select All Districts */}
              <button
                onClick={() => setSelectedDistrict('all')}
                className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedDistrict === 'all' ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
              >
                <span className={`font-bold text-xs truncate block ${selectedDistrict === 'all' ? 'text-blue-700' : 'text-gray-800'}`}>Select All</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Districts</span>
                {selectedDistrict === 'all' && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
              </button>

              {districts.map(d => (
                <button
                  key={d._id}
                  onClick={() => setSelectedDistrict(d._id)}
                  className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedDistrict === d._id ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                >
                  <span className={`font-bold text-xs truncate block ${selectedDistrict === d._id ? 'text-blue-700' : 'text-gray-800'}`}>{d.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.name.substring(0, 3).toUpperCase()}</span>
                  {selectedDistrict === d._id && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative shadow-sm animate-in fade-in">
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Selection Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className={`text-white px-6 py-4 rounded-t-lg flex justify-between items-center ${editingId ? 'bg-green-600' : 'bg-blue-600'}`}>
              <h5 className="text-lg font-semibold">{editingId ? 'Update Lead Setting' : 'Create New Lead Setting'}</h5>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-sm bg-white text-green-600 px-3 py-1 rounded-md hover:bg-green-50 flex items-center gap-1"
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="p-6">
              <form>
                <div className="mb-4">
                  <label htmlFor="settingName" className="block text-sm font-medium text-gray-700 mb-1">
                    Setting Name
                  </label>
                  <input
                    type="text"
                    id="settingName"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter setting name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {dynamicCategories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Category
                    </label>
                    <select
                      id="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select Sub Category</option>
                      {dynamicSubCategories
                        .filter(sub => (sub.categoryId?._id || sub.categoryId || sub.category?._id || sub.category) === formData.category)
                        .map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type (kW Range)
                    </label>
                    <select
                      id="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.subCategory}
                    >
                      <option value="">Select KW Range</option>
                      {dynamicProjectMappings
                        .filter(m => 
                            (m.categoryId?._id || m.categoryId) === formData.category && 
                            (m.subCategoryId?._id || m.subCategoryId) === formData.subCategory
                        )
                        // Group by range to avoid duplicates if same range exists in different clusters
                        .filter((v, i, a) => a.findIndex(t => t.projectTypeFrom === v.projectTypeFrom && t.projectTypeTo === v.projectTypeTo) === i)
                        .map(m => (
                          <option key={m._id} value={`${m.projectTypeFrom}-${m.projectTypeTo}`}>
                            {m.projectTypeFrom} to {m.projectTypeTo} kW
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subProjectType" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Project Type
                    </label>
                    <select
                      id="subProjectType"
                      value={formData.subProjectType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Sub Project Type</option>
                      {dynamicSubProjectTypes.map(spt => (
                        <option key={spt._id} value={spt._id}>{spt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <select
                      id="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cluster" className="block text-sm font-medium text-gray-700 mb-1">
                      Cluster
                    </label>
                    <select
                      id="cluster"
                      value={formData.cluster}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Cluster (Optional)</option>
                      {clusters.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="areaType" className="block text-sm font-medium text-gray-700 mb-1">
                      Area Type
                    </label>
                    <select
                      id="areaType"
                      value={formData.areaType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Area Type</option>
                      <option value="urban">Urban</option>
                      <option value="rural">Rural</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="numLeads" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Leads
                    </label>
                    <input
                      type="number"
                      id="numLeads"
                      value={formData.numLeads}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="totalKW" className="block text-sm font-medium text-gray-700 mb-1">
                      Total KW
                    </label>
                    <input
                      type="number"
                      id="totalKW"
                      value={formData.totalKW}
                      onChange={handleInputChange}
                      min="1"
                      max="10000"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="totalRupees" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Rupees
                    </label>
                    <input
                      type="number"
                      id="totalRupees"
                      value={formData.totalRupees}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="perLeadRupees" className="block text-sm font-medium text-gray-700 mb-1">
                      Per Lead Rupees
                    </label>
                    <input
                      type="number"
                      id="perLeadRupees"
                      value={formData.perLeadRupees}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md"
                    />
                  </div>
                </div>

                {!editingId ? (
                  <button
                    type="button"
                    onClick={addLeadSetting}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                    Add Setting
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={updateLeadSetting}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    Update Setting
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Panel: Table and Summary Cards */}
        <div className="lg:col-span-2">
          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="bg-gray-50 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h5 className="text-lg font-semibold text-gray-900">Lead Settings Table</h5>
              <button
                onClick={clearAllSettings}
                className="text-sm border border-red-600 text-red-600 px-3 py-1 rounded-md hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setting Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub-Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub-Project Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number of Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total KW
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Rupees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per Lead Rs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leadSettings.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Info size={48} className="text-gray-400 mb-4" />
                          <p className="text-lg">No lead settings added yet.</p>
                          <p className="text-sm text-gray-400">Use the form to add your first setting.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leadSettings.map((setting) => (
                      <tr key={setting._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{setting.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {setting.category?.name || dynamicCategories.find(c => c._id === setting.category)?.name || setting.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {setting.subCategory?.name || dynamicSubCategories.find(s => s._id === setting.subCategory)?.name || setting.subCategory}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {setting.projectType?.name || dynamicProjectTypes.find(p => p._id === setting.projectType)?.name || setting.projectType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {setting.subProjectType?.name || dynamicSubProjectTypes.find(s => s._id === setting.subProjectType)?.name || setting.subProjectType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {setting.district?.name || districts.find(d => d._id === setting.district)?.name || setting.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAreaTypeBadgeClass(setting.areaType)}`}>
                            {setting.areaType.charAt(0).toUpperCase() + setting.areaType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.numLeads}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.totalKW} KW</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">₹{setting.totalRupees}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">₹{setting.perLeadRupees}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editSetting(setting._id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteSetting(setting._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Total Settings</div>
                <div className="text-2xl font-bold text-blue-600">{totals.totalSettings}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Total Leads</div>
                <div className="text-2xl font-bold text-green-600">{totals.totalLeads}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Total KW</div>
                <div className="text-2xl font-bold text-yellow-600">{totals.totalKWSum}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Total Rupees</div>
                <div className="text-2xl font-bold text-purple-600">₹{totals.totalRupeesSum}</div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Lead Settings Summary</h3>
            {leadSettings.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Info size={32} className="text-blue-400 mx-auto mb-3" />
                <p className="text-blue-800">
                  No lead settings created yet. Add your first setting to see summary cards here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {leadSettings.map((setting) => {
                  let areaColor = '';
                  switch (setting.areaType) {
                    case 'urban': areaColor = 'text-blue-600 bg-blue-50 border-blue-100'; break;
                    case 'rural': areaColor = 'text-green-600 bg-green-50 border-green-100'; break;
                    case 'both': areaColor = 'text-amber-600 bg-amber-50 border-amber-100'; break;
                    default: areaColor = 'text-gray-600 bg-gray-50 border-gray-100';
                  }

                  return (
                    <div key={setting._id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                      {/* Card Header */}
                      <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex flex-col gap-1">
                            <h6 className="font-bold text-gray-900 text-lg">{setting.name}</h6>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${setting.status === 'inactive' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${setting.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                                    {setting.status || 'Inactive'}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${areaColor}`}>
                                  {setting.areaType}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => editSetting(setting._id)}
                                className="p-2.5 rounded-2xl bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-100 transition-all shadow-sm"
                                title="Edit"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => deleteSetting(setting._id)}
                                className="p-2.5 rounded-2xl bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-100 transition-all shadow-sm"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col gap-6">
                        {/* Project Type Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Category Info</div>
                                <div className="text-sm font-bold text-gray-800 leading-tight">
                                    {setting.category?.name || dynamicCategories.find(c => c._id === setting.category)?.name || setting.category}
                                    <div className="text-xs font-medium text-gray-500 mt-0.5">
                                        {setting.subCategory?.name || dynamicSubCategories.find(s => s._id === setting.subCategory)?.name || setting.subCategory}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Project Mapping</div>
                                <div className="text-sm font-bold text-gray-800 leading-tight">
                                    {setting.totalKW} KW
                                    <div className="text-xs font-medium text-gray-500 mt-0.5">
                                        {setting.subProjectType?.name || dynamicSubProjectTypes.find(s => s._id === setting.subProjectType)?.name || setting.subProjectType}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Quick Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-50">
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Location Details</div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <div className="bg-red-50 p-1.5 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                    </div>
                                    {setting.district?.name || districts.find(d => d._id === setting.district)?.name || setting.district}
                                    {setting.cluster && (
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-xs">
                                            {setting.cluster?.name || clusters.find(c => c._id === setting.cluster)?.name || setting.cluster}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openAddLeadsModal(setting)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold text-sm active:scale-95"
                                >
                                    <PlusCircle size={18} />
                                    Add Leads
                                </button>
                                <button 
                                    onClick={() => { setSelectedSetting(setting); downloadSampleFile(); }}
                                    className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100"
                                    title="Download Sample"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/50 text-center">
                            <div className="text-xl font-black text-blue-700">{setting.currentLeadsCount || 0}</div>
                            <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Leads</div>
                          </div>
                          <div className="bg-green-50/50 rounded-2xl p-3 border border-green-100/50 text-center">
                            <div className="text-xl font-black text-green-700">{setting.totalKW}</div>
                            <div className="text-[9px] font-black text-green-400 uppercase tracking-widest">KW</div>
                          </div>
                          <div className="bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50 text-center">
                            <div className="text-xl font-black text-orange-700">₹{setting.totalRupees}</div>
                            <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Total Cost</div>
                          </div>
                          <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100/50 text-center">
                            <div className="text-xl font-black text-purple-700">₹{setting.perLeadRupees}</div>
                            <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Per Lead</div>
                          </div>
                        </div>

                        {/* View Leads Section */}
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <button
                                onClick={() => toggleLeadsVisibility(setting._id)}
                                className="w-full flex items-center justify-between group/view"
                            >
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bulk uploaded leads can be viewed here</span>
                                <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${expandedLeadsId === setting._id ? 'text-blue-600' : 'text-gray-400 group-hover/view:text-blue-500'}`}>
                                    {expandedLeadsId === setting._id ? 'Hide Leads' : 'View Leads'}
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${expandedLeadsId === setting._id ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {expandedLeadsId === setting._id && (
                                <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    {currentLeads.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Users size={20} className="mx-auto text-gray-300 mb-1" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No leads found for this plan</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                            {currentLeads.map((lead, idx) => (
                                                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center shadow-sm hover:border-blue-100 transition-all">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">{lead.name}</div>
                                                        <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                            <MapPin size={10} className="text-red-400" />
                                                            {lead.location || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-blue-600">{lead.mobile}</div>
                                                        <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{lead.email || 'No Email'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold">Add Leads to Plan</h4>
                <p className="text-blue-100 text-xs">{selectedSetting?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b">
              <button 
                onClick={() => setAddMethod('manual')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${addMethod === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={18} /> Add Manually
              </button>
              <button 
                onClick={() => setAddMethod('bulk')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${addMethod === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FileText size={18} /> Bulk Upload (Excel/CSV)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {addMethod === 'manual' ? (
                <div className="space-y-4">
                  {manualLeads.map((lead, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-3 relative group/row">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Lead Name" 
                          value={lead.name}
                          onChange={(e) => handleManualLeadChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <input 
                          type="text" 
                          placeholder="Mobile Number" 
                          value={lead.mobile}
                          onChange={(e) => handleManualLeadChange(index, 'mobile', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          type="email" 
                          placeholder="Email (Optional)" 
                          value={lead.email}
                          onChange={(e) => handleManualLeadChange(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <input 
                          type="text" 
                          placeholder="Location" 
                          value={lead.location}
                          onChange={(e) => handleManualLeadChange(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      {manualLeads.length > 1 && (
                        <button 
                          onClick={() => removeManualLeadRow(index)}
                          className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-600 hover:text-white shadow-sm transition-all"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={addManualLeadRow}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} /> Add More Leads
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Upload size={40} />
                  </div>
                  <div className="text-center">
                    <h5 className="font-bold text-gray-800">Upload your Excel or CSV file</h5>
                    <p className="text-gray-500 text-sm">Max file size: 5MB</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={downloadSampleFile}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <Download size={16} /> Download Sample
                    </button>
                    <label className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-200">
                      <Upload size={16} /> Choose File
                      <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={submitLeads}
                disabled={loading}
                className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {addMethod === 'manual' ? 'Save Leads' : 'Upload & Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PartnerBuyLeadSetting;