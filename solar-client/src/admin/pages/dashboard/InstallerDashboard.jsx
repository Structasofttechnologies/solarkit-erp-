import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../../api/api';
import * as masterApi from '../../../services/core/masterApi';
import { getPartners, getPartnerPlans } from '../../../services/partner/partnerApi';
import ReactApexChart from 'react-apexcharts';
import {
  Users,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  Calendar,
  Filter,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';

export default function InstallerDashboard() {
  const navigate = useNavigate();
  const {
    countries,
    states,
    clusters,
    districts,
    fetchStates,
    fetchClusters,
    fetchDistricts
  } = useLocations();

  const [filters, setFilters] = useState({
    country: '',
    state: '',
    cluster: '',
    district: '',
    timeline: 'all',
    category: '',
    subcategory: '',
    projectType: '',
    subType: '',
    startDate: '',
    endDate: '',
    partnerTypes: [],
    partnerPlans: []
  });

  const [partnerTypes, setPartnerTypes] = useState([]);
  const [partnerPlans, setPartnerPlans] = useState([]);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const typesRef = useRef(null);
  const plansRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [allMappings, setAllMappings] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    totalInstallers: 0,
    assignedInstallations: 0,
    inProgressInstallations: 0,
    completedInstallations: 0,
    overdueInstallations: 0,
    installerPerformance: [],
    charts: {
      progress: { categories: [], series: [] },
      ratings: { categories: [], series: [] }
    }
  });

  const [showDateRange, setShowDateRange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    };
    loadMasterData();

    const fetchPartnerData = async () => {
      try {
        const [typesRes, plansRes] = await Promise.all([
          getPartners(),
          getPartnerPlans()
        ]);
        setPartnerTypes(typesRes || []);
        setPartnerPlans(plansRes.data || plansRes || []);
      } catch (err) {
        console.error('Error fetching partner data:', err);
      }
    };
    fetchPartnerData();

    const handleClickOutside = (event) => {
      if (typesRef.current && !typesRef.current.contains(event.target)) setIsTypesOpen(false);
      if (plansRef.current && !plansRef.current.contains(event.target)) setIsPlansOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('--- 🚀 Dashboard Data Fetch Started ---');
      
      const queryParams = { ...filters };
      // Handle Project Type Range if selected
      if (filters.projectType && filters.projectType.includes('to')) {
        const parts = filters.projectType.split(' ');
        queryParams.projectTypeFrom = parts[0];
        queryParams.projectTypeTo = parts[2];
      }

      const res = await dashboardAPI.getInstaller(queryParams);

      if (res.data?.success) {
        setDashboardData(res.data.dashboard);
        console.log('✅ Graph data fetched from database');
        console.log('📊 Chart updated with real DB data');

        if (res.data.dashboard.installerPerformance.length === 0) {
          console.log('⚠️ No data found in database for this section');
        }
      } else {
        console.log('⚠️ No data found in database for this section');
      }
    } catch (e) {
      console.error('❌ Failed to fetch dashboard data:', e);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      console.log('--- 🏁 Dashboard Data Fetch Completed ---');
    }
  };

  // Unique data from mappings for those specific ranges
  const mappingOptions = (() => {
    let filtered = allMappings || [];
    
    if (filters.state) {
      filtered = filtered.filter(m => {
        const mId = typeof m.stateId === 'object' ? m.stateId?._id : m.stateId;
        return mId === filters.state;
      });
    }
    if (filters.category) {
      filtered = filtered.filter(m => {
        const mId = typeof m.categoryId === 'object' ? m.categoryId?._id : m.categoryId;
        return mId === filters.category;
      });
    }

    const uniqueRanges = [];
    const uniqueSubTypes = [];
    const rangeKeys = new Set();
    const subTypeKeys = new Set();

    filtered.forEach(m => {
       if (m.projectTypeFrom !== undefined && m.projectTypeTo !== undefined) {
         const label = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
         if (!rangeKeys.has(label)) {
           rangeKeys.add(label);
           uniqueRanges.push({ id: label, name: label });
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

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  // Update states when country changes
  useEffect(() => {
    if (filters.country) {
      fetchStates({ countryId: filters.country });
      console.log('✅ Locations loaded dynamically from DB (States)');
    }
  }, [filters.country]);

  // Update clusters when state changes
  useEffect(() => {
    if (filters.state) {
      fetchClusters({ stateId: filters.state });
      console.log('✅ Locations loaded dynamically from DB (Clusters)');
    }
  }, [filters.state]);

  // Update districts when cluster changes
  useEffect(() => {
    if (filters.cluster) {
      fetchDistricts({ clusterId: filters.cluster });
      console.log('✅ Locations loaded dynamically from DB (Districts)');
    }
  }, [filters.cluster]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      country: '',
      state: '',
      cluster: '',
      district: '',
      timeline: 'all',
      category: '',
      subcategory: '',
      projectType: '',
      subType: '',
      startDate: '',
      endDate: '',
      partnerTypes: [],
      partnerPlans: []
    });
  };

  const progressChartOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    xaxis: { categories: dashboardData.charts.progress.categories },
    colors: ['#36a2eb', '#4bc0c0'],
    series: dashboardData.charts.progress.series
  };

  const ratingsChartOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    xaxis: {
      categories: dashboardData.charts.ratings.categories,
      max: 5
    },
    series: dashboardData.charts.ratings.series,
    colors: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl mb-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Installer Dashboard
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Partner Types Dropdown */}
            <div className="relative" ref={typesRef}>
              <button 
                onClick={() => setIsTypesOpen(!isTypesOpen)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2 min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                   <Users size={18} />
                   <span className="truncate">
                     {filters.partnerTypes.length === 0 ? 'Partner Types' : `${filters.partnerTypes.length} Selected`}
                   </span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isTypesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTypesOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 left-0 sm:left-auto sm:right-0">
                  <div className="max-h-60 overflow-y-auto px-2">
                    {partnerTypes.map((type) => (
                      <label key={type._id} className="flex items-center px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={filters.partnerTypes.includes(type.name)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...filters.partnerTypes, type.name]
                              : filters.partnerTypes.filter(t => t !== type.name);
                            handleFilterChange('partnerTypes', newValue);
                          }}
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${filters.partnerTypes.includes(type.name) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                          {filters.partnerTypes.includes(type.name) && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{type.name}</span>
                      </label>
                    ))}
                    {partnerTypes.length === 0 && <div className="p-3 text-sm text-gray-500 text-center">No types found</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Partner Plans Dropdown */}
            <div className="relative" ref={plansRef}>
              <button 
                onClick={() => setIsPlansOpen(!isPlansOpen)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2 min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                   <Users size={18} />
                   <span className="truncate">
                     {filters.partnerPlans.length === 0 ? 'Partner Plans' : `${filters.partnerPlans.length} Selected`}
                   </span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isPlansOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPlansOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 left-0 sm:left-auto sm:right-0">
                  <div className="max-h-60 overflow-y-auto px-2">
                    {partnerPlans.map((plan) => (
                      <label key={plan._id} className="flex items-center px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={filters.partnerPlans.includes(plan._id)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...filters.partnerPlans, plan._id]
                              : filters.partnerPlans.filter(p => p !== plan._id);
                            handleFilterChange('partnerPlans', newValue);
                          }}
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${filters.partnerPlans.includes(plan._id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                          {filters.partnerPlans.includes(plan._id) && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{plan.name || plan.planName}</span>
                      </label>
                    ))}
                    {partnerPlans.length === 0 && <div className="p-3 text-sm text-gray-500 text-center">No plans found</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* First Row of Filters (Location Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.country}
            onChange={(e) => {
              handleFilterChange('country', e.target.value);
              handleFilterChange('state', '');
              handleFilterChange('cluster', '');
              handleFilterChange('district', '');
            }}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.state}
            onChange={(e) => {
              handleFilterChange('state', e.target.value);
              handleFilterChange('cluster', '');
              handleFilterChange('district', '');
            }}
            disabled={!filters.country}
          >
            <option value="">All States</option>
            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.cluster}
            onChange={(e) => {
              handleFilterChange('cluster', e.target.value);
              handleFilterChange('district', '');
            }}
            disabled={!filters.state}
          >
            <option value="">All Clusters</option>
            {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            disabled={!filters.cluster}
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.timeline}
            onChange={(e) => {
              handleFilterChange('timeline', e.target.value);
              setShowDateRange(e.target.value === 'date');
            }}
          >
            <option value="all">All Records</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="date">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Date Range Section */}
      {showDateRange && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="date" className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="date" className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
              <Filter size={18} />
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Second Row of Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.category}
            onChange={(e) => {
               handleFilterChange('category', e.target.value);
               handleFilterChange('subcategory', '');
               handleFilterChange('projectType', '');
               handleFilterChange('subType', '');
            }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.subcategory}
            onChange={(e) => {
               handleFilterChange('subcategory', e.target.value);
               handleFilterChange('projectType', '');
               handleFilterChange('subType', '');
            }}
          >
            <option value="">All Sub Categories</option>
            {subCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.projectType}
            onChange={(e) => {
               handleFilterChange('projectType', e.target.value);
               handleFilterChange('subType', '');
            }}
          >
            <option value="">All Project Type</option>
            {mappingOptions.ranges.length > 0 ? (
               mappingOptions.ranges.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
            ) : (
               projectTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)
            )}
          </select>
        </div>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.subType}
            onChange={(e) => handleFilterChange('subType', e.target.value)}
          >
            <option value="">All Sub Project</option>
            {mappingOptions.subTypes.length > 0 ? (
               mappingOptions.subTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)
            ) : (
               subProjectTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)
            )}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <button
            className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 flex-1"
            onClick={loadDashboardData}
          >
            <Filter size={18} />
            Apply
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-300 flex items-center justify-center gap-2 flex-1"
            onClick={resetFilters}
          >
            <X size={18} />
            Reset
          </button>
        </div>
      </div>

      <hr className="my-6" />

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Installers Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium opacity-90">Total Installers</h5>
              <h2 className="text-3xl font-bold mt-2">{dashboardData.totalInstallers}</h2>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Users size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        {/* Installations Assigned Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium opacity-90">Installations Assigned</h5>
              <h2 className="text-3xl font-bold mt-2">{dashboardData.assignedInstallations}</h2>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <ClipboardList size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium opacity-90">In Progress</h5>
              <h2 className="text-3xl font-bold mt-2">{dashboardData.inProgressInstallations}</h2>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <RefreshCw size={32} className="opacity-90" />
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium opacity-90">Completed</h5>
              <h2 className="text-3xl font-bold mt-2">{dashboardData.completedInstallations}</h2>
            </div>
            <div className="bg-green-400 p-3 rounded-full">
              <CheckCircle size={32} className="opacity-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Installer Table */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={22} />
            Installer Performance
          </h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Installer Name</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Total Assigned</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">In Progress</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Overdue Installation</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Completed</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Completion Rate</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.installerPerformance.length > 0 ? (
                dashboardData.installerPerformance.map((installer) => (
                  <tr key={installer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="text-center py-3 px-4">{installer.name}</td>
                    <td className="text-center py-3 px-4 font-medium">{installer.totalAssigned}</td>
                    <td className="text-center py-3 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        {installer.inProgress}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        {installer.overdue}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 font-medium text-green-600">{installer.completed}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${installer.completionRate > 75 ? 'bg-green-500' : installer.completionRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${installer.completionRate}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${installer.completionRate > 75 ? 'text-green-600' : installer.completionRate > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {installer.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold">{installer.rating}</span>
                        <div className="flex text-yellow-400">
                          {"★".repeat(Math.floor(installer.rating))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    ⚠️ No data found in database for installer performance
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={22} />
              Monthly Installation Progress
            </h5>
            {typeof window !== 'undefined' && (
              <ReactApexChart
                options={progressChartOptions}
                series={progressChartOptions.series}
                type="bar"
                height={350}
              />
            )}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle size={22} />
              Installer Ratings
            </h5>
            {typeof window !== 'undefined' && (
              <ReactApexChart
                options={ratingsChartOptions}
                series={ratingsChartOptions.series}
                type="bar"
                height={350}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}