import React, { useState, useEffect } from 'react';
import {
    Headset,
    Search,
    Ticket,
    Calendar,
    Sun,
    AlertTriangle,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    Wrench,
    FileText,
    Plus,
    ArrowRight,
    Circle,
    Check,
    Timer,
    HelpCircle,
    AlertCircle,
    Zap,
    Activity
} from 'lucide-react';
import api from '../../../api/api'; // Adjust import path if needed
import { useNavigate } from 'react-router-dom';

const DealerTicketStatus = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch tickets on mount
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/tickets');
                setTickets(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tickets:', error);
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Filter tickets based on search
    const filteredTickets = tickets.filter(ticket => {
        const id = ticket.ticketId || '';
        const name = ticket.customerName || '';
        const issue = ticket.issueType || '';
        const component = ticket.component || '';

        return id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            component.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Get active ticket count
    const activeTickets = tickets.filter(ticket => ticket.status === 'In Progress' || ticket.status === 'Open').length;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Format date time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    };

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-yellow-500 text-white';
            case 'Resolved': return 'bg-green-500 text-white';
            case 'Open': return 'bg-blue-500 text-white';
            case 'Closed': return 'bg-gray-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    // Get step icon
    const getStepIcon = (iconName, isCompleted, isActive) => {
        const iconProps = { size: 16, className: isCompleted ? 'text-white' : isActive ? 'text-blue-600' : 'text-gray-400' };

        switch (iconName) {
            case 'check': return <Check {...iconProps} />;
            case 'tools': return <Wrench {...iconProps} />;
            case 'user': return <User {...iconProps} />;
            case 'wrench': return <Wrench {...iconProps} />;
            case 'check-circle': return <CheckCircle {...iconProps} />;
            case 'file-text': return <FileText {...iconProps} />;
            default: return <Circle {...iconProps} />;
        }
    };

    // Construct 5-step timeline
    const getSteps = (ticket) => {
        const steps = [
            {
                title: "Ticket Created",
                subtitle: "Your ticket has been registered",
                icon: "check",
                statusKey: "Open"
            },
            {
                title: "In Progress",
                subtitle: "Our team is working on your issue",
                icon: "tools",
                statusKey: "In Progress"
            },
            {
                title: "Technician Assigned",
                subtitle: "Expert assigned to resolve your issue",
                icon: "user",
                statusKey: "Technician Assigned"
            },
            {
                title: "Replacement Completed",
                subtitle: "Damaged component has been replaced",
                icon: "wrench",
                statusKey: "Replacement Completed"
            },
            {
                title: "Resolved",
                subtitle: "Your issue has been resolved",
                icon: "check-circle",
                statusKey: "Resolved"
            }
        ];

        // Map timestamps if available in history
        return steps.map(step => {
            const historyItem = ticket.history.find(h => h.status === step.statusKey);
            return {
                ...step,
                time: historyItem ? formatDateTime(historyItem.updatedAt) : 'Pending'
            };
        });
    };

    // Get active step index based on status
    const getActiveStepIndex = (ticket) => {
        switch (ticket.status) {
            case 'Open': return 0;
            case 'In Progress': return 1;
            case 'Technician Assigned': return 2;
            case 'Replacement Completed': return 3;
            case 'Resolved': return 4;
            case 'Closed': return 4;
            default: return 0;
        }
    };

    // Calculate progress
    const calculateProgress = (ticket) => {
        const steps = getSteps(ticket);
        const totalSteps = steps.length;
        const completedSteps = getActiveStepIndex(ticket);
        return Math.round(((completedSteps) / (totalSteps - 1)) * 100) || 0; // Fix minimal progress or 0
    };

    // Handle Status Update
    const handleStatusUpdate = async (newStatus) => {
        if (!selectedTicket) return;

        try {
            const response = await api.put(`/tickets/${selectedTicket._id}/status`, { status: newStatus });
            const updatedTicket = response.data;

            // Update tickets list
            const updatedTickets = tickets.map(t =>
                t._id === updatedTicket._id ? updatedTicket : t
            );
            setTickets(updatedTickets);
        } catch (error) {
            console.error('Error updating ticket status:', error);
            alert('Failed to update status');
        }
    };

    // Handle new ticket button
    const handleNewTicket = () => {
        navigate('/dealer/tickets/raise-ticket'); // Assuming route exists
    };

    const selectedTicket = filteredTickets.length > 0 ? filteredTickets[selectedTicketIndex] : null;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading tickets...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-wrap">
                {/* Ticket List Sidebar */}
                <div className="w-full lg:w-1/4 xl:w-1/4 border-r bg-white h-screen overflow-auto">
                    {/* Ticket List Header */}
                    <div className="bg-blue-600 text-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Headset size={24} className="mr-2" />
                                <h2 className="text-xl font-bold">Support Tickets</h2>
                            </div>
                            <button onClick={handleNewTicket} className="bg-white text-blue-600 rounded-full p-1 hover:bg-gray-100">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-3">
                        <div className="flex items-center border rounded-lg">
                            <span className="px-3 text-gray-400">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                className="flex-1 py-2 pr-3 focus:outline-none"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List Header */}
                    <div className="px-3 pt-2 pb-3 flex justify-between items-center">
                        <h3 className="text-sm font-bold">All Tickets ({filteredTickets.length})</h3>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {activeTickets} Active
                        </span>
                    </div>

                    {/* Ticket List */}
                    <div className="pb-3">
                        {filteredTickets.length === 0 ? (
                            <div className="text-center text-gray-400 py-4">No tickets found</div>
                        ) : (
                            filteredTickets.map((ticket, index) => {
                                const createdDateFormatted = formatDate(ticket.createdAt);
                                const isSelected = selectedTicketIndex === index;

                                return (
                                    <div
                                        key={ticket._id}
                                        onClick={() => setSelectedTicketIndex(index)}
                                        className={`border-b p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600 border-3' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold mb-1">{ticket.customerName}</h4>
                                                <p className="text-xs text-gray-500 mb-2">{ticket.issueType}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                                            <div className="flex items-center">
                                                <Ticket size={12} className="mr-1" />
                                                <span>{ticket.ticketId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-1" />
                                                <span>{createdDateFormatted}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Sun size={12} className="mr-1" />
                                                <span>{ticket.component}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full lg:w-3/4 xl:w-3/4 p-4 h-screen overflow-auto">
                    {selectedTicket ? (
                        <>
                            {/* Ticket Detail Header */}
                            <div className="flex flex-wrap justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-600 mb-1">Ticket Details</h2>
                                    <p className="text-sm text-gray-500">Detailed view of selected support ticket</p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className={`px-3 py-2 rounded-lg font-bold ${getStatusBadgeClass(selectedTicket.status)}`}>
                                        {selectedTicket.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap">
                                {/* Left Column: Ticket Info & Progress */}
                                <div className="w-full xl:w-2/3 pr-0 xl:pr-4">
                                    {/* Ticket Info Card */}
                                    <div className="bg-white rounded-lg shadow-sm mb-4">
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-lg">Ticket #{selectedTicket.ticketId}</h3>
                                                <div className="relative inline-block text-left">
                                                    <select
                                                        value={selectedTicket.status}
                                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                                        className={`appearance-none px-3 py-1 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                                            selectedTicket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 focus:ring-yellow-500' :
                                                                selectedTicket.status === 'Closed' ? 'bg-gray-100 text-gray-700 focus:ring-gray-500' :
                                                                    'bg-blue-100 text-blue-700 focus:ring-blue-500'
                                                            }`}
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Technician Assigned">Technician Assigned</option>
                                                        <option value="Replacement Completed">Replacement Completed</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ticket Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="bg-amber-50 rounded-lg p-3 border">
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-100 rounded p-2 mr-3">
                                                            <AlertTriangle size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Issue Type</div>
                                                            <div className="font-semibold">{selectedTicket.issueType}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-lg p-3 border">
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-100 rounded p-2 mr-3">
                                                            <Sun size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Component</div>
                                                            <div className="font-semibold">{selectedTicket.component}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-lg p-3 border">
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-100 rounded p-2 mr-3">
                                                            <Calendar size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Created Date</div>
                                                            <div className="font-semibold">{formatDateTime(selectedTicket.createdAt)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-lg p-3 border">
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-100 rounded p-2 mr-3">
                                                            <Clock size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Last Update</div>
                                                            <div className="font-semibold">{formatDateTime(selectedTicket.updatedAt)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <h5 className="font-bold mb-2">Issue Description:</h5>
                                            <p className="text-gray-700">{selectedTicket.description}</p>
                                        </div>
                                    </div>

                                    {/* Progress Timeline Card */}
                                    <div className="bg-white rounded-lg shadow-sm mb-4">
                                        <div className="p-4">
                                            <div className="flex items-center mb-4">
                                                <div className="bg-gray-100 rounded p-2 mr-3">
                                                    <Activity size={20} className="text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-lg">Progress Timeline</h3>
                                            </div>

                                            <div className="relative pl-12">
                                                {getSteps(selectedTicket).map((step, index) => {
                                                    const activeStepIndex = getActiveStepIndex(selectedTicket);
                                                    const isCompleted = index < activeStepIndex;
                                                    const isActive = index === activeStepIndex;
                                                    const isLast = index === getSteps(selectedTicket).length - 1;

                                                    return (
                                                        <div key={index} className={`relative ${!isLast ? 'pb-6' : ''}`}>
                                                            {/* Step Icon */}
                                                            <div
                                                                className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center z-10 ${isCompleted
                                                                    ? 'bg-blue-600 text-white'
                                                                    : isActive
                                                                        ? 'bg-white border-2 border-blue-600 text-blue-600'
                                                                        : 'bg-gray-100 text-gray-400'
                                                                    }`}
                                                                style={{ left: '-36px' }}
                                                            >
                                                                {getStepIcon(step.icon, isCompleted, isActive)}
                                                            </div>

                                                            {/* Connector Line */}
                                                            {!isLast && (
                                                                <div
                                                                    className={`absolute w-0.5 h-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                                                                        }`}
                                                                    style={{ left: '-32px', top: '36px' }}
                                                                ></div>
                                                            )}

                                                            {/* Step Content */}
                                                            <div className="pl-5">
                                                                <div className="flex flex-wrap justify-between items-start">
                                                                    <div>
                                                                        <div className={`font-semibold ${isCompleted || isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                            {step.title}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">{step.subtitle}</div>
                                                                    </div>
                                                                    <div className="text-xs font-semibold text-gray-500">{step.time}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Customer Info & Resolution */}
                                <div className="w-full xl:w-1/3">
                                    {/* Customer Info Card */}
                                    <div className="bg-white rounded-lg shadow-sm mb-4">
                                        <div className="p-4">
                                            <div className="flex items-center mb-4">
                                                <div className="bg-gray-100 rounded p-2 mr-3">
                                                    <User size={20} className="text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-lg">Customer Information</h3>
                                            </div>

                                            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                                                {selectedTicket.customerName ? selectedTicket.customerName.charAt(0) : 'C'}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-xs text-gray-500">Name</div>
                                                    <div className="font-semibold">{selectedTicket.customerName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Phone</div>
                                                    <div className="font-semibold flex items-center">
                                                        <Phone size={14} className="mr-1 text-gray-400" />
                                                        {selectedTicket.customerPhone}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Email</div>
                                                    <div className="font-semibold flex items-center">
                                                        <Mail size={14} className="mr-1 text-gray-400" />
                                                        {selectedTicket.customerEmail || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resolution Timeline Card */}
                                    <div className="bg-white rounded-lg shadow-sm">
                                        <div className="p-4">
                                            <div className="flex items-center mb-4">
                                                <div className="bg-gray-100 rounded p-2 mr-3">
                                                    <Timer size={20} className="text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-lg">Resolution Timeline</h3>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm">Progress</span>
                                                    <span className="font-bold text-blue-600">{calculateProgress(selectedTicket)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-blue-600 rounded-full h-3"
                                                        style={{ width: `${calculateProgress(selectedTicket)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Timeline Details */}
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-xs text-gray-500">Started</div>
                                                    <div className="font-semibold">{formatDate(selectedTicket.createdAt)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Last Update</div>
                                                    <div className="font-semibold">{formatDate(selectedTicket.updatedAt)}</div>
                                                </div>
                                                {/* <div>
                                                    <div className="text-xs text-gray-500">Estimated Completion</div>
                                                    <div className="font-semibold">{formatDate(selectedTicket.estimatedResolution)}</div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Ticket size={64} className="mb-4 text-gray-300" />
                            <p className="text-xl font-semibold">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <div className="lg:hidden fixed bottom-4 right-4">
                <button
                    onClick={handleNewTicket}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
                    title="Raise New Ticket"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>
    );
};

export default DealerTicketStatus;