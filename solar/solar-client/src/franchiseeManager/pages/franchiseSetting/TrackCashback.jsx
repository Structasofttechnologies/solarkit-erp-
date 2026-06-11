import React, { useState } from 'react';
import { ChevronRight, Eye, Filter, Calendar, Award, Sun, Gift, Users } from 'lucide-react';

const FranchiseeTrackCashback = () => {
    const [filters, setFilters] = useState({
        cashbackType: ''
    });

    const cashbackData = [
        {
            date: '15 Oct 2023',
            transactionId: 'CB20231015-001',
            type: 'Loyalty',
            typeClass: 'badge-loyalty',
            description: 'Quarterly loyalty bonus for solar maintenance contracts',
            amount: '₹1,500',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '10 Oct 2023',
            transactionId: 'CB20231010-045',
            type: 'Solar Bundle',
            typeClass: 'badge-solar',
            description: '5KW Solar Package installation for customer #CUS-78945',
            amount: '₹3,250',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '05 Oct 2023',
            transactionId: 'CB20231005-112',
            type: 'Festival',
            typeClass: 'badge-festival',
            description: 'Diwali Special Offer for 3KW system installation',
            amount: '₹2,000',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '28 Sep 2023',
            transactionId: 'CB20230928-078',
            type: 'Referral',
            typeClass: 'badge-referral',
            description: 'Referral bonus for customer #CUS-78421',
            amount: '₹1,000',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '20 Sep 2023',
            transactionId: 'CB20230920-033',
            type: 'Solar Bundle',
            typeClass: 'badge-solar',
            description: '10KW Commercial Package installation for customer #CUS-78216',
            amount: '₹4,600',
            status: 'Pending',
            statusClass: 'status-pending'
        },
        {
            date: '12 Sep 2023',
            transactionId: 'CB20230912-091',
            type: 'Festival',
            typeClass: 'badge-festival',
            description: 'Independence Day Offer - Customer cancelled',
            amount: '₹1,750',
            status: 'Rejected',
            statusClass: 'status-rejected'
        },
        {
            date: '05 Sep 2023',
            transactionId: 'CB20230905-004',
            type: 'Loyalty',
            typeClass: 'badge-loyalty',
            description: 'Annual loyalty bonus for consistent performance',
            amount: '₹2,500',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '25 Aug 2023',
            transactionId: 'CB20230825-067',
            type: 'Referral',
            typeClass: 'badge-referral',
            description: 'Referral bonus for customer #CUS-77892',
            amount: '₹1,000',
            status: 'Approved',
            statusClass: 'status-approved'
        },
        {
            date: '15 Aug 2023',
            transactionId: 'CB20230815-022',
            type: 'Solar Bundle',
            typeClass: 'badge-solar',
            description: '3KW Starter Kit installation for customer #CUS-77654',
            amount: '₹1,750',
            status: 'Approved',
            statusClass: 'status-approved'
        }
    ];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Loyalty':
                return <Award size={16} className="mr-1" />;
            case 'Solar Bundle':
                return <Sun size={16} className="mr-1" />;
            case 'Festival':
                return <Gift size={16} className="mr-1" />;
            case 'Referral':
                return <Users size={16} className="mr-1" />;
            default:
                return null;
        }
    };

    const filteredData = filters.cashbackType
        ? cashbackData.filter(item =>
            item.type.toLowerCase().replace(' ', '') === filters.cashbackType.toLowerCase()
        )
        : cashbackData;

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleViewDetails = (transaction) => {
        console.log('View details for:', transaction);
        // Implement view details functionality
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Breadcrumb */}
            <div className="mb-4">
                <nav className="bg-white p-4 shadow-sm" aria-label="breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li className="flex items-center text-gray-700 w-full">
                            <h3 className="text-xl font-semibold text-gray-800">Track Your Cashback</h3>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Cashback Summary Cards */}
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-4/12 px-3 mb-4">
                        <div className="bg-white border-4 border-blue-500 rounded-lg shadow-lg text-center p-6 transform hover:scale-105 transition-transform duration-200">
                            <h5 className="text-gray-600 text-sm uppercase tracking-wider mb-2">Total Cashback Earned</h5>
                            <div className="text-3xl font-bold text-blue-600">₹12,850</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full md:w-3/12 px-2">
                            <label htmlFor="cashbackType" className="block text-sm font-medium text-gray-700 mb-2">
                                Cashback Type
                            </label>
                            <div className="relative">
                                <select
                                    id="cashbackType"
                                    name="cashbackType"
                                    value={filters.cashbackType}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="loyalty">Loyalty Cashback</option>
                                    <option value="solar">Solar Panel Bundle</option>
                                    <option value="festival">Festival Offer</option>
                                    <option value="referral">Referral Bonus</option>
                                </select>
                                <Filter className="absolute right-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cashback Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.transactionId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(item.typeClass)}`}>
                                                {getTypeIcon(item.type)}
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(item.statusClass)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetails(item)}
                                                className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-150 text-sm"
                                            >
                                                View Details
                                                <ChevronRight size={16} className="ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer with Record Count */}
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Showing <span className="font-medium">{filteredData.length}</span> of{' '}
                                <span className="font-medium">{cashbackData.length}</span> records
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .badge-loyalty {
          background-color: #8B5CF6;
          color: white;
        }
        .badge-solar {
          background-color: #F59E0B;
          color: white;
        }
        .badge-festival {
          background-color: #EC4899;
          color: white;
        }
        .badge-referral {
          background-color: #10B981;
          color: white;
        }
        .status-approved {
          background-color: #10B981;
          color: white;
        }
        .status-pending {
          background-color: #F59E0B;
          color: white;
        }
        .status-rejected {
          background-color: #EF4444;
          color: white;
        }
      `}</style>
        </div>
    );
};

// Helper functions
const getTypeBadgeClass = (typeClass) => {
    const classes = {
        'badge-loyalty': 'bg-purple-600 text-white',
        'badge-solar': 'bg-amber-500 text-white',
        'badge-festival': 'bg-pink-600 text-white',
        'badge-referral': 'bg-emerald-500 text-white'
    };
    return classes[typeClass] || 'bg-gray-500 text-white';
};

const getStatusClass = (statusClass) => {
    const classes = {
        'status-approved': 'bg-emerald-500 text-white',
        'status-pending': 'bg-amber-500 text-white',
        'status-rejected': 'bg-red-500 text-white'
    };
    return classes[statusClass] || 'bg-gray-500 text-white';
};

export default FranchiseeTrackCashback;