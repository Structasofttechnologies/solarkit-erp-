import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3, Eye, MapPin, Users, TrendingUp,
  Target, Filter, DollarSign, ArrowUp, X,
  CheckCircle, XCircle, Building, Send,
  Smartphone, Download, Facebook, MessageSquare,
  Globe, Home, Zap
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

export default function DealerManagerDashboard() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);

  const {
    countries,
    states,
    clusters,
    districts,
    fetchStates,
    fetchDistricts,
    fetchClusters
  } = useLocations();

  const [userType, setUserType] = useState('cprmtrainee'); // Default to trainee for Dealer Manager Trainee view

  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProject: '',
  });

  const [showLeadsModal, setShowLeadsModal] = useState(false);

  const mapRef = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);

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

    const districtsData = [
      {
        name: "Rajkot",
        message: "22",
        position: { lat: 22.3039, lng: 70.8022 }
      },
      {
        name: "Surat",
        message: "12",
        position: { lat: 21.1702, lng: 72.8311 }
      },
      {
        name: "Vadodara",
        message: "16",
        position: { lat: 22.3072, lng: 73.1812 }
      },
      {
        name: "Ahmedabad",
        message: "28",
        position: { lat: 23.0225, lng: 72.5714 }
      },
      {
        name: "Bhavnagar",
        message: "5",
        position: { lat: 21.7645, lng: 72.1519 }
      }
    ];

    districtsData.forEach(d => {
      const marker = new window.google.maps.Marker({
        position: d.position,
        map,
        title: d.name,
        label: {
          text: d.message,
          color: "#ffffff",
          fontWeight: "bold"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#0d6efd",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 15
        }
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div class="p-2"><strong class="text-sm">${d.name}</strong><br><strong class="text-primary">Total CP: ${d.message}</strong></div>`,
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });
  };

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
        clusterId: selectedCluster?._id,
        districtId: selectedDistrict?._id,
        userType,
        ...filters
      };
      const response = await performanceApi.getDealerManagerPerformance(params);
      setPerformanceData(response);
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, sptRes, mapRes] = await Promise.all([
          masterApi.getCategories(),
          masterApi.getSubProjectTypes(),
          masterApi.getProjectCategoryMappings()
        ]);
        setCategories(catRes.data || []);
        setSubProjectTypes(sptRes.data || []);
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
  }, []);

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
    fetchPerformance();
  }, [selectedState, selectedCluster, selectedDistrict, userType, filters]);

  // Chart initialization when performanceData changes
  useEffect(() => {
    if (!performanceData) return;

    // Cleanup existing charts
    if (chart1Instance.current) chart1Instance.current.destroy();
    if (chart2Instance.current) chart2Instance.current.destroy();

    // Chart 1 - Performance by State
    if (chart1Ref.current) {
      const chartData = performanceData.charts?.stateDistribution || { labels: [], datasets: [] };
      const options = {
        series: chartData.datasets || [],
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: { show: false },
          fontFamily: 'inherit'
        },
        colors: ['#4e73df', '#1cc88a', '#f6c23e'],
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
        xaxis: { categories: chartData.labels || [] },
        yaxis: { title: { text: 'Number of CPs' } },
        legend: { position: 'top' }
      };

      chart1Instance.current = new ApexCharts(chart1Ref.current, options);
      chart1Instance.current.render();
      console.log("📊 Chart (Performance by State) updated with real DB data");
    }

    // Chart 2 - Conversion Funnel
    if (chart2Ref.current) {
      const funnelData = performanceData.charts?.conversionFunnel || { labels: [], values: [] };
      const options = {
        series: funnelData.values || [],
        chart: { type: 'pie', height: 300, fontFamily: 'inherit' },
        labels: funnelData.labels || [],
        colors: ['#4e73df', '#36b9cc', '#1cc88a', '#f6c23e'],
        dataLabels: {
          enabled: true,
          formatter: (val, opts) => opts.w.config.series[opts.seriesIndex]
        },
        legend: { position: 'bottom' }
      };

      chart2Instance.current = new ApexCharts(chart2Ref.current, options);
      chart2Instance.current.render();
      console.log("📊 Chart (Conversion Funnel) updated with real DB data");
    }

    return () => {
      if (chart1Instance.current) chart1Instance.current.destroy();
      if (chart2Instance.current) chart2Instance.current.destroy();
    };
  }, [performanceData]);

  useEffect(() => {
    loadGoogleMapsScript(initMap);
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="mb-6 rounded-2xl p-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}>
        <div className="flex items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              <BarChart3 className="inline mr-2" size={24} />
              Admin Dealer Manager Dashboard
            </h2>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
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
      </div>

      {/* Dealer Manager Metrics */}
      <div className="mb-6">
        <h5 className="text-blue-600 font-semibold mb-3">Dealer Manager</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dealer Manager */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalManagers || 0}</div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" title="Performer"></div>
                <div className="w-3 h-3 rounded-full bg-gray-500" title="Active"></div>
                <div className="w-3 h-3 rounded-full bg-red-500" title="Inactive"></div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Dealer Manager</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-600 mr-3">{performanceData?.summary?.statusCounts?.Performer || 0} Performers</span>
              <span className="text-gray-500 mr-3">{performanceData?.summary?.statusCounts?.Active || 0} Active</span>
              <span className="text-red-500">{performanceData?.summary?.statusCounts?.Inactive || 0} Inactive</span>
            </div>
          </div>

          {/* Total Dealer's */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-cyan-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalCP || 0}</div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" title="Performer"></div>
                <div className="w-3 h-3 rounded-full bg-gray-500" title="Active"></div>
                <div className="w-3 h-3 rounded-full bg-red-500" title="Inactive"></div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Dealer's</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-600 mr-2">{performanceData?.summary?.statusCounts?.Performer || 0} Performers,</span>
              <span className="text-gray-500 mr-2">{performanceData?.summary?.statusCounts?.Active || 0} Active,</span>
              <span className="text-red-500">{performanceData?.summary?.statusCounts?.Inactive || 0} Inactive</span>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">₹{(performanceData?.summary?.avgOrderValue || 0).toLocaleString()}</div>
              <div className="text-yellow-500">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Order Value</div>
            <div className="text-sm text-gray-500 mt-2">Current selection</div>
          </div>

          {/* Conversion Ratio */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.conversionRatio || 0}%</div>
              <div className="text-green-500">
                <BarChart3 size={24} />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Conversion Ratio</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-gray-500">Overall ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Manager Trainee Metrics */}
      <div className="mb-6">
        <h5 className="text-blue-600 font-semibold mb-3">Dealer Manager Trainee</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Leads with Eye Button */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:-translate-y-1 transition-transform duration-300 relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{performanceData?.summary?.leads || 0}</div>
                <div className="text-gray-600 font-medium mb-2">Total Leads</div>
                <div>
                  <span className="text-gray-500 text-sm">Combined count</span>
                </div>
              </div>
              <button
                onClick={() => setShowLeadsModal(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          {/* App Demos */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-cyan-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-2xl font-bold text-gray-800 mb-1">{performanceData?.summary?.demos || 0}</div>
            <div className="text-gray-600 font-medium mb-2">App Demos</div>
            <div>
              <span className="text-gray-500 text-sm">Total demos conducted</span>
            </div>
          </div>

          {/* Dealer Signups */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-2xl font-bold text-gray-800 mb-1">{performanceData?.summary?.signups || 0}</div>
            <div className="text-gray-600 font-medium mb-2">Dealer Signups</div>
            <div>
              <span className="text-gray-500 text-sm">New onboardings</span>
            </div>
          </div>

          {/* Conversion Ratio */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.conversionRatio || 0}%</div>
              <div className="text-green-500">
                <BarChart3 size={24} />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Conversion Ratio</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-gray-500">Lead to signup ratio</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* Main Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Performer">Performer</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
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
          <select
            value={filters.subProject}
            onChange={(e) => handleFilterChange('subProject', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sub Project Type</option>
            {subProjectTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
          </select>
        </div>
        <div>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cprm">Dealer Manager</option>
            <option value="cprmtrainee">Dealer Manager Trainee</option>
          </select>
        </div>
        <div>
          <button
            onClick={fetchPerformance}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Map and Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">Gujarat District Map</h5>
          </div>
          <div className="p-0">
            <div ref={mapRef} className="h-[450px] w-full"></div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">
              {filters.type === 'cprm'
                ? 'Dealer Manager Performance Summary'
                : 'Dealer Manager Trainee Performance Summary'}
            </h5>
          </div>
          <div className="overflow-x-auto">
            {filters.type === 'cprmtrainee' ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Leads</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Demos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Signups</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Conv %</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {performanceData?.tableData?.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{row.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.leads}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.demos}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.signups}</td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${row.conversion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{row.conversion}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Performer' ? 'bg-green-100 text-green-800' :
                          row.status === 'Active' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total CP</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order (kw)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order (Rs)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Conv %</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {performanceData?.tableData?.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{row.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.totalCP}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.orderKW}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.orderRs}</td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${row.conversion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{row.conversion}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Performer' ? 'bg-green-100 text-green-800' :
                          row.status === 'Active' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Dealer Onboarding Goals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          Dealer Onboarding Goals - Engineer CP Goal
        </h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Dealer Manager Trainee Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Self Leads</th>
                  <th className="px-5 py-3 text-left font-semibold">Company Leads</th>
                  <th className="px-5 py-3 text-left font-semibold">Conversion Rate</th>
                  <th className="px-5 py-3 text-left font-semibold">Active / InActive CP</th>
                  <th className="px-5 py-3 text-left font-semibold">Dealer Onboarding Goals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceData?.tableData?.map((row, index) => (
                  <tr key={row.id || index}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.selfLeads || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.companyLeads || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.conversion || 0}%</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" /> Active: {row.active || 0}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle size={12} className="mr-1" /> Inactive: {row.inactive || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-48">
                        <div className="text-xs text-gray-500 mb-1">
                          Achieved: {row.achieved || 0} / Target: {row.target || 0}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${row.target > 0 ? (row.achieved / row.target) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">Dealer Manager Performance by State</h5>
          </div>
          <div className="p-5">
            <div ref={chart1Ref}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3">
            <h5 className="font-semibold text-lg">Lead Conversion Funnel</h5>
          </div>
          <div className="p-5">
            <div ref={chart2Ref}></div>
          </div>
        </div>
      </div>

      {/* Leads Modal */}
      {
        showLeadsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900">Leads Overview</h4>
                  <button
                    onClick={() => setShowLeadsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Company Leads */}
                <div className="mb-8">
                  <h6 className="text-blue-600 font-semibold mb-4 flex items-center">
                    <Building className="mr-2" size={20} />
                    Company Leads Overview
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Outbound */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <h6 className="text-blue-600 mb-2 flex items-center justify-center">
                        <Send className="mr-2" size={18} />
                        Outbound Leads
                      </h6>
                      <div className="text-2xl font-bold text-blue-600">{performanceData?.summary?.leadsDetail?.outbound || 0}</div>
                    </div>

                    {/* App */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <h6 className="text-yellow-600 mb-2 flex items-center justify-center">
                        <Smartphone className="mr-2" size={18} />
                        App Leads
                      </h6>
                      <div className="text-2xl font-bold text-yellow-600">{performanceData?.summary?.leadsDetail?.app || 0}</div>
                    </div>
                  </div>

                  {/* Inbound */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="text-green-600 font-semibold mb-3 flex items-center">
                      <Download className="mr-2" size={18} />
                      Inbound Leads: <span className="text-gray-900 ml-2">{performanceData?.summary?.leadsDetail?.inbound?.total || 0}</span>
                    </h6>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white border rounded-lg p-3 text-center">
                        <Facebook className="text-blue-600 mx-auto mb-2" size={24} />
                        <div className="text-xs text-gray-500 mb-1">Facebook</div>
                        <div className="font-semibold text-gray-900">{performanceData?.summary?.leadsDetail?.inbound?.facebook || 0}</div>
                      </div>
                      <div className="bg-white border rounded-lg p-3 text-center">
                        <MessageSquare className="text-green-600 mx-auto mb-2" size={24} />
                        <div className="text-xs text-gray-500 mb-1">WhatsApp</div>
                        <div className="font-semibold text-gray-900">{performanceData?.summary?.leadsDetail?.inbound?.whatsapp || 0}</div>
                      </div>
                      <div className="bg-white border rounded-lg p-3 text-center">
                        <Globe className="text-yellow-600 mx-auto mb-2" size={24} />
                        <div className="text-xs text-gray-500 mb-1">Others</div>
                        <div className="font-semibold text-gray-900">{performanceData?.summary?.leadsDetail?.inbound?.others || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Leads */}
                <div>
                  <h6 className="text-blue-600 font-semibold mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    My Leads
                  </h6>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                    <span className="text-gray-500">You have</span>
                    <h5 className="text-xl font-bold text-gray-900 mt-1 mb-2">{performanceData?.summary?.leads || 0} Personal Leads</h5>
                    <small className="text-gray-500">Updated this month</small>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t">
                <button
                  onClick={() => setShowLeadsModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}