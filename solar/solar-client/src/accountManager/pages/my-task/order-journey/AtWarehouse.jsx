import React from 'react';
import { Pencil } from 'lucide-react';

export default function AtWarehouse() {
  const outForDeliveryData = [
    { no: 'DEL-2023-1001', location: 'Rajkot', kit: '6 Kit', kw: '25 KW', type: 'Express', vehicle: 'Bollero', driver: 'Rajesh Kumar' },
    { no: 'DEL-2023-1002', location: 'Ahmedabad', kit: '8 Kit', kw: '27 KW', type: 'Regular', vehicle: 'Bollero', driver: 'Mohan Singh' },
  ];

  const summaryData = [
    { no: 'DEL-2023-1001', kit: '8 Kit', kw: '27 KW', type: 'Express', vehicle: 'Bollero', driver: 'Rajesh Kumar', invoice: 'invoice_DEL1001.pdf', eway: 'eway_DEL1001.pdf' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">At Warehouse</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex justify-center mt-6">
        <div className="bg-white rounded border border-gray-200 shadow-md p-6 w-96 text-center">
           <h2 className="text-[#0b74ba] font-bold text-sm mb-4">At Warehouse</h2>
           <p className="text-5xl font-light text-[#0b74ba]">15</p>
        </div>
      </div>

      {/* Out for Delivery Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200 mt-6">
        <div className="bg-[#fff3cd] border-b border-gray-200 px-4 py-3">
          <h3 className="text-[#856404] font-bold text-[15px]">Out for Delivery</h3>
        </div>
        <div className="overflow-x-auto p-4">
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
                <th className="px-3 py-3 font-medium border-r border-blue-300 min-w-[200px]">Invoice</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 min-w-[200px]">E-Way Bill</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {outForDeliveryData.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-gray-700`}>
                  <td className="px-3 py-4 border-r border-gray-100">{row.no}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.location}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.kit}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.kw}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.type}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.vehicle}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.driver}</td>
                  <td className="px-3 py-4 border-r border-gray-100">
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden text-[11px]">
                        <label className="bg-gray-100 px-3 py-1.5 border-r border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-200">
                           Choose File
                           <input type="file" className="hidden" />
                        </label>
                        <span className="px-3 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">No file chosen</span>
                     </div>
                  </td>
                  <td className="px-3 py-4 border-r border-gray-100">
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden text-[11px]">
                        <label className="bg-gray-100 px-3 py-1.5 border-r border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-200">
                           Choose File
                           <input type="file" className="hidden" />
                        </label>
                        <span className="px-3 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">No file chosen</span>
                     </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button className="bg-[#17a2b8] hover:bg-cyan-600 text-white px-4 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                      Done
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary of Delivery Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200 mt-6">
        <div className="bg-[#28a745] px-4 py-3">
          <h3 className="text-white font-bold text-[15px]">Summary of Delivery</h3>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery No.</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Kit</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total KW</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery Type</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Vehicle Type</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Driver</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Invoice</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">E-Way Bill</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryData.map((row, idx) => (
                <tr key={idx} className="bg-white text-gray-700 hover:bg-gray-50">
                  <td className="px-3 py-4 border-r border-gray-100">{row.no}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.kit}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.kw}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.type}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.vehicle}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.driver}</td>
                  <td className="px-3 py-4 border-r border-gray-100 text-gray-600">{row.invoice}</td>
                  <td className="px-3 py-4 border-r border-gray-100 text-gray-600">{row.eway}</td>
                  <td className="px-3 py-4 text-center">
                    <button className="text-gray-500 hover:text-blue-500 transition">
                      <Pencil size={16} />
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
