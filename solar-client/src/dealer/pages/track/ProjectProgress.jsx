import React, { useState, useEffect } from 'react';
import {
    Search,
    MapPin,
    Calendar,
    CheckCircle,
    Clock,
    Zap,
    Sun,
    Battery,
    Home,
    Building2,
    Factory,
    Award,
    TrendingUp,
    Filter,
    X,
    ChevronDown,
    User,
    Phone,
    Mail,
    Settings,
    Wrench,
    Play,
    Flag,
    Folder // Added Folder icon
} from 'lucide-react';

import { getAllProjects } from '../../services/projectApi';

const DealerTrackProjectProgress = () => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        completed: 0,
        inProgress: 0,
        commission: '₹0',
        systemCapacity: '0 kW'
    });

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        subCategory: 'all',
        projectType: 'all',
        subProjectType: 'all'
    });

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllProjects();
                if (response.success) {
                    const data = response.data;

                    // Process data to map to UI
                    const mappedProjects = data.map(p => {
                        let status = 'signup';
                        if (p.status === 'Completed') {
                            status = 'completed';
                        } else {
                            // Map steps to status
                            // Residential: 1=Signup, 2=Feasibility, 3=Installation, 4=Meter, 5=Subsidy(Completed)
                            // Commercial: 1=Signup, 2=Feasibility, 3=Installation, 4=Meter(Completed)
                            const step = p.currentStep || 1;
                            if (step >= 4) status = 'commissioned';
                            else if (step >= 3) status = 'installation';
                            else status = 'signup';
                        }

                        return {
                            id: p._id,
                            name: p.projectName,
                            address: p.address || p.district?.name || 'N/A',
                            type: p.category,
                            capacity: p.totalKW + ' kW',
                            price: '₹' + (p.totalKW * 45000).toLocaleString(), // Dummy price calc if not in DB
                            date: new Date(p.createdAt).toLocaleDateString(),
                            status: status,
                            category: p.subCategory || 'Solar Rooftop',
                            subCategory: p.category,
                            projectType: p.totalKW + ' kW',
                            subProjectType: p.projectType
                        };
                    });

                    setProjects(mappedProjects);

                    // Calculate stats
                    const completed = mappedProjects.filter(p => p.status === 'completed').length;
                    const inProgress = mappedProjects.filter(p => p.status !== 'completed').length;
                    const totalCapacity = data.reduce((sum, p) => sum + (p.totalKW || 0), 0);

                    setStats({
                        totalProjects: data.length,
                        completed,
                        inProgress,
                        commission: '₹' + (totalCapacity * 2000).toLocaleString(), // Dummy commission
                        systemCapacity: totalCapacity + ' kW'
                    });
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter projects based on current filters
    const filteredProjects = projects.filter(project => {
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                project.name.toLowerCase().includes(searchLower) ||
                project.address.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.status !== 'all' && project.status !== filters.status) {
            return false;
        }

        // Category filter
        if (filters.category !== 'all' && project.category !== filters.category) {
            return false;
        }

        // Sub-category filter
        if (filters.subCategory !== 'all' && project.subCategory !== filters.subCategory) {
            return false;
        }

        // Project type filter (simplified for demo)
        if (filters.projectType !== 'all') {
            // In real app, you'd have proper project type filtering
        }

        // Sub project type filter
        if (filters.subProjectType !== 'all' && project.subProjectType !== filters.subProjectType) {
            return false;
        }

        return true;
    });

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilters(prev => ({ ...prev, [id]: value }));
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            category: 'all',
            subCategory: 'all',
            projectType: 'all',
            subProjectType: 'all'
        });
    };

    // Get status step styling
    const getStepStyle = (stepStatus, currentStatus) => {
        if (stepStatus === 'signup') {
            if (currentStatus === 'signup') return 'bg-purple-600 text-white';
            if (['installation', 'commissioned', 'completed'].includes(currentStatus)) return 'bg-green-600 text-white';
            return 'bg-gray-300 text-gray-600';
        }
        if (stepStatus === 'installation') {
            if (currentStatus === 'installation') return 'bg-purple-600 text-white';
            if (['commissioned', 'completed'].includes(currentStatus)) return 'bg-green-600 text-white';
            return 'bg-gray-300 text-gray-600';
        }
        if (stepStatus === 'commissioned') {
            if (currentStatus === 'commissioned') return 'bg-purple-600 text-white';
            if (currentStatus === 'completed') return 'bg-green-600 text-white';
            return 'bg-gray-300 text-gray-600';
        }
        if (stepStatus === 'completed') {
            if (currentStatus === 'completed') return 'bg-green-600 text-white';
            return 'bg-gray-300 text-gray-600';
        }
    };

    // Get progress line style
    const getLineStyle = (stepFrom, stepTo, currentStatus) => {
        const steps = ['signup', 'installation', 'commissioned', 'completed'];
        const currentIndex = steps.indexOf(currentStatus);
        const fromIndex = steps.indexOf(stepFrom);

        if (currentIndex > fromIndex) return 'bg-green-500';
        if (currentIndex === fromIndex) return 'bg-purple-500';
        return 'bg-gray-300';
    };

    // Get status message
    const getStatusMessage = (status) => {
        switch (status) {
            case 'signup':
                return '📄 Signed - awaiting installation';
            case 'installation':
                return '⏳ Installation in progress';
            case 'commissioned':
                return '🔆 Commissioned - active';
            case 'completed':
                return '🏁 Project completed';
            default:
                return '';
        }
    };

    // Get status icon
    const getStepIcon = (step) => {
        switch (step) {
            case 'signup': return <CheckCircle size={14} />;
            case 'installation': return <Wrench size={14} />;
            case 'commissioned': return <Zap size={14} />;
            case 'completed': return <Flag size={14} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-white shadow-sm p-3">
                    <nav className="container-fluid">
                        <ol className="flex items-center space-x-2">
                            <li className="text-gray-500">
                                <h3 className="text-xl font-semibold text-gray-800">Track Project Progress</h3>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="p-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalProjects}</h3>
                        <p className="text-sm text-gray-500">Total Projects</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
                        <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <h3 className="text-2xl font-bold text-yellow-600">{stats.inProgress}</h3>
                        <p className="text-sm text-gray-500">In Progress</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.commission}</h3>
                        <p className="text-sm text-gray-500">Commission</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.systemCapacity}</h3>
                        <p className="text-sm text-gray-500">System Capacity</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    {/* Top Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                        <div className="col-span-2">
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400">
                                    <Search size={18} />
                                </span>
                                <input
                                    id="search"
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search projects or customers..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                id="status"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Status</option>
                                <option value="signup">Signup</option>
                                <option value="installation">Installation</option>
                                <option value="commissioned">Commissioned</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <button
                                onClick={resetFilters}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Bottom Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                            <select
                                id="category"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Category</option>
                                <option value="Solar Rooftop">Solar Rooftop</option>
                                <option value="Solar Pump">Solar Pump</option>
                            </select>
                        </div>

                        <div>
                            <select
                                id="subCategory"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.subCategory}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Sub Category</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>

                        <div>
                            <select
                                id="projectType"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.projectType}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Project Type</option>
                                <option value="3kw-5kw">3kw - 5kw</option>
                                <option value="10kw-25kw">10kw - 25kw</option>
                            </select>
                        </div>

                        <div>
                            <select
                                id="subProjectType"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.subProjectType}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Sub Project Type</option>
                                <option value="On-Grid">On-Grid</option>
                                <option value="Off-Grid">Off-Grid</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="bg-blue-600 text-white p-3 rounded-t-lg font-semibold">
                    <div className="grid grid-cols-12">
                        <div className="col-span-4">PROJECT DETAILS</div>
                        <div className="col-span-3">SYSTEM INFO</div>
                        <div className="col-span-5">PROGRESS</div>
                    </div>
                </div>

                {/* Project List */}
                <div className="bg-white rounded-b-lg shadow-sm">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="border-b p-3 last:border-b-0">
                            <div className="grid grid-cols-12 items-center">
                                {/* Left - Project Details */}
                                <div className="col-span-4">
                                    <h5 className="font-bold text-gray-800 flex items-center">
                                        <User size={16} className="mr-2 text-gray-500" />
                                        {project.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                                        <MapPin size={14} className="mr-1 text-gray-400" />
                                        {project.address}
                                    </p>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${project.type === 'Commercial'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {project.type === 'Commercial' ? <Building2 size={12} className="inline mr-1" /> : <Home size={12} className="inline mr-1" />}
                                        {project.type}
                                    </span>
                                </div>

                                {/* Middle - System Info */}
                                <div className="col-span-3">
                                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                                        <Zap size={14} className="mr-1 text-yellow-500" />
                                        {project.capacity}
                                    </p>
                                    <p className={`text-sm font-medium ${project.price === '₹0' ? 'text-gray-400' : 'text-green-600'}`}>
                                        {project.price}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <Calendar size={12} className="mr-1" />
                                        {project.date}
                                    </p>
                                </div>

                                {/* Right - Progress Steps */}
                                <div className="col-span-5">
                                    <div className="flex items-center">
                                        {/* Step 1: Signup */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepStyle('signup', project.status)}`}>
                                            {getStepIcon('signup')}
                                        </div>
                                        <div className={`w-8 h-1 mx-1 rounded ${getLineStyle('signup', 'installation', project.status)}`}></div>

                                        {/* Step 2: Installation */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepStyle('installation', project.status)}`}>
                                            {getStepIcon('installation')}
                                        </div>
                                        <div className={`w-8 h-1 mx-1 rounded ${getLineStyle('installation', 'commissioned', project.status)}`}></div>

                                        {/* Step 3: Commissioned */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepStyle('commissioned', project.status)}`}>
                                            {getStepIcon('commissioned')}
                                        </div>
                                        <div className={`w-8 h-1 mx-1 rounded ${getLineStyle('commissioned', 'completed', project.status)}`}></div>

                                        {/* Step 4: Completed */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepStyle('completed', project.status)}`}>
                                            {getStepIcon('completed')}
                                        </div>
                                    </div>

                                    {/* Status Message */}
                                    <p className="mt-2 text-xs text-gray-500">
                                        {getStatusMessage(project.status)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-8">
                            <Search size={48} className="mx-auto text-gray-400 mb-3" />
                            <h5 className="text-gray-500 text-lg">No projects found</h5>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealerTrackProjectProgress;