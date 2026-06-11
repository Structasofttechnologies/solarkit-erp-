import React from 'react';
import { Image as ImageIcon, Coffee } from 'lucide-react';

export default function ReplaceProduct() {
  const replacementRequests = [
    {
      id: 'REP-2023-1001',
      serialNo: 'SN-M400-789456',
      defective: { name: 'Monocrystalline 400W', batch: 'B2023-07' },
      replacement: { name: 'Monocrystalline 400W', batch: 'B2023-09' },
      reason: 'Performance Issue',
      proofCount: 3,
      resolutionTime: '2 days'
    },
    {
      id: 'REP-2023-1002',
      serialNo: 'SN-INV5-123789',
      defective: { name: 'Solar Inverter 5KVA', batch: 'B2023-05' },
      replacement: { name: 'Solar Inverter 5KVA', batch: 'B2023-10' },
      reason: 'Physical Damage',
      proofCount: 2,
      resolutionTime: '1 day'
    },
    {
      id: 'REP-2023-1003',
      serialNo: 'SN-BAT2-456123',
      defective: { name: 'Battery Bank 200Ah', batch: 'B2023-03' },
      replacement: { name: 'Battery Bank 200Ah', batch: 'B2023-11' },
      reason: 'Charging Fault',
      proofCount: 4,
      resolutionTime: 'Pending'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="bg-[#2A659A] text-white px-6 py-4 rounded-sm shadow-sm flex items-center">
        <h1 className="text-2xl font-bold tracking-wide">Replace Product</h1>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#18395C] font-bold text-[15px]">Product Replacement Requests</h2>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-200 rounded-sm">
            <table className="w-full text-[13px] text-left">
              <thead className="text-white bg-[#74B8FA]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Request ID</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Serial No.</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Defective Product</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Replacement Product</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Reason</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30 text-center">Photo Proof</th>
                  <th className="px-5 py-3.5 font-semibold">Resolution Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {replacementRequests.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-4 border-r border-gray-100">{row.id}</td>
                    <td className="px-5 py-4 border-r border-gray-100">{row.serialNo}</td>
                    <td className="px-5 py-4 border-r border-gray-100">
                      <div className="font-medium text-gray-800">{row.defective.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Batch: {row.defective.batch}</div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100">
                      <div className="font-medium text-gray-800">{row.replacement.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Batch: {row.replacement.batch}</div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100 text-[#E53935]">{row.reason}</td>
                    <td className="px-5 py-4 border-r border-gray-100 text-center">
                      <button className="inline-flex items-center text-[#1D74B7] hover:text-blue-700 font-medium text-xs transition-colors">
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        View ({row.proofCount})
                      </button>
                    </td>
                    <td className="px-5 py-4">{row.resolutionTime}</td>
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
