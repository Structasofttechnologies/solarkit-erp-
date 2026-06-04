import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import Chart from 'react-apexcharts';

export default function Report() {
  const [timeframe, setTimeframe] = useState('Daily');

  const dataMap = {
    Daily: {
      metrics: { productivity: '75%', completed: '5/12', overdue: '2' },
      tasks: [
        { task: 'Recruitment', date: 'Today', status: 'Completed' },
        { task: 'Generate Salary Report', date: 'Today', status: 'In Progress' },
        { task: 'Team Training', date: 'Yesterday', status: 'Overdue' },
        { task: 'Client Meeting', date: 'Yesterday', status: 'Overdue' },
      ],
      chartData: {
        lineCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        lineSeries: [65, 70, 68, 72, 75, 78, 75],
        donutSeries: [35, 20, 25, 20]
      }
    },
    Weekly: {
      metrics: { productivity: '68%', completed: '20/35', overdue: '5' },
      tasks: [
        { task: 'Recruitment', date: 'This week', status: 'Completed' },
        { task: 'Generate Salary Report', date: 'This week', status: 'Completed' },
        { task: 'Team training', date: 'This week', status: 'In Progress' },
        { task: 'Client Meeting', date: 'Last week', status: 'Overdue' },
      ],
      chartData: {
        lineCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        lineSeries: [60, 68, 74, 68],
        donutSeries: [20, 10, 5, 15]
      }
    },
    Monthly: {
      metrics: { productivity: '82%', completed: '45/60', overdue: '5' },
      tasks: [
        { task: 'Recruitment', date: 'This month', status: 'Completed' },
        { task: 'Generate Salary Report', date: 'This month', status: 'Completed' },
        { task: 'Team training', date: 'This month', status: 'In Progress' },
        { task: 'Client Meeting', date: 'Last month', status: 'Overdue' },
      ],
      chartData: {
        lineCategories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        lineSeries: [78, 85, 82, 88, 85, 89, 90, 82, 85, 87, 85, 82],
        donutSeries: [45, 15, 5, 10]
      }
    }
  };

  const currentData = dataMap[timeframe];

  const lineChartOptions = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#0d6efd'],
    dataLabels: { enabled: false },
    stroke: { curve: 'straight', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.05, stops: [0, 100] } },
    xaxis: { 
      categories: currentData.chartData.lineCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    yaxis: {
      min: 50, max: 100, tickAmount: 10,
      labels: { 
        formatter: (val) => val + '%',
        style: { colors: '#6c757d', fontSize: '11px' }
      }
    },
    grid: { borderColor: '#e9ecef', strokeDashArray: 0, padding: { left: 10, right: 10, top: 0, bottom: 0 } },
    markers: { size: 4, colors: ['#fff'], strokeColors: '#0d6efd', strokeWidth: 2, hover: { size: 6 } }
  };

  const lineChartSeries = [{
    name: 'Productivity %',
    data: currentData.chartData.lineSeries
  }];

  const donutChartOptions = {
    chart: { type: 'donut' },
    labels: ['Completed', 'In Progress', 'Overdue', 'Pending'],
    colors: ['#198754', '#ffc107', '#dc3545', '#0dcaf0'],
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: '65%' } } },
    stroke: { width: 2, colors: ['#fff'] }
  };

  const donutChartSeries = currentData.chartData.donutSeries;

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
           <h1 className="text-2xl font-bold text-[#1a3b5c] mb-1">Productivity Progress Report</h1>
           <p className="text-gray-500 text-sm font-medium">Track your productivity and task completion progress</p>
        </div>
        <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-2 rounded text-[13px] font-bold shadow-sm transition">
           Generate PDF
        </button>
      </div>

      {/* Timeframe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setTimeframe('Daily')}
          className={`rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition ${timeframe === 'Daily' ? 'bg-[#f0f8ff] border-2 border-[#0b74ba]' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
        >
           <Calendar size={20} className="text-[#0b74ba] mb-2" />
           <h2 className="text-[#1a3b5c] font-bold text-[16px] mb-1">Daily</h2>
           <p className="text-gray-500 text-[13px]">View today's progress</p>
        </div>
        <div 
          onClick={() => setTimeframe('Weekly')}
          className={`rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition ${timeframe === 'Weekly' ? 'bg-[#f0f8ff] border-2 border-[#0b74ba]' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
        >
           <Calendar size={20} className="text-[#0b74ba] mb-2" />
           <h2 className="text-[#1a3b5c] font-bold text-[16px] mb-1">Weekly</h2>
           <p className="text-gray-500 text-[13px]">View this week's progress</p>
        </div>
        <div 
          onClick={() => setTimeframe('Monthly')}
          className={`rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition ${timeframe === 'Monthly' ? 'bg-[#f0f8ff] border-2 border-[#0b74ba]' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
        >
           <Calendar size={20} className="text-[#0b74ba] mb-2" />
           <h2 className="text-[#1a3b5c] font-bold text-[16px] mb-1">Monthly</h2>
           <p className="text-gray-500 text-[13px]">View this month's progress</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 border-l-4 border-l-[#0b74ba] rounded-lg p-6 shadow-sm flex flex-col justify-between">
           <h3 className="text-gray-500 font-bold text-[14px] mb-2">Productivity</h3>
           <div className="text-[#1a3b5c] text-2xl font-bold mb-4">{currentData.metrics.productivity}</div>
           <p className="text-gray-600 text-[12px] leading-tight">Your efficiency based on<br/>completed tasks</p>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-[#28a745] rounded-lg p-6 shadow-sm flex flex-col justify-between">
           <h3 className="text-gray-500 font-bold text-[14px] mb-2">Completed Tasks</h3>
           <div className="text-[#1a3b5c] text-2xl font-bold mb-4">{currentData.metrics.completed}</div>
           <p className="text-gray-600 text-[12px] leading-tight">Tasks you've successfully finished</p>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-[#dc3545] rounded-lg p-6 shadow-sm flex flex-col justify-between">
           <h3 className="text-gray-500 font-bold text-[14px] mb-2">Overdue Tasks</h3>
           <div className="text-[#dc3545] text-2xl font-bold mb-4">{currentData.metrics.overdue}</div>
           <p className="text-gray-600 text-[12px] leading-tight">Tasks that are past their deadline</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity Trend */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col">
           <h3 className="text-[#1a3b5c] font-bold text-[15px] mb-4">Productivity Trend</h3>
           <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] relative">
              {/* Actual Line Chart */}
              <div className="w-full h-full -ml-3 mt-4">
                 <Chart options={lineChartOptions} series={lineChartSeries} type="area" height={300} />
              </div>
           </div>
        </div>

        {/* Task Distribution */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col items-center">
           <h3 className="text-[#1a3b5c] font-bold text-[15px] mb-4 w-full">Task Distribution</h3>
           <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[250px]">
              {/* Actual Donut Chart */}
              <div className="flex justify-center w-full mb-4">
                 <Chart options={donutChartOptions} series={donutChartSeries} type="donut" width={220} />
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-2 text-[12px] font-medium text-gray-600">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#198754] rounded-sm"></div> Completed
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ffc107] rounded-sm"></div> In Progress
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#dc3545] rounded-sm"></div> Overdue
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0dcaf0] rounded-sm"></div> Pending
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Recent Tasks */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
         <div className="px-5 py-4 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-[#1a3b5c] font-bold text-[16px]">Recent Tasks</h3>
            <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-1 rounded text-[12px] font-bold shadow-sm transition">
               {timeframe}
            </button>
         </div>
         <div className="p-4">
            <table className="w-full text-left text-[13px]">
               <thead className="bg-[#7fb4eb] text-white">
                 <tr>
                   <th className="px-4 py-3 font-medium rounded-tl">Task</th>
                   <th className="px-4 py-3 font-medium">Due Date</th>
                   <th className="px-4 py-3 font-medium rounded-tr">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {currentData.tasks.map((row, idx) => (
                   <tr key={idx} className="hover:bg-gray-50 text-gray-700 font-medium">
                     <td className="px-4 py-4">{row.task}</td>
                     <td className="px-4 py-4">{row.date}</td>
                     <td className="px-4 py-4">
                        {row.status === 'Completed' && <span className="bg-[#28a745] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm">Completed</span>}
                        {row.status === 'In Progress' && <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm">In Progress</span>}
                        {row.status === 'Overdue' && <span className="bg-[#dc3545] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm">Overdue</span>}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
