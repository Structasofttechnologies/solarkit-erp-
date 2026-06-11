import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import {
    DollarSign,
    CreditCard,
    Wallet,
    TrendingUp,
    TrendingDown,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Briefcase,
    FileText,
    MessageSquare,
    Search,
    Filter,
    Download,
    Printer,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap,
    Users,
    MapPin,
    Receipt,
    Banknote,
    Percent,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Download as DownloadIcon,
    Eye,
    Send,
    MoreVertical
} from 'lucide-react';

const FranchiseProjectManagementPayment = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [dateRange, setDateRange] = useState('month');

    // Revenue Chart Data
    const revenueChartData = {
        options: {
            chart: {
                type: 'area',
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            },
            colors: ['#3B82F6', '#10B981'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            title: {
                text: 'Revenue Overview',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3
                }
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                title: {
                    text: 'Month'
                }
            },
            yaxis: {
                title: {
                    text: 'Amount ($)'
                },
                labels: {
                    formatter: (val) => `$${val.toLocaleString()}`
                }
            },
            tooltip: {
                y: {
                    formatter: (val) => `$${val.toLocaleString()}`
                }
            },
            legend: {
                position: 'top'
            }
        },
        series: [
            {
                name: 'Revenue',
                data: [45000, 52000, 48000, 58000, 62000, 68000, 72000, 78000, 82000, 88000, 92000, 98000]
            },
            {
                name: 'Projections',
                data: [46000, 53000, 50000, 60000, 64000, 70000, 75000, 80000, 85000, 90000, 95000, 100000]
            }
        ]
    };

    // Payment Distribution Chart
    const paymentDistributionData = {
        options: {
            chart: {
                type: 'donut',
            },
            labels: ['Completed', 'Pending', 'Overdue', 'Partial', 'Upcoming'],
            colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'],
            legend: {
                position: 'bottom'
            },
            title: {
                text: 'Payment Status Distribution',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function () {
                                    return '$847K'
                                }
                            }
                        }
                    }
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        },
        series: [385000, 245000, 87000, 78000, 52000]
    };

    // Payment Methods Chart
    const paymentMethodsData = {
        options: {
            chart: {
                type: 'pie',
            },
            labels: ['Bank Transfer', 'Credit Card', 'Check', 'Cash', 'Financing'],
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
            legend: {
                position: 'bottom'
            },
            title: {
                text: 'Payment Methods',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        },
        series: [325000, 245000, 156000, 87000, 34000]
    };

    // Monthly Collection Chart
    const monthlyCollectionData = {
        options: {
            chart: {
                type: 'bar',
                toolbar: {
                    show: true
                }
            },
            colors: ['#3B82F6', '#10B981', '#F59E0B'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 5,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val) => `$${val / 1000}k`,
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ['#304758']
                }
            },
            title: {
                text: 'Monthly Collection Overview',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            },
            yaxis: {
                title: {
                    text: 'Amount ($)'
                },
                labels: {
                    formatter: (val) => `$${val / 1000}k`
                }
            },
            tooltip: {
                y: {
                    formatter: (val) => `$${val.toLocaleString()}`
                }
            },
            legend: {
                position: 'top'
            }
        },
        series: [
            {
                name: 'Collected',
                data: [45000, 52000, 48000, 58000, 62000, 68000]
            },
            {
                name: 'Pending',
                data: [15000, 18000, 12000, 22000, 18000, 24000]
            },
            {
                name: 'Overdue',
                data: [8000, 6000, 5000, 7000, 9000, 11000]
            }
        ]
    };

    // Stats Card Component
    const StatCard = ({ icon: Icon, title, value, change, bgColor, subtext, trend }) => (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
                            {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
                            {change}
                        </p>
                    )}
                    {subtext && (
                        <p className="text-xs text-gray-500 mt-1">{subtext}</p>
                    )}
                </div>
                <div className={`${bgColor} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'overdue': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            'partial': { color: 'bg-blue-100 text-blue-800', icon: DollarSign },
            'upcoming': { color: 'bg-purple-100 text-purple-800', icon: Calendar }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Payment Card Component
    const PaymentCard = ({ payment, onSelect, isSelected }) => (
        <div
            className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'
                }`}
            onClick={() => onSelect(payment)}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">{payment.project}</h3>
                    <p className="text-sm text-gray-500 mt-1">Invoice: {payment.invoice}</p>
                </div>
                <StatusBadge status={payment.status} />
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Client</span>
                    <span className="text-sm font-medium text-gray-900">{payment.client}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold text-gray-900">${payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Paid</span>
                    <span className="text-sm font-medium text-green-600">${payment.paid.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Due Date</span>
                    <span className={`text-sm font-medium ${payment.status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                        {payment.dueDate}
                    </span>
                </div>
            </div>

            {/* Progress Bar for payment */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Payment Progress</span>
                    <span className="text-xs font-medium text-gray-900">
                        {Math.round((payment.paid / payment.amount) * 100)}%
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${(payment.paid / payment.amount) >= 1 ? 'bg-green-500' :
                                (payment.paid / payment.amount) >= 0.5 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                        style={{ width: `${(payment.paid / payment.amount) * 100}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {payment.method}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );

    // Navigation Bar Component
    const NavigationBar = ({ username, role }) => (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-shrink-0 flex items-center">
                            <DollarSign className="h-8 w-8 text-blue-500 mr-2" />
                            <span className="text-xl font-bold text-gray-800">SolarKit CRM</span>
                        </div>
                        <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Dashboard
                            </a>
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Projects
                            </a>
                            <a href="#" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Payments
                            </a>
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Reports
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-sm text-gray-700 mr-2">Welcome, {username}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{role}</span>
                        </div>
                        <button className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                            <Settings className="h-6 w-6" />
                        </button>
                        <button className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );

    // Sidebar Component
    const Sidebar = ({ isOpen, onClose }) => (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
        fixed inset-y-0 left-0 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        transition duration-200 ease-in-out
        w-64 bg-white border-r border-gray-200 z-30
      `}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <span className="text-lg font-semibold text-gray-800">Menu</span>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="px-2 space-y-1">
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Dashboard
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Briefcase className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Projects
                            </a>
                            <a href="#" className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <DollarSign className="mr-3 h-5 w-5 text-blue-500" />
                                Payments
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Clients
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Receipt className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Invoices
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Reports
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Messages
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Settings
                            </a>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );

    // Header Component
    const Header = () => (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center">
                    <DollarSign className="h-8 w-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Payment Management</h1>
                        <p className="mt-2 text-blue-100">Track and manage all project payments and transactions</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Footer Component
    const Footer = () => (
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} SolarKit CRM. All rights reserved.
                </p>
            </div>
        </footer>
    );

    // Sample Payments Data
    const payments = [
        {
            id: 'PAY-001',
            invoice: 'INV-2024-001',
            project: 'Patel Residence Solar Installation',
            client: 'Rajesh Patel',
            amount: 8500,
            paid: 8500,
            status: 'completed',
            dueDate: '2024-02-15',
            method: 'Bank Transfer',
            date: '2024-02-10',
            transactionId: 'TXN123456789'
        },
        {
            id: 'PAY-002',
            invoice: 'INV-2024-002',
            project: 'Sharma Home Solar System',
            client: 'Priya Sharma',
            amount: 6200,
            paid: 3100,
            status: 'partial',
            dueDate: '2024-02-20',
            method: 'Credit Card',
            date: '2024-02-05',
            transactionId: 'TXN123456790'
        },
        {
            id: 'PAY-003',
            invoice: 'INV-2024-003',
            project: 'Green Tech Office Building',
            client: 'Amit Kumar',
            amount: 12500,
            paid: 0,
            status: 'pending',
            dueDate: '2024-02-25',
            method: 'Check',
            date: '2024-02-01',
            transactionId: null
        },
        {
            id: 'PAY-004',
            invoice: 'INV-2024-004',
            project: 'Sunrise Factory Solar Plant',
            client: 'Neha Singh',
            amount: 18000,
            paid: 9000,
            status: 'partial',
            dueDate: '2024-02-10',
            method: 'Bank Transfer',
            date: '2024-02-08',
            transactionId: 'TXN123456791'
        },
        {
            id: 'PAY-005',
            invoice: 'INV-2024-005',
            project: 'Kumar Villa Solar + Battery',
            client: 'Vikram Mehta',
            amount: 15000,
            paid: 0,
            status: 'overdue',
            dueDate: '2024-02-01',
            method: 'Financing',
            date: '2024-01-15',
            transactionId: null
        },
        {
            id: 'PAY-006',
            invoice: 'INV-2024-006',
            project: 'Power Industries Solar Project',
            client: 'Anita Desai',
            amount: 22000,
            paid: 22000,
            status: 'completed',
            dueDate: '2024-02-05',
            method: 'Bank Transfer',
            date: '2024-02-03',
            transactionId: 'TXN123456792'
        },
        {
            id: 'PAY-007',
            invoice: 'INV-2024-007',
            project: 'Sharma Industries Commercial',
            client: 'Suresh Reddy',
            amount: 18500,
            paid: 9250,
            status: 'partial',
            dueDate: '2024-02-18',
            method: 'Credit Card',
            date: '2024-02-12',
            transactionId: 'TXN123456793'
        },
        {
            id: 'PAY-008',
            invoice: 'INV-2024-008',
            project: 'Desai Residence',
            client: 'Deepa Nair',
            amount: 7200,
            paid: 7200,
            status: 'completed',
            dueDate: '2024-02-12',
            method: 'Cash',
            date: '2024-02-10',
            transactionId: 'TXN123456794'
        }
    ];

    // Calculate summary stats
    const totalRevenue = payments.reduce((acc, p) => acc + p.paid, 0);
    const totalPending = payments.reduce((acc, p) => acc + (p.amount - p.paid), 0);
    const totalOverdue = payments.filter(p => p.status === 'overdue')
        .reduce((acc, p) => acc + (p.amount - p.paid), 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;
    const collectionRate = ((totalRevenue / (totalRevenue + totalPending)) * 100).toFixed(1);

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.invoice.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <NavigationBar username="Yash" role="franchisee" />

            <div className="flex relative">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                icon={DollarSign}
                                title="Total Revenue"
                                value={`$${totalRevenue.toLocaleString()}`}
                                change="+18.2% from last month"
                                bgColor="bg-blue-500"
                                subtext="Year to date"
                                trend="up"
                            />
                            <StatCard
                                icon={Wallet}
                                title="Pending Payments"
                                value={`$${totalPending.toLocaleString()}`}
                                change="12 invoices"
                                bgColor="bg-orange-500"
                                subtext="Awaiting collection"
                            />
                            <StatCard
                                icon={AlertCircle}
                                title="Overdue"
                                value={`$${totalOverdue.toLocaleString()}`}
                                change="3 overdue invoices"
                                bgColor="bg-red-500"
                                subtext="Requires attention"
                                trend="down"
                            />
                            <StatCard
                                icon={Percent}
                                title="Collection Rate"
                                value={`${collectionRate}%`}
                                change={`${completedCount} completed payments`}
                                bgColor="bg-green-500"
                                subtext="This month"
                                trend="up"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Revenue Chart */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={revenueChartData.options}
                                    series={revenueChartData.series}
                                    type="area"
                                    height={350}
                                />
                            </div>

                            {/* Payment Distribution */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={paymentDistributionData.options}
                                    series={paymentDistributionData.series}
                                    type="donut"
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Second Row Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Payment Methods */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={paymentMethodsData.options}
                                    series={paymentMethodsData.series}
                                    type="pie"
                                    height={350}
                                />
                            </div>

                            {/* Monthly Collection */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={monthlyCollectionData.options}
                                    series={monthlyCollectionData.series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                {/* Search and Filters */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search payments..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="flex items-center space-x-2">
                                        <Filter className="w-5 h-5 text-gray-400" />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                            <option value="partial">Partial</option>
                                            <option value="overdue">Overdue</option>
                                        </select>
                                    </div>

                                    {/* Date Range */}
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="quarter">This Quarter</option>
                                            <option value="year">This Year</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </button>
                                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                    </button>
                                    <button className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Payments Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {filteredPayments.map(payment => (
                                <PaymentCard
                                    key={payment.id}
                                    payment={payment}
                                    onSelect={setSelectedPayment}
                                    isSelected={selectedPayment?.id === payment.id}
                                />
                            ))}
                        </div>

                        {/* Payment Details Modal/Panel */}
                        {selectedPayment && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Payment Details: {selectedPayment.invoice}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedPayment(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Payment Info */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Invoice Number</p>
                                                <p className="font-medium">{selectedPayment.invoice}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Transaction ID</p>
                                                <p className="font-medium">{selectedPayment.transactionId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Payment Date</p>
                                                <p className="font-medium">{selectedPayment.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Due Date</p>
                                                <p className={`font-medium ${selectedPayment.status === 'overdue' ? 'text-red-600' : ''
                                                    }`}>
                                                    {selectedPayment.dueDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Payment Method</p>
                                                <p className="font-medium">{selectedPayment.method}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <StatusBadge status={selectedPayment.status} />
                                            </div>
                                        </div>

                                        {/* Project Details */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="font-medium text-gray-900 mb-2">Project Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Project</p>
                                                    <p className="font-medium">{selectedPayment.project}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Client</p>
                                                    <p className="font-medium">{selectedPayment.client}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Timeline */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="font-medium text-gray-900 mb-2">Payment Timeline</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">Invoice Created</p>
                                                        <p className="text-xs text-gray-500">{selectedPayment.date}</p>
                                                    </div>
                                                </div>
                                                {selectedPayment.paid > 0 && (
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <DollarSign className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">Payment Received</p>
                                                            <p className="text-xs text-gray-500">${selectedPayment.paid.toLocaleString()} on {selectedPayment.date}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedPayment.status === 'pending' && (
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-yellow-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">Awaiting Payment</p>
                                                            <p className="text-xs text-gray-500">Due by {selectedPayment.dueDate}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                                        <div className="space-y-2">
                                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Record Payment
                                            </button>
                                            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Send Invoice
                                            </button>
                                            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Send Reminder
                                            </button>
                                            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Download Receipt
                                            </button>
                                            <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                                                View Project
                                            </button>
                                        </div>

                                        {selectedPayment.status === 'overdue' && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800 font-medium flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    Payment Overdue
                                                </p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    This payment is past due. Send a reminder or contact the client.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payments Table */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                    + New Payment
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPayments.map((payment, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{payment.invoice}</p>
                                                        <p className="text-xs text-gray-500">{payment.id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-gray-900">{payment.project}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.client}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    ${payment.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 mr-2">
                                                            ${payment.paid.toLocaleString()}
                                                        </span>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-full rounded-full ${(payment.paid / payment.amount) >= 1 ? 'bg-green-500' :
                                                                        (payment.paid / payment.amount) >= 0.5 ? 'bg-blue-500' : 'bg-orange-500'
                                                                    }`}
                                                                style={{ width: `${(payment.paid / payment.amount) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={payment.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm ${payment.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'
                                                        }`}>
                                                        {payment.dueDate}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-900 mr-3">
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900">
                                                        <DownloadIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing 1 to {filteredPayments.length} of {payments.length} entries
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">Previous</button>
                                    <button className="px-3 py-1 border rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600">1</button>
                                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">2</button>
                                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">3</button>
                                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default FranchiseProjectManagementPayment;