import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SolarPanelBundlePlan() {
  const summaryData = [
    { type: 'Manufacturer', supplier: 'Rajesh Patel', brand: 'Adani', product: 'Solar Panel', tech: 'Mono PERC', wattage: '330W', kw: '30 KW', cp: 12, status: 'Subscribed', date: '2025-07-25' },
    { type: 'Distributor', supplier: 'Karan Desai', brand: 'Warree', product: 'Solar Panel', tech: 'Mono PERC', wattage: '330W', kw: '50 KW', cp: 12, status: 'Pending', date: '2025-08-10' },
    { type: 'Dealer', supplier: 'Sunil Shetty', brand: 'Luminous', product: 'Solar Panel', tech: 'Polycrystalline', wattage: '400W', kw: '40 KW', cp: 12, status: 'Subscribed', date: '2025-08-05' },
  ];

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen space-y-6">
      
      {/* Header */}
      <div className="bg-[#28a745] text-white p-4 rounded shadow-sm">
        <h1 className="text-xl font-bold">Solar Panel Bundle Plans</h1>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-5 space-y-6">
        
        {/* Filters Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All Supplier</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All Districts</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All Statuses</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 bg-white">
              <option>All Products</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button className="bg-[#28a745] hover:bg-green-600 text-white px-4 py-1.5 rounded text-[13px] font-bold shadow-sm transition">
            Apply Filters
          </button>
          <button className="text-gray-500 hover:text-gray-700 text-[13px] font-medium transition">
            Reset
          </button>
        </div>

        {/* Combo/Customize Buttons */}
        <div className="flex items-center space-x-4 pt-2">
          <button className="bg-[#0b74ba] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[13px] font-bold shadow-sm transition">
            Combo Kit
          </button>
          <button className="text-[#0b74ba] hover:text-blue-700 text-[13px] font-medium transition">
            Customize Kit
          </button>
        </div>

        {/* Form Table */}
        <div className="overflow-x-auto pt-4 border-b pb-8 border-gray-200">
          <table className="w-full text-left text-[13px]">
             <thead className="bg-[#7fb4eb] text-white">
               <tr>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Supplier Type</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Supplier Selection</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Brand</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Product</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Technology</th>
                 <th className="px-3 py-3 font-medium border-r border-blue-300">Wattage</th>
                 <th className="px-3 py-3 font-medium">Total Amount (₹)</th>
               </tr>
             </thead>
             <tbody className="bg-white">
               <tr>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-full bg-white focus:outline-none focus:border-blue-400">
                       <option>Select Supplier Type</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-full bg-white focus:outline-none focus:border-blue-400">
                       <option>Select Supplier</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-full bg-white focus:outline-none focus:border-blue-400">
                       <option>Select Brand</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-full bg-white focus:outline-none focus:border-blue-400">
                       <option>Solar Panel</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-full bg-white focus:outline-none focus:border-blue-400">
                       <option>Mono PERC</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top">
                    <select className="border border-gray-300 rounded px-2 py-1.5 w-[80px] bg-white focus:outline-none focus:border-blue-400">
                       <option>330W</option>
                    </select>
                 </td>
                 <td className="px-2 py-4 align-top flex items-center">
                    <span className="bg-gray-100 border border-gray-300 text-gray-500 px-2 py-1.5 rounded-l text-[12px]">₹</span>
                    <input type="text" className="border-t border-b border-r border-gray-300 rounded-r px-2 py-1.5 w-full focus:outline-none focus:border-blue-400" />
                 </td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>

      {/* Bundle Summary Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
         <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
            <h2 className="text-[#1a3b5c] font-bold text-[16px]">Bundle Summary</h2>
         </div>
         <div className="overflow-x-auto p-4">
            <table className="w-full text-[12px] text-left border border-gray-200">
              <thead className="bg-[#7fb4eb] text-white">
                <tr>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Supplier Type</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Supplier</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Brand</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Product</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Technology</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Wattage</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">KW</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300">Total CP</th>
                  <th className="px-3 py-3 font-medium border-r border-blue-300 text-center">CP Status</th>
                  <th className="px-3 py-3 font-medium text-center">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-200">
                {summaryData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 text-gray-700">
                    <td className="px-3 py-5 border-r border-gray-200">{row.type}</td>
                    <td className="px-3 py-5 border-r border-gray-200">
                      {row.supplier.split(' ').map((word, i) => (
                         <React.Fragment key={i}>{word}{i === 0 ? <br/> : ''}</React.Fragment>
                      ))}
                    </td>
                    <td className="px-3 py-5 border-r border-gray-200">{row.brand}</td>
                    <td className="px-3 py-5 border-r border-gray-200">
                       {row.product.split(' ').map((word, i) => (
                         <React.Fragment key={i}>{word}{i === 0 ? <br/> : ''}</React.Fragment>
                      ))}
                    </td>
                    <td className="px-3 py-5 border-r border-gray-200">{row.tech}</td>
                    <td className="px-3 py-5 border-r border-gray-200">{row.wattage}</td>
                    <td className="px-3 py-5 border-r border-gray-200 font-bold">{row.kw.split(' ').map((w,i) => <React.Fragment key={i}>{w}{i===0?<br/>:''}</React.Fragment>)}</td>
                    <td className="px-3 py-5 border-r border-gray-200 text-center font-bold text-gray-800">{row.cp}</td>
                    <td className="px-3 py-5 border-r border-gray-200 text-center">
                       {row.status === 'Subscribed' ? (
                          <span className="bg-[#28a745] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">Subscribed</span>
                       ) : (
                          <span className="bg-[#ffc107] text-gray-800 px-3 py-1 rounded text-[11px] font-bold shadow-sm whitespace-nowrap">Pending</span>
                       )}
                    </td>
                    <td className="px-3 py-5 text-center whitespace-nowrap text-gray-800 font-medium">
                       {row.date.split('-').map((part, i) => (
                         <React.Fragment key={i}>
                           {part}{i < 2 ? '-' : ''}{i === 0 ? <br/> : ''}
                         </React.Fragment>
                       ))}
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
