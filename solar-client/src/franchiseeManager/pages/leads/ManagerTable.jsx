import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Plus,
    Filter,
    Search,
    RefreshCw,
    MoreVertical,
    Trash2,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    X
} from 'lucide-react';

const FranchiseeManagerTable = () => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState('today');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Sample leads data
    const leads = [
        { id: 1, srNo: 1, status: 'New', leadId: 'ss/24-25/004', name: 'Sushil', mobile: '6535846505', designation: 'Electrician' },
        { id: 2, srNo: 2, status: 'New', leadId: 'ss/24-25/004', name: 'Darshit', mobile: '6535846505', designation: 'Civil Contractor' },
        { id: 3, srNo: 3, status: 'New', leadId: 'ss/24-25/004', name: 'Sharad', mobile: '6535846505', designation: 'Electrician' },
        { id: 4, srNo: 4, status: 'New', leadId: 'ss/24-25/004', name: 'Varis', mobile: '6535846505', designation: 'Civil Contractor' },
        { id: 5, srNo: 5, status: 'New', leadId: 'ss/24-25/004', name: 'Darshit', mobile: '6535846505', designation: 'Electrician' },
    ];

    const handleDateRangeChange = (e) => {
        setSelectedDateRange(e.target.value);
    };

    const toggleFilterModal = () => {
        setIsFilterModalOpen(!isFilterModalOpen);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Page Header with Breadcrumb */}
            <div className="mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link to="/cprm/cprmOnboarding_leads" className="text-blue-600 hover:text-blue-800">
                                Leads
                            </Link>
                        </li>
                        <li>
                            <ChevronRight size={16} className="text-gray-400" />
                        </li>
                        <li className="text-gray-500 font-medium" aria-current="page">
                            My Leads
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Add Button */}
                            <button
                                className="px-4 py-2 bg-[#0f4e8d] text-white rounded-full text-sm font-semibold hover:bg-[#0d3e70] transition-colors flex items-center"
                            >
                                <Plus size={16} className="mr-1" />
                                ADD
                            </button>

                            {/* Filter Button */}
                            <button
                                onClick={toggleFilterModal}
                                className="px-4 py-2 bg-[#0f4e8d] text-white rounded-full text-sm font-semibold hover:bg-[#0d3e70] transition-colors flex items-center"
                            >
                                <Filter size={16} className="mr-1" />
                                Filter
                            </button>

                            {/* Import Lead Button */}
                            <button className="px-4 py-2 bg-[#0f4e8d] text-white rounded-full text-sm font-semibold hover:bg-[#0d3e70] transition-colors">
                                Import Lead
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="flex">
                                <input
                                    type="search"
                                    placeholder="Search by here"
                                    className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100">
                                    <Search size={18} className="text-gray-600" />
                                </button>
                                <button className="ml-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                                    <RefreshCw size={18} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Modal */}
                {isFilterModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Filter Leads</h3>
                                    <button
                                        onClick={toggleFilterModal}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* District Dropdown */}
                                <div className="mb-4">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select District
                                    </label>
                                    <select
                                        id="city"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                    >
                                        <option value="">Choose district</option>
                                        <option value="paddhari">Paddhari</option>
                                        <option value="tankara">Tankara</option>
                                        <option value="chotila">Chotila</option>
                                    </select>
                                </div>

                                {/* Date Range Dropdown */}
                                <div className="mb-4">
                                    <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Date Range
                                    </label>
                                    <select
                                        id="date-range"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedDateRange}
                                        onChange={handleDateRangeChange}
                                    >
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last7">Last 7 Days</option>
                                        <option value="last15">Last 15 Days</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {/* Custom Date Picker */}
                                {selectedDateRange === 'custom' && (
                                    <div className="mb-4">
                                        <label htmlFor="custom-date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Custom Date
                                        </label>
                                        <input
                                            type="date"
                                            id="custom-date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={toggleFilterModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#0f4e8d]">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Actions
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    SrNo.
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Lead Id
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Mobile No.
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Designation
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Confirm
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    {/* Actions Dropdown */}
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="relative group">
                                            <button className="text-gray-600 hover:text-gray-900">
                                                <MoreVertical size={20} />
                                            </button>
                                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                <div className="py-1">
                                                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <Trash2 size={16} className="mr-2 text-red-500" />
                                                        Delete Request
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Data Cells */}
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{lead.srNo}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{lead.leadId}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{lead.mobile}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{lead.designation}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                                            Confirm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">1-5</span> of <span className="font-medium">14</span> entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="px-3 py-1 border border-blue-600 rounded-md bg-blue-600 text-white text-sm">1</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50">2</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50">
                                <ChevronRightIcon size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerTable;