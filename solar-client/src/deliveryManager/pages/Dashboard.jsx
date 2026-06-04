import React from 'react';
import { Truck, ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Coffee } from 'lucide-react';
import Chart from 'react-apexcharts';

export default function DeliveryManagerDashboard() {
  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 2
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'],
      labels: {
        style: { fontSize: '10px', colors: '#6B7280' },
        rotate: -30
      }
    },
    yaxis: {
      min: 0,
      max: 30,
      tickAmount: 6,
      title: { text: 'Drivers Count', style: { fontSize: '10px', color: '#6B7280' } },
      labels: { style: { fontSize: '10px', colors: '#6B7280' } }
    },
    colors: ['#D1D5DB'], // A neutral color if not specified, maybe #9CA3AF or keep simple
    grid: { borderColor: '#E5E7EB' }
  };

  const chartSeries = [{
    name: 'Drivers',
    data: [20, 15, 10, 25, 8]
  }];

  const tableData = [
    { id: '#DL-5451', customer: 'Rahul Mehta', vehicle: 'GJ01AB1234', driver: 'Vikram Patel', location: 'Ahmedabad' },
    { id: '#DL-5452', customer: 'Neha Shah', vehicle: 'MH04XY9987', driver: 'Sanjay Kulkarni', location: 'Pune' },
    { id: '#DL-5453', customer: 'Rakesh Verma', vehicle: 'DL8CAF8877', driver: 'Imran Khan', location: 'Delhi NCR' },
    { id: '#DL-5454', customer: 'Anita Desai', vehicle: 'RJ14KA4421', driver: 'Mahesh Yadav', location: 'Jaipur' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 relative pb-20">
      {/* Header */}
      <div className="bg-[#2A3644] text-white px-6 py-4 rounded shadow-sm flex items-center space-x-3">
        <Truck className="w-5 h-5" />
        <h1 className="text-[17px] font-medium tracking-wide">Delivery Dashboard</h1>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-[#18395C] font-bold text-[14.5px] mb-2">Today's Deliveries</h3>
          <p className="text-3xl font-bold text-gray-800 mb-1">142</p>
          <div className="flex items-center text-green-600 text-xs font-semibold">
            <ArrowUp className="w-3 h-3 mr-1" /> 12% from yesterday
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="text-green-600 mb-1">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-[#18395C] font-bold text-[14.5px] mb-1">Completed</h3>
          <p className="text-[22px] font-bold text-gray-800">98</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-[#18395C] font-bold text-[14.5px] mb-1">In Progress</h3>
          <p className="text-[22px] font-bold text-gray-800 mt-2">32</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="text-red-500 mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-[#18395C] font-bold text-[14.5px] mb-1">Delayed</h3>
          <p className="text-[22px] font-bold text-gray-800 mb-1">12</p>
          <div className="flex items-center text-red-500 text-xs font-semibold">
            <ArrowUp className="w-3 h-3 mr-1" /> 3 from yesterday
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Map & Table) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Card */}
          <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#1374B8] text-white px-5 py-3 font-semibold text-[15px]">
              Gujarat District Map
            </div>
            <div className="h-[380px] w-full">
              <iframe 
                src="https://maps.google.com/maps?q=Gujarat&t=&z=6&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                aria-hidden="false" 
                tabIndex="0">
              </iframe>
            </div>
          </div>

          {/* Today's Deliveries Table */}
          <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[#18395C] font-bold text-[15px]">Today's Deliveries</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-5 py-3 font-semibold border-r border-blue-300/30 whitespace-nowrap">Delivery<br/>ID</th>
                    <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Customer</th>
                    <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Vehicle No.</th>
                    <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Driver</th>
                    <th className="px-5 py-3 font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 text-gray-700">
                      <td className="px-5 py-3.5 border-r border-gray-100 whitespace-nowrap">{row.id}</td>
                      <td className="px-5 py-3.5 border-r border-gray-100 whitespace-nowrap">{row.customer}</td>
                      <td className="px-5 py-3.5 border-r border-gray-100 whitespace-nowrap">{row.vehicle}</td>
                      <td className="px-5 py-3.5 border-r border-gray-100 whitespace-nowrap">{row.driver}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Status & Chart) */}
        <div className="space-y-6">
          
          {/* Delivery Status Card */}
          <div className="bg-white rounded shadow-sm border border-gray-100 p-6 relative">
            <h2 className="text-[#18395C] font-bold text-[15.5px] mb-5">Delivery Status</h2>
            
            <div className="space-y-5">
              <div>
                <h4 className="text-[#18395C] font-bold text-[13px] mb-1">Delivery Completion Rate</h4>
                {/* Visual placeholder for completion rate if needed */}
              </div>

              <div>
                <h4 className="text-[#18395C] font-bold text-[13px] mb-1">Average Delivery Time</h4>
                <div className="flex items-center text-[22px] font-bold text-gray-800">
                  42 min
                  <span className="flex items-center text-green-600 text-xs ml-2 font-semibold">
                    <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> 5%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[#18395C] font-bold text-[13px] mb-1">On-Time Delivery Rate</h4>
                <div className="flex items-center text-[22px] font-bold text-gray-800">
                  89%
                  <span className="flex items-center text-green-600 text-xs ml-2 font-semibold">
                    <ArrowUp className="w-3.5 h-3.5 mr-0.5" /> 2%
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50">
                <h4 className="text-[#18395C] font-bold text-[13px] mb-4">Delivery Type Breakdown</h4>
                
                <div className="space-y-4">
                  {/* Prime Delivery */}
                  <div>
                    <div className="flex justify-between items-center text-[13px] mb-1.5">
                      <span className="text-gray-700">Prime Delivery</span>
                      <span className="bg-[#0275C9] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">62%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#0275C9] h-1.5 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>

                  {/* Standard Delivery */}
                  <div>
                    <div className="flex justify-between items-center text-[13px] mb-1.5">
                      <span className="text-gray-700">Standard Delivery</span>
                      <span className="bg-[#6B7280] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">28%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#6B7280] h-1.5 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  {/* COD Delivery */}
                  <div>
                    <div className="flex justify-between items-center text-[13px] mb-1.5 relative">
                      <span className="text-gray-700">COD Delivery</span>
                      <span className="bg-[#00B4D8] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">10%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#00B4D8] h-1.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2">
              <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-4 py-2.5 rounded-full flex items-center shadow-md text-xs transition-colors border border-gray-800">
                <Coffee className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-semibold tracking-wide">Break Time</span>
              </button>
            </div>
          </div>

          {/* Drivers by Zone Chart Card */}
          <div className="bg-white rounded shadow-sm border border-gray-100 p-5">
            <h2 className="text-[#18395C] font-bold text-[14.5px] mb-2">Drivers by Zone</h2>
            <div className="h-[220px] w-full">
              <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded shadow-sm border border-gray-100 text-center py-4 text-[13px] font-semibold text-[#18395C]">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

    </div>
  );
}
