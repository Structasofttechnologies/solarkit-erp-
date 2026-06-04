import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, EyeOff, Download, Printer, TrendingUp, TrendingDown, 
  DollarSign, PieChart, LineChart, HandCoins, Store, Building,
  Filter, Calendar, MapPin, Info, Circle, SolarPanel, Home,
  Lightbulb, Droplets, Box, Truck, Users, Tag, Calculator, Wrench,
  Warehouse, BarChart3, FileText, Scale, Trophy,
  ArrowUp, ArrowDown, AlertCircle, CreditCard,
  Percent, ShoppingBag, Battery, Activity
} from 'lucide-react';
import Chart from 'chart.js/auto';

// Location data
const clusters = {
  "Gujarat": ["Rajkot", "Ahmedabad", "Surat", "Vadodara"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"]
};

const districts = {
  "Rajkot": ["Rajkot City", "Rajkot Rural", "Morbi", "Gondal"],
  "Ahmedabad": ["Ahmedabad City", "Ahmedabad Rural", "Gandhinagar", "Sanand"],
  "Surat": ["Surat City", "Surat Rural", "Bardoli", "Kamrej"],
  "Vadodara": ["Vadodara City", "Vadodara Rural", "Anand", "Dabhoi"],
  "Mumbai": ["Mumbai City", "Mumbai Suburban", "Thane", "Navi Mumbai"],
  "Pune": ["Pune City", "Pune Rural", "Pimpri-Chinchwad", "Haveli"],
  "Nagpur": ["Nagpur City", "Nagpur Rural", "Katol", "Umred"],
  "Nashik": ["Nashik City", "Nashik Rural", "Malegaon", "Sinnar"],
  "Jaipur": ["Jaipur City", "Jaipur Rural", "Sikar", "Tonk"],
  "Jodhpur": ["Jodhpur City", "Jodhpur Rural", "Pali", "Jaisalmer"],
  "Udaipur": ["Udaipur City", "Udaipur Rural", "Rajsamand", "Dungarpur"],
  "Kota": ["Kota City", "Kota Rural", "Baran", "Jhalawar"],
  "Amritsar": ["Amritsar City", "Amritsar Rural", "Tarn Taran", "Ajnala"],
  "Ludhiana": ["Ludhiana City", "Ludhiana Rural", "Jagraon", "Khanna"],
  "Jalandhar": ["Jalandhar City", "Jalandhar Rural", "Nakodar", "Phillaur"],
  "Patiala": ["Patiala City", "Patiala Rural", "Samana", "Nabha"]
};

const states = [
  { name: "Gujarat", code: "GJ" },
  { name: "Maharashtra", code: "MH" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Punjab", code: "PB" }
];

export default function FinancialPLReport() {
  // Location state
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [currentState, setCurrentState] = useState('');
  const [currentCluster, setCurrentCluster] = useState('');
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [clustersVisible, setClustersVisible] = useState(false);
  const [districtsVisible, setDistrictsVisible] = useState(false);

  // Report type state
  const [reportType, setReportType] = useState('dealer');

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
  const [subProjectTypeFilter, setSubProjectTypeFilter] = useState('');

  // Period filter
  const [periodFilter, setPeriodFilter] = useState('monthly');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  // UI states
  const [showComparison, setShowComparison] = useState(false);
  const [showPercentage, setShowPercentage] = useState(true);
  const [chartRange, setChartRange] = useState('6');

  // Chart refs
  const trendChartRef = useRef(null);
  const profitChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const profitChartInstance = useRef(null);

  // Handle state selection
  const handleStateSelect = (stateName) => {
    setCurrentState(stateName);
    setCurrentCluster('');
    setCurrentDistrict('');
    setClustersVisible(true);
    setDistrictsVisible(false);
  };

  // Handle cluster selection
  const handleClusterSelect = (clusterName) => {
    setCurrentCluster(clusterName);
    setCurrentDistrict('');
    setDistrictsVisible(true);
  };

  // Handle district selection
  const handleDistrictSelect = (districtName) => {
    setCurrentDistrict(districtName);
    updateDataBasedOnSelection();
  };

  // Reset location selection
  const handleResetLocation = () => {
    setCurrentState('');
    setCurrentCluster('');
    setCurrentDistrict('');
    setClustersVisible(false);
    setDistrictsVisible(false);
  };

  // Update data based on selections
  const updateDataBasedOnSelection = () => {
    // In a real app, this would fetch new data from API
    console.log('Updating data with:', {
      reportType,
      location: { currentState, currentCluster, currentDistrict },
      filters: {
        category: categoryFilter,
        subCategory: subCategoryFilter,
        projectType: projectTypeFilter,
        subProjectType: subProjectTypeFilter
      },
      period: periodFilter,
      dateRange: { startDate, endDate }
    });
  };

  // Initialize charts
  useEffect(() => {
    if (!trendChartRef.current || !profitChartRef.current) return;

    // Destroy existing charts
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }
    if (profitChartInstance.current) {
      profitChartInstance.current.destroy();
    }

    // Line Chart - Revenue vs Expenses
    const trendCtx = trendChartRef.current.getContext('2d');
    trendChartInstance.current = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [65, 72, 78, 81, 85, 88],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }, {
          label: 'Expenses',
          data: [35, 38, 40, 42, 45, 48],
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ₹';
                if (context.parsed.y !== null) {
                  label += (context.parsed.y * 10000).toLocaleString('en-IN');
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + (value * 10000).toLocaleString('en-IN'),
              font: {
                size: 11
              }
            }
          }
        }
      }
    });

    // Doughnut Chart - Profit Distribution
    const profitCtx = profitChartRef.current.getContext('2d');
    profitChartInstance.current = new Chart(profitCtx, {
      type: 'doughnut',
      data: {
        labels: ['Gross Profit', 'Operating Costs', 'Net Profit'],
        datasets: [{
          data: [58, 25, 33],
          backgroundColor: ['#28a745', '#dc3545', '#0d6efd'],
          borderWidth: 1,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });

    // Update chart on range change
    updateChartData(chartRange);

    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
      if (profitChartInstance.current) {
        profitChartInstance.current.destroy();
      }
    };
  }, []);

  // Update chart data when range changes
  useEffect(() => {
    updateChartData(chartRange);
  }, [chartRange, reportType]);

  // Update chart data
  const updateChartData = (months) => {
    if (!trendChartInstance.current) return;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const selectedLabels = labels.slice(0, months);

    // Adjust data based on report type
    const multiplier = reportType === 'franchisee' ? 0.7 : 1;
    const revenueData = selectedLabels.map((_, i) => Math.round((60 + Math.floor(Math.random() * 30)) * multiplier));
    const expenseData = selectedLabels.map((_, i) => Math.round((30 + Math.floor(Math.random() * 20)) * multiplier * 0.9));

    trendChartInstance.current.data.labels = selectedLabels;
    trendChartInstance.current.data.datasets[0].data = revenueData;
    trendChartInstance.current.data.datasets[1].data = expenseData;
    trendChartInstance.current.update();
  };

  // Export report
  const exportReport = () => {
    const data = [
      ['Financial P&L Report', '', '', ''],
      ['Report Type:', reportType.toUpperCase(), 'Generated:', new Date().toLocaleDateString()],
      ['Location:', currentState || 'All', 'Cluster:', currentCluster || 'All'],
      ['District:', currentDistrict || 'All', 'Filters:', JSON.stringify({
        category: categoryFilter,
        subCategory: subCategoryFilter,
        projectType: projectTypeFilter,
        subProjectType: subProjectTypeFilter
      })],
      ['', '', '', ''],
      ['Category', 'Amount (₹)', 'Percentage', 'Previous Period'],
      ['Total Revenue', '85,42,650', '100%', '75,85,000'],
      ['Total Expenses', '45,20,300', '52.9%', '41,80,000'],
      ['Gross Profit', '40,22,350', '47.1%', '34,05,000'],
      ['Net Profit', '28,15,850', '32.9%', '23,65,000']
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `P&L_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Report exported as CSV!');
  };

  // Format lakhs
  const formatLakhs = (value) => `₹${(value / 100000).toFixed(1)}L`;

  // Get current location text
  const getCurrentLocationText = () => {
    if (!currentState) return 'No location selected';
    let location = currentState;
    if (currentCluster) location += ` > ${currentCluster}`;
    if (currentDistrict) location += ` > ${currentDistrict}`;
    return location;
  };

  return (
    <div className="container mx-auto px-4 py-3">
      {/* Main Header */}
      <div className="card-custom mb-3 rounded-xl shadow-md border-0">
        <div 
          className="card-header-custom rounded-t-xl p-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-3 md:mb-0">
              <h4 className="text-xl font-semibold mb-1 flex items-center">
                <LineChart className="w-5 h-5 mr-2" />
                Financial P&L Report
              </h4>
              <p className="text-sm opacity-90">Profit & Loss Statement Dashboard</p>
            </div>
            <div className="flex items-center">
              {/* Dealer/Franchisee Toggle */}
              <div className="toggle-btn-group flex mr-3" role="group">
                <button
                  type="button"
                  className={`btn px-3 py-1.5 text-sm rounded-l-md border ${
                    reportType === 'dealer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType('dealer')}
                >
                  <Store className="w-3.5 h-3.5 mr-1 inline" />
                  Dealer
                </button>
                <button
                  type="button"
                  className={`btn px-3 py-1.5 text-sm rounded-r-md border ${
                    reportType === 'franchisee'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType('franchisee')}
                >
                  <Building className="w-3.5 h-3.5 mr-1 inline" />
                  Franchisee
                </button>
              </div>
              {/* Action Buttons */}
              <div className="flex">
                <button
                  className="btn bg-white border border-gray-300 hover:bg-gray-50 p-1.5 rounded-md mr-2"
                  onClick={exportReport}
                  title="Export Report"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="btn bg-white border border-gray-300 hover:bg-gray-50 p-1.5 rounded-md"
                  onClick={() => window.print()}
                  title="Print Report"
                >
                  <Printer className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selection Section */}
      <div className="card-custom mb-3 rounded-xl shadow-md border-0">
        <div className="card-header bg-white rounded-t-xl p-3 flex justify-between items-center">
          <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
            Location Selection
          </h6>
          <button
            className="btn btn-outline-primary btn-sm border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm"
            onClick={() => setLocationCardsVisible(!locationCardsVisible)}
          >
            {locationCardsVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1" />
                Hide Location Cards
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" />
                Show Location Cards
              </>
            )}
          </button>
        </div>
        <div className={`location-section ${locationCardsVisible ? 'block' : 'hidden'}`}>
          <div className="card-body p-4">
            {/* State Selection */}
            <div className="mb-4">
              <h6 className="mb-3 font-medium text-gray-700">Select State</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
                {states.map((state) => (
                  <div key={state.name} className="mb-3">
                    <div
                      className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${
                        currentState === state.name
                          ? 'border-2 border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleStateSelect(state.name)}
                    >
                      <div className="card-body p-4">
                        <h6 className="card-title font-bold text-gray-800">{state.name}</h6>
                        <p className="text-gray-600 text-sm mb-0">{state.code}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cluster Selection */}
            {clustersVisible && (
              <div className="cluster-section mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h6 className="font-medium text-gray-700">Select Cluster</h6>
                  <button
                    onClick={handleResetLocation}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset Selection
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
                  {clusters[currentState]?.map((cluster) => (
                    <div key={cluster} className="mb-3">
                      <div
                        className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${
                          currentCluster === cluster
                            ? 'border-2 border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleClusterSelect(cluster)}
                      >
                        <div className="card-body p-4">
                          <h6 className="card-title font-bold text-gray-800">{cluster}</h6>
                          <p className="text-gray-600 text-sm mb-0">{currentState}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* District Selection */}
            {districtsVisible && (
              <div className="district-section">
                <h6 className="mb-3 font-medium text-gray-700">Select District</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
                  {districts[currentCluster]?.map((district) => (
                    <div key={district} className="mb-3">
                      <div
                        className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${
                          currentDistrict === district
                            ? 'border-2 border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleDistrictSelect(district)}
                      >
                        <div className="card-body p-4">
                          <h6 className="card-title font-bold text-gray-800">{district}</h6>
                          <p className="text-gray-600 text-sm mb-0">{currentCluster}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Type Filters */}
      <div className="card-custom mb-3 rounded-xl shadow-md border-0">
        <div className="card-header bg-white rounded-t-xl p-3">
          <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
            <Filter className="w-4 h-4 text-blue-600 mr-2" />
            Project Type Filters
          </h6>
        </div>
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label block text-sm text-gray-600 mb-1">Category</label>
              <select
                className="form-select w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="solar">Solar Panel</option>
                <option value="rooftop">Solar Rooftop</option>
                <option value="streetlight">Solar Street Light</option>
                <option value="pump">Solar Pump</option>
              </select>
            </div>
            <div>
              <label className="form-label block text-sm text-gray-600 mb-1">Sub Category</label>
              <select
                className="form-select w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
              >
                <option value="">All Sub Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="form-label block text-sm text-gray-600 mb-1">Project Type</label>
              <select
                className="form-select w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value)}
              >
                <option value="">All Project Types</option>
                <option value="above3kw">3kw - 5kw</option>
                <option value="below3kw">5kw - 10kw</option>
                <option value="grid">10kw - 20kw</option>
              </select>
            </div>
            <div>
              <label className="form-label block text-sm text-gray-600 mb-1">Sub Project Type</label>
              <select
                className="form-select w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                value={subProjectTypeFilter}
                onChange={(e) => setSubProjectTypeFilter(e.target.value)}
              >
                <option value="">All Sub Types</option>
                <option value="ongrid">On-Grid</option>
                <option value="offgrid">Off-Grid</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="card-custom mb-3 rounded-xl shadow-md border-0">
        <div className="card-header bg-white rounded-t-xl p-3">
          <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            Report Period
          </h6>
        </div>
        <div className="card-body p-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-3 md:mb-0">
              <div className="flex flex-wrap gap-2">
                {['monthly', 'quarterly', 'yearly', 'custom'].map((period) => (
                  <button
                    key={period}
                    className={`filter-btn px-3 py-1.5 border rounded-md text-sm ${
                      periodFilter === period
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setPeriodFilter(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label block text-sm text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    className="form-control w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label block text-sm text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    className="form-control w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-custom border-t-4 border-green-500 rounded-xl shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between">
              <div>
                <h6 className="text-gray-500 text-sm mb-1">Total Revenue</h6>
                <h4 className="metric-value text-green-600 text-2xl font-bold">
                  {formatLakhs(8542650)}
                </h4>
                <small className="text-green-600 text-sm">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  12.5%
                </small>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-custom border-t-4 border-red-500 rounded-xl shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between">
              <div>
                <h6 className="text-gray-500 text-sm mb-1">Total Expenses</h6>
                <h4 className="metric-value text-red-600 text-2xl font-bold">
                  {formatLakhs(4520300)}
                </h4>
                <small className="text-red-600 text-sm">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  8.2%
                </small>
              </div>
              <div className="text-red-600">
                <PieChart className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-custom border-t-4 border-blue-500 rounded-xl shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between">
              <div>
                <h6 className="text-gray-500 text-sm mb-1">Gross Profit</h6>
                <h4 className="metric-value text-blue-600 text-2xl font-bold">
                  {formatLakhs(4022350)}
                </h4>
                <small className="text-blue-600 text-sm">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  18.3%
                </small>
              </div>
              <div className="text-blue-600">
                <LineChart className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-custom border-t-4 border-cyan-500 rounded-xl shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between">
              <div>
                <h6 className="text-gray-500 text-sm mb-1">Net Profit</h6>
                <h4 className="metric-value text-cyan-600 text-2xl font-bold">
                  {formatLakhs(2815850)}
                </h4>
                <small className="text-cyan-600 text-sm">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  22.1%
                </small>
              </div>
              <div className="text-cyan-600">
                <HandCoins className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 chart-container bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h6 className="font-semibold text-gray-700">Revenue vs Expenses Trend</h6>
            <select
              className="form-select border border-gray-300 rounded-md px-3 py-1.5 text-sm w-40"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
            >
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
              <option value="3">Last 3 Months</option>
            </select>
          </div>
          <div className="chart-wrapper h-64">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        <div className="chart-container bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h6 className="font-semibold text-gray-700">Profit Distribution</h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showPercentage"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
              />
              <label className="form-check-label text-sm text-gray-600 ml-2" htmlFor="showPercentage">
                %
              </label>
            </div>
          </div>
          <div className="chart-wrapper h-64">
            <canvas ref={profitChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Revenue & Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Sources */}
        <div className="card-custom rounded-xl shadow-md">
          <div className="card-header bg-white rounded-t-xl p-3">
            <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              Revenue Sources
            </h6>
          </div>
          <div className="card-body p-0">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <SolarPanel className="w-4 h-4 text-yellow-500 inline mr-2" />
                    Solar Panel Sales
                  </td>
                  <td className="p-3 text-right font-medium">₹42.1L</td>
                  <td className="p-3 text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      49%
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <Home className="w-4 h-4 text-blue-500 inline mr-2" />
                    Rooftop Installations
                  </td>
                  <td className="p-3 text-right font-medium">₹28.5L</td>
                  <td className="p-3 text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      33%
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <Lightbulb className="w-4 h-4 text-yellow-500 inline mr-2" />
                    Solar Street Lights
                  </td>
                  <td className="p-3 text-right font-medium">₹8.7L</td>
                  <td className="p-3 text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      10%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Droplets className="w-4 h-4 text-blue-500 inline mr-2" />
                    Solar Pumps
                  </td>
                  <td className="p-3 text-right font-medium">₹5.0L</td>
                  <td className="p-3 text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      6%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Major Expenses */}
        <div className="card-custom rounded-xl shadow-md">
          <div className="card-header bg-white rounded-t-xl p-3">
            <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
              <PieChart className="w-4 h-4 text-red-600 mr-2" />
              Major Expenses
            </h6>
          </div>
          <div className="card-body p-0">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <Box className="w-4 h-4 text-blue-500 inline mr-2" />
                    Raw Materials
                  </td>
                  <td className="p-3 text-right font-medium">₹18.5L</td>
                  <td className="p-3 text-right">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      41%
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <Truck className="w-4 h-4 text-yellow-500 inline mr-2" />
                    Transportation
                  </td>
                  <td className="p-3 text-right font-medium">₹5.8L</td>
                  <td className="p-3 text-right">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      13%
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <Users className="w-4 h-4 text-blue-500 inline mr-2" />
                    Employee Salaries
                  </td>
                  <td className="p-3 text-right font-medium">₹12.3L</td>
                  <td className="p-3 text-right">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      27%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Tag className="w-4 h-4 text-green-500 inline mr-2" />
                    Discounts
                  </td>
                  <td className="p-3 text-right font-medium">₹2.5L</td>
                  <td className="p-3 text-right">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      5.5%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="card-custom mb-6 rounded-xl shadow-md border-0">
        <div className="card-header bg-white rounded-t-xl p-3">
          <div className="flex justify-between items-center">
            <h6 className="mb-0 font-semibold text-gray-700 flex items-center">
              <FileText className="w-4 h-4 text-blue-600 mr-2" />
              P&L Statement
            </h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showComparison"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
              />
              <label className="form-check-label text-sm text-gray-600 ml-2" htmlFor="showComparison">
                Show Comparison
              </label>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">Category</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Amount (₹)</th>
                  <th className="text-right p-3 font-semibold text-gray-700">% of Revenue</th>
                  <th className={`text-right p-3 font-semibold text-gray-700 ${!showComparison && 'hidden'}`}>
                    Prev Period
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* REVENUE SECTION */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-bold">REVENUE</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <Circle className="w-2 h-2 text-green-500 inline mr-2" />
                    Gross Sales Revenue
                  </td>
                  <td className="p-3 text-right font-bold">85,42,650</td>
                  <td className="p-3 text-right">100.0%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>75,85,000</td>
                </tr>

                {/* DISCOUNTS & DEDUCTIONS */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-bold">DISCOUNTS & DEDUCTIONS</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <Tag className="w-3 h-3 text-red-500 inline mr-2" />
                    P.O Discount
                  </td>
                  <td className="p-3 text-right text-red-600">(1,20,000)</td>
                  <td className="p-3 text-right">1.4%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>(95,000)</td>
                </tr>

                {/* NET REVENUE */}
                <tr className="bg-green-50">
                  <td className="p-3 font-bold">
                    <Calculator className="w-3 h-3 inline mr-2" />
                    NET REVENUE
                  </td>
                  <td className="p-3 text-right font-bold">83,92,650</td>
                  <td className="p-3 text-right font-bold">98.2%</td>
                  <td className={`p-3 text-right font-bold ${!showComparison && 'hidden'}`}>74,85,000</td>
                </tr>

                {/* COST OF GOODS SOLD */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-bold">COST OF GOODS SOLD (COGS)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <Box className="w-3 h-3 text-blue-500 inline mr-2" />
                    Raw Materials
                  </td>
                  <td className="p-3 text-right">18,50,000</td>
                  <td className="p-3 text-right">21.7%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>16,80,000</td>
                </tr>

                {/* GROSS PROFIT */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-bold">
                    <LineChart className="w-3 h-3 inline mr-2" />
                    GROSS PROFIT
                  </td>
                  <td className="p-3 text-right font-bold">48,42,350</td>
                  <td className="p-3 text-right font-bold">56.7%</td>
                  <td className={`p-3 text-right font-bold ${!showComparison && 'hidden'}`}>42,75,000</td>
                </tr>

                {/* OPERATING EXPENSES */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-bold">OPERATING EXPENSES</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <Users className="w-3 h-3 text-blue-500 inline mr-2" />
                    Employee Salaries
                  </td>
                  <td className="p-3 text-right">12,30,000</td>
                  <td className="p-3 text-right">14.4%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>11,50,000</td>
                </tr>

                {/* OPERATING INCOME */}
                <tr className="bg-green-50">
                  <td className="p-3 font-bold">
                    <BarChart3 className="w-3 h-3 inline mr-2" />
                    OPERATING INCOME
                  </td>
                  <td className="p-3 text-right font-bold">20,17,350</td>
                  <td className="p-3 text-right font-bold">23.6%</td>
                  <td className={`p-3 text-right font-bold ${!showComparison && 'hidden'}`}>16,05,000</td>
                </tr>

                {/* OTHER INCOME/EXPENSES */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-bold">OTHER INCOME/EXPENSES</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <CreditCard className="w-3 h-3 text-blue-500 inline mr-2" />
                    Interest Income
                  </td>
                  <td className="p-3 text-right">1,50,000</td>
                  <td className="p-3 text-right">1.8%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>1,20,000</td>
                </tr>

                {/* NET PROFIT */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-bold">
                    <HandCoins className="w-3 h-3 inline mr-2" />
                    NET PROFIT BEFORE TAX
                  </td>
                  <td className="p-3 text-right font-bold">19,25,850</td>
                  <td className="p-3 text-right font-bold">22.5%</td>
                  <td className={`p-3 text-right font-bold ${!showComparison && 'hidden'}`}>15,25,000</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">
                    <Scale className="w-3 h-3 text-red-500 inline mr-2" />
                    Income Tax
                  </td>
                  <td className="p-3 text-right text-red-600">(2,00,000)</td>
                  <td className="p-3 text-right">2.3%</td>
                  <td className={`p-3 text-right ${!showComparison && 'hidden'}`}>(1,80,000)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-3 font-bold">
                    <Trophy className="w-3 h-3 inline mr-2" />
                    NET PROFIT AFTER TAX
                  </td>
                  <td className="p-3 text-right font-bold">17,25,850</td>
                  <td className="p-3 text-right font-bold">20.2%</td>
                  <td className={`p-3 text-right font-bold ${!showComparison && 'hidden'}`}>13,45,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-custom text-center rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">Gross Margin</div>
          <div className="text-xl font-bold text-green-600 mb-1">56.7%</div>
          <div className="text-sm text-green-600">
            <ArrowUp className="w-3 h-3 inline mr-1" />
            +2.8%
          </div>
        </div>
        <div className="card-custom text-center rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">Net Margin</div>
          <div className="text-xl font-bold text-blue-600 mb-1">20.2%</div>
          <div className="text-sm text-blue-600">
            <ArrowUp className="w-3 h-3 inline mr-1" />
            +3.5%
          </div>
        </div>
        <div className="card-custom text-center rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">ROI</div>
          <div className="text-xl font-bold text-cyan-600 mb-1">24.5%</div>
          <div className="text-sm text-cyan-600">
            <ArrowUp className="w-3 h-3 inline mr-1" />
            +4.2%
          </div>
        </div>
        <div className="card-custom text-center rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">Op. Margin</div>
          <div className="text-xl font-bold text-yellow-600 mb-1">23.6%</div>
          <div className="text-sm text-yellow-600">
            <ArrowUp className="w-3 h-3 inline mr-1" />
            +3.4%
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-custom rounded-xl shadow-md">
        <div className="card-body p-4">
          <div className="text-sm text-gray-500">
            <Info className="w-3 h-3 inline mr-1" />
            Report generated on {new Date().toLocaleDateString('en-IN')}. All amounts in Indian Rupees (₹).
            Data is for <span className="font-medium">{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</span> operations. Current selection:
            <span className="font-medium ml-1">{getCurrentLocationText()}</span>
          </div>
        </div>
      </div>

      {/* Add custom styles for print */}
      <style jsx>{`
        @media print {
          .filter-btn, button, .form-check, .form-select, .location-section, .toggle-btn-group {
            display: none !important;
          }
          .chart-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .card-custom {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}