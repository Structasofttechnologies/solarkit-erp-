import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Users,
    User,
    Filter,
    X,
    Check,
    Home,
    Building2,
    Sun,
    Zap,
    Battery,
    BarChart3,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    HelpCircle
} from 'lucide-react';
import { locationAPI } from '../../../api/api';

const FranchiseLeadAssignDashboard = () => {
    // State for selected district
    const [selectedDistrict, setSelectedDistrict] = useState('all');

    // State for selected role
    const [selectedRole, setSelectedRole] = useState(null);

    // State for dropdown selections
    const [selectedDealer, setSelectedDealer] = useState('');
    const [selectedSalesManager, setSelectedSalesManager] = useState('');

    // State for showing performance section
    const [showPerformance, setShowPerformance] = useState(false);

    // State for filter modal
    const [showFilterModal, setShowFilterModal] = useState(false);

    // State for filter options
    const [filters, setFilters] = useState({
        category: 'all',
        subcategory: 'all',
        type: 'all',
        subtype: 'all'
    });

    // State for active filter options in modal
    const [activeFilters, setActiveFilters] = useState({
        category: 'all',
        subcategory: 'all',
        type: 'all',
        subtype: 'all'
    });

    // State for performance data
    const [performanceData, setPerformanceData] = useState({
        assignedLeads: 0,
        survey: 0,
        quote: 0,
        projectSignup: 0,
        install: 0,
        services: 0
    });

    // Districts data
    // Districts data
    const [districts, setDistricts] = useState([
        { id: 'all', name: 'All' }
    ]);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    const dynamicDistricts = response.data.data.map(d => ({
                        id: d.name.toLowerCase(), // using name as id for compatibility with existing logic
                        name: d.name
                    }));
                    setDistricts([{ id: 'all', name: 'All' }, ...dynamicDistricts]);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    // Dealers data
    const dealers = [
        { id: 'dealer1', name: 'Ramesh Patel' },
        { id: 'dealer2', name: 'Amit Shah' },
        { id: 'dealer3', name: 'Vikram Singh' },
        { id: 'dealer4', name: 'Sanjay Gupta' },
        { id: 'dealer5', name: 'Mohanlal Joshi' }
    ];

    // Sales Managers data
    const salesManagers = [
        { id: 'sm1', name: 'Priya Sharma' },
        { id: 'sm2', name: 'Anand Verma' },
        { id: 'sm3', name: 'Kavita Mehta' },
        { id: 'sm4', name: 'Rohit Desai' },
        { id: 'sm5', name: 'Neha Patel' }
    ];

    // Projects data
    const projectsData = [
        { customer: 'Rajesh Patel', projectType: 'Residential', kw: '5.2', category: 'Solar', subType: 'Rooftop', assignedTo: 'Ramesh Patel', city: 'Ahmedabad', date: '15/05/2023', status: 'Active' },
        { customer: 'Priya Sharma', projectType: 'Commercial', kw: '10.5', category: 'Solar', subType: 'Ground Mount', assignedTo: 'Amit Shah', city: 'Surat', date: '14/05/2023', status: 'Pending' },
        { customer: 'Anand Verma', projectType: 'Industrial', kw: '25.0', category: 'Solar', subType: 'Carport', assignedTo: 'Vikram Singh', city: 'Rajkot', date: '13/05/2023', status: 'Completed' },
        { customer: 'Kavita Mehta', projectType: 'Residential', kw: '3.5', category: 'Solar', subType: 'Rooftop', assignedTo: 'Sanjay Gupta', city: 'Vadodara', date: '12/05/2023', status: 'Active' },
        { customer: 'Rohit Desai', projectType: 'Commercial', kw: '15.8', category: 'Solar', subType: 'Ground Mount', assignedTo: 'Mohanlal Joshi', city: 'Bhavnagar', date: '11/05/2023', status: 'Cancelled' },
        { customer: 'Neha Patel', projectType: 'Residential', kw: '4.2', category: 'Solar', subType: 'Rooftop', assignedTo: 'Priya Sharma', city: 'Dwarka', date: '10/05/2023', status: 'Completed' },
        { customer: 'Arjun Singh', projectType: 'Commercial', kw: '8.7', category: 'Solar', subType: 'Carport', assignedTo: 'Anand Verma', city: 'Jamnagar', date: '09/05/2023', status: 'Active' },
        { customer: 'Meera Joshi', projectType: 'Industrial', kw: '30.0', category: 'Solar', subType: 'Ground Mount', assignedTo: 'Kavita Mehta', city: 'Ahmedabad', date: '08/05/2023', status: 'Pending' }
    ];

    // Update performance section when filters change
    useEffect(() => {
        if (selectedDistrict && selectedRole &&
            ((selectedRole === 'dealer' && selectedDealer) ||
                (selectedRole === 'sales_manager' && selectedSalesManager))) {
            setShowPerformance(true);
            generatePerformanceData();
        } else {
            setShowPerformance(false);
        }
    }, [selectedDistrict, selectedRole, selectedDealer, selectedSalesManager]);

    // Generate random performance data
    const generatePerformanceData = () => {
        setPerformanceData({
            assignedLeads: Math.floor(Math.random() * 100) + 10,
            survey: Math.floor(Math.random() * 80) + 5,
            quote: Math.floor(Math.random() * 60) + 5,
            projectSignup: Math.floor(Math.random() * 40) + 2,
            install: Math.floor(Math.random() * 30) + 1,
            services: Math.floor(Math.random() * 50) + 5
        });
    };

    // Handle district selection
    const handleDistrictClick = (districtId) => {
        setSelectedDistrict(districtId);
    };

    // Handle role selection
    const handleRoleClick = (role) => {
        setSelectedRole(role);
        setSelectedDealer('');
        setSelectedSalesManager('');
    };

    // Handle filter option click in modal
    const handleFilterOptionClick = (filterType, value) => {
        setActiveFilters({
            ...activeFilters,
            [filterType]: value
        });
    };

    // Reset all filters
    const resetFilters = () => {
        setActiveFilters({
            category: 'all',
            subcategory: 'all',
            type: 'all',
            subtype: 'all'
        });
    };

    // Apply filters
    const applyFilters = () => {
        setFilters(activeFilters);
        setShowFilterModal(false);
        alert('Filters applied successfully!');
    };

    // Get status badge class and icon
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
            case 'completed':
                return { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle };
            case 'cancelled':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: HelpCircle };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-4">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm mb-4">
                    <div className="p-4 flex justify-between items-center">
                        <h5 className="text-blue-600 font-bold text-lg">Lead Assigned Dashboard</h5>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                        >
                            <Filter size={16} className="mr-2" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* District Filter Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                        Select District
                    </div>
                    <div className="flex overflow-x-auto pb-2 space-x-3">
                        {districts.map((district) => (
                            <div
                                key={district.id}
                                onClick={() => handleDistrictClick(district.id)}
                                className={`flex-shrink-0 min-w-[140px] bg-white border rounded-lg text-center shadow-sm cursor-pointer transition-all ${selectedDistrict === district.id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="p-3">
                                    <MapPin className={`mx-auto mb-1 ${selectedDistrict === district.id ? 'text-blue-500' : 'text-gray-400'
                                        }`} size={20} />
                                    <div className={`text-sm font-semibold ${selectedDistrict === district.id ? 'text-blue-600' : 'text-gray-700'
                                        }`}>
                                        {district.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Role Filter Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                        Select Role
                    </div>
                    <div className="flex overflow-x-auto pb-2 space-x-3">
                        <div
                            onClick={() => handleRoleClick('dealer')}
                            className={`flex-shrink-0 min-w-[140px] bg-white border rounded-lg text-center shadow-sm cursor-pointer transition-all ${selectedRole === 'dealer'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="p-3">
                                <User className={`mx-auto mb-1 ${selectedRole === 'dealer' ? 'text-blue-500' : 'text-gray-400'
                                    }`} size={20} />
                                <div className={`text-sm font-semibold ${selectedRole === 'dealer' ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    Dealer
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => handleRoleClick('sales_manager')}
                            className={`flex-shrink-0 min-w-[140px] bg-white border rounded-lg text-center shadow-sm cursor-pointer transition-all ${selectedRole === 'sales_manager'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="p-3">
                                <Users className={`mx-auto mb-1 ${selectedRole === 'sales_manager' ? 'text-blue-500' : 'text-gray-400'
                                    }`} size={20} />
                                <div className={`text-sm font-semibold ${selectedRole === 'sales_manager' ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    Sales Manager
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dealer Dropdown */}
                    {selectedRole === 'dealer' && (
                        <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Select Dealer</div>
                            <select
                                value={selectedDealer}
                                onChange={(e) => setSelectedDealer(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select Dealer --</option>
                                {dealers.map(dealer => (
                                    <option key={dealer.id} value={dealer.id}>{dealer.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sales Manager Dropdown */}
                    {selectedRole === 'sales_manager' && (
                        <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Select Sales Manager</div>
                            <select
                                value={selectedSalesManager}
                                onChange={(e) => setSelectedSalesManager(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select Sales Manager --</option>
                                {salesManagers.map(manager => (
                                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Performance Overview Section */}
                {showPerformance && (
                    <div className="mt-6 animate-fadeIn">
                        <div className="mb-4">
                            <h5 className="text-lg font-semibold text-gray-800">
                                Performance Overview - All {selectedRole === 'dealer' ? 'Dealer' : 'Sales Manager'}: {
                                    selectedRole === 'dealer'
                                        ? dealers.find(d => d.id === selectedDealer)?.name
                                        : salesManagers.find(s => s.id === selectedSalesManager)?.name
                                }
                            </h5>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {/* Assigned Leads Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/5957bb74-07b8-4c10-ac41-a9b79450a28b.png?auth_key=1865284742-78d621ca37b54fba949906648dc4436f-0-bd4261274b40aaafd7a7b89bf4fa71e8"
                                        alt="Assigned Leads"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.assignedLeads}
                                    </div>
                                    <div className="text-xs text-gray-500">Assigned Leads</div>
                                </div>
                            </div>

                            {/* Survey Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/32495895-dd5c-4b5e-ba39-753f1853757f.png?auth_key=1865284742-491e2602bc79498cb6027c1f8a7aa504-0-bb79e7fc57ab0466abf220b8c2f06da5"
                                        alt="Survey"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.survey}
                                    </div>
                                    <div className="text-xs text-gray-500">Survey</div>
                                </div>
                            </div>

                            {/* Quote Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/32495895-dd5c-4b5e-ba39-753f1853757f.png?auth_key=1865284742-491e2602bc79498cb6027c1f8a7aa504-0-bb79e7fc57ab0466abf220b8c2f06da5"
                                        alt="Quote"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.quote}
                                    </div>
                                    <div className="text-xs text-gray-500">Quote</div>
                                </div>
                            </div>

                            {/* Project Signup Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/79f43bcd-998a-46d5-8468-53c0cc636444.png?auth_key=1865284742-1870433f40c24765a53480022e3638ef-0-1896a5b10f5c75d340e6cfe031ca5fba"
                                        alt="Project Signup"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.projectSignup}
                                    </div>
                                    <div className="text-xs text-gray-500">Project Signup</div>
                                </div>
                            </div>

                            {/* Install Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/21ff8086-1696-4e45-beeb-a8e72695be77.png?auth_key=1865284742-dd8a50e3a276406181aa2cd9154ed73f-0-2f701bf1bdd4778bda3b803b2ead165f"
                                        alt="Install"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.install}
                                    </div>
                                    <div className="text-xs text-gray-500">Install</div>
                                </div>
                            </div>

                            {/* Services Card */}
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 text-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/8a2a5ae6-0129-45a4-896d-2d7d1995428a.png?auth_key=1865284742-e2dd61ed5f774dc0bb1a596aeff7c219-0-5a62478bee6a84995f4b1f8f5b18f5d0"
                                        alt="Services"
                                        className="w-12 h-12 mx-auto mb-3 object-contain"
                                    />
                                    <div className="text-2xl font-bold text-blue-500 mb-1">
                                        {performanceData.services}
                                    </div>
                                    <div className="text-xs text-gray-500">Services</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Metrics Section */}
                <div className="mt-8">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                        Performance Metrics - All Dealers
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Survey Card */}
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">55.0%</div>
                                <div className="text-sm text-gray-600 mb-2">Survey</div>
                                <div className="text-sm font-semibold text-gray-700">Current: 22</div>
                            </div>
                        </div>

                        {/* Quote Card */}
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">70.0%</div>
                                <div className="text-sm text-gray-600 mb-2">Quote</div>
                                <div className="text-sm font-semibold text-gray-700">Current: 35</div>
                            </div>
                        </div>

                        {/* Project Signup Card */}
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">72.0%</div>
                                <div className="text-sm text-gray-600 mb-2">Project Signup</div>
                                <div className="text-sm font-semibold text-gray-700">Current: 18</div>
                            </div>
                        </div>

                        {/* Install Card */}
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">75.0%</div>
                                <div className="text-sm text-gray-600 mb-2">Install</div>
                                <div className="text-sm font-semibold text-gray-700">Current: 15</div>
                            </div>
                        </div>

                        {/* Services Card */}
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">60.0%</div>
                                <div className="text-sm text-gray-600 mb-2">Services</div>
                                <div className="text-sm font-semibold text-gray-700">Current: 12</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Table Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                        All Projects - All Sales Manager/Dealer Team
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Customer Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Project Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">kW</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sub Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">City</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projectsData.map((project, index) => {
                                    const statusBadge = getStatusBadge(project.status);
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{project.customer}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.projectType}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.kw}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.category}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.subType}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.assignedTo}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.city}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.date}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                                    <StatusIcon size={12} className="mr-1" />
                                                    {project.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold">Filter Projects</h5>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Project Category */}
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Project Category</div>
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'solar', 'water', 'energy'].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleFilterOptionClick('category', value)}
                                            className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${activeFilters.category === value
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Project Subcategory */}
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Project Subcategory</div>
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'residential', 'commercial', 'industrial'].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleFilterOptionClick('subcategory', value)}
                                            className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${activeFilters.subcategory === value
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Project Type (kW) */}
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Project Type (kW)</div>
                                <div className="flex flex-wrap gap-2">
                                    {['all', '1-5', '5-10', '10-20', '20+'].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleFilterOptionClick('type', value)}
                                            className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${activeFilters.type === value
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {value === 'all' ? 'All' : value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Project Subtype */}
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-gray-700 mb-3">Project Subtype</div>
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'rooftop', 'ground', 'carport', 'floating'].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleFilterOptionClick('subtype', value)}
                                            className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${activeFilters.subtype === value
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {value === 'all' ? 'All' : value === 'ground' ? 'Ground Mount' : value.charAt(0).toUpperCase() + value.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add custom animation styles */}
            {/* Add custom animation styles */}
            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default FranchiseLeadAssignDashboard;