import React from 'react';
import { Coffee } from 'lucide-react';

export default function DeliveryManagement() {
  const deliveryData = [
    {
      no: 'DEL-2023-1001',
      location: 'Rajkot',
      kit: '6 Kit',
      kw: '25 KW',
      deliveryType: 'Express',
      vehicleType: 'Bollero',
      driver: 'Rajesh Kumar',
    },
    {
      no: 'DEL-2023-1002',
      location: 'Ahmedabad',
      kit: '8 Kit',
      kw: '27 KW',
      deliveryType: 'Regular',
      vehicleType: 'Bollero',
      driver: 'Mohan Singh',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="bg-[#2A659A] text-white px-6 py-4 rounded-sm shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide">Delivery Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded border-b-4 border-[#FFC107] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="text-[#FFC107] font-semibold text-lg mb-2">Out for Delivery</h2>
          <span className="text-4xl text-gray-800 font-light mb-2">15</span>
          <p className="text-gray-500 text-sm">Orders ready for dispatch</p>
        </div>
        
        <div className="bg-white rounded border-b-4 border-[#00BCD4] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="text-[#00BCD4] font-semibold text-lg mb-2">In Transit</h2>
          <span className="text-4xl text-gray-800 font-light mb-2">8</span>
          <p className="text-gray-500 text-sm">Orders currently being delivered</p>
        </div>

        <div className="bg-white rounded border-b-4 border-[#4CAF50] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="text-[#4CAF50] font-semibold text-lg mb-2">Delivered</h2>
          <span className="text-4xl text-gray-800 font-light mb-2">23</span>
          <p className="text-gray-500 text-sm">Completed deliveries</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#FFC107] font-bold text-xl">Out for Delivery</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-center">
            <thead className="text-white bg-[#74B8FA]">
              <tr>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Delivery No.</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Location</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Total<br/>Kit</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Total<br/>KW</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Delivery<br/>Type</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Vehicle<br/>Type</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Driver</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Generate Delivery<br/>Challan</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Driver Delivery<br/>Plan</th>
                <th className="px-4 py-3.5 font-semibold border-r border-blue-300/30">Upload Vehicle<br/>Photo</th>
                <th className="px-4 py-3.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveryData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-5 border-r border-gray-100">{row.no}</td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.location}</td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.kit}</td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.kw}</td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.deliveryType}</td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.vehicleType}</td>
                  <td className="px-4 py-5 border-r border-gray-100 whitespace-pre-line">{row.driver.replace(' ', '\n')}</td>
                  <td className="px-4 py-5 border-r border-gray-100">
                    <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-3 py-1.5 rounded font-medium text-xs w-[80px]">
                      Generate
                    </button>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100">
                    <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-3 py-1.5 rounded font-medium text-xs w-[80px]">
                      Generate
                    </button>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100">
                    <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-3 py-1.5 rounded font-medium text-xs w-[80px]">
                      Generate
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <button className="bg-[#00BCD4] hover:bg-[#0097a7] text-white px-3 py-1.5 rounded font-medium text-xs w-[90px]">
                      Start<br/>Delivery
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Break Time Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-4 py-2 rounded-full flex items-center shadow-lg text-sm font-semibold transition-colors">
          <Coffee className="w-4 h-4 mr-2" />
          Break Time
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-[13px] font-semibold text-[#18395C] mt-8 bg-transparent">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

    </div>
  );
}
