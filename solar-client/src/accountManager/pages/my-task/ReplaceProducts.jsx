import React from 'react';
import { Image as ImageIcon, FileText, CheckCircle2, XCircle, Pencil, Check, X, ClipboardList, Printer, Eye } from 'lucide-react';

export default function ReplaceProducts() {
  const tableData = [
    {
      id: 'ACC-REP-1025',
      issueTitle: 'Performance Degradation',
      issueDesc: '20% lower output than specs',
      reported: '10-Jul-2025',
      photos: 3,
      prodName: 'Monocrystalline 400W',
      oldSerial: 'SN-M400-789456',
      newSerial: 'SN-M400-987123',
      verificationStatus: 'Serial Verified',
      status: 'Pending Approval',
      actionsType: 'approval'
    },
    {
      id: 'ACC-REP-1026',
      issueTitle: 'Physical Damage',
      issueDesc: 'Broken display panel',
      reported: '12-Jul-2025',
      photos: 2,
      prodName: 'Solar Inverter 5KVA',
      oldSerial: 'SN-INV5-123789',
      newSerial: 'SN-INV5-456321',
      verificationStatus: 'Serial Mismatch',
      status: 'Under Review',
      actionsType: 'review'
    },
    {
      id: 'ACC-REP-1027',
      issueTitle: 'Charging Fault',
      issueDesc: 'Not holding full charge',
      reported: '15-Jul-2025',
      photos: 1,
      prodName: 'Battery Bank 200Ah',
      oldSerial: 'SN-BAT2-456123',
      newSerial: 'SN-BAT2-789456',
      verificationStatus: 'Serial Verified',
      status: 'Approved',
      approvedDate: '18-Jul-2025',
      actionsType: 'completed'
    },
  ];

  const renderStatus = (status, date) => {
    if (status === 'Pending Approval') {
      return <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">{status}</span>;
    }
    if (status === 'Under Review') {
      return <span className="bg-gray-500 text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">{status}</span>;
    }
    if (status === 'Approved') {
      return (
         <div className="flex flex-col items-center">
           <span className="bg-[#28a745] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">{status}</span>
           <span className="text-[10px] text-gray-600 mt-1">{date}</span>
         </div>
      );
    }
    return null;
  };

  const renderActions = (type) => {
    if (type === 'approval') {
      return (
        <div className="flex flex-col items-center space-y-2">
          <button className="bg-[#28a745] hover:bg-green-600 text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm transition flex items-center w-full justify-center">
            <CheckCircle2 size={12} className="mr-1" /> Approve
          </button>
          <button className="text-red-500 hover:text-red-700 transition flex items-center text-[11px] w-full justify-center">
            <XCircle size={12} className="mr-1" /> Reject
          </button>
          <button className="text-blue-500 hover:text-blue-700 transition flex items-center text-[11px] w-full justify-center">
            <Pencil size={12} className="mr-1" /> Edit
          </button>
        </div>
      );
    }
    if (type === 'review') {
      return (
        <div className="flex flex-col items-center space-y-2">
          <button className="text-green-600 hover:text-green-800 transition flex items-center text-[11px] w-full justify-center">
            <Check size={12} className="mr-1" /> Verify
          </button>
          <button className="text-red-500 hover:text-red-700 transition flex items-center text-[11px] w-full justify-center">
            <X size={12} className="mr-1" /> Flag
          </button>
          <button className="text-blue-500 hover:text-blue-700 transition flex items-center text-[11px] w-full justify-center">
            <ClipboardList size={12} className="mr-1" /> Notes
          </button>
        </div>
      );
    }
    if (type === 'completed') {
       return (
         <div className="flex flex-col items-center space-y-2">
          <button className="text-gray-500 hover:text-gray-700 transition flex items-center text-[11px] w-full justify-center">
            <Printer size={12} className="mr-1" /> Print
          </button>
          <button className="text-[#0b74ba] hover:text-blue-700 transition flex items-center text-[11px] w-full justify-center">
            <Eye size={12} className="mr-1" /> View
          </button>
        </div>
       )
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-5 rounded shadow">
        <h1 className="text-xl font-bold">Product Replacement</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-[#0b74ba] font-bold text-base">Product Replacement Requests</h2>
        </div>
        
        <div className="overflow-x-auto p-5">
          <table className="w-full text-[12px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white text-[13px]">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Request ID</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Issue Details</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Product Verification</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Documentation</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {tableData.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-gray-700`}>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium whitespace-nowrap">
                    {row.id}
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 min-w-[200px]">
                     <div className="font-bold text-gray-800">{row.issueTitle}</div>
                     <div className="text-gray-500 mt-0.5">{row.issueDesc}</div>
                     <div className="text-gray-500 mt-0.5">Reported: {row.reported}</div>
                     <button className="text-[#0b74ba] hover:text-blue-700 mt-2 font-medium flex items-center transition">
                        <ImageIcon size={14} className="mr-1.5" /> View Defect Photos ({row.photos})
                     </button>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 min-w-[200px]">
                     <div className="text-gray-800 mb-1">{row.prodName}</div>
                     <div className="text-gray-500 mt-0.5 text-[11px]">Old Serial: {row.oldSerial}</div>
                     <div className="text-gray-500 mt-0.5 text-[11px]">New Serial: {row.newSerial}</div>
                     <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm ${row.verificationStatus === 'Serial Verified' ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`}>
                           {row.verificationStatus}
                        </span>
                     </div>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 min-w-[280px]">
                     <div className="flex items-center justify-center space-x-4 h-full text-gray-500 text-[11px] font-medium">
                        <button className="flex items-center hover:text-blue-600 transition">
                           <FileText size={14} className="mr-1" /> Old Invoice
                        </button>
                        <button className="flex items-center text-green-600 hover:text-green-700 transition">
                           <FileText size={14} className="mr-1" /> New Bill
                        </button>
                        <button className="flex items-center text-blue-500 hover:text-blue-700 transition">
                           <FileText size={14} className="mr-1" /> Warranty
                        </button>
                     </div>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 text-center">
                    {renderStatus(row.status, row.approvedDate)}
                  </td>
                  <td className="px-4 py-5 w-[100px]">
                     {renderActions(row.actionsType)}
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
