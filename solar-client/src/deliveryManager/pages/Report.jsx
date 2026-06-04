import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Calendar, Download, Coffee } from 'lucide-react';

export default function Report() {
  const [activeFilter, setActiveFilter] = useState('Daily');

  const reportData = {
    Daily: {
      stats: { productivity: '75%', completed: '5/12', overdue: 2 },
      trend: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [72, 75, 75, 75, 75, 75, 75]
      },
      distribution: [40, 20, 25, 15],
      tasks: [
        { task: 'Recruitment', due: 'Today', status: 'Completed', color: 'bg-[#10B981]' },
        { task: 'Generate Salary Report', due: 'Today', status: 'In Progress', color: 'bg-[#F59E0B]' },
        { task: 'Team Training', due: 'Yesterday', status: 'Overdue', color: 'bg-[#EF4444]' },
        { task: 'Client Meeting', due: 'Yesterday', status: 'Overdue', color: 'bg-[#EF4444]' }
      ]
    },
    Weekly: {
      stats: { productivity: '82%', completed: '35/45', overdue: 5 },
      trend: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [60, 68, 75, 82, 79, 85, 88]
      },
      distribution: [50, 25, 15, 10],
      tasks: [
        { task: 'Weekly Team Sync', due: 'This Week', status: 'Completed', color: 'bg-[#10B981]' },
        { task: 'Logistics Planning', due: 'This Week', status: 'In Progress', color: 'bg-[#F59E0B]' },
        { task: 'Vendor Audit', due: 'Last Week', status: 'Completed', color: 'bg-[#10B981]' },
        { task: 'Vehicle Maintenance', due: 'Last Week', status: 'Overdue', color: 'bg-[#EF4444]' }
      ]
    },
    Monthly: {
      stats: { productivity: '88%', completed: '142/155', overdue: 3 },
      trend: {
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        series: [75, 82, 85, 88]
      },
      distribution: [65, 20, 5, 10],
      tasks: [
        { task: 'Monthly Performance Review', due: 'This Month', status: 'Completed', color: 'bg-[#10B981]' },
        { task: 'Fleet Upgrade Project', due: 'This Month', status: 'In Progress', color: 'bg-[#F59E0B]' },
        { task: 'Driver Training Camp', due: 'Last Month', status: 'Completed', color: 'bg-[#10B981]' },
        { task: 'Annual Compliance Audit', due: 'Last Month', status: 'Overdue', color: 'bg-[#EF4444]' }
      ]
    }
  };

  const currentData = reportData[activeFilter];

  const trendChartOptions = {
    chart: {
      type: 'area',
      height: 250,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#3B82F6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: currentData.trend.categories,
      labels: { style: { colors: '#6B7280', fontSize: '11px' } }
    },
    yaxis: {
      min: 50,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (value) => value + '%',
        style: { colors: '#6B7280', fontSize: '11px' }
      }
    },
    grid: { borderColor: '#f1f1f1' },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 2,
    }
  };

  const trendChartSeries = [{
    name: 'Productivity %',
    data: currentData.trend.series
  }];

  const distributionOptions = {
    chart: {
      type: 'donut',
      height: 250
    },
    labels: ['Completed', 'In Progress', 'Overdue', 'Pending'],
    colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      markers: { radius: 2 }
    },
    stroke: { width: 0 }
  };

  const distributionSeries = currentData.distribution;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-8 space-y-6 pb-20 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-[#18395C] mb-1">Productivity Progress Report</h1>
          <p className="text-gray-500">Track your productivity and task completion progress</p>
        </div>
        <button className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-5 py-2 rounded-sm text-sm font-medium shadow transition-colors">
          Generate PDF
        </button>
      </div>

      {/* Time Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveFilter('Daily')}
          className={`border rounded-md p-6 text-center cursor-pointer shadow-sm transition-colors ${activeFilter === 'Daily' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
        >
          <Calendar className={`w-5 h-5 mx-auto mb-2 ${activeFilter === 'Daily' ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-gray-800 font-bold mb-1">Daily</h3>
          <p className="text-gray-500 text-sm">View today's progress</p>
        </div>
        <div 
          onClick={() => setActiveFilter('Weekly')}
          className={`border rounded-md p-6 text-center cursor-pointer shadow-sm transition-colors ${activeFilter === 'Weekly' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
        >
          <Calendar className={`w-5 h-5 mx-auto mb-2 ${activeFilter === 'Weekly' ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-gray-800 font-bold mb-1">Weekly</h3>
          <p className="text-gray-500 text-sm">View this week's progress</p>
        </div>
        <div 
          onClick={() => setActiveFilter('Monthly')}
          className={`border rounded-md p-6 text-center cursor-pointer shadow-sm transition-colors ${activeFilter === 'Monthly' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
        >
          <Calendar className={`w-5 h-5 mx-auto mb-2 ${activeFilter === 'Monthly' ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-gray-800 font-bold mb-1">Monthly</h3>
          <p className="text-gray-500 text-sm">View this month's progress</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex">
          <div className="w-1 bg-blue-500"></div>
          <div className="p-5 flex-1">
            <h3 className="text-gray-600 font-semibold text-sm mb-1">Productivity</h3>
            <div className="text-2xl font-bold text-gray-800 mb-2">{currentData.stats.productivity}</div>
            <p className="text-xs text-gray-500">Your efficiency based on<br/>completed tasks</p>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex">
          <div className="w-1 bg-green-500"></div>
          <div className="p-5 flex-1">
            <h3 className="text-gray-600 font-semibold text-sm mb-1">Completed Tasks</h3>
            <div className="text-2xl font-bold text-gray-800 mb-2">{currentData.stats.completed}</div>
            <p className="text-xs text-gray-500">Tasks you've successfully finished</p>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex">
          <div className="w-1 bg-red-500"></div>
          <div className="p-5 flex-1">
            <h3 className="text-gray-600 font-semibold text-sm mb-1">Overdue Tasks</h3>
            <div className="text-2xl font-bold text-red-500 mb-2">{currentData.stats.overdue}</div>
            <p className="text-xs text-gray-500">Tasks that are past their deadline</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-md border border-gray-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800 font-bold text-sm">Productivity Trend</h3>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-4 h-1.5 bg-blue-500 border border-blue-600 mr-2 rounded-sm"></div>
              Productivity %
            </div>
          </div>
          <Chart key={`trend-${activeFilter}`} options={trendChartOptions} series={trendChartSeries} type="area" height={250} />
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5">
          <h3 className="text-gray-800 font-bold text-sm mb-4">Task Distribution</h3>
          <div className="flex justify-center mt-6">
            <Chart key={`donut-${activeFilter}`} options={distributionOptions} series={distributionSeries} type="donut" height={220} />
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold text-sm">Recent Tasks</h3>
          <button className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-3 py-1 text-xs rounded-sm transition-colors">
            {activeFilter}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-white bg-[#74B8FA]">
              <tr>
                <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Task</th>
                <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Due Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentData.tasks.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3.5 border-r border-gray-100">{row.task}</td>
                  <td className="px-5 py-3.5 border-r border-gray-100">{row.due}</td>
                  <td className="px-5 py-3.5">
                    <span className={`${row.color} text-white px-3 py-1 rounded text-xs`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded shadow-sm border border-gray-100 text-center py-4 text-[13px] font-semibold text-[#18395C] mt-8">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

      {/* Floating Break Time Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-4 py-2 rounded-full flex items-center shadow-lg text-sm font-semibold transition-colors">
          <Coffee className="w-4 h-4 mr-2" />
          Break Time
        </button>
      </div>

    </div>
  );
}
