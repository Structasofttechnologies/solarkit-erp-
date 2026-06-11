import React from 'react';
import { ChevronDown, Home, Building2, Zap } from 'lucide-react';

export default function CreateOrder() {
  const vendors = [
    {
      name: 'Adani Solar',
      orders: 8,
      kw: 32,
      panels: 64,
      tech: 'Bifacial',
      watt: 550,
      paymentStatus: 'Pending',
      supplier: 'Rajesh Solar'
    },
    {
      name: 'Waree Energy',
      orders: 5,
      kw: 18,
      panels: 36,
      tech: 'Bifacial',
      watt: 550,
      paymentStatus: 'Pending',
      supplier: 'Rajesh Solar',
      accepted: true
    },
    {
      name: 'Vikram Solar',
      orders: 4,
      kw: 15,
      panels: 30,
      tech: 'Bifacial',
      watt: 550,
      paymentStatus: 'Pending',
      supplier: 'Rajesh Solar'
    },
    {
      name: 'Tata Power',
      orders: 3,
      kw: 12,
      panels: 24,
      tech: 'Bifacial',
      watt: 550,
      paymentStatus: 'Pending',
      supplier: 'Rajesh Solar',
      accepted: true
    }
  ];

  const tableData = [
    { cpName: 'Solar CP 1', customer: 'Rahul Sharma', kw: 5, price: '1,20,000', payment: 'UPI' },
    { cpName: 'Sun Power', customer: 'Priya Singh', kw: 3, price: '80,000', payment: 'Card' },
    { cpName: 'Sun Power', customer: 'Priya Singh', kw: 3, price: '80,000', payment: 'Card' },
    { cpName: 'Sun Power', customer: 'Priya Singh', kw: 3, price: '80,000', payment: 'Card' },
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-8">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Order Management</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {['Select Cluster', 'Select Category', 'Sub Category', 'Project Type', 'Sub Project Type'].map((placeholder, idx) => (
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
        <div className="flex space-x-2 mt-2 lg:mt-0">
           <button className="bg-[#0b74ba] text-white text-xs font-semibold px-4 py-1.5 rounded shadow-sm hover:bg-blue-700 transition">Combo kit</button>
           <button className="bg-[#2cb25d] text-white text-xs font-semibold px-4 py-1.5 rounded shadow-sm hover:bg-green-600 transition">Customize Kit</button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Residential */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-blue-500 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-[#0b74ba] mb-4">
            <Home size={24} />
            <span className="text-xl font-bold">Residential</span>
          </div>
          <div className="flex justify-between mt-2">
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
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-green-500 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-[#2cb25d] mb-4">
            <Building2 size={24} />
            <span className="text-xl font-bold">Commercial</span>
          </div>
          <div className="flex justify-between mt-2">
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
        <div className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-yellow-500 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-yellow-500 mb-4">
            <Zap size={24} />
            <span className="text-xl font-bold">Solar Pump</span>
          </div>
          <div className="flex justify-between mt-2">
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

      {/* Select Vendor Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="font-bold text-[#142340] text-lg mb-2 md:mb-0">Select Vendor Section</h2>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500">Order Status</label>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded text-sm w-24 focus:outline-none">
                  <option>All</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500">Supply Type</label>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded text-sm w-24 focus:outline-none">
                  <option>All</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors.map((vendor, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 text-center border-t-[5px] border-t-transparent hover:border-t-blue-500 transition-colors">
              <h3 className="font-bold text-gray-800 text-[17px]">{vendor.name}</h3>
              <div className="flex justify-between mt-4 px-2">
                <div>
                  <p className="text-[10px] text-gray-500">Total Orders</p>
                  <p className="font-bold text-lg">{vendor.orders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Total KW</p>
                  <p className="font-bold text-[#0b74ba] text-lg">{vendor.kw} KW</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[10px] text-gray-500">Total Panels</p>
                <p className="font-bold text-[#0b74ba]">{vendor.panels} Panels</p>
              </div>
              <div className="flex justify-between mt-3 px-2">
                <div>
                  <p className="text-[10px] text-gray-500">Technology</p>
                  <p className="font-bold text-[#2cb25d]">{vendor.tech}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Watt Peak</p>
                  <p className="font-bold text-[#0b74ba]">{vendor.watt} Wp</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                <button className="bg-[#0b74ba] text-white text-[10px] font-semibold px-2 py-1.5 rounded flex-1">Select Vendors</button>
                <button className="bg-[#2cb25d] text-white text-[10px] font-semibold px-2 py-1.5 rounded flex-1">Download P.O</button>
              </div>
              <div className="mt-4 text-left border-t border-gray-100 pt-3">
                <p className="text-[10px] text-gray-500 mb-2">Vendors & Payment Status</p>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-gray-700">Accept Order?</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${vendor.accepted ? 'bg-[#2cb25d] text-white' : 'bg-[#ffc107] text-gray-900'}`}>{vendor.accepted ? 'Accepted' : 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-700">{vendor.supplier}</span>
                  <span className="bg-[#ffc107] text-gray-900 text-[10px] font-semibold px-2 py-0.5 rounded">Pending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supply By Vendor Section */}
      <div className="mt-8">
        <h2 className="font-bold text-[#142340] text-lg mb-4">Supply By Vendor Section</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors.map((vendor, idx) => (
            <div key={idx} className={`bg-white border rounded-lg shadow-sm p-5 text-center transition-colors ${idx === 0 ? 'border-red-300 shadow-red-100' : 'border-gray-200 border-t-[5px] border-t-transparent hover:border-t-blue-500'}`}>
              <h3 className="font-bold text-gray-800 text-[17px]">{vendor.name}</h3>
              <div className="flex justify-between mt-4 px-2">
                <div>
                  <p className="text-[10px] text-gray-500">Total Orders</p>
                  <p className="font-bold text-lg">{vendor.orders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Total KW</p>
                  <p className="font-bold text-[#0b74ba] text-lg">{vendor.kw} KW</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[10px] text-gray-500">Total Panels</p>
                <p className="font-bold text-[#0b74ba]">{vendor.panels} Panels</p>
              </div>
              <div className="flex justify-between mt-3 px-2">
                <div>
                  <p className="text-[10px] text-gray-500">Technology</p>
                  <p className="font-bold text-[#2cb25d]">{vendor.tech}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Watt Peak</p>
                  <p className="font-bold text-[#0b74ba]">{vendor.watt} Wp</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                <button className="bg-[#0b74ba] text-white text-[10px] font-semibold px-2 py-1.5 rounded flex-1">Supply by Vendors</button>
                <button className="bg-[#2cb25d] text-white text-[10px] font-semibold px-2 py-1.5 rounded flex-1">Download P.O</button>
              </div>

              {idx === 0 ? (
                <div className="mt-4 text-left border-t border-gray-100 pt-3">
                  <p className="text-[10px] text-gray-600 font-semibold mb-2">Contract Summary</p>
                  <div className="space-y-1 text-[10px]">
                    <p><span className="text-gray-500">Contract No:</span> RADN-1022</p>
                    <p><span className="text-gray-500">Total Inventory:</span> 124 Units</p>
                    <p><span className="text-gray-500">CP Name:</span> GreenGrid CP</p>
                    <p><span className="text-gray-500">Product:</span> Solar Panel Kit</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-left border-t border-gray-100 pt-3">
                  <p className="text-[10px] text-gray-500 mb-2">Vendors & Payment Status</p>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-gray-700">Accept Order?</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${vendor.accepted ? 'bg-[#2cb25d] text-white' : 'bg-[#ffc107] text-gray-900'}`}>{vendor.accepted ? 'Accepted' : 'Pending'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-700">{vendor.supplier}</span>
                    <span className="bg-[#ffc107] text-gray-900 text-[10px] font-semibold px-2 py-0.5 rounded">Pending</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-8 overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[1000px]">
          <thead className="bg-[#7fb4eb] text-white">
            <tr>
              <th className="px-3 py-3 font-medium">CP Name</th>
              <th className="px-3 py-3 font-medium text-center">CP Logo</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium text-center">Type</th>
              <th className="px-3 py-3 font-medium">Details</th>
              <th className="px-3 py-3 font-medium">Solar Panel</th>
              <th className="px-3 py-3 font-medium">Inverter</th>
              <th className="px-3 py-3 font-medium">BOS Kit</th>
              <th className="px-3 py-3 font-medium text-center">Generate PI</th>
              <th className="px-3 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-4 text-gray-800">{row.cpName}</td>
                <td className="px-3 py-4">
                  <div className="flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[7px] font-bold text-blue-700 border border-blue-200 shadow-sm overflow-hidden">
                       {/* Placeholder for CP Logo */}
                       CP
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-gray-800">{row.customer}</td>
                <td className="px-3 py-4 text-center">
                  <button className="bg-[#0b74ba] text-white text-[10px] font-medium px-2 py-1 rounded">Customize</button>
                </td>
                <td className="px-3 py-4 space-y-1 text-gray-800">
                  <p className="font-bold">KW: <span className="font-normal">{row.kw}</span></p>
                  <p className="font-bold">₹: <span className="font-normal">{row.price}</span></p>
                  <p className="font-bold">Payment: <span className="font-normal">{row.payment}</span></p>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                       <span className="bg-green-100 border border-green-300 text-[8px] text-green-700 px-1 py-0.5 rounded font-bold w-12 text-center">Waaree</span>
                       <span className="text-[10px] font-medium text-gray-600">3</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                       <span className="bg-blue-100 border border-blue-300 text-[8px] text-blue-700 px-1 py-0.5 rounded font-bold w-12 text-center">Adani</span>
                       <span className="text-[10px] font-medium text-gray-600">2</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                       <span className="bg-purple-100 border border-purple-300 text-[8px] text-purple-700 px-1 py-0.5 rounded font-bold w-12 text-center">Waaree</span>
                       <span className="text-[10px] font-medium text-gray-600">1</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                   <div className="flex items-center space-x-1.5">
                      <span className="bg-blue-100 border border-blue-300 text-[8px] text-blue-700 px-1 py-0.5 rounded font-bold w-12 text-center">Adani</span>
                      <span className="text-[10px] font-medium text-gray-600">1</span>
                   </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <button className="bg-[#2cb25d] hover:bg-green-600 text-white font-bold text-[10px] px-3 py-1.5 rounded">Generate PI</button>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="text-[#0b74ba] text-[11px] font-semibold cursor-pointer hover:underline">Confirm</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
