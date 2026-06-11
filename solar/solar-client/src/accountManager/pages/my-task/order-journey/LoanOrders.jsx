import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function LoanOrders() {
  const [activeLoanType, setActiveLoanType] = useState('Bank Loan');

  const countries = [
    { name: 'India', orders: 125 },
    { name: 'USA', orders: 45 },
    { name: 'UK', orders: 20 },
    { name: 'Australia', orders: 15 },
  ];

  const states = [
    { name: 'Gujarat', orders: 46 },
    { name: 'Maharashtra', orders: 32 },
    { name: 'Karnataka', orders: 28 },
    { name: 'Rajasthan', orders: 19 },
  ];

  const clusters = [
    { name: 'Rajkot', orders: 12 },
    { name: 'Ahmedabad', orders: 18 },
    { name: 'Surat', orders: 9 },
    { name: 'Baroda', orders: 7 },
  ];

  const districts = [
    { name: 'Paddhari', orders: 8 },
    { name: 'Tankara', orders: 15 },
    { name: 'Upleta', orders: 6 },
    { name: 'Jasdan', orders: 5 },
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-8">
      {/* Header */}
      <div className="bg-[#2c4b75] text-white p-4 rounded flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Order Management</h1>
        <div className="flex space-x-4 text-xs font-semibold">
          <span>Today's Task</span>
          <span className="text-yellow-400">Pending Task</span>
          <span className="text-red-400">Overdue Task</span>
        </div>
      </div>

      {/* Loan Type Toggles */}
      <div className="flex justify-center space-x-6 mt-8">
        <button
          onClick={() => setActiveLoanType('Bank Loan')}
          className={`px-12 py-4 rounded-lg text-[15px] font-bold shadow-sm transition-all duration-200 ${
            activeLoanType === 'Bank Loan'
              ? 'bg-white text-[#142340] border-2 border-blue-500'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Bank Loan
        </button>
        <button
          onClick={() => setActiveLoanType('Private Loan')}
          className={`px-12 py-4 rounded-lg text-[15px] font-bold shadow-sm transition-all duration-200 ${
            activeLoanType === 'Private Loan'
              ? 'bg-white text-[#142340] border-2 border-blue-500'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Private Loan
        </button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Category', placeholder: 'Select Category' },
          { label: 'Sub Category', placeholder: 'Select Sub Category' },
          { label: 'Project Type', placeholder: 'Select Project Type' },
          { label: 'Sub Project Type', placeholder: 'Select Sub Project Type' },
        ].map((filter, idx) => (
          <div key={idx}>
            <label className="block text-[13px] text-gray-700 font-medium mb-1.5">{filter.label}</label>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 text-gray-600 py-2.5 px-4 pr-8 rounded-lg text-sm w-full focus:outline-none focus:border-blue-400 shadow-sm transition-colors">
                <option value="">{filter.placeholder}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Select Country Section */}
      <div className="mt-10">
        <h2 className="text-[14px] text-gray-800 font-medium mb-4">Select Country</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {countries.map((country, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-800">{country.name}</h3>
              <p className="text-[13px] text-gray-500 mt-2 font-medium">{country.orders} Orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Select State Section */}
      <div className="mt-10">
        <h2 className="text-[14px] text-gray-800 font-medium mb-4">Select State</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {states.map((state, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-800">{state.name}</h3>
              <p className="text-[13px] text-gray-500 mt-2 font-medium">{state.orders} Orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Select Cluster Section */}
      <div className="mt-10">
        <h2 className="text-[14px] text-gray-800 font-medium mb-4">Select Cluster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {clusters.map((cluster, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-800">{cluster.name}</h3>
              <p className="text-[13px] text-gray-500 mt-2 font-medium">{cluster.orders} Orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Select District Section */}
      <div className="mt-10 mb-8">
        <h2 className="text-[14px] text-gray-800 font-medium mb-4">Select District</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {districts.map((district, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-800">{district.name}</h3>
              <p className="text-[13px] text-gray-500 mt-2 font-medium">{district.orders} Orders</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
