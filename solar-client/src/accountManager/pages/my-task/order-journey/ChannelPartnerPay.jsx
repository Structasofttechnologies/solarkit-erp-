import React from 'react';
import { ChevronDown, Zap, Settings } from 'lucide-react';

export default function ChannelPartnerPay() {
  const tableData = [
    {
      cpName: 'Rajesh Solar Distributors', brand: 'Adani', product: 'Solar Panel', technology: 'Bifacial', projectType: 'Residential', wattPeak: '550W', totalKW: '55 KW', totalPanels: '100', totalLoanAmount: '95,000', cpPay: '30,000'
    },
    {
      cpName: 'Mayank Solar Pvt Ltd', brand: 'Waaree', product: 'Inverter', technology: 'Monofacial', projectType: 'Commercial', wattPeak: '650W', totalKW: '45 KW', totalPanels: '90', totalLoanAmount: '95,000', cpPay: '10,000'
    },
    {
      cpName: 'Vikram Energy Solutions', brand: 'Vikram', product: 'BOS Kit', technology: 'Polycrystalline', projectType: 'Residential', wattPeak: '500W', totalKW: '30 KW', totalPanels: '60', totalLoanAmount: '78,500', cpPay: '15,000'
    },
    {
      cpName: 'Green Energy Solutions', brand: 'Tata', product: 'Solar Panel', technology: 'Monocrystalline', projectType: 'Residential', wattPeak: '600W', totalKW: '48 KW', totalPanels: '80', totalLoanAmount: '1,05,000', cpPay: '25,000'
    },
    {
      cpName: 'Solar Tech India', brand: 'Adani', product: 'Inverter', technology: 'Hybrid', projectType: 'Residential', wattPeak: '700W', totalKW: '35 KW', totalPanels: '50', totalLoanAmount: '1,02,500', cpPay: '20,000'
    }
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Channel Partener Payment</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button className="bg-[#0b74ba] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow flex items-center space-x-1 transition">
          <Zap size={14}/><span>ComboKit</span>
        </button>
        <button className="bg-transparent text-[#0b74ba] border border-[#0b74ba] hover:bg-blue-50 text-xs font-semibold px-4 py-2 rounded shadow flex items-center space-x-1 transition">
          <Settings size={14}/><span>Customize Kit</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
        {['All Products', 'Select Category', 'Select Sub Category Type', 'Select Project Type', 'Select Sub Project Type'].map((placeholder, idx) => (
          <div key={idx} className="relative flex-1 min-w-[150px]">
            <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded text-sm w-full focus:outline-none focus:border-blue-400">
              <option value="">{placeholder}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-x-auto mt-6">
        <table className="w-full text-[13px] text-left min-w-[1100px]">
          <thead className="bg-[#7fb4eb] text-white">
            <tr>
              <th className="px-4 py-3 font-medium border-r border-blue-300 w-[160px]">Channel Partener Name</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Brand</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Product</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Technology</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Project Type</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Watt Peak</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Total KW</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300">Total Panels</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Total Loan Amount</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Channel Partener Pay</th>
              <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Action</th>
              <th className="px-3 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                <td className="px-4 py-4 border-r border-gray-100 font-medium break-words leading-tight">
                  {row.cpName}
                </td>
                <td className="px-3 py-4 border-r border-gray-100">{row.brand}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.product}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.technology}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.projectType}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.wattPeak}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.totalKW}</td>
                <td className="px-3 py-4 border-r border-gray-100">{row.totalPanels}</td>
                <td className="px-3 py-4 border-r border-gray-100 text-center">₹{row.totalLoanAmount}</td>
                <td className="px-3 py-4 border-r border-gray-100 text-center">{row.cpPay}</td>
                <td className="px-3 py-4 border-r border-gray-100 text-center">
                  <button className="bg-[#2cb25d] hover:bg-green-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                    Pay To CP
                  </button>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="bg-[#ffc107] text-gray-800 px-3 py-1.5 rounded text-[11px] font-bold">
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
