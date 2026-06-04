import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Building,
    Filter,
    Search,
    RefreshCw,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowRight,
    Eye,
    Users,
    Zap,
    Sun,
    Wind,
    Grid,
    Calendar,
    User,
    Phone,
    MapPin,
    FileText,
    Download,
    Upload,
    Settings,
    Play,
    Pause,
    Check,
    X
} from 'lucide-react';

const FranchiseeManagerProjectInProgress = () => {
    const [projectType, setProjectType] = useState('residential'); // 'residential' or 'commercial'
    const [activeProcess, setActiveProcess] = useState('consumerRegistered');
    const [filters, setFilters] = useState({
        category: [],
        subCategory: [],
        projectType: [],
        subProjectType: []
    });
    const [cpFilter, setCpFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Sample CP list
    const cpList = [
        'All Franchisees/Installers',
        'SolarTech Solutions',
        'Green Energy',
        'SunPower'
    ];

    // Process data mapping
    const processData = {
        consumerRegistered: [
            { id: 1, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'Initial Inquiry', completedIn: '2 days', currentTask: 'Consumer Registration', overdueDays: '3 days', cp: 'SolarTech Solutions' },
            { id: 2, customer: 'Priya Sharma', projectId: 'PRJ-1002', previousTask: 'Initial Inquiry', completedIn: '1 day', currentTask: 'Consumer Registration', overdueDays: '5 days', cp: 'Green Energy' },
            { id: 3, customer: 'Vijay Mehta', projectId: 'PRJ-1003', previousTask: 'Initial Inquiry', completedIn: '3 days', currentTask: 'Consumer Registration', overdueDays: '2 days', cp: 'SunPower' },
        ],
        applicationSubmission: [
            { id: 4, customer: 'Anjali Desai', projectId: 'PRJ-1004', previousTask: 'Consumer Registration', completedIn: '3 days', currentTask: 'Application Submission', overdueDays: '4 days', cp: 'SolarTech Solutions' },
            { id: 5, customer: 'Sanjay Gupta', projectId: 'PRJ-1005', previousTask: 'Consumer Registration', completedIn: '2 days', currentTask: 'Application Submission', overdueDays: '1 day', cp: 'Green Energy' },
        ],
        feasibilityCheck: [
            { id: 6, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTasks: ['Consumer Registered', 'Application Submission'], completedIn: '5 days', currentTask: 'Feasibility Check', overdueDays: '2 days', cp: 'SolarTech Solutions' },
            { id: 7, customer: 'Priya Sharma', projectId: 'PRJ-1002', previousTasks: ['Consumer Registered', 'Application Submission'], completedIn: '4 days', currentTask: 'Feasibility Check', overdueDays: '3 days', cp: 'Green Energy' },
        ],
        meterCharge: [
            { id: 8, customer: 'Anjali Desai', projectId: 'PRJ-1004', previousTasks: ['Consumer Registered', 'Application Submission', 'Feasibility Check'], completedIn: '3 days', currentTask: 'Meter Charge', overdueDays: '1 day', cp: 'SolarTech Solutions' },
        ],
        vendorSelection: [
            { id: 9, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTasks: ['Consumer Registered', 'Application Submission', 'Feasibility Check', 'Meter Charge'], completedIn: '7 days', currentTask: 'Vendor Selection', overdueDays: '2 days', cp: 'SolarTech Solutions' },
        ],
        workStart: [
            { id: 10, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTasks: ['Consumer Registered', 'Application Submission', 'Feasibility Check', 'Meter Charge', 'Vendor Selection'], completedIn: '5 days', currentTask: 'Work Start', overdueDays: '3 days', cp: 'SolarTech Solutions' },
        ],
        solarInstallation: [
            { id: 11, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'Work Start', completedIn: '10 days', currentTask: 'Solar Installation', overdueDays: '5 days', cp: 'SolarTech Solutions' },
        ],
        pcr: [
            { id: 12, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'Solar Installation', completedIn: '7 days', currentTask: 'PCR', overdueDays: '2 days', cp: 'SolarTech Solutions' },
        ],
        commissioning: [
            { id: 13, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'PCR', completedIn: '5 days', currentTask: 'Commissioning', overdueDays: '1 day', cp: 'SolarTech Solutions' },
        ],
        meterchange: [
            { id: 14, customer: 'Anjali Desai', projectId: 'PRJ-1004', previousTask: 'Commissioning', completedIn: '3 days', currentTask: 'Meter Change', overdueDays: '4 days', cp: 'SolarTech Solutions' },
            { id: 15, customer: 'Sanjay Gupta', projectId: 'PRJ-1005', previousTask: 'Commissioning', completedIn: '2 days', currentTask: 'Meter Change', overdueDays: '1 day', cp: 'Green Energy' },
        ],
        inspection: [
            { id: 16, customer: 'Anjali Desai', projectId: 'PRJ-1004', previousTask: 'Meter Change', completedIn: '3 days', currentTask: 'Meter Inspection', overdueDays: '2 days', cp: 'SolarTech Solutions' },
            { id: 17, customer: 'Sanjay Gupta', projectId: 'PRJ-1005', previousTask: 'Meter Change', completedIn: '2 days', currentTask: 'Meter Inspection', overdueDays: '1 day', cp: 'Green Energy' },
        ],
        subsidyrequest: [
            { id: 18, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'Commissioning', completedIn: '5 days', currentTask: 'Subsidy Request', overdueDays: '2 days', cp: 'SolarTech Solutions' },
            { id: 19, customer: 'Priya Sharma', projectId: 'PRJ-1002', previousTask: 'Commissioning', completedIn: '4 days', currentTask: 'Subsidy Request', overdueDays: '3 days', cp: 'Green Energy' },
        ],
        subsidydisbursal: [
            { id: 20, customer: 'Ramesh Patel', projectId: 'PRJ-1001', previousTask: 'Subsidy Request', completedIn: '7 days', currentTask: 'Subsidy Disbursal', overdueDays: '2 days', cp: 'SolarTech Solutions' },
            { id: 21, customer: 'Priya Sharma', projectId: 'PRJ-1002', previousTask: 'Subsidy Request', completedIn: '5 days', currentTask: 'Subsidy Disbursal', overdueDays: '1 day', cp: 'Green Energy' },
        ],
    };

    // Process counts
    const processCounts = {
        consumerRegistered: 42,
        applicationSubmission: 38,
        feasibilityCheck: 28,
        meterCharge: 24,
        vendorSelection: 15,
        workStart: 12,
        solarInstallation: 8,
        pcr: 5,
        commissioning: 3,
        meterchange: 28,
        inspection: 24,
        subsidyrequest: 28,
        subsidydisbursal: 24,
    };

    // Filter processes based on project type
    const getProcesses = () => {
        const allProcesses = [
            { id: 'consumerRegistered', label: 'Consumer Registered', count: processCounts.consumerRegistered, main: 'Project Signup', colSpan: 2 },
            { id: 'applicationSubmission', label: 'Application Submission', count: processCounts.applicationSubmission, main: 'Project Signup', colSpan: 2 },
            { id: 'feasibilityCheck', label: 'Feasibility Check', count: processCounts.feasibilityCheck, main: 'Feasibility Approval', colSpan: 2 },
            { id: 'meterCharge', label: 'Meter Charge', count: processCounts.meterCharge, main: 'Feasibility Approval', colSpan: 2 },
            { id: 'vendorSelection', label: 'Vendor Selection', count: processCounts.vendorSelection, main: 'Installation Status', colSpan: 5 },
            { id: 'workStart', label: 'Work Start', count: processCounts.workStart, main: 'Installation Status', colSpan: 5 },
            { id: 'solarInstallation', label: 'Solar Installation', count: processCounts.solarInstallation, main: 'Installation Status', colSpan: 5 },
            { id: 'pcr', label: 'PCR', count: processCounts.pcr, main: 'Installation Status', colSpan: 5 },
            { id: 'commissioning', label: 'Commissioning', count: processCounts.commissioning, main: 'Installation Status', colSpan: 5 },
            { id: 'meterchange', label: 'Meter Change', count: processCounts.meterchange, main: 'Meter Installation', colSpan: 2 },
            { id: 'inspection', label: 'Meter Inspection', count: processCounts.inspection, main: 'Meter Installation', colSpan: 2 },
        ];

        if (projectType === 'residential') {
            allProcesses.push(
                { id: 'subsidyrequest', label: 'Subsidy Request', count: processCounts.subsidyrequest, main: 'Subsidy', colSpan: 2 },
                { id: 'subsidydisbursal', label: 'Subsidy Disbursal', count: processCounts.subsidydisbursal, main: 'Subsidy', colSpan: 2 }
            );
        }

        return allProcesses;
    };

    // Group processes by main category
    const getMainCategories = () => {
        const processes = getProcesses();
        const categories = [];

        processes.forEach(process => {
            if (!categories.find(c => c.name === process.main)) {
                categories.push({
                    name: process.main,
                    colSpan: process.main === 'Installation Status' ? 5 : process.main === 'Subsidy' ? 2 : 2
                });
            }
        });

        return categories;
    };

    const getActionButton = (process, item) => {
        switch (process) {
            case 'vendorSelection':
                return (
                    <button
                        onClick={() => window.location.href = '/vendor-selection?id=' + item.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        Vendor Selection
                        <ArrowRight size={12} className="ml-1" />
                    </button>
                );
            case 'workStart':
                return (
                    <button
                        onClick={() => window.location.href = '/work-start?id=' + item.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        Work Start
                        <ArrowRight size={12} className="ml-1" />
                    </button>
                );
            case 'solarInstallation':
                return (
                    <button
                        onClick={() => window.location.href = '/solar-installation?id=' + item.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        Installation
                        <ArrowRight size={12} className="ml-1" />
                    </button>
                );
            case 'pcr':
                return (
                    <button
                        onClick={() => window.location.href = '/pcr?id=' + item.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        PCR
                        <ArrowRight size={12} className="ml-1" />
                    </button>
                );
            default:
                return (
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center">
                        <Eye size={12} className="mr-1" />
                        View Details
                    </button>
                );
        }
    };

    const filteredData = activeProcess && processData[activeProcess]
        ? processData[activeProcess].filter(item => cpFilter === 'all' || item.cp === cpFilter)
        : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <Zap className="mr-2 text-blue-500" size={24} />
                            Solar Project Management
                        </h2>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h5 className="font-semibold text-gray-700 flex items-center">
                            <Filter size={16} className="mr-2 text-blue-500" />
                            Filters
                        </h5>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" multiple size={3}>
                                        <option value="solar-panel">Solar Panel</option>
                                        <option value="solar-rooftop">Solar Rooftop</option>
                                        <option value="solar-pump">Solar Pump</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" multiple size={3}>
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" multiple size={3}>
                                        <option value="3-5kw">3Kw-5Kw</option>
                                        <option value="5-10kw">5Kw-10Kw</option>
                                        <option value="10-20kw">10Kw-20Kw</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" multiple size={3}>
                                        <option value="on-grid">On-Grid</option>
                                        <option value="off-grid">Off-grid</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                                <Filter size={16} className="mr-2" />
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Project Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div
                        onClick={() => setProjectType('residential')}
                        className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${projectType === 'residential' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                            }`}
                    >
                        <div className="p-6 text-center">
                            <Home size={48} className="mx-auto mb-3 text-blue-500" />
                            <h4 className="text-xl font-semibold text-gray-800">Residential</h4>
                            <p className="text-sm text-gray-500 mt-1">Manage residential solar projects</p>
                        </div>
                    </div>
                    <div
                        onClick={() => setProjectType('commercial')}
                        className={`cursor-pointer rounded-xl shadow-sm transition-all hover:shadow-md ${projectType === 'commercial' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                            }`}
                    >
                        <div className="p-6 text-center">
                            <Building size={48} className="mx-auto mb-3 text-blue-500" />
                            <h4 className="text-xl font-semibold text-gray-800">Commercial</h4>
                            <p className="text-sm text-gray-500 mt-1">Manage commercial solar projects</p>
                        </div>
                    </div>
                </div>

                {/* Process Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h5 className="font-semibold text-gray-700">Project Processes</h5>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                {/* Main Categories */}
                                <tr className="bg-blue-50">
                                    {getMainCategories().map((category, idx) => (
                                        <th
                                            key={idx}
                                            colSpan={category.colSpan}
                                            className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200"
                                        >
                                            {category.name}
                                        </th>
                                    ))}
                                </tr>

                                {/* Sub Processes */}
                                <tr className="bg-gray-100">
                                    {getProcesses().map((process) => (
                                        <td
                                            key={process.id}
                                            onClick={() => {
                                                if (projectType === 'commercial' && process.id.includes('subsidy')) return;
                                                setActiveProcess(process.id);
                                            }}
                                            className={`px-3 py-2 text-xs font-medium text-center border-r border-gray-200 cursor-pointer transition-colors ${activeProcess === process.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                                                } ${projectType === 'commercial' && process.id.includes('subsidy') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {process.label} ({process.count})
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Data Rows */}
                                {activeProcess && (
                                    <tr>
                                        <td colSpan="15" className="p-4 bg-gray-50">
                                            <div className="space-y-4">
                                                {/* CP Filter */}
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-sm font-medium text-gray-700">Filter by Franchisee/Installer:</label>
                                                    <select
                                                        value={cpFilter}
                                                        onChange={(e) => setCpFilter(e.target.value)}
                                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="all">All Franchisees/Installers</option>
                                                        <option value="SolarTech Solutions">SolarTech Solutions</option>
                                                        <option value="Green Energy">Green Energy</option>
                                                        <option value="SunPower">SunPower</option>
                                                    </select>
                                                </div>

                                                {/* Data Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Customer Name</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Project ID</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Previous Task</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Completed In</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Current Task</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Overdue Days</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">CP Name</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {filteredData.map((item) => (
                                                                <tr key={item.id} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-2 text-sm">{item.customer}</td>
                                                                    <td className="px-4 py-2 text-sm">{item.projectId}</td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        {item.previousTasks ? (
                                                                            <div className="flex items-center space-x-1">
                                                                                {item.previousTasks.map((task, idx) => (
                                                                                    <span key={idx} className="flex items-center text-xs">
                                                                                        {task} <CheckCircle size={12} className="ml-1 text-green-500" />
                                                                                        {idx < item.previousTasks.length - 1 && <ChevronRight size={12} className="mx-1 text-gray-400" />}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            item.previousTask
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        <span className="text-green-600 font-medium">{item.completedIn}</span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.currentTask}</td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        <span className="text-red-600 font-medium">{item.overdueDays}</span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm">{item.cp}</td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        {getActionButton(activeProcess, item)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {filteredData.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                                                        No data found for selected filter
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-700">156</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Zap size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">In Progress</p>
                                <p className="text-2xl font-bold text-orange-600">89</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Clock size={20} className="text-orange-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">43</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">24</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertCircle size={20} className="text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerProjectInProgress;