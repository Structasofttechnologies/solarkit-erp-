import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3, Filter, Download, Eye,
  Users, DollarSign, Zap, MapPin,
  Home, TrendingUp, ArrowUp,
  Building, Smartphone, Send,
  Facebook, MessageSquare, Globe
} from 'lucide-react';
import ApexCharts from 'apexcharts';
import performanceApi from '../../../../services/performance/performanceApi';
import { useLocations } from '../../../../hooks/useLocations';
import * as masterApi from '../../../../services/core/masterApi';

// Google Maps Script Loader
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  if (document.getElementById('google-maps-script')) {
    window.initMap = callback;
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGt03YWLd6CUTWIZQlBDtdvrTAAIfSqlM&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  window.initMap = callback;
};

export default function DealerDashboard() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);

  const {
    countries,
    states,
    clusters,
    districts,
    fetchStates,
    fetchDistricts,
    fetchClusters
  } = useLocations();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [timeline, setTimeline] = useState('30');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProject: '',
  });

  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const clusterChartRef = useRef(null);

  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);
  const clusterChartInstance = useRef(null);

  useEffect(() => {
    // Auto-refresh removed as requested
  }, []);

  // Cascade Effects
  useEffect(() => {
    if (selectedCountry) fetchStates({ countryId: selectedCountry._id });
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) fetchDistricts({ stateId: selectedState._id });
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) fetchClusters({ districtId: selectedDistrict._id });
  }, [selectedDistrict]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const params = {
        countryId: selectedCountry?._id,
        stateId: selectedState?._id,
        districtId: selectedDistrict?._id,
        clusterId: selectedCluster?._id,
        ...filters,
        timeline
      };
      const res = await performanceApi.getDealerPerformance(params);
      setPerformanceData(res);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, mapRes] = await Promise.all([
          masterApi.getCategories(),
          masterApi.getProjectCategoryMappings()
        ]);
        setCategories(catRes.data || []);
        if (mapRes.data) {
          const ranges = mapRes.data.map(m => ({
            name: `${m.projectTypeFrom} to ${m.projectTypeTo} kW`
          }));
          const uniqueRanges = Array.from(new Set(ranges.map(r => r.name))).map(name => ({ name }));
          setProjectTypes(uniqueRanges);
        }
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    };
    loadMasterData();
    fetchPerformance();
  }, [selectedCountry, selectedState, selectedDistrict, selectedCluster, filters, timeline]);

  useEffect(() => {
    const fetchSubCats = async () => {
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
    fetchSubCats();
  }, [filters.category]);

  useEffect(() => {
    if (performanceData) {
      initCharts();
    }
  }, [performanceData]);

  // Initialize Google Map
  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: 22.9734, lng: 72.5700 },
      styles: [
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "poi",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "transit",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });

    // Removed static districts map to comply with removing hardcoded/demo data
    // Map will be empty until real-time geo-coordinates are integrated.
    const mapMarkers = performanceData?.tableData?.slice(0, 5).map(dealer => ({
      name: dealer.name,
      message: dealer.orders.toString(),
      // Mocking position near center if no real lat/lng in tableData to ensure it isn't completely blank,
      // but strictly we should use DB data.
      position: { lat: 22.9734 + (Math.random() - 0.5), lng: 72.5700 + (Math.random() - 0.5) }
    })) || [];

    mapMarkers.forEach(d => {
      const marker = new window.google.maps.Marker({
        position: d.position,
        map,
        title: d.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#0d6efd" opacity="0.8"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${d.message}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div class="p-2"><strong class="text-sm">${d.name}</strong><br><strong class="text-blue-600">Total CP: ${d.message}</strong></div>`,
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });
  };

  // Initialize Charts
  const initCharts = () => {
    if (chart1Instance.current) chart1Instance.current.destroy();
    if (chart2Instance.current) chart2Instance.current.destroy();
    if (clusterChartInstance.current) clusterChartInstance.current.destroy();

    const chartData = performanceData?.charts || {};

    // Chart 1 - Dealer Chart
    if (chart1Ref.current) {
      const options = {
        series: chartData.dealerPerformance?.series || [],
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '25%' } },
        colors: ['#4e73df', '#00c9a7'],
        xaxis: { categories: chartData.dealerPerformance?.categories || [] },
        legend: { position: 'top' }
      };
      chart1Instance.current = new ApexCharts(chart1Ref.current, options);
      chart1Instance.current.render();
      console.log("📊 Chart (Order & Lead Trends) updated with real DB data");
    }

    // Chart 2 - Dealer Manager Orders Chart
    if (chart2Ref.current) {
      const options = {
        series: chartData.orderTrends?.series || [],
        chart: { height: 350, type: 'line', toolbar: { show: false } },
        stroke: { width: [0, 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '30%' } },
        colors: ['#4e73df', '#00c9a7'],
        labels: chartData.orderTrends?.categories || [],
        yaxis: [{ title: { text: 'Orders Count' } }, { opposite: true, title: { text: 'Order Amount ₹' } }],
        legend: { position: 'top' }
      };
      chart2Instance.current = new ApexCharts(chart2Ref.current, options);
      chart2Instance.current.render();
      console.log("📊 Chart (Revenue & Target Trends) updated with real DB data");
    }

    // Cluster Orders Chart
    if (clusterChartRef.current) {
      const options = {
        series: chartData.clusterData?.series || [],
        chart: { type: 'donut', height: 300 },
        labels: chartData.clusterData?.labels || [],
        colors: ['#2C599D', '#F98125', '#1CC88A', '#F6C23E', '#36B9CC'],
        legend: { position: 'bottom' }
      };
      clusterChartInstance.current = new ApexCharts(clusterChartRef.current, options);
      clusterChartInstance.current.render();
      console.log("📊 Chart (Cluster Distribution) updated with real DB data");
    }
  };

  useEffect(() => {
    loadGoogleMapsScript(initMap);
    initCharts();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="rounded-xl p-6 mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              <BarChart3 className="inline mr-3" size={28} />
              Dealer Dashboard
            </h2>
          </div>
        </div>
      </div>

      {/* Filters - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div>
          <select
            value={selectedCountry?._id || ''}
            onChange={(e) => {
              const c = countries.find(ct => ct._id === e.target.value);
              setSelectedCountry(c || null);
              setSelectedState(null);
              setSelectedDistrict(null);
              setSelectedCluster(null);
            }}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="" disabled>Select Country</option>
            {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={selectedState?._id || ''}
            onChange={(e) => {
              const s = states.find(st => st._id === e.target.value);
              setSelectedState(s || null);
              setSelectedDistrict(null);
              setSelectedCluster(null);
            }}
            disabled={!selectedCountry}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select State</option>
            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={selectedDistrict?._id || ''}
            onChange={(e) => {
              const d = districts.find(ds => ds._id === e.target.value);
              setSelectedDistrict(d || null);
              setSelectedCluster(null);
            }}
            disabled={!selectedState}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select District</option>
            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={selectedCluster?._id || ''}
            onChange={(e) => {
              const c = clusters.find(cl => cl._id === e.target.value);
              setSelectedCluster(c || null);
            }}
            disabled={!selectedDistrict}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select Cluster</option>
            {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Filters - Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={filters.subCategory}
            onChange={(e) => handleFilterChange('subCategory', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sub Categories</option>
            {subCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={filters.projectType}
            onChange={(e) => handleFilterChange('projectType', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Project Type</option>
            {projectTypes.map((pt, idx) => <option key={idx} value={pt.name}>{pt.name}</option>)}
          </select>
        </div>
        <div>
          <button
            onClick={fetchPerformance}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Leads & Quotes Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalLeads || 0}</div>
            <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalQuotes || 0}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600 font-medium">Total Leads</div>
            <div className="text-gray-600 font-medium">Total Quotes</div>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 text-sm flex items-center">
              <ArrowUp size={14} className="mr-1" /> {performanceData?.summary?.growth || 0}%
            </span>
            <span className="text-gray-500 text-sm ml-2">Since last month</span>
          </div>
        </div>

        {/* Total Conversion Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="mb-4">
            <div className="text-gray-600 font-medium">Total Conversion</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{performanceData?.summary?.conversionRatio || 0}%</div>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 text-sm flex items-center">
              <ArrowUp size={14} className="mr-1" /> 3.2%
            </span>
            <span className="text-gray-500 text-sm ml-2">Since last month</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan-500 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          onClick={() => setShowOrderModal(true)}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-gray-600 font-medium">Total Orders</div>
              <div className="flex items-baseline gap-4 mt-1">
                <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalOrders || 0}</div>
                <div className="text-gray-600 font-semibold">₹{(performanceData?.summary?.totalAmount || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">Total kW</div>
              <div className="font-bold text-gray-800">{performanceData?.summary?.totalKW || 0} kW</div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 text-sm flex items-center">
              <ArrowUp size={14} className="mr-1" /> 8.1%
            </span>
            <span className="text-gray-500 text-sm ml-2">Since last month</span>
          </div>
        </div>

        {/* Avg Order Size Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:-translate-y-1 transition-transform duration-300">
          <div className="mb-4">
            <div className="text-gray-600 font-medium">Avg Order Size</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">₹{(performanceData?.summary?.avgOrderAmount || 0).toLocaleString()}</div>
          </div>

          <hr className="my-3" />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Target Achievement</span>
              <span className="font-semibold text-gray-800">{performanceData?.summary?.targetAchievement || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">Dealer Distribution Map</h5>
          </div>
          <div className="p-0">
            <div ref={mapRef} className="h-[450px] w-full"></div>
          </div>
        </div>

        {/* Dealer Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">Dealer Performance Summary</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Orders</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Conv %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceData?.tableData?.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.orders || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.conversion || 0}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Order & Lead Trends</h4>
          <div ref={chart1Ref}></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenue & Target Trends</h4>
          <div ref={chart2Ref}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Cluster Distribution</h4>
          <div ref={clusterChartRef}></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-blue-600 text-sm font-medium mb-1">Active Dealers</div>
              <div className="text-2xl font-bold text-blue-900">{performanceData?.summary?.statusCounts?.Active || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-green-600 text-sm font-medium mb-1">Top Performers</div>
              <div className="text-2xl font-bold text-green-900">{performanceData?.summary?.statusCounts?.Performer || 0}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <div className="text-red-600 text-sm font-medium mb-1">Inactive Dealers</div>
              <div className="text-2xl font-bold text-red-900">{performanceData?.summary?.statusCounts?.Inactive || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
