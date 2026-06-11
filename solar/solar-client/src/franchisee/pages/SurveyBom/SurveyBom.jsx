import React, { useState } from 'react';
import {
    Filter,
    Search,
    User,
    Mail,
    MapPin,
    Home,
    Building2,
    Zap,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Eye,
    Edit,
    Download,
    FileText,
    BarChart3
} from 'lucide-react';
import { locationAPI } from '../../../api/api';

const FranchiseSurveyBom = () => {
    // State for search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for filter modal
    const [showFilterModal, setShowFilterModal] = useState(false);

    // State for filters
    const [filters, setFilters] = useState({
        status: '',
        projectType: '',
        location: ''
    });
    const [districts, setDistricts] = useState([]);

    // Fetch districts on mount
    React.useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    // Leads data
    const leads = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            location: 'Rajkot',
            projectType: 'Residential',
            capacity: '10 kW',
            status: 'Pending',
            date: '2023-05-15',
            statusBadge: 'warning'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            location: 'Ahmedabad',
            projectType: 'Commercial',
            capacity: '25 kW',
            status: 'Completed',
            date: '2023-05-10',
            statusBadge: 'success'
        },
        {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.j@example.com',
            location: 'Surat',
            projectType: 'Residential',
            capacity: '5 kW',
            status: 'In Progress',
            date: '2023-05-08',
            statusBadge: 'info'
        },
        {
            id: 4,
            name: 'Emily Williams',
            email: 'emily.w@example.com',
            location: 'Vadodara',
            projectType: 'Residential',
            capacity: '8 kW',
            status: 'Pending',
            date: '2023-05-05',
            statusBadge: 'warning'
        },
        {
            id: 5,
            name: 'Michael Brown',
            email: 'michael.b@example.com',
            location: 'Gandhinagar',
            projectType: 'Commercial',
            capacity: '50 kW',
            status: 'In Progress',
            date: '2023-05-01',
            statusBadge: 'info'
        },
        {
            id: 6,
            name: 'Sarah Davis',
            email: 'sarah.d@example.com',
            location: 'Junagadh',
            projectType: 'Residential',
            capacity: '6 kW',
            status: 'Completed',
            date: '2023-04-28',
            statusBadge: 'success'
        }
    ];

    // Filter leads based on search term
    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.projectType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get status badge style
    const getStatusBadge = (status, type) => {
        switch (status) {
            case 'warning':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: AlertCircle,
                    label: type
                };
            case 'success':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: CheckCircle,
                    label: type
                };
            case 'info':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: Clock,
                    label: type
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: AlertCircle,
                    label: type
                };
        }
    };

    // Get project type icon
    const getProjectTypeIcon = (type) => {
        return type === 'Residential' ? Home : Building2;
    };

    // Handle survey button click
    const handleSurveyClick = (leadId) => {
        alert(`Starting survey for lead #${leadId}`);
        // In a real app, this would navigate to the survey page
    };

    // Handle filter application
    const applyFilters = () => {
        setShowFilterModal(false);
        // In a real app, this would apply the filters to the leads data
        console.log('Applied filters:', filters);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: '',
            projectType: '',
            location: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm mb-4">
                    <div className="p-4 flex justify-between items-center">
                        <h5 className="text-blue-600 font-bold text-lg">ALL Leads</h5>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                        >
                            <Filter size={16} className="mr-2" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search leads by name, email, location..."
                            />
                        </div>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Lead Information
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLeads.map((lead) => {
                                    const ProjectIcon = getProjectTypeIcon(lead.projectType);
                                    const statusBadge = getStatusBadge(lead.statusBadge, lead.status);
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="text-blue-600" size={20} />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {lead.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <Mail size={12} className="mr-1" />
                                                            {lead.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <MapPin size={14} className="mr-1 text-gray-400" />
                                                    {lead.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center mb-1">
                                                    <ProjectIcon size={14} className="mr-1 text-blue-500" />
                                                    <span className="text-sm text-gray-700">{lead.projectType}</span>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 flex items-center">
                                                    <Zap size={14} className="mr-1 text-yellow-500" />
                                                    {lead.capacity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                                    <StatusIcon size={12} className="mr-1" />
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Calendar size={14} className="mr-1 text-gray-400" />
                                                    {lead.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleSurveyClick(lead.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-500 text-sm rounded-md hover:bg-blue-50 transition-colors"
                                                >
                                                    <ClipboardList size={16} className="mr-1" />
                                                    Survey
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredLeads.length === 0 && (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No leads found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (optional) */}
                {filteredLeads.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to{' '}
                            <span className="font-medium">{filteredLeads.length}</span> of{' '}
                            <span className="font-medium">{leads.length}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                1
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                                2
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                                3
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h5 className="text-lg font-semibold">Filter Leads</h5>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Status Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Project Type Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Type
                                </label>
                                <select
                                    value={filters.projectType}
                                    onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <select
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Locations</option>
                                    {districts.map((district) => (
                                        <option key={district._id} value={district.name.toLowerCase()}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseSurveyBom;