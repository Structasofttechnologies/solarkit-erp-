import React, { useState, useEffect } from 'react';
import {
    Home,
    Building2,
    AlertTriangle,
    X,
    ChevronDown,
    Calendar,
    Filter,
    BarChart3,
    PieChart,
    Users,
    Sun,
    Zap,
    Battery,
    TrendingUp,
    DollarSign,
    Activity
} from 'lucide-react';
import Chart from 'react-apexcharts';

const FranchiseDashboard = () => {
    // State for filters
    const [filters, setFilters] = useState({
        category: 'All',
        subCategory: 'All',
        projectType: 'All',
        projectSubType: 'All'
    });

    // State for date filters
    const [dateFilters, setDateFilters] = useState({
        quickFilter: '',
        fromDate: '',
        toDate: ''
    });

    // State for task table
    const [showTaskTable, setShowTaskTable] = useState(false);
    const [activeTaskType, setActiveTaskType] = useState('');
    const [dateRangeDisplay, setDateRangeDisplay] = useState('');

    // Sample task data
    const taskData = {
        quotes: [
            { customerName: 'John Smith', overdueDays: 2, dueDate: '2023-06-15', priority: 'High' },
            { customerName: 'Sarah Johnson', overdueDays: 0, dueDate: '2023-06-20', priority: 'Medium' },
            { customerName: 'Michael Brown', overdueDays: 5, dueDate: '2023-06-10', priority: 'High' }
        ],
        signup: [
            { customerName: 'Emily Davis', overdueDays: 1, dueDate: '2023-06-16', priority: 'Medium' },
            { customerName: 'Robert Wilson', overdueDays: 0, dueDate: '2023-06-25', priority: 'Low' },
            { customerName: 'Lisa Miller', overdueDays: 3, dueDate: '2023-06-12', priority: 'High' },
            { customerName: 'David Taylor', overdueDays: 0, dueDate: '2023-06-30', priority: 'Medium' }
        ],
        installation: [
            { customerName: 'Installation Task 1', overdueDays: 0, dueDate: '2023-06-18', priority: 'Medium' },
            { customerName: 'Installation Task 2', overdueDays: 2, dueDate: '2023-06-13', priority: 'High' }
        ],
        meters: [
            { customerName: 'Meters Task 1', overdueDays: 0, dueDate: '2023-06-22', priority: 'Low' }
        ]
    };

    const taskTitles = {
        quotes: 'Quotes Tasks',
        signup: 'Project Signup Tasks',
        installation: 'Installation Tasks',
        meters: 'Meters Tasks'
    };

    // Chart configuration
    const [chartOptions] = useState({
        chart: {
            type: 'bar',
            height: '100%',
            width: '100%',
            toolbar: {
                show: false
            }
        },
        series: [
            {
                name: 'Sales',
                data: [400, 700, 1200, 900, 1400, 1000, 1600]
            },
            {
                name: 'Profit',
                data: [200, 300, 500, 400, 600, 450, 700]
            }
        ],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        },
        colors: ['#3498db', '#2ecc71'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "₹" + val;
                }
            }
        }
    });

    // Handle filter changes
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    // Handle quick filter changes
    const handleQuickFilterChange = (e) => {
        const value = e.target.value;
        const now = new Date();
        let fromDate = '';
        let toDate = '';

        switch (value) {
            case 'last_week':
                const lastWeek = new Date(now);
                lastWeek.setDate(now.getDate() - 7);
                fromDate = lastWeek.toISOString().split('T')[0];
                toDate = now.toISOString().split('T')[0];
                break;
            case 'last_month':
                const lastMonth = new Date(now);
                lastMonth.setMonth(now.getMonth() - 1);
                fromDate = lastMonth.toISOString().split('T')[0];
                toDate = now.toISOString().split('T')[0];
                break;
            case 'last_year':
                const lastYear = new Date(now);
                lastYear.setFullYear(now.getFullYear() - 1);
                fromDate = lastYear.toISOString().split('T')[0];
                toDate = now.toISOString().split('T')[0];
                break;
            case 'custom':
                fromDate = '';
                toDate = '';
                break;
            default:
                break;
        }

        setDateFilters({
            quickFilter: value,
            fromDate,
            toDate
        });
    };

    // Update date range display
    useEffect(() => {
        if (dateFilters.fromDate && dateFilters.toDate) {
            const from = new Date(dateFilters.fromDate);
            const to = new Date(dateFilters.toDate);

            const formattedFrom = from.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const formattedTo = to.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            setDateRangeDisplay(`Selected Range: ${formattedFrom} - ${formattedTo}`);
        } else {
            setDateRangeDisplay('');
        }
    }, [dateFilters.fromDate, dateFilters.toDate]);

    // Handle task card click
    const handleTaskCardClick = (taskType) => {
        setActiveTaskType(taskType);
        setShowTaskTable(true);
    };

    // Populate task table
    const renderTaskTable = () => {
        if (!showTaskTable || !activeTaskType) return null;

        const tasks = taskData[activeTaskType] || [];

        return (
            <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-lg font-semibold">{taskTitles[activeTaskType]}</h5>
                    <button
                        onClick={() => setShowTaskTable(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue Days</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasks.map((task, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.overdueDays > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {task.overdueDays > 0 ? `${task.overdueDays} days` : 'On time'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-fluid px-4 py-4">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-md mb-4">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900">CP Dashboard</h1>
                        <p className="text-blue-600 font-semibold mt-1">Overview of your projects and activities</p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>All</option>
                            <option>Solar Rooftop</option>
                            <option>Solar Pump</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                        <select
                            name="subCategory"
                            value={filters.subCategory}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>All</option>
                            <option>Residential</option>
                            <option>Commercial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                        <select
                            name="projectType"
                            value={filters.projectType}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>All</option>
                            <option>3.5 kW</option>
                            <option>6.5 kW</option>
                            <option>10.5 kW</option>
                            <option>15 kW</option>
                            <option>20 kW</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Sub-Type</label>
                        <select
                            name="projectSubType"
                            value={filters.projectSubType}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>All</option>
                            <option>On-Grid</option>
                            <option>Off-Grid</option>
                            <option>Hybrid</option>
                        </select>
                    </div>
                </div>

                {/* Management Section */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Management</h3>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-4">
                            <nav className="flex space-x-8">
                                <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                                    Project Signup
                                </button>
                                <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                                    Project Management
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content - Project Signup */}
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md border-2 border-blue-400">
                                    <div className="p-6 text-center">
                                        <img src="../../assets/vendors/images/Layer_1 (2).svg" alt="Leads" className="w-10 h-10 mx-auto" />
                                        <h6 className="mt-3">Leads <span className="font-bold block">12</span></h6>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md border-2 border-blue-400">
                                    <div className="p-6 text-center">
                                        <img src="../../assets/vendors/images/survey.png" alt="Survey" className="w-10 h-10 mx-auto" />
                                        <h6 className="mt-3">Survey <span className="font-bold block">21</span></h6>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md border-2 border-blue-400">
                                    <div className="p-6 text-center">
                                        <img src="../../assets/vendors/images/Capa_1 (5).svg" alt="Quote" className="w-10 h-10 mx-auto" />
                                        <h6 className="mt-3">Quote <span className="font-bold block">2</span></h6>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md border-2 border-blue-400">
                                    <div className="p-6 text-center">
                                        <img src="../../assets/vendors/images/Layer_1 (2).svg" alt="Project SignUp" className="w-10 h-10 mx-auto" />
                                        <h6 className="mt-3">Project SignUp <span className="font-bold block">5</span></h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <h3 className="text-blue-600 text-xl font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h6 className="font-semibold">Survey</h6>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <div className="flex justify-between">
                                <small className="font-bold">75% Completed</small>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h6 className="font-semibold">Quote</h6>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">60%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <div className="flex justify-between">
                                <small className="font-bold">60% Completed</small>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h6 className="font-semibold">Project Signup</h6>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-600">50%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                            <div className="flex justify-between">
                                <small className="font-bold">50% Completed</small>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h6 className="font-semibold">Installation</h6>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-600">80%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <div className="flex justify-between">
                                <small className="font-bold">80% Completed</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue Tasks */}
                <div className="flex items-center mb-3">
                    <AlertTriangle className="text-red-500 mr-2" size={20} />
                    <h4 className="text-red-500 text-lg font-semibold">Overdue Tasks (10)</h4>
                </div>

                {/* Task Cards */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="p-6">
                        <div className="flex flex-wrap gap-4">
                            <div
                                onClick={() => handleTaskCardClick('quotes')}
                                className="cursor-pointer"
                            >
                                <div className="bg-green-500 text-white rounded-lg p-4">
                                    <div className="text-center">
                                        <h5 className="font-semibold">Quotes (3)</h5>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => handleTaskCardClick('signup')}
                                className="cursor-pointer"
                            >
                                <div className="bg-blue-500 text-white rounded-lg p-4">
                                    <div className="text-center">
                                        <h5 className="font-semibold">Project Signup (4)</h5>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => handleTaskCardClick('installation')}
                                className="cursor-pointer"
                            >
                                <div className="bg-yellow-500 text-gray-900 rounded-lg p-4">
                                    <div className="text-center">
                                        <h5 className="font-semibold">Installation (2)</h5>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => handleTaskCardClick('meters')}
                                className="cursor-pointer"
                            >
                                <div className="bg-blue-400 text-white rounded-lg p-4">
                                    <div className="text-center">
                                        <h5 className="font-semibold">Meters (1)</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Table */}
                {renderTaskTable()}

                {/* Users Section */}
                <h3 className="text-blue-600 text-xl font-semibold mb-3">Users</h3>
                <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">District</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Project Type</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9988774455</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john.doe@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dealer</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rajkot</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Residential</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jane Smith</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9988774455</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane.smith@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Commission Agent</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rajkot</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Residential</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Robert Johnson</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9988774455</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">robert.j@example.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dealer</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jamnagar</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Residential</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <h3 className="text-blue-600 text-xl font-semibold mb-3">Monthly Revenue</h3>

                {/* Date Filter */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quick Filter</label>
                                <select
                                    value={dateFilters.quickFilter}
                                    onChange={handleQuickFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Quick Filter</option>
                                    <option value="last_week">Last Week</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="last_year">Last Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateFilters.fromDate}
                                    onChange={(e) => setDateFilters({ ...dateFilters, fromDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateFilters.toDate}
                                    onChange={(e) => setDateFilters({ ...dateFilters, toDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <button
                                    onClick={() => alert('Filter applied! This would update the chart and data.')}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                        {dateRangeDisplay && (
                            <div className="mt-2 text-sm text-gray-600">{dateRangeDisplay}</div>
                        )}
                    </div>
                </div>

                {/* Revenue Charts and Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h5 className="text-lg font-semibold mb-4">Sales & Profit Overview</h5>
                            <div className="h-80">
                                <Chart
                                    options={chartOptions}
                                    series={chartOptions.series}
                                    type="bar"
                                    height="100%"
                                    width="100%"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h5 className="text-lg font-semibold mb-4">Revenue Summary</h5>

                            {/* Residential Projects */}
                            <div className="border-l-4 border-blue-500 mb-4 bg-white rounded-lg shadow-sm">
                                <div className="p-4">
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 rounded-full bg-blue-100 mr-3">
                                            <Home className="text-blue-500" size={20} />
                                        </div>
                                        <div>
                                            <h6 className="text-blue-500 font-semibold">Residential Projects</h6>
                                            <h4 className="text-blue-500 font-bold">₹650,000</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                                <span>On-Grid</span>
                                            </div>
                                            <span>12.5 kWh</span>
                                            <span>8 projects</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                <span>Off-Grid</span>
                                            </div>
                                            <span>25.25 kWh</span>
                                            <span>5 projects</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                                <span>Hybrid</span>
                                            </div>
                                            <span>15.75 kWh</span>
                                            <span>3 projects</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Commercial Projects */}
                            <div className="border-l-4 border-green-500 mb-4 bg-white rounded-lg shadow-sm">
                                <div className="p-4">
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 rounded-full bg-green-100 mr-3">
                                            <Building2 className="text-green-500" size={20} />
                                        </div>
                                        <div>
                                            <h6 className="text-green-500 font-semibold">Commercial Projects</h6>
                                            <h4 className="text-green-500 font-bold">₹350,000</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                                <span>On-Grid</span>
                                            </div>
                                            <span>25.0 kWh</span>
                                            <span>4 projects</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                <span>Off-Grid</span>
                                            </div>
                                            <span>12.5 kWh</span>
                                            <span>3 projects</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                                <span>Hybrid</span>
                                            </div>
                                            <span>5.25 kWh</span>
                                            <span>2 projects</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <h6 className="font-semibold">Total Revenue:</h6>
                                    <h5 className="text-blue-600 font-bold">₹1,000,000</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseDashboard;