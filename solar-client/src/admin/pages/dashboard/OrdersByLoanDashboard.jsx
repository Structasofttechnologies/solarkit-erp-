import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  Filter,
  Calendar,
  Package,
  Building,
  Handshake,
  Eye,
  Download,
  MapPin,
  X,
  Users,
  TrendingUp,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';
import { getLoanApplications, getLoanStats, getLoanCountsByLocation } from '../../../services/loan/loanApi';
import * as masterApi from '../../../services/core/masterApi';
import salesSettingsService from '../../../services/settings/salesSettingsApi';

function MultiSelect({ label, options, selected, onChange, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter(item => item !== id)
      : [...selected, id];
    onChange(newSelected);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div 
        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm cursor-pointer flex justify-between items-center min-h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="truncate text-gray-700">
          {selected.length === 0 ? placeholder : 
           selected.length === options.length ? 'All Selected' :
           `${selected.length} Selected`}
        </div>
        <Filter className="h-4 w-4 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto p-2">
          <div 
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border-b mb-1"
            onClick={() => {
              if (selected.length === options.length) onChange([]);
              else onChange(options.map(o => o._id || o.id));
            }}
          >
            <input type="checkbox" checked={selected.length === options.length && options.length > 0} readOnly />
            <span className="text-sm font-bold">Select All</span>
          </div>
          {options.map(opt => (
            <div 
              key={opt._id || opt.id} 
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => toggleOption(opt._id || opt.id)}
            >
              <input type="checkbox" checked={selected.includes(opt._id || opt.id)} readOnly />
              <span className="text-sm">{opt.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ tone = 'gray', children, className = '' }) {
  const map = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${map[tone] || map.gray} ${className}`}>
      {children}
    </span>
  );
}

export default function OrdersByLoanDashboard() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bank-loans');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [locationVisible, setLocationVisible] = useState(true);
  const [showStates, setShowStates] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

  const [filters, setFilters] = useState({
    timeline: '',
    quarter: '',
    category: '',
    subcategory: '',
    projectType: '',
    subType: '',
  });

  const [bankLoansData, setBankLoansData] = useState([]);
  const [privateLoansData, setPrivateLoansData] = useState([]);
  const [franchisees, setFranchisees] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [partnerPlans, setPartnerPlans] = useState([]);
  
  const [selectedFranchisees, setSelectedFranchisees] = useState([]);
  const [selectedPartnerTypes, setSelectedPartnerTypes] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalLoanAmount: 0,
    totalDisbursed: 0,
    overdue: 0
  });
  const [locationCounts, setLocationCounts] = useState({ states: [], clusters: [], districts: [] });

  const { countries, states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();
  const selectedCountry = countries.find((c) => c._id === selectedCountryId) || null;
  const selectedState = states.find((s) => s._id === selectedStateId) || null;
  const selectedCluster = clusters.find((c) => c._id === selectedClusterId) || null;
  const selectedDistrict = districts.find((d) => d._id === selectedDistrictId) || null;

  // Summary calculations
  const totalFiles = stats?.totalFiles || 0;
  const totalLoanAmount = stats?.totalLoanAmount || 0;
  const totalDisbursed = stats?.totalDisbursed || 0;
  const disbursedPercentage = (totalLoanAmount && totalLoanAmount > 0) ? Math.round((totalDisbursed / totalLoanAmount) * 100) : 0;
  const overdueCount = stats?.overdue || 0;

  // Get status class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'disbursed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  // Handle selection chain
  const handleCountrySelect = (countryId) => {
    setSelectedCountryId(countryId);
    setSelectedStateId('');
    setSelectedClusterId('');
    setSelectedDistrictId('');
    setShowStates(true);
    setShowClusters(false);
    setShowDistricts(false);
    fetchStates({ countryId });
  };

  const handleStateSelect = (stateId) => {
    setSelectedStateId(stateId);
    setSelectedClusterId('');
    setSelectedDistrictId('');
    setShowClusters(true);
    setShowDistricts(false);
    fetchClusters({ stateId });
  };

  const handleClusterSelect = (clusterId) => {
    setSelectedClusterId(clusterId);
    setSelectedDistrictId('');
    setShowDistricts(true);
    fetchDistricts({ clusterId });
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistrictId(districtId);
  };

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates({ countryId: selectedCountryId });
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      fetchClusters({ stateId: selectedStateId });
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedClusterId) {
      fetchDistricts({ clusterId: selectedClusterId });
    }
  }, [selectedClusterId]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, ptRes, mappingRes, sptRes] = await Promise.all([
          masterApi.getCategories(),
          masterApi.getProjectTypes(),
          masterApi.getProjectCategoryMappings({ status: true }),
          masterApi.getSubProjectTypes()
        ]);
        setCategories(catRes.data || []);
        setProjectTypes(ptRes.data || []);
        setAllMappings(mappingRes.data || []);
        setSubProjectTypes(sptRes.data || []);
        
        const [fRes, partnerTypeRes, ppRes] = await Promise.all([
          masterApi.getUsersByRole('franchisee'),
          masterApi.getPartnerTypes(),
          masterApi.getPartnerPlans()
        ]);
        setFranchisees(fRes.data || []);
        setPartnerTypes(partnerTypeRes.data || []);
        setPartnerPlans(ppRes.data || []);
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    };
    loadMasterData();
    
    const fetchCounts = async () => {
      try {
        const res = await getLoanCountsByLocation();
        if (res.success) setLocationCounts(res.data);
      } catch (err) {
        console.error('Error fetching location counts:', err);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!filters.category) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await masterApi.getSubCategories({ categoryId: filters.category });
        setSubCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    fetchSubCategories();
  }, [filters.category]);

  // Unique data from mappings for those specific ranges in the dropdown
  const mappingOptions = (() => {
    let filtered = allMappings || [];
    
    // Defensive filtering: handle both populated objects and ID strings
    if (selectedStateId) {
      filtered = filtered.filter(m => {
        const mStateId = typeof m.stateId === 'object' ? m.stateId?._id : m.stateId;
        return mStateId === selectedStateId;
      });
    }
    if (selectedClusterId) {
      filtered = filtered.filter(m => {
        const mClusterId = typeof m.clusterId === 'object' ? m.clusterId?._id : m.clusterId;
        return mClusterId === selectedClusterId;
      });
    }
    if (filters.category) {
      filtered = filtered.filter(m => {
        const mCatId = typeof m.categoryId === 'object' ? m.categoryId?._id : m.categoryId;
        return mCatId === filters.category;
      });
    }
    if (filters.subcategory) {
      filtered = filtered.filter(m => {
        const mSubCatId = typeof m.subCategoryId === 'object' ? m.subCategoryId?._id : m.subCategoryId;
        return mSubCatId === filters.subcategory;
      });
    }

    const uniqueRanges = [];
    const uniqueSubTypes = [];
    const rangeKeys = new Set();
    const subTypeKeys = new Set();

    filtered.forEach(m => {
       if (m.projectTypeFrom !== undefined && m.projectTypeTo !== undefined) {
         const rangeLabel = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
         if (!rangeKeys.has(rangeLabel)) {
           rangeKeys.add(rangeLabel);
           uniqueRanges.push({ id: rangeLabel, name: rangeLabel, from: m.projectTypeFrom, to: m.projectTypeTo });
         }
       }
       
       const stId = m.subProjectTypeId?._id || m.subProjectTypeId;
       if (stId && !subTypeKeys.has(stId)) {
          subTypeKeys.add(stId);
          uniqueSubTypes.push({ 
            _id: stId, 
            name: (typeof m.subProjectTypeId === 'object' ? m.subProjectTypeId?.name : null) || 'On-Grid' 
          });
       }
    });

    return { ranges: uniqueRanges, subTypes: uniqueSubTypes };
  })();

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = {
        country: selectedCountryId,
        state: selectedStateId,
        cluster: selectedClusterId,
        district: selectedDistrictId,
        timeline: filters.timeline,
        category: filters.category,
        subCategory: filters.subcategory,
        subType: filters.subType,
        franchiseeId: selectedFranchisees.join(','),
        partnerType: selectedPartnerTypes.join(','),
        plan: selectedPlans.join(',')
      };

      // Handle Project Type Range
      if (filters.projectType && filters.projectType.includes('to')) {
        const parts = filters.projectType.split(' ');
        queryParams.projectTypeFrom = parts[0];
        queryParams.projectTypeTo = parts[2];
      } else if (filters.projectType) {
        queryParams.projectType = filters.projectType;
      }

      const statsRes = await getLoanStats(queryParams);
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      const loansRes = await getLoanApplications({
        ...queryParams,
        loanType: activeTab === 'bank-loans' ? 'bank' : 'private'
      });

      if (loansRes.success) {
        if (activeTab === 'bank-loans') {
          setBankLoansData(loansRes.data);
        } else {
          setPrivateLoansData(loansRes.data);
        }
      }
    } catch (err) {
      console.error('Error fetching loan data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, filters.timeline, filters.category, filters.projectType, filters.subcategory, filters.subType, selectedFranchisees, selectedPartnerTypes, selectedPlans]);

  // Chart Data Calculations
  const chartData = React.useMemo(() => {
    const allData = [...bankLoansData, ...privateLoansData];
    
    // Status distribution
    const statusMap = { 'Pending': 0, 'Approved': 0, 'Disbursed': 0, 'Rejected': 0, 'Active': 0, 'Closed': 0 };
    allData.forEach(loan => {
      if (statusMap[loan.status] !== undefined) statusMap[loan.status]++;
    });

    // Monthly trends (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      trends[key] = 0;
    }

    allData.forEach(loan => {
      const d = new Date(loan.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      if (trends[key] !== undefined) trends[key]++;
    });

    return {
      statusSeries: Object.values(statusMap),
      statusLabels: Object.keys(statusMap),
      trendLabels: Object.keys(trends),
      trendSeries: Object.values(trends)
    };
  }, [bankLoansData, privateLoansData]);

  const filteredBankLoans = bankLoansData;
  const filteredPrivateLoans = privateLoansData;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCountryId('');
    setSelectedStateId('');
    setSelectedClusterId('');
    setSelectedDistrictId('');
    setShowStates(false);
    setShowClusters(false);
    setShowDistricts(false);
    setFilters({
      timeline: '',
      quarter: '',
      category: '',
      subcategory: '',
      projectType: '',
      subType: '',
    });
    setBankFranchiseeFilter('');
    setPrivateFranchiseeFilter('');
  };

  // Get progress bar color
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // View loan details
  const viewLoanDetails = (type, id) => {
    alert(`View ${type} loan details for ID: ${id}`);
  };

  // Export table
  const exportTable = (type) => {
    alert(`Exporting ${type} table data`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="mb-4">
        <nav className="breadcrumb bg-white p-3 rounded shadow-sm">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <Banknote className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-600 mb-0">Order by Loan Dashboard</h3>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Franchisee Order
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dealer Order
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Location Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h5 className="font-semibold text-gray-800">Location Selection</h5>
          </div>
          <button
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={() => setLocationVisible(!locationVisible)}
          >
            {locationVisible ? (
              <>
                <Eye className="h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show
              </>
            )}
          </button>
        </div>

        {locationVisible && (
          <div className="p-4 space-y-6">
            {/* Country Selection */}
            <div>
              <h6 className="font-medium text-gray-700 mb-3">Select Country</h6>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${!selectedCountryId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => handleCountrySelect('')}
                >
                  <div className="text-2xl text-center mb-1">🌍</div>
                  <h6 className="font-bold text-center mb-0">All Countries</h6>
                </div>
                {countries.map((country) => (
                  <div
                    key={country._id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedCountryId === country._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleCountrySelect(country._id)}
                  >
                    <div className="text-2xl text-center mb-1">🏳️</div>
                    <h6 className="font-bold text-center mb-0">{country.name}</h6>
                    <div className="mt-2 flex justify-center">
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stats?.totalFiles || 0} Files
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* State Selection */}
            {showStates && (
              <div>
                <h6 className="font-medium text-gray-700 mb-3">Select State</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${!selectedStateId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleStateSelect('')}
                  >
                    <h6 className="font-bold text-center mb-1">All States</h6>
                    <small className="text-gray-500 text-center block mb-2">{selectedCountry?.name || 'Global'}</small>
                    <div className="flex justify-center">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stats?.totalFiles || 0} Files
                      </span>
                    </div>
                  </div>
                  {states.map((state) => {
                    const count = locationCounts.states?.find(s => s._id === state._id)?.count || 0;
                    return (
                      <div
                        key={state._id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedStateId === state._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => handleStateSelect(state._id)}
                      >
                        <h6 className="font-bold text-center mb-1">{state.name}</h6>
                        <small className="text-gray-500 text-center block mb-2">{selectedCountry?.name || ''}</small>
                        <div className="flex justify-center">
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {count} Files
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cluster Selection */}
            {showClusters && (
              <div>
                <h6 className="font-medium text-gray-700 mb-3">Select Cluster</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${!selectedClusterId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleClusterSelect('')}
                  >
                    <h6 className="font-bold text-center mb-1">All Clusters</h6>
                    <small className="text-gray-500 text-center block mb-2">{selectedState?.name || 'All States'}</small>
                    <div className="flex justify-center">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stats?.totalFiles || 0} Files
                      </span>
                    </div>
                  </div>
                  {clusters.map((cluster) => {
                    const count = locationCounts.clusters?.find(c => c._id === cluster._id)?.count || 0;
                    return (
                      <div
                        key={cluster._id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedClusterId === cluster._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => handleClusterSelect(cluster._id)}
                      >
                        <h6 className="font-bold text-center mb-1">{cluster.name}</h6>
                        <small className="text-gray-500 text-center block mb-2">{selectedState?.name || ''}</small>
                        <div className="flex justify-center">
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {count} Files
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* District Selection */}
            {showDistricts && (
              <div>
                <h6 className="font-medium text-gray-700 mb-3">Select District</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <div
                     className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${!selectedDistrictId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                     onClick={() => handleDistrictSelect('')}
                   >
                     <h6 className="font-bold text-center mb-1">All Districts</h6>
                     <small className="text-gray-500 text-center block mb-2">{selectedCluster?.name || 'All Clusters'}</small>
                     <div className="flex justify-center">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stats?.totalFiles || 0} Files
                      </span>
                    </div>
                   </div>
                   {districts.map((district) => {
                      const count = locationCounts.districts?.find(d => d._id === district._id)?.count || 0;
                      return (
                        <div
                          key={district._id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedDistrictId === district._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => handleDistrictSelect(district._id)}
                        >
                          <h6 className="font-bold text-center mb-1">{district.name}</h6>
                          <small className="text-gray-500 text-center block mb-2">{selectedCluster?.name || ''}</small>
                          <div className="flex justify-center">
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {count} Files
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Other Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.timeline}
            onChange={(e) => setFilters({ ...filters, timeline: e.target.value })}
          >
            <option value="" disabled className="text-gray-400">Select Timeline</option>
            <option value="lastweek">Last Week</option>
            <option value="lastmonth">Last Month</option>
            <option value="last3month">Last 3 Month</option>
            <option value="last6month">Last 6 Month</option>
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.quarter}
            onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
          >
            <option value="" disabled className="text-gray-400">Select Quarter</option>
            <option value="Q1">Q1 (Jan - Mar)</option>
            <option value="Q2">Q2 (Apr - Jun)</option>
            <option value="Q3">Q3 (Jul - Sep)</option>
            <option value="Q4">Q4 (Oct - Dec)</option>
          </select>
        </div>

        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, subcategory: '', projectType: '', subType: '' })}
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.subcategory}
            onChange={(e) => setFilters({ ...filters, subcategory: e.target.value, projectType: '', subType: '' })}
          >
            <option value="">Select Sub Category</option>
            {subCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
          </select>
        </div>

        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.projectType}
            onChange={(e) => setFilters({ ...filters, projectType: e.target.value, subType: '' })}
          >
            <option value="">Select Project Type</option>
            {mappingOptions.ranges.length > 0 ? (
                mappingOptions.ranges.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
            ) : (
                projectTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)
            )}
          </select>
        </div>

        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.subType}
            onChange={(e) => setFilters({ ...filters, subType: e.target.value })}
          >
            <option value="">Select Sub Type</option>
            {mappingOptions.subTypes.length > 0 ? (
                mappingOptions.subTypes.map(spt => <option key={spt._id} value={spt._id}>{spt.name}</option>)
            ) : (
                subProjectTypes.map(spt => <option key={spt._id} value={spt._id}>{spt.name}</option>)
            )}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 mb-4 p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge tone="primary" className="flex items-center gap-1">
            Country: {selectedCountry?.name || 'All'}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleCountrySelect('')} />
          </Badge>
          <Badge tone="primary" className="flex items-center gap-1">
            State: {selectedState?.name || 'All'}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleStateSelect('')} />
          </Badge>
          <Badge tone="success" className="flex items-center gap-1">
            Cluster: {selectedCluster?.name || 'All'}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleClusterSelect('')} />
          </Badge>
          <Badge tone="info" className="flex items-center gap-1">
            District: {selectedDistrict?.name || 'All'}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleDistrictSelect('')} />
          </Badge>
          {filters.category && (
            <Badge tone="warning" className="flex items-center gap-1">
              Category: {categories.find(c => c._id === filters.category)?.name || filters.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, category: '', subcategory: '' })} />
            </Badge>
          )}
          {filters.quarter && (
            <Badge tone="info" className="flex items-center gap-1">
              Quarter: {filters.quarter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, quarter: '' })} />
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Applied Filters</div>
          <button
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* TOTAL Files Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-sm font-medium">TOTAL Files</h6>
              <ShoppingBag className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3" id="totalFiles">{totalFiles}</h3>
          </div>
        </div>

        {/* TOTAL Loan Amount Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-sm font-medium">TOTAL Loan Amount</h6>
              <IndianRupee className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-0">₹{formatNumber(totalLoanAmount)}</h3>
          </div>
        </div>

        {/* Total Disbursed Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-sm font-medium">Total Disbursed</h6>
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-0">₹{formatNumber(totalDisbursed)}</h3>
            <small className="text-gray-500">({disbursedPercentage}%)</small>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${getProgressBarColor(disbursedPercentage)}`}
                  style={{ width: `${disbursedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-sm font-medium">Overdue</h6>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-0">{overdueCount}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h6 className="font-bold text-gray-800 mb-4">Loan Status Distribution</h6>
          <Chart
            options={{
              labels: chartData.statusLabels,
              colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#6b7280'],
              legend: { position: 'bottom' },
              plotOptions: { pie: { donut: { size: '70%' } } },
              dataLabels: { enabled: false }
            }}
            series={chartData.statusSeries}
            type="donut"
            height={300}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h6 className="font-bold text-gray-800 mb-4">Application Trend (Last 6 Months)</h6>
          <Chart
            options={{
              chart: { toolbar: { show: false } },
              xaxis: { categories: chartData.trendLabels },
              colors: ['#3b82f6'],
              plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
              dataLabels: { enabled: false }
            }}
            series={[{ name: 'Applications', data: chartData.trendSeries }]}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Loan Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'bank-loans' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('bank-loans')}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Bank Loans
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'private-loans' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('private-loans')}
            >
              <Handshake className="h-4 w-4 inline mr-2" />
              Private Loans
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'bank-loans' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h5 className="font-semibold text-gray-800">Bank Loan Applications</h5>
                </div>
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  onClick={() => exportTable('bank')}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>

              {/* Multi-Select Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <MultiSelect 
                  label="Filter by Franchisee" 
                  options={franchisees} 
                  selected={selectedFranchisees} 
                  onChange={setSelectedFranchisees} 
                  placeholder="All Franchisees"
                />
                <MultiSelect 
                  label="Partner's Type" 
                  options={partnerTypes} 
                  selected={selectedPartnerTypes} 
                  onChange={setSelectedPartnerTypes} 
                  placeholder="All Types"
                />
                <MultiSelect 
                  label="Partner's Plans" 
                  options={partnerPlans} 
                  selected={selectedPlans} 
                  onChange={setSelectedPlans} 
                  placeholder="All Plans"
                />
              </div>

              {/* Bank Loans Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Sr No.</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Franchisee Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Customer Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Bank Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Loan Amount (₹)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Disbursed Amount (₹)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Disbursed %</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Application Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBankLoans.length > 0 ? filteredBankLoans.map((loan, index) => {
                      const loanAmt = loan.loanAmount || 0;
                      const disbAmt = loan.disbursedAmount || 0;
                      const disbursedPercentage = loanAmt > 0 ? Math.round((disbAmt / loanAmt) * 100) : 0;
                      return (
                        <tr key={loan._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium text-gray-900">{loan.franchisee?.name || 'N/A'}</td>
                          <td className="p-3 text-gray-700">{loan.customerName}</td>
                          <td className="p-3 text-gray-700">{loan.bankName || '-'}</td>
                          <td className="p-3 text-gray-700">₹{formatNumber(loan.loanAmount)}</td>
                          <td className="p-3 text-gray-700">₹{formatNumber(loan.disbursedAmount)}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <span className="mr-2">{disbursedPercentage}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${getProgressBarColor(disbursedPercentage)}`}
                                  style={{ width: `${disbursedPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-700">{formatDate(loan.applicationDate)}</td>
                          <td className="p-3">
                            <Badge tone={loan.status === 'Approved' ? 'success' :
                              loan.status === 'Pending' ? 'warning' :
                                loan.status === 'Rejected' ? 'danger' : 'gray'}>
                              {loan.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => viewLoanDetails('bank', loan.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="10" className="p-8 text-center text-gray-500 bg-white">
                          No bank loan applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'private-loans' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-green-600" />
                  <h5 className="font-semibold text-gray-800">Private Loan Applications</h5>
                </div>
                <button
                  className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                  onClick={() => exportTable('private')}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>

              {/* Multi-Select Filters (Shared State for now or separate if needed) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-green-50/50 p-4 rounded-xl border border-green-100">
                <MultiSelect 
                  label="Filter by Franchisee" 
                  options={franchisees} 
                  selected={selectedFranchisees} 
                  onChange={setSelectedFranchisees} 
                  placeholder="All Franchisees"
                />
                <MultiSelect 
                  label="Partner's Type" 
                  options={partnerTypes} 
                  selected={selectedPartnerTypes} 
                  onChange={setSelectedPartnerTypes} 
                  placeholder="All Types"
                />
                <MultiSelect 
                  label="Partner's Plans" 
                  options={partnerPlans} 
                  selected={selectedPlans} 
                  onChange={setSelectedPlans} 
                  placeholder="All Plans"
                />
              </div>

              {/* Private Loans Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Sr No.</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Franchisee Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Lender Type</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Customer Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Lender Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Loan Amount (₹)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Disbursed Amount (₹)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Interest Rate</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Tenure (Months)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Application Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrivateLoans.length > 0 ? filteredPrivateLoans.map((loan, index) => {
                      const loanAmt = loan.loanAmount || 0;
                      const disbAmt = loan.disbursedAmount || 0;
                      const disbursedPercentage = loanAmt > 0 ? Math.round((disbAmt / loanAmt) * 100) : 0;
                      return (
                        <tr key={loan._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium text-gray-900">{loan.franchisee?.name || 'N/A'}</td>
                          <td className="p-3 text-gray-700">{loan.lenderType}</td>
                          <td className="p-3 text-gray-700">{loan.customerName}</td>
                          <td className="p-3 text-gray-700">{loan.lenderName}</td>
                          <td className="p-3 text-gray-700">₹{formatNumber(loan.loanAmount)}</td>
                          <td className="p-3 text-gray-700">₹{formatNumber(loan.disbursedAmount)}</td>
                          <td className="p-3 text-gray-700">{loan.interestRate}</td>
                          <td className="p-3 text-gray-700">{loan.tenure}</td>
                          <td className="p-3 text-gray-700">{formatDate(loan.applicationDate)}</td>
                          <td className="p-3">
                            <Badge tone={loan.status === 'Active' ? 'success' :
                              loan.status === 'Pending' ? 'warning' : 'gray'}>
                              {loan.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => viewLoanDetails('private', loan.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="12" className="p-8 text-center text-gray-500 bg-white">
                          No private loan applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}