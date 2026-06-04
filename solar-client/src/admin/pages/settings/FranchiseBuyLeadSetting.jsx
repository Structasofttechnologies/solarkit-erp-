import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  CheckCircle,
  Trash2,
  Edit2,
  X,
  Info,
  Loader
} from 'lucide-react';
import {
  fetchBuyLeadSettings,
  createBuyLeadSetting,
  updateBuyLeadSetting,
  deleteBuyLeadSetting
} from '../../../services/settings/settingsApi';

const PartnerBuyLeadSetting = () => {
  // Store all lead settings
  const [leadSettings, setLeadSettings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
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

  // Initialize the app
  useEffect(() => {
    loadSettings();
  }, []);

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
        perLeadRupees: parseFloat(formData.perLeadRupees)
      };

      const savedSetting = await createBuyLeadSetting(newSetting);
      setLeadSettings(prev => [savedSetting, ...prev]);
      clearForm();
      alert('Setting added successfully');
    } catch (err) {
      console.error("Failed to add setting", err);
      alert("Failed to add setting. Please try again.");
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
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Partner Buy Lead Setting
        </h1>
        <p className="text-lg text-gray-600">
          Configure lead allocation for partners
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
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
                      <option value="solar rooftop">Solar Rooftop</option>
                      <option value="solar pump">Solar Pump</option>
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
                    >
                      <option value="">Select Sub Category</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type
                    </label>
                    <select
                      id="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Project Type</option>
                      <option value="3kw - 5kw">3kw - 5kw</option>
                      <option value="5kw - 10kw">5kw - 10kw</option>
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
                      <option value="on-grid">On-Grid</option>
                      <option value="off-grid">Off-Grid</option>
                      <option value="hybrid">Hybrid</option>
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
                      <option value="north">North District</option>
                      <option value="south">South District</option>
                      <option value="east">East District</option>
                      <option value="west">West District</option>
                      <option value="central">Central District</option>
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
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.subCategory}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.projectType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.subProjectType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{setting.district}</td>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadSettings.map((setting) => {
                  let borderColor = '';
                  switch (setting.areaType) {
                    case 'urban':
                      borderColor = 'border-blue-500';
                      break;
                    case 'rural':
                      borderColor = 'border-green-500';
                      break;
                    case 'both':
                      borderColor = 'border-yellow-500';
                      break;
                    default:
                      borderColor = 'border-gray-500';
                  }

                  return (
                    <div key={setting._id} className={`bg-white rounded-lg shadow border ${borderColor}`}>
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h6 className="font-semibold text-gray-900">{setting.name}</h6>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAreaTypeBadgeClass(setting.areaType)}`}>
                          {setting.areaType.charAt(0).toUpperCase() + setting.areaType.slice(1)}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Project Type</div>
                          <div className="text-sm">
                            {setting.category} &gt; {setting.subCategory}
                          </div>
                          <div className="text-sm">
                            {setting.projectType} &gt; {setting.subProjectType}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Location</div>
                          <div className="text-sm">{setting.district}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center mt-4">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{setting.numLeads}</div>
                            <div className="text-xs text-gray-500">Leads</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{setting.totalKW}</div>
                            <div className="text-xs text-gray-500">KW</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-yellow-600">₹{setting.totalRupees}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600">₹{setting.perLeadRupees}</div>
                            <div className="text-xs text-gray-500">Per Lead</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">ID: {setting._id.substring(setting._id.length - 6)}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => editSetting(setting._id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteSetting(setting._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
    </div>
  );
};


export default PartnerBuyLeadSetting;