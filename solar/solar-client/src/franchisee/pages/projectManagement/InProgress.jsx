import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import {
    Clock,
    Users,
    MapPin,
    Calendar,
    TrendingUp,
    Activity,
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
    CheckCircle,
    AlertCircle,
    Zap,
    Sun,
    Battery,
    Wrench,
    Truck,
    ClipboardList,
    PlayCircle,
    PauseCircle,
    Percent,
    DollarSign,
    BarChart3
} from 'lucide-react';

const FranchiseProjectManagementInProgress = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPhase, setFilterPhase] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);

    // Project Progress Chart Data
    const projectProgressData = {
        options: {
            chart: {
                type: 'line',
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            },
            colors: ['#3B82F6', '#F59E0B', '#10B981'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            title: {
                text: 'Active Projects Progress Tracking',
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
            markers: {
                size: 5
            },
            xaxis: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                title: {
                    text: 'Timeline'
                }
            },
            yaxis: {
                title: {
                    text: 'Completion %'
                },
                max: 100,
                labels: {
                    formatter: (val) => val + '%'
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            }
        },
        series: [
            {
                name: 'Residential Projects',
                data: [15, 28, 42, 55, 68, 79, 88, 95]
            },
            {
                name: 'Commercial Projects',
                data: [10, 22, 35, 48, 60, 72, 83, 90]
            },
            {
                name: 'Industrial Projects',
                data: [8, 18, 30, 42, 54, 65, 75, 85]
            }
        ]
    };

    // Phase Distribution Chart
    const phaseDistributionData = {
        options: {
            chart: {
                type: 'bar',
                stacked: true,
                toolbar: {
                    show: true
                }
            },
            colors: ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '60%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            title: {
                text: 'Projects by Phase',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            xaxis: {
                categories: ['Site Survey', 'Design', 'Permitting', 'Installation', 'Inspection', 'Commissioning'],
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
                name: 'Residential',
                data: [12, 15, 18, 22, 16, 10]
            },
            {
                name: 'Commercial',
                data: [8, 10, 12, 15, 11, 7]
            },
            {
                name: 'Industrial',
                data: [4, 6, 8, 10, 7, 4]
            }
        ]
    };

    // Timeline Chart
    const timelineData = {
        options: {
            chart: {
                type: 'rangeBar',
                toolbar: {
                    show: true
                }
            },
            colors: ['#3B82F6', '#10B981', '#F59E0B'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '50%',
                    rangeBarGroupRows: true
                }
            },
            title: {
                text: 'Project Timeline - Top 5 Active Projects',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#263238'
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'dd MMM'
                }
            },
            yaxis: {
                reversed: true
            },
            tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    const from = new Date(w.config.series[seriesIndex].data[dataPointIndex].x[0]);
                    const to = new Date(w.config.series[seriesIndex].data[dataPointIndex].x[1]);
                    return (
                        '<div class="p-2">' +
                        '<span class="font-medium">' + w.config.series[seriesIndex].data[dataPointIndex].y + '</span><br>' +
                        'Start: ' + from.toLocaleDateString() + '<br>' +
                        'End: ' + to.toLocaleDateString() +
                        '</div>'
                    );
                }
            }
        },
        series: [
            {
                name: 'Residential',
                data: [
                    {
                        x: [new Date('2024-02-01').getTime(), new Date('2024-02-15').getTime()],
                        y: 'Patel Residence'
                    },
                    {
                        x: [new Date('2024-02-05').getTime(), new Date('2024-02-20').getTime()],
                        y: 'Sharma Home'
                    }
                ]
            },
            {
                name: 'Commercial',
                data: [
                    {
                        x: [new Date('2024-02-03').getTime(), new Date('2024-02-18').getTime()],
                        y: 'Green Tech Office'
                    }
                ]
            },
            {
                name: 'Industrial',
                data: [
                    {
                        x: [new Date('2024-02-10').getTime(), new Date('2024-02-28').getTime()],
                        y: 'Sunrise Factory'
                    },
                    {
                        x: [new Date('2024-02-15').getTime(), new Date('2024-03-05').getTime()],
                        y: 'Power Industries'
                    }
                ]
            }
        ]
    };

    // Stats Card Component
    const StatCard = ({ icon: Icon, title, value, change, bgColor, subtext }) => (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {change && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                            <TrendingUp className="inline w-4 h-4 mr-1" />
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

    // Phase Badge Component
    const PhaseBadge = ({ phase }) => {
        const phaseConfig = {
            'Site Survey': { color: 'bg-purple-100 text-purple-800', icon: MapPin },
            'Design': { color: 'bg-blue-100 text-blue-800', icon: ClipboardList },
            'Permitting': { color: 'bg-orange-100 text-orange-800', icon: FileText },
            'Installation': { color: 'bg-green-100 text-green-800', icon: Wrench },
            'Inspection': { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
            'Commissioning': { color: 'bg-indigo-100 text-indigo-800', icon: Zap },
            'On Hold': { color: 'bg-red-100 text-red-800', icon: PauseCircle },
            'In Progress': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle }
        };

        const config = phaseConfig[phase] || phaseConfig['In Progress'];
        const Icon = config.icon;

        return (
            <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {phase}
            </span>
        );
    };

    // Progress Bar Component
    const ProgressBar = ({ progress, showLabel = true }) => (
        <div className="flex items-center">
            {showLabel && <span className="text-sm text-gray-600 mr-2">{progress}%</span>}
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${progress >= 75 ? 'bg-green-500' :
                        progress >= 50 ? 'bg-blue-500' :
                            progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );

    // Project Card Component
    const ProjectCard = ({ project, onSelect, isSelected }) => (
        <div
            className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200'
                }`}
            onClick={() => onSelect(project)}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: {project.id}</p>
                </div>
                <PhaseBadge phase={project.phase} />
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {project.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {project.installer}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Started: {project.startDate} | Target: {project.targetDate}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Sun className="w-4 h-4 mr-2 text-gray-400" />
                    System: {project.systemSize} | {project.type}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                </div>
                <ProgressBar progress={project.progress} showLabel={false} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            Phase {project.phaseNumber}/6
                        </span>
                        {project.delay > 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {project.delay} days delay
                            </span>
                        )}
                    </div>
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
                            <Zap className="h-8 w-8 text-green-500 mr-2" />
                            <span className="text-xl font-bold text-gray-800">SolarKit CRM</span>
                        </div>
                        <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Dashboard
                            </a>
                            <a href="#" className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                In Progress
                            </a>
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Completed
                            </a>
                            <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Schedule
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-sm text-gray-700 mr-2">Welcome, {username}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{role}</span>
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
                            <a href="#" className="bg-green-50 text-green-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <PlayCircle className="mr-3 h-5 w-5 text-green-500" />
                                In Progress
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <CheckCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Completed
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Calendar className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Schedule
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Installers
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Documents
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Messages
                            </a>
                            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                <BarChart3 className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Analytics
                            </a>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );

    // Header Component
    const Header = () => (
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center">
                    <PlayCircle className="h-8 w-8 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold">Projects In Progress</h1>
                        <p className="mt-2 text-green-100">Track and manage active solar installation projects</p>
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

    // Sample Projects Data
    const projects = [
        {
            id: 'PRJ-001',
            name: 'Patel Residence Solar Installation',
            type: 'Residential',
            location: 'Mumbai, Maharashtra',
            installer: 'Rajesh Kumar',
            phase: 'Installation',
            phaseNumber: 4,
            progress: 65,
            startDate: '2024-02-01',
            targetDate: '2024-02-28',
            systemSize: '7kW',
            delay: 0,
            team: ['Rajesh Kumar', 'Amit Singh'],
            priority: 'High'
        },
        {
            id: 'PRJ-002',
            name: 'Sharma Home Solar System',
            type: 'Residential',
            location: 'Delhi NCR',
            installer: 'Priya Singh',
            phase: 'Permitting',
            phaseNumber: 3,
            progress: 40,
            startDate: '2024-02-05',
            targetDate: '2024-03-10',
            systemSize: '5kW',
            delay: 2,
            team: ['Priya Singh', 'Vikram Mehta'],
            priority: 'Medium'
        },
        {
            id: 'PRJ-003',
            name: 'Green Tech Office Building',
            type: 'Commercial',
            location: 'Bangalore, Karnataka',
            installer: 'Anjali Desai',
            phase: 'Design',
            phaseNumber: 2,
            progress: 25,
            startDate: '2024-02-03',
            targetDate: '2024-03-20',
            systemSize: '50kW',
            delay: 0,
            team: ['Anjali Desai', 'Sunita Reddy'],
            priority: 'High'
        },
        {
            id: 'PRJ-004',
            name: 'Sunrise Factory Solar Plant',
            type: 'Industrial',
            location: 'Pune, Maharashtra',
            installer: 'Vikram Mehta',
            phase: 'Site Survey',
            phaseNumber: 1,
            progress: 15,
            startDate: '2024-02-10',
            targetDate: '2024-04-15',
            systemSize: '150kW',
            delay: 0,
            team: ['Vikram Mehta', 'Amit Patel'],
            priority: 'Low'
        },
        {
            id: 'PRJ-005',
            name: 'Kumar Villa Solar + Battery',
            type: 'Residential',
            location: 'Ahmedabad, Gujarat',
            installer: 'Amit Patel',
            phase: 'Inspection',
            phaseNumber: 5,
            progress: 85,
            startDate: '2024-01-20',
            targetDate: '2024-02-20',
            systemSize: '10kW + 13.5kWh',
            delay: 5,
            team: ['Amit Patel', 'Rajesh Kumar'],
            priority: 'High'
        },
        {
            id: 'PRJ-006',
            name: 'Power Industries Solar Project',
            type: 'Industrial',
            location: 'Hyderabad, Telangana',
            installer: 'Sunita Reddy',
            phase: 'Installation',
            phaseNumber: 4,
            progress: 55,
            startDate: '2024-02-15',
            targetDate: '2024-04-30',
            systemSize: '200kW',
            delay: 0,
            team: ['Sunita Reddy', 'Anjali Desai'],
            priority: 'Medium'
        },
        {
            id: 'PRJ-007',
            name: 'Sharma Industries Commercial',
            type: 'Commercial',
            location: 'Chennai, Tamil Nadu',
            installer: 'Priya Singh',
            phase: 'Commissioning',
            phaseNumber: 6,
            progress: 95,
            startDate: '2024-01-10',
            targetDate: '2024-02-15',
            systemSize: '75kW',
            delay: 0,
            team: ['Priya Singh', 'Vikram Mehta'],
            priority: 'High'
        },
        {
            id: 'PRJ-008',
            name: 'Desai Residence',
            type: 'Residential',
            location: 'Surat, Gujarat',
            installer: 'Amit Patel',
            phase: 'On Hold',
            phaseNumber: 3,
            progress: 30,
            startDate: '2024-01-25',
            targetDate: '2024-03-01',
            systemSize: '7kW',
            delay: 12,
            team: ['Amit Patel'],
            priority: 'Low'
        }
    ];

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.installer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPhase = filterPhase === 'all' || project.phase === filterPhase;

        return matchesSearch && matchesPhase;
    });

    // Get unique phases for filter
    const phases = [...new Set(projects.map(p => p.phase))];

    // Calculate stats
    const totalActive = projects.length;
    const onTrack = projects.filter(p => p.delay === 0).length;
    const delayed = projects.filter(p => p.delay > 0).length;
    const avgProgress = Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length);

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
                                icon={PlayCircle}
                                title="Active Projects"
                                value={totalActive}
                                change="+3 this week"
                                bgColor="bg-green-500"
                                subtext="Currently in progress"
                            />
                            <StatCard
                                icon={CheckCircle}
                                title="On Track"
                                value={onTrack}
                                change={`${Math.round((onTrack / totalActive) * 100)}% of total`}
                                bgColor="bg-blue-500"
                                subtext="No delays"
                            />
                            <StatCard
                                icon={AlertCircle}
                                title="Delayed"
                                value={delayed}
                                change="Requires attention"
                                bgColor="bg-red-500"
                                subtext={`Avg. delay: ${Math.round(projects.filter(p => p.delay > 0).reduce((acc, p) => acc + p.delay, 0) / delayed) || 0} days`}
                            />
                            <StatCard
                                icon={Percent}
                                title="Avg. Progress"
                                value={`${avgProgress}%`}
                                change="+12% from last month"
                                bgColor="bg-purple-500"
                                subtext="Overall completion"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Progress Tracking Chart */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={projectProgressData.options}
                                    series={projectProgressData.series}
                                    type="line"
                                    height={350}
                                />
                            </div>

                            {/* Phase Distribution Chart */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <Chart
                                    options={phaseDistributionData.options}
                                    series={phaseDistributionData.series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Timeline Chart */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                            <Chart
                                options={timelineData.options}
                                series={timelineData.series}
                                type="rangeBar"
                                height={400}
                            />
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search projects by name, location, or installer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Phase Filter */}
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={filterPhase}
                                        onChange={(e) => setFilterPhase(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="all">All Phases</option>
                                        {phases.map(phase => (
                                            <option key={phase} value={phase}>{phase}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <option>Progress</option>
                                        <option>Start Date</option>
                                        <option>Target Date</option>
                                        <option>Priority</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onSelect={setSelectedProject}
                                    isSelected={selectedProject?.id === project.id}
                                />
                            ))}
                        </div>

                        {/* Detailed Project View (shown when project is selected) */}
                        {selectedProject && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-green-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Project Details: {selectedProject.name}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedProject(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Project Info */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Project ID</p>
                                                <p className="font-medium">{selectedProject.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Type</p>
                                                <p className="font-medium">{selectedProject.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-medium">{selectedProject.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">System Size</p>
                                                <p className="font-medium">{selectedProject.systemSize}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Start Date</p>
                                                <p className="font-medium">{selectedProject.startDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Target Completion</p>
                                                <p className="font-medium">{selectedProject.targetDate}</p>
                                            </div>
                                        </div>

                                        {/* Team */}
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Installation Team</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.team.map((member, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                        {member}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Progress Details */}
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Phase Progress</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Site Survey</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 1 ? '✓' : selectedProject.phaseNumber === 0 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Design</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 2 ? '✓' : selectedProject.phaseNumber === 1 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Permitting</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 3 ? '✓' : selectedProject.phaseNumber === 2 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Installation</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 4 ? '✓' : selectedProject.phaseNumber === 3 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Inspection</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 5 ? '✓' : selectedProject.phaseNumber === 4 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Commissioning</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedProject.phaseNumber >= 6 ? '✓' : selectedProject.phaseNumber === 5 ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                                        <div className="space-y-2">
                                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Update Progress
                                            </button>
                                            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Add Milestone
                                            </button>
                                            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Report Issue
                                            </button>
                                            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                View Documents
                                            </button>
                                            <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                                                Contact Installer
                                            </button>
                                        </div>

                                        {selectedProject.delay > 0 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800 font-medium flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    Project Delayed by {selectedProject.delay} Days
                                                </p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    Review timeline and take necessary actions
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Projects Table */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Active Projects</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProjects.map((project, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                                                        <p className="text-xs text-gray-500">{project.id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.installer}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <PhaseBadge phase={project.phase} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-32">
                                                        <ProgressBar progress={project.progress} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.startDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.targetDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {project.delay > 0 ? (
                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                            Delayed
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            On Track
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => setSelectedProject(project)}
                                                        className="text-green-600 hover:text-green-900 mr-3"
                                                    >
                                                        View
                                                    </button>
                                                    <button className="text-blue-600 hover:text-blue-900">Update</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing 1 to {filteredProjects.length} of {projects.length} entries
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">Previous</button>
                                    <button className="px-3 py-1 border rounded-md text-sm bg-green-500 text-white hover:bg-green-600">1</button>
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

export default FranchiseProjectManagementInProgress;