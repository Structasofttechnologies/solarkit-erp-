import React, { useState } from 'react';
import { Calendar, Download, Coffee } from 'lucide-react';

export default function InwardManagement() {
  const [inwardData] = useState([
    {
      orderNo: 'ORD-2023-1001',
      brand: 'Adani',
      product: 'Solar Panel 350W',
      technology: 'Mono PERC',
      projectType: 'Commercial',
      wattPeak: '350W',
      totalKw: '17 KW',
      totalUnits: '50',
      sku: 'SKU-350-BA-01',
      status: 'Completed',
      scanNo: 'SCN-001',
      receivedDate: '02-07-2025',
      downloadable: true,
    },
    {
      orderNo: 'ORD-2023-1002',
      brand: 'Waree',
      product: 'Solar Panel 400W',
      technology: 'Bi-facial',
      projectType: 'Residential',
      wattPeak: '400W',
      totalKw: '12 KW',
      totalUnits: '30',
      sku: 'SKU-400-BB-02',
      status: 'Completed',
      scanNo: 'SCN-002',
      receivedDate: '02-07-2025',
      downloadable: true,
    },
    {
      orderNo: 'ORD-2023-1003',
      brand: 'Adani',
      product: 'Solar Inverter 5KW',
      technology: 'Hybrid',
      projectType: 'Industrial',
      wattPeak: '350W',
      totalKw: '50 KW',
      totalUnits: '10',
      sku: 'SKU-INV-5K-C01',
      status: 'Pending',
      scanNo: '-',
      receivedDate: '-',
      downloadable: false,
    },
  ]);

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen relative">
      
      {/* Inward Management Section */}
      <div className="space-y-4">
        {/* Header Title */}
        <div className="bg-[#2C7BBA] p-4 text-white font-bold text-xl rounded-sm">
          InWard Management
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="dd-mm-yyyy" 
              className="border border-gray-300 rounded-md px-4 py-2 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          
          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>All Products</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>All Brands</option>
          </select>

          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm font-medium">
            Clear Filters
          </button>
        </div>

        {/* Table 1 */}
        <div className="overflow-x-auto border border-gray-200 rounded-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-white bg-[#74B8FA] whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Order No</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Brand</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Product</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Technology</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Project Type</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Watt Peak</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Total KW</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Total Units</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">SKU Number</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Status</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Scan No</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Received Date</th>
                <th className="px-4 py-3 font-semibold">Download sheet</th>
              </tr>
            </thead>
            <tbody>
              {inwardData.map((row, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4 border-r border-gray-200">{row.orderNo}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.brand}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.product}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.technology}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.projectType}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.wattPeak}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.totalKw}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.totalUnits}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.sku}</td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      row.status === 'Completed' ? 'bg-[#2E9C47]' : 'bg-[#EAB308]'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.scanNo}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.receivedDate}</td>
                  <td className="px-4 py-4 text-center">
                    <button className={`px-3 py-1.5 rounded text-xs font-medium text-white ${
                      row.downloadable ? 'bg-[#2E9C47] hover:bg-green-700' : 'bg-gray-500'
                    }`}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanned Items Summary Section */}
      <div className="space-y-4">
        {/* Header Title */}
        <div className="bg-[#2C7BBA] p-4 text-white font-bold text-xl rounded-sm">
          Scanned Items Summary
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>Project Type</option>
          </select>

          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>Technology</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>All Products</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-4 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 appearance-none">
            <option>All Brands</option>
          </select>

          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm font-medium">
            Clear Filters
          </button>
        </div>

        {/* Table 2 */}
        <div className="overflow-x-auto border border-gray-200 rounded-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-white bg-[#74B8FA] whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Order No</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Brand</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Product</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Technology</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Project Type</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Watt Peak</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Total KW</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Total Units</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">SKU Number</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Status</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Scan No</th>
                <th className="px-4 py-3 font-semibold">Received Date</th>
              </tr>
            </thead>
            <tbody>
              {inwardData.map((row, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4 border-r border-gray-200">{row.orderNo}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.brand}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.product}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.technology}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.projectType}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.wattPeak}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.totalKw}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.totalUnits}</td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.sku}</td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      row.status === 'Completed' ? 'bg-[#2E9C47]' : 'bg-[#EAB308]'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200">{row.scanNo}</td>
                  <td className="px-4 py-4">{row.receivedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 bg-[#0E1F34] hover:bg-[#1a3350] text-white px-5 py-3 rounded-full flex items-center shadow-lg transition-colors z-50">
        <Coffee className="w-5 h-5 mr-2" />
        <span className="font-medium">Break Time</span>
      </button>

    </div>
  );
}
