import React, { useState, useEffect } from 'react';
import {
  Plus, CheckCircle, Camera, ChevronUp, ChevronDown,
  X, Image as ImageIcon, Search, Edit, Eye, Trash2
} from 'lucide-react';
import Select from 'react-select';
import { useLocations } from '../../../../hooks/useLocations';
import { locationAPI } from '../../../../api/api';

// Main Component
export default function AddComboKitForFranchisee() {
  const { countries, states, fetchCountries, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  const [selectedState, setSelectedState] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedClusterName, setSelectedClusterName] = useState('');
  const [selectedCpTypes, setSelectedCpTypes] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]); // Array of IDs
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCpTypeSection, setShowCpTypeSection] = useState(false);
  const [showDistrictSection, setShowDistrictSection] = useState(false);
  const [selectAllCpType, setSelectAllCpType] = useState(false);
  const [selectAllDistrict, setSelectAllDistrict] = useState(false);
  const [projectRows, setProjectRows] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [showComboKitModal, setShowComboKitModal] = useState(false);
  const [showProjectCombokitsModal, setShowProjectCombokitsModal] = useState(false);
  const [showViewCombokitModal, setShowViewCombokitModal] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);

  // Dynamic Options
  const [clusterOptions, setClusterOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  // State for main combo kit form
  const [comboKitName, setComboKitName] = useState('');
  const [comboKitImage, setComboKitImage] = useState(null);
  const [solarPanelBrand, setSolarPanelBrand] = useState('');
  const [selectedPanelSkus, setSelectedPanelSkus] = useState([]);
  const [inverterBrand, setInverterBrand] = useState('');
  const [showPanelSkuSelect, setShowPanelSkuSelect] = useState(false);
  const [showInverterConfigBtn, setShowInverterConfigBtn] = useState(false);

  // State for additional combo kits
  const [additionalComboKits, setAdditionalComboKits] = useState([]);

  // State for BOM
  const [showBomSection, setShowBomSection] = useState(false);
  const [bomSections, setBomSections] = useState([]);

  // State for view combo kit
  const [viewingComboKit, setViewingComboKit] = useState(null);

  const cpTypes = ["Startup", "Basic", "Enterprise", "Solar Business"];

  const skuData = {
    panels: {
      Adani: ["ADN-12345", "ADN-23456", "ADN-34567"],
      Tata: ["TAT-67890", "TAT-78901", "TAT-89012"],
      Waree: ["WAR-45678", "WAR-56789", "WAR-67890"]
    }
  };

  // Initial Data
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch States for India (default)
  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find(c => c.name === 'India');
      if (india) fetchStates({ country: india._id });
      else fetchStates({ country: countries[0]._id });
    }
  }, [countries]);

  // Handler functions
  const handleStateSelect = (stateId, stateName) => {
    setSelectedState(stateId);
    setSelectedStateName(stateName);
    setShowProjectForm(true);

    // Fetch Clusters
    fetchClustersForState(stateId);

    // Reset subsequent selections
    setClusterOptions([]);
    setDistrictOptions([]);
    setSelectedCluster('');
    setSelectedClusterName('');
    setShowCpTypeSection(false);
    setShowDistrictSection(false);
  };

  const fetchClustersForState = async (stateId) => {
    try {
      const res = await locationAPI.getAllClusters({ state: stateId, isActive: 'true' });
      if (res.data && res.data.data) {
        setClusterOptions(res.data.data);
      } else {
        setClusterOptions([]);
      }
    } catch (e) {
      console.error("Error fetching clusters", e);
      setClusterOptions([]);
    }
  };

  const handleClusterSelect = (clusterId, clusterName) => {
    setSelectedCluster(clusterId);
    setSelectedClusterName(clusterName);
    setShowCpTypeSection(true);
    setShowDistrictSection(true);

    // Fetch Districts
    fetchDistrictsForCluster(clusterId);

    // Reset selections
    setSelectedCpTypes([]);
    setSelectedDistricts([]);
    setSelectAllCpType(false);
    setSelectAllDistrict(false);
  };

  const fetchDistrictsForCluster = async (clusterId) => {
    try {
      const res = await locationAPI.getAllDistricts({ cluster: clusterId, isActive: 'true' });
      if (res.data && res.data.data) {
        setDistrictOptions(res.data.data);
      } else {
        setDistrictOptions([]);
      }
    } catch (e) {
      console.error("Error fetching districts", e);
      setDistrictOptions([]);
    }
  };

  const handleCpTypeSelect = (cpType) => {
    if (selectedCpTypes.includes(cpType)) {
      setSelectedCpTypes(selectedCpTypes.filter(type => type !== cpType));
    } else {
      setSelectedCpTypes([...selectedCpTypes, cpType]);
    }
  };

  const handleSelectAllCpType = () => {
    if (selectAllCpType) {
      setSelectedCpTypes([]);
    } else {
      setSelectedCpTypes([...cpTypes]);
    }
    setSelectAllCpType(!selectAllCpType);
  };

  const handleDistrictSelect = (districtId) => {
    if (selectedDistricts.includes(districtId)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== districtId));
    } else {
      setSelectedDistricts([...selectedDistricts, districtId]);
    }
  };

  const handleSelectAllDistrict = () => {
    if (selectAllDistrict) {
      setSelectedDistricts([]);
    } else {
      setSelectedDistricts(districtOptions.map(d => d._id));
    }
    setSelectAllDistrict(!selectAllDistrict);
  };

  const handleAddProject = () => {
    if (!selectedCluster) {
      alert('Please select a cluster first');
      return;
    }
    if (selectedCpTypes.length === 0) {
      alert('Please select at least one CP Type');
      return;
    }
    if (selectedDistricts.length === 0) {
      alert('Please select at least one District');
      return;
    }

    // Get district names for display
    const selectedDistrictNames = districtOptions
      .filter(d => selectedDistricts.includes(d._id))
      .map(d => d.name);

    const newRow = {
      id: Date.now().toString(),
      state: selectedStateName,
      stateId: selectedState,
      cluster: selectedClusterName,
      clusterId: selectedCluster,
      cpTypes: [...selectedCpTypes],
      districts: selectedDistrictNames,
      districtIds: [...selectedDistricts],
      status: 'Inactive',
      comboKits: [],
      category: 'Solar Panel',
      subCategory: 'Residential',
      projectType: '1kw-10kw',
      subProjectType: 'On Grid'
    };

    setProjectRows([...projectRows, newRow]);
  };

  const handleAddComboKit = (rowId, isEdit = false) => {
    setCurrentRowId(rowId);
    setIsEditMode(isEdit);
    setEditingRowId(isEdit ? rowId : null);
    setShowComboKitModal(true);

    // Reset form if not in edit mode
    if (!isEdit) {
      setComboKitName('');
      setComboKitImage(null);
      setSolarPanelBrand('');
      setSelectedPanelSkus([]);
      setInverterBrand('');
      setAdditionalComboKits([]);
      setBomSections([]);
      setShowBomSection(false);
    }
  };

  const handleSaveComboKits = (e) => {
    e.preventDefault();

    // Update the project row with combo kit data
    const updatedRows = projectRows.map(row => {
      if (row.id === currentRowId) {
        const comboKitData = {
          name: comboKitName,
          image: comboKitImage,
          panelBrand: solarPanelBrand,
          panelSkus: selectedPanelSkus,
          inverterBrand: inverterBrand
        };

        if (isEditMode) {
          // In edit mode, replace existing combo kits
          return {
            ...row,
            comboKits: [comboKitData]
          };
        } else {
          // In add mode, append to existing combo kits
          return {
            ...row,
            comboKits: [...row.comboKits, comboKitData, ...additionalComboKits]
          };
        }
      }
      return row;
    });

    setProjectRows(updatedRows);
    setShowComboKitModal(false);
    resetComboKitForm();
  };

  const handleStatusToggle = (rowId) => {
    const updatedRows = projectRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          status: row.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return row;
    });
    setProjectRows(updatedRows);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComboKitImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolarPanelBrandChange = (brand) => {
    setSolarPanelBrand(brand);
    setShowPanelSkuSelect(!!brand);
    if (!brand) {
      setSelectedPanelSkus([]);
    }
  };

  const handleInverterBrandChange = (brand) => {
    setInverterBrand(brand);
    setShowInverterConfigBtn(!!brand);
  };

  const handleAddAnotherComboKit = () => {
    setAdditionalComboKits([
      ...additionalComboKits,
      {
        id: Date.now().toString(),
        name: '',
        image: null,
        panelBrand: '',
        panelSkus: [],
        inverterBrand: ''
      }
    ]);
  };

  const handleRemoveAdditionalComboKit = (id) => {
    setAdditionalComboKits(additionalComboKits.filter(kit => kit.id !== id));
  };

  const handleViewProjectCombokits = (rowId) => {
    setCurrentRowId(rowId);
    setShowProjectCombokitsModal(true);
  };

  const handleViewCombokitDetails = (comboKit) => {
    setViewingComboKit(comboKit);
    setShowViewCombokitModal(true);
  };

  const resetComboKitForm = () => {
    setComboKitName('');
    setComboKitImage(null);
    setSolarPanelBrand('');
    setSelectedPanelSkus([]);
    setInverterBrand('');
    setAdditionalComboKits([]);
    setBomSections([]);
    setShowBomSection(false);
    setIsEditMode(false);
    setEditingRowId(null);
    setActiveTab('create');
  };

  // Render cluster cards
  const renderClusterCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {clusterOptions.length === 0 ? <p className="text-gray-500 col-span-4">No clusters found for this state.</p> :
          clusterOptions.map(cluster => (
            <div
              key={cluster._id}
              className={`border rounded-lg p-4 text-center cursor-pointer transition-transform hover:scale-105 ${selectedCluster === cluster._id
                ? 'bg-purple-700 text-white border-purple-800'
                : 'border-gray-300 hover:border-blue-500'
                }`}
              onClick={() => handleClusterSelect(cluster._id, cluster.name)}
            >
              <div className="font-medium">{cluster.name}</div>
            </div>
          ))}
      </div>
    );
  };

  // Render CP type cards
  const renderCpTypeCards = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h5 className="text-lg font-semibold text-gray-700 mb-4">Select CP Type</h5>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllCpType}
              onChange={handleSelectAllCpType}
              className="mr-2"
            />
            <span className="font-semibold">Select All</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cpTypes.map(cpType => (
            <div
              key={cpType}
              className={`border rounded-lg p-4 text-center cursor-pointer transition-all h-24 flex flex-col justify-center items-center ${selectedCpTypes.includes(cpType)
                ? 'bg-green-600 text-white border-green-700'
                : 'border-gray-300 hover:border-green-500'
                }`}
              onClick={() => handleCpTypeSelect(cpType)}
            >
              <div className="font-medium">{cpType}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render district cards
  const renderDistrictCards = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h5 className="text-lg font-semibold text-gray-700 mb-4">Select Districts</h5>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllDistrict}
              onChange={handleSelectAllDistrict}
              className="mr-2"
            />
            <span className="font-semibold">Select All</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {districtOptions.length === 0 ? <p className="text-gray-500 col-span-4">No districts found for this cluster.</p> :
            districtOptions.map(district => (
              <div
                key={district._id}
                className={`border rounded-lg p-3 text-center cursor-pointer transition-all h-16 flex flex-col justify-center items-center ${selectedDistricts.includes(district._id)
                  ? 'bg-cyan-600 text-white border-cyan-700'
                  : 'border-gray-300 hover:border-cyan-500'
                  }`}
                onClick={() => handleDistrictSelect(district._id)}
              >
                <div className="font-medium text-sm">{district.name}</div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Render project table
  const renderProjectTable = () => {
    return (
      <div className="mt-8">
        <h5 className="text-lg font-semibold mb-4">Project List</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ComboKit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ComboKit Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CP Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Districts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sub Category</th>
                <th className="px4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sub Project Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cluster</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectRows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        onClick={() => handleAddComboKit(row.id, false)}
                      >
                        Add
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        onClick={() => handleAddComboKit(row.id, true)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`px-3 py-1 text-xs rounded ${row.status === 'Active'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}
                      onClick={() => handleStatusToggle(row.id)}
                    >
                      {row.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="bg-gray-100 rounded p-2 hover:bg-gray-200 cursor-pointer text-sm"
                      onClick={() => handleViewProjectCombokits(row.id)}
                    >
                      {row.comboKits.length === 0
                        ? '0 ComboKits'
                        : row.comboKits.length === 1
                          ? row.comboKits[0].name
                          : `${row.comboKits[0].name} and ${row.comboKits.length - 1} more`
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{row.state}</td>
                  <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={row.cpTypes.join(', ')}>
                    {row.cpTypes.join(', ') || 'None'}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={row.districts.join(', ')}>
                    {row.districts.join(', ') || 'None'}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.category}</td>
                  <td className="px-4 py-3 text-sm">{row.subCategory}</td>
                  <td className="px-4 py-3 text-sm">{row.projectType}</td>
                  <td className="px-4 py-3 text-sm">{row.subProjectType}</td>
                  <td className="px-4 py-3 text-sm">{row.cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render combo kit modal
  const renderComboKitModal = () => {
    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto ${showComboKitModal ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowComboKitModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
            <form onSubmit={handleSaveComboKits}>
              <div className="flex justify-between items-center p-6 border-b">
                <h4 className="text-xl font-semibold">ComboKit Management</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowComboKitModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex border-b mb-6">
                  <button
                    type="button"
                    className={`px-6 py-3 font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('create')}
                  >
                    Create ComboKit
                  </button>
                  <button
                    type="button"
                    className={`px-6 py-3 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('add')}
                  >
                    Add ComboKit
                  </button>
                </div>

                {activeTab === 'create' && (
                  <div>
                    {/* Main ComboKit Form */}
                    <div id="mainComboKitForm">
                      {/* ComboKit Name */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ComboKit Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={comboKitName}
                          onChange={(e) => setComboKitName(e.target.value)}
                          required
                        />
                      </div>

                      {/* ComboKit Image */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ComboKit Image</label>
                        <div className="relative w-full border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center h-48">
                          {comboKitImage ? (
                            <img src={comboKitImage} alt="ComboKit" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="text-center text-gray-400">
                              <ImageIcon size={48} className="mx-auto mb-2" />
                              <p>No image selected</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            id="combokitImage"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <button
                            type="button"
                            className="absolute bottom-3 right-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                            onClick={() => document.getElementById('combokitImage').click()}
                          >
                            <Camera size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Solar Panel Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Solar Panel Brand</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={solarPanelBrand}
                            onChange={(e) => handleSolarPanelBrandChange(e.target.value)}
                          >
                            <option value="">Select a brand</option>
                            <option value="Adani">Adani</option>
                            <option value="Tata">Tata</option>
                            <option value="Waree">Waree</option>
                          </select>

                          {showPanelSkuSelect && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Select Panel SKUs</label>
                              <Select
                                isMulti
                                options={skuData.panels[solarPanelBrand]?.map(sku => ({ value: sku, label: sku })) || []}
                                value={selectedPanelSkus.map(sku => ({ value: sku, label: sku }))}
                                onChange={(selected) => setSelectedPanelSkus(selected.map(s => s.value))}
                                className="basic-multi-select"
                                classNamePrefix="select"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Panel SKUs</label>
                          <div className="bg-gray-100 p-3 rounded-md font-mono font-semibold min-h-[42px]">
                            {selectedPanelSkus.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedPanelSkus.map(sku => (
                                  <span key={sku} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                                    {sku}
                                    <button
                                      type="button"
                                      className="ml-2 text-red-500 hover:text-red-700"
                                      onClick={() => setSelectedPanelSkus(selectedPanelSkus.filter(s => s !== sku))}
                                    >
                                      <X size={14} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No SKUs selected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Inverter Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Inverter Brand</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={inverterBrand}
                            onChange={(e) => handleInverterBrandChange(e.target.value)}
                          >
                            <option value="">Select a brand</option>
                            <option value="Vesole">Vesole</option>
                            <option value="Luminous">Luminous</option>
                            <option value="Microtek">Microtek</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Brand Selected</label>
                          <div className="bg-gray-100 p-3 rounded-md font-mono font-semibold min-h-[42px]">
                            <div className="flex justify-between items-center">
                              <span>{inverterBrand || 'No brand selected'}</span>
                              {showInverterConfigBtn && (
                                <button
                                  type="button"
                                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  onClick={() => window.open(`/combokit_inverter_configu?brand=${encodeURIComponent(inverterBrand)}`, '_blank')}
                                >
                                  Inverter Config
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BOM Button */}
                      <div className="mb-6">
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                          onClick={() => setShowBomSection(!showBomSection)}
                        >
                          Edit BOM
                        </button>
                      </div>

                      {/* BOM Section */}
                      {showBomSection && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-semibold text-gray-700">Bill of Materials (BOM)</div>
                            <button
                              type="button"
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                              onClick={() => setShowBomSection(false)}
                            >
                              <ChevronUp size={16} />
                            </button>
                          </div>

                          <div className="mb-4">
                            {bomSections.length === 0 && (
                              <p className="text-gray-500 text-sm">No BOM sections added yet.</p>
                            )}
                          </div>

                          <div className="text-right">
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                              onClick={() => setBomSections([...bomSections, { id: Date.now().toString() }])}
                            >
                              Add New BOM
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                              Save BOM
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'add' && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <h6 className="font-semibold mb-3">Add More ComboKits</h6>

                    <div className="space-y-4 mb-3">
                      {additionalComboKits.map(kit => (
                        <div key={kit.id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveAdditionalComboKit(kit.id)}
                          >
                            <X size={20} />
                          </button>
                          <h6 className="font-semibold mb-3">Additional ComboKit</h6>

                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ComboKit Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={kit.name}
                              onChange={(e) => {
                                const updatedKits = additionalComboKits.map(k =>
                                  k.id === kit.id ? { ...k, name: e.target.value } : k
                                );
                                setAdditionalComboKits(updatedKits);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 flex items-center"
                      onClick={handleAddAnotherComboKit}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Another ComboKit
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save ComboKits
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={() => setShowComboKitModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render project combokits modal
  const renderProjectCombokitsModal = () => {
    const row = projectRows.find(r => r.id === currentRowId);
    const comboKits = row?.comboKits || [];

    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto ${showProjectCombokitsModal ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowProjectCombokitsModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h5 className="text-xl font-semibold">Project ComboKits</h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowProjectCombokitsModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {comboKits.length === 0 ? (
                <p className="text-gray-500">No ComboKits available for this project</p>
              ) : (
                <div className="space-y-4">
                  {comboKits.map((kit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-semibold">{kit.name}</div>
                        <div className="flex gap-2">
                          {isEditMode && (
                            <button className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                              Delete
                            </button>
                          )}
                          <button
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            onClick={() => handleViewCombokitDetails(kit)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="bg-gray-100 rounded px-3 py-1 text-sm">
                          <span className="font-medium text-gray-600">Panels:</span>
                          <span className="font-semibold ml-1">
                            {kit.panelBrand || 'Not specified'} ({kit.panelSkus?.length || 0} SKUs)
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded px-3 py-1 text-sm">
                          <span className="font-medium text-gray-600">Inverter:</span>
                          <span className="font-semibold ml-1">{kit.inverterBrand || 'Not specified'}</span>
                        </div>
                        <div className="bg-gray-100 rounded px-3 py-1 text-sm">
                          <span className="font-medium text-gray-600">BOM:</span>
                          <span className="font-semibold ml-1">Not Added</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                type="button"
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowProjectCombokitsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render view combokit modal
  const renderViewCombokitModal = () => {
    if (!viewingComboKit) return null;

    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto ${showViewCombokitModal ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowViewCombokitModal(false)}></div>

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h5 className="text-xl font-semibold">ComboKit Details</h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowViewCombokitModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-blue-600 border-b pb-2">{viewingComboKit.name}</h4>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-lg text-gray-600 mb-3 pb-2 border-b">Basic Information</h5>

                  {viewingComboKit.image && (
                    <div className="flex mb-3">
                      <div className="font-semibold text-gray-600 w-36">Image:</div>
                      <div>
                        <img
                          src={viewingComboKit.image}
                          alt="ComboKit"
                          className="max-w-[200px] max-h-[200px] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Selected SKUs</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm">Solar Panel</td>
                        <td className="px-4 py-3 text-sm">{viewingComboKit.panelBrand || 'Not specified'}</td>
                        <td className="px-4 py-3 text-sm">
                          {viewingComboKit.panelSkus?.join(', ') || 'None'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">Inverter</td>
                        <td className="px-4 py-3 text-sm">{viewingComboKit.inverterBrand || 'Not specified'}</td>
                        <td className="px-4 py-3 text-sm">Brand only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                type="button"
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowViewCombokitModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h4 className="text-2xl font-semibold text-blue-600">Add Combokit - {selectedStateName || 'Select State'}</h4>
      </div>

      {/* State Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {states.map(state => (
          <StateCard key={state._id} stateCode={state._id} stateName={state.name} onSelect={handleStateSelect} selected={selectedState === state._id} />
        ))}
      </div>

      {/* Project Form */}
      {showProjectForm && (
        <div>
          {/* Cluster Selection */}
          {renderClusterCards()}

          {/* CP Type Selection */}
          {showCpTypeSection && renderCpTypeCards()}

          {/* District Selection */}
          {showDistrictSection && renderDistrictCards()}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              onClick={handleAddProject}
            >
              <Plus size={18} className="mr-2" />
              Add Project
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              onClick={() => {
                if (!selectedState) {
                  alert('Please select a state first');
                  return;
                }
                alert(`Approval process initiated for ${selectedStateName} state`);
              }}
            >
              <CheckCircle size={18} className="mr-2" />
              Approval
            </button>
          </div>

          {/* Project Table */}
          {renderProjectTable()}
        </div>
      )}

      {/* Modals */}
      {renderComboKitModal()}
      {renderProjectCombokitsModal()}
      {renderViewCombokitModal()}
    </div>
  );
}

// State Card Component
function StateCard({ stateCode, stateName, onSelect, selected }) {
  const handleClick = () => {
    onSelect(stateCode, stateName);
  };

  return (
    <div
      className={`border rounded-lg p-4 text-center cursor-pointer transition-transform hover:scale-105 ${selected
        ? 'bg-blue-600 text-white border-blue-600'
        : 'border-blue-500 hover:border-blue-700'
        }`}
      onClick={handleClick}
    >
      <p className="font-medium">{stateName}</p>
    </div>
  );
}