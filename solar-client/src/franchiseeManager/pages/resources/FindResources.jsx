import React, { useState } from 'react';
import {
    MapPin,
    Filter,
    Search,
    Users,
    Wrench,
    Zap,
    Home,
    Building,
    Sun,
    Cloud,
    Wind,
    Grid,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    ChevronRight,
    User,
    Phone,
    Mail,
    Navigation,
    Calendar,
    Award,
    Star,
    TrendingUp
} from 'lucide-react';

const FranchiseeManagerFindResources = () => {
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [showResources, setShowResources] = useState(false);
    const [activeTab, setActiveTab] = useState('installers');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        subCategory: '',
        projectType: '',
        subProjectType: '',
        franchisee: '',
        nearByKm: ''
    });

    // District data
    const districts = [
        { id: 1, name: 'Rajkot', talukas: ['Jasdan', 'Upleta', 'Paddhari', 'Gondal'], resources: 45 },
        { id: 2, name: 'Ahmedabad', talukas: ['Daskroi', 'Sanand', 'Viramgam', 'Detroj'], resources: 78 },
        { id: 3, name: 'Surat', talukas: ['Choryasi', 'Palsana', 'Bardoli', 'Mahuva'], resources: 62 },
        { id: 4, name: 'Vadodara', talukas: ['Padra', 'Karjan', 'Sinor', 'Savli'], resources: 53 }
    ];

    // Sample customer/project data
    const customerData = [
        { id: 1, customer: 'Shaym Makwana', projectType: 'Residential', location: 'Rajkot', taluka: 'Jasdan', kwSize: '5 KW', overdue: '3 Days', status: 'Pending', franchisee: 'Royal Solar Pvt Ltd' },
        { id: 2, customer: 'Mitesh Mevada', projectType: 'Residential', location: 'Rajkot', taluka: 'Upleta', kwSize: '5 KW', overdue: '3 Days', status: 'Pending', franchisee: 'Manav Solar Pvt Ltd' },
        { id: 3, customer: 'Pratik Chauhan', projectType: 'Residential', location: 'Rajkot', taluka: 'Paddhari', kwSize: '5 KW', overdue: '3 Days', status: 'Pending', franchisee: 'Shiv Solar Pvt Ltd' },
        { id: 4, customer: 'Rajesh Patel', projectType: 'Commercial', location: 'Rajkot', taluka: 'Gondal', kwSize: '10 KW', overdue: '5 Days', status: 'In Progress', franchisee: 'Royal Solar Pvt Ltd' },
        { id: 5, customer: 'Priya Sharma', projectType: 'Residential', location: 'Rajkot', taluka: 'Jasdan', kwSize: '3 KW', overdue: '1 Day', status: 'Pending', franchisee: 'Manav Solar Pvt Ltd' }
    ];

    // Installer data for modal
    const installerData = [
        {
            company: 'Sunshine Solar Pvt Ltd',
            teams: [
                { name: 'Sunrise Solar', location: 'Jasdan', km: '2 Km', slots: '25 Kw', status: 'Accepted' },
                { name: 'Mona Solar', location: 'Upleta', km: '4 Km', slots: '25 Kw', status: 'Not Accepted' },
                { name: 'Mahesh Solar', location: 'Paddhari', km: '5 Km', slots: '25 Kw', status: 'Not Accepted' }
            ]
        },
        {
            company: 'Bright Energy Ltd',
            teams: [
                { name: 'Ackno Power Solar', location: 'Jasdan', km: '6 Km', slots: '25 Kw', status: 'Accepted' },
                { name: 'Global Power Solar', location: 'Upleta', km: '8 Km', slots: '25 Kw', status: 'Not Accepted' }
            ]
        }
    ];

    const handleDistrictClick = (district) => {
        setSelectedDistrict(district);
        setShowResources(true);
    };

    const handleAssignWork = (customer) => {
        setSelectedCustomer(customer);
        setShowAssignModal(true);
    };

    // Filter customers based on selected filters
    const filteredCustomers = customerData.filter(customer => {
        if (filters.franchisee && customer.franchisee !== filters.franchisee) return false;
        if (filters.projectType && customer.projectType.toLowerCase() !== filters.projectType) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li className="text-gray-500 font-medium" aria-current="page">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <Search className="mr-2 text-blue-500" size={28} />
                                    Find Resources
                                </h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* District Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <MapPin size={20} className="mr-2 text-blue-500" />
                        Select District
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {districts.map((district) => (
                            <div
                                key={district.id}
                                onClick={() => handleDistrictClick(district)}
                                className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${selectedDistrict?.id === district.id
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                        : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <div className="p-4 text-center">
                                    <MapPin size={32} className={`mx-auto mb-2 ${selectedDistrict?.id === district.id ? 'text-white' : 'text-blue-500'}`} />
                                    <h5 className={`font-bold ${selectedDistrict?.id === district.id ? 'text-white' : 'text-gray-800'}`}>
                                        {district.name}
                                    </h5>
                                    <p className={`text-sm mt-1 ${selectedDistrict?.id === district.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {district.resources} resources
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resources Section */}
                {showResources && selectedDistrict && (
                    <div className="animate-fade-in">
                        {/* Filters Row */}
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">All Categories</option>
                                    <option value="solarpanel">Solar Panel</option>
                                    <option value="solarrooftop">Solar RoofTop</option>
                                    <option value="solarpump">Solar Pump</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.subCategory}
                                    onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
                                >
                                    <option value="">All Sub Categories</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.projectType}
                                    onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                                >
                                    <option value="">All Project Types</option>
                                    <option value="3-5kw">3kW - 5kW</option>
                                    <option value="5-10kw">5kW - 10kW</option>
                                    <option value="10-20kw">10kW - 20kW</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.subProjectType}
                                    onChange={(e) => setFilters({ ...filters, subProjectType: e.target.value })}
                                >
                                    <option value="">All Sub Project Types</option>
                                    <option value="ongrid">On-Grid</option>
                                    <option value="offgrid">Off-grid</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.franchisee}
                                    onChange={(e) => setFilters({ ...filters, franchisee: e.target.value })}
                                >
                                    <option value="">All Franchisees</option>
                                    <option value="Royal Solar Pvt Ltd">Royal Solar Pvt Ltd</option>
                                    <option value="Manav Solar Pvt Ltd">Manav Solar Pvt Ltd</option>
                                    <option value="Shiv Solar Pvt Ltd">Shiv Solar Pvt Ltd</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.nearByKm}
                                    onChange={(e) => setFilters({ ...filters, nearByKm: e.target.value })}
                                >
                                    <option value="">All Near By Km</option>
                                    <option value="0-5">0-5 Km</option>
                                    <option value="5-10">5-10 Km</option>
                                    <option value="10-20">10-20 Km</option>
                                </select>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex space-x-2 mb-4 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('installers')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'installers'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Installer Agency
                            </button>
                            <button
                                onClick={() => setActiveTab('solar')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'solar'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Solar Installers
                            </button>
                            <button
                                onClick={() => setActiveTab('pipe')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'pipe'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Solar Pipe Installer
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {activeTab === 'solar' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Project Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location (Taluka)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">KW Size</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Installation Overdue</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredCustomers.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50" data-cp={item.franchisee}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.customer}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.projectType}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.taluka}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.kwSize}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                                            {item.overdue}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleAssignWork(item)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                        >
                                                            Assign Work
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'installers' && (
                                <div className="p-8 text-center text-gray-500">
                                    <Wrench size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>Installer Agency content would appear here</p>
                                </div>
                            )}

                            {activeTab === 'pipe' && (
                                <div className="p-8 text-center text-gray-500">
                                    <Wind size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>Solar Pipe Installer content would appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!showResources && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Select a district to view available resources</p>
                    </div>
                )}

                {/* Assign Work Modal */}
                {showAssignModal && selectedCustomer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xl font-semibold text-gray-800">
                                        Installer List for {selectedCustomer.customer}
                                    </h4>
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Customer Summary */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Customer</p>
                                            <p className="font-semibold">{selectedCustomer.customer}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Project Type</p>
                                            <p className="font-semibold">{selectedCustomer.projectType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="font-semibold">{selectedCustomer.taluka}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">KW Size</p>
                                            <p className="font-semibold">{selectedCustomer.kwSize}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Installer Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Team Availability</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Location (Taluka)</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Km</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Free Slots</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Action</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {installerData.map((company, companyIndex) => (
                                                <React.Fragment key={companyIndex}>
                                                    {company.teams.map((team, teamIndex) => (
                                                        <tr key={`${companyIndex}-${teamIndex}`} className="hover:bg-gray-50">
                                                            {teamIndex === 0 && (
                                                                <td rowSpan={company.teams.length} className="px-4 py-3 font-medium bg-gray-50 align-top">
                                                                    {company.company}
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-3">{team.name}</td>
                                                            <td className="px-4 py-3">{team.location}</td>
                                                            <td className="px-4 py-3">{team.km}</td>
                                                            <td className="px-4 py-3">{team.slots}</td>
                                                            <td className="px-4 py-3">
                                                                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors">
                                                                    Assign
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${team.status === 'Accepted'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {team.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Gap between companies */}
                                                    {companyIndex < installerData.length - 1 && (
                                                        <tr className="h-4 bg-transparent">
                                                            <td colSpan="7" className="p-0"></td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
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

export default FranchiseeManagerFindResources;