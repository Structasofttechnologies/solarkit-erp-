import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Eye,
  EyeOff,
  Save,
  Plus,
  Trash2,
  Edit2,
  List,
  ArrowDown,
  GripVertical,
  X,
  Check,
  Cog,
  ChevronDown
} from 'lucide-react';
import { projectApi } from '../../../../services/project/projectApi';
import { getProjectTypes, getProjectCategoryMappings, getSubCategories } from '../../../../services/core/masterApi';
import { useNavigate } from 'react-router-dom';

import { getCountries, getStates, getClustersHierarchy, getDistrictsHierarchy } from '../../../../services/core/locationApi';
import { createDiscom, getDiscomsByState, getQuoteSettings, deleteDiscom } from '../../../../services/quote/quoteApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ConfigurationSetting = () => {
  const navigate = useNavigate();

  // State for location selection
  // State for location selection
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedDiscoms, setSelectedDiscoms] = useState([]); // This will store DISCOM names

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [discoms, setDiscoms] = useState([]); // Dynamic discoms list

  const [isAddingDiscom, setIsAddingDiscom] = useState(false);
  const [newDiscomName, setNewDiscomName] = useState('');
  const [newDiscomState, setNewDiscomState] = useState('');
  const [isDiscomLoading, setIsDiscomLoading] = useState(false);
  const [masterSubCategories, setMasterSubCategories] = useState([]);


  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [stateSectionVisible, setStateSectionVisible] = useState(false);
  const [clusterSectionVisible, setClusterSectionVisible] = useState(false);
  const [districtSectionVisible, setDistrictSectionVisible] = useState(false);
  const [discomSectionVisible, setDiscomSectionVisible] = useState(false);

  // State for project type
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [configName, setConfigName] = useState('');
  const [configCategory, setConfigCategory] = useState('Commercial');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('All');

  // State for step configuration
  const [allSteps, setAllSteps] = useState([]);
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [draggedStep, setDraggedStep] = useState(null);
  const [allSavedConfigs, setAllSavedConfigs] = useState([]);

  // Initialize data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [fetchedCountries, fetchedMappings, fetchedStages, fetchedSubCats] = await Promise.all([
        getCountries(),
        getProjectCategoryMappings(),
        projectApi.getJourneyStages(),
        getSubCategories()
      ]);


      setCountries(fetchedCountries || []);
      // Mappings API returns { success: true, count: N, data: [] }
      let mappings = fetchedMappings.success ? fetchedMappings.data : (Array.isArray(fetchedMappings) ? fetchedMappings : []);

      // Group mappings same as AddProjectCategory for better UI
      const grouped = Object.values(mappings.reduce((acc, curr) => {
        const key = `${curr.categoryId?._id || curr.categoryId}-${curr.subCategoryId?._id || curr.subCategoryId}-${curr.subProjectTypeId?._id || 'none'}-${curr.projectTypeFrom}-${curr.projectTypeTo}`;
        if (!acc[key]) {
          acc[key] = {
            ...curr,
            mappingIds: [curr._id],
            clusters: curr.clusterId ? [curr.clusterId] : []
          };
        } else if (curr.clusterId && !acc[key].clusters.find(c => c._id === curr.clusterId._id)) {
          acc[key].clusters.push(curr.clusterId);
          acc[key].mappingIds.push(curr._id);
        }
        return acc;
      }, {}));

      // Filter out incomplete mappings (where category or subcategory name is missing)
      const validMappings = grouped.filter(row =>
        row.categoryId?.name &&
        row.subCategoryId?.name
      );

      setProjectTypes(validMappings);
      setAllSteps(fetchedStages || []);
      setMasterSubCategories(fetchedSubCats?.data || (Array.isArray(fetchedSubCats) ? fetchedSubCats : []));


      // Load ALL saved configs for the summary table
      await refreshSavedConfigs();

      // Load saved config for current context if needed
      const savedConfig = await projectApi.getConfigurationByKey('projectConfiguration');
      if (savedConfig) {
        restoreConfiguration(savedConfig);
      }
    } catch (error) {
      console.error("Error loading initial data", error);
    }
  };

  const restoreConfiguration = (config) => {
    if (config.selectedSteps) {
      setSelectedSteps(config.selectedSteps);
    } else {
      setSelectedSteps([]);
    }
  };

  // Fetch config for specific type
  const fetchConfigForType = async (type) => {
    if (!type) return;
    try {
      const configKey = `projectConfig_${type.replace(/\s+/g, '_')}`;
      const config = await projectApi.getConfigurationByKey(configKey);
      if (config) {
        setSelectedSteps(config.selectedSteps || []);
        if (config.configName) setConfigName(config.configName);
      } else {
        setSelectedSteps([]);
      }
    } catch (e) {
      console.error(e);
      setSelectedSteps([]);
    }
  };

  // Handle country selection
  const handleCountrySelect = async (country) => {
    const name = country.name || country;
    const countryId = country._id || country;

    let newSelected = [];
    if (selectedCountries.includes(name)) {
      newSelected = selectedCountries.filter(c => c !== name);
    } else {
      newSelected = [...selectedCountries, name];
    }

    setSelectedCountries(newSelected);
    setSelectedStates([]);
    setSelectedClusters([]);
    setSelectedDistricts([]);
    setSelectedDiscoms([]);

    if (newSelected.length > 0) {
      setStateSectionVisible(true);
      // Fetch states for all selected countries
      try {
        const countryIds = countries.filter(c => newSelected.includes(c.name)).map(c => c._id);
        const statesData = await Promise.all(countryIds.map(id => getStates(id)));
        setStates(statesData.flat());
      } catch (e) { console.error(e); }
    } else {
      setStateSectionVisible(false);
    }
    setClusterSectionVisible(false);
    setDistrictSectionVisible(false);
    setDiscomSectionVisible(false);
  };

  const toggleAllCountries = async () => {
    if (selectedCountries.length === countries.length) {
      setSelectedCountries([]);
      setStateSectionVisible(false);
    } else {
      const allNames = countries.map(c => c.name);
      setSelectedCountries(allNames);
      setStateSectionVisible(true);
      try {
        const statesData = await Promise.all(countries.map(c => getStates(c._id)));
        setStates(statesData.flat());
      } catch (e) { console.error(e); }
    }
  };

  // Handle state selection
  const handleStateSelect = async (state) => {
    const name = state.name || state;
    const stateId = state._id || state;

    let newSelected = [];
    if (selectedStates.includes(name)) {
      newSelected = selectedStates.filter(s => s !== name);
    } else {
      newSelected = [...selectedStates, name];
    }

    setSelectedStates(newSelected);
    setSelectedClusters([]);
    setSelectedDistricts([]);
    setSelectedDiscoms([]);

    if (newSelected.length > 0) {
      setClusterSectionVisible(true);
      try {
        const stateIds = states.filter(s => newSelected.includes(s.name)).map(s => s._id);
        const clustersData = await Promise.all(stateIds.map(id => getClustersHierarchy(id)));
        setClusters(clustersData.flat());

        // Also fetch DISCOMs for these states
        fetchDiscoms(stateIds);
      } catch (e) { console.error(e); }
    } else {
      setClusterSectionVisible(false);
    }
    setDistrictSectionVisible(false);
    setDiscomSectionVisible(false);
  };

  const toggleAllStates = async () => {
    if (selectedStates.length === states.length) {
      setSelectedStates([]);
      setClusterSectionVisible(false);
    } else {
      const allNames = states.map(s => s.name);
      setSelectedStates(allNames);
      setClusterSectionVisible(true);
      try {
        const clustersData = await Promise.all(states.map(s => getClustersHierarchy(s._id)));
        setClusters(clustersData.flat());

        const stateIds = states.map(s => s._id);
        fetchDiscoms(stateIds);
      } catch (e) { console.error(e); }
    }
  };

  // Handle cluster selection
  const handleClusterSelect = async (cluster) => {
    const name = cluster.name || cluster;
    const clusterId = cluster._id || cluster;

    let newSelected = [];
    if (selectedClusters.includes(name)) {
      newSelected = selectedClusters.filter(c => c !== name);
    } else {
      newSelected = [...selectedClusters, name];
    }

    setSelectedClusters(newSelected);
    setSelectedDistricts([]);
    setSelectedDiscoms([]);

    if (newSelected.length > 0) {
      setDistrictSectionVisible(true);
      try {
        const clusterIds = clusters.filter(c => newSelected.includes(c.name)).map(c => c._id);
        const districtsData = await Promise.all(clusterIds.map(id => getDistrictsHierarchy(id)));
        setDistricts(districtsData.flat());
      } catch (e) { console.error(e); }
    } else {
      setDistrictSectionVisible(false);
    }
    setDiscomSectionVisible(false);
  };

  const toggleAllClusters = async () => {
    if (selectedClusters.length === clusters.length) {
      setSelectedClusters([]);
      setDistrictSectionVisible(false);
    } else {
      const allNames = clusters.map(c => c.name);
      setSelectedClusters(allNames);
      setDistrictSectionVisible(true);
      try {
        const districtsData = await Promise.all(clusters.map(c => getDistrictsHierarchy(c._id)));
        setDistricts(districtsData.flat());
      } catch (e) { console.error(e); }
    }
  };

  const fetchDiscoms = async (stateIds) => {
    if (!stateIds || stateIds.length === 0) {
      setDiscoms([]);
      return;
    }
    setIsDiscomLoading(true);
    try {
      const discomsData = await Promise.all(stateIds.map(id => getDiscomsByState(id)));
      // Flatten and remove duplicates by name
      const uniqueDiscoms = Array.from(new Map(discomsData.flat().map(item => [item._id, item])).values());
      setDiscoms(uniqueDiscoms);
    } catch (e) {
      console.error("Error fetching discoms:", e);
    } finally {
      setIsDiscomLoading(false);
    }
  };

  const handleAddDiscom = async () => {
    if (!newDiscomName.trim()) {
      toast.error("Please enter Discom name");
      return;
    }
    if (!newDiscomState) {
      toast.error("Please select a state for the new Discom");
      return;
    }

    try {
      setIsDiscomLoading(true);
      const payload = {
        name: newDiscomName,
        state: newDiscomState,
        projects: [] // Default empty projects as per model
      };
      const created = await createDiscom(payload);
      toast.success("Discom added successfully!");

      // Update local list
      setDiscoms(prev => [...prev, created]);
      setNewDiscomName('');
      setIsAddingDiscom(false);

      // Select it automatically
      setSelectedDiscoms(prev => [...prev, created.name]);
    } catch (error) {
      console.error("Error adding discom:", error);
      toast.error("Failed to add Discom");
    } finally {
      setIsDiscomLoading(false);
    }
  };

  const handleDeleteDiscom = async (e, discomId, name) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete DISCOM "${name}"?`)) return;

    try {
      setIsDiscomLoading(true);
      await deleteDiscom(discomId);
      toast.success("DISCOM deleted successfully");
      
      // Update local list
      setDiscoms(prev => prev.filter(d => d._id !== discomId));
      // Remove from selected if it was there
      setSelectedDiscoms(prev => prev.filter(d => d !== name));
    } catch (error) {
      console.error("Error deleting discom:", error);
      toast.error("Failed to delete DISCOM");
    } finally {
      setIsDiscomLoading(false);
    }
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    const name = district.name || district;
    let newSelected = [];
    if (selectedDistricts.includes(name)) {
      newSelected = selectedDistricts.filter(d => d !== name);
    } else {
      newSelected = [...selectedDistricts, name];
    }
    setSelectedDistricts(newSelected);
    setDiscomSectionVisible(newSelected.length > 0);
    onLocationSelected(selectedStates, selectedClusters, newSelected);
  };

  const toggleAllDistricts = () => {
    if (selectedDistricts.length === districts.length) {
      setSelectedDistricts([]);
      setDiscomSectionVisible(false);
    } else {
      const allNames = districts.map(d => d.name);
      setSelectedDistricts(allNames);
      setDiscomSectionVisible(true);
      onLocationSelected(selectedStates, selectedClusters, allNames);
    }
  };

  // Handle DISCOM selection
  const handleDiscomSelect = (discom) => {
    if (selectedDiscoms.includes(discom)) {
      setSelectedDiscoms(selectedDiscoms.filter(d => d !== discom));
    } else {
      setSelectedDiscoms([...selectedDiscoms, discom]);
    }
  };

  const toggleAllDiscoms = () => {
    if (selectedDiscoms.length === discoms.length) {
      setSelectedDiscoms([]);
    } else {
      setSelectedDiscoms(discoms.map(d => d.name));
    }
  };

  // Toggle step selection
  const toggleStepSelection = (stepName) => {
    if (selectedSteps.includes(stepName)) {
      setSelectedSteps(selectedSteps.filter(s => s !== stepName));
    } else {
      setSelectedSteps([...selectedSteps, stepName]);
    }
  };

  // Remove step from selection
  const removeStep = (step) => {
    setSelectedSteps(selectedSteps.filter(s => s !== step));
  };

  // Add custom step
  const addCustomStep = () => {
    const stepName = prompt('Enter the name of the new step:');
    if (stepName && stepName.trim() !== '') {
      setAllSteps([...allSteps, stepName]);
    }
  };

  // Save configuration
  const saveConfiguration = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one project type before saving');
      return;
    }

    if (!configName.trim()) {
      toast.error('Please enter a configuration name');
      return;
    }

    const toastId = toast.loading(`Saving configuration "${configName}"...`);

    try {
      const configuration = {
        currentCountry: selectedCountries,
        currentState: selectedStates,
        currentCluster: selectedClusters,
        currentDistrict: selectedDistricts,
        currentDiscom: selectedDiscoms,
        configName,
        selectedSteps,
        selectedRows: selectedRows, // Store which rows this config applies to
        createdAt: new Date().toISOString() // Add timestamp for unique grouping
      };

      // Save for each selected project type
      const savePromises = selectedRows.map(rowId => {
        const row = projectTypes.find(pt => pt._id === rowId);
        const category = row.categoryId?.name || row.category || '-';
        const subCategory = row.subCategoryId?.name || row.subCategory || '-';
        const range = `${row.projectTypeFrom} to ${row.projectTypeTo} kW`;
        const subType = row.subProjectTypeId?.name || row.subProjectType || '-';
        
        // Use a consistent separator that we can split by in the table
        configuration.configCategory = configCategory;
        const typeKey = `${configCategory}_${row.categoryId?.name || row.category}_${row.subCategoryId?.name || row.subCategory}_${row.projectTypeFrom}_to_${row.projectTypeTo}_kW_${row.subProjectTypeId?.name || row.subProjectType || 'Any'}`;
        const configKey = `projectConfig_${typeKey.replace(/\s+/g, '_')}`;
        return projectApi.saveConfiguration(configKey, configuration);
      });

      await Promise.all(savePromises);
      
      // Refresh configurations list
      await refreshSavedConfigs();
      
      toast.success(`Configuration "${configName}" saved successfully!`, { id: toastId });
      
      // Optional: Clear selection after save or keep it? 
      // User might want to save same config for another set, but usually they're done.
      // setSelectedRows([]);
      // setConfigName('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save configuration', { id: toastId });
    }
  };

  const refreshSavedConfigs = async () => {
    try {
      const allConfigs = await projectApi.getConfigurations();
      if (allConfigs && Array.isArray(allConfigs)) {
        const filtered = allConfigs.filter(c => c.configKey && c.configKey.startsWith('projectConfig_'));
        setAllSavedConfigs(filtered);
      }
    } catch (e) {
      console.error("Error refreshing configs:", e);
    }
  };

  const deleteSavedConfigs = async (configKeys, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this configuration'}"?${configKeys.length > 1 ? ` This will remove it from ${configKeys.length} project types.` : ''}`)) return;
    
    const toastId = toast.loading('Deleting configuration...');
    try {
      await Promise.all(configKeys.map(key => projectApi.deleteConfiguration(key)));
      toast.success('Configuration deleted successfully', { id: toastId });
      
      // Refresh configurations list
      await refreshSavedConfigs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete configuration', { id: toastId });
    }
  };

  const editSavedConfig = (cfg) => {
    // If it's a grouped config, cfg might be our custom object or the original
    const val = cfg.configValue || {};
    
    // Set configuration name
    if (val.configName) setConfigName(val.configName);
    
    // Set workflow steps
    if (val.selectedSteps) setSelectedSteps(val.selectedSteps);
    
    // Set selected project types in the main table
    if (val.selectedRows) {
      setSelectedRows(val.selectedRows);
    } else {
      // Fallback: If selectedRows wasn't saved, try to find the row by configKey content
      // The key was Category-Subcat-Range-Subtype
      // This is less reliable but better than nothing
      setSelectedRows([]); 
    }
    
    // Smooth scroll to selection section
    const el = document.getElementById('project-type-table');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    
    toast.success(`Loaded configuration: ${val.configName || 'Unnamed'}`);
  };

  // Handle drag start
  const handleDragStart = (e, step) => {
    setDraggedStep(step);
    e.currentTarget.classList.add('opacity-50', 'scale-105');
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    setDraggedStep(null);
    e.currentTarget.classList.remove('opacity-50', 'scale-105');
    updateStepPriorities();
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e, step) => {
    e.preventDefault();
    if (!draggedStep) return;

    const newSteps = [...selectedSteps];
    const draggedIndex = newSteps.indexOf(draggedStep);
    const targetIndex = newSteps.indexOf(step);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged step
      newSteps.splice(draggedIndex, 1);
      // Insert at target position
      newSteps.splice(targetIndex, 0, draggedStep);
      setSelectedSteps(newSteps);
    }
  };

  // Update step priorities based on order
  const updateStepPriorities = () => {
    // The order in the array already represents priority
    saveConfiguration();
  };

  // When location is selected
  const onLocationSelected = (state, cluster, district) => {
    console.log('Location selected:', { state, cluster, district });
    saveConfiguration();
  };

  // Handle project type change
  const handleProjectTypeChange = (type) => {
    setSelectedProjectType(type);
    fetchConfigForType(type);
  };

  // Handle row selection
  const handleRowSelect = (rowId) => {
    let newSelectedRows = [];
    if (selectedRows.includes(rowId)) {
      newSelectedRows = selectedRows.filter(id => id !== rowId);
    } else {
      newSelectedRows = [...selectedRows, rowId];
    }
    setSelectedRows(newSelectedRows);

    // If we just selected one row, maybe load its existing config?
    if (newSelectedRows.length === 1) {
      const row = projectTypes.find(pt => pt._id === newSelectedRows[0]);
      const category = row.categoryId?.name || row.category || '-';
      const subCategory = row.subCategoryId?.name || row.subCategory || '-';
      const range = `${row.projectTypeFrom} to ${row.projectTypeTo} kW`;
      const subType = row.subProjectTypeId?.name || row.subProjectType || '-';
      const fullType = `${category}-${subCategory}-${range}${subType ? `-${subType}` : ''}`;
      setSelectedProjectType(fullType);
      fetchConfigForType(fullType);
    }
  };

  const toggleAllRows = () => {
    const visibleRows = projectTypes.filter(row => {
      if (tableCategoryFilter === 'All') return true;
      const catName = row.categoryId?.name || row.category || '';
      const subCatName = row.subCategoryId?.name || row.subCategory || '';
      return catName.includes(tableCategoryFilter) || subCatName.includes(tableCategoryFilter);
    });

    const visibleIds = visibleRows.map(r => r._id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedRows.includes(id));

    if (allVisibleSelected) {
      // Remove visible rows from selection
      setSelectedRows(selectedRows.filter(id => !visibleIds.includes(id)));
    } else {
      // Add all visible rows to selection (using Set to prevent duplicates)
      setSelectedRows([...new Set([...selectedRows, ...visibleIds])]);
    }
  };

  // Get location summary text
  const getLocationSummary = () => {
    if (selectedCountries.length === 0) return 'Not selected';

    let summary = '';
    if (selectedCountries.length === countries.length && countries.length > 1) {
      summary = 'All Countries';
    } else {
      summary = selectedCountries.join(', ');
    }

    if (selectedStates.length > 0) {
      summary += ' > ' + (selectedStates.length === states.length && states.length > 1 ? 'All States' : `${selectedStates.length} States`);
    }
    if (selectedClusters.length > 0) {
      summary += ' > ' + (selectedClusters.length === clusters.length && clusters.length > 1 ? 'All Clusters' : `${selectedClusters.length} Clusters`);
    }
    if (selectedDistricts.length > 0) {
      summary += ' > ' + (selectedDistricts.length === districts.length && districts.length > 1 ? 'All Districts' : `${selectedDistricts.length} Districts`);
    }
    if (selectedDiscoms.length > 0) {
      summary += ' > ' + (selectedDiscoms.length === discoms.length && discoms.length > 1 ? 'All DISCOMs' : `${selectedDiscoms.length} DISCOMs`);
    }
    return summary;
  };

  // Get project type label
  const getProjectTypeLabel = () => {
    if (selectedRows.length === 0) return 'Not selected';
    if (selectedRows.length === 1) {
      const row = projectTypes.find(pt => pt._id === selectedRows[0]);
      if (!row) return 'Not selected';
      const category = row.categoryId?.name || row.category || '-';
      const subCategory = row.subCategoryId?.name || row.subCategory || '-';
      const range = `${row.projectTypeFrom} to ${row.projectTypeTo} kW`;
      const subProjectType = row.subProjectTypeId?.name || row.subProjectType || '-';
  
      return `${category} - ${subCategory} - ${range} - ${subProjectType}`;
    }
    return `${selectedRows.length} project types selected`;
  };

  // Get grouped configurations for the table
  const getGroupedConfigs = () => {
    const groups = {};
    
    // Sort all configs by created date if possible (though we don't have it explicitly without updatedAt)
    // We'll just group them
    allSavedConfigs.forEach(cfg => {
      const val = cfg.configValue || {};
      const stepsKey = Array.isArray(val.selectedSteps) ? val.selectedSteps.join('|') : '';
      // Group by name, steps AND createdAt to ensure separate saves are separate rows
      const groupKey = `${val.configName || 'unnamed'}-${stepsKey}-${val.createdAt || cfg.updatedAt || cfg.configKey}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          configName: val.configName || 'Unnamed Config',
          selectedSteps: val.selectedSteps || [],
          status: cfg.status || 'Active',
          allKeys: [cfg.configKey],
          appliedToLabels: [cfg.configKey.replace('projectConfig_', '').replace(/_/g, ' ')],
          isMultiple: false,
          configValue: val, // One representation of the config
          createdAt: val.createdAt || cfg.updatedAt || ''
        };
      } else {
        groups[groupKey].allKeys.push(cfg.configKey);
        groups[groupKey].appliedToLabels.push(cfg.configKey.replace('projectConfig_', '').replace(/_/g, ' '));
        groups[groupKey].isMultiple = true;
      }
    });
    
    // Final check for multiple based on selectedRows if available
    Object.values(groups).forEach(g => {
      if (g.configValue.selectedRows && g.configValue.selectedRows.length > 1) {
        g.isMultiple = true;
      }
    });
    
    return Object.values(groups);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-blue-600 text-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex items-center">
          <Cpu className="w-8 h-8 mr-4" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">Project Management Configuration</h1>
            <p className="text-blue-100 text-sm md:text-base">Configure project settings, types, and workflow steps</p>
          </div>
        </div>
      </header>

      {/* Location Toggle Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Configuration</h2>
            <button
              onClick={() => setLocationCardsVisible(!locationCardsVisible)}
              className="flex items-center px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {locationCardsVisible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Location Cards
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Location Cards
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Section */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${locationCardsVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        {/* Country Selection */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Select Country</h3>
            <button
              onClick={toggleAllCountries}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {selectedCountries.length === countries.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {countries.map((country) => {
                const name = country.name || country;
                return (
                  <div
                    key={country._id || country}
                    onClick={() => handleCountrySelect(country)}
                    className={`bg-white border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedCountries.includes(name)
                      ? 'border-blue-500 border-2 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <h4 className={`font-bold ${selectedCountries.includes(name) ? 'text-blue-700' : 'text-gray-800'}`}>{name}</h4>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* State Selection */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${stateSectionVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select State</h3>
              <button
                onClick={toggleAllStates}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {selectedStates.length === states.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {states.map((state) => {
                  const name = state.name || state;
                  return (
                    <div
                      key={state._id || state}
                      onClick={() => handleStateSelect(state)}
                      className={`bg-white border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedStates.includes(name)
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <h4 className={`font-bold ${selectedStates.includes(name) ? 'text-blue-700' : 'text-gray-800'}`}>{name}</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        {selectedCountries.length > 2 ? `${selectedCountries.length} Countries` : selectedCountries.join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Cluster Selection */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${clusterSectionVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Cluster</h3>
              <button
                onClick={toggleAllClusters}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {selectedClusters.length === clusters.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clusters.map((cluster) => {
                  const name = cluster.name || cluster;
                  return (
                    <div
                      key={cluster._id || cluster}
                      onClick={() => handleClusterSelect(cluster)}
                      className={`bg-white border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedClusters.includes(name)
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <h4 className={`font-bold ${selectedClusters.includes(name) ? 'text-blue-700' : 'text-gray-800'}`}>{name}</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        {selectedStates.length > 2 ? `${selectedStates.length} States` : selectedStates.join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* District Selection */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${districtSectionVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select District</h3>
              <button
                onClick={toggleAllDistricts}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {selectedDistricts.length === districts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {districts.map((district) => {
                  const name = district.name || district;
                  return (
                    <div
                      key={district._id || district}
                      onClick={() => handleDistrictSelect(district)}
                      className={`bg-white border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedDistricts.includes(name)
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <h4 className={`font-bold ${selectedDistricts.includes(name) ? 'text-blue-700' : 'text-gray-800'}`}>{name}</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        {selectedClusters.length > 2 ? `${selectedClusters.length} Clusters` : selectedClusters.join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* DISCOM Selection */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${discomSectionVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select DISCOM</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setIsAddingDiscom(!isAddingDiscom);
                    if (selectedStates.length > 0) {
                      // Pre-select the first selected state if available
                      const firstState = states.find(s => s.name === selectedStates[0]);
                      if (firstState) setNewDiscomState(firstState._id);
                    }
                  }}
                  className="flex items-center text-sm font-medium text-green-600 hover:text-green-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add DISCOM
                </button>
                <button
                  onClick={toggleAllDiscoms}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {selectedDiscoms.length === discoms.length && discoms.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {/* Add DISCOM Form */}
              {isAddingDiscom && (
                <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Discom Name</label>
                      <input
                        type="text"
                        value={newDiscomName}
                        onChange={(e) => setNewDiscomName(e.target.value)}
                        placeholder="Enter Discom Name"
                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div className="w-full md:w-64">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">State</label>
                      <select
                        value={newDiscomState}
                        onChange={(e) => setNewDiscomState(e.target.value)}
                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="">Select State</option>
                        {states
                          .filter(s => selectedStates.includes(s.name))
                          .map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDiscom}
                        disabled={isDiscomLoading}
                        className="h-11 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        {isDiscomLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Save
                      </button>
                      <button
                        onClick={() => setIsAddingDiscom(false)}
                        className="h-11 px-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isDiscomLoading && discoms.length === 0 ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {discoms.length > 0 ? (
                    discoms.map((discom) => (
                      <div
                        key={discom._id}
                        onClick={() => handleDiscomSelect(discom.name)}
                        className={`bg-white border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative group ${selectedDiscoms.includes(discom.name)
                          ? 'border-blue-500 border-2 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                          }`}
                      >
                        <button
                          onClick={(e) => handleDeleteDiscom(e, discom._id, discom.name)}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete DISCOM"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className={`font-bold ${selectedDiscoms.includes(discom.name) ? 'text-blue-700' : 'text-gray-800'}`}>{discom.name}</h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {states.find(s => s._id === discom.state)?.name || 'State'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="mb-2">No DISCOMs found for selected states.</p>
                      <button
                        onClick={() => setIsAddingDiscom(true)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Click here to add one
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Type Configuration */}
      <div id="project-type-table" className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Project Type Configuration</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200 shadow-inner">
            {['All', 'Commercial', 'Residential'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setTableCategoryFilter(cat);
                  if (cat !== 'All') setConfigCategory(cat);
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${tableCategoryFilter === cat 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5 scale-[1.02]' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRows.length === projectTypes.length && projectTypes.length > 0}
                    onChange={toggleAllRows}
                  />
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Subcategory</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Project Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Sub Project Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectTypes
                .filter(row => {
                  if (tableCategoryFilter === 'All') return true;
                  const catName = row.categoryId?.name || row.category || '';
                  const subCatName = row.subCategoryId?.name || row.subCategory || '';
                  return catName.includes(tableCategoryFilter) || subCatName.includes(tableCategoryFilter);
                })
                .map((row) => (
                <tr
                  key={row._id}
                  className={`border-b hover:bg-gray-50 transition-colors ${selectedRows.includes(row._id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                >
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.includes(row._id)}
                      onChange={() => handleRowSelect(row._id)}
                    />
                  </td>
                  <td className="p-4 text-sm font-medium">{row.categoryId?.name || row.category || '-'}</td>
                  <td className="p-4 text-sm text-blue-600">{row.subCategoryId?.name || row.subCategory || '-'}</td>
                  <td className="p-4 text-sm font-semibold text-green-700">
                    {row.projectTypeFrom} to {row.projectTypeTo} kW
                  </td>
                  <td className="p-4 text-sm">{row.subProjectTypeId?.name || row.subProjectType || '-'}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRowSelect(row._id)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center ${selectedRows.includes(row._id)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-blue-500 text-blue-500 hover:bg-blue-50'
                          }`}
                      >
                        {selectedRows.includes(row._id) ? <Check className="w-4 h-4 inline mr-1" /> : <Plus className="w-4 h-4 inline mr-1" />}
                        {selectedRows.includes(row._id) ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step Configuration */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Project Step Configuration</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {getProjectTypeLabel()}
          </span>
        </div>
        <div className="p-4 md:p-6">
          {/* Configuration Name Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-2">
                Configuration Name
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g. Standard Warehouse Workflow"
                className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-2 text-blue-600">
                Selected Application Scope
              </label>
              <div className="h-11 px-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center text-blue-700 font-medium">
                {getProjectTypeLabel()}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-gray-700 uppercase">
                Apply Configuration To Sub-Category
              </label>
              <button
                onClick={() => navigate('/admin/settings/product/add_project_type')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2 py-1 rounded"
              >
                <Plus className="w-3 h-3 mr-1" /> Add More / Manage
              </button>
            </div>
            <div className="relative group">
              <select
                value={configCategory}
                onChange={(e) => setConfigCategory(e.target.value)}
                className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-bold text-gray-700"
              >
                <option value="">Select Sub-Category (Scope)</option>
                {/* Always include the defaults if not present, then add master data */}
                {['Commercial', 'Residential', ...new Set(masterSubCategories.map(s => s.name).filter(n => n !== 'Commercial' && n !== 'Residential'))].sort().map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic font-medium"> This label helps identify the configuration in the summary table below.</p>
          </div>


          {/* Available Steps */}
          <h4 className="text-md font-semibold mb-3">Available Project Steps</h4>
          <p className="text-gray-500 text-sm mb-4">
            Click on steps to select them for the current project type.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {allSteps.map((step, index) => (
              <div
                key={step._id || index}
                onClick={() => toggleStepSelection(step.name)}
                className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 relative group ${selectedSteps.includes(step.name)
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-50'
                  : 'border-gray-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4 transition-colors ${selectedSteps.includes(step.name) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-bold uppercase tracking-tight ${selectedSteps.includes(step.name) ? 'text-blue-900' : 'text-gray-700'}`}>
                      {step.name}
                    </h5>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {step.fields?.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[10px] bg-white bg-opacity-50 px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 font-medium">
                          {typeof f === 'object' ? f.name : f}
                        </span>
                      ))}
                      {(step.fields?.length || 0) > 2 && (
                        <span className="text-[10px] text-blue-500 font-bold">+{step.fields.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedSteps.includes(step.name) ? 'bg-blue-100 text-blue-600 scale-110' : 'text-gray-300 group-hover:text-blue-400 rotate-90 group-hover:rotate-0'}`}>
                    {selectedSteps.includes(step.name) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Step Flow Indicator */}
          <div className="flex items-center justify-center my-6">
            <ChevronDown className="w-4 h-4 text-blue-500 mx-2" />
            <span className="text-gray-500 text-sm">Drag steps below to change priority</span>
            <ChevronDown className="w-4 h-4 text-blue-500 mx-2" />
          </div>

          {/* Selected Steps */}
          <h4 className="text-md font-semibold mb-3">Selected Steps for this Project Type</h4>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 md:p-6 min-h-[200px]">
            {selectedSteps.length === 0 ? (
              <div className="text-center py-10">
                <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h5 className="text-lg font-medium text-gray-500 mb-2">No Steps Selected</h5>
                <p className="text-gray-400">Select steps from above to build your project workflow</p>
              </div>
            ) : (
              selectedSteps.map((step, index) => (
                <div
                  key={step}
                  draggable
                  onDragStart={(e) => handleDragStart(e, step)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, step)}
                  className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex items-center transition-all duration-300 hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="cursor-grab mr-3 text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-blue-600 w-8">{index + 1}</div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-800">{step}</h6>
                  </div>
                  <button
                    onClick={() => removeStep(step)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={addCustomStep}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Step
            </button>
            <button
              onClick={saveConfiguration}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Saved Configurations Inventory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
              <List className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Saved Workflow Inventory</h2>
              <p className="text-sm text-gray-500">Overview of all project-specific step configurations</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
            {allSavedConfigs.length} Active Rules
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b">Configuration Name</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Category</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b">Applied To</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">DISCOM</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Type</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b">Workflow Steps</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getGroupedConfigs().length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Cog className="w-16 h-16 mb-4 animate-[spin_10s_linear_infinite]" />
                      <p className="text-lg font-bold">No saved workflows found</p>
                      <p className="text-sm">Configurations will appear here once saved.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                getGroupedConfigs().map((cfg, idx) => {
                  const val = cfg.configValue || {};
                  const isMultiple = cfg.isMultiple;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-black text-gray-800 text-md truncate max-w-[200px]" title={cfg.configName}>
                          {cfg.configName}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          val.configCategory === 'Commercial' ? 'bg-blue-100 text-blue-700' : 
                          val.configCategory === 'Residential' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {val.configCategory || 'Mixed'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                          {isMultiple ? (
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block w-fit">
                              {cfg.appliedToLabels.length} Project Types
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {cfg.appliedToLabels[0].includes(' - ') ? cfg.appliedToLabels[0].split(' - ').slice(1).join(' - ') : cfg.appliedToLabels[0]}
                            </span>
                          )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-wrap justify-center gap-1 max-w-[150px] mx-auto">
                          {Array.isArray(val.currentDiscom) && val.currentDiscom.length > 0 ? (
                            val.currentDiscom.length > 1 ? (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold border border-gray-200" title={val.currentDiscom.join(', ')}>
                                {val.currentDiscom.length} DISCOMs
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold border border-gray-200">
                                {val.currentDiscom[0]}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs italic">Global</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {isMultiple ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Multiple
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Single
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {(cfg.selectedSteps || []).map((step, sIdx) => (
                            <span key={sIdx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-600 shadow-sm">
                              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] mr-1.5">{sIdx + 1}</span>
                              {step}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest ring-1 ring-green-200">
                          {cfg.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => editSavedConfig(cfg)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSavedConfigs(cfg.allKeys, cfg.configName)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Configuration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSetting;