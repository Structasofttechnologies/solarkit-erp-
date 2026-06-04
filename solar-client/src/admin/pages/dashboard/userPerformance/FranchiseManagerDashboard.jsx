import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Eye, MapPin, BarChart3, TrendingUp,
  Target, Filter, Download, CheckCircle, XCircle,
  Phone, Facebook, Globe, MessageSquare,
  Building, Send, ArrowUp, Home, Zap,
  Smartphone, UserPlus, Mail, Map
} from 'lucide-react';
import ApexCharts from 'apexcharts';
import performanceApi from '../../../../services/performance/performanceApi';
import * as locationApi from '../../../../services/core/locationApi';

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

export default function FranchiseManagerDashboard() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [userType, setUserType] = useState('cprmtrainee');
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);

  useEffect(() => {
    fetchCountries();
    fetchStatesByCountry(null); // Fetch global states initially
    fetchPerformance();
  }, [userType]);

  useEffect(() => {
    fetchPerformance();
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict]);

  const fetchCountries = async () => {
    try {
      const data = await locationApi.getCountries();
      setCountries(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchStatesByCountry = async (countryId) => {
    try {
      const statesData = await locationApi.getStates(countryId);
      setStates(statesData || []);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const fetchClustersByDistrict = async (districtId) => {
    try {
      const data = await locationApi.getClusters(districtId);
      setClusters(data || []);
    } catch (err) {
      console.error('Error fetching clusters:', err);
    }
  };

  const fetchDistrictsByCluster = async (clusterId) => {
    try {
      const data = await locationApi.getDistrictsHierarchy(clusterId);
      setDistricts(data || []);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const params = {
        countryId: selectedCountry?._id,
        stateId: selectedState?._id,
        clusterId: selectedCluster?._id,
        districtId: selectedDistrict?._id,
        userType: userType === 'cprm' ? 'franchise_manager' : 'franchise_manager_trainee'
      };
      const response = await performanceApi.getFranchiseManagerPerformance(params);
      setPerformanceData(response);
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Initialize Charts
  const initCharts = () => {
    if (chart1Instance.current) {
      chart1Instance.current.destroy();
    }
    if (chart2Instance.current) {
      chart2Instance.current.destroy();
    }

    if (chart1Ref.current) {
      const cprmTypeOptions = {
        series: [{
          name: 'Performer',
          data: [performanceData?.summary?.statusCounts?.Performer || 0]
        },
        {
          name: 'Active',
          data: [performanceData?.summary?.statusCounts?.Active || 0]
        },
        {
          name: 'Inactive',
          data: [performanceData?.summary?.statusCounts?.Inactive || 0]
        }],
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: true
          },
          fontFamily: 'inherit'
        },
        colors: ['#4e73df', '#1cc88a', '#f6c23e'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '45%',
            borderRadius: 4
          },
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [selectedState?.name || 'All States'],
          title: {
            text: 'Location Distribution'
          }
        },
        yaxis: {
          title: {
            text: 'Number of CPs'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return `${val} CPs`;
            }
          }
        },
        legend: {
          position: 'top'
        }
      };

      chart1Instance.current = new ApexCharts(chart1Ref.current, cprmTypeOptions);
      chart1Instance.current.render();
    }

    if (chart2Ref.current) {
      const funnelPieOptions = {
        series: [
          performanceData?.summary?.leads || 0,
          performanceData?.summary?.demos || 0,
          performanceData?.summary?.signups || 0,
          performanceData?.summary?.statusCounts?.Active || 0
        ],
        chart: {
          type: 'pie',
          height: 350,
          fontFamily: 'inherit'
        },
        labels: ['Leads', 'App Demos', 'CP Signups', 'Active CPs'],
        colors: ['#4e73df', '#36b9cc', '#1cc88a', '#f6c23e'],
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return opts.w.config.series[opts.seriesIndex];
          }
        },
        legend: {
          position: 'bottom'
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

      chart2Instance.current = new ApexCharts(chart2Ref.current, funnelPieOptions);
      chart2Instance.current.render();
    }
  };

  useEffect(() => {
    loadGoogleMapsScript(initMap);
  }, []);

  useEffect(() => {
    initCharts();
  }, [performanceData]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCluster(null);
    setSelectedDistrict(null);
    setStates([]);
    setClusters([]);
    setDistricts([]);
    fetchStatesByCountry(country?._id);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCluster(null);
    setSelectedDistrict(null);
    setClusters([]);
    setDistricts([]);
    // Step: State -> Cluster
    fetchClustersByState(state?._id);
  };

  const fetchClustersByState = async (stateId) => {
    try {
      const data = await locationApi.getClustersHierarchy(stateId);
      setClusters(data || []);
    } catch (err) { console.error(err); }
  };

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster);
    setSelectedDistrict(null);
    setDistricts([]);
    // Step: Cluster -> Districts
    fetchDistrictsByCluster(cluster?._id);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
  };

  // No static data needed

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="mb-6 rounded-2xl p-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="md:w-1/2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-0">
                <BarChart3 className="inline mr-2" size={24} />
                Admin Partner Manager Dashboard
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowLocationCards(!showLocationCards)}
            className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Eye className="mr-2" size={18} />
            {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
          </button>
        </div>
      </div>

      {/* Location Section */}
      {showLocationCards && (
        <div className="mb-6 transition-all duration-500 ease-in-out">
          {/* Country Selection */}
          <div className="mb-6 mb-8 group">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-800">Select Country</h4>
              <button 
                onClick={() => handleCountrySelect(null)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${!selectedCountry ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-gray-500 border-gray-300 hover:border-blue-400'}`}
              >
                Select All Countries
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {/* All Countries Card - Optional visual card if button above is not enough */}
              <div
                onClick={() => handleCountrySelect(null)}
                className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${!selectedCountry ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-transparent'}`}
              >
                <h5 className="font-bold text-gray-800">All Countries</h5>
                <p className="text-gray-500 text-sm mt-1">Global View</p>
              </div>
              {countries.map((country) => (
                <div
                  key={country._id}
                  onClick={() => handleCountrySelect(country)}
                  className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${selectedCountry?._id === country._id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'
                    }`}
                >
                  <h5 className="font-bold text-gray-800">{country.name}</h5>
                  <p className="text-gray-500 text-sm mt-1">{country.code || 'INTL'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* State Selection */}
          {(selectedCountry || countries.length > 0) && (
            <div className="mb-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Select State</h4>
                <button 
                  onClick={() => handleStateSelect(null)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${!selectedState ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-gray-500 border-gray-300 hover:border-blue-400'}`}
                >
                  Select All States
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                 <div
                    onClick={() => handleStateSelect(null)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${!selectedState ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-transparent'}`}
                  >
                    <h5 className="font-bold text-gray-800">All States</h5>
                    <p className="text-gray-500 text-sm mt-1">{selectedCountry?.name || 'All Countries'}</p>
                  </div>
                {states.map((state) => (
                  <div
                    key={state._id}
                    onClick={() => handleStateSelect(state)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${selectedState?._id === state._id ? 'border-blue-600 bg-blue-50' : 'border-transparent'
                      }`}
                  >
                    <h5 className="font-bold text-gray-800">{state.name}</h5>
                    <p className="text-gray-500 text-sm mt-1">{state.code || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cluster Selection */}
          {(selectedState || states.length > 0) && (
            <div className="mb-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Select Cluster</h4>
                <button 
                  onClick={() => handleClusterSelect(null)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${!selectedCluster ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'text-gray-500 border-gray-300 hover:border-purple-400'}`}
                >
                  Select All Clusters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                 <div
                    onClick={() => handleClusterSelect(null)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${!selectedCluster ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-transparent'}`}
                  >
                    <h6 className="font-bold text-gray-800">All Clusters</h6>
                    <p className="text-gray-500 text-sm mt-1">{selectedState?.name || 'All States'}</p>
                  </div>
                {clusters.map((cluster) => (
                  <div
                    key={cluster._id}
                    onClick={() => handleClusterSelect(cluster)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${selectedCluster?._id === cluster._id ? 'border-purple-600 bg-purple-50' : 'border-transparent'
                      }`}
                  >
                    <h6 className="font-bold text-gray-800">{cluster.name}</h6>
                    <p className="text-gray-500 text-sm mt-1">{selectedState?.name || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* District Selection */}
          {(selectedCluster || clusters.length > 0) && (
            <div className="mb-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Select District</h4>
                <button 
                  onClick={() => handleDistrictSelect(null)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${!selectedDistrict ? 'bg-green-600 text-white border-green-600 shadow-md' : 'text-gray-500 border-gray-300 hover:border-green-400'}`}
                >
                  Select All Districts
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                 <div
                    onClick={() => handleDistrictSelect(null)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${!selectedDistrict ? 'border-green-600 bg-green-50 ring-2 ring-green-200' : 'border-transparent'}`}
                  >
                    <h6 className="font-bold text-gray-800">All Districts</h6>
                    <p className="text-gray-500 text-sm mt-1">{selectedCluster?.name || 'All Clusters'}</p>
                  </div>
                {districts.map((district) => (
                  <div
                    key={district._id}
                    onClick={() => handleDistrictSelect(district)}
                    className={`bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-2 ${selectedDistrict?._id === district._id ? 'border-green-600 bg-green-50' : 'border-transparent'
                      }`}
                  >
                    <h6 className="font-bold text-gray-800">{district.name}</h6>
                    <p className="text-gray-500 text-sm mt-1">{selectedCluster?.name || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Row - Franchise Manager */}
      <div className="mb-6">
        <h5 className="text-blue-600 font-semibold mb-3">Partner Manager</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Franchise Manager */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalManagers || 0}</div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" title="Performer"></div>
                <div className="w-3 h-3 rounded-full bg-gray-500" title="Active"></div>
                <div className="w-3 h-3 rounded-full bg-red-500" title="Inactive"></div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Partner Manager</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-600 mr-3">{performanceData?.summary?.statusCounts?.Performer || 0} Performers</span>
              <span className="text-gray-500 mr-3">{performanceData?.summary?.statusCounts?.Active || 0} Active</span>
              <span className="text-red-500">{performanceData?.summary?.statusCounts?.Inactive || 0} Inactive</span>
            </div>
          </div>

          {/* Total Partners */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-cyan-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">{performanceData?.summary?.totalCP || 0}</div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" title="Performer"></div>
                <div className="w-3 h-3 rounded-full bg-gray-500" title="Active"></div>
                <div className="w-3 h-3 rounded-full bg-red-500" title="Inactive"></div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Partners</div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="text-green-600 mr-2">{performanceData?.summary?.statusCounts?.Performer || 0} Performers,</span>
              <span className="text-gray-500 mr-2">{performanceData?.summary?.statusCounts?.Active || 0} Active,</span>
              <span className="text-red-500">{performanceData?.summary?.statusCounts?.Inactive || 0} Inactive</span>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-gray-800">₹{performanceData?.summary?.avgOrderValue?.toLocaleString() || 0}</div>
              <div className="text-yellow-500">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Order Value</div>
            <div className="text-sm text-gray-500 mt-2">Based on current selection</div>
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
              <span className="text-gray-500">Across all records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row - Franchise Manager Trainee */}
      <div className="mb-6">
        <h5 className="text-blue-600 font-semibold mb-3">Partner Manager Trainee</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Leads */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:-translate-y-1 transition-transform duration-300 relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{performanceData?.summary?.leads || 0}</div>
                <div className="text-gray-600 font-medium mb-2">Total Leads</div>
                <div>
                  <span className="text-gray-500 text-sm">Collective leads</span>
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

          {/* Partner Signups */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-2xl font-bold text-gray-800 mb-1">{performanceData?.summary?.signups || 0}</div>
            <div className="text-gray-600 font-medium mb-2">Partner Signups</div>
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
      {/* Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCountry?._id || ''}
          onChange={(e) => {
            const country = countries.find(c => c._id === e.target.value);
            handleCountrySelect(country || null);
          }}
        >
          <option value="">All Countries</option>
          {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          value={selectedState?._id || ''}
          disabled={!selectedCountry && countries.length === 0}
          onChange={(e) => {
            const state = states.find(s => s._id === e.target.value);
            handleStateSelect(state || null);
          }}
        >
          <option value="">All States</option>
          {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          value={selectedCluster?._id || ''}
          disabled={!selectedState && states.length === 0}
          onChange={(e) => {
            const cluster = clusters.find(c => c._id === e.target.value);
            handleClusterSelect(cluster || null);
          }}
        >
          <option value="">All Clusters</option>
          {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          value={selectedDistrict?._id || ''}
          disabled={!selectedCluster && clusters.length === 0}
          onChange={(e) => {
            const district = districts.find(d => d._id === e.target.value);
            handleDistrictSelect(district || null);
          }}
        >
          <option value="">All Districts</option>
          {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cprm">Partner Manager</option>
          <option value="cprmtrainee">Partner Manager Trainee</option>
        </select>

        <button
          onClick={fetchPerformance}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
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
              {userType === 'cprmtrainee'
                ? 'Partner Manager Trainee Performance Summary'
                : 'Partner Manager Performance Summary'}
            </h5>
          </div>
          <div className="overflow-x-auto">
            {userType === 'cprmtrainee' ? (
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
                  {performanceData?.tableData?.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
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
                  {performanceData?.tableData?.length === 0 && (
                    <tr><td colSpan="8" className="px-4 py-10 text-center text-gray-500">No trainee records found.</td></tr>
                  )}
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
                  {performanceData?.tableData?.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
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
                  {performanceData?.tableData?.length === 0 && (
                    <tr><td colSpan="8" className="px-4 py-10 text-center text-gray-500">No performance records found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Partner Onboarding Goals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          Partner Onboarding Goals - Engineer Partner Goal
        </h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Partner Manager Trainee Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Self Leads</th>
                  <th className="px-5 py-3 text-left font-semibold">Company Leads</th>
                  <th className="px-5 py-3 text-left font-semibold">Conversion Rate</th>
                  <th className="px-5 py-3 text-left font-semibold">Active / InActive Partner's</th>
                  <th className="px-5 py-3 text-left font-semibold">Partner Onboarding Goals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceData?.tableData?.map((row, index) => (
                  <tr key={index}>
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
            <h5 className="font-semibold text-lg">Partner Manager Performance by State</h5>
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
      {showLeadsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-gray-900">Leads Overview</h4>
                <button
                  onClick={() => setShowLeadsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
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
                    <div className="text-2xl font-bold text-blue-600">500</div>
                  </div>

                  {/* App */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <h6 className="text-yellow-600 mb-2 flex items-center justify-center">
                      <Smartphone className="mr-2" size={18} />
                      App Leads
                    </h6>
                    <div className="text-2xl font-bold text-yellow-600">298</div>
                  </div>
                </div>

                {/* Inbound */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h6 className="text-green-600 font-semibold mb-3 flex items-center">
                    <Download className="mr-2" size={18} />
                    Inbound Leads: <span className="text-gray-900 ml-2">450</span>
                  </h6>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <Facebook className="text-blue-600 mx-auto mb-2" size={24} />
                      <div className="text-xs text-gray-500 mb-1">Facebook</div>
                      <div className="font-semibold text-gray-900">200</div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <MessageSquare className="text-green-600 mx-auto mb-2" size={24} />
                      <div className="text-xs text-gray-500 mb-1">WhatsApp</div>
                      <div className="font-semibold text-gray-900">170</div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <Globe className="text-yellow-600 mx-auto mb-2" size={24} />
                      <div className="text-xs text-gray-500 mb-1">Others</div>
                      <div className="font-semibold text-gray-900">80</div>
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
                  <h5 className="text-xl font-bold text-gray-900 mt-1 mb-2">115 Personal Leads</h5>
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
      )}
    </div>
  );
}