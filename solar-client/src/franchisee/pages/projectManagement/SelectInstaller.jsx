import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import {
    Users,
    Star,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    Tool,
    Wrench,
    Calendar,
    DollarSign,
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
    ChevronDown,
    UserCheck,
    UserX,
    ThumbsUp,
    ThumbsDown,
    AlertCircle,
    Check,
    Shield,
    Zap
} from 'lucide-react';

const FranchiseProjectManagementSelectInstaller = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedInstaller, setSelectedInstaller] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSpecialty, setFilterSpecialty] = useState('all');

    // Installer Performance Chart Data
    const installerPerformanceData = {
        options: {
            chart: {
                type: 'radar',
                toolbar: {
                    show: false
                }
            },
            colors: ['#3B82F6'],
            labels: ['Quality', 'Speed', 'Communication', 'Safety', 'Customer Satisfaction', 'Reliability'],
            plotOptions: {
                radar: {
                    size: 140,
                    polygons: {
                        strokeColors: '#e9e9e9',
                        fill: {
                            colors: ['#f8f8f8', '#fff']
                        }
                    }
                }
            },
            title: {
                text: 'Top Installer Performance Metrics',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            markers: {
                size: 4,
                colors: ['#fff'],
                strokeColor: '#3B82F6',
                strokeWidth: 2
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + '/100'
                    }
                }
            },
            yaxis: {
                tickAmount: 5,
                labels: {
                    formatter: function (val, i) {
                        return val + '%'
                    }
                }
            }
        },
        series: [{
            name: 'Performance Score',
            data: [95, 88, 92, 98, 96, 94]
        }]
    };

    // Installer Workload Distribution
    const workloadData = {
        options: {
            chart: {
                type: 'bar',
                toolbar: {
                    show: true
                }
            },
            colors: ['#10B981', '#F59E0B', '#EF4444'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '50%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            title: {
                text: 'Installer Workload Distribution',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            xaxis: {
                categories: ['Active Projects', 'Completed (This Month)', 'Scheduled'],
                title: {
                    text: 'Number of Projects'
                }
            },
            legend: {
                position: 'top'
            }
        },
        series: [
            {
                name: 'Top Performers',
                data: [12, 18, 8]
            },
            {
                name: 'Average Performers',
                data: [25, 32, 15]
            },
            {
                name: 'New Installers',
                data: [8, 12, 10]
            }
        ]
    };

    // Installer Stats Component
    const InstallerStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm text-gray-500">Total Installers</p>
                        <p className="text-2xl font-bold text-gray-900">48</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                        <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm text-gray-500">Available Now</p>
                        <p className="text-2xl font-bold text-green-600">18</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm text-gray-500">On Project</p>
                        <p className="text-2xl font-bold text-orange-600">24</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm text-gray-500">Certified Experts</p>
                        <p className="text-2xl font-bold text-purple-600">32</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Installer Card Component
    const InstallerCard = ({ installer, onSelect, isSelected }) => {
        const statusColors = {
            'available': 'bg-green-100 text-green-800 border-green-200',
            'busy': 'bg-orange-100 text-orange-800 border-orange-200',
            'offline': 'bg-gray-100 text-gray-800 border-gray-200'
        };

        const ratingStars = (rating) => {
            return [...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ));
        };

        return (
            <div
                className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'
                    }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <div className="relative">
                            <img
                                src={`https://ui-avatars.com/api/?name=${installer.name.replace(' ', '+')}&size=64&background=3B82F6&color=fff`}
                                alt={installer.name}
                                className="w-16 h-16 rounded-full border-2 border-gray-200"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${installer.status === 'available' ? 'bg-green-500' :
                                    installer.status === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
                                }`} />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold text-gray-900">{installer.name}</h3>
                            <div className="flex items-center mt-1">
                                {ratingStars(installer.rating)}
                                <span className="ml-2 text-sm text-gray-600">({installer.reviews})</span>
                            </div>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors[installer.status]
                                }`}>
                                {installer.status.charAt(0).toUpperCase() + installer.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(installer)}
                        className={`p-2 rounded-full ${isSelected
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        {isSelected ? <Check className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                    </button>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {installer.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        {installer.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Zap className="w-4 h-4 mr-2 text-gray-400" />
                        {installer.specialty}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                        {installer.completedProjects} projects completed
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center">
                            <Shield className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-xs text-green-600 font-medium">Verified</span>
                        </div>
                    </div>
                </div>

                {/* Skills Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                    {installer.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {skill}
                        </span>
                    ))}
                    {installer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{installer.skills.length - 3}
                        </span>
                    )}
                </div>
            </div>
        );
    };

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
                            <Zap className="h-8 w-8 text-blue-500 mr-2" />
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
                                Installers
                            </a>
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Schedule
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
                                <Users className="mr-3 h-5 w-5 text-blue-500" />
                                Installers
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Calendar className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Schedule
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Documents
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Messages
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
                    <Users className="h-8 w-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Franchise Installer Management</h1>
                        <p className="mt-2 text-blue-100">Select and manage installers for your solar projects</p>
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

    // Sample Installers Data
    const installers = [
        {
            id: 1,
            name: 'Rajesh Kumar',
            rating: 5,
            reviews: 127,
            status: 'available',
            location: 'Mumbai, Maharashtra',
            experience: 8,
            specialty: 'Residential Solar Systems',
            completedProjects: 245,
            skills: ['Solar Panel Installation', 'Inverter Repair', 'Battery Systems', 'Maintenance'],
            phone: '+91 98765 43210',
            email: 'rajesh.k@example.com',
            certifications: ['NABCEP', 'SolarEdge Certified']
        },
        {
            id: 2,
            name: 'Priya Singh',
            rating: 4,
            reviews: 89,
            status: 'busy',
            location: 'Delhi NCR',
            experience: 5,
            specialty: 'Commercial Solar Projects',
            completedProjects: 156,
            skills: ['Commercial Installation', 'Project Management', 'Site Survey', 'Grid Connection'],
            phone: '+91 98765 43211',
            email: 'priya.s@example.com',
            certifications: ['NABCEP', 'SMA Certified']
        },
        {
            id: 3,
            name: 'Amit Patel',
            rating: 5,
            reviews: 203,
            status: 'available',
            location: 'Ahmedabad, Gujarat',
            experience: 10,
            specialty: 'Industrial Solar Solutions',
            completedProjects: 312,
            skills: ['Industrial Systems', 'Solar Pumping', 'Maintenance', 'Team Leadership'],
            phone: '+91 98765 43212',
            email: 'amit.p@example.com',
            certifications: ['Master Installer', 'Safety Certified']
        },
        {
            id: 4,
            name: 'Sunita Reddy',
            rating: 4,
            reviews: 67,
            status: 'offline',
            location: 'Hyderabad, Telangana',
            experience: 4,
            specialty: 'Residential Solar',
            completedProjects: 98,
            skills: ['Panel Installation', 'Customer Service', 'Troubleshooting'],
            phone: '+91 98765 43213',
            email: 'sunita.r@example.com',
            certifications: ['Entry Level Certified']
        },
        {
            id: 5,
            name: 'Vikram Mehta',
            rating: 5,
            reviews: 156,
            status: 'available',
            location: 'Pune, Maharashtra',
            experience: 7,
            specialty: 'Solar + Battery Storage',
            completedProjects: 189,
            skills: ['Battery Installation', 'Hybrid Systems', 'Smart Home Integration', 'Maintenance'],
            phone: '+91 98765 43214',
            email: 'vikram.m@example.com',
            certifications: ['Battery Specialist', 'TESLA Certified']
        },
        {
            id: 6,
            name: 'Anjali Desai',
            rating: 4,
            reviews: 112,
            status: 'busy',
            location: 'Bangalore, Karnataka',
            experience: 6,
            specialty: 'Commercial Rooftop',
            completedProjects: 134,
            skills: ['Rooftop Installation', 'Structural Analysis', 'Project Planning'],
            phone: '+91 98765 43215',
            email: 'anjali.d@example.com',
            certifications: ['Commercial Specialist']
        }
    ];

    // Filter installers based on search and filters
    const filteredInstallers = installers.filter(installer => {
        const matchesSearch = installer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            installer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            installer.specialty.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || installer.status === filterStatus;

        const matchesSpecialty = filterSpecialty === 'all' ||
            installer.specialty.toLowerCase().includes(filterSpecialty.toLowerCase());

        return matchesSearch && matchesStatus && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <NavigationBar username="Yash" role="franchisee" />

            <div className="flex relative">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Installer Stats */}
                        <InstallerStats />

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Performance Radar Chart */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={installerPerformanceData.options}
                                    series={installerPerformanceData.series}
                                    type="radar"
                                    height={350}
                                />
                            </div>

                            {/* Workload Distribution */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={workloadData.options}
                                    series={workloadData.series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search installers by name, location, or specialty..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>

                                {/* Specialty Filter */}
                                <div className="flex items-center space-x-2">
                                    <Tool className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={filterSpecialty}
                                        onChange={(e) => setFilterSpecialty(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Specialties</option>
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="industrial">Industrial</option>
                                        <option value="battery">Battery Storage</option>
                                    </select>
                                </div>

                                {/* Selected Installer Info */}
                                {selectedInstaller && (
                                    <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                                        <UserCheck className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="text-sm text-blue-700">
                                            Selected: {selectedInstaller.name}
                                        </span>
                                        <button
                                            onClick={() => setSelectedInstaller(null)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Installers Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {filteredInstallers.map(installer => (
                                <InstallerCard
                                    key={installer.id}
                                    installer={installer}
                                    onSelect={setSelectedInstaller}
                                    isSelected={selectedInstaller?.id === installer.id}
                                />
                            ))}
                        </div>

                        {/* Assignment Section (shown when installer is selected) */}
                        {selectedInstaller && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-500">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
                                    Assign Project to {selectedInstaller.name}
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Available Projects */}
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-3">Available Projects</h3>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'PRJ-001', name: 'Residential Solar - Patel', size: '7kW', date: '2024-02-20', priority: 'High' },
                                                { id: 'PRJ-002', name: 'Commercial - Sharma Industries', size: '50kW', date: '2024-02-22', priority: 'Medium' },
                                                { id: 'PRJ-003', name: 'Residential - Kumar Villa', size: '10kW', date: '2024-02-25', priority: 'Low' },
                                            ].map((project, idx) => (
                                                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{project.name}</p>
                                                            <p className="text-sm text-gray-500">Project ID: {project.id}</p>
                                                            <div className="flex items-center mt-2 space-x-4">
                                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{project.size}</span>
                                                                <span className="text-xs text-gray-500">Due: {project.date}</span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${project.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                        project.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {project.priority} Priority
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                            Assign
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Installer Schedule */}
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-3">Installer Schedule</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Current Projects</span>
                                                    <span className="font-medium">{selectedInstaller.completedProjects} completed</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Upcoming Schedule</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Today</span>
                                                            <span className="text-gray-900">Project at Green Valley</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Tomorrow</span>
                                                            <span className="text-gray-900">Site Survey - Sunshine Homes</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Feb 20</span>
                                                            <span className="text-gray-900">Installation - Patel Residence</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                    Confirm Assignment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Installer Performance Table */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Installer Performance Overview</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Delivery</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {installers.map((installer, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${installer.name.replace(' ', '+')}&size=32&background=3B82F6&color=fff`}
                                                            alt={installer.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{installer.name}</p>
                                                            <p className="text-xs text-gray-500">{installer.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{installer.specialty}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{installer.completedProjects}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="ml-1 text-sm text-gray-900">{installer.rating}.0</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 mr-2">98%</span>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 mr-2">95%</span>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => setSelectedInstaller(installer)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        Select
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default FranchiseProjectManagementSelectInstaller;