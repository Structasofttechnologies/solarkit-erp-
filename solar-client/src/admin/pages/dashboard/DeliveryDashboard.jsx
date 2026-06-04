import React, { useEffect, useState, useRef } from 'react';
import { dashboardAPI } from '../../../api/api';
import inventoryApi from '../../../services/inventory/inventoryApi';
import { getSolarKits, getAllCombokits, getAllCustomizedCombokits } from '../../../services/combokit/combokitApi';
import { getPartners, getPartnerPlans } from '../../../services/partner/partnerApi';
import ReactApexChart from 'react-apexcharts';
import {
  Truck,
  Package,
  Clock,
  AlertCircle,
  MapPin,
  BarChart3,
  IndianRupee,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';

export default function DeliveryDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalDeliveries: 0,
    counts: { prime: 0, regular: 0, express: 0, bulk: 0, other: 0 },
    pending: { total: 0, urgent: 0, normal: 0, overdue: 0 },
    financials: { avgCost: 0, totalDistance: 0, efficiency: 0 },
    performance: { avgTime: "0 Days", primeTime: "0 Day", perentage: 0 },
    chart: { series: [{ name: 'Deliveries', data: [] }], labels: [] },
    breakdown: {
      kit: { total: 0, prime: 0, regular: 0 },
      combo: { total: 0, prime: 0, regular: 0 }
    }
  });
  const [activeKitTab, setActiveKitTab] = useState('kit');

  // Dynamic Location Data
  const { countries, states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    cluster: '',
    district: '',
    warehouse: '',
    deliveryType: '',
    category: '',
    startDate: '',
    endDate: '',
    partnerTypes: [],
    partnerPlans: [],
    status: '',
    orderType: '',
    specificKit: ''
  });

  const [partnerTypes, setPartnerTypes] = useState([]);
  const [partnerPlans, setPartnerPlans] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [kitOptions, setKitOptions] = useState([]);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const typesRef = useRef(null);
  const plansRef = useRef(null);

  useEffect(() => {
    fetchStates();

    const fetchPartnerData = async () => {
      try {
        const [typesRes, plansRes] = await Promise.all([
          getPartners(),
          getPartnerPlans()
        ]);
        setPartnerTypes(typesRes || []);
        setPartnerPlans(plansRes.data || plansRes || []);
        
        const whRes = await inventoryApi.getAllWarehouses();
        setWarehouses(whRes.data.data || []);
      } catch (err) {
        console.error('Error fetching initial dashboard data:', err);
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
    const fetchKitOptions = async () => {
      if (!filters.orderType) {
        setKitOptions([]);
        return;
      }

      try {
        if (filters.orderType === 'Customized Kit') {
          // Fetch from image 3 source
          const res = await getAllCustomizedCombokits();
          setKitOptions(res || []);
        } else if (filters.orderType === 'ComboKit') {
          // Fetch from image 4 source
          const res = await getAllCombokits();
          setKitOptions(res || []);
        }
      } catch (err) {
        console.error('Error fetching kit options:', err);
      }
    };
    fetchKitOptions();
    // Reset specificKit when orderType changes
    setFilters(prev => ({ ...prev, specificKit: '' }));
  }, [filters.orderType]);

  // Fetch Dashboard Data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching dashboard data with filters:', filters);

        // Prepare query params
        const params = {};
        if (filters.country) params.country = filters.country;
        if (filters.state) params.state = filters.state;
        if (filters.cluster) params.cluster = filters.cluster;
        if (filters.district) params.district = filters.district;
        if (filters.warehouse) params.warehouse = filters.warehouse;
        if (filters.deliveryType) params.deliveryType = filters.deliveryType;
        if (filters.category) params.category = filters.category;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.status) params.status = filters.status;
        if (filters.orderType) params.orderType = filters.orderType;
        if (filters.specificKit) params.specificKit = filters.specificKit;
        if (filters.partnerTypes.length > 0) params.partnerTypes = filters.partnerTypes.join(',');
        if (filters.partnerPlans.length > 0) params.partnerPlans = filters.partnerPlans.join(',');

        const res = await dashboardAPI.getDelivery(params);
        if (res.data.success) {
          setData(res.data.dashboard);
          console.log('✅ Dashboard data loaded with ID-based filters');
        }
      } catch (e) {
        console.error('Failed to load dashboard:', e);
        setError(e?.message || 'Failed to load delivery dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    // Cascading Logic
    if (key === 'country') {
      fetchStates({ countryId: value });
      setFilters(prev => ({ ...prev, country: value, state: '', cluster: '', district: '' }));
    } else if (key === 'state') {
      fetchClusters({ stateId: value });
      setFilters(prev => ({ ...prev, state: value, cluster: '', district: '' }));
    } else if (key === 'cluster') {
      fetchDistricts({ clusterId: value });
      setFilters(prev => ({ ...prev, cluster: value, district: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  // Chart configuration
  const chartOptions = {
    series: data.chart.series,
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '50%' },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.chart.labels,
      title: { text: 'Project Types' }
    },
    yaxis: {
      title: { text: 'Number of Deliveries' },
      min: 0,
    },
    fill: { opacity: 1 },
    colors: ['#007bff'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " Deliveries";
        }
      }
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-600 mb-0">Delivery Dashboard</h3>
          </div>
          <div className="flex space-x-2">
            {/* Partner Types Dropdown */}
            <div className="relative" ref={typesRef}>
              <button 
                onClick={() => setIsTypesOpen(!isTypesOpen)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                   <Package className="h-4 w-4" />
                   <span className="truncate">
                     {filters.partnerTypes.length === 0 ? 'Partner Types' : `${filters.partnerTypes.length} Selected`}
                   </span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${isTypesOpen ? 'rotate-180' : ''}`} />
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
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${filters.partnerTypes.includes(type.name) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                          {filters.partnerTypes.includes(type.name) && <Check size={12} className="text-white" />}
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                   <Package className="h-4 w-4" />
                   <span className="truncate">
                     {filters.partnerPlans.length === 0 ? 'Partner Plans' : `${filters.partnerPlans.length} Selected`}
                   </span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${isPlansOpen ? 'rotate-180' : ''}`} />
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
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${filters.partnerPlans.includes(plan._id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                          {filters.partnerPlans.includes(plan._id) && <Check size={12} className="text-white" />}
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

      {/* Filters */}
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Country */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              disabled={!filters.country}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state._id} value={state._id}>{state.name}</option>
              ))}
            </select>
          </div>

          {/* Cluster */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.cluster}
              onChange={(e) => handleFilterChange('cluster', e.target.value)}
              disabled={!filters.state}
            >
              <option value="">All Clusters</option>
              {clusters.map(cluster => (
                <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              disabled={!filters.cluster}
            >
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.warehouse}
              onChange={(e) => handleFilterChange('warehouse', e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Delivery Type */}
          <div className="relative">
            <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.deliveryType}
              onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
            >
              <option value="">All Delivery Types</option>
              <option value="Prime">Prime Delivery</option>
              <option value="Regular">Regular Delivery</option>
              <option value="Express">Express</option>
              <option value="Bulk">Bulk</option>
            </select>
          </div>

          {/* Category */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Solar Rooftop">Solar Rooftop</option>
              <option value="Solar Street Light">Solar Street Light</option>
              <option value="Solar Pump">Solar Pump</option>
            </select>
          </div>

          {/* Date Filters */}
          <div className="lg:col-span-2 flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 h-[46px] shadow-sm">
            <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="flex items-center gap-4 w-full h-full">
              <div className="flex flex-col justify-center flex-1 h-full">
                <span className="text-[9px] text-blue-600 uppercase font-bold leading-none mb-0.5">From Date</span>
                <input
                  type="date"
                  className="text-[11px] bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer text-gray-700 font-bold leading-none"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="h-6 w-[1px] bg-gray-200"></div>
              <div className="flex flex-col justify-center flex-1 h-full">
                <span className="text-[9px] text-blue-600 uppercase font-bold leading-none mb-0.5">To Date</span>
                <input
                  type="date"
                  className="text-[11px] bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer text-gray-700 font-bold leading-none"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="relative">
            <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.orderType}
              onChange={(e) => handleFilterChange('orderType', e.target.value)}
            >
              <option value="">All Order Types</option>
              <option value="Customized Kit">Customized Kit</option>
              <option value="ComboKit">ComboKit</option>
            </select>
          </div>

          {/* Specific Kit/Combo (Dependent) */}
          {filters.orderType && (
            <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
              <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={filters.specificKit}
                onChange={(e) => handleFilterChange('specificKit', e.target.value)}
              >
                <option value="">{`Select ${filters.orderType === 'Customized Kit' ? 'Solar Kit' : 'ComboKit'}`}</option>
                {kitOptions.map(option => (
                  <option key={option._id || option.id} value={option.solarkitName || option.name}>
                    {option.solarkitName || option.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-center text-blue-500">Loading dashboard data...</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* TOTAL DELIVERIES Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="p-5 h-full flex flex-col justify-start">
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Deliveries</h6>
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="text-4xl font-bold text-gray-800">{data.totalDeliveries}</h4>
            <p className="text-xs text-gray-400 mt-2">Overall delivery count based on filters</p>
          </div>
        </div>

        {/* AVG COST Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-500" />
                <h6 className="text-gray-500 text-sm font-medium">AVG COST (per Delivery)</h6>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">₹{data.financials.avgCost}</h3>
            <p className="text-gray-500 text-xs mb-2">Based on filtered data</p>
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              (Benchmark: ₹10,000)
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <div>
                  <h6 className="text-gray-500 text-xs">Total Distance</h6>
                  <span className="font-bold text-green-600">{data.financials.totalDistance} km</span>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">{data.financials.efficiency}%</div>
                  <div className="text-gray-500 text-xs">Efficiency</div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${data.financials.efficiency}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* AVG. DELIVERY TIME Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-gray-500 text-sm font-medium">AVG. DELIVERY TIME</h6>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{data.performance.avgTime}</h3>
            <div className="space-y-1 mb-4">
              <div className="text-gray-600 text-sm flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Prime: {data.performance.primeTime}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Performance</span>
              <span className="text-yellow-600 font-bold">{data.performance.perentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${data.performance.perentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* PENDING DELIVERIES Card */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-gray-500 text-sm font-medium">PENDING DELIVERIES</h6>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{data.pending.total}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  Urgent {data.pending.settings ? `(${data.pending.settings.minDays}-${data.pending.settings.maxDays} Days)` : ''}
                </span>
                <strong className="text-red-600">{data.pending.urgent}</strong>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  Normal
                </span>
                <strong>{data.pending.normal}</strong>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Overdue {data.pending.settings ? `(>${data.pending.settings.maxDays} Days)` : ''}
                </span>
                <strong className="text-red-600">{data.pending.overdue}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* Check for empty data */}
      {data.totalDeliveries === 0 && !loading && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
          <p className="text-yellow-700 flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            ⚠️ No data found in database for this section (Confirming DB Connection)
          </p>
        </div>
      )}

      {/* Delivery Summary + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Delivery Summary */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-bold text-blue-600">Delivery Summary</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700">Prime Delivery</span>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{data.counts.prime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-700">Regular Delivery</span>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">{data.counts.regular}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-700">Express Delivery</span>
              </div>
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">{data.counts.express}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Bulk Delivery</span>
              </div>
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">{data.counts.bulk}</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Rajkot Map</h2>
          </div>
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1502323.1349301514!2d70.439774!3d22.0698851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959ca733392c0ed%3A0x9d0f6f0dcc6020c2!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1713330000000"
              title="Rajkot Map"
            />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-bold text-blue-600">Delivery Summary Chart (Real-Time)</h4>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">At Warehouse</option>
              <option value="in_transit">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        {typeof window !== 'undefined' && (
          <ReactApexChart
            options={chartOptions}
            series={chartOptions.series}
            type="bar"
            height={350}
          />
        )}
      </div>

    </div>
  );
}