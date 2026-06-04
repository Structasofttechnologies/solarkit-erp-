import React from 'react';
import { Hourglass, Banknote, ReceiptText } from 'lucide-react';

export default function WarehouseVendorPay() {
  const pendingPayments = [
    { vendor: 'Sharma Logistics', date: '01-07-2025', warehouse: 'Mumbai', rate: '₹1,200', amount: '₹18,000' },
    { vendor: 'Gujarat Packers', date: '03-07-2025', warehouse: 'Ahmedabad', rate: '₹150', amount: '₹37,500' },
    { vendor: 'Safe Storage Co.', date: '05-07-2025', warehouse: 'Delhi', rate: '₹300', amount: '₹30,000' },
  ];

  const paymentHistory = [
    { id: 'PAY-WH-1001', vendor: 'Mumbai Movers', date: '28-06-2025', warehouse: 'Mumbai', amount: '₹45,000', method: 'Bank Transfer' },
    { id: 'PAY-WH-1002', vendor: 'Delhi Storage', date: '25-06-2025', warehouse: 'Delhi', amount: '₹67,000', method: 'Cheque' },
    { id: 'PAY-WH-1003', vendor: 'Rajkot Packers', date: '20-06-2025', warehouse: 'Rajkot', amount: '₹30,000', method: 'UPI' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-5 rounded shadow flex justify-between items-start">
        <h1 className="text-xl font-bold max-w-[60%]">Warehouse Vendor Payment Management</h1>
        <div className="flex space-x-4 text-xs font-semibold mt-1">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Pending Vendor Payments Section */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
           <h2 className="text-[#0b74ba] font-bold text-[15px]">Pending Vendor Payments</h2>
           <div className="bg-[#0b74ba] text-white text-xs font-bold px-3 py-1.5 rounded">
              Total Due: ₹85,500
           </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Vendor Name</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Date</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Warehouse</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Rate/Unit</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Amount</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Status</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {pendingPayments.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-4 border-r border-gray-100 font-medium">{row.vendor}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.date}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.warehouse}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.rate}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.amount}</td>
                  <td className="px-3 py-4 border-r border-gray-100 text-center">
                     <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">
                       Pending
                     </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition">
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Payment History Section */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
           <h2 className="text-[#0b74ba] font-bold text-[15px]">Vendor Payment History</h2>
           <div className="bg-[#28a745] text-white text-xs font-bold px-3 py-1.5 rounded">
              Total Paid: ₹1,42,000
           </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Payment ID</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Vendor Name</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Payment Date</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Warehouse</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Amount</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Payment Method</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Status</th>
                <th className="px-3 py-3 font-medium text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {paymentHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-4 border-r border-gray-100">{row.id}</td>
                  <td className="px-3 py-4 border-r border-gray-100 font-medium">{row.vendor}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.date}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.warehouse}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.amount}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.method}</td>
                  <td className="px-3 py-4 border-r border-gray-100 text-center">
                    <span className="bg-[#28a745] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">
                      Completed
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button className="text-gray-500 hover:text-[#0b74ba] transition flex flex-col items-center mx-auto">
                      <ReceiptText size={18} strokeWidth={1.5} />
                      <span className="text-[10px] mt-0.5 font-medium">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[#0b74ba] font-bold text-[11px] tracking-wide uppercase mb-1">Total Pending Payments</p>
              <p className="text-[22px] font-bold text-gray-800">₹85,500</p>
           </div>
           <div className="text-gray-800">
              <Hourglass size={28} strokeWidth={1.5} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[#28a745] font-bold text-[11px] tracking-wide uppercase mb-1">Total Paid This Month</p>
              <p className="text-[22px] font-bold text-gray-800">₹1,42,000</p>
           </div>
           <div className="text-gray-800">
              <Banknote size={28} strokeWidth={1.5} />
           </div>
        </div>
      </div>
    </div>
  );
}
