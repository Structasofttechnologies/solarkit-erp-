import React from 'react';
import { CheckCircle2, AlertTriangle, Eye, MapPin } from 'lucide-react';

export default function TrackCPPayments() {
  const tableData = [
    { id: 'CP-1001', name: 'SolarEdge Private Limited', phone: '9876543210', amount: '₹80,000', days: '3 Days', status: 'Pending' },
    { id: 'CP-1002', name: 'BrightPath Private Limited', phone: '8765432109', amount: '₹1,20,000', days: '6 Days', status: 'Pending' },
    { id: 'CP-1003', name: 'GreenLine Energy Private Limited', phone: '7654321098', amount: '₹50,000', days: '2 Days', status: 'Completed' },
    { id: 'CP-1004', name: 'SunRoute Private Limited', phone: '6543210987', amount: '₹90,000', days: '5 Days', status: 'Overdue' },
    { id: 'CP-1005', name: 'EcoVolt Solutions Private Limited', phone: '9432109876', amount: '₹1,80,000', days: '3 Days', status: 'Pending' },
  ];

  const renderStatus = (status) => {
    if (status === 'Pending') {
      return <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">Pending</span>;
    }
    if (status === 'Completed') {
      return <span className="bg-[#28a745] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">Completed</span>;
    }
    if (status === 'Overdue') {
      return <span className="bg-[#dc3545] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">Overdue</span>;
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1a3b5c]">Track CP Payments</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col justify-center">
           <h3 className="text-[#0b74ba] text-[11px] font-bold uppercase mb-3">Total Pending Payments</h3>
           <div className="flex space-x-8 text-[15px] font-bold">
              <div>
                 <span className="text-[#dc3545]">Cash: </span>
                 <span className="text-gray-800">₹1,42,500</span>
              </div>
              <div>
                 <span className="text-[#dc3545]">Loan: </span>
                 <span className="text-gray-800">₹1,01,500</span>
              </div>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <h3 className="text-[#28a745] text-[11px] font-bold uppercase mb-3">Completed This Month</h3>
              <p className="text-lg font-bold text-gray-800">₹3,87,200</p>
           </div>
           <div>
              <div className="bg-black text-white rounded-full p-1 border-2 border-black">
                 <CheckCircle2 size={20} className="text-white" strokeWidth={3} />
              </div>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <h3 className="text-[#ffc107] text-[11px] font-bold uppercase mb-3">Overdue Payments</h3>
              <p className="text-lg font-bold text-gray-800">₹62,300</p>
           </div>
           <div>
              <AlertTriangle size={24} className="text-black" />
           </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col justify-center">
           <h3 className="text-[#17a2b8] text-[11px] font-bold uppercase mb-3">CPs With Pending</h3>
           <p className="text-lg font-bold text-gray-800">24</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
        <div className="bg-[#0b74ba] text-white px-4 py-3 border-b border-gray-200">
           <h2 className="font-bold text-[15px]">Gujarat District Map</h2>
        </div>
        <div className="relative w-full h-[350px] bg-blue-50">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x3959051f5f0ef795%3A0x861bd887ed54522e!2sGujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen="" 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             title="Gujarat Map"
           ></iframe>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden mt-6">
        {/* Table Header/Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
           <h2 className="text-[#0b74ba] font-bold text-sm flex items-center w-40 leading-tight">
             <div className="mr-2 grid grid-cols-2 gap-0.5">
               <div className="w-1.5 h-1.5 bg-[#0b74ba]"></div>
               <div className="w-1.5 h-1.5 bg-[#0b74ba]"></div>
               <div className="w-1.5 h-1.5 bg-[#0b74ba]"></div>
               <div className="w-1.5 h-1.5 bg-[#0b74ba]"></div>
             </div>
             CP Payment Details
           </h2>
           
           <div className="flex-1 grid grid-cols-4 gap-4">
              <select className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 w-full focus:outline-none focus:border-blue-400">
                <option>All CPs</option>
              </select>
              
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search CP..." 
                  className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 w-full focus:outline-none focus:border-blue-400"
                />
              </div>

              <select className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 w-full focus:outline-none focus:border-blue-400">
                <option>All Status</option>
              </select>
              
              <select className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 w-full focus:outline-none focus:border-blue-400">
                <option>All District</option>
              </select>
           </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-[13px] text-left border border-gray-100">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-blue-300">CP ID</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">CP</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Total Amount</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300">Days</th>
                <th className="px-4 py-3 font-medium border-r border-blue-300 text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-200 border-t-0">
              {tableData.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-gray-700`}>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="font-medium text-gray-800">{row.name}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5 font-bold">{row.phone}</div>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-100 font-bold text-[#28a745]">{row.amount}</td>
                  <td className="px-4 py-5 border-r border-gray-100 font-medium text-gray-800">{row.days}</td>
                  <td className="px-4 py-5 border-r border-gray-100 text-center">
                    {renderStatus(row.status)}
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button className="text-[#0b74ba] hover:text-blue-700 transition flex justify-center mx-auto">
                      <Eye size={16} strokeWidth={2.5} />
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
