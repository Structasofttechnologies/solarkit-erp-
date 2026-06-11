import React, { useState } from 'react';
import {
    User,
    Users,
    MapPin,
    Calendar,
    FileText,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    UserPlus,
    Briefcase,
    Star,
    TrendingUp,
    DollarSign,
    Clock,
    X
} from 'lucide-react';

const DealerManagerAssignToCP = () => {
    const [selectedCP, setSelectedCP] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [showDistrictCards, setShowDistrictCards] = useState(false);
    const [showDealerTable, setShowDealerTable] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Sample CP data
    const cpList = [
        { id: 1, name: 'Amit Mishra', region: 'North', dealers: 12, performance: '92%' },
        { id: 2, name: 'Sumit Gupta', region: 'West', dealers: 8, performance: '88%' },
        { id: 3, name: 'Harsh Gohel', region: 'Central', dealers: 15, performance: '95%' },
        { id: 4, name: 'Priya Sharma', region: 'South', dealers: 10, performance: '90%' }
    ];

    // Sample district data with dealers
    const districtData = [
        {
            id: 1,
            name: 'Jasdan',
            totalDealers: 8,
            dealers: [
                { id: 1, name: 'Jasdan Auto Works', joinDate: '2023-01-15', cp: 'Amit Mishra', quotations: 24, projects: 18, performance: '85%' },
                { id: 2, name: 'Jasdan Motors', joinDate: '2023-02-10', cp: 'Amit Mishra', quotations: 18, projects: 12, performance: '78%' },
                { id: 3, name: 'Jasdan Solar Solutions', joinDate: '2023-03-05', cp: 'Amit Mishra', quotations: 32, projects: 25, performance: '92%' }
            ]
        },
        {
            id: 2,
            name: 'Upleta',
            totalDealers: 5,
            dealers: [
                { id: 4, name: 'Upleta Auto Care', joinDate: '2023-03-05', cp: 'Sumit Gupta', quotations: 32, projects: 25, performance: '88%' },
                { id: 5, name: 'Upleta Energy', joinDate: '2023-04-12', cp: 'Sumit Gupta', quotations: 21, projects: 16, performance: '82%' }
            ]
        },
        {
            id: 3,
            name: 'Paddhari',
            totalDealers: 7,
            dealers: [
                { id: 6, name: 'Paddhari Motors', joinDate: '2023-04-01', cp: 'Harsh Gohel', quotations: 19, projects: 14, performance: '79%' },
                { id: 7, name: 'Paddhari Auto Solutions', joinDate: '2023-05-12', cp: 'Harsh Gohel', quotations: 27, projects: 22, performance: '91%' },
                { id: 8, name: 'Paddhari Solar', joinDate: '2023-06-08', cp: 'Harsh Gohel', quotations: 15, projects: 11, performance: '75%' }
            ]
        },
        {
            id: 4,
            name: 'Gondal',
            totalDealers: 6,
            dealers: [
                { id: 9, name: 'Gondal Traders', joinDate: '2023-02-18', cp: 'Priya Sharma', quotations: 28, projects: 23, performance: '89%' },
                { id: 10, name: 'Gondal Energy Solutions', joinDate: '2023-07-01', cp: 'Priya Sharma', quotations: 22, projects: 17, performance: '84%' }
            ]
        }
    ];

    // CP options for dropdown
    const cpOptions = cpList.map(cp => cp.name);

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

    const handleRaiseRequest = (dealerName, selectedCPValue) => {
        setAlertMessage(`Request raised successfully for ${dealerName} to ${selectedCPValue}`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Dealer Management System</h1>
                    <p className="text-gray-500">Manage dealers and CP assignments</p>
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

                {/* CP Cards */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <Users size={20} className="mr-2 text-blue-500" />
                        Select Channel Partner
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cpList.map((cp) => (
                            <div
                                key={cp.id}
                                onClick={() => handleCPClick(cp)}
                                className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${selectedCP?.id === cp.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'bg-white'
                                    }`}
                            >
                                <div className="p-4 text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User size={32} className="text-blue-600" />
                                    </div>
                                    <h5 className="font-semibold text-gray-800">{cp.name}</h5>
                                    <p className="text-xs text-gray-500 mt-1">Region: {cp.region}</p>
                                    <div className="flex justify-center items-center mt-2 space-x-2">
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            {cp.dealers} dealers
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {cp.performance}
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
                                        <MapPin size={32} className="mx-auto mb-2 text-blue-500" />
                                        <h5 className="font-semibold text-gray-800">{district.name}</h5>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Dealers: {district.dealers.length}/{district.totalDealers}
                                        </p>
                                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            Click to view dealers
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
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Dealer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Joining Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Quotations
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Projects
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Performance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Select CP
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedDistrict.dealers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No dealers found in {selectedDistrict.name}
                                            </td>
                                        </tr>
                                    ) : (
                                        selectedDistrict.dealers.map((dealer) => (
                                            <tr key={dealer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {dealer.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar size={14} className="mr-1 text-gray-400" />
                                                        {dealer.joinDate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <FileText size={14} className="mr-1 text-blue-400" />
                                                        {dealer.quotations}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <TrendingUp size={14} className="mr-1 text-green-400" />
                                                        {dealer.projects}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${parseInt(dealer.performance) >= 90
                                                            ? 'bg-green-100 text-green-700'
                                                            : parseInt(dealer.performance) >= 80
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {dealer.performance}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        defaultValue={dealer.cp}
                                                    >
                                                        {cpOptions.map((cp, index) => (
                                                            <option key={index} value={cp}>{cp}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            const select = event.target.closest('tr').querySelector('select');
                                                            const selectedCP = select ? select.value : dealer.cp;
                                                            handleRaiseRequest(dealer.name, selectedCP);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                                    >
                                                        <UserPlus size={12} className="mr-1" />
                                                        Raise Request
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                                            <p className="text-lg font-bold text-gray-700">{selectedDistrict.dealers.length}</p>
                                        </div>
                                        <Users size={20} className="text-blue-500" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Quotations</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {selectedDistrict.dealers.reduce((sum, d) => sum + d.quotations, 0)}
                                            </p>
                                        </div>
                                        <FileText size={20} className="text-green-500" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Projects</p>
                                            <p className="text-lg font-bold text-orange-600">
                                                {selectedDistrict.dealers.reduce((sum, d) => sum + d.projects, 0)}
                                            </p>
                                        </div>
                                        <TrendingUp size={20} className="text-orange-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!showDistrictCards && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Select a Channel Partner to view districts and dealers</p>
                    </div>
                )}

                {showDistrictCards && selectedCP && !showDealerTable && (
                    <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                        <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Select a district to view dealers</p>
                    </div>
                )}
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

export default DealerManagerAssignToCP;