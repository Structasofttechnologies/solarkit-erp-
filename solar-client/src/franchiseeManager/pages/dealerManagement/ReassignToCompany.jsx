import React, { useState } from 'react';
import {
    Users,
    UserX,
    MapPin,
    Building,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    X,
    Briefcase,
    UserPlus,
    RefreshCw,
    Clock,
    TrendingDown
} from 'lucide-react';

const DealerManagerReassignToCompany = () => {
    const [selectedCP, setSelectedCP] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [showDistrictCards, setShowDistrictCards] = useState(false);
    const [showDealerTable, setShowDealerTable] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Sample inactive CP data
    const inactiveCPList = [
        { id: 1, name: 'Ramesh Pandit', status: 'InActive', dealers: 12, lastActive: '15 Jan 2025' },
        { id: 2, name: 'Madhav Mishra', status: 'InActive', dealers: 8, lastActive: '20 Jan 2025' },
        { id: 3, name: 'Raj Patel', status: 'InActive', dealers: 15, lastActive: '10 Jan 2025' }
    ];

    // Sample district data with dealer counts
    const districtData = [
        {
            id: 1,
            name: 'Jasdan',
            totalDealers: 8,
            dealers: [
                { id: 1, numberofdealer: '5', dealersList: ['Jasdan Auto Works', 'Jasdan Motors', 'Jasdan Solar', 'Jasdan Energy', 'Jasdan Solutions'] }
            ]
        },
        {
            id: 2,
            name: 'Upleta',
            totalDealers: 5,
            dealers: [
                { id: 2, numberofdealer: '10', dealersList: ['Upleta Auto Care', 'Upleta Energy', 'Upleta Solar', 'Upleta Motors', 'Upleta Traders', 'Upleta Solutions', 'Upleta Works', 'Upleta Services', 'Upleta Tech', 'Upleta Power'] }
            ]
        },
        {
            id: 3,
            name: 'Paddhari',
            totalDealers: 7,
            dealers: [
                { id: 3, numberofdealer: '15', dealersList: Array(15).fill(0).map((_, i) => `Paddhari Dealer ${i + 1}`) }
            ]
        },
        {
            id: 4,
            name: 'Tankara',
            totalDealers: 6,
            dealers: [
                { id: 4, numberofdealer: '22', dealersList: Array(22).fill(0).map((_, i) => `Tankara Dealer ${i + 1}`) }
            ]
        }
    ];

    const handleCPClick = (cp) => {
        setSelectedCP(cp);
        setShowDistrictCards(true);
        setSelectedDistrict(null);
        setShowDealerTable(false);
    };

    const handleDistrictClick = (district) => {
        setSelectedDistrict(district);
        setShowDealerTable(true);
    };

    const handleAssignToCompany = (dealerCount, districtName) => {
        setAlertMessage(`${dealerCount} dealers from ${districtName} reassigned to company successfully!`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Reassign to Company</h1>
                    <p className="text-gray-500">Manage inactive franchisees and reassign dealers to company</p>
                </div>

                {/* Success Alert */}
                {showSuccessAlert && (
                    <div className="fixed top-4 right-4 z-50 animate-fade-in">
                        <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center">
                            <CheckCircle size={20} className="mr-2" />
                            <span>{alertMessage}</span>
                            <button onClick={() => setShowSuccessAlert(false)} className="ml-4">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Inactive CP Cards */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <UserX size={20} className="mr-2 text-red-500" />
                        Inactive Franchisees
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {inactiveCPList.map((cp) => (
                            <div
                                key={cp.id}
                                onClick={() => handleCPClick(cp)}
                                className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${selectedCP?.id === cp.id
                                        ? 'ring-2 ring-red-500 bg-red-50'
                                        : 'bg-white'
                                    }`}
                            >
                                <div className="p-4 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserX size={32} className="text-red-600" />
                                    </div>
                                    <h5 className="font-semibold text-gray-800">{cp.name}</h5>
                                    <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                        {cp.status}
                                    </span>
                                    <div className="flex justify-center items-center mt-2 space-x-2">
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                            {cp.dealers} dealers
                                        </span>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center">
                                            <Clock size={10} className="mr-1" />
                                            {cp.lastActive}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* District Cards */}
                {showDistrictCards && selectedCP && (
                    <div className="mb-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                            <MapPin size={20} className="mr-2 text-blue-500" />
                            Districts for {selectedCP.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {districtData.map((district) => (
                                <div
                                    key={district.id}
                                    onClick={() => handleDistrictClick(district)}
                                    className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${selectedDistrict?.id === district.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'bg-white'
                                        }`}
                                >
                                    <div className="p-4 text-center">
                                        <Building size={32} className="mx-auto mb-2 text-blue-500" />
                                        <h5 className="font-semibold text-gray-800">{district.name}</h5>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Dealers: {district.dealers[0].numberofdealer}
                                        </p>
                                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            Click to view
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dealers Table */}
                {showDealerTable && selectedDistrict && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                <Briefcase size={20} className="mr-2 text-blue-500" />
                                Dealers in {selectedDistrict.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Total Dealers: {selectedDistrict.dealers[0].numberofdealer}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Number of Dealers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedDistrict.dealers.map((dealer, index) => (
                                        <tr key={dealer.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Users size={16} className="mr-2 text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {dealer.numberofdealer} Dealers
                                                    </span>
                                                </div>
                                                {/* Tooltip with dealer names */}
                                                <div className="relative group">
                                                    <span className="text-xs text-gray-500 cursor-help">
                                                        Click to view dealer list
                                                    </span>
                                                    <div className="absolute left-0 mt-1 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                        <p className="font-semibold mb-1">Dealer List:</p>
                                                        <ul className="list-disc list-inside">
                                                            {dealer.dealersList.slice(0, 5).map((name, i) => (
                                                                <li key={i}>{name}</li>
                                                            ))}
                                                            {dealer.dealersList.length > 5 && (
                                                                <li>... and {dealer.dealersList.length - 5} more</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleAssignToCompany(dealer.numberofdealer, selectedDistrict.name)}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                                >
                                                    <RefreshCw size={14} className="mr-2" />
                                                    Assign to Company
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* District Summary */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Dealers</p>
                                            <p className="text-lg font-bold text-gray-700">
                                                {selectedDistrict.dealers[0].numberofdealer}
                                            </p>
                                        </div>
                                        <Users size={20} className="text-blue-500" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Inactive CPs</p>
                                            <p className="text-lg font-bold text-red-600">1</p>
                                        </div>
                                        <UserX size={20} className="text-red-500" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Reassignment Status</p>
                                            <p className="text-lg font-bold text-green-600">Pending</p>
                                        </div>
                                        <RefreshCw size={20} className="text-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty States */}
                {!showDistrictCards && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <UserX size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Select an inactive franchisee to view districts and dealers</p>
                    </div>
                )}

                {showDistrictCards && selectedCP && !showDealerTable && (
                    <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                        <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Select a district to view dealers</p>
                    </div>
                )}

                {/* Info Banner */}
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle size={20} className="text-yellow-600 mr-3" />
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">
                                Reassigning dealers to company will move them from inactive franchisees to company pool.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                This action can be reversed by reassigning to a new franchisee later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default DealerManagerReassignToCompany;