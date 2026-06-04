import React, { useState } from 'react';
import { Settings, Box, Check, Coffee } from 'lucide-react';

export default function AtWarehouse() {
  const deliverySchedule = [
    {
      no: 'DEL-2023-1001',
      location: 'Rajkot',
      panel: { qty: 18, spec: '540W Mono', checked: true },
      inverter: { qty: 10, spec: '5KW Hybrid', checked: true },
      bos: { qty: 3, spec: 'Full Kit', checked: true },
      kw: '25 KW',
      vehicle: 'Bolero',
      driver: 'Rajesh Kumar'
    },
    {
      no: 'DEL-2023-1002',
      location: 'Ahmedabad',
      panel: { qty: 12, spec: '540W Mono', checked: true },
      inverter: { qty: 6, spec: '5KW Hybrid', checked: true },
      bos: { qty: 3, spec: 'Full Kit', checked: true },
      kw: '27 KW',
      vehicle: 'Bolero',
      driver: 'Mohan Singh'
    },
    {
      no: 'DEL-2023-1003',
      location: 'Surat',
      panel: { qty: 15, spec: '540W Mono', checked: true },
      inverter: { qty: 15, spec: '5KW Hybrid', checked: false },
      bos: { qty: 1, spec: 'Full Kit', checked: false },
      kw: '35 KW',
      vehicle: 'Truck',
      driver: 'Vijay Patel'
    },
    {
      no: 'DEL-2023-1004',
      location: 'Vadodara',
      panel: { qty: 20, spec: '540W Mono', checked: true },
      inverter: { qty: 10, spec: '5KW Hybrid', checked: true },
      bos: { qty: 5, spec: 'Full Kit', checked: true },
      kw: '40 KW',
      vehicle: 'Truck',
      driver: 'Sanjay Sharma'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-[#315783] text-white px-6 py-4 rounded-sm shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">At Warehouse</h1>
      </div>

      {/* Top Action Buttons */}
      <div className="flex justify-center space-x-2">
        <button className="bg-[#1D74B7] hover:bg-[#155a8e] text-white px-4 py-1.5 rounded flex items-center text-sm font-medium shadow-sm transition-colors">
          <Settings className="w-4 h-4 mr-1.5" />
          Customize
        </button>
        <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-4 py-1.5 rounded flex items-center text-sm font-medium shadow-sm transition-colors">
          <Box className="w-4 h-4 mr-1.5" />
          ComboKit
        </button>
      </div>

      {/* Delivery Schedule Section */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-[#1D74B7] font-bold text-[15px]">Delivery Schedule</h2>
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Brands</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-center">
            <thead className="text-white bg-[#74B8FA]">
              <tr>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Delivery<br/>No.</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Location</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Solar Panel</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Inverter</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">BOS Kit</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Total<br/>KW</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Vehicle<br/>Type</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-300/30">Driver</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {deliverySchedule.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-4 border-r border-gray-100 whitespace-nowrap">{row.no}</td>
                  <td className="px-4 py-4 border-r border-gray-100">{row.location}</td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="flex items-center justify-center space-x-1.5">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${row.panel.checked ? 'bg-[#2FA041]' : 'border border-gray-400'}`}>
                        {row.panel.checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium whitespace-nowrap">{row.panel.qty} x {row.panel.spec}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="flex items-center justify-center space-x-1.5">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${row.inverter.checked ? 'bg-[#2FA041]' : 'border border-gray-400'}`}>
                        {row.inverter.checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium whitespace-nowrap">{row.inverter.qty} x {row.inverter.spec}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="flex items-center justify-center space-x-1.5">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${row.bos.checked ? 'bg-[#2FA041]' : 'border border-gray-400'}`}>
                        {row.bos.checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium whitespace-nowrap">{row.bos.qty} x {row.bos.spec}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">{row.kw}</td>
                  <td className="px-4 py-4 border-r border-gray-100">{row.vehicle}</td>
                  <td className="px-4 py-4 border-r border-gray-100">{row.driver}</td>
                  <td className="px-4 py-4">
                    <button className="bg-[#2FA041] hover:bg-[#237d32] text-white px-4 py-1.5 rounded font-medium text-xs">
                      Done
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-gray-300 border-2 rounded-full" />

      {/* Current Warehouse Inventory Header */}
      <div className="flex justify-between items-center py-2">
        <h2 className="text-[#1D74B7] font-bold text-[15px]">Current Warehouse Inventory</h2>
        <div className="flex items-center space-x-3">
          <select className="border border-gray-300 rounded px-2 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Project Types</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Brands</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Components</option>
          </select>
          <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-3 py-1.5 rounded-full flex items-center shadow text-xs font-semibold ml-2 transition-colors">
            <Coffee className="w-3.5 h-3.5 mr-1.5" />
            Break Time
          </button>
        </div>
      </div>

      {/* Solar Panels Inventory */}
      <div className="space-y-4">
        <h3 className="text-gray-800 font-bold text-lg">Solar Panels Inventory</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Adani Card */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center">
              <span className="text-xl font-bold text-blue-700 tracking-tight mr-1">adani</span>
              <span className="text-xl text-gray-400 font-light">|</span>
              <span className="text-gray-600 font-medium ml-2 text-[15px]">Solar</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px] text-center h-full">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Model</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Technology</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Project Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Quantity</th>
                    <th className="px-3 py-2.5 font-semibold">KW<br/>Available</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">540W<br/>Mono</td>
                    <td className="px-3 py-3 border-r border-gray-100">Mono<br/>PERC</td>
                    <td className="px-3 py-3 border-r border-gray-100">Commercial</td>
                    <td className="px-3 py-3 border-r border-gray-100">120</td>
                    <td className="px-3 py-3">64.8<br/>KW</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">450W<br/>Bi-facial</td>
                    <td className="px-3 py-3 border-r border-gray-100">Bi-facial</td>
                    <td className="px-3 py-3 border-r border-gray-100">Residential</td>
                    <td className="px-3 py-3 border-r border-gray-100">75</td>
                    <td className="px-3 py-3">33.75<br/>KW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Waree Card */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center">
              <span className="text-xl font-bold text-green-600 tracking-tight mr-1 italic">WAREE</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px] text-center h-full">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Model</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Technology</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Project<br/>Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Quantity</th>
                    <th className="px-3 py-2.5 font-semibold">KW<br/>Available</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">670W<br/>Mono</td>
                    <td className="px-3 py-3 border-r border-gray-100">Mono<br/>PERC</td>
                    <td className="px-3 py-3 border-r border-gray-100">Industrial</td>
                    <td className="px-3 py-3 border-r border-gray-100">90</td>
                    <td className="px-3 py-3">60.3<br/>KW</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">450W<br/>Bi-facial</td>
                    <td className="px-3 py-3 border-r border-gray-100">Bi-facial</td>
                    <td className="px-3 py-3 border-r border-gray-100">Residential</td>
                    <td className="px-3 py-3 border-r border-gray-100">85</td>
                    <td className="px-3 py-3">38.25<br/>KW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Inverters Inventory */}
      <div className="space-y-4">
        <h3 className="text-gray-800 font-bold text-lg">Inverters Inventory</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Adani Card */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center">
              <span className="text-xl font-bold text-blue-700 tracking-tight mr-1">adani</span>
              <span className="text-xl text-gray-400 font-light">|</span>
              <span className="text-gray-600 font-medium ml-2 text-[15px]">Solar</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px] text-center h-full">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Model</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Project Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Quantity</th>
                    <th className="px-3 py-2.5 font-semibold">KW<br/>Available</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-3 py-4 border-r border-gray-100 font-medium">5KW<br/>Hybrid</td>
                    <td className="px-3 py-4 border-r border-gray-100">Hybrid</td>
                    <td className="px-3 py-4 border-r border-gray-100">Commercial</td>
                    <td className="px-3 py-4 border-r border-gray-100">8</td>
                    <td className="px-3 py-4">40 KW</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-4 border-r border-gray-100 font-medium">10KW<br/>Hybrid</td>
                    <td className="px-3 py-4 border-r border-gray-100">Hybrid</td>
                    <td className="px-3 py-4 border-r border-gray-100">Industrial</td>
                    <td className="px-3 py-4 border-r border-gray-100">5</td>
                    <td className="px-3 py-4">50 KW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Waree Card */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center">
              <span className="text-xl font-bold text-green-600 tracking-tight mr-1 italic">WAREE</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px] text-center h-full">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Model</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Project Type</th>
                    <th className="px-3 py-2.5 font-semibold border-r border-blue-300/30">Quantity</th>
                    <th className="px-3 py-2.5 font-semibold">KW<br/>Available</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">3KW<br/>On-grid</td>
                    <td className="px-3 py-3 border-r border-gray-100">On-<br/>grid</td>
                    <td className="px-3 py-3 border-r border-gray-100">Residential</td>
                    <td className="px-3 py-3 border-r border-gray-100">15</td>
                    <td className="px-3 py-3">45 KW</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 border-r border-gray-100 font-medium">5KW<br/>On-grid</td>
                    <td className="px-3 py-3 border-r border-gray-100">On-<br/>grid</td>
                    <td className="px-3 py-3 border-r border-gray-100">Commercial</td>
                    <td className="px-3 py-3 border-r border-gray-100">10</td>
                    <td className="px-3 py-3">50 KW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* BOS Kits */}
      <div className="space-y-4">
        <h3 className="text-gray-800 font-bold text-lg">BOS Kits</h3>
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h4 className="text-gray-800 font-bold text-[15px]">BOS Kits</h4>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto border border-gray-200 rounded-sm">
              <table className="w-full text-[13px] text-left">
                <thead className="text-white bg-[#74B8FA]">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold border-r border-blue-300/30">Brand</th>
                    <th className="px-5 py-2.5 font-semibold border-r border-blue-300/30">Project Type</th>
                    <th className="px-5 py-2.5 font-semibold border-r border-blue-300/30">Quantity</th>
                    <th className="px-5 py-2.5 font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3.5 border-r border-gray-100">Adani</td>
                    <td className="px-5 py-3.5 border-r border-gray-100">Residential</td>
                    <td className="px-5 py-3.5 border-r border-gray-100">12</td>
                    <td className="px-5 py-3.5">01-07-2025</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 border-r border-gray-100">Waree</td>
                    <td className="px-5 py-3.5 border-r border-gray-100">Commercial</td>
                    <td className="px-5 py-3.5 border-r border-gray-100">8</td>
                    <td className="px-5 py-3.5">01-07-2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded shadow-sm border border-gray-100 text-center py-4 text-[13px] font-semibold text-[#18395C] mt-8">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

    </div>
  );
}
