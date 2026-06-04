import React from 'react';
import { Image as ImageIcon, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReturnProducts() {
  const tableData = [
    { id: 'ACC-RET-10025', info: 'Monocrystalline 400W', qty: '2 panels', reason: 'Physical Damage', proofCount: 3, details: '₹24,500', status: 'Pending Approval' },
    { id: 'ACC-RET-10025', info: 'Monocrystalline 400W', qty: '2 panels', reason: 'Physical Damage', proofCount: 3, details: '₹24,500', status: 'Pending Approval' },
    { id: 'ACC-RET-10025', info: 'Monocrystalline 400W', qty: '2 panels', reason: 'Physical Damage', proofCount: 3, details: '₹24,500', status: 'Pending Approval' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-5 rounded shadow">
        <h1 className="text-xl font-bold">Return Product</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-[#0b74ba] font-bold text-base">Return Items Requiring Financial Action</h2>
        </div>
        
        <div className="overflow-x-auto p-5">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Return ID</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Product Info</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Quantity</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Return Reason</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Proof</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Financial Details</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Approval Status</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Payment Method</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {tableData.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} text-gray-700`}>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium">
                    {row.id.split('-').map((part, i) => (
                       <React.Fragment key={i}>
                          {part}{i < 2 ? '-' : ''}{i === 1 ? <br/> : ''}
                       </React.Fragment>
                    ))}
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium w-40">
                     {row.info.split(' ').map((word, i) => (
                       <React.Fragment key={i}>
                          {word}{i === 0 ? <br/> : ' '}
                       </React.Fragment>
                     ))}
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100">{row.qty}</td>
                  <td className="px-4 py-5 border-r border-gray-100 text-red-500 font-medium">
                     {row.reason.split(' ').map((word, i) => (
                       <React.Fragment key={i}>
                          {word}{i === 0 ? <br/> : ' '}
                       </React.Fragment>
                     ))}
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 text-center">
                    <button className="text-[#0b74ba] hover:text-blue-700 transition flex flex-col items-center mx-auto">
                      <ImageIcon size={18} strokeWidth={2} />
                      <span className="text-[11px] mt-1 font-medium">({row.proofCount})</span>
                    </button>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium text-gray-800">{row.details}</td>
                  <td className="px-4 py-5 border-r border-gray-100 text-center">
                    <span className="bg-[#ffc107] text-gray-800 px-3 py-1.5 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 text-center">
                     <select className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded text-[12px] focus:outline-none focus:border-blue-400">
                        <option>Select Method</option>
                     </select>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex items-center justify-center space-x-3">
                       <button className="bg-[#2cb25d] hover:bg-green-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition flex flex-col items-center">
                         <CheckCircle2 size={14} className="mb-0.5" />
                         Approve
                       </button>
                       <button className="text-red-500 hover:text-red-700 transition flex flex-col items-center px-2 font-bold text-[11px]">
                         <RotateCcw size={14} className="mb-0.5" />
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
  );
}
