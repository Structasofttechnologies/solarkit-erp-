// FranchiseProjectManagementAssignLead.jsx
import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    History,
    ClipboardList,
    Users,
    User,
    MapPin,
    Phone,
    Mail,
    Home,
    Bolt,
    IndianRupee,
    Check,
    Send,
    List,
    Calendar,
    UserRound,
    Share2
} from 'lucide-react';

const FranchiseProjectManagementAssignLead = () => {
    const [selectedTab, setSelectedTab] = useState('assign');
    const [selectedPartnerType, setSelectedPartnerType] = useState('dealer');
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [historyFilter, setHistoryFilter] = useState('all');

    // Sample data
    const [solarLeads] = useState([
        {
            id: 'L001',
            customerName: 'Rajesh Kumar',
            phone: '+91 9876543210',
            email: 'rajesh@email.com',
            address: '123 Main St, Mumbai',
            projectType: 'Residential',
            systemSize: '5 kW',
            budget: '₹2,50,000',
            status: 'New',
            source: 'Website',
            createdDate: '2024-01-15',
        },
        {
            id: 'L002',
            customerName: 'Priya Sharma',
            phone: '+91 9876543211',
            email: 'priya@email.com',
            address: '456 Park Ave, Delhi',
            projectType: 'Commercial',
            systemSize: '10 kW',
            budget: '₹4,80,000',
            status: 'New',
            source: 'Referral',
            createdDate: '2024-01-16',
        },
        {
            id: 'L003',
            customerName: 'Amit Patel',
            phone: '+91 9876543212',
            email: 'amit@email.com',
            address: '789 Sector 15, Noida',
            projectType: 'Industrial',
            systemSize: '20 kW',
            budget: '₹9,00,000',
            status: 'New',
            source: 'Social Media',
            createdDate: '2024-01-17',
        },
    ]);

    const [dealers] = useState([
        {
            id: 'D001',
            name: 'Sushil Piprotar',
            type: 'Dealer',
            email: 'dealer@sunenergy.com',
            phone: '+91 9876543201',
            location: 'Mumbai',
            status: 'Active',
            assignedLeads: 12,
            performance: '95%',
        },
        {
            id: 'D002',
            name: 'Khushant Mer',
            type: 'Dealer',
            email: 'info@greenpower.com',
            phone: '+91 9876543202',
            location: 'Delhi',
            status: 'Active',
            assignedLeads: 8,
            performance: '88%',
        },
        {
            id: 'D003',
            name: 'Sarad Sukla',
            type: 'Dealer',
            email: 'contact@solartech.com',
            phone: '+91 9876543203',
            location: 'Bangalore',
            status: 'Active',
            assignedLeads: 15,
            performance: '92%',
        },
    ]);

    const [salesManagers] = useState([
        {
            id: 'SM001',
            name: 'Rahul Verma',
            type: 'Sales Manager',
            email: 'rahul@company.com',
            phone: '+91 9876543301',
            location: 'North Region',
            status: 'Active',
            assignedLeads: 25,
            performance: '98%',
        },
        {
            id: 'SM002',
            name: 'Neha Singh',
            type: 'Sales Manager',
            email: 'neha@company.com',
            phone: '+91 9876543302',
            location: 'South Region',
            status: 'Active',
            assignedLeads: 18,
            performance: '94%',
        },
        {
            id: 'SM003',
            name: 'Ankit Sharma',
            type: 'Sales Manager',
            email: 'ankit@company.com',
            phone: '+91 9876543303',
            location: 'West Region',
            status: 'Active',
            assignedLeads: 22,
            performance: '96%',
        },
    ]);

    const [assignmentHistory, setAssignmentHistory] = useState([
        {
            leadId: 'L001',
            leadName: 'Rajesh Kumar',
            assignedToId: 'D001',
            assignedToName: 'Sun Energy Dealers',
            assignedToType: 'Dealer',
            assignedBy: 'Admin User',
            assignedDate: '2024-01-15 10:30 AM',
            status: 'Assigned',
            projectType: 'Residential',
            systemSize: '5 kW',
        },
        {
            leadId: 'L002',
            leadName: 'Priya Sharma',
            assignedToId: 'SM001',
            assignedToName: 'Rahul Verma',
            assignedToType: 'Sales Manager',
            assignedBy: 'System Admin',
            assignedDate: '2024-01-14 02:15 PM',
            status: 'In Progress',
            projectType: 'Commercial',
            systemSize: '10 kW',
        },
        {
            leadId: 'L003',
            leadName: 'Amit Patel',
            assignedToId: 'D002',
            assignedToName: 'Green Power Solutions',
            assignedToType: 'Dealer',
            assignedBy: 'Sales Head',
            assignedDate: '2024-01-13 11:00 AM',
            status: 'Completed',
            projectType: 'Industrial',
            systemSize: '20 kW',
        },
    ]);

    // Helper Functions
    const getLocationFromAddress = (address) => {
        return address.split(',').length > 1 ? address.split(',')[1].trim() : address;
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'new':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'in progress':
                return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'assigned':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'completed':
                return 'bg-green-50 text-green-600 border-green-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    // Render Functions
    const renderLeadCards = () => {
        return solarLeads.map((lead) => {
            const isSelected = selectedLead === lead.id;
            const location = getLocationFromAddress(lead.address);

            return (
                <div
                    key={lead.id}
                    className={`inline-block w-[180px] h-[140px] rounded-lg border-2 mr-2 mb-2 relative cursor-pointer transition-all duration-300 ${isSelected
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    onClick={() => {
                        setSelectedLead(lead.id);
                        setSelectedPartner(null);
                    }}
                >
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                            <Check size={12} />
                        </div>
                    )}
                    <div className="p-3">
                        <div className="flex items-center mb-2">
                            <div className="rounded-full bg-gray-100 p-1 mr-2">
                                <User size={14} className="text-blue-600" />
                            </div>
                            <h6 className="mb-0 font-bold text-sm truncate">{lead.customerName}</h6>
                        </div>

                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <Home size={10} className="mr-1" />
                            <span>{lead.projectType}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <Bolt size={10} className="mr-1" />
                            <span>{lead.systemSize}</span>
                        </div>
                        <div className="text-xs text-gray-600 flex items-center">
                            <IndianRupee size={10} className="mr-1" />
                            <span>{lead.budget}</span>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const renderPartnerCards = () => {
        const partners = selectedPartnerType === 'dealer' ? dealers : salesManagers;
        const partnerTypeLabel = selectedPartnerType === 'dealer' ? 'Dealer' : 'Sales Manager';

        if (partners.length === 0) {
            return (
                <div className="inline-block text-center p-4 border rounded min-w-[200px]">
                    <Users size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-0">No {partnerTypeLabel.toLowerCase()}s available</p>
                </div>
            );
        }

        return partners.map((partner) => {
            const isSelected = selectedPartner === partner.id;

            return (
                <div
                    key={partner.id}
                    className={`inline-block w-[200px] h-[120px] rounded-lg border-2 mr-2 mb-2 relative cursor-pointer transition-all duration-300 ${isSelected
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    onClick={() => setSelectedPartner(partner.id)}
                >
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                            <Check size={12} />
                        </div>
                    )}
                    <div className="p-3">
                        <div className="flex items-center mb-2">
                            <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-1 mr-2">
                                {partner.type === 'Dealer' ? (
                                    <User size={14} className="text-blue-600" />
                                ) : (
                                    <Users size={14} className="text-blue-600" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <h6 className="mb-0 font-bold text-sm truncate">{partner.name}</h6>
                                <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                    {partner.type}
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <MapPin size={10} className="mr-1" />
                            <span className="truncate">{partner.location}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                            <Phone size={10} className="mr-1" />
                            <span>{partner.phone}</span>
                        </div>
                        <div className="text-xs text-gray-600 flex items-center">
                            <Mail size={10} className="mr-1" />
                            <span className="truncate">{partner.email}</span>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const renderAvailableLeadsGrid = () => {
        return solarLeads.map((lead) => {
            const statusClass = getStatusBadgeClass(lead.status);
            const location = getLocationFromAddress(lead.address);

            return (
                <div
                    key={lead.id}
                    className="border-l-4 border-blue-500 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-all duration-300 bg-white"
                    onClick={() => {
                        setSelectedLead(lead.id);
                        setSelectedPartner(null);
                        if (selectedTab !== 'assign') {
                            setSelectedTab('assign');
                        }
                    }}
                >
                    <div className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="rounded-full bg-gray-100 p-2 mr-3">
                                    <User size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <h6 className="mb-1 font-bold">{lead.customerName}</h6>
                                    <p className="mb-1 text-gray-500 text-sm">
                                        <Home size={12} className="inline mr-1" />
                                        {lead.projectType} •
                                        <Bolt size={12} className="inline mx-1" />
                                        {lead.systemSize} •
                                        <IndianRupee size={12} className="inline mx-1" />
                                        {lead.budget}
                                    </p>
                                    <p className="mb-0 text-gray-400 text-xs">
                                        <MapPin size={10} className="inline mr-1" />
                                        {location}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                                    {lead.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const renderHistoryTable = () => {
        const filteredHistory = historyFilter === 'all'
            ? assignmentHistory
            : assignmentHistory.filter(assignment =>
                assignment.assignedToType.toLowerCase().replace(' ', '_') === historyFilter
            );

        return filteredHistory.map((assignment, index) => {
            const statusClass = getStatusBadgeClass(assignment.status);
            const typeBadgeClass = assignment.assignedToType === 'Dealer'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800';

            return (
                <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{assignment.leadId}</td>
                    <td className="py-3 px-4">{assignment.leadName}</td>
                    <td className="py-3 px-4">
                        <div className="font-semibold">{assignment.projectType}</div>
                        <div className="text-sm text-gray-500">{assignment.systemSize}</div>
                    </td>
                    <td className="py-3 px-4">{assignment.assignedToName}</td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeBadgeClass}`}>
                            {assignment.assignedToType}
                        </span>
                    </td>
                    <td className="py-3 px-4">{assignment.assignedDate}</td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                            {assignment.status}
                        </span>
                    </td>
                </tr>
            );
        });
    };

    const assignLead = () => {
        if (selectedLead === null) {
            alert('Please select a solar project lead');
            return;
        }

        if (selectedPartner === null) {
            alert('Please select a partner to assign');
            return;
        }

        const lead = solarLeads.find(l => l.id === selectedLead);
        let partner;

        if (selectedPartnerType === 'dealer') {
            partner = dealers.find(d => d.id === selectedPartner);
        } else {
            partner = salesManagers.find(sm => sm.id === selectedPartner);
        }

        // Create new assignment
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newAssignment = {
            leadId: lead.id,
            leadName: lead.customerName,
            assignedToId: partner.id,
            assignedToName: partner.name,
            assignedToType: partner.type,
            assignedBy: 'Current User',
            assignedDate: `${dateStr} ${timeStr}`,
            status: 'Assigned',
            projectType: lead.projectType,
            systemSize: lead.systemSize,
        };

        // Add to history
        setAssignmentHistory([newAssignment, ...assignmentHistory]);

        alert(`Solar project lead ${lead.customerName} assigned to ${partner.name} successfully!`);

        // Reset form
        setSelectedLead(null);
        setSelectedPartner(null);
    };

    const isAssignButtonEnabled = selectedLead !== null && selectedPartner !== null;

    return (
        <div className="container mx-auto px-4 py-3 max-w-7xl">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm mb-4 border-0">
                <div className="p-6">
                    <h4 className="text-xl mb-1 text-blue-600 font-semibold">Lead Management</h4>
                    <p className="text-gray-500 mb-0">Efficiently assign and track solar project leads</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-4 border-0">
                <div className="p-2">
                    <div className="flex space-x-2">
                        <button
                            className={`flex-1 md:flex-none px-5 py-3 rounded-lg transition-all duration-300 ${selectedTab === 'assign'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => setSelectedTab('assign')}
                        >
                            <UserPlus size={18} className="inline mr-2" />
                            <span>Assign Lead</span>
                        </button>
                        <button
                            className={`flex-1 md:flex-none px-5 py-3 rounded-lg transition-all duration-300 ${selectedTab === 'history'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => setSelectedTab('history')}
                        >
                            <History size={18} className="inline mr-2" />
                            <span>History</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Assign Lead Content */}
            {selectedTab === 'assign' && (
                <>
                    {/* Main Assignment Card */}
                    <div className="bg-white rounded-lg shadow-sm mb-4 border-0">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-9 h-9 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <ClipboardList size={20} className="text-green-600" />
                                </div>
                                <h5 className="text-lg font-bold text-green-600 mb-0">Assign Solar Project Lead</h5>
                            </div>

                            {/* Lead Selection */}
                            <div className="mb-4">
                                <h6 className="text-blue-600 font-semibold mb-3 flex items-center">
                                    <Users size={16} className="mr-2" />
                                    Select Solar Project Lead
                                </h6>
                                <p className="text-gray-500 mb-3 text-sm">Choose a lead to assign:</p>

                                <div className="overflow-x-auto whitespace-nowrap pb-3">
                                    {renderLeadCards()}
                                </div>
                            </div>

                            {/* Assign To */}
                            <div className="mb-4">
                                <h6 className="text-blue-600 font-semibold mb-3 flex items-center">
                                    <Share2 size={16} className="mr-2" />
                                    Assign To
                                </h6>

                                <div className="overflow-x-auto whitespace-nowrap pb-3">
                                    {/* Dealer Card */}
                                    <div
                                        className={`inline-block w-[140px] h-[90px] rounded-lg border-2 mr-2 cursor-pointer transition-all duration-300 ${selectedPartnerType === 'dealer'
                                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        onClick={() => {
                                            setSelectedPartnerType('dealer');
                                            setSelectedPartner(null);
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-2">
                                                <User size={20} className="text-blue-600" />
                                            </div>
                                            <span className="font-bold text-green-600">Dealer</span>
                                        </div>
                                    </div>

                                    {/* Sales Manager Card */}
                                    <div
                                        className={`inline-block w-[140px] h-[90px] rounded-lg border-2 mr-2 cursor-pointer transition-all duration-300 ${selectedPartnerType === 'sales_manager'
                                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        onClick={() => {
                                            setSelectedPartnerType('sales_manager');
                                            setSelectedPartner(null);
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-2">
                                                <Users size={20} className="text-blue-600" />
                                            </div>
                                            <span className="font-bold text-blue-600">Sales Manager</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Selection */}
                            <div className="mb-4">
                                <h6 className="text-blue-600 font-semibold mb-3 flex items-center">
                                    <UserRound size={16} className="mr-2" />
                                    Select {selectedPartnerType === 'dealer' ? 'Dealer' : 'Sales Manager'}
                                </h6>
                                <p className="text-gray-500 mb-3 text-sm">
                                    Choose a {selectedPartnerType === 'dealer' ? 'dealer' : 'sales manager'} to assign lead:
                                </p>

                                <div className="overflow-x-auto whitespace-nowrap pb-3">
                                    {renderPartnerCards()}
                                </div>
                            </div>

                            {/* Assign Button */}
                            <div className="text-center mt-4">
                                <button
                                    className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg ${isAssignButtonEnabled
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-xl cursor-pointer'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!isAssignButtonEnabled}
                                    onClick={assignLead}
                                >
                                    <Send size={18} className="inline mr-2" />
                                    Assign Solar Project Lead
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Available Leads */}
                    <div className="bg-white rounded-lg shadow-sm mb-4 border-0">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center mr-3">
                                    <List size={20} className="text-orange-600" />
                                </div>
                                <h5 className="text-lg font-bold text-orange-600 mb-0">Available Solar Project Leads</h5>
                            </div>

                            <div>
                                {renderAvailableLeadsGrid()}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* History Content */}
            {selectedTab === 'history' && (
                <div className="bg-white rounded-lg shadow-sm mb-4 border-0">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div className="flex items-center mb-3 md:mb-0">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <History size={20} className="text-blue-600" />
                                </div>
                                <h5 className="text-lg font-bold text-blue-600 mb-0">Lead Assignment History</h5>
                            </div>

                            <div className="w-full md:w-64">
                                <select
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={historyFilter}
                                    onChange={(e) => setHistoryFilter(e.target.value)}
                                >
                                    <option value="all">All Assignments</option>
                                    <option value="dealer">Dealer Only</option>
                                    <option value="sales_manager">Sales Manager Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Lead ID</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Customer</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Project</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Assigned To</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Type</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Date</th>
                                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderHistoryTable()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseProjectManagementAssignLead;