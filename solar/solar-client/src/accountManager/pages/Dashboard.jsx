import React from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';

export default function AccountManagerDashboard() {
  const pendingOrders = [
    { id: '#ORD-2023-001', cpName: 'Green Energy CP', project: 'Residential Solar', date: '15 Oct 2023', amount: '85,000', status: 'Pending' },
    { id: '#ORD-2023-005', cpName: 'SolarTech CP', project: 'Commercial Installation', date: '18 Oct 2023', amount: '1,25,000', status: 'Pending' },
    { id: '#ORD-2023-008', cpName: 'EcoPower CP', project: 'Industrial Project', date: '20 Oct 2023', amount: '2,50,000', status: 'Pending' },
    { id: '#ORD-2023-012', cpName: 'SunRay CP', project: 'Farm Installation', date: '22 Oct 2023', amount: '1,75,000', status: 'Pending' }
  ];

  const installerPayments = [
    { installer: 'Rajesh Kumar', cp: 'Green Energy CP', pending: '15,000', dueDate: '25 Oct 2023', status: 'Overdue' },
    { installer: 'Sunil Patel', cp: 'SolarTech CP', pending: '22,500', dueDate: '28 Oct 2023', status: 'Pending' },
    { installer: 'Anil Sharma', cp: 'EcoPower CP', pending: '18,000', dueDate: '30 Oct 2023', status: 'Pending' }
  ];

  const solarKitPayments = [
    { cp: 'Green Energy CP', kitType: '5KW Residential', pending: '45,000', dueDate: '25 Oct 2023', status: 'Overdue' },
    { cp: 'SolarTech CP', kitType: '10KW Commercial', pending: '85,000', dueDate: '28 Oct 2023', status: 'Pending' },
    { cp: 'EcoPower CP', kitType: '20KW Industrial', pending: '1,25,000', dueDate: '30 Oct 2023', status: 'Pending' }
  ];

  return (
    <div className="flex flex-col space-y-6 min-h-screen pb-10">
      <h1 className="text-2xl font-bold text-[#142340]">Account Dashboard</h1>
      
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {['Time Duration', 'Select Category', 'Select Sub Category', 'Project Type', 'Select Sub type'].map((placeholder, idx) => (
          <div key={idx} className="relative">
            <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none text-sm w-48 shadow-sm">
              <option value="">{placeholder}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-start justify-between">
          <p className="text-[11px] font-bold text-gray-500 tracking-wider">PROJECT SIGNUP</p>
          <p className="text-3xl font-bold text-[#3478c9] mt-2">42</p>
          <span className="mt-3 bg-[#2cb25d] text-white text-[10px] font-bold px-2 py-1 rounded">+5 this month</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-start justify-between">
          <p className="text-[11px] font-bold text-gray-500 tracking-wider">TOTAL ORDER AMOUNT</p>
          <p className="text-3xl font-bold text-[#2cb25d] mt-2">₹12,75,000</p>
          <span className="mt-3 bg-[#2cb25d] text-white text-[10px] font-bold px-2 py-1 rounded">+15% from last month</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider">PENDING PAYMENT</p>
              <p className="text-xl font-bold text-red-500 mt-1">8 Projects</p>
              <p className="text-sm font-semibold text-gray-700">₹2,45,000</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider">OVERDUE PAYMENT</p>
              <p className="text-xl font-bold text-red-500 mt-1">2 Projects</p>
              <p className="text-sm font-semibold text-gray-700">₹1,25,000</p>
            </div>
          </div>
          <span className="mt-3 bg-[#fbb03b] text-white text-[10px] font-bold px-2 py-1 rounded w-max">Action required</span>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-start justify-between">
          <p className="text-[11px] font-bold text-gray-500 tracking-wider">PENDING INSTALLATIONS</p>
          <p className="text-3xl font-bold text-[#f29f05] mt-2">15</p>
          <div className="flex items-center mt-3 space-x-2">
             <span className="bg-[#48a9a6] text-white text-[10px] font-bold px-2 py-1 rounded">5 scheduled this week</span>
             <span className="text-red-500 font-bold text-[11px]">Rs: 2,40,000</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white p-3 font-semibold text-sm">
          Gujarat District Map
        </div>
        <div className="w-full h-80 relative overflow-hidden bg-gray-100 flex items-center justify-center">
          {/* using a static map image for visual placeholder */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gujarat_district_map.svg/1200px-Gujarat_district_map.svg.png" 
            alt="Gujarat Map" 
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="bg-black/70 text-white px-4 py-2 rounded shadow-lg backdrop-blur-sm">Interactive Map Placeholder</span>
          </div>
        </div>
      </div>

      {/* CP Pending Orders */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h3 className="text-[15px] font-bold text-gray-800 mb-4">CP Pending Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#7fb4eb] text-white">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl">Order ID</th>
                <th className="px-4 py-3 font-medium">CP Name</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Order Date</th>
                <th className="px-4 py-3 font-medium">Amount (₹)</th>
                <th className="px-4 py-3 font-medium rounded-tr">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingOrders.map((order, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-3">{order.id}</td>
                  <td className="px-4 py-3">{order.cpName}</td>
                  <td className="px-4 py-3">{order.project}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="px-4 py-3">{order.amount}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#ffc107] text-gray-900 text-[11px] px-2 py-0.5 rounded font-medium">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CP Installer Payments */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-[15px] font-bold text-gray-800 mb-4">CP Installer Payments</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#7fb4eb] text-white">
                <tr>
                  <th className="px-3 py-2 font-medium rounded-tl">Installer</th>
                  <th className="px-3 py-2 font-medium">CP</th>
                  <th className="px-3 py-2 font-medium">Pending (₹)</th>
                  <th className="px-3 py-2 font-medium">Due Date</th>
                  <th className="px-3 py-2 font-medium rounded-tr">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {installerPayments.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                    <td className="px-3 py-3 font-medium">{item.installer}</td>
                    <td className="px-3 py-3">{item.cp}</td>
                    <td className="px-3 py-3">{item.pending}</td>
                    <td className="px-3 py-3">{item.dueDate}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.status === 'Overdue' ? 'bg-[#e53935] text-white' : 'bg-[#ffc107] text-gray-900'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button className="bg-[#0b74ba] hover:bg-[#095c94] transition-colors text-white text-[12px] font-medium px-4 py-1.5 rounded">Process Payments</button>
          </div>
        </div>

        {/* CP SolarKit Payments */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-[15px] font-bold text-gray-800 mb-4">CP SolarKit Payments</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#7fb4eb] text-white">
                <tr>
                  <th className="px-3 py-2 font-medium rounded-tl">CP</th>
                  <th className="px-3 py-2 font-medium">Kit Type</th>
                  <th className="px-3 py-2 font-medium">Pending (₹)</th>
                  <th className="px-3 py-2 font-medium">Due Date</th>
                  <th className="px-3 py-2 font-medium rounded-tr">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solarKitPayments.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                    <td className="px-3 py-3 font-medium">{item.cp}</td>
                    <td className="px-3 py-3">{item.kitType}</td>
                    <td className="px-3 py-3">{item.pending}</td>
                    <td className="px-3 py-3">{item.dueDate}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.status === 'Overdue' ? 'bg-[#e53935] text-white' : 'bg-[#ffc107] text-gray-900'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button className="bg-[#0b74ba] hover:bg-[#095c94] transition-colors text-white text-[12px] font-medium px-4 py-1.5 rounded">Process Payments</button>
          </div>
        </div>
      </div>

    </div>
  );
}
