import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, Edit, Save, X,
  CheckSquare, XCircle,
  Download, Filter, Trash2
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import { locationAPI } from '../../../../api/api';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getPartnerTypes,
  getSolarKits,
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProjectCategoryMappings
} from '../../../../services/combokit/combokitApi';
import { getSkus } from '../../../../services/settings/orderProcurementSettingApi';
import { getAllManufacturers } from '../../../../services/brand/brandApi';
import Select from 'react-select';
import toast from 'react-hot-toast';

// Helper to normalize/extract ID
const getCleanId = (v) => {
  if (!v) return "";
  if (typeof v === 'string') return v.trim();
  return String(v?._id || v?.id || v || "").trim();
};

const LocationCard = ({ title, subtitle, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-28 shadow-sm hover:shadow-md ${isSelected
      ? 'border-[#007bff] bg-blue-50 shadow-blue-100 shadow-lg -translate-y-1'
      : 'border-transparent bg-white hover:border-blue-200'
      }`}
  >
    <div className="font-bold text-base text-[#333] mb-1">{title}</div>
    <div className="text-xs text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

function ntext(v) {
  return String(v || '').toLowerCase().trim();
}

const CustomizeCombokit = () => {
  const { countries, states: allStates, fetchCountries, fetchStates } = useLocations();

  // Custom CSS for refined scrollbars and UI
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
  `;

  // Default options
  // Master data for dropdowns
  const [panelOptions, setPanelOptions] = useState([]);
  const [inverterOptions, setInverterOptions] = useState([]);
  const [boskitOptions, setBoskitOptions] = useState([]);
  const [solarKitsList, setSolarKitsList] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);

  const [lastSavedConfig, setLastSavedConfig] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState(new Set());
  const [selectedDistricts, setSelectedDistricts] = useState(new Set());
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [partners, setPartners] = useState([]);

  // Data Cache (ID -> Data)
  const [availableClusters, setAvailableClusters] = useState({}); // stateId -> [clusters]
  const [availableDistricts, setAvailableDistricts] = useState({}); // clusterId -> [districts]

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'cluster', 'district'

  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    panels: [],
    inverters: [],
    boskits: [],
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    combokitId: null,
    role: '',
    country: null,
    state: null,
    cluster: null,
    districts: [],
    filterCategory: '',
    filterSubCategory: '',
    filterProjectType: '',
    filterSubProjectType: ''
  });
  const [currentAssignment, setCurrentAssignment] = useState(null);

  // Initial Data
  useEffect(() => {
    fetchCountries();
    fetchPartners();
    fetchAssignments();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [kits, cats, subCats, projs, subProjs, panels, inverters, bos, mappings, manufacturers] = await Promise.all([
        getSolarKits(),
        getCategories(),
        getSubCategories(),
        getProjectTypes(),
        getSubProjectTypes(),
        getSkus({ category: 'Solar Panel' }),
        getSkus({ category: 'Inverter' }),
        getSkus({ category: 'BOS' }),
        getProjectCategoryMappings(),
        getAllManufacturers()
      ]);

      setSolarKitsList(kits || []);
      setMasterCategories(cats || []);
      setMasterSubCategories(subCats || []);

      // Derive unique project types from mappings if available, else use generic projs
      const uniqueProjectTypes = (mappings?.length > 0)
        ? Array.from(new Set(mappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`))).filter(Boolean).sort()
        : projs?.map(p => p.name) || [];

      setMasterProjectTypes(uniqueProjectTypes);
      setMasterSubProjectTypes(subProjs || []);
      setProjectMappings(mappings || []);

      const mData = Array.isArray(manufacturers) ? manufacturers : manufacturers?.data || [];
      
      // Filter brands for Panels and Inverters
      const panelBrands = mData
        .filter(m => m.product?.toLowerCase() === 'panel' && m.comboKit)
        .map(m => m.brand || m.companyName);
      
      const inverterBrands = mData
        .filter(m => m.product?.toLowerCase() === 'inverter' && m.comboKit)
        .map(m => m.brand || m.companyName);

      setPanelOptions([...new Set(panelBrands)].sort());
      setInverterOptions([...new Set(inverterBrands)].sort());

      const bData = Array.isArray(bos) ? bos : bos?.data || [];
      setBoskitOptions(bData.map(b => b.skuName || b.name));
    } catch (err) {
      console.error("Error fetching master data", err);
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

  // No auto-selection on load — admin must choose manually

  // Handle country selection
  const handleCountrySelect = (countryId, countryName) => {
    setSelectedCountry(countryId);
    setSelectedCountryName(countryName);
    fetchStates({ countryId: countryId });

    // Reset all following
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
    setAvailableClusters({});
    setAvailableDistricts({});
  };

  // Fetch Assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getAssignments();
      const data = res?.data || (Array.isArray(res) ? res : []);
      setAssignments(data);

      const stateIdsFound = [...new Set(data.map(a => getCleanId(a.state)).filter(Boolean))];
      for (const stateId of stateIdsFound) {
        if (!availableClusters[stateId]) {
          try {
            const clusterRes = await locationAPI.getAllClusters({ stateId: stateId, isActive: 'true' });
            if (clusterRes.data && clusterRes.data.data) {
              setAvailableClusters(prev => ({ ...prev, [stateId]: clusterRes.data.data }));
            }
          } catch (err) {
            console.error(`Failed to fetch clusters for state ${stateId}`, err);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch assignments", error);
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  // Handle state selection
  const handleStateClick = async (stateId) => {
    const newSelectedStates = new Set(selectedStates);
    if (newSelectedStates.has(stateId)) {
      newSelectedStates.delete(stateId);
    } else {
      newSelectedStates.clear(); // Enforce single selection hierarchy for clean flow
      newSelectedStates.add(stateId);
      // Fetch clusters for this state if not available
      if (!availableClusters[stateId]) {
        try {
          const res = await locationAPI.getAllClusters({ stateId: stateId, isActive: 'true' });
          if (res.data && res.data.data) {
            setAvailableClusters(prev => ({ ...prev, [stateId]: res.data.data }));
          }
        } catch (error) {
          console.error("Failed to fetch clusters", error);
        }
      }
    }

    // Strict Hierarchy Reset
    setSelectedStates(newSelectedStates);
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
  };

  const selectAllStates = async () => {
    const allIds = allStates.map(s => s._id);
    setSelectedStates(new Set(allIds));

    // Fetch clusters for all states that don't have them
    for (const stateId of allIds) {
      if (!availableClusters[stateId]) {
        try {
          const res = await locationAPI.getAllClusters({ stateId: stateId, isActive: 'true' });
          if (res.data && res.data.data) {
            setAvailableClusters(prev => ({ ...prev, [stateId]: res.data.data }));
          }
        } catch (error) {
          console.error("Failed to fetch clusters", error);
        }
      }
    }
  };

  const clearAllStates = () => {
    setSelectedStates(new Set());
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
  };

  // Get displayed clusters based on selected states
  const getDisplayedClusters = () => {
    let clusters = [];
    const seen = new Set();
    selectedStates.forEach(stateId => {
      if (availableClusters[stateId]) {
        availableClusters[stateId].forEach(cluster => {
          if (!seen.has(cluster._id)) {
            seen.add(cluster._id);
            clusters.push(cluster);
          }
        });
      }
    });
    return clusters;
  };

  // Handle cluster selection
  const handleClusterClick = async (clusterId) => {
    const newSelectedClusters = new Set(selectedClusters);
    if (newSelectedClusters.has(clusterId)) {
      newSelectedClusters.delete(clusterId);
    } else {
      newSelectedClusters.clear(); // Enforce single selection hierarchy for clean flow
      newSelectedClusters.add(clusterId);
      // Fetch districts
      if (!availableDistricts[clusterId]) {
        try {
          const res = await locationAPI.getAllDistricts({ clusterId: clusterId, isActive: 'true' });
          if (res.data && res.data.data) {
            setAvailableDistricts(prev => ({ ...prev, [clusterId]: res.data.data }));
          }
        } catch (error) {
          console.error("Failed to fetch districts", error);
        }
      }
    }

    // Strict Hierarchy Reset
    setSelectedClusters(newSelectedClusters);
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
  };

  const selectAllClusters = async () => {
    const displayedClusters = getDisplayedClusters();
    const allIds = displayedClusters.map(c => c._id);
    setSelectedClusters(new Set(allIds));

    // Fetch districts
    for (const clusterId of allIds) {
      if (!availableDistricts[clusterId]) {
        try {
          const res = await locationAPI.getAllDistricts({ clusterId: clusterId, isActive: 'true' });
          if (res.data && res.data.data) {
            setAvailableDistricts(prev => ({ ...prev, [clusterId]: res.data.data }));
          }
        } catch (error) {
          console.error("Error fetching districts", error);
        }
      }
    }
  };

  const clearAllClusters = () => {
    setSelectedClusters(new Set());
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
  };

  // Get displayed districts based on selected clusters
  const getDisplayedDistricts = () => {
    let districts = [];
    const seen = new Set();
    selectedClusters.forEach(clusterId => {
      if (availableDistricts[clusterId]) {
        availableDistricts[clusterId].forEach(district => {
          if (!seen.has(district._id)) {
            seen.add(district._id);
            districts.push(district);
          }
        });
      }
    });
    return districts;
  };

  // Handle district selection
  const handleDistrictClick = (districtId) => {
    const newSelectedDistricts = new Set(selectedDistricts);
    if (newSelectedDistricts.has(districtId)) {
      newSelectedDistricts.delete(districtId);
    } else {
      newSelectedDistricts.add(districtId);
    }

    // Strict Hierarchy Reset
    setSelectedDistricts(newSelectedDistricts);
    setSelectedRoles(new Set());
  };

  const selectAllDistricts = () => {
    const displayedDistricts = getDisplayedDistricts();
    const allIds = displayedDistricts.map(d => d._id);
    setSelectedDistricts(new Set(allIds));
  };

  const clearAllDistricts = () => {
    setSelectedDistricts(new Set());
    setSelectedRoles(new Set());
  };

  const resolveClusterName = (assignment) => {
    if (!assignment) return null;

    // 1. Direct object check
    const clusterVal = assignment.cluster || assignment.clusterId;
    if (clusterVal && typeof clusterVal === 'object') {
      const name = clusterVal.name || clusterVal.clusterName || clusterVal.cluster_name;
      if (name) return name;
    }

    // 2. ID-based lookup in cache or assignment
    const cid = getCleanId(clusterVal);
    if (cid) {
      for (const sId in availableClusters) {
        const found = availableClusters[sId]?.find(c => getCleanId(c) === cid);
        if (found) return found.name || found.clusterName;
      }
      const peerWithObj = assignments.find(a => {
        const cVal = a.cluster || a.clusterId;
        return getCleanId(cVal) === cid && typeof cVal === 'object' && (cVal.name || cVal.clusterName);
      });
      if (peerWithObj) {
        const pObj = peerWithObj.cluster || peerWithObj.clusterId;
        return pObj.name || pObj.clusterName;
      }
    }

    // 3. Last fallback: districts often contain cluster info in some versions of the schema
    if (assignment.districts?.length > 0) {
      const firstDist = assignment.districts[0];
      if (firstDist.clusterId?.name) return firstDist.clusterId.name;
    }

    // 3. Fallback: Search by name directly if stored as string name
    if (typeof clusterVal === 'string' && clusterVal.length > 5 && !/^[0-9a-fA-F]{24}$/.test(clusterVal)) {
      return clusterVal;
    }

    // 4. District-based fallback (search which cluster contains these districts)
    const districtIds = (assignment.districts || assignment.districtIds || [])
      .map(d => getCleanId(d))
      .filter(id => id && id !== 'undefined' && id !== 'null');

    if (districtIds.length > 0) {
      for (const cId in availableDistricts) {
        const districtsInCluster = availableDistricts[cId] || [];
        const overlaps = districtsInCluster.some(d => districtIds.includes(getCleanId(d._id || d)));
        if (overlaps) {
          const cidToFind = cId.trim();
          for (const sId in availableClusters) {
            const found = availableClusters[sId]?.find(c => getCleanId(c._id || c) === cidToFind);
            if (found) return found.name || found.clusterName;
          }
        }
      }
    }

    return null;
  };

  // Handle role selection
  const handleRoleClick = (role) => {
    const newSelectedRoles = new Set(selectedRoles);
    if (newSelectedRoles.has(role)) {
      newSelectedRoles.delete(role);
    } else {
      newSelectedRoles.add(role);
    }
    setSelectedRoles(newSelectedRoles);
  };

  const selectAllRoles = () => {
    setSelectedRoles(new Set(partners.map(p => p.name)));
  };

  const clearAllRoles = () => {
    setSelectedRoles(new Set());
  };



  // Custom styles for React Select
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '32px',
      fontSize: '11px',
      borderRadius: '6px',
      borderColor: '#d1d5db',
      '&:hover': { borderColor: '#4f46e5' }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px'
    }),
    input: (base) => ({
      ...base,
      margin: '0'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '2px'
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '2px'
    }),
    menu: (base) => ({
      ...base,
      fontSize: '11px',
      zIndex: 100
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e0e7ff',
      borderRadius: '4px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#3730a3',
      padding: '1px 4px'
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 })
  };

  const handleEditClick = async (assignment) => {
    const stateId = getCleanId(assignment.state);
    const clusterId = getCleanId(assignment.cluster);

    // 1. Ensure clusters are loaded for the selected state if not already in cache
    if (stateId && !availableClusters[stateId]) {
      try {
        const res = await locationAPI.getAllClusters({ stateId, isActive: 'true' });
        if (res.data?.data) {
          setAvailableClusters(prev => ({ ...prev, [stateId]: res.data.data }));
        }
      } catch (err) { console.error("Error fetching clusters for edit", err); }
    }

    // 2. Ensure districts are loaded for the selected cluster if not already in cache
    if (clusterId && !availableDistricts[clusterId]) {
      try {
        const res = await locationAPI.getAllDistricts({ clusterId, isActive: 'true' });
        if (res.data?.data) {
          setAvailableDistricts(prev => ({ ...prev, [clusterId]: res.data.data }));
        }
      } catch (err) { console.error("Error fetching districts for edit", err); }
    }

    // 3. Resolve Country Object
    let aCountryId = getCleanId(assignment.country) || getCleanId(assignment.state?.countryId) || getCleanId(assignment.state?.country);
    if (!aCountryId && stateId && allStates?.length > 0) {
      const stateObj = allStates.find(s => getCleanId(s) === stateId);
      if (stateObj) {
        aCountryId = getCleanId(stateObj.countryId || stateObj.country);
      }
    }
    
    let countryObj = countries.find(c => getCleanId(c) === aCountryId);
    if (!countryObj && assignment.country?.name) {
      countryObj = assignment.country;
    } else if (!countryObj && aCountryId) {
      // Try finding by name if ID match failed (sometimes data is inconsistent)
      const cName = assignment.country?.name || (typeof assignment.country === 'string' && !/^[0-9a-fA-F]{24}$/.test(assignment.country) ? assignment.country : '');
      if (cName) {
        countryObj = countries.find(c => ntext(c.name) === ntext(cName));
      }
    }
    // Final fallback to India if common
    if (!countryObj && countries.length > 0) {
      countryObj = countries.find(c => ntext(c.name) === 'india');
    }

    // 4. Resolve State Object
    let stateObj = allStates.find(s => getCleanId(s) === stateId);
    if (!stateObj && assignment.state?.name) {
      stateObj = assignment.state;
    } else if (!stateObj && stateId) {
      // If we don't have allStates, we might need a placeholder
      stateObj = { _id: stateId, name: assignment.state?.name || 'Selected State' };
    }

    // 5. Resolve Cluster Object
    let clusterObj = null;
    if (clusterId) {
      // Look in all possible cached states
      for (const sId in availableClusters) {
        const found = availableClusters[sId]?.find(c => getCleanId(c) === clusterId);
        if (found) { clusterObj = found; break; }
      }
      
      if (!clusterObj) {
        // Fallback: use help from row data/resolve helper
        const cName = resolveClusterName(assignment);
        clusterObj = { 
          _id: clusterId, 
          name: cName || (typeof assignment.cluster === 'string' ? assignment.cluster : 'Unknown Cluster')
        };
      }
    }

    setAssignmentForm({
      panels: assignment.panels || [],
      inverters: assignment.inverters || [],
      boskits: assignment.boskits || [],
      category: assignment.category || '',
      subCategory: assignment.subCategory || '',
      projectType: assignment.projectType || '',
      subProjectType: assignment.subProjectType || '',
      combokitId: assignment.combokitId || (typeof assignment.combokitId === 'object' ? assignment.combokitId?._id : assignment.combokitId) || null,
      role: assignment.role || (Array.isArray(assignment.cpTypes) ? assignment.cpTypes[0] : assignment.cpTypes) || '',
      country: countryObj,
      state: stateObj,
      cluster: clusterObj,
      districts: assignment.districts || []
    });
    setCurrentAssignment(assignment);
    setShowConfigureModal(true);
  };

  const deleteAssignmentById = async (id) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await deleteAssignment(id);
      toast.success("Configuration deleted successfully");
      fetchAssignments();
    } catch (error) {
      console.error("Failed to delete assignment", error);
      toast.error("Failed to delete configuration");
    }
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);

      // Determine role from form or current assignment
      const roleToUse = assignmentForm.role || (currentAssignment?.role || (Array.isArray(currentAssignment?.cpTypes) ? currentAssignment?.cpTypes[0] : currentAssignment?.cpTypes)) || '';

      // Normalize IDs to plain strings — never send nested objects
      const stateId = getCleanId(assignmentForm.state);
      const clusterId = getCleanId(assignmentForm.cluster);
      const countryId = getCleanId(assignmentForm.country) || selectedCountry;

      const payload = {
        solarkitName: 'Custom Config',
        panels: assignmentForm.panels,
        inverters: assignmentForm.inverters,
        boskits: assignmentForm.boskits,
        state: stateId,
        cluster: clusterId || null,
        districts: (assignmentForm.districts || []).map(d => d._id || d),
        role: roleToUse,
        cpTypes: [roleToUse],
        category: assignmentForm.category,
        subCategory: assignmentForm.subCategory,
        projectType: assignmentForm.projectType,
        subProjectType: assignmentForm.subProjectType,
        combokitId: getCleanId(assignmentForm.combokitId),
        country: countryId
      };

      let savedData;
      if (!currentAssignment) {
        const res = await createAssignment(payload);
        savedData = res.data || res;
        toast.success("New configuration created successfully");
      } else {
        const res = await updateAssignment(currentAssignment._id, payload);
        savedData = res.data || res;
        toast.success("Details updated successfully");
      }

      // Clear forms and close modal early for snappy feel
      setShowConfigureModal(false);
      setCurrentAssignment(null);

      // Force fetch fresh data and wait for it
      await fetchAssignments();

      // Update last saved with the ACTUAL server data (which has _id)
      setLastSavedConfig(savedData);
      setShowSummary(true);

    } catch (error) {
      console.error("Failed to save assignment", error);
      toast.error("Failed to save details: " + (error.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const addNewCustomization = () => {
    if (!selectedCountry) {
      toast.error("Please select a Country first");
      return;
    }
    if (selectedStates.size === 0) {
      toast.error("Please select a State first");
      return;
    }

    if (selectedRoles.size === 0) {
      toast.error("Please select a Partner type (Dealer, Franchise, or Channel Partner) from the filter above");
      return;
    }

    // Capture EXACT values from top filters to ensure data integrity
    const stateId = Array.from(selectedStates)[0];
    const clusterId = Array.from(selectedClusters)[0];
    const districtIds = Array.from(selectedDistricts);
    const role = Array.from(selectedRoles)[0];

    // Find objects from cache for UI display inside the modal
    const countryObj = countries.find(c => c._id === selectedCountry);
    const stateObj = allStates.find(s => s._id === stateId);

    let clusterObj = null;
    if (clusterId) {
      // 1. Check current state's cache
      if (availableClusters[stateId]) {
        clusterObj = availableClusters[stateId].find(c => String(c._id || c) === String(clusterId));
      }

      // 2. Fallback: Search all cached states
      if (!clusterObj) {
        for (const sId in availableClusters) {
          const found = availableClusters[sId]?.find(c => String(c._id || c) === String(clusterId));
          if (found) { clusterObj = found; break; }
        }
      }
    }

    // Resolve district objects
    const districtObjs = [];
    districtIds.forEach(id => {
      let found = null;
      if (clusterId && availableDistricts[clusterId]) {
        found = availableDistricts[clusterId].find(d => String(d._id || d) === String(id));
      }
      if (!found) {
        // Fallback search
        for (const cId in availableDistricts) {
          found = availableDistricts[cId]?.find(d => String(d._id || d) === String(id));
          if (found) break;
        }
      }
      districtObjs.push(found || { _id: id, name: 'Selected District' });
    });

    setAssignmentForm({
      panels: [],
      inverters: [],
      boskits: [],
      category: '',
      subCategory: '',
      projectType: '',
      subProjectType: '',
      combokitId: null,
      country: countryObj || null,
      state: stateObj || null,
      cluster: clusterObj || null,
      districts: districtObjs,
      role: role, // Auto-assign the selected role from filter
      filterCategory: '',
      filterSubCategory: '',
      filterProjectType: '',
      filterSubProjectType: ''
    });
    setCurrentAssignment(null);
    setShowConfigureModal(true);
  };

  const handleCancelClick = (assignmentId) => {
    setEditMode(prev => ({ ...prev, [assignmentId]: false }));
    // Optionally revert changes by re-fetching or keeping a backup
    fetchAssignments();
  };

  // Handle dropdown changes
  const handlePanelChange = (assignmentId, selectedOptions) => {
    setAssignments(prev => prev.map(a =>
      a._id === assignmentId ? { ...a, panels: selectedOptions } : a
    ));
  };

  const handleInverterChange = (assignmentId, selectedOptions) => {
    setAssignments(prev => prev.map(a =>
      a._id === assignmentId ? { ...a, inverters: selectedOptions } : a
    ));
  };

  const handleBoskitChange = (assignmentId, selectedOptions) => {
    setAssignments(prev => prev.map(a =>
      a._id === assignmentId ? { ...a, boskits: selectedOptions } : a
    ));
  };

  const handleFieldChange = (assignmentId, field, value) => {
    setAssignments(prev => prev.map(a =>
      a._id === assignmentId ? { ...a, [field]: value } : a
    ));
  };

  const handleLocationChange = (assignmentId, field, id) => {
    setAssignments(prev => prev.map(a => {
      if (a._id !== assignmentId) return a;

      let update = { [field]: id };

      if (field === 'state' || field === 'stateId') {
        const stateObj = allStates.find(s => s._id === id);
        update = { ...update, state: stateObj };
      } else if (field === 'cluster' || field === 'clusterId') {
        const clusterObj = getDisplayedClusters().find(c => c._id === id);
        update = { ...update, cluster: clusterObj };
      } else if (field === 'districts') {
        // value is array of IDs
        const districtObjs = getDisplayedDistricts().filter(d => id.includes(d._id));
        update = { ...update, districts: districtObjs };
      }

      return { ...a, ...update };
    }));
  };

  // Modal handlers
  const showCombokitDetails = (assignment) => {
    const data = assignment;
    const stateName = assignment.state?.name || "Unknown State";
    const clusterName = resolveClusterName(assignment) || "Unknown Cluster";
    const districtNames = assignment.districts?.map(d => d.name).join(", ") || "None";

    setModalContent({
      title: "Combokit Details",
      content: (
        <div>
          <h4 className="text-lg font-semibold mb-4">{stateName} Combokit Details</h4>
          <table className="min-w-full divide-y divide-gray-200 mt-3">
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Solarkit Name:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.solarkitName}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Panel:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {data.panels?.length ? data.panels.join(", ") : "Not Selected"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Inverter:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {data.inverters?.length ? data.inverters.join(", ") : "Not Selected"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Boskit:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {data.boskits?.length ? data.boskits.join(", ") : "Not Selected"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">State:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stateName}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Clusters:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{clusterName}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Districts:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{districtNames}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Partner:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.role || data.cpTypes?.join(", ") || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Category:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.category}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Sub Category:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.subCategory}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Project Type:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.projectType}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Sub Project Type:</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.subProjectType}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    });
    setModalType('view');
  };

  const closeModal = () => {
    setModalContent(null);
    setModalType(null);
  };



  // Get modal header color based on type
  const getModalHeaderColor = () => {
    switch (modalType) {
      case 'view': return 'bg-blue-600';
      case 'cluster': return 'bg-cyan-600';
      case 'district': return 'bg-green-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Card */}
      <div className="card mb-6 shadow-lg rounded-lg bg-white">
        <div className="card-header px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600 mb-0">Customize Combokit</h2>
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#333]">Select Country</h3>
          <button
            onClick={() => handleCountrySelect('all', 'All Countries')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <LocationCard
             title="All Countries"
             subtitle="ALL"
             isSelected={selectedCountry === 'all'}
             onClick={() => handleCountrySelect('all', 'All Countries')}
          />
          {countries.map((country) => (
            <LocationCard
              key={country._id}
              title={country.name}
              subtitle={country.code || country.name.substring(0, 2).toUpperCase()}
              isSelected={selectedCountry === country._id}
              onClick={() => handleCountrySelect(country._id, country.name)}
            />
          ))}
        </div>
      </div>      {/* State Selection */}
      {selectedCountry && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#333]">Select States</h3>
            <div className="space-x-4">
              <button
                onClick={selectAllStates}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={clearAllStates}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LocationCard
              title="All States"
              subtitle="ALL"
              isSelected={selectedStates.has('all') || (selectedStates.size === allStates.length && allStates.length > 0)}
              onClick={selectAllStates}
            />
            {allStates.map((state) => (
              <LocationCard
                key={state._id}
                title={state.name}
                subtitle={state.code || state.name.substring(0, 2).toUpperCase()}
                isSelected={selectedStates.has(state._id)}
                onClick={() => handleStateClick(state._id)}
              />
            ))}
          </div>
        </div>
      )}      {/* Cluster Selection */}
      {selectedStates.size > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#333]">Select Clusters</h3>
            <div className="space-x-4">
              <button
                onClick={selectAllClusters}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={clearAllClusters}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LocationCard
              title="All Clusters"
              subtitle="ALL"
              isSelected={selectedClusters.has('all') || (selectedClusters.size === getDisplayedClusters().length && getDisplayedClusters().length > 0)}
              onClick={selectAllClusters}
            />
            {getDisplayedClusters().map((cluster) => {
               const stateId = getCleanId(cluster.stateId || cluster.state);
               const stateObj = allStates.find(s => getCleanId(s) === stateId);
               return (
                <LocationCard
                  key={cluster._id}
                  title={cluster.name}
                  subtitle={stateObj ? (stateObj.code || stateObj.name.substring(0, 2).toUpperCase()) : 'CL'}
                  isSelected={selectedClusters.has(cluster._id)}
                  onClick={() => handleClusterClick(cluster._id)}
                />
              );
            })}
          </div>
        </div>
      )}      {/* District Selection */}
      {selectedClusters.size > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#333]">Select Districts</h3>
            <div className="space-x-4">
              <button
                onClick={selectAllDistricts}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={clearAllDistricts}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LocationCard
              title="All Districts"
              subtitle="ALL"
              isSelected={selectedDistricts.has('all') || (selectedDistricts.size === getDisplayedDistricts().length && getDisplayedDistricts().length > 0)}
              onClick={selectAllDistricts}
            />
            {getDisplayedDistricts().map((district) => (
              <LocationCard
                key={district._id}
                title={district.name}
                subtitle="DISTRICT"
                isSelected={selectedDistricts.has(district._id)}
                onClick={() => handleDistrictClick(district._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Role Selection */}
      {selectedStates.size > 0 && (
        <div className="card mb-6 shadow-lg rounded-lg bg-white">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pl-3 border-l-4 border-blue-600">Select Partner</h3>

            <div className="mb-4">
              <button
                onClick={selectAllRoles}
                className="btn btn-sm btn-outline-primary mr-2 px-3 py-1.5 text-sm rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <CheckSquare className="inline-block w-4 h-4 mr-1" />
                Select All
              </button>
              <button
                onClick={clearAllRoles}
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 text-sm rounded border border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <XCircle className="inline-block w-4 h-4 mr-1" />
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {partners.map((partner, index) => (
                <div
                  key={`${partner._id}-${index}`}
                  onClick={() => handleRoleClick(partner.name)}
                  className={`card border rounded-lg px-8 py-4 text-center cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRoles.has(partner.name)
                    ? partner.name.toLowerCase() === 'dealer' ? 'bg-orange-600 text-white border-orange-600' :
                      partner.name.toLowerCase() === 'franchise' ? 'bg-blue-600 text-white border-blue-600' :
                        'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  <p className="font-bold tracking-wide">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {selectedStates.size > 0 && (
        <div className="card mb-6 shadow-lg rounded-lg bg-white">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pl-3 border-l-4 border-blue-600">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <Select
                  styles={selectStyles}
                  placeholder="Filter by Category"
                  isClearable
                  value={assignmentForm.filterCategory ? { label: assignmentForm.filterCategory, value: assignmentForm.filterCategory } : null}
                  onChange={(opt) => setAssignmentForm({ ...assignmentForm, filterCategory: opt?.value || '', filterSubCategory: '' })}
                  options={masterCategories.map(c => ({ label: c.name, value: c.name }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Category</label>
                <Select
                  styles={selectStyles}
                  placeholder="Filter by Sub-Category"
                  isClearable
                  disabled={!assignmentForm.filterCategory}
                  value={assignmentForm.filterSubCategory ? { label: assignmentForm.filterSubCategory, value: assignmentForm.filterSubCategory } : null}
                  onChange={(opt) => setAssignmentForm({ ...assignmentForm, filterSubCategory: opt?.value || '' })}
                  options={masterSubCategories
                    .filter(sub => {
                      if (!assignmentForm.filterCategory) return true;
                      const selCat = masterCategories.find(c => c.name === assignmentForm.filterCategory);
                      const subCatId = sub.categoryId?._id || sub.categoryId;
                      return selCat && subCatId === selCat._id;
                    })
                    .map(s => ({ label: s.name, value: s.name }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project Type</label>
                <Select
                  styles={selectStyles}
                  placeholder="Filter by Project Type"
                  isClearable
                  disabled={!assignmentForm.filterSubCategory}
                  value={assignmentForm.filterProjectType ? { label: assignmentForm.filterProjectType, value: assignmentForm.filterProjectType } : null}
                  onChange={(opt) => setAssignmentForm({ ...assignmentForm, filterProjectType: opt?.value || '', filterSubProjectType: '' })}
                  options={projectMappings?.length > 0 ? (
                    projectMappings
                      .filter(m => {
                        const selCat = masterCategories.find(c => c.name === assignmentForm.filterCategory);
                        const selSubCat = masterSubCategories.find(sc => sc.name === assignmentForm.filterSubCategory);
                        const mCatId = m.categoryId?._id || m.categoryId;
                        const mSubCatId = m.subCategoryId?._id || m.subCategoryId;
                        return (!selCat || mCatId === selCat._id) && (!selSubCat || mSubCatId === selSubCat._id);
                      })
                      .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map(pt => ({ label: pt, value: pt }))
                  ) : (
                    masterProjectTypes.map(p => ({ label: p, value: p }))
                  )}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Project Type</label>
                <Select
                  styles={selectStyles}
                  placeholder="Filter by Sub Project Type"
                  isClearable
                  disabled={!assignmentForm.filterProjectType}
                  value={assignmentForm.filterSubProjectType ? { label: assignmentForm.filterSubProjectType, value: assignmentForm.filterSubProjectType } : null}
                  onChange={(opt) => setAssignmentForm({ ...assignmentForm, filterSubProjectType: opt?.value || '' })}
                  options={masterSubProjectTypes
                    .filter(sub => {
                      if (!assignmentForm.filterProjectType) return true;
                      
                      // Check mapping for subProjectTypeId if available
                      if (projectMappings?.length > 0) {
                        const activeMapping = projectMappings.find(m => 
                          `${m.projectTypeFrom} to ${m.projectTypeTo} kW` === assignmentForm.filterProjectType
                        );
                        if (activeMapping && activeMapping.subProjectTypeId) {
                          return (sub._id || sub) === (activeMapping.subProjectTypeId._id || activeMapping.subProjectTypeId);
                        }
                      }
                      return true; 
                    })
                    .map(s => ({ label: s.name, value: s.name }))}
                />
              </div>
            </div>
            { (assignmentForm.filterCategory || assignmentForm.filterSubCategory || assignmentForm.filterProjectType || assignmentForm.filterSubProjectType) && (
              <button 
                onClick={() => setAssignmentForm({ ...assignmentForm, filterCategory: '', filterSubCategory: '', filterProjectType: '', filterSubProjectType: '' })}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Clear Advanced Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Table */}
      <style>{scrollbarStyles}</style>
      <div className="mt-8 mb-10" id="result-table-container">
        <div className="table-container bg-white overflow-hidden">
          <div className="p-0">
            <div className="flex justify-between items-center p-5 bg-slate-50 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800">Customize Combokit Details</h3>
              </div>
              <button
                onClick={addNewCustomization}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all shadow-md text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New Configuration
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/30">
                  <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 mb-6 font-medium">No configurations found for the selected filters.</p>
                  <button
                    onClick={addNewCustomization}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg font-bold active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Configuration
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        "Panel", "Inverter", "Boskit", "Country", "State",
                        "Cluster", "Districts", "Partner", "Category",
                        "Sub Category", "Project Type", "Sub Project Type", "Action"
                      ].map((header) => (
                        <th key={header} className="px-4 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      const filtered = assignments.filter(assignment => {
                        // Always show temporary rows being edited
                        if (assignment.tempId) return true;

                        // BYPASS: Always show the record that was just saved or updated
                        const assignmentId = assignment._id || assignment.id;
                        if (lastSavedConfig && (assignmentId === lastSavedConfig._id || assignmentId === lastSavedConfig.id)) {
                          return true;
                        }

                        // --- Extract values from the assignment record ---
                        
                        // State: may be a plain string ID or a populated object
                        const aStateId = getCleanId(assignment.state);

                        // Country: may be at top-level, nested inside populated state object,
                        // OR we find it from the master state list using its ID
                        let aCountryId = getCleanId(assignment.country) || getCleanId(assignment.state?.country);
                        if (!aCountryId && aStateId && allStates?.length > 0) {
                          const stateObj = allStates.find(s => getCleanId(s) === aStateId);
                          if (stateObj) {
                            aCountryId = getCleanId(stateObj.countryId || stateObj.country);
                          }
                        }

                        // Cluster: may be plain string ID or populated object
                        const aClusterId = getCleanId(assignment.cluster);

                        // Districts: array of IDs or objects
                        const aDistricts = (assignment.districts || []).map(getCleanId).filter(Boolean);

                        // Role
                        const aRole = ntext(assignment.role || (Array.isArray(assignment.cpTypes) ? assignment.cpTypes[0] : assignment.cpTypes));

                        // --- Extract active filter values ---
                        const fCountryId = getCleanId(selectedCountry);
                        const fStates    = Array.from(selectedStates).map(getCleanId);
                        const fClusters  = Array.from(selectedClusters).map(getCleanId);
                        const fDistricts = Array.from(selectedDistricts).map(getCleanId);
                        const fRoles     = Array.from(selectedRoles).map(ntext);

                        // --- Apply filters (only active levels filter records) ---

                        // Country filter
                        if (fCountryId) {
                          if (aCountryId !== fCountryId) return false;
                        }

                        // State filter
                        if (fStates.length > 0) {
                          if (!aStateId || !fStates.includes(aStateId)) return false;
                        }

                        // Cluster filter
                        if (fClusters.length > 0) {
                          // If the record has no cluster saved, still show it (cluster not required)
                          if (aClusterId && !fClusters.includes(aClusterId)) return false;
                        }

                        // District filter
                        if (fDistricts.length > 0) {
                          // Show if record has ANY of the selected districts, or no districts saved
                          if (aDistricts.length > 0 && !aDistricts.some(d => fDistricts.includes(d))) return false;
                        }

                        // Role filter
                        if (fRoles.length > 0) {
                          if (aRole && !fRoles.includes(aRole)) return false;
                        }

                        // Category filter
                        if (assignmentForm.filterCategory && assignment.category !== assignmentForm.filterCategory) return false;
                        
                        // Sub Category filter
                        if (assignmentForm.filterSubCategory && assignment.subCategory !== assignmentForm.filterSubCategory) return false;

                        // Project Type filter
                        if (assignmentForm.filterProjectType && assignment.projectType !== assignmentForm.filterProjectType) return false;

                        // Sub Project Type filter
                        if (assignmentForm.filterSubProjectType && assignment.subProjectType !== assignmentForm.filterSubProjectType) return false;

                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="12" className="text-center py-20 bg-gray-50/30">
                              <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-8 h-8" />
                              </div>
                              <p className="text-gray-500 font-medium">No configurations found for the selected filters.</p>
                              <div className="flex flex-col items-center gap-3 mt-4">
                                <button
                                  onClick={() => { setSelectedCountry(''); clearAllStates(); clearAllRoles(); }}
                                  className="text-blue-600 underline text-sm font-semibold hover:text-blue-800"
                                >
                                  Clear All Filters
                                </button>
                                <button
                                  onClick={fetchAssignments}
                                  className="text-indigo-600 underline text-sm font-semibold hover:text-indigo-800"
                                >
                                  Try Refreshing Data
                                </button>
                                <p className="mt-4 text-[10px] text-gray-400">Total records stored: {assignments.length}</p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((assignment, index) => {
                        const aStateId = getCleanId(assignment.state);
                        let aCountryId = getCleanId(assignment.country) || getCleanId(assignment.state?.country);
                        if (!aCountryId && aStateId && allStates?.length > 0) {
                          const stateObj = allStates.find(s => getCleanId(s) === aStateId);
                          if (stateObj) {
                            aCountryId = getCleanId(stateObj.countryId || stateObj.country);
                          }
                        }

                        const districtNames = assignment.districts?.map(d => d.name).join(", ") || "None";
                        const districtsDisplay = districtNames.length > 50 ? districtNames.substring(0, 50) + "..." : districtNames;

                        return (
                          <tr key={`${assignment._id}-${index}`} className="hover:bg-gray-50 transition-colors">


                            <td className="px-2 py-4 min-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {assignment.panels?.length ? assignment.panels.map(p => (
                                  <span key={p} className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{p}</span>
                                )) : <span className="text-gray-400 italic text-[10px]">Not Selected</span>}
                              </div>
                            </td>

                            <td className="px-2 py-4 min-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {assignment.inverters?.length ? assignment.inverters.map(i => (
                                  <span key={i} className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{i}</span>
                                )) : <span className="text-gray-400 italic text-[10px]">Not Selected</span>}
                              </div>
                            </td>

                            <td className="px-2 py-4 min-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {assignment.boskits?.length ? assignment.boskits.map(b => (
                                  <span key={b} className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{b}</span>
                                )) : <span className="text-gray-400 italic text-[10px]">Not Selected</span>}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[100px]">
                               <span className="font-medium">{assignment.country?.name || (countries.find(c => getCleanId(c) === aCountryId)?.name) || <span className="text-gray-400 italic">India</span>}</span>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[100px]">
                              <span className="font-medium">{assignment.state?.name || (allStates.find(s => getCleanId(s) === aStateId)?.name) || <span className="text-gray-400 italic">Not Found</span>}</span>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[120px]">
                              <span>{resolveClusterName(assignment) || <span className="text-gray-400 italic">Not Assigned</span>}</span>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[150px]">
                              <span className="truncate block max-w-[140px]" title={districtNames}>{districtsDisplay}</span>
                            </td>

                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[120px]">
                              {assignment.role || (Array.isArray(assignment.cpTypes) ? assignment.cpTypes[0] : assignment.cpTypes) ? (
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${(assignment.role || assignment.cpTypes?.[0])?.toLowerCase() === 'dealer'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-orange-100 text-orange-700'
                                  }`}>
                                  {assignment.role || (Array.isArray(assignment.cpTypes) ? assignment.cpTypes[0] : assignment.cpTypes)}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Not Assigned</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[130px]">
                              <span>{assignment.category}</span>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[130px]">
                              <span>{assignment.subCategory}</span>
                            </td>

                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[130px]">
                              <span>{assignment.projectType}</span>
                            </td>
                            <td className="px-4 py-4 text-[11px] text-gray-600 min-w-[130px]">
                              <span>{assignment.subProjectType}</span>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end items-center space-x-3">
                                <button
                                  onClick={() => showCombokitDetails(assignment)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(assignment)}
                                  className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-indigo-50"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteAssignmentById(assignment._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Modal View/Filter */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative">
            <div className={`modal-header px-6 py-4 text-white ${getModalHeaderColor()}`}>
              <h3 className="text-lg font-semibold">{modalContent.title}</h3>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body p-6 overflow-y-auto">
              {modalContent.content}
            </div>
            <div className="modal-footer px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="btn btn-secondary px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigureModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 text-white shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Configuration Wizard</p>
                  <h3 className="text-2xl font-black tracking-tight">{currentAssignment ? 'Update Custom Configuration' : 'Create New Configuration'}</h3>
                </div>
                <button onClick={() => setShowConfigureModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: Identity */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                    Plan Identity
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Link To Combokit</label>
                      <Select
                        styles={selectStyles}
                        placeholder="Select ComboKit"
                        value={assignmentForm.combokitId ? { 
                          label: solarKitsList.find(k => getCleanId(k) === getCleanId(assignmentForm.combokitId))?.name || 'Selected Kit', 
                          value: getCleanId(assignmentForm.combokitId) 
                        } : null}
                        onChange={(opt) => setAssignmentForm({ ...assignmentForm, combokitId: opt.value })}
                        options={solarKitsList.map(kit => ({ label: kit.name, value: kit._id }))}
                      />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select"
                          value={assignmentForm.category ? { label: assignmentForm.category, value: assignmentForm.category } : null}
                          onChange={(opt) => setAssignmentForm({ ...assignmentForm, category: opt.value, subCategory: '' })}
                          options={masterCategories.map(cat => ({ label: cat.name, value: cat.name }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Category</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select"
                          value={assignmentForm.subCategory ? { label: assignmentForm.subCategory, value: assignmentForm.subCategory } : null}
                          onChange={(opt) => setAssignmentForm({ ...assignmentForm, subCategory: opt.value })}
                          options={masterSubCategories
                            .filter(sub => {
                              const selCat = masterCategories.find(c => c.name === assignmentForm.category);
                              const subCatId = sub.categoryId?._id || sub.categoryId;
                              return selCat && subCatId === selCat._id;
                            })
                            .map(sub => ({ label: sub.name, value: sub.name }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select Country"
                          value={assignmentForm.country ? { 
                            label: assignmentForm.country.name || (typeof assignmentForm.country === 'string' ? assignmentForm.country : 'Country'), 
                            value: getCleanId(assignmentForm.country) 
                          } : null}
                          onChange={(opt) => {
                            const countryObj = countries.find(c => c._id === opt.value);
                            setAssignmentForm({ ...assignmentForm, country: countryObj, state: null, cluster: null, districts: [] });
                            fetchStates({ countryId: opt.value });
                          }}
                          options={countries.map(c => ({ label: c.name, value: c._id }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select State"
                          value={assignmentForm.state ? { 
                            label: assignmentForm.state.name || (typeof assignmentForm.state === 'string' ? assignmentForm.state : 'State'), 
                            value: getCleanId(assignmentForm.state) 
                          } : null}
                          onChange={async (opt) => {
                            const stateObj = allStates.find(s => s._id === opt.value);
                            setAssignmentForm({ ...assignmentForm, state: stateObj, cluster: null, districts: [] });
                            if (!availableClusters[opt.value]) {
                              const res = await locationAPI.getAllClusters({ stateId: opt.value, isActive: 'true' });
                              if (res.data?.data) {
                                setAvailableClusters(prev => ({ ...prev, [opt.value]: res.data.data }));
                              }
                            }
                          }}
                          options={allStates.map(s => ({ label: s.name, value: s._id }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cluster</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select Cluster"
                          value={assignmentForm.cluster ? { 
                            label: assignmentForm.cluster.name || assignmentForm.cluster.clusterName || (typeof assignmentForm.cluster === 'string' ? assignmentForm.cluster : 'Cluster'), 
                            value: getCleanId(assignmentForm.cluster) 
                          } : null}
                          onChange={async (opt) => {
                            const clusters = availableClusters[getCleanId(assignmentForm.state)] || [];
                            const clusterObj = clusters.find(c => c._id === opt.value) || { _id: opt.value, name: opt.label };
                            setAssignmentForm({ ...assignmentForm, cluster: clusterObj, districts: [] });
                            if (!availableDistricts[opt.value]) {
                              const res = await locationAPI.getAllDistricts({ clusterId: opt.value, isActive: 'true' });
                              if (res.data?.data) {
                                setAvailableDistricts(prev => ({ ...prev, [opt.value]: res.data.data }));
                              }
                            }
                          }}
                          options={(availableClusters[getCleanId(assignmentForm.state)] || []).map(c => ({ label: c.name, value: c._id }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Partner Type</label>
                        <Select
                          styles={selectStyles}
                          placeholder="Select Partner"
                          value={assignmentForm.role ? { label: assignmentForm.role, value: assignmentForm.role } : null}
                          onChange={(opt) => setAssignmentForm({ ...assignmentForm, role: opt.value })}
                          options={partners.map(p => ({ label: p.name, value: p.name }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Districts (Multi-select)</label>
                      <Select
                        isMulti
                        styles={selectStyles}
                        placeholder="Select Districts"
                        value={assignmentForm.districts?.map(d => ({ label: d.name || 'Unknown', value: getCleanId(d) })) || []}
                        onChange={(selected) => {
                          const districts = availableDistricts[getCleanId(assignmentForm.cluster)] || [];
                          const selectedObjs = selected ? selected.map(s => districts.find(d => d._id === s.value) || { _id: s.value, name: s.label }) : [];
                          setAssignmentForm({ ...assignmentForm, districts: selectedObjs });
                        }}
                        options={(availableDistricts[getCleanId(assignmentForm.cluster)] || []).map(d => ({ label: d.name, value: d._id }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project Type Range</label>
                      <Select
                        styles={selectStyles}
                        placeholder="Select Project Type"
                        value={assignmentForm.projectType ? { label: assignmentForm.projectType, value: assignmentForm.projectType } : null}
                        onChange={(opt) => setAssignmentForm({ ...assignmentForm, projectType: opt.value })}
                        options={projectMappings?.length > 0 ? (
                          projectMappings
                            .filter(m => {
                              const selCat = masterCategories.find(c => c.name === assignmentForm.category);
                              const selSubCat = masterSubCategories.find(sc => sc.name === assignmentForm.subCategory);
                              const mCatId = m.categoryId?._id || m.categoryId;
                              const mSubCatId = m.subCategoryId?._id || m.subCategoryId;
                              return (!selCat || mCatId === selCat._id) && (!selSubCat || mSubCatId === selSubCat._id);
                            })
                            .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map(pt => ({ label: pt, value: pt }))
                        ) : (
                          masterProjectTypes.map(pt => ({ label: pt, value: pt }))
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub Project Type</label>
                      <Select
                        styles={selectStyles}
                        placeholder="Select Sub Project Type"
                        value={assignmentForm.subProjectType ? { label: assignmentForm.subProjectType, value: assignmentForm.subProjectType } : null}
                        onChange={(opt) => setAssignmentForm({ ...assignmentForm, subProjectType: opt.value })}
                        options={masterSubProjectTypes
                          .filter(spt => {
                            if (!assignmentForm.projectType) return true;
                            // Add logic if Sub Project Type depends on Project Type in the DB
                            // For now, if project type is selected, we might want to filter, but SubProjectType usually linked via ID
                            return true; 
                          })
                          .map(spt => ({ label: spt.name, value: spt.name }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Technical Specs */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
                    Technical Specifications
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Solar Panel Brands</label>
                      <Select
                        isMulti
                        styles={selectStyles}
                        placeholder="Select Brands"
                        value={assignmentForm.panels?.map(p => ({ label: p, value: p })) || []}
                        onChange={(selected) => setAssignmentForm({ ...assignmentForm, panels: selected ? selected.map(s => s.value) : [] })}
                        options={panelOptions.map(p => ({ label: p, value: p }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Inverter Models</label>
                      <Select
                        isMulti
                        styles={selectStyles}
                        placeholder="Select Models"
                        value={assignmentForm.inverters?.map(i => ({ label: i, value: i })) || []}
                        onChange={(selected) => setAssignmentForm({ ...assignmentForm, inverters: selected ? selected.map(s => s.value) : [] })}
                        options={inverterOptions.map(i => ({ label: i, value: i }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">BOS Kit Components</label>
                      <Select
                        isMulti
                        styles={selectStyles}
                        placeholder="Select Components"
                        value={assignmentForm.boskits?.map(b => ({ label: b, value: b })) || []}
                        onChange={(selected) => setAssignmentForm({ ...assignmentForm, boskits: selected ? selected.map(s => s.value) : [] })}
                        options={boskitOptions.map(b => ({ label: b, value: b }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-tight">
                    Applying to <span className="text-blue-600">{(assignmentForm.cluster?.name || assignmentForm.state?.name) || 'Selected'}</span> context
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfigureModal(false)}
                    className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-black rounded-xl hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    {currentAssignment ? 'UPDATE CONFIG' : 'SAVE CONFIGURATION'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizeCombokit;