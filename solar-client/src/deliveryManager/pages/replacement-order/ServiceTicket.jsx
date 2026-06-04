import React from 'react';
import { Image as ImageIcon, Coffee } from 'lucide-react';

export default function ServiceTicket() {
  const serviceTickets = [
    {
      ticketId: 'TICKET-2023-1001',
      replacementId: 'REP-SOL-10025',
      customer: {
        name: 'Rahul Solar Solutions',
        contactName: 'Ramesh Patel',
        phone: '9876543210',
        city: 'Bangalore'
      },
      product: {
        name: 'Monocrystalline 400W',
        sku: 'SP-M400-BLK',
        serial: 'SN-M400-789456',
        installDate: '15-Jan-2023'
      },
      issue: 'Performance Issue',
      proofCount: 3
    },
    {
      ticketId: 'TICKET-2023-1002',
      replacementId: 'REP-SOL-10026',
      customer: {
        name: 'Green Energy Homes',
        contactName: 'Priya Sharma',
        phone: '8765432109',
        city: 'Hyderabad'
      },
      product: {
        name: 'Solar Inverter 5KVA',
        sku: 'INV-5000-HYB',
        serial: 'SN-INV5-123789',
        installDate: '10-Mar-2023'
      },
      issue: 'Performance Issue',
      proofCount: 2
    },
    {
      ticketId: 'TICKET-2023-1003',
      replacementId: 'REP-SOL-10027',
      customer: {
        name: 'EcoPower Systems',
        contactName: 'Amit Kumar',
        phone: '7654321098',
        city: 'Chennai'
      },
      product: {
        name: 'Battery Bank 200Ah',
        sku: 'BAT-200-LITH',
        serial: 'SN-BAT2-456123',
        installDate: '05-Feb-2023'
      },
      issue: 'Performance Issue',
      proofCount: 1
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 lg:p-6 space-y-6 pb-20 relative">
      
      {/* Header */}
      <div className="bg-[#2A659A] text-white px-6 py-4 rounded-sm shadow-sm flex items-center">
        <h1 className="text-2xl font-bold tracking-wide">Service Ticket Management</h1>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#18395C] font-bold text-[15px]">Active Service Tickets</h2>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-200 rounded-sm">
            <table className="w-full text-[13px] text-left">
              <thead className="text-white bg-[#74B8FA]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Ticket ID</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Replacement ID</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Customer Details</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Product Information</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30">Issue Details</th>
                  <th className="px-5 py-3.5 font-semibold border-r border-blue-300/30 text-center">Photo Evidence</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned To</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {serviceTickets.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-4 border-r border-gray-100 font-medium">{row.ticketId}</td>
                    <td className="px-5 py-4 border-r border-gray-100">{row.replacementId}</td>
                    <td className="px-5 py-4 border-r border-gray-100 leading-tight">
                      <div className="font-semibold text-gray-800 mb-1">{row.customer.name}</div>
                      <div className="text-[11px] text-gray-500">Contact: {row.customer.contactName}</div>
                      <div className="text-[11px] text-gray-500">{row.customer.phone}</div>
                      <div className="text-[11px] text-gray-500">{row.customer.city}</div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100 leading-tight">
                      <div className="font-semibold text-gray-800 mb-1">{row.product.name}</div>
                      <div className="text-[11px] text-gray-500">SKU: {row.product.sku}</div>
                      <div className="text-[11px] text-gray-500">Serial: {row.product.serial}</div>
                      <div className="text-[11px] text-gray-500">Install Date: {row.product.installDate}</div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100 text-[#E53935] font-medium">{row.issue}</td>
                    <td className="px-5 py-4 border-r border-gray-100 text-center">
                      <button className="inline-flex items-center text-[#1D74B7] hover:text-blue-700 font-medium text-xs transition-colors">
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        View ({row.proofCount})
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <select className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[140px] shadow-sm bg-white">
                        <option>Select Technician</option>
                        <option>Technician A</option>
                        <option>Technician B</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded shadow-sm border border-gray-100 text-center py-4 text-[13px] font-semibold text-[#18395C] mt-8">
        Copyright © 2025 Solarkits. All Rights Reserved.
      </div>

      {/* Floating Break Time Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#0F1E32] hover:bg-[#1a304d] text-white px-4 py-2 rounded-full flex items-center shadow-lg text-sm font-semibold transition-colors">
          <Coffee className="w-4 h-4 mr-2" />
          Break Time
        </button>
      </div>

    </div>
  );
}
