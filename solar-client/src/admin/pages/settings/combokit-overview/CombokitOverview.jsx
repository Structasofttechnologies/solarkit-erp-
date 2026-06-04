import React, { useState, useEffect } from 'react';
import {
  Eye,
  Filter,
  X,
  Check,
  AlertCircle,
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getCategories,
  getSubCategories,
  getProjectTypes,
  getSubProjectTypes,
  getProjectCategoryMappings,
  getPartnerTypes
} from '../../../../services/combokit/combokitApi';
import { locationAPI } from '../../../../api/api';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// MultiSelect Component (Kept same)
const MultiSelect = ({ id, placeholder, options = [], selected = [], onSelect, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
  };

  const handleRemove = (value) => {
    onRemove(value);
  };

  const selectedCount = selected.length;
  const displayText = selectedCount > 0
    ? `${selectedCount} selected`
    : placeholder;

  return (
    <div className="relative w-full">
      <div
        className="flex flex-wrap items-center min-h-[38px] border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer bg-white gap-2 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.map((value) => {
          const option = options.find(opt => opt.value === value);
          return (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded"
            >
              {option?.label || value}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(value);
                }}
                className="hover:text-gray-200"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
        {selected.length === 0 && (
          <span className="text-gray-500">{displayText}</span>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selected.includes(option.value) ? 'bg-gray-100 font-medium' : ''
                  }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Notification Component (Kept same)
const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-medium">Status Update</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 py-3">
          {message}
        </div>
      </div>
    </div>
  );
};

