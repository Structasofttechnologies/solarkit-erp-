import React, { useState, useEffect } from 'react';
import {
    Headphones,
    Search,
    Ticket,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Zap,
    Sun,
    Battery,
    AlertCircle,
    CheckCircle,
    Loader,
    Wrench,
    FileText,
    Check,
    Circle,
    Plus,
    ArrowRight,
    ArrowLeft,
    UserCircle,
    Activity,
    BarChart3,
    TrendingUp,
    Info,
    MoreVertical,
    Filter,
    X
} from 'lucide-react';

const FranchiseProjectManagementTrackServices = () => {
    // State for selected ticket index
    const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);

    // State for search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for mobile view
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Tickets data
    const tickets = [
        {
            id: 'SOL-123456',
            customerName: 'Rajesh Kumar',
            customerPhone: '+91 9876543210',
            customerEmail: 'rajesh@example.com',
            issueType: 'Performance Issue',
            component: 'Solar Panels & Inverter',
            status: 'In Progress',
            createdDate: '15 Dec 2024, 10:30 AM',
            lastUpdate: '15 Dec 2024, 11:45 AM',
            startedDate: '15 Dec 2024',
            updateDate: '15 Dec 2024',
            estimatedDate: '17 Dec 2024',
            description: 'The solar panels are not generating expected power output during peak hours. Technician needs to check the inverter and panel connections.',
            steps: [
                { title: 'Ticket Created', subtitle: 'Your ticket has been registered', icon: 'check', time: '10:30 AM' },
                { title: 'In Progress', subtitle: 'Our team is working on your issue', icon: 'loader', time: '11:45 AM' },
                { title: 'Technician Assigned', subtitle: 'Expert assigned to resolve your issue', icon: 'user', time: '02:15 PM' },
                { title: 'Replacement Initiated', subtitle: 'Technician has started the Replacement Process', icon: 'wrench', time: 'Today, 04:30 PM' }
            ],
            progress: 40
        },
        {
            id: 'SOL-123457',
            customerName: 'Priya Sharma',
            customerPhone: '+91 9876543211',
            customerEmail: 'priya@example.com',
            issueType: 'Physical Damage',
            component: 'Solar Panels',
            status: 'Resolved',
            createdDate: '14 Dec 2024, 09:15 AM',
            lastUpdate: '15 Dec 2024, 11:30 AM',
            startedDate: '14 Dec 2024',
            updateDate: '15 Dec 2024',
            estimatedDate: '15 Dec 2024',
            description: 'Physical damage observed on solar panel surface. Panel replacement completed successfully.',
            steps: [
                { title: 'Ticket Created', subtitle: 'Your ticket has been registered', icon: 'check', time: 'Yesterday, 09:15 AM' },
                { title: 'In Progress', subtitle: 'Our team is working on your issue', icon: 'loader', time: 'Yesterday, 11:30 AM' },
                { title: 'Technician Assigned', subtitle: 'Expert assigned to resolve your issue', icon: 'user', time: 'Yesterday, 02:00 PM' },
                { title: 'Replacement Completed', subtitle: 'Damaged panel has been replaced', icon: 'wrench', time: 'Today, 10:00 AM' },
                { title: 'Resolved', subtitle: 'Your issue has been resolved', icon: 'check-circle', time: 'Today, 11:30 AM' }
            ],
            progress: 100
        },
        {
            id: 'SOL-123458',
            customerName: 'Amit Patel',
            customerPhone: '+91 9876543212',
            customerEmail: 'amit@example.com',
            issueType: 'Monitoring System Problem',
            component: 'Monitoring System',
            status: 'Ticket Created',
            createdDate: '15 Dec 2024, 02:30 PM',
            lastUpdate: '15 Dec 2024, 03:00 PM',
            startedDate: '15 Dec 2024',
            updateDate: '15 Dec 2024',
            estimatedDate: '16 Dec 2024',
            description: 'Monitoring system not displaying real-time data. Need to check the connectivity and software configuration.',
            steps: [
                { title: 'Ticket Created', subtitle: 'Your ticket has been registered', icon: 'check', time: '30 mins ago' },
                { title: 'In Progress', subtitle: 'Our team is working on your issue', icon: 'loader', time: 'Next step' },
                { title: 'Technician Assigned', subtitle: 'Expert assigned to resolve your issue', icon: 'user', time: 'Pending' }
            ],
            progress: 25
        },
        {
            id: 'SOL-123459',
            customerName: 'Sneha Reddy',
            customerPhone: '+91 9876543213',
            customerEmail: 'sneha@example.com',
            issueType: 'Billing Inquiry',
            component: 'Billing System',
            status: 'In Progress',
            createdDate: '13 Dec 2024, 10:00 AM',
            lastUpdate: '15 Dec 2024, 02:00 PM',
            startedDate: '13 Dec 2024',
            updateDate: '15 Dec 2024',
            estimatedDate: '15 Dec 2024',
            description: 'Discrepancy in monthly billing statement. Need clarification on the charges and tariff calculation.',
            steps: [
                { title: 'Ticket Created', subtitle: 'Your ticket has been registered', icon: 'check', time: '2 days ago' },
                { title: 'In Progress', subtitle: 'Our team is working on your issue', icon: 'loader', time: '1 hour ago' },
                { title: 'Under Review', subtitle: 'Billing team reviewing the statement', icon: 'file-text', time: 'Currently' },
                { title: 'Resolved', subtitle: 'Your issue has been resolved', icon: 'check-circle', time: 'Estimated: Today EOD' }
            ],
            progress: 60
        }
    ];

    // Filter tickets based on search term
    const filteredTickets = tickets.filter(ticket =>
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected ticket
    const selectedTicket = tickets[selectedTicketIndex];

    // Get status badge class and icon
    const getStatusInfo = (status) => {
        switch (status) {
            case 'In Progress':
                return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', icon: Loader };
            case 'Resolved':
                return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', icon: CheckCircle };
            case 'Ticket Created':
                return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', icon: Clock };
            default:
                return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', icon: Loader };
        }
    };

    // Get step icon
    const getStepIcon = (iconName) => {
        switch (iconName) {
            case 'check': return Check;
            case 'check-circle': return CheckCircle;
            case 'loader': return Loader;
            case 'user': return User;
            case 'wrench': return Wrench;
            case 'tools': return Tool;
            case 'file-text': return FileText;
            default: return Circle;
        }
    };

    // Handle ticket selection
    const handleTicketSelect = (index) => {
        setSelectedTicketIndex(index);
        setIsMobileMenuOpen(false);
    };

    // Get active tickets count
    const activeTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Navbar */}
            <nav className="bg-blue-600 text-white p-4 md:hidden">
                <span className="text-lg font-semibold">Ticket Status</span>
            </nav>

            <div className="flex flex-col md:flex-row">
                {/* Desktop Sidebar */}
                <div className="hidden md:block md:w-1/3 lg:w-1/4 border-r bg-white h-screen sticky top-0 overflow-y-auto">
                    {/* Sidebar Header */}
                    <div className="bg-blue-600 text-white p-6">
                        <div className="flex items-center">
                            <Headphones size={24} className="mr-3" />
                            <h4 className="text-xl font-bold">Support Tickets</h4>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search tickets..."
                            />
                        </div>
                    </div>

                    {/* Tickets List Header */}
                    <div className="px-4 py-2 flex justify-between items-center">
                        <h6 className="font-semibold">All Tickets ({filteredTickets.length})</h6>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {activeTicketsCount} Active
                        </span>
                    </div>

                    {/* Tickets List */}
                    <div className="space-y-1">
                        {filteredTickets.map((ticket, index) => {
                            const isSelected = index === selectedTicketIndex;
                            const statusInfo = getStatusInfo(ticket.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => handleTicketSelect(index)}
                                    className={`p-4 border-b cursor-pointer transition-all ${isSelected
                                        ? 'bg-blue-50 border-l-4 border-blue-600'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 mr-3">
                                            <h6 className="font-semibold mb-1">{ticket.customerName}</h6>
                                            <p className="text-gray-500 text-sm mb-2">{ticket.issueType}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-xs text-gray-500">
                                        <Ticket size={12} className="mr-1" />
                                        <span className="mr-3">{ticket.id}</span>
                                        <Calendar size={12} className="mr-1" />
                                        <span>{ticket.createdDate.split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Zap size={12} className="mr-1" />
                                        <span>{ticket.component}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Filter size={24} />}
                </button>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto">
                        <div className="bg-blue-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Headphones size={24} className="mr-3" />
                                    <h4 className="text-xl font-bold">Support Tickets</h4>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search tickets..."
                                />
                            </div>
                        </div>

                        {/* Tickets List */}
                        <div className="space-y-1">
                            {filteredTickets.map((ticket, index) => {
                                const isSelected = index === selectedTicketIndex;
                                const statusInfo = getStatusInfo(ticket.status);

                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => handleTicketSelect(index)}
                                        className={`p-4 border-b cursor-pointer ${isSelected ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 mr-3">
                                                <h6 className="font-semibold mb-1">{ticket.customerName}</h6>
                                                <p className="text-gray-500 text-sm mb-2">{ticket.issueType}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center mb-2 text-xs text-gray-500">
                                            <Ticket size={12} className="mr-1" />
                                            <span className="mr-3">{ticket.id}</span>
                                            <Calendar size={12} className="mr-1" />
                                            <span>{ticket.createdDate.split(',')[0]}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 md:overflow-y-auto md:h-screen">
                    {/* Web Header */}
                    <div className="hidden md:block bg-white shadow-sm p-4 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-blue-600 font-bold text-xl">Ticket Details</h4>
                                <p className="text-gray-500 text-sm">Detailed view of selected support ticket</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Ticket Selector */}
                    <div className="md:hidden p-4 bg-gray-100 border-b">
                        <select
                            value={selectedTicketIndex}
                            onChange={(e) => setSelectedTicketIndex(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {tickets.map((ticket, index) => (
                                <option key={ticket.id} value={index}>
                                    {ticket.customerName} - {ticket.issueType}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ticket Details Content */}
                    {selectedTicket && (
                        <div className="p-4">
                            {/* Mobile Status Badge */}
                            <div className="md:hidden mb-4">
                                {(() => {
                                    const statusInfo = getStatusInfo(selectedTicket.status);
                                    return (
                                        <span className={`px-3 py-1 text-sm rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                            {selectedTicket.status}
                                        </span>
                                    );
                                })()}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Left Column - Ticket Info & Timeline */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Ticket Info Card */}
                                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                                        <h5 className="text-blue-600 font-bold text-lg mb-4">
                                            Ticket #{selectedTicket.id}
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex">
                                                    <AlertCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                                    <div>
                                                        <small className="text-gray-500 block">Issue Type</small>
                                                        <p className="font-semibold">{selectedTicket.issueType}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex">
                                                    <Zap className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                                    <div>
                                                        <small className="text-gray-500 block">Component</small>
                                                        <p className="font-semibold">{selectedTicket.component}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex">
                                                    <Calendar className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                                    <div>
                                                        <small className="text-gray-500 block">Created Date</small>
                                                        <p className="font-semibold">{selectedTicket.createdDate}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex">
                                                    <Clock className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                                    <div>
                                                        <small className="text-gray-500 block">Last Update</small>
                                                        <p className="font-semibold">{selectedTicket.lastUpdate}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h6 className="font-semibold mb-2">Issue Description</h6>
                                        <p className="text-gray-700">{selectedTicket.description}</p>
                                    </div>

                                    {/* Progress Timeline */}
                                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                                        <div className="flex items-center mb-6">
                                            <TrendingUp className="text-blue-600 mr-3" size={24} />
                                            <h5 className="font-bold">Progress Timeline</h5>
                                        </div>

                                        <div className="space-y-6">
                                            {selectedTicket.steps.map((step, index) => {
                                                const StepIcon = getStepIcon(step.icon);
                                                const isLast = index === selectedTicket.steps.length - 1;

                                                return (
                                                    <div key={index} className="flex">
                                                        <div className="flex flex-col items-center mr-4">
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                                <StepIcon size={16} />
                                                            </div>
                                                            {!isLast && <div className="w-0.5 h-12 bg-blue-600 mt-1"></div>}
                                                        </div>
                                                        <div className="flex-1 pb-4">
                                                            <div className="flex justify-between items-start">
                                                                <h6 className="font-semibold">{step.title}</h6>
                                                                <span className="text-xs text-gray-500">{step.time}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{step.subtitle}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Customer Info & Resolution */}
                                <div className="space-y-4">
                                    {/* Customer Info Card */}
                                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                                        <div className="flex items-center mb-4">
                                            <User className="text-blue-600 mr-3" size={20} />
                                            <h5 className="font-bold">Customer Information</h5>
                                        </div>

                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto text-2xl font-bold">
                                                {selectedTicket.customerName.charAt(0)}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <small className="text-gray-500 block">Name</small>
                                                <p className="font-semibold">{selectedTicket.customerName}</p>
                                            </div>
                                            <div>
                                                <small className="text-gray-500 block">Phone</small>
                                                <p className="font-semibold flex items-center">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    {selectedTicket.customerPhone}
                                                </p>
                                            </div>
                                            <div>
                                                <small className="text-gray-500 block">Email</small>
                                                <p className="font-semibold flex items-center">
                                                    <Mail size={14} className="mr-2 text-gray-400" />
                                                    {selectedTicket.customerEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resolution Timeline */}
                                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                                        <div className="flex items-center mb-4">
                                            <Clock className="text-blue-600 mr-3" size={20} />
                                            <h5 className="font-bold">Resolution Timeline</h5>
                                        </div>

                                        <div className="mb-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{ width: `${selectedTicket.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-blue-600 font-semibold text-sm">
                                                {selectedTicket.progress}% Complete
                                            </p>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Started</span>
                                                <span className="font-semibold">{selectedTicket.startedDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last Update</span>
                                                <span className="font-semibold">{selectedTicket.updateDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Estimated Completion</span>
                                                <span className="font-semibold">{selectedTicket.estimatedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <button
                onClick={() => alert('Opening Raise New Ticket screen...')}
                className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};

export default FranchiseProjectManagementTrackServices;