import React from 'react';
import { ChevronDown, Home, Building2, Zap, Settings } from 'lucide-react';

export default function DeliveryPlan() {
  const tableData = [
    { id: 'ORD12345', customer: 'Rahul Sharma', kw: 5, amount: '1,20,000', location: 'North Zone', areaType: 'Urban', deliveryType: 'Regular' },
    { id: 'ORD12346', customer: 'Anita Patel', kw: 10, amount: '2,50,000', location: 'South Zone', areaType: 'Rural', deliveryType: 'Express' },
    { id: 'ORD12347', customer: 'Vikram Mehta', kw: 7.5, amount: '1,80,000', location: 'East Zone', areaType: 'Urban', deliveryType: 'Prime' },
    { id: 'ORD12348', customer: 'Priya Singh', kw: 3, amount: '80,000', location: 'West Zone', areaType: 'Rural', deliveryType: 'Regular' },
    { id: 'ORD12349', customer: 'Sanjay Gupta', kw: 8, amount: '2,00,000', location: 'North Zone', areaType: 'Urban', deliveryType: 'Prime' },
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Delivery Plan Management</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {['Select Category', 'Select Sub Categ', 'Project Type', 'Select Sub type', 'Select Cluster', 'Select Delivery'].map((placeholder, idx) => (
            <div key={idx} className="relative">
              <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded text-sm w-36 focus:outline-none">
                <option value="">{placeholder}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
         <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded text-sm w-36 focus:outline-none">
              <option value="">Select Area Type</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={14} />
            </div>
         </div>
         <div className="flex space-x-2 w-full md:w-auto justify-center md:justify-start">
           <button className="bg-[#0b74ba] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded shadow flex items-center space-x-1 transition"><Settings size={14}/><span>Customize</span></button>
           <button className="bg-[#2cb25d] hover:bg-green-600 text-white text-xs font-semibold px-4 py-1.5 rounded shadow flex items-center space-x-1 transition"><Zap size={14}/><span>ComboKit</span></button>
         </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Residential */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-t-[5px] border-t-blue-500 shadow-sm flex flex-col justify-between relative">
          <input type="checkbox" className="absolute top-4 left-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <div className="flex items-center justify-center space-x-2 text-[#0b74ba] mb-4">
            <Home size={24} />
            <span className="text-xl font-bold">Residential</span>
          </div>
          <div className="flex justify-around mt-2">
            <div className="text-center">
               <p className="text-xs text-gray-500">Total Order</p>
               <p className="text-lg font-bold text-gray-800">12</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500">Overdue Order</p>
               <p className="text-lg font-bold text-yellow-500">5</p>
            </div>
          </div>
        </div>
        {/* Commercial */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-t-[5px] border-t-green-500 shadow-sm flex flex-col justify-between relative">
          <input type="checkbox" className="absolute top-4 left-4 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
          <div className="flex items-center justify-center space-x-2 text-[#2cb25d] mb-4">
            <Building2 size={24} />
            <span className="text-xl font-bold">Commercial</span>
          </div>
          <div className="flex justify-around mt-2">
            <div className="text-center">
               <p className="text-xs text-gray-500">Total Order</p>
               <p className="text-lg font-bold text-gray-800">12</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500">Overdue Order</p>
               <p className="text-lg font-bold text-yellow-500">5</p>
            </div>
          </div>
        </div>
        {/* Solar Pump */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-t-[5px] border-t-yellow-500 shadow-sm flex flex-col justify-between relative">
          <input type="checkbox" className="absolute top-4 left-4 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded" />
          <div className="flex items-center justify-center space-x-2 text-yellow-500 mb-4">
            <Zap size={24} />
            <span className="text-xl font-bold">Solar Pump</span>
          </div>
          <div className="flex justify-around mt-2">
            <div className="text-center">
               <p className="text-xs text-gray-500">Total Order</p>
               <p className="text-lg font-bold text-gray-800">12</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500">Overdue Order</p>
               <p className="text-lg font-bold text-yellow-500">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="bg-white border-t-4 border-t-red-400 p-4 rounded shadow-sm text-center">
           <h3 className="text-red-400 font-bold text-[15px] mb-1">North Zone</h3>
           <p className="text-gray-500 text-[11px] mb-1">Orders</p>
           <p className="text-lg font-bold text-gray-800">15</p>
        </div>
        <div className="bg-white border-t-4 border-t-teal-400 p-4 rounded shadow-sm text-center">
           <h3 className="text-teal-400 font-bold text-[15px] mb-1">South Zone</h3>
           <p className="text-gray-500 text-[11px] mb-1">Orders</p>
           <p className="text-lg font-bold text-gray-800">12</p>
        </div>
        <div className="bg-white border-t-4 border-t-green-400 p-4 rounded shadow-sm text-center">
           <h3 className="text-green-400 font-bold text-[15px] mb-1">East Zone</h3>
           <p className="text-gray-500 text-[11px] mb-1">Orders</p>
           <p className="text-lg font-bold text-gray-800">8</p>
        </div>
        <div className="bg-white border-t-4 border-t-yellow-500 p-4 rounded shadow-sm text-center">
           <h3 className="text-yellow-500 font-bold text-[15px] mb-1">West Zone</h3>
           <p className="text-gray-500 text-[11px] mb-1">Orders</p>
           <p className="text-lg font-bold text-gray-800">10</p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col xl:flex-row gap-6 mt-4">
        {/* Left Side */}
        <div className="flex-1 space-y-6">
          {/* Map */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 text-[15px] mb-3">Rajkot Map</h3>
            <div className="w-full h-80 bg-gray-200 rounded overflow-hidden relative">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gujarat_district_map.svg/1200px-Gujarat_district_map.svg.png" 
                alt="Map Placeholder" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="bg-black/60 text-white px-3 py-1 rounded text-sm shadow">Interactive Map View Placeholder</span>
              </div>
            </div>
          </div>

          {/* Pending Delivery Orders Table */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-[15px] mb-4">Pending Delivery Orders</h3>
            
            <div className="flex flex-wrap justify-between items-center mb-4 text-[11px] font-bold">
               <div className="flex space-x-4 items-center mb-2 sm:mb-0">
                  <span className="bg-[#0b74ba] text-white px-2 py-1 rounded">All</span>
                  <span className="text-green-500 cursor-pointer">Regular</span>
                  <span className="text-yellow-500 cursor-pointer">Express</span>
                  <span className="text-red-500 cursor-pointer">Prime</span>
               </div>
               <div className="flex space-x-4 items-center">
                  <span className="bg-[#0b74ba] text-white px-2 py-1 rounded">All</span>
                  <span className="text-green-500 cursor-pointer">Rural</span>
                  <span className="text-yellow-500 cursor-pointer">Urban</span>
               </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-[#7fb4eb] text-white">
                  <tr>
                    <th className="px-3 py-3 font-medium border-r border-blue-300 w-10 text-center">
                      <input type="checkbox" className="h-3 w-3 rounded" />
                    </th>
                    <th className="px-3 py-3 font-medium border-r border-blue-300">Order No.</th>
                    <th className="px-3 py-3 font-medium border-r border-blue-300">Customer</th>
                    <th className="px-3 py-3 font-medium border-r border-blue-300">Details</th>
                    <th className="px-3 py-3 font-medium border-r border-blue-300">Location</th>
                    <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Area Type</th>
                    <th className="px-3 py-3 font-medium text-center">Delivery Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-4 border-r border-gray-100 text-center">
                        <input type="checkbox" className="h-3 w-3 rounded" />
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-700">{row.id}</td>
                      <td className="px-3 py-4 border-r border-gray-100 text-gray-700">
                         {row.customer.split(' ')[0]}<br/>{row.customer.split(' ')[1]}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 text-gray-700 leading-tight">
                         <span className="font-bold">KW:</span> {row.kw}<br/>
                         <span className="font-bold">Amount:</span><br/>₹{row.amount}
                      </td>
                      <td className="px-3 py-4 border-r border-gray-100 text-gray-700">{row.location}</td>
                      <td className="px-3 py-4 border-r border-gray-100 text-center">
                         <span className={`text-[10px] font-bold px-3 py-1 rounded text-white ${row.areaType === 'Urban' ? 'bg-[#0b74ba]' : 'bg-[#ffc107] text-gray-900'}`}>
                           {row.areaType}
                         </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                         <span className={`text-[10px] font-bold px-3 py-1 rounded text-white ${
                           row.deliveryType === 'Regular' ? 'bg-[#2cb25d]' :
                           row.deliveryType === 'Express' ? 'bg-[#ffc107] text-gray-900' : 'bg-[#e53935]'
                         }`}>
                           {row.deliveryType}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between items-center text-xs font-semibold text-gray-600 mt-6">
               <div className="space-y-1">
                  <p>Total KW: <span className="text-[#0b74ba]">33.5</span></p>
                  <p>Total KM: <span className="text-[#2cb25d]">115</span></p>
               </div>
               <div className="text-right space-y-1">
                  <p>Per Kw Rs: <span className="text-[#0b74ba]">500</span></p>
                  <p>Betchmark Price Per Kw: <span className="text-[#2cb25d]">600</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Create Delivery Plan Form */}
        <div className="xl:w-[350px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-6">
             <div className="bg-[#f4f7f9] p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[15px]">Create Delivery Plan</h3>
             </div>
             <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Delivery Type</label>
                  <select className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400">
                    <option>Select Type</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Vehicle Type</label>
                  <select className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400">
                    <option>Select Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Driver</label>
                  <select className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400">
                    <option>Select Driver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Delivery Per KW Charges</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm font-semibold">₹</span>
                    <input type="text" value="500" readOnly className="w-full bg-white border border-gray-300 text-gray-700 py-2 pl-7 pr-3 rounded text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Estimated Delivery Date</label>
                  <input type="date" className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400 text-gray-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Special Instructions</label>
                  <textarea rows="4" className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400"></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Select Delivery Week</label>
                  <select className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:border-blue-400">
                    <option>Week --, ----</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Available Slots</label>
                  <p className="text-xs text-gray-500 mt-1">None selected</p>
                </div>
                
                <div className="pt-3">
                   <button className="bg-[#0b74ba] hover:bg-blue-700 text-white font-bold text-[12px] px-5 py-2.5 rounded w-max shadow-sm transition">Confirm Delivery Plan</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
