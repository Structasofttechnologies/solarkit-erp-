import React from 'react';
import { Check, X, Image as ImageIcon, Coffee } from 'lucide-react';

export default function ReturnProduct() {
  const returnRequests = [
    {
      id: 'SOL-RET-2023-1001',
      details: 'Monocrystalline 400W',
      qty: '2 panels',
      reason: 'Physical Damage',
      proofCount: 3,
      date: '05-Jul-2025'
    },
    {
      id: 'SOL-RET-2023-1002',
      details: 'Polycrystalline 350W',
      qty: '1 panel',
      reason: 'Physical Damage',
      proofCount: 5,
      date: '03-Jul-2025'
    },
    {
      id: 'SOL-RET-2023-1003',
      details: 'Bifacial 450W',
      qty: '4 panels',
      reason: 'Shipping Damage',
      proofCount: 2,
      date: '01-Jul-2025'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="bg-[#2A659A] text-white px-6 py-4 rounded-sm shadow-sm flex items-center">
        <h1 className="text-2xl font-bold tracking-wide">Return Product</h1>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#18395C] font-bold text-[15px]">Solar Panel Return Requests</h2>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-200 rounded-sm">
            <table className="w-full text-[13px] text-left">
              <thead className="text-white bg-[#74B8FA]">
                <tr>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Return ID</th>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Panel Details</th>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Quantity</th>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Return Reason</th>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30 text-center">Proof</th>
                  <th className="px-5 py-3 font-semibold border-r border-blue-300/30">Return Date</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {returnRequests.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-4 border-r border-gray-100">{row.id}</td>
                    <td className="px-5 py-4 border-r border-gray-100">{row.details}</td>
                    <td className="px-5 py-4 border-r border-gray-100">{row.qty}</td>
                    <td className="px-5 py-4 border-r border-gray-100 text-red-500">{row.reason}</td>
                    <td className="px-5 py-4 border-r border-gray-100 text-center">
                      <div className="flex justify-center items-center text-[#1D74B7] font-medium text-xs">
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        ({row.proofCount})
                      </div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100">{row.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-3 py-1.5 rounded flex items-center font-medium text-xs shadow-sm transition-colors">
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </button>
                        <button className="text-red-500 hover:text-red-700 flex items-center font-medium text-xs transition-colors">
                          <X className="w-3.5 h-3.5 mr-0.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded shadow-sm border border-gray-100 text-center py-4 text-[13px] font-semibold text-[#18395C] mt-8">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

      {/* Floating Break Time Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-4 py-2 rounded-full flex items-center shadow-lg text-sm font-semibold transition-colors">
          <Coffee className="w-4 h-4 mr-2" />
          Break Time
        </button>
      </div>

    </div>
  );
}
