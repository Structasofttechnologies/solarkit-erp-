import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  TrendingUp,
  Package,
  Truck,
  Clock,
  Search,
  Download
} from 'lucide-react';
import ApexCharts from 'apexcharts';
import { getDashboardMetrics, getOrders, getSupplierTypes, getSupplierVendors } from '../../../services/dashboard/vendorsApi';
import inventoryApi from '../../../services/inventory/inventoryApi';
import { useLocations } from '../../../hooks/useLocations';

const VendorsDashboard = () => {
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [supplierTypes, setSupplierTypes] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);

  const {
    countries,
    states,
    clusters,
    districts,
    fetchStates,
    fetchClusters,
    fetchDistricts
  } = useLocations();

  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cascade: Country -> State
  useEffect(() => {
    if (countryFilter) {
      fetchStates({ countryId: countryFilter });
    }
  }, [countryFilter]);

  // Cascade: State -> Cluster
  useEffect(() => {
    if (stateFilter) {
      fetchClusters({ stateId: stateFilter });
    }
  }, [stateFilter]);

  // Cascade: Cluster -> District
  useEffect(() => {
    if (clusterFilter) {
      fetchDistricts({ clusterId: clusterFilter });
    }
  }, [clusterFilter]);

  // Fetch Supplier Types on Mount
  useEffect(() => {
    const fetchSupplierTypes = async () => {
      try {
        const res = await getSupplierTypes();
        setSupplierTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching supplier types:", err);
      }
    };
    fetchSupplierTypes();
  }, []);

  // Fetch Warehouses and Vendors
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [whRes, venRes] = await Promise.all([
          inventoryApi.getAllWarehouses({ state: stateFilter, cluster: clusterFilter, district: districtFilter }),
          getSupplierVendors({ state: stateFilter, cluster: clusterFilter, district: districtFilter })
        ]);
        setWarehouseOptions(whRes.data.data || []);
        setVendorOptions(venRes.data || []);
      } catch (err) {
        console.error("Error fetching vendor dashboard options:", err);
      }
    };
    fetchOptions();
  }, [stateFilter, clusterFilter, districtFilter]);

  // Fetch Data when filters change
  useEffect(() => {
    fetchData();
  }, [countryFilter, stateFilter, clusterFilter, districtFilter, supplierTypeFilter, warehouseFilter, vendorFilter, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        country: countryFilter,
        state: stateFilter,
        cluster: clusterFilter,
        district: districtFilter,
        supplierType: supplierTypeFilter,
        warehouse: warehouseFilter,
        vendorId: vendorFilter
      };

      // Calculate date range
      if (timeRange) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const [metricsData, ordersData] = await Promise.all([
        getDashboardMetrics(params),
        getOrders(params)
      ]);

      setMetrics(metricsData.data);
      setOrders(ordersData.data || []);

      // Update Chart
      if (metricsData.data.brandPerformance) {
        updateChart(metricsData.data.brandPerformance);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateChart = (brandData) => {
    const categories = brandData.map(item => item._id || 'Unknown');
    const data = brandData.map(item => item.totalValue);

    const options = {
      series: [{
        name: "Order Value",
        data: data
      }],
      chart: {
        type: 'bar',
        height: 350,
        fontFamily: 'inherit',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          columnWidth: '25%',
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return "₹" + val.toLocaleString('en-IN');
        },
        style: {
          fontSize: '14px',
          colors: ['#000']
        }
      },
      colors: ['#4e73df'],
      xaxis: {
        categories: categories,
        labels: {
          style: { fontSize: '14px' }
        }
      },
      yaxis: {
        title: {
          text: 'Order Value (₹)',
          style: { fontSize: '14px', fontWeight: 600 }
        },
        labels: {
          formatter: function (val) {
            return "₹" + val.toLocaleString('en-IN');
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "₹" + val.toLocaleString('en-IN');
          }
        }
      },
      title: {
        text: 'Brand-wise Order Value',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }
      }
    };

    // Destroy existing chart if any? React useEffect cleanup handles it, but here we are creating a new one.
    // Ideally we should use a ref for the chart instance.
    // For now, let's just clear the container.
    const chartContainer = document.querySelector("#brandOrderChart");
    if (chartContainer) {
      chartContainer.innerHTML = '';
      const chart = new ApexCharts(chartContainer, options);
      chart.render();
    }
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const styles = {
      'Delivered': 'bg-green-100 text-green-800',
      'In Transit': 'bg-yellow-100 text-yellow-800',
      'Delayed': 'bg-red-100 text-red-800',
      'Pending': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 rounded-2xl p-6 shadow-lg text-white"
        style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}>
        <div className="flex items-center">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Country</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setStateFilter('');
                setClusterFilter('');
                setDistrictFilter('');
              }}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select State</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setClusterFilter('');
                setDistrictFilter('');
              }}
              disabled={!countryFilter}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state._id} value={state._id}>{state.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Cluster</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clusterFilter}
              onChange={(e) => {
                setClusterFilter(e.target.value);
                setDistrictFilter('');
              }}
              disabled={!stateFilter}
            >
              <option value="">All Clusters</option>
              {clusters.map(cluster => (
                <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select District</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              disabled={!clusterFilter}
            >
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse selection</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouseOptions.map(wh => (
                <option key={wh._id} value={wh._id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Range</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              id="timelineFilter"
            >
              <option value="">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={supplierTypeFilter}
              onChange={(e) => setSupplierTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {supplierTypes.map(type => (
                <option key={type._id} value={type._id}>{type.loginTypeName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select vendor by name</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendorOptions.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end lg:col-span-1 xl:col-span-1">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading Dashboard...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Vendors Card */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-800">{metrics?.totalVendors?.total || 0}</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Total Vendors</div>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-green-600 font-medium">{metrics?.totalVendors?.active || 0} Active</span>
                <span className="mx-2">•</span>
                <span className="text-red-600 font-medium">{metrics?.totalVendors?.inactive || 0} Inactive</span>
              </div>
            </div>

            {/* Monthly Transaction Value Card */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    ₹{(metrics?.monthlyTransactionValue?.value || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Monthly Transaction Value</div>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-xs text-green-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metrics?.monthlyTransactionValue?.changePercentage}% from last month
              </div>
            </div>

            {/* Delayed Deliveries Card */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-800">{metrics?.delayedDeliveries?.count || 0}</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Delayed Deliveries</div>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <div className="text-xs text-yellow-600 font-medium">
                {metrics?.delayedDeliveries?.clusterInfo || 'No delays'}
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-800">{metrics?.onTimeDelivery?.percentage || 0}%</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">On-Time Delivery</div>
                </div>
                <Truck className="w-10 h-10 text-purple-500" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-green-600 font-medium">↑ {metrics?.onTimeDelivery?.improvement || 0}% improvement</span>
              </div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="bg-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">Order Directory</h5>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm flex items-center">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </button>
                  <button className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">#Order No</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Vendor Name</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Brand</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Delivery Date</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.orderNo}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.vendorId?.name || 'N/A'}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.brand}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.product}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Transaction Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div id="brandOrderChart"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorsDashboard;