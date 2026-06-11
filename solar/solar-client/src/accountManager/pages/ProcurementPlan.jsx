import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProcurementPlan() {
  const orderGroupsData = [
    { procNo: 'PROC-2023-001', deliveryId: 'DOID-00123', noOfOrders: 'Group Of 6', type: 'Residential', days: '3 days', status: 'Pending', delStatus: 'Pending' },
    { procNo: 'PROC-2023-002', deliveryId: 'DOID-00124', noOfOrders: 'Group Of 7', type: 'Commercial', days: '5 days', status: 'Overdue', delStatus: 'Pending' },
    { procNo: 'PROC-2023-003', deliveryId: 'DOID-00125', noOfOrders: 'Group Of 4', type: 'Residential', days: '1 day', status: 'In Progress', delStatus: 'Pending' },
  ];

  const orderDetailsData = [
    { cpName: 'Solar CP 1', custName: 'Rahul Sharma', kw: '5', price: '1,20,000', payment: 'UPI', days: '4Days' },
    { cpName: 'Sun Power', custName: 'Rahul Sharma', kw: '5', price: '1,20,000', payment: 'UPI', days: '3Days' },
    { cpName: 'Mayank Power', custName: 'Rahul Sharma', kw: '5', price: '1,20,000', payment: 'UPI', days: '3Days' },
    { cpName: 'Mayank Power', custName: 'Rahul Sharma', kw: '5', price: '1,20,000', payment: 'UPI', days: '3Days' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b74ba] mb-1">Procurement Management</h1>
        <p className="text-gray-500 text-sm font-medium">OverConfirm of procurement orders and vendor assignment.</p>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center space-x-4">
        <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-5 py-1.5 rounded text-[13px] font-bold shadow-sm transition">
          Combokit
        </button>
        <button className="text-[#0b74ba] hover:text-blue-700 text-[13px] font-bold transition">
          Customize Kit
        </button>
      </div>

      {/* Order Groups Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-white px-5 py-4 border-b border-gray-200">
           <h2 className="text-gray-800 font-bold text-[16px]">Order Groups</h2>
        </div>
        <div className="p-5">
           <table className="w-full text-[13px] text-left border border-gray-200">
             <thead className="bg-gray-100 text-gray-700">
               <tr>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">Procurement #</th>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">Delivery Order ID</th>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">No. of Orders</th>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">Project Type</th>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">Days Since Order</th>
                 <th className="px-4 py-3 font-bold border-r border-gray-200">Status Of Orders</th>
                 <th className="px-4 py-3 font-bold">Delivery Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {orderGroupsData.map((row, idx) => (
                 <tr key={idx} className="hover:bg-gray-50 font-medium text-gray-700">
                   <td className="px-4 py-4 border-r border-gray-200">{row.procNo}</td>
                   <td className="px-4 py-4 border-r border-gray-200">{row.deliveryId}</td>
                   <td className="px-4 py-4 border-r border-gray-200">{row.noOfOrders}</td>
                   <td className="px-4 py-4 border-r border-gray-200">{row.type}</td>
                   <td className="px-4 py-4 border-r border-gray-200">{row.days}</td>
                   <td className="px-4 py-4 border-r border-gray-200">{row.status}</td>
                   <td className="px-4 py-4">{row.delStatus}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      {/* Middle Action Buttons */}
      <div className="flex items-center space-x-4 pt-2">
        <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-2 rounded text-[13px] font-bold shadow-sm transition">
          Solarkit's Warehouse
        </button>
        <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-2 rounded text-[13px] font-bold shadow-sm transition">
          Supply By Vendors
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-6">
        <div>
          <label className="block text-gray-700 font-medium text-[13px] mb-2">Warehouse Status</label>
          <div className="relative w-40">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium text-[13px] mb-2">Payment Status</label>
          <div className="relative w-40">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-white px-5 py-4 border-b border-gray-200">
           <h2 className="text-[#1a3b5c] font-bold text-[16px]">Order Details</h2>
        </div>
        <div className="overflow-x-auto p-4">
           <table className="w-full text-[12px] text-left border border-gray-200">
             <thead className="bg-[#7fb4eb] text-white">
               <tr>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">CP Name</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">CP Logo</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Customer Name</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Detail</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Solar Panel</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Invertor</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Bos Kit</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Days Since Order</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Vendor Status</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">Payment Status</th>
                 <th className="px-3 py-3 font-medium text-center">Warehouse Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 border-t border-gray-200">
               {orderDetailsData.map((row, idx) => (
                 <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                   <td className="px-3 py-4 border-r border-gray-100">{row.cpName}</td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden">
                         <div className="w-3 h-3 bg-yellow-400 rounded-bl-full"></div>
                         <div className="w-3 h-3 bg-blue-600 rounded-tr-full"></div>
                      </div>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100">
                     {row.custName.split(' ').map((word, i) => (
                        <React.Fragment key={i}>{word}{i === 0 ? <br/> : ''}</React.Fragment>
                     ))}
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 font-medium">
                     <div>KW: {row.kw}</div>
                     <div>₹: {row.price}</div>
                     <div>Payment: {row.payment}</div>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                     <div className="flex flex-col items-center gap-1 text-[11px]">
                        <div className="font-bold text-green-600 tracking-tighter">WAAREE</div>
                        <div className="text-gray-500">Waaree: 3</div>
                     </div>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                     <div className="flex flex-col items-center gap-1 text-[11px]">
                        <div className="font-bold text-blue-600 tracking-tighter">VSOLE</div>
                        <div className="text-gray-500">Vsole: 1</div>
                     </div>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                     <div className="flex flex-col items-center gap-1 text-[11px]">
                        <div className="font-bold text-red-500 tracking-tighter">adani</div>
                        <div className="text-gray-500">Adani: 1</div>
                     </div>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">{row.days}</td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                      <span className="bg-[#dc3545] text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">Not Assigned</span>
                   </td>
                   <td className="px-3 py-4 border-r border-gray-100 text-center">
                      <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">Pending</span>
                   </td>
                   <td className="px-3 py-4 text-center">
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">At Warehouse</span>
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
