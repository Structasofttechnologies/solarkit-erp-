import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    RotateCw,
    MoreVertical,
    Eye,
    Calendar,
    MapPin,
    Phone,
    User,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2
} from 'lucide-react';
import { getDealerKYCLists } from '../../../services/leadService';
import { getDistricts } from '../../../../services/core/locationApi';

const DealerManagerOrientation = () => {
    // State for filters
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [kycStatus, setKycStatus] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customDate, setCustomDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [districts, setDistricts] = useState([]);

    React.useEffect(() => {
        fetchDealers();
        getDistricts().then(res => setDistricts(res || [])).catch(err => console.error(err));
    }, []);

    const fetchDealers = async () => {
        setLoading(true);
        try {
            const res = await getDealerKYCLists();
            if (res.success) {
                // Filter only approved dealers for orientation
                const approvedData = res.data.filter(d => d.status === 'approved');
                setDealers(approvedData);
            }
        } catch (error) {
            console.error('Error fetching orientation dealers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setDateRange(value);
        setShowCustomDate(value === 'custom');
    };

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="#" className="text-blue-600 hover:text-blue-800">
                                Dealer onboarding
                            </Link>
                        </li>
                        <li>
                            <span className="mx-2 text-gray-400">/</span>
                        </li>
                        <li className="text-gray-600" aria-current="page">
                            Dealer Orientation
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    {/* Filters Section */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            {/* District Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select District
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                >
                                    <option value="">Choose district</option>
                                    {districts.map(district => (
                                        <option key={district._id} value={district.name}>{district.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Date Range
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={dateRange}
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

                            {/* KYC Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    KYC Status
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={kycStatus}
                                    onChange={(e) => setKycStatus(e.target.value)}
                                >
                                    <option value="">Choose Status</option>
                                    <option value="new">New</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-96">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                &nbsp;
                            </label>
                            <div className="flex">
                                <input
                                    type="search"
                                    placeholder="Search by here"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="ml-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                    <RotateCw className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {showCustomDate && (
                        <div className="mb-4">
                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left border">Actions</th>
                                    <th className="px-4 py-3 text-left border">SrNo.</th>
                                    <th className="px-4 py-3 text-left border">Status</th>
                                    <th className="px-4 py-3 text-left border">Lead Id</th>
                                    <th className="px-4 py-3 text-left border">Start Date</th>
                                    <th className="px-4 py-3 text-left border">Mobile No.</th>
                                    <th className="px-4 py-3 text-left border">State</th>
                                    <th className="px-4 py-3 text-left border">Cluster</th>
                                    <th className="px-4 py-3 text-left border">District</th>
                                    <th className="px-4 py-3 text-left border">Franchisee</th>
                                    <th className="px-4 py-3 text-left border">Project Type</th>
                                    <th className="px-4 py-3 text-left border">Sub Type</th>
                                    <th className="px-4 py-3 text-left border">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="13" className="px-6 py-8 text-center text-sm text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                        </td>
                                    </tr>
                                ) : dealers.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="px-6 py-8 text-center text-sm text-gray-500">
                                            No approved dealers found for orientation.
                                        </td>
                                    </tr>
                                ) : dealers.map((dealer, index) => (
                                    <tr key={dealer._id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 border">
                                            <div className="relative">
                                                <button className="p-1 hover:bg-gray-100 rounded-full">
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border">{index + 1}</td>
                                        <td className="px-4 py-3 border">
                                            <span className={`inline-block px-3 py-1 bg-green-500 text-white text-xs rounded-full`}>
                                                {dealer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border">{dealer._id.substring(0, 8)}</td>
                                        <td className="px-4 py-3 border">{new Date(dealer.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 border">{dealer.phone}</td>
                                        <td className="px-4 py-3 border">{dealer.state || 'N/A'}</td>
                                        <td className="px-4 py-3 border">{dealer.cluster || 'N/A'}</td>
                                        <td className="px-4 py-3 border">{dealer.district || 'N/A'}</td>
                                        <td className="px-4 py-3 border">{dealer.name}</td>
                                        <td className="px-4 py-3 border">Solar Dealer</td>
                                        <td className="px-4 py-3 border">N/A</td>
                                        <td className="px-4 py-3 border">
                                            <Link to="/dealer-manager/orientation/video">
                                                <button className="px-3 py-1 bg-[#2c68a3] text-white rounded-full hover:bg-[#1e4a7a] text-xs flex items-center">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">1-3 of 3 entries</div>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>2</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerManagerOrientation;