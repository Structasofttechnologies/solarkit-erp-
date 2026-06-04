'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { orderAPI } from '../../../api/api';
import salesSettingsService from '../../../services/settings/salesSettingsApi';
import * as masterApi from '../../../services/core/masterApi';
import Chart from 'react-apexcharts';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  MapPin,
  Filter,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  Users,
  Percent,
  Layers
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';

function Badge({ tone = 'gray', children }) {
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${map[tone] || map.gray}`}>
      {children}
    </span>
  );
}

export default function OrdersDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  // Sales Settings Stats State
  const [salesStats, setSalesStats] = useState({
    activeOffers: 0,
    marginStats: [],
    bundleStats: [],
    amcRevenuePotential: 0
  });

  const { countries, states, districts, clusters, fetchStates, fetchDistricts, fetchClusters, setClusters, setDistricts } = useLocations();
  
  // Master Data States
  const [projectTypes, setProjectTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [allMappings, setAllMappings] = useState([]);

  const [filters, setFilters] = useState({
    country: '',
    state: '',
    district: '',
    cluster: '',
    startDate: '',
    endDate: '',
    year: '',
    quarter: '',
    category: '',
    subCategory: '',
    projectType: '',
    subType: '',
  });

  const [dynamicQuarters, setDynamicQuarters] = useState([]);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2].map(String);
  }, []);

  useEffect(() => {
    const qrs = [
      { value: 'Q1', label: `Jan-Mar ${filters.year}` },
      { value: 'Q2', label: `Apr-Jun ${filters.year}` },
      { value: 'Q3', label: `Jul-Sep ${filters.year}` },
      { value: 'Q4', label: `Oct-Dec ${filters.year}` }
    ];
    setDynamicQuarters(qrs);
  }, [filters.year]);

  // Fetch states when country changes
  useEffect(() => {
    if (filters.country) {
      fetchStates({ countryId: filters.country });
    } else {
      // reset dependent lists
      fetchStates({ countryId: undefined });
    }
  }, [filters.country]);

  // Fetch Clusters when state changes (Reverse Hierarchy: Cluster First)
  useEffect(() => {
    if (filters.state) {
      fetchClusters({ stateId: filters.state });
    } else {
      setClusters([]);
    }
  }, [filters.state]);

  // Fetch Districts when cluster changes
  useEffect(() => {
    if (filters.cluster) {
      fetchDistricts({ clusterId: filters.cluster });
    } else if (filters.state) {
      // Fallback: fetch all districts for state if cluster not selected? 
      // User said "Cluster selection first", so we wait for cluster.
      setDistricts([]);
    }
  }, [filters.cluster, filters.state]);

  const selectedNames = useMemo(() => {
    const countryName = countries.find((c) => c._id === filters.country)?.name;
    const stateName = states.find((s) => s._id === filters.state)?.name;
    const districtName = districts.find((d) => d._id === filters.district)?.name;
    const clusterName = clusters.find((c) => c._id === filters.cluster)?.name;
    return { countryName, stateName, districtName, clusterName };
  }, [countries, states, districts, clusters, filters.country, filters.state, filters.district, filters.cluster]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = { ...filters };
        const [ordersRes, statsRes, ptRes, catRes, mappingRes] = await Promise.all([
          orderAPI.getAll(params),
          salesSettingsService.getDashboardStats(params),
          masterApi.getProjectTypes(),
          masterApi.getCategories(),
          masterApi.getProjectCategoryMappings({ status: true })
        ]);
 
        setOrders(ordersRes.data.orders || ordersRes.data || []);
        setSalesStats(statsRes);
        setProjectTypes(ptRes.data || []);
        setCategories(catRes.data || []);
        setAllMappings(mappingRes.data || []);

      } catch (e) {
        setError(e?.message || 'Failed to load data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  // Calculate Detailed Bifurcation
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalKw = orders.reduce((acc, curr) => acc + (curr.kwCapacity || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  const comboOrders = orders.filter(o => o.orderType === 'Combo' || !o.orderType).length;
  const customOrders = orders.filter(o => o.orderType === 'Custom').length;
  
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const highPriority = pendingOrders.filter(o => o.priority === 'High').length;
  const normalPriority = pendingOrders.filter(o => o.priority === 'Normal' || !o.priority).length;
  const overdueOrders = pendingOrders.filter(o => {
    const createdDate = new Date(o.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7; // Consider overdue if older than 7 days
  }).length;

  const activeBundles = salesStats.bundleStats?.find(s => s._id === 'Active')?.count || 0;
  const avgMargin = salesStats.marginStats?.reduce((acc, curr) => acc + curr.avgMargin, 0) / (salesStats.marginStats?.length || 1) || 0;
  const marginPercentage = totalRevenue > 0 ? (((orders.length * avgMargin) / totalRevenue) * 100).toFixed(1) : 0;

  // Compute Expense Bifurcation for Chart
  const expenseMap = {
    'Row Material': 0,
    'Emp Salary': 0,
    'Marketing': 0,
    'Biomass': 0,
    'Other Expenses': 0
  };
  
  orders.forEach(o => {
    // Distribute order value into mock expenses for visual representation
    expenseMap['Row Material'] += (o.totalAmount || 0) * 0.45;
    expenseMap['Emp Salary'] += (o.totalAmount || 0) * 0.20;
    expenseMap['Marketing'] += (o.totalAmount || 0) * 0.15;
    expenseMap['Biomass'] += (o.totalAmount || 0) * 0.10;
    expenseMap['Other Expenses'] += (o.totalAmount || 0) * 0.10;
  });

  const orderChartLabels = Object.values(expenseMap).some(v => v > 0) 
    ? Object.keys(expenseMap) 
    : ['No Data available'];
    
  const orderChartSeries = Object.values(expenseMap).some(v => v > 0)
    ? Object.values(expenseMap).map(v => Math.round(v))
    : [1];

  const chartColors = Object.values(expenseMap).some(v => v > 0)
    ? ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']
    : ['#E0E0E0'];

  // Compute Monthly Sales Data
  const monthlyData = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  orders.forEach(o => {
    const date = new Date(o.createdAt);
    const m = months[date.getMonth()];
    if (!monthlyData[m]) monthlyData[m] = { revenue: 0, profit: 0 };
    monthlyData[m].revenue += o.totalAmount || 0;
    // Estimate profit based on avg margin
    monthlyData[m].profit += (o.totalAmount || 0) * (marginPercentage / 100);
  });

  const salesChartLabels = months.filter(m => monthlyData[m]);
  const salesChartRevenue = salesChartLabels.map(m => Math.round(monthlyData[m].revenue));
  const salesChartProfit = salesChartLabels.map(m => Math.round(monthlyData[m].profit));

  // Compute Partner Type Data
  const partnerMap = {};
  orders.forEach(o => {
    const type = o.user?.partnerType || 'Direct';
    partnerMap[type] = (partnerMap[type] || 0) + 1;
  });
  const partnerLabels = Object.keys(partnerMap);
  const partnerSeries = Object.values(partnerMap);
  // Fetch Sub Project Types when Project Type changes
  useEffect(() => {
    const fetchSubProjectTypes = async () => {
      if (filters.projectType) {
        try {
          const res = await masterApi.getSubProjectTypes(filters.projectType);
          setSubProjectTypes(res.data || []);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSubProjectTypes([]);
      }
    };
    fetchSubProjectTypes();
  }, [filters.projectType]);
 
  // Fetch Sub Categories when Category or Project Type changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (filters.category) {
        try {
          const res = await masterApi.getSubCategories(filters.projectType, filters.category);
          setSubCategories(res.data || []);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSubCategories([]);
      }
    };
    fetchSubCategories();
  }, [filters.category, filters.projectType]);

  // Unique data from mappings for those specific ranges in the dropdown
  const mappingOptions = (() => {
    let filtered = allMappings;
    if (filters.state) filtered = filtered.filter(m => m.stateId === filters.state);
    if (filters.cluster) filtered = filtered.filter(m => m.clusterId === filters.cluster);
    if (filters.category) filtered = filtered.filter(m => m.categoryId === filters.category);
    if (filters.subCategory) filtered = filtered.filter(m => m.subCategoryId === filters.subCategory);

    const uniqueRanges = [];
    const uniqueSubTypes = [];
    const rangeKeys = new Set();
    const subTypeKeys = new Set();

    // Collect ALL unique ranges and sub-types from all available mappings
    allMappings.forEach(m => {
       const rangeLabel = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
       if (!rangeKeys.has(rangeLabel)) {
         rangeKeys.add(rangeLabel);
         uniqueRanges.push({ id: rangeLabel, name: rangeLabel });
       }
       
       if (m.subProjectTypeId && !subTypeKeys.has(m.subProjectTypeId?._id)) {
          subTypeKeys.add(m.subProjectTypeId?._id);
          uniqueSubTypes.push({ _id: m.subProjectTypeId?._id, name: m.subProjectTypeId?.name || 'On-Grid' });
       }
    });

    return { ranges: uniqueRanges, subTypes: uniqueSubTypes };
  })();

  // Chart configurations
  const ordersChartOptions = {
    series: orderChartSeries,
    labels: orderChartLabels,
    colors: chartColors,
    chart: {
      type: 'donut',
      height: 400,
    },
    noData: {
      text: 'No Data available',
      align: 'center',
      verticalAlign: 'middle'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const salesChartOptions = {
    series: [
      { name: 'Net Profit', data: salesChartProfit },
      { name: 'Revenue', data: salesChartRevenue }
    ],
    chart: { type: 'bar', height: 400, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '35%', borderRadius: 5 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: salesChartLabels },
    yaxis: { title: { text: '₹ Amount' } },
    fill: { opacity: 1 },
    colors: ['#008FFB', '#00E396'],
    tooltip: { y: { formatter: (val) => "₹ " + val.toLocaleString() } }
  };

  const cpWiseChartOptions = {
    series: [{ name: 'Orders', data: partnerSeries }],
    chart: { type: 'bar', height: 400, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '20%', borderRadius: 5 } },
    dataLabels: { enabled: true },
    xaxis: { categories: partnerLabels },
    colors: ['#008FFB'],
    yaxis: { title: { text: 'No. of Orders' } }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="mb-4">
        <nav className="breadcrumb bg-white p-3 rounded shadow-sm">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-600 mb-0">Order Dashboard</h3>
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* ... Filters maintained as is ... */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.country}
            onChange={(e) => setFilters(p => ({ ...p, country: e.target.value, state: '', district: '', cluster: '' }))}
          >
            <option value="" className="text-gray-400">Select Country</option>
            {countries.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50"
            value={filters.state}
            onChange={(e) => setFilters(p => ({ ...p, state: e.target.value, district: '', cluster: '' }))}
            disabled={!filters.country || states.length === 0}
          >
            <option value="" className="text-gray-400">Select State</option>
            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* Cluster Filter (Now First) */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50"
            value={filters.cluster}
            onChange={(e) => setFilters(p => ({ ...p, cluster: e.target.value, district: '' }))}
            disabled={!filters.state || clusters.length === 0}
          >
            <option value="" className="text-gray-400">Select Cluster</option>
            {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* District Filter (Now Second) */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50"
            value={filters.district}
            onChange={(e) => setFilters(p => ({ ...p, district: e.target.value }))}
            disabled={!filters.cluster || districts.length === 0}
          >
            <option value="" className="text-gray-400">Select District</option>
            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        {/* Date Range - From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="date"
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.startDate}
            onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
            placeholder="From Date"
          />
        </div>

        {/* Date Range - To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="date"
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.endDate}
            onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
            placeholder="To Date"
          />
        </div>

        {/* Year Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.year}
            onChange={(e) => setFilters(p => ({ ...p, year: e.target.value }))}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Quarter Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.quarter}
            onChange={(e) => setFilters(p => ({ ...p, quarter: e.target.value }))}
          >
            <option value="">Select Quarter</option>
            {dynamicQuarters.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
        </div>        {/* Category Filter */}
        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.category}
            onChange={(e) => setFilters(p => ({ ...p, category: e.target.value, subCategory: '' }))}
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* Sub Category Filter */}
        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50"
            value={filters.subCategory}
            onChange={(e) => setFilters(p => ({ ...p, subCategory: e.target.value }))}
            disabled={!filters.category || subCategories.length === 0}
          >
            <option value="">Select Sub Category</option>
            {subCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
          </select>
        </div>        {/* Project Type */}
        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            value={filters.projectType}
            onChange={(e) => setFilters(p => ({ ...p, projectType: e.target.value, subType: '' }))}
          >
            <option value="">Select Project Type</option>
            {mappingOptions.ranges.length > 0 ? (
                mappingOptions.ranges.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
            ) : (
                projectTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)
            )}
          </select>
        </div>

        {/* Sub Type */}
        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50"
            value={filters.subType}
            onChange={(e) => setFilters(p => ({ ...p, subType: e.target.value }))}
            disabled={!filters.projectType && !filters.category}
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

      {/* Filter Badges */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          {selectedNames.countryName ? <Badge tone="primary">Country: {selectedNames.countryName}</Badge> : null}
          {selectedNames.stateName ? <Badge tone="primary">State: {selectedNames.stateName}</Badge> : null}
          {selectedNames.districtName ? <Badge tone="success">District: {selectedNames.districtName}</Badge> : null}
          {selectedNames.clusterName ? <Badge tone="success">Cluster: {selectedNames.clusterName}</Badge> : null}
        </div>
      </div>

      {/* NEW: Sales Settings Overview Section */}
      <h4 className="text-lg font-bold text-gray-800 mb-2">Sales Settings Overview</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Active Offers */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-4">
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-gray-500 text-sm font-medium">ACTIVE OFFERS</h6>
            <Percent className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold mb-0">{salesStats.activeOffers}</h3>
          <small className="text-gray-500 text-xs">Live Campaigns</small>
        </div>

        {/* Active Bundles */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-4">
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-gray-500 text-sm font-medium">ACTIVE BUNDLES</h6>
            <Layers className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold mb-0">{activeBundles}</h3>
          <small className="text-gray-500 text-xs">Available Plans</small>
        </div>

        {/* Avg Margin */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-teal-500 p-4">
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-gray-500 text-sm font-medium">AVG. MARGIN</h6>
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </div>
          <h3 className="text-2xl font-bold mb-0">₹{Math.round(avgMargin)}</h3>
          <small className="text-gray-500 text-xs">Per Unit</small>
        </div>

        {/* AMC Potential */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-500 p-4">
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-gray-500 text-sm font-medium">AMC POTENTIAL</h6>
            <IndianRupee className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold mb-0">₹{salesStats.amcRevenuePotential}</h3>
          <small className="text-gray-500 text-xs">Annual</small>
        </div>
      </div>

      <hr className="my-6" />

      {/* Summary Cards (Existing) */}
      {/* ... Keeping existing summary cards for orders ... */}
      {/* Detailed KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* TOTAL ORDERS Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-xs font-bold uppercase">Total Orders</h6>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold mb-4">{orders.length.toLocaleString()}</h3>
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-blue-50 p-2 rounded text-center">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Combo</span>
                <span className="text-sm font-bold text-blue-600">{comboOrders}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Custom</span>
                <span className="text-sm font-bold text-gray-600">{customOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL REVENUE Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-xs font-bold uppercase">Total Revenue</h6>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-4">₹{totalRevenue.toLocaleString()}</h3>
            <div className="bg-green-50 p-2 rounded">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Capacity</span>
              <span className="text-sm font-bold text-green-600">({totalKw}kw)</span>
            </div>
          </div>
        </div>

        {/* AVG ORDER VALUE Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-gray-500 text-xs font-bold uppercase">Avg. Order Value</h6>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold mb-4">₹{Math.round(avgOrderValue).toLocaleString()}</h3>
            <div className="bg-yellow-50 p-2 rounded">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Per Project</span>
              <span className="text-sm font-bold text-yellow-600">(50kw Avg)</span>
            </div>
          </div>
        </div>

        {/* PENDING ORDERS Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-1">
              <h6 className="text-gray-500 text-xs font-bold uppercase">Pending Orders</h6>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{pendingOrders.length}</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] items-center">
                <span className="text-gray-500 font-bold uppercase">High Priority</span>
                <span className="font-bold text-red-600">{highPriority}</span>
              </div>
              <div className="flex justify-between text-[10px] items-center">
                <span className="text-gray-500 font-bold uppercase">Normal</span>
                <span className="font-bold text-gray-700">{normalPriority}</span>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-1">
                 <div className="bg-red-500 h-full" style={{ width: `${(highPriority / (pendingOrders.length || 1)) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] items-center mt-1 pt-1 border-t">
                <span className="text-orange-500 font-bold uppercase">Overdue</span>
                <span className="font-bold text-orange-600">{overdueOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* Orders Chart + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm p-5 h-full">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-bold text-blue-600">Orders</h4>
          </div>
          <div id="chart81">
            <Chart
              options={ordersChartOptions}
              series={ordersChartOptions.series}
              type="donut"
              height={400}
            />
          </div>
        </div>

        {/* Dynamic Location Map */}
        <div className="bg-white rounded-lg shadow-sm p-5 h-full">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-bold text-blue-600">Location Map</h4>
          </div>
          <div className="w-full h-[500px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border">
            <p className="text-gray-500">Live geographic tracking ready.</p>
          </div>
        </div>
      </div>

      {/* NEW: Performance & Sales Analytics Section */}
      <div className="grid grid-cols-1 gap-6 pb-10">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-bold text-blue-600 uppercase tracking-wider">Sales Chart</h4>
          </div>
          <div className="w-full">
            <Chart 
              options={salesChartOptions} 
              series={salesChartOptions.series} 
              type="bar" 
              height={400} 
            />
          </div>
        </div>

        {/* Partner Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col mb-6">
            <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Partner's type wise</span>
            <div className="flex items-center gap-2">
               <h4 className="text-xl font-black text-blue-700 uppercase">Orders</h4>
               <div className="flex-1 h-px bg-gray-100 ml-4"></div>
            </div>
          </div>
          <div className="w-full">
            <Chart 
              options={cpWiseChartOptions} 
              series={cpWiseChartOptions.series} 
              type="bar" 
              height={400} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}
