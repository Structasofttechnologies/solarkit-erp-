import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, CheckCircle, Camera, ChevronUp, ChevronDown,
  X, Image as ImageIcon, Search, Edit, Eye, Trash2, Package
} from 'lucide-react';
import Select from 'react-select';
import { useLocations } from '../../../../hooks/useLocations';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getPartnerTypes, getPartnerPlans, getSolarKits, getSolarKitBOM } from '../../../../services/combokit/combokitApi';
import { getBrands, getSkus } from '../../../../services/settings/orderProcurementSettingApi';
import * as locationSvc from '../../../../services/core/locationApi';
import { locationAPI } from '../../../../api/api';

// Main Component
export default function AddComboKit() {
  const { countries, states, fetchCountries, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);

  // CP Type is now Role
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  const [selectedDistricts, setSelectedDistricts] = useState([]); // Array of IDs
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showRoleSection, setShowRoleSection] = useState(false);
  const [showPlanSection, setShowPlanSection] = useState(false);
  const [showDistrictSection, setShowDistrictSection] = useState(false);
  const [selectAllCountry, setSelectAllCountry] = useState(false);
  const [selectAllRole, setSelectAllRole] = useState(false);
  const [selectAllState, setSelectAllState] = useState(false);
  const [selectAllCluster, setSelectAllCluster] = useState(false);
  const [selectAllPlan, setSelectAllPlan] = useState(false);
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
  const [stateOptions, setStateOptions] = useState([]);
  const [clusterOptions, setClusterOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  // State for unified combo kit management
  const [modalMode, setModalMode] = useState('manage'); // 'edit-single' or 'manage'
  const [modalKits, setModalKits] = useState([]);
  const [activeKitIndex, setActiveKitIndex] = useState(0);
  const [isNewKitTab, setIsNewKitTab] = useState(false);

  // State for main combo kit form
  const [comboKitName, setComboKitName] = useState('');
  const [comboKitImage, setComboKitImage] = useState(null);
  const [solarPanelBrand, setSolarPanelBrand] = useState('');
  const [selectedPanelSkus, setSelectedPanelSkus] = useState([]);
  const [inverterBrand, setInverterBrand] = useState('');
  const [showPanelSkuSelect, setShowPanelSkuSelect] = useState(false);
  const [showInverterConfigBtn, setShowInverterConfigBtn] = useState(false);

  // State for BOM
  const [showBomSection, setShowBomSection] = useState(false);
  const [bomSections, setBomSections] = useState([]);

  // State for view combo kit
  const [viewingComboKit, setViewingComboKit] = useState(null);

  // Selection viewer modal
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionContent, setSelectionContent] = useState({ title: '', items: [], type: '', row: null });

  // Centralized Edit Modal
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState(null);

  const [partners, setPartners] = useState([]);

  const [allManufacturers, setAllManufacturers] = useState([]);
  const [availablePanelSkus, setAvailablePanelSkus] = useState([]);
  const [availableInverterSkus, setAvailableInverterSkus] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingSkus, setLoadingSkus] = useState(false);

  const [solarKits, setSolarKits] = useState([]);
  const [loadingSolarKits, setLoadingSolarKits] = useState(false);
  const [selectedSolarKitId, setSelectedSolarKitId] = useState('');

  // State for populating assignment data from SolarKit
  const [assignmentCategory, setAssignmentCategory] = useState('Solar Panel');
  const [assignmentSubCategory, setAssignmentSubCategory] = useState('Residential');
  const [assignmentProjectType, setAssignmentProjectType] = useState('1kW - 10kW');
  const [assignmentSubProjectType, setAssignmentSubProjectType] = useState('On Grid');

  // Initial Data
  useEffect(() => {
    fetchCountries();
    fetchPartners();
    loadAssignments();
    fetchInitialBrands();
    fetchSolarKits();
  }, []);

  const fetchSolarKits = async () => {
    try {
      setLoadingSolarKits(true);
      const data = await getSolarKits();
      setSolarKits(data || []);
    } catch (err) {
      console.error("Error fetching solarkits", err);
    } finally {
      setLoadingSolarKits(false);
    }
  };

  const fetchInitialBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await getBrands();
      setAllManufacturers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error fetching brands", err);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await getPartnerTypes();
      setPartners(data || []);
    } catch (err) {
      console.error("Error fetching partners", err);
    }
  };

  // When countries load, don't auto-fetch states for India if we want user to select
  useEffect(() => {
    if (countries.length > 0 && selectedCountries.length === 0) {
      // Optional: Auto-select India if available
      const india = countries.find(c => c.name === 'India');
      if (india) {
        setSelectedCountries([india._id]);
        setSelectedCountryName(india.name);
        handleCountrySelect(india._id, india.name, true);
      }
    }
  }, [countries]);

  // Fetch clusters when selected states change
  useEffect(() => {
    if (selectedStates.length > 0) {
      fetchClustersForStates(selectedStates);
    } else {
      setClusterOptions([]);
      setSelectedClusters([]);
    }
  }, [selectedStates]);

  // Fetch districts when selected clusters change
  useEffect(() => {
    if (selectedClusters.length > 0) {
      fetchDistrictsForClusters(selectedClusters);
    } else {
      setDistrictOptions([]);
      setSelectedDistricts([]);
    }
  }, [selectedClusters]);

  const loadAssignments = async () => {
    try {
      const data = await getAssignments();
      setProjectRows(data.map(item => ({
        ...item,
        id: item._id,
        countryId: item.country?._id || item.country,
        stateId: item.state?._id || item.state,
        state: item.state?.name || 'Unknown',
        clusterIds: item.clusters ? item.clusters.map(c => typeof c === 'object' ? c._id : c) : (item.cluster?._id || item.cluster ? [item.cluster?._id || item.cluster] : []),
        clusters: item.clusters ? item.clusters.map(c => typeof c === 'object' ? c.name : c) : (item.cluster?.name ? [item.cluster?.name] : []),
        roles: item.roles || (item.role ? [item.role] : []),
        districts: item.districts ? item.districts.map(d => typeof d === 'object' ? d.name : d) : [],
        districtIds: item.districts ? item.districts.map(d => typeof d === 'object' ? d._id : d) : [],
        solarkitName: item.solarkitName || ''
      })));
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!projectRows || projectRows.length === 0) return [];

    // If no selections are made, return everything as requested
    if (selectedCountries.length === 0 &&
      selectedStates.length === 0 &&
      selectedClusters.length === 0 &&
      selectedDistricts.length === 0 &&
      selectedRoles.length === 0 &&
      selectedPlans.length === 0) {
      return projectRows;
    }

    return projectRows.filter(row => {
      // Apply location filters
      if (selectedCountries.length > 0) {
        if (row.countryId && !selectedCountries.some(id => String(id) === String(row.countryId))) return false;
      }
      if (selectedStates.length > 0) {
        if (row.stateId && !selectedStates.some(id => String(id) === String(row.stateId))) return false;
      }
      if (selectedClusters.length > 0) {
        const rowCIds = (row.clusterIds || []).map(c => String(c));
        if (!selectedClusters.some(id => rowCIds.includes(String(id)))) return false;
      }
      if (selectedDistricts.length > 0) {
        const rowDIds = (row.districtIds || []).map(d => String(d));
        if (!selectedDistricts.some(id => rowDIds.includes(String(id)))) return false;
      }

      // Apply partner filters
      if (selectedRoles.length > 0) {
        const rowRoles = (row.roles || []).map(r => String(r).toLowerCase());
        if (!selectedRoles.some(role => rowRoles.includes(String(role).toLowerCase()))) return false;
      }

      if (selectedPlans.length > 0) {
        const rowPlans = (row.cpTypes || []).map(p => String(p).toLowerCase());
        const hasSelectedPlan = selectedPlans.some(p => rowPlans.includes(String(p).toLowerCase()));
        if (!hasSelectedPlan) return false;
      }

      return true;
    });
  }, [projectRows, selectedCountries, selectedStates, selectedClusters, selectedDistricts, selectedRoles, selectedPlans]);

  const renderLiveCount = (configs, kits, type, isSelected) => {
    if (configs === 0 && kits === 0) return null;

    // Choose color classes based on the card type
    let colorClass = 'text-blue-600';
    let selectedColorClass = 'text-blue-100';

    if (type === 'cluster') { colorClass = 'text-purple-600'; selectedColorClass = 'text-purple-100'; }
    else if (type === 'district') { colorClass = 'text-cyan-600'; selectedColorClass = 'text-cyan-100'; }
    else if (type === 'plan') { colorClass = 'text-green-600'; selectedColorClass = 'text-green-100'; }

    return (
      <div className={`mt-1 flex flex-col items-center gap-0 leading-tight ${isSelected ? selectedColorClass : colorClass}`}>
        <p className="text-[10px] font-black uppercase tracking-tighter">
          {configs} {configs === 1 ? 'Config' : 'Configs'}
        </p>
        {kits > 0 && (
          <p className="text-[9px] font-bold opacity-80 italic">
            {kits} {kits === 1 ? 'Kit' : 'Kits'}
          </p>
        )}
      </div>
    );
  };

  const getItemKitCount = (type, value) => {
    if (!projectRows || projectRows.length === 0) return { configs: 0, kits: 0 };

    // Normalize value for comparison
    const targetValue = value ? String(value).toLowerCase().trim() : '';
    if (!targetValue) return { configs: 0, kits: 0 };

    const matchingRows = projectRows.filter(row => {
      // 1. Level Filter: Match the actual item we are counting
      let isLevelMatch = false;
      if (type === 'country') {
        isLevelMatch = String(row.countryId) === targetValue;
      } else if (type === 'state') {
        isLevelMatch = String(row.stateId) === targetValue || String(row.state).toLowerCase().trim() === targetValue;
      } else if (type === 'cluster') {
        const rowC = (row.clusters || []).map(c => String(c).toLowerCase().trim());
        const rowCIds = (row.clusterIds || []).map(c => String(c).toLowerCase().trim());
        isLevelMatch = rowC.includes(targetValue) || rowCIds.includes(targetValue);
      } else if (type === 'district') {
        const rowD = (row.districts || []).map(d => String(d).toLowerCase().trim());
        const rowDIds = (row.districtIds || []).map(d => String(d).toLowerCase().trim());
        isLevelMatch = rowD.includes(targetValue) || rowDIds.includes(targetValue);
      } else if (type === 'role') {
        const rowRoles = (row.roles || []).map(r => String(r).toLowerCase().trim());
        isLevelMatch = rowRoles.includes(targetValue);
      } else if (type === 'plan') {
        const rowPlans = (row.cpTypes || []).map(p => String(p).toLowerCase().trim());
        isLevelMatch = rowPlans.includes(targetValue);
      }

      if (!isLevelMatch) return false;

      // 2. Hierarchy Filters (ONLY apply if row has the mapping data)
      if (type !== 'country' && selectedCountries.length > 0) {
        if (row.countryId) {
          const countryMatch = selectedCountries.some(id => String(id) === String(row.countryId));
          if (!countryMatch) return false;
        }
      }

      if (['cluster', 'district', 'role', 'plan'].includes(type) && selectedStates.length > 0) {
        if (row.stateId) {
          const stateMatch = selectedStates.some(id => String(id) === String(row.stateId));
          if (!stateMatch) return false;
        }
      }

      if (['cluster', 'district', 'role', 'plan'].includes(type) && selectedClusters.length > 0) {
        if (row.clusterIds && row.clusterIds.length > 0) {
          const clusterMatch = selectedClusters.some(id => row.clusterIds.includes(String(id)));
          if (!clusterMatch) return false;
        }
      }

      return true;
    });

    return {
      configs: matchingRows.length,
      kits: matchingRows.reduce((sum, row) => sum + (row.comboKits?.length || 0), 0)
    };
  };

  const handleCountrySelect = (countryId, countryName, isAuto = false) => {
    let newSelected = [];
    if (selectedCountries.includes(countryId)) {
      newSelected = selectedCountries.filter(id => id !== countryId);
    } else {
      newSelected = [...selectedCountries, countryId];
    }

    setSelectedCountries(newSelected);
    if (newSelected.length === 1) {
      const c = countries.find(x => x._id === newSelected[0]);
      setSelectedCountryName(c?.name || '');
    } else if (newSelected.length > 1) {
      setSelectedCountryName(`${newSelected.length} Countries`);
    } else {
      setSelectedCountryName('');
    }

    fetchStatesForCountries(newSelected);

    // Reset all following
    setSelectedStates([]);
    setSelectedClusters([]);
    setShowProjectForm(false);
    setShowDistrictSection(false);
    setShowRoleSection(false);
    setShowPlanSection(false);
    setSelectedRoles([]); // Reset roles
    setClusterOptions([]);
    setDistrictOptions([]);
  };

  const handleSelectAllCountries = () => {
    if (selectAllCountry) {
      setSelectedCountries([]);
      setSelectedCountryName('');
      setStateOptions([]);
    } else {
      const allIds = countries.map(c => c._id);
      setSelectedCountries(allIds);
      setSelectedCountryName('All Countries');
      fetchStatesForCountries(allIds);
    }
    setSelectAllCountry(!selectAllCountry);
  };

  const fetchStatesForCountries = async (countryIds) => {
    try {
      const allStates = [];
      for (const id of countryIds) {
        const data = await locationSvc.getStates(id);
        allStates.push(...(data || []));
      }
      // Unique states
      const uniqueStates = Array.from(new Map(allStates.map(s => [s._id, s])).values());
      setStateOptions(uniqueStates);
    } catch (e) {
      console.error("Error fetching states", e);
      setStateOptions([]);
    }
  };

  const handleStateSelect = (stateId) => {
    setShowProjectForm(true);
    if (selectedStates.includes(stateId)) {
      setSelectedStates(selectedStates.filter(id => id !== stateId));
    } else {
      setSelectedStates([...selectedStates, stateId]);
    }

    // Reset following
    setSelectedClusters([]);
    setDistrictOptions([]);
    setSelectedDistricts([]);
    setShowDistrictSection(false);
    setShowRoleSection(false);
    setShowPlanSection(false);
    setSelectedRoles([]);
  };

  const handleSelectAllStates = () => {
    if (selectAllState) {
      setSelectedStates([]);
    } else {
      setSelectedStates(stateOptions.map(s => s._id));
    }
    setSelectAllState(!selectAllState);
    setShowProjectForm(!selectAllState);
  };

  const fetchClustersForStates = async (stateIds) => {
    try {
      const allRes = await Promise.all(stateIds.map(id =>
        locationAPI.getAllClusters({ stateId: id, isActive: 'true' })
      ));
      const allClusters = allRes.flatMap(res => res.data?.data || []);
      // Deduplicate by _id
      const uniqueClusters = Array.from(new Map(allClusters.map(c => [c._id, c])).values());
      setClusterOptions(uniqueClusters);
    } catch (e) {
      console.error("Error fetching clusters", e);
      setClusterOptions([]);
    }
  };

  const handleClusterSelect = (clusterId) => {
    if (selectedClusters.includes(clusterId)) {
      setSelectedClusters(selectedClusters.filter(id => id !== clusterId));
    } else {
      setSelectedClusters([...selectedClusters, clusterId]);
    }
    setShowDistrictSection(true);
    setShowRoleSection(false);

    // Reset selections
    setSelectedDistricts([]);
    setSelectedRoles([]);
    setSelectedPlans([]);
    setShowPlanSection(false);
    setSelectAllPlan(false);
    setSelectAllDistrict(false);
  };

  const handleSelectAllClusters = () => {
    if (selectAllCluster) {
      setSelectedClusters([]);
    } else {
      setSelectedClusters(clusterOptions.map(c => c._id));
    }
    setSelectAllCluster(!selectAllCluster);
    setShowDistrictSection(!selectAllCluster);
    setShowRoleSection(false);
  };

  const fetchDistrictsForClusters = async (clusterIds) => {
    try {
      const allDistricts = [];
      for (const id of clusterIds) {
        const clusterDistricts = await locationSvc.getDistrictsHierarchy(id);
        // Attach clusterId to each district for later mapping in handleAddProject
        allDistricts.push(...(clusterDistricts || []).map(d => ({ ...d, clusterId: id })));
      }

      // Deduplicate by _id
      const uniqueDistricts = Array.from(new Map(allDistricts.map(d => [d._id, d])).values());
      setDistrictOptions(uniqueDistricts);
    } catch (e) {
      console.error("Error fetching districts", e);
      setDistrictOptions([]);
    }
  };

  const handleRoleSelect = async (roleName) => {
    let newRoles = [];
    if (selectedRoles.includes(roleName)) {
      newRoles = selectedRoles.filter(r => r !== roleName);
    } else {
      newRoles = [...selectedRoles, roleName];
    }

    setSelectedRoles(newRoles);
    setSelectedPlans([]);
    setSelectAllPlan(false);

    if (newRoles.length > 0) {
      fetchPlansForRoles(newRoles);
    } else {
      setAvailablePlans([]);
      setShowPlanSection(false);
    }
  };

  const handleSelectAllRoles = () => {
    if (selectAllRole) {
      setSelectedRoles([]);
      setAvailablePlans([]);
      setShowPlanSection(false);
    } else {
      const allRoles = partners.map(p => p.name);
      setSelectedRoles(allRoles);
      fetchPlansForRoles(allRoles);
    }
    setSelectAllRole(!selectAllRole);
  };

  const fetchPlansForRoles = async (roleNames) => {
    try {
      const stateId = selectedStates.length > 0 ? selectedStates[0] : null;
      const allPlans = [];
      for (const role of roleNames) {
        const plans = await getPartnerPlans(role, stateId);
        allPlans.push(...(plans || []));
      }
      // Unique plans by name
      const uniquePlans = Array.from(new Map(allPlans.map(p => [p.name || p._id, p])).values());
      setAvailablePlans(uniquePlans);
      setShowPlanSection(true);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setAvailablePlans([]);
      setShowPlanSection(true);
    }
  };

  const handlePlanSelect = (planName) => {
    if (selectedPlans.includes(planName)) {
      setSelectedPlans(selectedPlans.filter(p => p !== planName));
    } else {
      setSelectedPlans([...selectedPlans, planName]);
    }
  };

  const handleSelectAllPlan = () => {
    if (selectAllPlan) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(availablePlans.map(p => p.name));
    }
    setSelectAllPlan(!selectAllPlan);
  };

  const handleDistrictSelect = (districtId) => {
    if (selectedDistricts.includes(districtId)) {
      const newSelected = selectedDistricts.filter(id => id !== districtId);
      setSelectedDistricts(newSelected);
      setShowRoleSection(newSelected.length > 0);
    } else {
      const newSelected = [...selectedDistricts, districtId];
      setSelectedDistricts(newSelected);
      setShowRoleSection(true);
    }
  };

  const handleSelectAllDistrict = () => {
    if (selectAllDistrict) {
      setSelectedDistricts([]);
      setShowRoleSection(false);
    } else {
      setSelectedDistricts(districtOptions.map(d => d._id));
      setShowRoleSection(true);
    }
    setSelectAllDistrict(!selectAllDistrict);
  };

  const handleAddProject = async () => {
    if (selectedStates.length === 0) {
      alert('Please select at least one State');
      return;
    }
    if (selectedClusters.length === 0) {
      alert('Please select at least one cluster');
      return;
    }
    if (selectedDistricts.length === 0) {
      alert('Please select at least one District');
      return;
    }
    if (selectedRoles.length === 0) {
      alert('Please select at least one Role (Partner)');
      return;
    }
    if (selectedPlans.length === 0) {
      alert('Please select at least one Plan');
      return;
    }

    try {
      const results = [];
      // Loop through each selected state to create exactly one card per state
      for (const stateId of selectedStates) {
        const stateObj = stateOptions.find(s => s._id === stateId);

        // Find clusters that belong to this state AND are selected
        const stateClusters = clusterOptions
          .filter(c => (c.state?._id === stateId || c.state === stateId))
          .filter(c => selectedClusters.includes(c._id));

        if (stateClusters.length === 0) continue;

        const stateClusterIds = stateClusters.map(c => c._id);

        // Find districts that belong to these clusters AND are selected
        const stateDistricts = districtOptions
          .filter(d => stateClusterIds.includes(d.clusterId))
          .filter(d => selectedDistricts.includes(d._id));

        if (stateDistricts.length === 0) continue;

        const payload = {
          state: stateId,
          clusters: stateClusterIds,
          cpTypes: [...selectedPlans],
          roles: [...selectedRoles],
          districts: stateDistricts.map(d => d._id),
          status: 'Inactive',
          comboKits: [],
          solarkitName: solarKits.find(k => k._id === selectedSolarKitId)?.name || '',
          category: assignmentCategory,
          subCategory: assignmentSubCategory,
          projectType: assignmentProjectType,
          subProjectType: assignmentSubProjectType
        };

        const newAssignment = await createAssignment(payload);
        const newRow = {
          ...newAssignment,
          id: newAssignment._id,
          state: stateObj?.name || 'Unknown',
          stateId: stateId,
          clusters: stateClusters.map(c => c.name),
          clusterIds: newAssignment.clusters,
          roles: newAssignment.roles,
          cpTypes: newAssignment.cpTypes,
          districts: stateDistricts.map(d => d.name),
          districtIds: newAssignment.districts
        };
        results.push(newRow);
      }

      if (results.length > 0) {
        setProjectRows([...projectRows, ...results]);
        alert(`${results.length} State-level Project(s) added successfully!`);
      } else {
        alert('No combinations found for the selected locations.');
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert('Failed to create projects');
    }
  };

  const handleAddComboKit = async (rowId, isEditSingle = false, kitIdx = 0) => {
    setCurrentRowId(rowId);
    setModalMode(isEditSingle ? 'edit-single' : 'manage');

    const row = projectRows.find(r => r.id === rowId);
    const existingKits = row ? [...row.comboKits] : [];

    // Initialize assignment-level data from the row
    if (row) {
      setAssignmentCategory(row.category || 'Solar Panel');
      setAssignmentSubCategory(row.subCategory || 'Residential');
      setAssignmentProjectType(row.projectType || '1kW - 10kW');
      setAssignmentSubProjectType(row.subProjectType || 'On Grid');
    }

    setModalKits(existingKits);

    if (isEditSingle) {
      setActiveKitIndex(kitIdx);
      setIsNewKitTab(false);
      await loadKitIntoForm(existingKits[kitIdx], rowId);
    } else {
      // Always open the "New Kit" (+) tab by default for standard "Add" click
      setIsNewKitTab(true);
      resetComboKitForm();

      // Fetch and load SolarKit BOM for the new kit
      if (row && row.solarkitName) {
        const kitModel = solarKits.find(k => k.name === row.solarkitName);
        if (kitModel && kitModel._id) {
          try {
            const bomData = await getSolarKitBOM(kitModel._id);
            if (bomData && bomData.bom) {
              const mappedBom = bomData.bom.map(section => ({
                ...section,
                items: section.items?.map(item => ({
                  ...item,
                  itemType: item.itemType || item.type || ''
                })) || []
              }));
              setBomSections(mappedBom);
              setShowBomSection(true);
            }
          } catch (err) {
            console.error("Error loading SolarKit BOM:", err);
          }
        }
      }
    }

    setShowComboKitModal(true);
  };

  const loadKitIntoForm = async (kit, projectRowId = null) => {
    if (!kit) {
      resetComboKitForm();
      return;
    }
    setComboKitName(kit.name || '');
    setComboKitImage(kit.image || null);
    setSolarPanelBrand(kit.panelBrand || '');
    setInverterBrand(kit.inverterBrand || '');

    // BOM Show/Fetch Logic
    if (kit.bomSections && kit.bomSections.length > 0) {
      setBomSections(kit.bomSections);
      setShowBomSection(true);
    } else {
      // If kit has no internal BOM, check if the project has a Solarkit name to pull from
      const pid = projectRowId || currentRowId;
      const row = projectRows.find(r => r.id === pid);
      if (row && row.solarkitName) {
        const kitModel = solarKits.find(k => k.name === row.solarkitName);
        if (kitModel && kitModel._id) {
          try {
            const bomData = await getSolarKitBOM(kitModel._id);
            if (bomData && bomData.bom) {
              const mappedBom = bomData.bom.map(section => ({
                ...section,
                items: section.items?.map(item => ({
                  ...item,
                  itemType: item.itemType || item.type || ''
                })) || []
              }));
              setBomSections(mappedBom);
            } else {
              setBomSections([]);
            }
          } catch (err) {
            console.error("Error loading SolarKit BOM for existing kit:", err);
            setBomSections([]);
          }
        } else {
          setBomSections([]);
        }
      } else {
        setBomSections([]);
      }
      setShowBomSection(true); // Always show BOM editor as requested for already created
    }

    if (kit.panelBrand) {
      await handleSolarPanelBrandChange(kit.panelBrand, false);
      setSelectedPanelSkus(kit.panelSkus || []);
    } else {
      setSelectedPanelSkus([]);
      setShowPanelSkuSelect(false);
    }

    if (kit.inverterBrand) {
      setShowInverterConfigBtn(true);
    } else {
      setShowInverterConfigBtn(false);
    }
  };

  const switchTab = async (newIdx, isNew = false) => {
    // 1. Save current state into modalKits[activeKitIndex]
    const currentKitData = {
      name: comboKitName,
      image: comboKitImage,
      panelBrand: solarPanelBrand,
      panelSkus: selectedPanelSkus,
      inverterBrand: inverterBrand,
      bomSections: bomSections
    };

    let updatedKits = [...modalKits];
    if (!isNewKitTab) {
      updatedKits[activeKitIndex] = currentKitData;
    }

    setModalKits(updatedKits);

    // 2. Load the new tab
    if (isNew) {
      setIsNewKitTab(true);
      setActiveKitIndex(updatedKits.length);
      resetComboKitForm();

      // Fetch and load SolarKit BOM for the new kit tab
      const currentRow = projectRows.find(r => r.id === currentRowId);
      if (currentRow && currentRow.solarkitName) {
        const kitModel = solarKits.find(k => k.name === currentRow.solarkitName);
        if (kitModel && kitModel._id) {
          try {
            const bomData = await getSolarKitBOM(kitModel._id);
            if (bomData && bomData.bom) {
              const mappedBom = bomData.bom.map(section => ({
                ...section,
                items: section.items?.map(item => ({
                  ...item,
                  itemType: item.itemType || item.type || ''
                })) || []
              }));
              setBomSections(mappedBom);
              setShowBomSection(true);
            }
          } catch (err) {
            console.error("Error loading SolarKit BOM for tab:", err);
          }
        }
      }
    } else {
      setIsNewKitTab(false);
      setActiveKitIndex(newIdx);
      await loadKitIntoForm(updatedKits[newIdx], currentRowId);
    }
  };

  const handleSaveComboKits = async (e) => {
    e.preventDefault();

    const currentRow = projectRows.find(r => r.id === currentRowId);
    if (!currentRow) return;

    const currentKitData = {
      name: comboKitName,
      image: comboKitImage,
      panelBrand: solarPanelBrand,
      panelSkus: selectedPanelSkus,
      inverterBrand: inverterBrand,
      bomSections: bomSections
    };

    let updatedComboKits = [...modalKits];

    if (modalMode === 'edit-single') {
      updatedComboKits[activeKitIndex] = currentKitData;
    } else {
      if (isNewKitTab) {
        updatedComboKits.push(currentKitData);
      } else {
        updatedComboKits[activeKitIndex] = currentKitData;
      }
    }

    try {
      const updatedAssignment = await updateAssignment(currentRowId, {
        comboKits: updatedComboKits,
        category: assignmentCategory,
        subCategory: assignmentSubCategory,
        projectType: assignmentProjectType,
        subProjectType: assignmentSubProjectType
      });

      const updatedRows = projectRows.map(row => {
        if (row.id === currentRowId) {
          return {
            ...row,
            comboKits: updatedAssignment.comboKits,
            category: updatedAssignment.category,
            subCategory: updatedAssignment.subCategory,
            projectType: updatedAssignment.projectType,
            subProjectType: updatedAssignment.subProjectType
          };
        }
        return row;
      });

      setProjectRows(updatedRows);
      setShowComboKitModal(false);
      alert(modalMode === 'edit-single' ? 'ComboKit updated successfully!' : 'ComboKits updated successfully!');
    } catch (err) {
      console.error("Error saving combo kits", err);
      alert("Failed to save. Please try again.");
    }
  };

  const handleStatusToggle = async (rowId) => {
    const row = projectRows.find(r => r.id === rowId);
    if (!row) return;

    const newStatus = row.status === 'Active' ? 'Inactive' : 'Active';

    try {
      await updateAssignment(rowId, { status: newStatus });

      const updatedRows = projectRows.map(r => {
        if (r.id === rowId) {
          return { ...r, status: newStatus };
        }
        return r;
      });
      setProjectRows(updatedRows);
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Failed to update status');
    }
  };

  const handleDeleteAssignment = async (rowId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAssignment(rowId);
      setProjectRows(projectRows.filter(r => r.id !== rowId));
      alert('Assignment deleted successfully');
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert('Failed to delete assignment');
    }
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

  const handleSolarPanelBrandChange = async (brandName, shouldResetSkus = true) => {
    setSolarPanelBrand(brandName);
    const manufacturer = allManufacturers.find(m => (m.brand || m.companyName || m.name) === brandName);
    const brandId = manufacturer?._id;

    if (!brandName || !brandId) {
      setAvailablePanelSkus([]);
      if (shouldResetSkus) setSelectedPanelSkus([]);
      setShowPanelSkuSelect(false);
      return;
    }

    try {
      setLoadingSkus(true);
      const res = await getSkus({ brand: brandId });
      setAvailablePanelSkus(res.data || []);
      if (shouldResetSkus) setSelectedPanelSkus([]);
      setShowPanelSkuSelect(true);
    } catch (err) {
      console.error("Error fetching panel skus", err);
    } finally {
      setLoadingSkus(false);
    }
  };

  const handleInverterBrandChange = async (brandName) => {
    setInverterBrand(brandName);
    const manufacturer = allManufacturers.find(m => (m.brand || m.companyName || m.name) === brandName);
    const brandId = manufacturer?._id;

    if (!brandName || !brandId) {
      setAvailableInverterSkus([]);
      setShowInverterConfigBtn(false);
      return;
    }

    try {
      setLoadingSkus(true);
      const res = await getSkus({ brand: brandId });
      setAvailableInverterSkus(res.data || []);
      setShowInverterConfigBtn(true);
    } catch (err) {
      console.error("Error fetching inverter skus", err);
    } finally {
      setLoadingSkus(false);
    }
  };

  const handleViewProjectCombokits = (rowId) => {
    setCurrentRowId(rowId);
    setShowProjectCombokitsModal(true);
  };

  const handleViewCombokitDetails = (comboKit) => {
    setViewingComboKit(comboKit);
    setShowViewCombokitModal(true);
  };

  const openSelectionModal = (title, items, type, row) => {
    setSelectionContent({ title, items: items || [], type, row });
    setShowSelectionModal(true);
  };

  const handleEditAssignment = async (row) => {
    // Fetch dependencies so the lists are populated in the modal
    if (row.stateId) {
      try {
        const clusters = await fetchClusters(row.stateId);
        if (clusters && Array.isArray(clusters)) {
          setClusterOptions(prev => {
            const existingIds = prev.map(c => c._id);
            const newOnes = clusters.filter(c => !existingIds.includes(c._id));
            return [...prev, ...newOnes];
          });
        }

        if (row.clusterIds && row.clusterIds.length > 0) {
          // Fetch districts for ALL selected clusters and ensure they have clusterId attached
          const districtPromises = row.clusterIds.map(id =>
            fetchDistricts({ clusterId: id }).then(ds =>
              (ds || []).map(d => ({ ...d, clusterId: id }))
            )
          );
          const districtResults = await Promise.all(districtPromises);
          const allDistricts = districtResults.flat();

          if (allDistricts && Array.isArray(allDistricts)) {
            setDistrictOptions(prev => {
              const existingIds = prev.map(d => d._id);
              const newOnes = allDistricts.filter(d => !existingIds.includes(d._id));
              return [...prev, ...newOnes];
            });
          }
        }
        if (row.roles && row.roles.length > 0) {
          try {
            const plans = await getPartnerPlans(row.roles[0], row.stateId);
            setAvailablePlans(plans || []);
          } catch (err) {
            console.error("Error fetching plans for edit:", err);
          }
        }
      } catch (e) {
        console.error("Error fetching dependencies for edit:", e);
      }
    }

    setEditingProjectData({
      id: row.id,
      stateId: row.stateId,
      clusterIds: row.clusterIds || [],
      clusterNames: row.clusters || [],
      districtIds: row.districtIds || [],
      districtNames: row.districts || [],
      roles: row.roles || [],
      cpTypes: row.cpTypes || [],
      status: row.status,
      category: row.category,
      subCategory: row.subCategory,
      projectType: row.projectType,
      subProjectType: row.subProjectType,
      solarkitName: row.solarkitName || ''
    });
    setShowEditProjectModal(true);
  };

  const handleUpdateAssignment = async (updatedData) => {
    try {
      const payload = {
        state: updatedData.stateId,
        clusters: updatedData.clusterIds,
        districts: updatedData.districtIds,
        roles: updatedData.roles,
        cpTypes: updatedData.cpTypes,
        status: updatedData.status,
        category: updatedData.category,
        subCategory: updatedData.subCategory,
        projectType: updatedData.projectType,
        subProjectType: updatedData.subProjectType,
        solarkitName: updatedData.solarkitName
      };

      const updated = await updateAssignment(updatedData.id, payload);

      // Update local state
      setProjectRows(prev => prev.map(row => {
        if (row.id === updatedData.id) {
          const stateObj = stateOptions.find(s => s._id === updatedData.stateId);
          const clustersObj = clusterOptions.filter(c => updatedData.clusterIds.includes(c._id));
          const districtsObj = districtOptions.filter(d => updatedData.districtIds.includes(d._id));

          return {
            ...row,
            ...updated,
            state: stateObj?.name || row.state,
            stateId: updatedData.stateId,
            clusters: clustersObj.map(c => c.name),
            clusterIds: updatedData.clusterIds,
            districts: districtsObj.map(d => d.name),
            districtIds: updatedData.districtIds,
            roles: updated.roles,
            cpTypes: updated.cpTypes,
            solarkitName: updated.solarkitName
          };
        }
        return row;
      }));

      setShowEditProjectModal(false);
      alert('Assignment updated successfully!');
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert('Failed to update assignment');
    }
  };

  const resetComboKitForm = () => {
    setComboKitName('');
    setComboKitImage(null);
    setSolarPanelBrand('');
    setSelectedPanelSkus([]);
    setInverterBrand('');
    setBomSections([]);
    setShowBomSection(false);
    setIsEditMode(false);
    setEditingRowId(null);
    setActiveTab('create');
  };

  // BOM Helper Functions
  const addBomSection = () => {
    setBomSections([...bomSections, {
      bosKitName: '',
      kitType: 'Combokit',
      kitCategory: '',
      items: [{ name: '', itemType: '', qty: '', unit: '', price: 0 }]
    }]);
  };

  const removeBomSection = (index) => {
    const newData = bomSections.filter((_, i) => i !== index);
    setBomSections(newData);
  };

  const updateBomSection = (index, field, value) => {
    const newData = [...bomSections];
    newData[index][field] = value;
    setBomSections(newData);
  };

  const addBomItem = (sectionIndex) => {
    const newData = [...bomSections];
    newData[sectionIndex].items.push({ name: '', itemType: '', qty: '', unit: '', price: 0 });
    setBomSections(newData);
  };

  const removeBomItem = (sectionIndex, itemIndex) => {
    const newData = [...bomSections];
    newData[sectionIndex].items = newData[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setBomSections(newData);
  };

  const updateBomItem = (sectionIndex, itemIndex, field, value) => {
    const newData = [...bomSections];
    newData[sectionIndex].items[itemIndex][field] = value;
    setBomSections(newData);
  };

  // Render cluster cards
  const renderClusterCards = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <label className="flex items-center cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={selectAllCluster}
            onChange={handleSelectAllClusters}
            className="mr-2"
          />
          <span className="font-semibold">Select All Clusters</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          {clusterOptions.length === 0 ? <p className="text-gray-500 col-span-4">No clusters found for selected states.</p> :
            clusterOptions.map(cluster => {
              const { configs, kits } = getItemKitCount('cluster', cluster._id);
              const isSelected = selectedClusters.includes(cluster._id);
              return (
                <div
                  key={cluster._id}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:scale-[1.02] min-h-[5rem] flex flex-col justify-center items-center h-20 ${isSelected
                    ? 'bg-purple-700 text-white border-purple-800 shadow-md'
                    : 'bg-white border-gray-300 hover:border-blue-500 hover:shadow-sm'
                    }`}
                  onClick={() => handleClusterSelect(cluster._id)}
                >
                  <div className="font-bold text-sm tracking-tight">{cluster.name}</div>
                  {renderLiveCount(configs, kits, 'cluster', isSelected)}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderRoleCards = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h5 className="text-lg font-semibold text-gray-700 mb-4">Select Partner</h5>
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllRole}
              onChange={handleSelectAllRoles}
              className="mr-2"
            />
            <span className="font-semibold">Select All</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {partners.map(p => {
            const { configs, kits } = getItemKitCount('role', p.name);
            const isSelected = selectedRoles.includes(p.name);
            return (
              <div
                key={p._id}
                className={`border rounded-lg p-3 text-center cursor-pointer transition-all min-h-[5rem] flex flex-col justify-center items-center h-20 ${isSelected
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                  : 'bg-white border-gray-300 hover:border-blue-500 hover:shadow-sm'
                  }`}
                onClick={() => handleRoleSelect(p.name)}
              >
                <div className="font-bold text-sm tracking-tight">{p.name}</div>
                {renderLiveCount(configs, kits, 'role', isSelected)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlanCards = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h5 className="text-lg font-semibold text-gray-700 mb-4">
          Select Plans {selectedRoles.length > 0 ? `for ${selectedRoles.join(', ')}` : ''}
        </h5>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllPlan}
              onChange={handleSelectAllPlan}
              className="mr-2"
            />
            <span className="font-semibold">Select All Plans</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {availablePlans.length === 0 ? <p className="text-gray-500 col-span-4">No active plans found.</p> :
            availablePlans.map(plan => {
              const { configs, kits } = getItemKitCount('plan', plan.name);
              const isSelected = selectedPlans.includes(plan.name);
              return (
                <div
                  key={plan._id}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all min-h-[5.5rem] flex flex-col justify-center items-center h-22 ${isSelected
                    ? 'bg-green-600 text-white border-green-700 shadow-md'
                    : 'bg-white border-gray-300 hover:border-green-500 hover:shadow-sm'
                    }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  <div className="font-bold text-sm tracking-tight">{plan.name}</div>
                  {renderLiveCount(configs, kits, 'plan', isSelected)}
                </div>
              );
            })}
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
            districtOptions.map(district => {
              const { configs, kits } = getItemKitCount('district', district.name);
              const isSelected = selectedDistricts.includes(district._id);
              return (
                <div
                  key={district._id}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all min-h-[5rem] flex flex-col justify-center items-center h-20 ${isSelected
                    ? 'bg-cyan-600 text-white border-cyan-700 shadow-md'
                    : 'bg-white border-gray-300 hover:border-cyan-500 hover:shadow-sm'
                    }`}
                  onClick={() => handleDistrictSelect(district._id)}
                >
                  <div className="font-bold text-sm tracking-tight">{district.name}</div>
                  {renderLiveCount(configs, kits, 'district', isSelected)}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Render SolarKit Selection for main creation flow
  const renderSolarKitSelection = () => {
    return (
      <div className="bg-gray-50 border border-indigo-200 rounded-lg p-6 mb-8 shadow-sm">
        <h5 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          Select Project Type (SolarKit)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">SolarKit Base</label>
            <Select
              options={solarKits.map(kit => ({ value: kit._id, label: kit.name, data: kit }))}
              value={solarKits.find(k => k._id === selectedSolarKitId) ? { value: selectedSolarKitId, label: solarKits.find(k => k._id === selectedSolarKitId).name } : null}
              onChange={(selected) => {
                setSelectedSolarKitId(selected?.value || '');
                if (selected?.data) {
                  const kitData = selected.data;
                  setAssignmentCategory(kitData.category || 'Solar Panel');
                  setAssignmentSubCategory(kitData.subCategory || 'Residential');
                  setAssignmentProjectType(kitData.projectType || '1kW - 10kW');
                  setAssignmentSubProjectType(kitData.subProjectType || 'On Grid');
                }
              }}
              placeholder="Select SolarKit..."
              isLoading={loadingSolarKits}
              classNamePrefix="react-select"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-indigo-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Category</label>
              <p className="font-bold text-indigo-900 text-sm">{assignmentCategory}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Sub Category</label>
              <p className="font-bold text-indigo-900 text-sm">{assignmentSubCategory}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Project Type</label>
              <p className="font-bold text-indigo-900 text-sm">{assignmentProjectType}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Sub Project Type</label>
              <p className="font-bold text-indigo-900 text-sm">{assignmentSubProjectType}</p>
            </div>
          </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SolarKit Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ComboKit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Partner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plans</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Districts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sub Category</th>
                <th className="px4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sub Project Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cluster</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-gray-500 italic">
                    No matching projects found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-bold text-sm tracking-tight">{row.solarkitName || 'No SolarKit'}</span>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="space-y-3">
                        {/* Action Buttons */}
                        <div className="flex gap-1 border-b pb-2 mb-2">
                          <button
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-1"
                            onClick={() => handleAddComboKit(row.id, false)}
                          >
                            <Plus size={12} strokeWidth={3} /> Add
                          </button>
                        </div>

                        {/* Created Kits List */}
                        {row.comboKits.length > 0 ? (
                          <div className="space-y-1.5">
                            {row.comboKits.map((kit, idx) => (
                              <div key={idx} className="flex justify-between items-center group bg-blue-50/50 hover:bg-white border border-blue-100 hover:border-blue-300 p-2 rounded-xl transition-all shadow-sm">
                                <span className="text-[11px] font-bold text-slate-700 truncate mr-2" title={kit.name}>
                                  {kit.name}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleAddComboKit(row.id, true, idx)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
                                    title="Edit this ComboKit"
                                  >
                                    <Edit size={12} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => handleViewCombokitDetails(kit)}
                                    className="p-1.5 text-green-600 hover:bg-green-100/50 rounded-lg transition-all"
                                    title="View Details"
                                  >
                                    <Eye size={12} strokeWidth={2.5} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic text-center py-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            No kits created yet
                          </div>
                        )}
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
                    <td className="px-4 py-3 text-sm">{row.state}</td>
                    <td
                      className="px-4 py-3 text-sm max-w-[150px] truncate cursor-pointer hover:text-blue-600 hover:font-bold transition-all"
                      title="Click to view all"
                      onClick={() => openSelectionModal('Selected Partners', row.roles, 'partner', row)}
                    >
                      {row.roles?.join(', ') || 'None'}
                    </td>
                    <td
                      className="px-4 py-3 text-sm max-w-[150px] truncate cursor-pointer hover:text-blue-600 hover:font-bold transition-all"
                      title="Click to view all"
                      onClick={() => openSelectionModal('Selected Plans', row.cpTypes, 'plan', row)}
                    >
                      {row.cpTypes?.join(', ') || 'None'}
                    </td>
                    <td
                      className="px-4 py-3 text-sm max-w-[150px] truncate cursor-pointer hover:text-blue-600 hover:font-bold transition-all"
                      title="Click to view all"
                      onClick={() => openSelectionModal('Selected Districts', row.districts, 'district', row)}
                    >
                      {row.districts?.join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.category}</td>
                    <td className="px-4 py-3 text-sm">{row.subCategory}</td>
                    <td className="px-4 py-3 text-sm">{row.projectType}</td>
                    <td className="px-4 py-3 text-sm">{row.subProjectType}</td>
                    <td
                      className="px-4 py-3 text-sm max-w-[150px] truncate cursor-pointer hover:text-blue-600 hover:font-bold transition-all"
                      title="Click to view all"
                      onClick={() => openSelectionModal('Selected Clusters', row.clusters, 'cluster', row)}
                    >
                      {row.clusters?.join(', ') || 'None'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          onClick={() => handleEditAssignment(row)}
                          title="Edit Assignment"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          onClick={() => handleDeleteAssignment(row.id)}
                          title="Delete Assignment"
                        >
                          <Trash2 size={16} />
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
                <h4 className="text-xl font-bold text-blue-800">ComboKit Management</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 p-2"
                  onClick={() => setShowComboKitModal(false)}
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-6">
                {/* Tabs - Only show in manage mode */}
                {modalMode === 'manage' && (
                  <div className="flex items-center gap-2 border-b mb-6 overflow-x-auto no-scrollbar pb-1">
                    {modalKits.map((kit, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-all min-w-[120px] truncate ${!isNewKitTab && activeKitIndex === index
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => switchTab(index, false)}
                      >
                        {kit.name || `Untitled Kit`}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`px-5 py-2 font-bold text-lg rounded-t-lg transition-all ${isNewKitTab
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      onClick={() => switchTab(modalKits.length, true)}
                      title="Add New ComboKit"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}

                {/* Edit Form Header */}
                {modalMode === 'edit-single' && (
                  <div className="flex items-center gap-2 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <Edit size={24} />
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-800">Edit ComboKit</h5>
                      <p className="text-sm text-blue-600 font-medium">{comboKitName || 'Unnamed Kit'}</p>
                    </div>
                  </div>
                )}

                <div id="mainComboKitForm">
                  {/* ComboKit Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ComboKit Name (Product Name)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-lg font-semibold shadow-sm"
                      value={comboKitName}
                      onChange={(e) => setComboKitName(e.target.value)}
                      placeholder="Enter ComboKit name"
                      required
                    />
                  </div>

                  {/* ComboKit Image */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ComboKit Image</label>
                    <div className="relative w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center h-48 group hover:border-blue-400 transition-colors">
                      {comboKitImage ? (
                        <img src={comboKitImage} alt="ComboKit" className="max-w-full max-h-full object-contain p-4" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Click the camera to upload image</p>
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
                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform group-hover:scale-110"
                        onClick={() => document.getElementById('combokitImage').click()}
                      >
                        <Camera size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Solar Panel Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b pb-8 border-gray-100">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Solar Panel Brand</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={solarPanelBrand}
                          onChange={(e) => handleSolarPanelBrandChange(e.target.value)}
                        >
                          <option value="">Select a brand</option>
                          {allManufacturers
                            .filter(m => m.product?.toLowerCase().includes('panel'))
                            .map(m => (
                              <option key={m._id} value={m.brand || m.companyName || m.name}>
                                {m.brand || m.companyName || m.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {showPanelSkuSelect && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Select Panel SKUs</label>
                          <Select
                            isMulti
                            isLoading={loadingSkus}
                            options={availablePanelSkus.map(sku => ({ value: sku.skuCode, label: sku.skuCode }))}
                            value={selectedPanelSkus.map(sku => ({ value: sku, label: sku }))}
                            onChange={(selected) => setSelectedPanelSkus(selected ? selected.map(s => s.value) : [])}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select SKUs..."
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Selected Panel SKUs</label>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl min-h-[100px]">
                        {selectedPanelSkus.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPanelSkus.map(sku => (
                              <span key={sku} className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                                {sku}
                                <button
                                  type="button"
                                  className="ml-2 text-blue-400 hover:text-red-500 transition-colors"
                                  onClick={() => setSelectedPanelSkus(prev => prev.filter(s => s !== sku))}
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 italic">
                            <Search size={24} className="mb-1" />
                            <span className="text-sm">No SKUs selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inverter Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b pb-8 border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Inverter Brand</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={inverterBrand}
                        onChange={(e) => setInverterBrand(e.target.value)}
                      >
                        <option value="">Select a brand</option>
                        <option value="Vesole">Vesole</option>
                        <option value="Luminous">Luminous</option>
                        <option value="Microtek">Microtek</option>
                        {allManufacturers
                          .filter(m => m.product?.toLowerCase().includes('inverter') && !['Vesole', 'Luminous', 'Microtek'].includes(m.brand || m.companyName || m.name))
                          .map(m => (
                            <option key={m._id} value={m.brand || m.companyName || m.name}>
                              {m.brand || m.companyName || m.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Selected Inverter Brand</label>
                      <div className="bg-gray-100 p-4 rounded-xl flex items-center border border-gray-200 h-[50px]">
                        <div className="bg-white px-4 py-1 rounded-lg shadow-sm border border-gray-200 font-bold text-gray-700">
                          {inverterBrand || <span className="text-gray-400 font-normal">None</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOM Link */}
                  <div className="mb-6">
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-bold flex items-center transition-all"
                      onClick={() => setShowBomSection(!showBomSection)}
                    >
                      {showBomSection ? <ChevronUp size={20} className="mr-2" /> : <ChevronDown size={20} className="mr-2" />}
                      {showBomSection ? "Hide BOM Editor" : "Configure Custom BOM"}
                    </button>
                    {showBomSection && (
                      <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-blue-600" />
                            Bill of Materials (BOM)
                          </h5>
                          <button
                            type="button"
                            onClick={addBomSection}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            <Plus size={14} /> Add BOM Section
                          </button>
                        </div>

                        {bomSections.map((section, idx) => (
                          <div key={idx} className="bg-white rounded-xl border-2 border-slate-100 p-6 relative shadow-sm hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-50">
                              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shadow-md shadow-blue-100">0{idx + 1}</span>
                                BOS KIT CONFIGURATION
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeBomSection(idx)}
                                className="text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all bg-rose-50 hover:bg-rose-100 border border-rose-100"
                              >
                                <Trash2 size={12} /> REMOVE SECTION
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BOS KIT NAME</label>
                                <input
                                  type="text"
                                  value={section.bosKitName}
                                  onChange={(e) => updateBomSection(idx, 'bosKitName', e.target.value)}
                                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-bold text-xs"
                                  placeholder="e.g. Mounting Rails"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KIT TYPE</label>
                                <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl h-11 items-center">
                                  <button
                                    type="button"
                                    onClick={() => updateBomSection(idx, 'kitType', 'CP')}
                                    className={`flex-1 h-full rounded-lg text-[10px] font-black transition-all ${section.kitType === 'CP' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                    CP
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBomSection(idx, 'kitType', 'Combokit')}
                                    className={`flex-1 h-full rounded-lg text-[10px] font-black transition-all ${section.kitType === 'Combokit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                    COMBOKIT
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KIT CATEGORY</label>
                                <input
                                  type="text"
                                  value={section.kitCategory}
                                  onChange={(e) => updateBomSection(idx, 'kitCategory', e.target.value)}
                                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-bold text-xs"
                                  placeholder="e.g. Structure"
                                />
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm mb-5">
                              <table className="w-full text-left">
                                <thead className="bg-[#1e293b] text-white">
                                  <tr>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700/50">Item Name</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700/50">Type</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700/50">Qty</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700/50">Unit</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700/50">Price</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {section.items.map((item, itemIdx) => (
                                    <tr key={itemIdx} className="group hover:bg-blue-50/30 transition-colors">
                                      <td className="p-3">
                                        <select
                                          value={item.name}
                                          onChange={(e) => updateBomItem(idx, itemIdx, 'name', e.target.value)}
                                          className="w-full h-9 border border-slate-200 rounded-lg px-2 font-bold text-slate-700 group-hover:bg-white transition-all text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                          <option value="">Select Item</option>
                                          <option>Panel</option>
                                          <option>Inverter</option>
                                          <option>Rail</option>
                                          <option>Clamp</option>
                                          <option>Cable DC</option>
                                          <option>Cable AC</option>
                                          <option>Earthing Rod</option>
                                          <option>MC4 Connector</option>
                                        </select>
                                      </td>
                                      <td className="p-3">
                                        <select
                                          value={item.itemType}
                                          onChange={(e) => updateBomItem(idx, itemIdx, 'itemType', e.target.value)}
                                          className="w-full h-9 border border-slate-200 rounded-lg px-2 font-bold text-slate-700 group-hover:bg-white transition-all text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                          <option value="">Select Type</option>
                                          <option>Hardware</option>
                                          <option>Electronics</option>
                                          <option>Electrical</option>
                                          <option>Consumables</option>
                                        </select>
                                      </td>
                                      <td className="p-3">
                                        <input
                                          type="text"
                                          value={item.qty}
                                          onChange={(e) => updateBomItem(idx, itemIdx, 'qty', e.target.value)}
                                          className="w-full h-9 border border-slate-200 rounded-lg px-2 font-bold text-slate-700 group-hover:bg-white transition-all text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <select
                                          value={item.unit}
                                          onChange={(e) => updateBomItem(idx, itemIdx, 'unit', e.target.value)}
                                          className="w-full h-9 border border-slate-200 rounded-lg px-2 font-bold text-slate-700 group-hover:bg-white transition-all text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                          <option value="">Unit</option>
                                          <option>Nos</option>
                                          <option>Kgs</option>
                                          <option>Mtrs</option>
                                          <option>Sets</option>
                                          <option>Box</option>
                                        </select>
                                      </td>
                                      <td className="p-3">
                                        <input
                                          type="number"
                                          value={item.price}
                                          onChange={(e) => updateBomItem(idx, itemIdx, 'price', e.target.value)}
                                          className="w-full h-9 border border-slate-200 rounded-lg px-2 font-bold text-slate-700 group-hover:bg-white transition-all text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="0.00"
                                        />
                                      </td>
                                      <td className="p-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => removeBomItem(idx, itemIdx)}
                                          className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <button
                              type="button"
                              onClick={() => addBomItem(idx)}
                              className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-[10px] hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                              <Plus size={14} /> Add New Item to This Section
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t gap-3 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium"
                  onClick={() => setShowComboKitModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-8 py-2 text-white rounded-md font-bold shadow-lg transition-transform hover:scale-105 ${isNewKitTab ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isNewKitTab ? 'Create & Save ComboKit' : 'Update & Save Changes'}
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

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b bg-blue-50">
              <h5 className="text-xl font-bold text-blue-800">Project ComboKits</h5>
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
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No ComboKits available for this project</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comboKits.map((kit, index) => (
                    <div key={index} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-bold text-gray-800 text-lg">{kit.name}</div>
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                            onClick={() => handleAddComboKit(row.id, true, index)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
                            onClick={() => handleViewCombokitDetails(kit)}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold w-24">Panels:</span>
                          <span className="bg-white px-2 py-0.5 rounded border">{kit.panelBrand || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-semibold w-24">Inverter:</span>
                          <span className="bg-white px-2 py-0.5 rounded border">{kit.inverterBrand || 'N/A'}</span>
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
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
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
                        <td className="px-4 py-3 text-sm">{viewingComboKit.inverterSkus?.join(', ') || 'None'}</td>
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
        <h4 className="text-2xl font-semibold text-blue-600">
          Add Combokit {selectedStates.length > 0 ? `- ${selectedStates.length} States` : selectedCountryName ? `- ${selectedCountryName}` : ''}
        </h4>
      </div>



      {/* Country Selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h5 className="text-lg font-semibold text-gray-700 mb-4">Select Country</h5>
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllCountry}
              onChange={handleSelectAllCountries}
              className="mr-2"
            />
            <span className="font-semibold">Select All</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {countries.map(country => {
            const { configs, kits } = getItemKitCount('country', country._id);
            const isSelected = selectedCountries.includes(country._id);
            return (
              <div
                key={country._id}
                className={`border rounded-lg p-3 text-center cursor-pointer transition-all min-h-[5rem] flex flex-col justify-center items-center h-20 ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white border-blue-400 text-gray-700 hover:border-blue-600 hover:shadow-sm'
                  }`}
                onClick={() => handleCountrySelect(country._id, country.name)}
              >
                <p className="font-black uppercase tracking-widest text-xs mb-1">{country.name}</p>
                {renderLiveCount(configs, kits, 'country', isSelected)}
              </div>
            );
          })}
        </div>
      </div>

      {/* State Selection */}
      {selectedCountries.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <h5 className="text-lg font-semibold text-gray-700 mb-4">Select State</h5>
          <label className="flex items-center cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={selectAllState}
              onChange={handleSelectAllStates}
              className="mr-2"
            />
            <span className="font-semibold">Select All States</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stateOptions.map(state => {
              const { configs, kits } = getItemKitCount('state', state._id);
              const isSelected = selectedStates.includes(state._id);
              return (
                <div
                  key={state._id}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all min-h-[5rem] flex flex-col justify-center items-center h-20 ${isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white border-blue-500 hover:border-blue-700 hover:shadow-sm'
                    }`}
                  onClick={() => handleStateSelect(state._id)}
                >
                  <p className="font-bold text-sm tracking-tight">{state.name}</p>
                  {renderLiveCount(configs, kits, 'state', isSelected)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Form */}
      {showProjectForm && (
        <div>
          {/* Cluster Selection */}
          <h5 className="text-lg font-semibold text-gray-700 mb-4">Select Cluster</h5>
          {renderClusterCards()}

          {/* District Selection FIRST */}
          {showDistrictSection && renderDistrictCards()}

          {/* Role (CP Type) Selection SECOND */}
          {showRoleSection && renderRoleCards()}

          {/* Plan Selection THIRD */}
          {showPlanSection && renderPlanCards()}

          {/* SolarKit Selection for the Assignment */}
          {selectedPlans.length > 0 && renderSolarKitSelection()}

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
                if (selectedStates.length === 0) {
                  alert('Please select at least one state');
                  return;
                }
                alert(`Approval process initiated for ${selectedStates.length} selected states`);
              }}
            >
              <CheckCircle size={18} className="mr-2" />
              Approval
            </button>
          </div>

        </div>
      )}

      {/* Project Table - Always show if there is data or even if empty to maintain UI structure */}
      {renderProjectTable()}

      {/* Modals */}
      {renderComboKitModal()}
      {renderProjectCombokitsModal()}
      {renderViewCombokitModal()}
      {renderSelectionModal()}
      {renderEditProjectModal()}
    </div>
  );

  // Selection Viewer Modal
  function renderSelectionModal() {
    if (!showSelectionModal) return null;

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSelectionModal(false)}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="text-lg font-bold tracking-tight">{selectionContent.title}</h3>
            <button
              onClick={() => setShowSelectionModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2">
              {selectionContent.items.length > 0 ? (
                selectionContent.items.map((item, index) => (
                  <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 italic transition-all hover:bg-indigo-100 shadow-sm">
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm text-center w-full py-4">No items selected.</p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => {
                setShowSelectionModal(false);
                handleEditAssignment(selectionContent.row);
              }}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Selection
            </button>
            <button
              onClick={() => setShowSelectionModal(false)}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Central Edit Project Modal
  function renderEditProjectModal() {
    if (!showEditProjectModal || !editingProjectData) return null;

    // Filter clusters by state
    const filteredClusters = clusterOptions.filter(c =>
      (c.state?._id === editingProjectData.stateId || c.state === editingProjectData.stateId)
    );

    // Filter districts by all selected clusters
    const filteredDistricts = districtOptions.filter(d =>
      editingProjectData.clusterIds.includes(d.clusterId)
    );

    const customSelectStyles = {
      control: (base, state) => ({
        ...base,
        minHeight: '48px',
        borderRadius: '12px',
        border: state.isFocused ? '2px solid #4f46e5' : '1px solid #e2e8f0',
        boxShadow: 'none',
        '&:hover': {
          borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1',
        },
        backgroundColor: '#f8fafc',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: '#eef2ff',
        borderRadius: '8px',
        padding: '2px 4px',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: '#4338ca',
        fontWeight: '600',
        fontSize: '0.85rem',
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: '#6366f1',
        '&:hover': {
          backgroundColor: '#4338ca',
          color: 'white',
        },
        borderRadius: '0 6px 6px 0',
      }),
    };

    return (
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setShowEditProjectModal(false)}></div>
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-7 bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Edit size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Update Project</h2>
                <p className="text-indigo-100 text-xs font-bold tracking-widest uppercase mt-0.5 opacity-80">Assignment Management</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProjectModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all hover:rotate-90 group"
            >
              <X size={24} className="group-hover:scale-110" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* State */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  State
                </label>
                <select
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 font-bold shadow-sm"
                  value={editingProjectData.stateId}
                  onChange={(e) => {
                    setEditingProjectData({
                      ...editingProjectData,
                      stateId: e.target.value,
                      clusterIds: [],
                      clusterNames: [],
                      districtIds: [],
                      districtNames: []
                    });
                  }}
                >
                  <option value="">Select State</option>
                  {stateOptions.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Cluster */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                  Clusters
                </label>
                <Select
                  isMulti
                  styles={customSelectStyles}
                  options={filteredClusters.map(c => ({ value: c._id, label: c.name }))}
                  value={editingProjectData.clusterIds.map((id, idx) => {
                    const obj = clusterOptions.find(c => c._id === id);
                    return { value: id, label: obj?.name || (editingProjectData.clusterNames && editingProjectData.clusterNames[idx]) || id };
                  })}
                  onChange={(selected) => {
                    const ids = selected ? selected.map(s => s.value) : [];
                    const names = selected ? selected.map(s => s.label) : [];

                    setEditingProjectData({
                      ...editingProjectData,
                      clusterIds: ids,
                      clusterNames: names,
                      districtIds: editingProjectData.districtIds.filter(dId => {
                        const distObj = districtOptions.find(d => d._id === dId);
                        return ids.includes(distObj?.clusterId);
                      })
                    });

                    // Fetch districts for ALL selected clusters
                    if (ids.length > 0) {
                      Promise.all(ids.map(id =>
                        fetchDistricts({ clusterId: id }).then(ds =>
                          (ds || []).map(d => ({ ...d, clusterId: id }))
                        )
                      )).then(results => {
                        const allDistricts = results.flat();
                        if (allDistricts && Array.isArray(allDistricts)) {
                          setDistrictOptions(prev => {
                            const eIds = prev.map(d => d._id);
                            const nOnes = allDistricts.filter(d => !eIds.includes(d._id));
                            return [...prev, ...nOnes];
                          });
                        }
                      });
                    }
                  }}
                  placeholder="Select Clusters..."
                />
              </div>

              {/* District */}
              <div className="space-y-2.5 col-span-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Districts
                </label>
                <Select
                  isMulti
                  styles={customSelectStyles}
                  options={filteredDistricts.map(d => ({ value: d._id, label: d.name }))}
                  value={editingProjectData.districtIds.map((id, idx) => {
                    const obj = districtOptions.find(d => d._id === id);
                    return { value: id, label: obj?.name || (editingProjectData.districtNames && editingProjectData.districtNames[idx]) || id };
                  })}
                  onChange={(selected) => {
                    const ids = selected ? selected.map(s => s.value) : [];
                    const names = selected ? selected.map(s => s.label) : [];
                    setEditingProjectData({
                      ...editingProjectData,
                      districtIds: ids,
                      districtNames: names
                    });
                  }}
                  placeholder="Select Districts..."
                />
              </div>

              {/* Partners */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Partner Roles
                </label>
                <Select
                  isMulti
                  styles={customSelectStyles}
                  options={partners.map(p => ({ value: p.name, label: p.name }))}
                  value={editingProjectData.roles.map(r => ({ value: r, label: r }))}
                  onChange={async (selected) => {
                    const names = selected ? selected.map(s => s.value) : [];
                    setEditingProjectData({ ...editingProjectData, roles: names });

                    // Fetch plans for the selected roles
                    if (names.length > 0 && editingProjectData.stateId) {
                      try {
                        const plans = await getPartnerPlans(names[0], editingProjectData.stateId);
                        setAvailablePlans(plans || []);
                      } catch (err) {
                        console.error("Error updating plans for edit:", err);
                      }
                    } else {
                      setAvailablePlans([]);
                    }
                  }}
                  placeholder="Select Roles..."
                />
              </div>

              {/* Plans */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Partner Plans
                </label>
                <Select
                  isMulti
                  styles={customSelectStyles}
                  options={availablePlans.map(p => ({ value: p.name, label: p.name }))}
                  value={editingProjectData.cpTypes.map(p => ({ value: p, label: p }))}
                  onChange={(selected) => {
                    const names = selected ? selected.map(s => s.value) : [];
                    setEditingProjectData({ ...editingProjectData, cpTypes: names });
                  }}
                  placeholder="Select Plans..."
                />
              </div>

              {/* Status */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                  Assignment Status
                </label>
                <select
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all text-slate-700 font-bold shadow-sm"
                  value={editingProjectData.status}
                  onChange={(e) => setEditingProjectData({ ...editingProjectData, status: e.target.value })}
                >
                  <option value="Active">Operational / Active</option>
                  <option value="Inactive">Paused / Inactive</option>
                </select>
              </div>

              {/* SolarKit Dropdown and Auto-fill in Edit Modal */}
              <div className="space-y-2.5 col-span-full border-t border-slate-100 pt-8 mt-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-sm"></div>
                  Change Project Type (SolarKit)
                </label>
                <Select
                  options={solarKits.map(kit => ({ value: kit._id, label: kit.name, data: kit }))}
                  value={solarKits.find(k => k.name === editingProjectData.solarkitName) ? {
                    value: solarKits.find(k => k.name === editingProjectData.solarkitName)._id,
                    label: editingProjectData.solarkitName
                  } : null}
                  styles={customSelectStyles}
                  onChange={(selected) => {
                    if (selected?.data) {
                      const kitData = selected.data;
                      setEditingProjectData({
                        ...editingProjectData,
                        solarkitName: kitData.name,
                        category: kitData.category,
                        subCategory: kitData.subCategory,
                        projectType: kitData.projectType,
                        subProjectType: kitData.subProjectType
                      });
                    }
                  }}
                  placeholder="Search or Select SolarKit..."
                  isLoading={loadingSolarKits}
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50 mt-4 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-0.5">Category</label>
                    <div className="px-3 py-2 bg-white/80 rounded-lg border border-indigo-50 font-bold text-indigo-900 text-[11px] shadow-xs">{editingProjectData.category}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-0.5">Sub Category</label>
                    <div className="px-3 py-2 bg-white/80 rounded-lg border border-indigo-50 font-bold text-indigo-900 text-[11px] shadow-xs">{editingProjectData.subCategory}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-0.5">Project Type</label>
                    <div className="px-3 py-2 bg-white/80 rounded-lg border border-indigo-50 font-bold text-indigo-900 text-[11px] shadow-xs">{editingProjectData.projectType}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-0.5">Sub Project Type</label>
                    <div className="px-3 py-2 bg-white/80 rounded-lg border border-indigo-50 font-bold text-indigo-900 text-[11px] shadow-xs">{editingProjectData.subProjectType}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-5">
            <button
              onClick={() => setShowEditProjectModal(false)}
              className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-500 font-extrabold uppercase tracking-widest rounded-2xl hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700 transition-all shadow-sm text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateAssignment(editingProjectData)}
              className="px-12 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-extrabold uppercase tracking-widest rounded-2xl hover:from-indigo-700 hover:to-violet-800 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 active:scale-95 group"
            >
              <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
              Update Assignment
            </button>
          </div>
        </div>
      </div>
    );
  }
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