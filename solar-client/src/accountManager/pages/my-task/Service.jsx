import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function Service() {
  const [activeCard, setActiveCard] = useState(null);

  const solarPanelData = [
    { cpName: 'Sunshine Solar', custName: 'Rajesh Kumar', mobile: '9876543210', address: '123 Green St', location: 'Rajkot', product: 'Solar Panel 450W', serial: 'SPX12345', orderNo: 'ORD001', replacementStatus: 'Pending', faultyStatus: 'At Warehouse' },
    { cpName: 'Green Energy Solar', custName: 'Sunil Patel', mobile: '9876501234', address: '45 Blue St', location: 'Ahmedabad', product: 'Solar Panel 500W', serial: 'SPX98765', orderNo: 'ORD002', replacementStatus: 'Pending', faultyStatus: 'At Warehouse' }
  ];

  const inverterData = [
    { cpName: 'Eco Power Solar', custName: 'Amit Sharma', mobile: '9898989898', address: '78 Yellow Rd', location: 'Surat', product: 'Inverter 5KW', serial: 'INV12345', orderNo: 'ORD101', replacementStatus: 'Pending', faultyStatus: 'At Warehouse' }
  ];
  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#1a3b5c]">Service</h1>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          
          {/* Filters Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">Category Type</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Category Types</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">Sub Category Type</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Sub category Types</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">Project Type</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Project Types</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">Sub Project Type</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Sub Project Types</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">CP Type</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>All CP Types</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium text-[13px] mb-2">Channel Partner</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>-- Select CP --</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex space-x-3 pt-2">
            <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[12px] font-bold shadow-sm transition">
              Combokit
            </button>
            <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[12px] font-bold shadow-sm transition">
              Customize Kit
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Card 1 */}
            <div 
              className={`border rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition ${activeCard === 'solar' ? 'border-[#0b74ba] ring-1 ring-[#0b74ba]' : 'border-gray-200'}`}
              onClick={() => setActiveCard(activeCard === 'solar' ? null : 'solar')}
            >
              <h2 className="text-gray-800 font-bold text-[17px] mb-4">Solar Panel</h2>
              <div className="text-[#0b74ba] text-[20px] mb-4">12</div>
              <p className="text-gray-500 text-[14px]">Pending Replacements</p>
            </div>

            {/* Card 2 */}
            <div 
              className={`border rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition ${activeCard === 'inverter' ? 'border-[#0b74ba] ring-1 ring-[#0b74ba]' : 'border-gray-200'}`}
              onClick={() => setActiveCard(activeCard === 'inverter' ? null : 'inverter')}
            >
              <h2 className="text-gray-800 font-bold text-[17px] mb-4">Inverter</h2>
              <div className="text-[#0b74ba] text-[20px] mb-4">8</div>
              <p className="text-gray-500 text-[14px]">Pending Replacements</p>
            </div>
          </div>

          {/* Expanded Table Section */}
          {(activeCard === 'solar' || activeCard === 'inverter') && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-4 mb-4">
                 <input type="text" placeholder="Search by Customer" className="border border-gray-300 rounded px-4 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white shadow-sm" />
                 <input type="text" placeholder="Search by Mobile" className="border border-gray-300 rounded px-4 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white shadow-sm" />
                 <input type="text" placeholder="Search by Location" className="border border-gray-300 rounded px-4 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white shadow-sm" />
              </div>
              
              <div className="overflow-x-auto shadow-sm border border-gray-200 rounded">
                <table className="w-full text-[12px] text-left">
                  <thead className="bg-[#7fb4eb] text-white">
                    <tr>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">CP Name</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Customer Name</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Mobile No</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Address</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Location</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Product</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Serial No</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300">Order No</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Invoice</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">PCR Report</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Replacement Status</th>
                      <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Faulty Product Status</th>
                      <th className="px-3 py-3 font-medium text-center">Raise Request</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 border-t border-gray-200 bg-white">
                    {(activeCard === 'solar' ? solarPanelData : inverterData).map((row, idx) => (
                      <tr key={idx} className="text-gray-700 hover:bg-gray-50">
                        <td className="px-3 py-4 border-r border-gray-100">{row.cpName}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.custName}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.mobile}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.address}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.location}</td>
                        <td className="px-3 py-4 border-r border-gray-100 min-w-[100px]">{row.product}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.serial}</td>
                        <td className="px-3 py-4 border-r border-gray-100">{row.orderNo}</td>
                        <td className="px-3 py-4 border-r border-gray-100 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <button className="bg-[#0b74ba] text-white text-[10px] px-2 py-1 rounded w-16 hover:bg-blue-700 transition">View</button>
                            <button className="bg-gray-500 text-white text-[10px] px-2 py-1 rounded w-16 hover:bg-gray-600 transition">Download</button>
                          </div>
                        </td>
                        <td className="px-3 py-4 border-r border-gray-100 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <button className="bg-[#0b74ba] text-white text-[10px] px-2 py-1 rounded w-16 hover:bg-blue-700 transition">View</button>
                            <button className="bg-gray-500 text-white text-[10px] px-2 py-1 rounded w-16 hover:bg-gray-600 transition">Download</button>
                          </div>
                        </td>
                        <td className="px-3 py-4 border-r border-gray-100 text-center">
                           <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">{row.replacementStatus}</span>
                        </td>
                        <td className="px-3 py-4 border-r border-gray-100 text-center text-[11px] font-medium min-w-[90px]">
                           {row.faultyStatus}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <button className="bg-[#28a745] hover:bg-green-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                            Request
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