// Helper for placeholder images using inline SVG to prevent network errors
const getPlaceholderImage = (type) => {
  const text = type === 'panel' ? 'Panel' : type === 'inverter' ? 'Inverter' : type === 'boskit' ? 'BOS Kit' : 'Image';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40"><rect width="60" height="40" fill="#e2e8f0"/><text x="50%" y="50%" fill="#64748b" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Main Component
export default function CombokitOverview() {
  // --- Data States ---
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [combokits, setCombokits] = useState([]); // Assignments
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'details'
  const [dateRange, setDateRange] = useState({
    start: '2026-02-14',
    end: '2026-03-16'
  });

  // --- Selection States ---
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Filter states
  const [selectedFilterDistricts, setSelectedFilterDistricts] = useState([]); // Districts selected in filter dropdown
  const [selectedUserTypes, setSelectedUserTypes] = useState([]);

  // --- Filters ---
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    subProjectType: '',
    projectType: ''
  });

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Master Data States ---
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterSubCategories, setMasterSubCategories] = useState([]);
  const [masterProjectTypes, setMasterProjectTypes] = useState([]);
  const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [masterPartnerTypes, setMasterPartnerTypes] = useState([]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      setLoading(true);
      await deleteAssignment(id);
      toast.success('Assignment deleted successfully');
      fetchAssignments(selectedCity?._id);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  // --- Options Maps (for UI filters) ---
  const userTypeOptions = masterPartnerTypes.map(p => ({
    value: p.name,
    label: p.name
  }));

  const getSubCategoryOptions = () => {
    if (!filters.category) return [];
    const selCat = masterCategories.find(c => c.name === filters.category);
    if (!selCat) return [];
    return masterSubCategories
      .filter(sub => {
        const subCatId = sub.categoryId?._id || sub.categoryId;
        return subCatId === selCat._id;
      })
      .map(sub => ({ value: sub.name, label: sub.name }));
  };

  const getProjectTypeOptions = () => {
    if (projectMappings?.length > 0) {
      const selCat = masterCategories.find(c => c.name === filters.category);
      const selSubCat = masterSubCategories.find(sc => sc.name === filters.subCategory);

      return projectMappings
        .filter(m => {
          const mCatId = m.categoryId?._id || m.categoryId;
          const mSubCatId = m.subCategoryId?._id || m.subCategoryId;
          return (!selCat || mCatId === selCat._id) && (!selSubCat || mSubCatId === selSubCat._id);
        })
        .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(pt => ({ value: pt, label: pt }));
    }
    return masterProjectTypes.map(pt => ({ value: pt.name, label: pt.name }));
  };

  // --- Initial Load ---
  useEffect(() => {
    fetchCountries();
    fetchAssignments(); // Load all by default
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, subCats, projs, subProjs, mappings, partners] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getProjectTypes(),
        getSubProjectTypes(),
        getProjectCategoryMappings(),
        getPartnerTypes()
      ]);

      setMasterCategories(cats || []);
      setMasterSubCategories(subCats || []);
      setMasterProjectTypes(projs || []);
      setMasterSubProjectTypes(subProjs || []);
      setProjectMappings(mappings || []);
      setMasterPartnerTypes(partners || []);
    } catch (err) {
      console.error("Error fetching master data:", err);
    }
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllCountries({ isActive: true });
      if (response.data && response.data.data) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      showNotification("Error loading countries");
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllStates({ countryId, isActive: true });
      if (response.data && response.data.data) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      showNotification("Error loading states");
    } finally {
      setLoading(false);
    }
  };

  const fetchClusters = async (stateId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllClusters({ stateId, isActive: true });
      if (response.data && response.data.data) {
        setClusters(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clusters:", error);
      showNotification("Error loading clusters");
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (clusterId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllDistricts({ clusterId, isActive: true });
      if (response.data && response.data.data) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      showNotification("Error loading districts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (districtId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getAllCities({ districtId, isActive: true });
      if (response.data && response.data.data) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showNotification("Error loading cities");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
  };

  // --- Handlers ---

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCluster(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setStates([]);
    setClusters([]);
    setDistricts([]);
    setCities([]);
    fetchStates(country._id);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCluster(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setClusters([]);
    setDistricts([]);
    setCities([]);
    fetchClusters(state._id);
  };

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setDistricts([]);
    setCities([]);
    fetchDistricts(cluster._id);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSelectedCity(null);
    setCities([]);
    fetchCities(district._id);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    fetchAssignments(city._id);
  };

  const fetchAssignments = async (cityId) => {
    try {
      const params = cityId ? { city: cityId } : {};
      const response = await getAssignments(params);
      setCombokits(response || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      showNotification("Error loading assignments");
    }
  };

  const toggleStatus = async (assignment, isActive) => {
    try {
      const newStatus = isActive ? 'Active' : 'Inactive';
      await updateAssignment(assignment._id, { status: newStatus });

      // Update local state
      setCombokits(prev => prev.map(item =>
        item._id === assignment._id ? { ...item, status: newStatus } : item
      ));

      showNotification(`${assignment.comboKitId?.name} is now ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status");
    }
  };

  const getSalesBadgeColor = (volume) => {
    // We don't have sales volume in assignment yet, mock or use price/capacity?
    // Using 0 as default
    if (volume > 1500) return 'bg-green-500';
    if (volume > 1000) return 'bg-blue-500';
    if (volume > 500) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // --- Filtering Logic ---
  const getFilteredCombokits = () => {
    // Flatten assignments into individual combokits
    const flattenedCombokits = combokits.flatMap(assignment => {
      if (!assignment.comboKits || assignment.comboKits.length === 0) return [];
      return assignment.comboKits.map((kit, index) => ({
        ...assignment,          // Contains assignment level info (districts, role, cpTypes, status, category etc)
        comboKitData: kit,      // The individual kit details (name, panelBrand, etc)
        uniqueId: `${assignment._id}-${index}`
      }));
    });

    return flattenedCombokits.filter(item => {
      // Category fields are on the assignment level
      if (filters.category && item.category !== filters.category) return false;
      if (filters.subCategory && item.subCategory !== filters.subCategory) return false;
      if (filters.subProjectType && item.subProjectType !== filters.subProjectType) return false;
      if (filters.projectType && item.projectType !== filters.projectType) return false;

      // District Filter (MultiSelect)
      if (selectedFilterDistricts.length > 0 && item.districts) {
        // item.districts usually populated array of objects, map to IDs for check
        const assignmentDistrictIds = item.districts.map(d => typeof d === 'object' ? d._id : d);
        const hasDistrictMatch = selectedFilterDistricts.some(d => assignmentDistrictIds.includes(d));
        if (!hasDistrictMatch) return false;
      }

      // User Type (Role / CP Type) Filter
      if (selectedUserTypes.length > 0) {
        if (!selectedUserTypes.includes(item.role)) {
          // Fallback to cpTypes array if role isn't definitively set
          const hasCpTypeMatch = selectedUserTypes.some(type => item.cpTypes?.includes(type));
          if (!hasCpTypeMatch) return false;
        }
      }

      return true;
    });
  };

  const filteredCombokits = getFilteredCombokits();

  const handleViewOverview = () => {
    if (!selectedState || !selectedCity) {
      showNotification('Please select a state and city first');
      return;
    }
    setViewMode('details');
  };

  if (viewMode === 'details') {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-10">


        <div className="container mx-auto px-6 py-8">
          {/* Dashboard Title & Back Link */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                {selectedState?.name} - {selectedCluster?.name} Combokits
              </h2>
              <div className="flex items-center gap-6 mt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  STATE: <span className="text-slate-700">{selectedState?.name}</span>
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  CLUSTER: <span className="text-slate-700">{selectedCluster?.name}</span>
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  TOTAL COMBOKITS: <span className="text-slate-700">{filteredCombokits.length}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('overview')}
              className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              ← Back to Overview
            </button>
          </div>

          {/* Date Filter Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Filter size={14} className="text-slate-500" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Date Range Filter</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <button className="bg-indigo-600 text-white rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Filter size={14} /> Apply Filter
              </button>
              <button className="bg-slate-500 text-white rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 shadow-lg shadow-slate-100">
                ↺ Reset
              </button>
            </div>

            <div className="mt-6 px-6 py-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider text-center">
                Showing data from {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
              </p>
            </div>
          </div>            {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-l-4 border-l-indigo-500 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Top Selling Combokit</p>
              <h4 className="text-xl font-black text-slate-800 mt-2">{filteredCombokits[0]?.comboKitData?.name || 'N/A'}</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Highest sales volume</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">High Demand Today</p>
              <h4 className="text-xl font-black text-slate-800 mt-2">{filteredCombokits[1]?.comboKitData?.name || filteredCombokits[0]?.comboKitData?.name || 'N/A'}</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Most in demand</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-l-rose-500 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Inactive Combokits</p>
              <h4 className="text-xl font-black text-slate-800 mt-2">{filteredCombokits.filter(k => k.status === 'Inactive').length}</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Currently not active</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Low Order Volume</p>
              <h4 className="text-xl font-black text-slate-800 mt-2">{filteredCombokits.filter(k => (k.salesVolume || 0) < 1000).length}</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Less than <span className="text-indigo-600">1000</span> kits</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <h4 className="text-emerald-500 text-sm font-black uppercase tracking-[0.2em] mb-4">Good Order Volume</h4>
              <div className="text-6xl font-black text-emerald-500 mb-2">{filteredCombokits.filter(k => (k.salesVolume || 0) >= 1000).length}</div>
              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                <span className="text-slate-800">1000+</span> kits sold
              </p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h4 className="text-slate-800 text-sm font-black uppercase tracking-[0.2em] mb-8 text-center" >Top 5 Combokits by Sales</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {filteredCombokits.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative mb-4">
                      <div className="w-16 h-22 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden transition-all group-hover:shadow-md group-hover:scale-105">
                        <img
                          src={item.comboKitData?.image || getPlaceholderImage('panel')}
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                        #{idx + 1}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate w-full text-center px-1">{item.comboKitData?.name || 'N/A'}</span>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter mt-0.5">{item.salesVolume || 0} kits</span>
                  </div>
                ))}
                {filteredCombokits.length === 0 && (
                  <p className="col-span-5 text-center text-slate-400 text-[10px] py-10 font-bold uppercase tracking-widest">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Status Legend</h4>
            <div className="flex flex-wrap gap-10">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-rose-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inactive Combokit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-amber-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Low Volume Order (1000 kits)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Good Volume Order(1000+ kits)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-indigo-600"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Selling Combokit</span>
              </div>
            </div>
          </div>

          {/* Detailed Table Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="Search Combokits..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <select className="flex-1 md:flex-none py-3 px-6 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer">
                  <option>Sort by Combokit Name</option>
                  <option>Sales Volume: High to Low</option>
                  <option>Sales Volume: Low to High</option>
                  <option>Status</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-600/5">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50">Combokit Name</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50">Panel</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50">Inverter</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50">Boskit</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50">CP Type</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50 text-center">Sales Volume</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100/50 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCombokits.map((item, idx) => {
                    const kit = item.comboKitData;
                    const districtName = item.districts && item.districts.length > 0
                      ? (typeof item.districts[0] === 'object' ? item.districts[0].name : 'Ahmedabad')
                      : 'Ahmedabad';

                    return (
                      <tr key={item.uniqueId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{kit.name || 'N/A'}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-16 bg-slate-50 rounded-xl mb-2 flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                              <img src={kit.image || getPlaceholderImage('panel')} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed max-w-[80px]">{kit.panelBrand} SOLAR PANEL</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-10 bg-slate-50 rounded-xl mb-2 flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                              <img src={getPlaceholderImage('inverter')} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">{kit.inverterBrand} INVERTER</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-10 bg-slate-50 rounded-xl mb-2 flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                              <img src={getPlaceholderImage('boskit')} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">BOS KIT CONFIG</span>
                          </div>
                        </td>

                        <td className="p-6">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.role || item.cpTypes?.[0] || 'N/A'}</span>
                        </td>
                        <td className="p-6 text-center">
                          <div className="inline-block px-4 py-2 bg-slate-500/10 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {item.salesVolume || 0} kits
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCombokits.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No assignments found to display in details.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Footer */}
        <div className="mt-12 text-center py-10 border-t border-slate-200">
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Copyright © 2025 Solarkits. All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}



        {selectedCity && (
          <div className="mb-2">
            <div className="px-8 py-4 bg-white rounded-xl shadow-sm border border-slate-100 w-fit min-w-[200px] text-center">
              <span className="text-sm font-black text-slate-600 uppercase tracking-widest">{selectedCity.name}</span>
            </div>
          </div>
        )}


      {/* Country Selection */}
      <div className="mb-6">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Select a Country</label>
        {loading && !countries.length ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {countries.map((country) => (
              <div
                key={country._id}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${selectedCountry?._id === country._id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:shadow-md'
                  }`}
                onClick={() => handleCountrySelect(country)}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold leading-tight">{country.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* State Selection */}
      {selectedCountry && (
        <div className="mb-6 animate-fadeIn">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">
            Select a State - {selectedCountry.name}
          </label>
          {states.length === 0 && !loading ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No states found for this country.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {states.map((state) => (
                <div
                  key={state._id}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${selectedState?._id === state._id
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  onClick={() => handleStateSelect(state)}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold leading-tight">{state.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${selectedState?._id === state._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {state.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cluster Selection */}
      {selectedState && (
        <div className="mb-6 animate-fadeIn">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">
            Select a Cluster - {selectedState.name}
          </label>
          {clusters.length === 0 && !loading ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No clusters found for this state.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${selectedCluster?._id === cluster._id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  onClick={() => handleClusterSelect(cluster)}
                >
                  <span className="text-xs font-bold">{cluster.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* District Selection */}
      {selectedCluster && (
        <div className="mb-6 animate-fadeIn">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">
            Select a District - {selectedCluster.name}
          </label>
          {districts.length === 0 && !loading ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No districts found for this cluster.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {districts.map((district) => (
                <div
                  key={district._id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${selectedDistrict?._id === district._id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <span className="text-xs font-bold">{district.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* City Selection */}
      {selectedDistrict && (
        <div className="mb-8 animate-fadeIn">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">
            Select a City - {selectedDistrict.name}
          </label>
          {cities.length === 0 && !loading ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No cities found for this district.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cities.map((city) => (
                <div
                  key={city._id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${selectedCity?._id === city._id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  onClick={() => handleCitySelect(city)}
                >
                  <span className="text-xs font-bold">{city.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Section */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 animate-fadeIn mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Category */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Category
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: '' })}
            >
              <option value="">All Categories</option>
              {masterCategories.map(cat => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Sub Category
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              value={filters.subCategory}
              onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
            >
              <option value="">All Sub Categories</option>
              {getSubCategoryOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Project Type */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Sub Project Type
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              value={filters.subProjectType}
              onChange={(e) => setFilters({ ...filters, subProjectType: e.target.value })}
            >
              <option value="">All Sub Types</option>
              {masterSubProjectTypes.map(spt => (
                <option key={spt._id} value={spt.name}>
                  {spt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Project Type / Capacity
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              value={filters.projectType}
              onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
            >
              <option value="">Select Project Type</option>
              {getProjectTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>



          {/* CP Type (User Type) Multi-select */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              User Type
            </label>
            <MultiSelect
              id="userType"
              placeholder="Select User Types"
              options={userTypeOptions}
              selected={selectedUserTypes}
              onSelect={(value) => setSelectedUserTypes([...selectedUserTypes, value])}
              onRemove={(value) => setSelectedUserTypes(selectedUserTypes.filter(c => c !== value))}
            />
          </div>

          {/* Apply Filters Button */}
          <div className="md:col-span-6 flex items-end">
            <button
              className="w-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              onClick={() => {
                showNotification('Filters applied locally');
              }}
            >
              <Filter size={14} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="animate-fadeIn">
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-6">
          <div className="flex flex-col justify-between mb-8 md:flex-row md:items-center">
            <div className="flex flex-col">
              <h5 className="text-2xl font-black text-slate-800 tracking-tight">Combokit Overview</h5>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage and monitor all combo kit assignments</p>
            </div>
            <div className="flex items-center gap-4">
              {selectedCountry && selectedState && selectedCluster && selectedDistrict && selectedCity && (
                <div className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <span>{selectedCountry.name}</span>
                  <ChevronRight size={10} className="opacity-50" />
                  <span>{selectedState.name}</span>
                  <ChevronRight size={10} className="opacity-50" />
                  <span>{selectedCluster.name} CLUSTER</span>
                  <ChevronRight size={10} className="opacity-50" />
                  <span>{selectedCity.name}</span>
                </div>
              )}
              <button
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
                onClick={handleViewOverview}
              >
                <Eye size={14} />
                View Overview
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
            {filteredCombokits.length === 0 ? (
              <div className="text-center py-32 bg-slate-50/50">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No combokits found</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-medium">Adjust your filters or selection to find established configurations.</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Combokit Name</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Panel</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Inverter</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Boskit</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCombokits.map((item) => {
                    const kit = item.comboKitData;
                    const districtName = item.districts && item.districts.length > 0
                      ? (typeof item.districts[0] === 'object' ? item.districts[0].name : 'Ahmedabad')
                      : 'Ahmedabad';

                    return (
                      <tr key={item.uniqueId} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="p-6">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{kit.name || 'test'}</span>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
                              <img src={kit.image || getPlaceholderImage('panel')} alt="P" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{kit.panelBrand || 'adani'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{kit.panelSkus?.length || 1} SKUs</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
                              <img src={getPlaceholderImage('inverter')} alt="I" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{kit.inverterBrand || 'Microtek'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Brand only</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
                              <img src={getPlaceholderImage('boskit')} alt="B" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">BOS Kit Config</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{kit.bomSections?.length || 0} Sections</span>
                            </div>
                          </div>
                        </td>



                        <td className="p-6">
                          <div className="flex flex-col items-start gap-1">
                            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                              {item.role || item.cpTypes?.[0] || 'ENTERPRISE'}
                            </span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">PLAN</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

