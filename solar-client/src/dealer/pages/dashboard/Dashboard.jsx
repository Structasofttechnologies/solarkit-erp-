import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
  Download,
  Map,
  Satellite,
  Info,
  ArrowUp,
  ArrowDown,
  Percent,
  Clock
} from 'lucide-react';
import { dashboardAPI } from '../../../api/api';

const DealerDashboard = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [mapView, setMapView] = useState('map');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDealer();
        setData(response.data.dashboard);
      } catch (error) {
        console.error('Error fetching dealer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Helper to format currency
  const formatCurrency = (val) => {
    return '₹' + Math.round(val).toLocaleString();
  };

  // Helper to calculate time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Performance Card Component
  const PerformanceCard = ({ title, value, subtitle, color, percentage, borderColor, bgColor }) => (
    <div className={`border-l-4 ${borderColor} h-full bg-white rounded-lg shadow-sm`}>
      <div className="p-3">
        <div className="flex items-center">
          <div className="flex-1">
            <h6 className="text-sm font-bold text-gray-800 mb-1">{title}</h6>
            <h4 className={`text-xl mb-1 ${color}`}>{value}</h4>
            <p className="text-xs text-gray-500 mb-0">{subtitle}</p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="relative" style={{ width: '60px', height: '60px' }}>
              <svg width="60" height="60" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e9ecef" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={bgColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (percentage || 0) / 100)}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className={`text-xs font-bold ${color}`}>{percentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart configuration
  const revenueChartOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false }, background: 'transparent' },
    colors: ['#0d6efd', '#198754'],
    series: [
      { name: 'Sales', type: 'column', data: data.charts.revenue.map(r => r.sales) },
      { name: 'Profit', type: 'line', data: data.charts.revenue.map(r => r.profit) }
    ],
    xaxis: {
      categories: data.charts.revenue.map(r => r.month),
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        formatter: (value) => '₹' + value.toLocaleString(),
        style: { colors: '#6c757d', fontSize: '12px' }
      }
    },
    tooltip: { y: { formatter: (value) => '₹' + value.toLocaleString() } }
  };

  return (
    <div className="px-4 py-3 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-blue-600 text-white border-0 shadow-lg rounded-lg mb-3">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">Dealer Dashboard</h1>
          <p className="text-blue-100 mb-0">Welcome to your performance overview</p>
        </div>
      </div>

      {/* Project Performance Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Project Performance</h3>
          <button className="flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm">
            <Download className="w-4 h-4 mr-1" /> Export
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-4 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <PerformanceCard
              title="Total Leads"
              value={data.performance.totalLeads}
              subtitle="All time"
              color="text-blue-600"
              percentage={100}
              borderColor="border-blue-600"
              bgColor="#0d6efd"
            />
            <PerformanceCard
              title="Project Quote"
              value={data.performance.projectQuote}
              subtitle="Generated"
              color="text-purple-600"
              percentage={data.performance.totalLeads > 0 ? Math.round((data.performance.projectQuote / data.performance.totalLeads) * 100) : 0}
              borderColor="border-purple-600"
              bgColor="#6f42c1"
            />
            <PerformanceCard
              title="Project Signup"
              value={data.performance.projectSignup}
              subtitle="Completed"
              color="text-green-600"
              percentage={data.performance.totalLeads > 0 ? Math.round((data.performance.projectSignup / data.performance.totalLeads) * 100) : 0}
              borderColor="border-green-600"
              bgColor="#198754"
            />
            <PerformanceCard
              title="Pending Signup"
              value={data.performance.pendingSignup}
              subtitle="In progress"
              color="text-yellow-600"
              percentage={data.performance.totalLeads > 0 ? Math.round((data.performance.pendingSignup / data.performance.totalLeads) * 100) : 0}
              borderColor="border-yellow-500"
              bgColor="#ffc107"
            />
            <PerformanceCard
              title="Overdue Signup"
              value={data.performance.overdueSignup}
              subtitle="Need attention"
              color="text-red-600"
              percentage={0}
              borderColor="border-red-600"
              bgColor="#dc3545"
            />
          </div>
        </div>

        {/* Tickets Overview */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Tickets Overview</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <PerformanceCard
              title="Total Tickets"
              value={data.tickets.total}
              subtitle="All tickets"
              color="text-blue-600"
              percentage={100}
              borderColor="border-blue-600"
              bgColor="#0d6efd"
            />
            <PerformanceCard
              title="Open"
              value={data.tickets.open}
              subtitle="Currently open"
              color="text-yellow-600"
              percentage={data.tickets.total > 0 ? Math.round((data.tickets.open / data.tickets.total) * 100) : 0}
              borderColor="border-yellow-500"
              bgColor="#ffc107"
            />
            <PerformanceCard
              title="In Progress"
              value={data.tickets.inProgress}
              subtitle="Working on"
              color="text-purple-600"
              percentage={data.tickets.total > 0 ? Math.round((data.tickets.inProgress / data.tickets.total) * 100) : 0}
              borderColor="border-purple-600"
              bgColor="#6f42c1"
            />
            <PerformanceCard
              title="Resolved"
              value={data.tickets.resolved}
              subtitle="Successfully fixed"
              color="text-green-600"
              percentage={data.tickets.total > 0 ? Math.round((data.tickets.resolved / data.tickets.total) * 100) : 0}
              borderColor="border-green-600"
              bgColor="#198754"
            />
          </div>
        </div>
      </div>

      {/* Revenue Overview Section */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Revenue Overview</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
              Current Year: {currentYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <p className="text-xs text-gray-500 mb-1">Total Sales</p>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">{formatCurrency(data.revenue.totalSales)}</h4>
              <p className="text-xs text-gray-400">Lifetime Revenue</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <p className="text-xs text-gray-500 mb-1">Total Profit</p>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">{formatCurrency(data.revenue.totalProfit)}</h4>
              <p className="text-xs text-gray-400">Your Commission</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <p className="text-xs text-gray-500 mb-1">Avg Monthly Sales</p>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">{formatCurrency(data.revenue.avgMonthlySales)}</h4>
              <p className="text-xs text-gray-400">Monthly Average</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <p className="text-xs text-gray-500 mb-1">Avg Monthly Profit</p>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">{formatCurrency(data.revenue.avgMonthlyProfit)}</h4>
              <p className="text-xs text-gray-400">Monthly Average</p>
            </div>
          </div>

          <div className="mb-4 bg-white p-3 rounded-lg" style={{ height: '350px' }}>
            <Chart options={revenueChartOptions} series={revenueChartOptions.series} type="line" height={320} />
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          {/* Map stays as is (placeholder or static for now as requested) */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Installation Locations</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1888472.9897154318!2d70.00767526752736!3d22.413068990721648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959051f5f0ef795%3A0x861bd887ed54522e!2sGujarat!5e0!3m2!1sen!2sin!4v1764737327580!5m2!1sen!2sin"
              width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" className="rounded"
            ></iframe>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-full p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {data.activities.length > 0 ? data.activities.map((activity, index) => (
                <div key={index} className={`border-l-4 ${activity.color} pl-3 py-1`}>
                  <h6 className="text-sm font-semibold text-gray-800">{activity.title}</h6>
                  <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                  <div className="flex items-center text-gray-400 text-[10px]">
                    <Clock size={10} className="mr-1" />
                    {getTimeAgo(activity.time)}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic">No recent activities found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;