import React from 'react';
import { Hourglass, Banknote, Gauge, ReceiptText } from 'lucide-react';

export default function DriverPay() {
  const pendingPayments = [
    { name: 'Mohan Singh', deliveryNo: 'DEL-2023-1002', date: '03-07-2025', vehicle: 'Bolero', distance: '1200 km', rate: '₹3.75/km', deliveries: '4', pay: '1,800' },
    { name: 'Sunil Patel', deliveryNo: 'DEL-2023-1003', date: '04-07-2025', vehicle: 'Tata Ace', distance: '800 km', rate: '₹4.50/km', deliveries: '5', pay: '1,800' },
    { name: 'Ramesh Sharma', deliveryNo: 'DEL-2023-1004', date: '05-07-2025', vehicle: 'Eicher', distance: '1150 km', rate: '₹4.00/km', deliveries: '3', pay: '1,800' },
  ];

  const paymentHistory = [
    { id: 'PAY-2023-1001', name: 'Rajesh Kumar', date: '02-07-2025', deliveries: '6 deliveries', distance: '300 km', amount: '3,000', method: 'Bank Transfer' },
    { id: 'PAY-2023-1002', name: 'Vijay Mehta', date: '01-07-2025', deliveries: '5 deliveries', distance: '250 km', amount: '3,000', method: 'UPI' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Driver Pay Management</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Pending Payments Section */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
           <h2 className="text-[#0b74ba] font-bold text-[15px]">Pending Payments</h2>
           <div className="bg-[#0b74ba] text-white text-xs font-bold px-3 py-1.5 rounded">
              Total Due: ₹5,400
           </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Driver Name</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery No.</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Date</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Vehicle Type</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Distance (km)</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Rate/km</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Deliveries</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Pay</th>
                <th className="px-3 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {pendingPayments.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-4 border-r border-gray-100 font-medium">{row.name}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.deliveryNo}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.date}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.vehicle}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.distance}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.rate}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.deliveries}</td>
                  <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800">₹{row.pay}</td>
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

      {/* Payment History Section */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
           <h2 className="text-[#0b74ba] font-bold text-[15px]">Payment History</h2>
           <div className="bg-[#2cb25d] text-white text-xs font-bold px-3 py-1.5 rounded">
              Total Paid: ₹6,000
           </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Payment ID</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Driver Name</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Payment Date</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Delivery Count</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Distance</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Total Amount</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300">Payment Method</th>
                <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Status</th>
                <th className="px-3 py-3 font-medium text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {paymentHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-4 border-r border-gray-100">{row.id}</td>
                  <td className="px-3 py-4 border-r border-gray-100 font-medium">{row.name}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.date}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.deliveries}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.distance}</td>
                  <td className="px-3 py-4 border-r border-gray-100 font-medium text-gray-800">₹{row.amount}</td>
                  <td className="px-3 py-4 border-r border-gray-100">{row.method}</td>
                  <td className="px-3 py-4 border-r border-gray-100 text-center">
                    <span className="bg-[#2cb25d] text-white px-3 py-1 rounded text-[11px] font-bold">
                      Completed
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button className="text-gray-500 hover:text-[#0b74ba] transition flex flex-col items-center mx-auto">
                      <ReceiptText size={18} strokeWidth={1.5} />
                      <span className="text-[10px] mt-0.5">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[#0b74ba] font-bold text-xs tracking-wide uppercase mb-1">Total Pending Payments</p>
              <p className="text-2xl font-bold text-gray-800">₹5,400</p>
           </div>
           <div className="text-gray-800">
              <Hourglass size={32} strokeWidth={1.5} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[#2cb25d] font-bold text-xs tracking-wide uppercase mb-1">Total Paid This Month</p>
              <p className="text-2xl font-bold text-gray-800">₹6,000</p>
           </div>
           <div className="text-gray-800">
              <Banknote size={32} strokeWidth={1.5} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[#0ea5e9] font-bold text-xs tracking-wide uppercase mb-1">Total Kilometers</p>
              <p className="text-2xl font-bold text-gray-800">1,100 km</p>
           </div>
           <div className="text-gray-800">
              <Gauge size={32} strokeWidth={1.5} />
           </div>
        </div>
      </div>
    </div>
  );
}
