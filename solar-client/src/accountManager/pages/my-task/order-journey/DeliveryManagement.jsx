import React from 'react';

export default function DeliveryManagement() {
  const tableData = [
    { no: 'DEL-2023-1001', location: 'Rajkot', kit: '6 Kit', kw: '25 KW', type: 'Express', vehicle: 'Bollero', driver: 'Rajesh Kumar' },
    { no: 'DEL-2023-1002', location: 'Ahmedabad', kit: '8 Kit', kw: '27 KW', type: 'Regular', vehicle: 'Bollero', driver: 'Mohan Singh' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Delivery Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded border border-yellow-400 shadow-sm p-6 text-center">
           <h2 className="text-yellow-500 font-medium mb-2">Out for Delivery</h2>
           <p className="text-5xl font-light text-gray-700 mb-2">15</p>
           <p className="text-gray-400 text-xs">Orders ready for dispatch</p>
        </div>
        <div className="bg-white rounded border border-teal-400 shadow-sm p-6 text-center">
           <h2 className="text-teal-500 font-medium mb-2">In Transit</h2>
           <p className="text-5xl font-light text-gray-700 mb-2">8</p>
           <p className="text-gray-400 text-xs">Orders currently being delivered</p>
        </div>
        <div className="bg-white rounded border border-green-500 shadow-sm p-6 text-center">
           <h2 className="text-green-500 font-medium mb-2">Delivered</h2>
           <p className="text-5xl font-light text-gray-700 mb-2">23</p>
           <p className="text-gray-400 text-xs">Completed deliveries</p>
        </div>
      </div>

      {/* Out for Delivery Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 mt-6 pb-6">
        <div className="px-4 py-4">
          <h3 className="text-yellow-500 font-bold text-lg">Out for Delivery</h3>
        </div>
        <div className="overflow-x-auto px-4">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery No.</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Location</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Kit</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total KW</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery Type</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Vehicle Type</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Driver</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 min-w-[160px]">Generate Delivery Challan</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 min-w-[160px]">Driver Delivery Plan</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 min-w-[160px]">Upload Vehicle Photo</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableData.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-gray-700`}>
                  <td className="px-3 py-5 border-r border-gray-100">{row.no}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.location}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.kit}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.kw}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.type}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.vehicle}</td>
                  <td className="px-3 py-5 border-r border-gray-100">{row.driver}</td>
                  <td className="px-3 py-5 border-r border-gray-100">
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden text-[10px]">
                        <label className="bg-gray-100 px-2 py-1.5 border-r border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-200">
                           Choose File
                           <input type="file" className="hidden" />
                        </label>
                        <span className="px-2 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis flex-1">No file chosen</span>
                     </div>
                  </td>
                  <td className="px-3 py-5 border-r border-gray-100">
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden text-[10px]">
                        <label className="bg-gray-100 px-2 py-1.5 border-r border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-200">
                           Choose File
                           <input type="file" className="hidden" />
                        </label>
                        <span className="px-2 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis flex-1">No file chosen</span>
                     </div>
                  </td>
                  <td className="px-3 py-5 border-r border-gray-100">
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden text-[10px]">
                        <label className="bg-gray-100 px-2 py-1.5 border-r border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-200">
                           Choose File
                           <input type="file" className="hidden" />
                        </label>
                        <span className="px-2 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis flex-1">No file chosen</span>
                     </div>
                  </td>
                  <td className="px-3 py-5 text-center">
                    <button className="bg-[#17a2b8] hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                      Start<br/>Delivery
                    </button>
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
