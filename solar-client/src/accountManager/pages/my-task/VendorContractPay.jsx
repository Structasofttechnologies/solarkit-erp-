import React from 'react';
import { Eye, ChevronDown } from 'lucide-react';

export default function VendorContractPay() {
  const tableData = [
    {
      contractNo: 'CN-2024-001',
      product: 'Solar Panel 330W',
      brand: 'Adani',
      paymentStatus: 'Partial',
      paid: '4,00,000',
      remaining: '3,00,000',
      daysLeft: 15,
      totalCP: 6,
      inventory: '350/500 KW',
    },
    {
      contractNo: 'CN-2024-001',
      product: 'Solar Panel 330W',
      brand: 'Adani',
      paymentStatus: 'Partial',
      paid: '4,00,000',
      remaining: '3,00,000',
      daysLeft: 15,
      totalCP: 9,
      inventory: '350/500 KW',
    },
    {
      contractNo: 'CN-2024-001',
      product: 'Solar Panel 330W',
      brand: 'Adani',
      paymentStatus: 'Partial',
      paid: '4,00,000',
      remaining: '3,00,000',
      daysLeft: 15,
      totalCP: 4,
      inventory: '350/500 KW',
    },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b74ba] text-white p-4">
          <h1 className="text-xl font-bold">Vendor Contract Payments</h1>
        </div>

        <div className="p-5">
          {/* Filters Row */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">Contract No.</label>
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">Brand</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Brands</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">Payment Status</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  <option>All Statuses</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">CP</label>
              <div className="relative">
                <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  <option>All CPs</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border border-gray-100">
              <thead className="bg-[#7fb4eb] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium border-r border-blue-300">Contract No.</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Product</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Brand</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Payment Status</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Paid</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Remaining</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Days Left</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Total CP</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Total Inventory</th>
                  <th className="px-3 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
                {tableData.map((row, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-gray-700`}>
                    <td className="px-4 py-4 border-r border-gray-100 font-medium whitespace-nowrap">{row.contractNo}</td>
                    <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800">{row.product}</td>
                    <td className="px-3 py-4 border-r border-gray-100">{row.brand}</td>
                    <td className="px-3 py-4 border-r border-gray-100 text-[11px] font-bold">{row.paymentStatus}</td>
                    <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800">{row.paid}</td>
                    <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800">{row.remaining}</td>
                    <td className="px-3 py-4 border-r border-gray-100 text-center">
                      <span className="bg-[#ffc107] text-gray-800 px-2 py-1 rounded text-[11px] font-bold shadow-sm inline-block min-w-[28px]">
                        {row.daysLeft}
                      </span>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-100 text-center">
                      <div className="flex items-center justify-center space-x-1.5 font-bold text-gray-800">
                        <span>{row.totalCP}</span>
                        <Eye size={14} className="text-gray-500 cursor-pointer hover:text-gray-700" />
                      </div>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-100 text-center text-[#0b74ba] font-medium">
                      {row.inventory}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                        Make Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
