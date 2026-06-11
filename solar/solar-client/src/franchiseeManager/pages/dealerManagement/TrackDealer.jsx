import React, { useState } from 'react';
import {
    Users,
    Building2,
    Eye,
    X,
    UserCheck,
    Target,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';

const TrackDealerDashboard = () => {
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [currentDataType, setCurrentDataType] = useState(null); // 'cp' or 'company'
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    // Sample data with dealer details
    const data = {
        Paddhari: {
            cps: [
                {
                    id: 'franchisee001',
                    name: 'John Smith',
                    dealers: 5,
                    dealersList: [
                        {
                            id: 'DLR001',
                            name: 'Paddhari Auto Works',
                            joinDate: '2023-01-15',
                            status: 'Active',
                            quotations: 24,
                            projects: 18,
                            efficiency: 85
                        },
                        {
                            id: 'DLR002',
                            name: 'Smith Motors',
                            joinDate: '2023-02-10',
                            status: 'Active',
                            quotations: 18,
                            projects: 12,
                            efficiency: 67
                        },
                        {
                            id: 'DLR003',
                            name: 'City Auto Care',
                            joinDate: '2023-03-05',
                            status: 'Inactive',
                            quotations: 10,
                            projects: 5,
                            efficiency: 50
                        },
                        {
                            id: 'DLR004',
                            name: 'Paddhari Electric',
                            joinDate: '2023-04-20',
                            status: 'Active',
                            quotations: 30,
                            projects: 25,
                            efficiency: 83
                        },
                        {
                            id: 'DLR005',
                            name: 'Premium Auto',
                            joinDate: '2023-05-15',
                            status: 'Pending',
                            quotations: 12,
                            projects: 8,
                            efficiency: 67
                        }
                    ]
                },
                {
                    id: 'franchisee002',
                    name: 'Emma Johnson',
                    dealers: 3,
                    dealersList: [
                        {
                            id: 'DLR006',
                            name: 'Johnson Motors',
                            joinDate: '2023-02-15',
                            status: 'Active',
                            quotations: 22,
                            projects: 18,
                            efficiency: 82
                        },
                        {
                            id: 'DLR007',
                            name: 'Quick Service Center',
                            joinDate: '2023-03-10',
                            status: 'Active',
                            quotations: 15,
                            projects: 10,
                            efficiency: 67
                        },
                        {
                            id: 'DLR008',
                            name: 'Paddhari Solutions',
                            joinDate: '2023-06-05',
                            status: 'Active',
                            quotations: 28,
                            projects: 20,
                            efficiency: 71
                        }
                    ]
                },
                {
                    id: 'franchisee003',
                    name: 'Michael Brown',
                    dealers: 4,
                    dealersList: [
                        {
                            id: 'DLR009',
                            name: 'Brown Auto Group',
                            joinDate: '2023-01-20',
                            status: 'Active',
                            quotations: 35,
                            projects: 28,
                            efficiency: 80
                        },
                        {
                            id: 'DLR010',
                            name: 'Express Service',
                            joinDate: '2023-02-25',
                            status: 'Inactive',
                            quotations: 8,
                            projects: 3,
                            efficiency: 38
                        },
                        {
                            id: 'DLR011',
                            name: 'Paddhari Motors',
                            joinDate: '2023-04-10',
                            status: 'Active',
                            quotations: 20,
                            projects: 15,
                            efficiency: 75
                        },
                        {
                            id: 'DLR012',
                            name: 'City Car Care',
                            joinDate: '2023-05-30',
                            status: 'Active',
                            quotations: 25,
                            projects: 20,
                            efficiency: 80
                        }
                    ]
                }
            ],
            companies: [
                {
                    id: 'COMP001',
                    name: 'Tech Solutions Inc',
                    dealers: 7,
                    dealersList: [
                        {
                            id: 'DLR013',
                            name: 'Tech Auto Paddhari',
                            joinDate: '2023-01-10',
                            status: 'Active',
                            quotations: 40,
                            projects: 32,
                            efficiency: 80
                        },
                        {
                            id: 'DLR014',
                            name: 'Digital Solutions',
                            joinDate: '2023-02-15',
                            status: 'Active',
                            quotations: 25,
                            projects: 18,
                            efficiency: 72
                        },
                        {
                            id: 'DLR015',
                            name: 'Tech Repair Center',
                            joinDate: '2023-03-20',
                            status: 'Active',
                            quotations: 30,
                            projects: 22,
                            efficiency: 73
                        },
                        {
                            id: 'DLR016',
                            name: 'Paddhari Tech Hub',
                            joinDate: '2023-04-05',
                            status: 'Inactive',
                            quotations: 12,
                            projects: 5,
                            efficiency: 42
                        },
                        {
                            id: 'DLR017',
                            name: 'Innovative Auto',
                            joinDate: '2023-05-12',
                            status: 'Active',
                            quotations: 35,
                            projects: 28,
                            efficiency: 80
                        },
                        {
                            id: 'DLR018',
                            name: 'Tech Motors',
                            joinDate: '2023-06-18',
                            status: 'Pending',
                            quotations: 15,
                            projects: 8,
                            efficiency: 53
                        },
                        {
                            id: 'DLR019',
                            name: 'Digital Auto Care',
                            joinDate: '2023-07-22',
                            status: 'Active',
                            quotations: 28,
                            projects: 20,
                            efficiency: 71
                        }
                    ]
                },
                {
                    id: 'COMP002',
                    name: 'Green Energy Ltd',
                    dealers: 4,
                    dealersList: [
                        {
                            id: 'DLR020',
                            name: 'Green Auto Paddhari',
                            joinDate: '2023-02-20',
                            status: 'Active',
                            quotations: 32,
                            projects: 25,
                            efficiency: 78
                        },
                        {
                            id: 'DLR021',
                            name: 'Eco Motors',
                            joinDate: '2023-03-25',
                            status: 'Active',
                            quotations: 22,
                            projects: 16,
                            efficiency: 73
                        },
                        {
                            id: 'DLR022',
                            name: 'Sustainable Auto',
                            joinDate: '2023-05-10',
                            status: 'Active',
                            quotations: 28,
                            projects: 20,
                            efficiency: 71
                        },
                        {
                            id: 'DLR023',
                            name: 'Green Energy Solutions',
                            joinDate: '2023-06-15',
                            status: 'Active',
                            quotations: 30,
                            projects: 22,
                            efficiency: 73
                        }
                    ]
                },
                {
                    id: 'COMP003',
                    name: 'Global Logistics',
                    dealers: 5,
                    dealersList: [
                        {
                            id: 'DLR024',
                            name: 'Global Auto Paddhari',
                            joinDate: '2023-01-15',
                            status: 'Active',
                            quotations: 45,
                            projects: 35,
                            efficiency: 78
                        },
                        {
                            id: 'DLR025',
                            name: 'Logistics Motors',
                            joinDate: '2023-02-20',
                            status: 'Active',
                            quotations: 30,
                            projects: 22,
                            efficiency: 73
                        },
                        {
                            id: 'DLR026',
                            name: 'Express Logistics',
                            joinDate: '2023-04-05',
                            status: 'Inactive',
                            quotations: 15,
                            projects: 6,
                            efficiency: 40
                        },
                        {
                            id: 'DLR027',
                            name: 'Paddhari Logistics',
                            joinDate: '2023-05-12',
                            status: 'Active',
                            quotations: 35,
                            projects: 28,
                            efficiency: 80
                        },
                        {
                            id: 'DLR028',
                            name: 'Global Transport Solutions',
                            joinDate: '2023-06-20',
                            status: 'Active',
                            quotations: 40,
                            projects: 32,
                            efficiency: 80
                        }
                    ]
                }
            ]
        },
        Upleta: {
            cps: [
                { id: 'franchisee004', name: 'Sarah Davis', dealers: 6 },
                { id: 'franchisee005', name: 'Robert Wilson', dealers: 3 }
            ],
            companies: [
                { id: 'COMP004', name: 'Health Plus', dealers: 8 },
                { id: 'COMP005', name: 'EduTech Solutions', dealers: 5 }
            ]
        },
        Jasdan: {
            cps: [
                { id: 'franchisee006', name: 'Jennifer Lee', dealers: 7 },
                { id: 'franchisee007', name: 'David Miller', dealers: 4 },
                { id: 'franchisee008', name: 'Lisa Taylor', dealers: 4 }
            ],
            companies: [
                { id: 'COMP006', name: 'Food Distributors', dealers: 9 },
                { id: 'COMP007', name: 'Auto Parts Ltd', dealers: 6 }
            ]
        }
    };

    const districts = [
        { name: 'Paddhari', dealers: 12, performance: 78, performanceClass: 'bg-blue-500' },
        { name: 'Upleta', dealers: 18, performance: 85, performanceClass: 'bg-green-500' },
        { name: 'Jasdan', dealers: 15, performance: 65, performanceClass: 'bg-yellow-500' }
    ];

    const handleDistrictClick = (district) => {
        setSelectedDistrict(district);
        setCurrentDataType(null);
    };

    const handleCpClick = () => {
        if (!selectedDistrict) return;
        setCurrentDataType('cp');
    };

    const handleCompanyClick = () => {
        if (!selectedDistrict) return;
        setCurrentDataType('company');
    };

    const handleViewDetails = (item) => {
        setModalData(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Active</span>;
            case 'Pending':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" />Pending</span>;
            case 'Inactive':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1" />Inactive</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getEfficiencyColor = (efficiency) => {
        if (efficiency > 70) return 'bg-green-500';
        if (efficiency > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Track Dealer Dashboard</h1>
                    <p className="text-gray-500 text-lg">Monitor dealer performance across districts</p>
                </div>

                {/* District Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {districts.map((district) => (
                        <div
                            key={district.name}
                            onClick={() => handleDistrictClick(district.name)}
                            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${selectedDistrict === district.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                        >
                            <div className="p-6 text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <MapPin className="text-blue-500 mr-2" size={24} />
                                    <h4 className="text-xl font-semibold text-blue-600">{district.name}</h4>
                                </div>
                                <p className="text-gray-600 mb-3">{district.dealers} Dealers</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${district.performanceClass}`}>
                                    Performance: {district.performance}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CP and Company Options */}
                {selectedDistrict && (
                    <div className="flex flex-wrap justify-start gap-4 mb-6">
                        <div className="w-full md:w-4/12">
                            <button
                                onClick={handleCpClick}
                                className={`w-full px-6 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${currentDataType === 'cp'
                                        ? 'bg-blue-600 ring-2 ring-blue-300'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                <div className="flex items-center justify-center text-white">
                                    <Users size={24} className="mr-3" />
                                    <h5 className="text-lg font-semibold">Franchisee's</h5>
                                </div>
                            </button>
                        </div>
                        <div className="w-full md:w-4/12">
                            <button
                                onClick={handleCompanyClick}
                                className={`w-full px-6 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${currentDataType === 'company'
                                        ? 'bg-green-600 ring-2 ring-green-300'
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                <div className="flex items-center justify-center text-white">
                                    <Building2 size={24} className="mr-3" />
                                    <h5 className="text-lg font-semibold">Companies</h5>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Data Table Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {!selectedDistrict && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Users className="text-blue-600" size={32} />
                            </div>
                            <p className="text-gray-500 text-lg">Please select a district to view data</p>
                        </div>
                    )}

                    {selectedDistrict && !currentDataType && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                                <Target className="text-yellow-600" size={32} />
                            </div>
                            <p className="text-gray-500 text-lg">Please select an option for {selectedDistrict} district</p>
                        </div>
                    )}

                    {selectedDistrict && currentDataType && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            {currentDataType === 'cp' ? 'Franchisee ID' : 'Company ID'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dealers</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(currentDataType === 'cp'
                                        ? data[selectedDistrict]?.cps || []
                                        : data[selectedDistrict]?.companies || []
                                    ).map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{item.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.dealers}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleViewDetails(item)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150"
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && modalData && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                                <h4 className="text-xl font-semibold text-white">
                                    {modalData.name} - Dealers ({modalData.dealers})
                                </h4>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:text-gray-200 focus:outline-none"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-white px-6 py-4">
                                {modalData.dealersList ? (
                                    <>
                                        <div className="mb-4">
                                            <h5 className="text-lg font-semibold text-gray-800">{modalData.name} ({modalData.id})</h5>
                                            <p className="text-gray-600">Total Dealers: {modalData.dealers}</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-blue-100">
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dealer ID</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dealer Name</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Join Date</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Quotations</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Projects</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Efficiency</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {modalData.dealersList.map((dealer, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm font-mono text-gray-700">{dealer.id}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{dealer.name}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{dealer.joinDate}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{dealer.quotations}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{dealer.projects}</td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <div className="flex items-center">
                                                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                                        <div
                                                                            className={`${getEfficiencyColor(dealer.efficiency)} h-2 rounded-full`}
                                                                            style={{ width: `${dealer.efficiency}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">{dealer.efficiency}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">{getStatusBadge(dealer.status)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <h5 className="text-lg font-semibold text-gray-800">{modalData.name} ({modalData.id})</h5>
                                            <p className="text-gray-600">Total Dealers: {modalData.dealers}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                                <FileText className="mx-auto text-blue-600 mb-2" size={32} />
                                                <h4 className="text-2xl font-bold text-blue-600">24</h4>
                                                <p className="text-gray-600">Total Quotations</p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                                <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                                                <h4 className="text-2xl font-bold text-green-600">18</h4>
                                                <p className="text-gray-600">Projects Signed</p>
                                            </div>
                                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                                <Target className="mx-auto text-purple-600 mb-2" size={32} />
                                                <h4 className="text-2xl font-bold text-purple-600">85%</h4>
                                                <p className="text-gray-600">Efficiency Score</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                            <div className="flex">
                                                <AlertCircle className="text-blue-600 mr-3" size={20} />
                                                <p className="text-sm text-blue-700">
                                                    Detailed dealer information is not available for this entry.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-150"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackDealerDashboard;