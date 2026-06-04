import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    Eye,
    XCircle,
    FileText,
    Loader
} from 'lucide-react';
import { dealerManagerApi } from '../../../services/dealerManager/dealerManagerApi';
import { ticketApi } from '../../../services/tickets/ticketApi';
import { disputeApi } from '../../../services/tickets/disputeApi';
import { getCategories, getProjectTypes, getSubCategories, getSubProjectTypes } from '../../../services/core/masterApi';

const DealerManagerServiceTicket = () => {
    // Dropdown Data States
    const [categories, setCategories] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subProjectTypes, setSubProjectTypes] = useState([]);
    const [dealers, setDealers] = useState([]);

    // Selection States
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedProjectType, setSelectedProjectType] = useState('');
    const [selectedSubProjectType, setSelectedSubProjectType] = useState('');
    const [selectedDealer, setSelectedDealer] = useState('');

    // Dynamic Data States
    const [customers, setCustomers] = useState([]); // Filled when Dealer is selected
    const [tickets, setTickets] = useState([]);     // Filled on Mount

    // UI Modals & Loading States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [updateNote, setUpdateNote] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingCustomers, setFetchingCustomers] = useState(false);

    // Form State
    const [ticketForm, setTicketForm] = useState({
        dealerId: '',
        projectId: '', // Represents the Customer's Project
        product: '',
        installDate: '',
        faultType: '',
        serviceType: '',
        description: '',
        priority: '',
        photo: null
    });

    // Mount Effect: Load primary filters and all tracked tickets
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Load Dropdowns
            const catResponse = await getCategories();
            if (catResponse) setCategories(catResponse);

            const ptResponse = await getProjectTypes();
            if (ptResponse) setProjectTypes(ptResponse);

            // Load Dealers scoped to this Manager
            const dealersRes = await dealerManagerApi.getMyDealers();
            if (dealersRes?.success) {
                setDealers(dealersRes.data);
            }

            // Load Tickets scoped to this Manager's hierarchy
            loadTickets();

        } catch (error) {
            console.error("Failed to load initial ticket data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTickets = async () => {
        try {
            const ticketData = await ticketApi.fetchTickets();
            if (ticketData) {
                setTickets(ticketData);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    // When Dealer is selected -> Fetch their assigned Customers (Projects)
    const handleDealerChange = async (e) => {
        const dealerId = e.target.value;
        setSelectedDealer(dealerId);
        setTicketForm({ ...ticketForm, dealerId: dealerId });

        if (!dealerId) {
            setCustomers([]);
            return;
        }

        setFetchingCustomers(true);
        try {
            const customerRes = await dealerManagerApi.getDealerCustomers(dealerId);
            if (customerRes?.success) {
                setCustomers(customerRes.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error("Failed to load dealer customers:", error);
            setCustomers([]);
        } finally {
            setFetchingCustomers(false);
        }
    };

    // When Customer (Project) is selected in Form -> Auto populate Product/InstallDate
    const handleCustomerChange = (e) => {
        const projectId = e.target.value;
        const selectedCustomer = customers.find(c => c.id === projectId);

        if (selectedCustomer) {
            setTicketForm({
                ...ticketForm,
                projectId: projectId,
                product: selectedCustomer.product,
                installDate: selectedCustomer.installDate !== 'Pending' ? selectedCustomer.installDate : ''
            });
        } else {
            setTicketForm({ ...ticketForm, projectId: '' });
        }
    };

    // Submit newly Raised Ticket
    const submitTicket = async (e) => {
        e.preventDefault();

        // Validate required fields (Removed projectId and product requirement per user request)
        if (!ticketForm.dealerId || !ticketForm.faultType ||
            !ticketForm.serviceType || !ticketForm.description || !ticketForm.priority) {
            alert('Please fill all required fields');
            return;
        }

        try {
            // Map form state to backend expected payload
            const payload = {
                projectId: ticketForm.projectId || null, // Links to Project Model (optional)
                issueType: ticketForm.faultType,
                component: ticketForm.serviceType,   // Component expects Service Component Scope enum
                description: ticketForm.description,
                priority: ticketForm.priority === 'high' ? 'Urgent' : 'Normal', // Adjusting to Schema Enums ['Normal', 'Urgent']
                media: [] // Setup for photos if handling file uploads in future (Cloudinary, etc.)
            };

            const createdTicket = await ticketApi.createTicket(payload);

            // Push to local state for immediate UI update
            setTickets([createdTicket, ...tickets]);

            setIsModalOpen(false);

            // Reset Form & Selections
            setTicketForm({
                dealerId: '', projectId: '', product: '', installDate: '',
                faultType: '', serviceType: '', description: '', priority: '', photo: null
            });
            setSelectedDealer('');
            setCustomers([]);

            alert('Service Ticket Raised Successfully!');
        } catch (error) {
            alert('Error raising ticket: ' + (error.message || 'Unknown Server Error'));
        }
    };

    const handleUpdateTicketStatus = async () => {
        if (!selectedTicket || !newStatus) return;

        try {
            setLoading(true);
            const response = await ticketApi.updateTicketStatus(selectedTicket._id, {
                status: newStatus,
                note: updateNote
            });

            // Update local state
            setSelectedTicket(response);
            setUpdateNote('');
            setNewStatus('');

            // Refresh main list
            loadTickets();
            alert('Ticket updated successfully!');
        } catch (error) {
            console.error("Failed to update ticket status:", error);
            alert('Error updating ticket: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const handleEscalateToDispute = async () => {
        if (!selectedTicket) return;

        if (!window.confirm('Are you sure you want to escalate this ticket to a Formal Dispute?')) return;

        try {
            setLoading(true);
            const disputePayload = {
                type: 'service',
                priority: selectedTicket.priority === 'Urgent' ? 'high' : 'medium',
                subject: `Escalated: ${selectedTicket.ticketId} - ${selectedTicket.issueType}`,
                relatedTo: 'service',
                referenceId: selectedTicket.ticketId,
                description: `Escalated from Service Ticket ${selectedTicket.ticketId}.\n\nOriginal Description: ${selectedTicket.description}`,
                relatedTicket: selectedTicket._id
            };

            const response = await disputeApi.createDispute(disputePayload);

            if (response.success) {
                // Update ticket status to reflect escalation
                await ticketApi.updateTicketStatus(selectedTicket._id, {
                    status: 'In Progress',
                    note: `Ticket escalated to Formal Dispute: ${response.data.disputeId}`
                });

                alert(`Successfully escalated to Dispute: ${response.data.disputeId}`);
                setIsViewModalOpen(false);
                setSelectedTicket(null);
                loadTickets();
            }
        } catch (error) {
            console.error("Escalation failed:", error);
            alert('Error escalating to dispute: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    // UI Color Mapper
    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Technician Assigned': return 'bg-purple-100 text-purple-800';
            case 'Replacement Completed': return 'bg-indigo-100 text-indigo-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2 text-sm">
                            <li className="breadcrumb-item active w-100">
                                <h3 className="text-xl font-semibold text-gray-800">Raise Service Ticket</h3>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading filters & tickets...</span>
                </div>
            ) : (
                <>
                    {/* Filter & Franchisee Selection Card */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="p-6">
                            <h5 className="text-lg font-semibold text-gray-800 mb-4">Select Franchisee</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {/* Category Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={selectedCategory}
                                        onChange={async (e) => {
                                            const catId = e.target.value;
                                            setSelectedCategory(catId);
                                            setSelectedSubCategory('');
                                            if (catId) {
                                                const subs = await getSubCategories(selectedProjectType, catId);
                                                setSubCategories(subs);
                                            } else {
                                                setSubCategories([]);
                                            }
                                        }}
                                    >
                                        <option value="">All Category Types</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Project Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={selectedProjectType}
                                        onChange={async (e) => {
                                            const ptId = e.target.value;
                                            setSelectedProjectType(ptId);
                                            setSelectedSubProjectType('');
                                            // Assuming SubProjectTypes depend only on ProjectType
                                            if (ptId) {
                                                const subPts = await getSubProjectTypes(ptId);
                                                setSubProjectTypes(subPts);
                                                // Also refetch subcategories if both are linked
                                                if (selectedCategory) {
                                                    const subs = await getSubCategories(ptId, selectedCategory);
                                                    setSubCategories(subs);
                                                }
                                            } else {
                                                setSubProjectTypes([]);
                                                if (selectedCategory) {
                                                    const subs = await getSubCategories('', selectedCategory);
                                                    setSubCategories(subs);
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">All Project Types</option>
                                        {projectTypes.map(pt => (
                                            <option key={pt._id} value={pt._id}>{pt.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sub Category & Sub Project Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Type</label>
                                    <select
                                        className={`w-full p-2 border rounded ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                                        disabled={!selectedCategory}
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    >
                                        <option value="">All Sub category Types</option>
                                        {subCategories.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project Type</label>
                                    <select
                                        className={`w-full p-2 border rounded ${!selectedProjectType ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                                        disabled={!selectedProjectType}
                                        value={selectedSubProjectType}
                                        onChange={(e) => setSelectedSubProjectType(e.target.value)}
                                    >
                                        <option value="">All Sub Project Types</option>
                                        {subProjectTypes.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Channel Partner / Franchisee Selection */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Partner</label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={selectedDealer}
                                        onChange={handleDealerChange}
                                    >
                                        <option value="">-- Select Assigned Partner --</option>
                                        {dealers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} {d.companyName ? `(${d.companyName})` : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Raise Ticket Button Area */}
                                <div className="flex items-end lg:col-span-2 justify-end">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Raise New Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customers associated with Dealer */}
                    {selectedDealer && (
                        <div className="bg-white rounded-lg shadow-sm mb-6">
                            <div className="p-6">
                                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    Customer Service Requests
                                    {fetchingCustomers && <Loader className="w-4 h-4 ml-3 text-gray-500 animate-spin" />}
                                </h5>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left border">Customer Name</th>
                                                <th className="px-4 py-3 text-left border">Product</th>
                                                <th className="px-4 py-3 text-left border">Installation Date</th>
                                                <th className="px-4 py-3 text-left border">Contact</th>
                                                <th className="px-4 py-3 text-left border">Project Status</th>
                                                <th className="px-4 py-3 text-center border">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.length === 0 && !fetchingCustomers ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-gray-500 border">No customers found for this partner.</td>
                                                </tr>
                                            ) : (
                                                customers.map((customer) => (
                                                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                                                        <td className="px-4 py-3 border font-medium">{customer.name}</td>
                                                        <td className="px-4 py-3 border">{customer.product}</td>
                                                        <td className="px-4 py-3 border">{customer.installDate}</td>
                                                        <td className="px-4 py-3 border">{customer.mobile}</td>
                                                        <td className="px-4 py-3 border">
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                                                {customer.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 border text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setTicketForm({
                                                                        ...ticketForm,
                                                                        dealerId: selectedDealer,
                                                                        projectId: customer.id,
                                                                        product: customer.product,
                                                                        installDate: customer.installDate !== 'Pending' ? customer.installDate : '',
                                                                        faultType: 'Performance Issue', // Default starter
                                                                        serviceType: 'repair'
                                                                    });
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs shadow-sm shadow-green-200"
                                                            >
                                                                Raise Ticket
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ticket Tracking Board */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6">
                            <h5 className="text-lg font-semibold text-gray-800 mb-4">Ticket Tracking</h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left border">Ticket ID</th>
                                            <th className="px-4 py-3 text-left border">Raised Date</th>
                                            <th className="px-4 py-3 text-left border">Customer Name</th>
                                            <th className="px-4 py-3 text-left border">Contact</th>
                                            <th className="px-4 py-3 text-left border">Fault Component</th>
                                            <th className="px-4 py-3 text-left border">Issue Type</th>
                                            <th className="px-4 py-3 text-left border">Current Status</th>
                                            <th className="px-4 py-3 text-center border">Proof/Doc</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4 text-gray-500 border">No tickets raised in your territory yet.</td>
                                            </tr>
                                        ) : (
                                            tickets.map((ticket) => (
                                                <tr key={ticket._id} className="border-t hover:bg-gray-50">
                                                    <td className="px-4 py-3 border font-semibold text-blue-700">{ticket.ticketId}</td>
                                                    <td className="px-4 py-3 border">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 border font-medium">{ticket.customerName}</td>
                                                    <td className="px-4 py-3 border">{ticket.customerPhone}</td>
                                                    <td className="px-4 py-3 border">{ticket.component}</td>
                                                    <td className="px-4 py-3 border">{ticket.issueType}</td>
                                                    <td className="px-4 py-3 border">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border text-center">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTicket(ticket);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs flex items-center mx-auto shadow-sm shadow-amber-200">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* View Ticket Details Modal */}
            {isViewModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h5 className="text-xl font-bold flex items-center text-gray-800">
                                    <Eye className="w-6 h-6 mr-2 text-amber-500" />
                                    Ticket Details: {selectedTicket.ticketId}
                                </h5>
                                <button onClick={() => { setIsViewModalOpen(false); setSelectedTicket(null); }} className="text-gray-400 hover:text-red-600 transition-colors">
                                    <XCircle className="w-7 h-7" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Customer Name</p>
                                        <p className="font-medium">{selectedTicket.customerName}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Contact / Phone</p>
                                        <p className="font-medium">{selectedTicket.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Component</p>
                                        <p className="font-medium">{selectedTicket.component}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Issue Type</p>
                                        <p className="font-medium">{selectedTicket.issueType}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Current Status</p>
                                        <span className={`px-2 py-1 mt-1 inline-block rounded-full text-xs font-semibold ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Priority</p>
                                        <p className="font-medium">{selectedTicket.priority}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Description Log</p>
                                    <p className="text-gray-800 whitespace-pre-wrap mt-1 text-sm">{selectedTicket.description}</p>
                                </div>

                                {selectedTicket.history && selectedTicket.history.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Activity History</p>
                                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 font-inter">
                                            {selectedTicket.history.map((h, i) => (
                                                <div key={i} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                                    <div className="flex justify-between font-semibold">
                                                        <span className="text-blue-700">{h.status}</span>
                                                        <span className="text-gray-400 italic">{new Date(h.updatedAt || h.date).toLocaleString()}</span>
                                                    </div>
                                                    {h.note && <p className="text-gray-600 mt-1">{h.note}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Update Status Form */}
                                <div className="mt-6 border-t pt-4">
                                    <p className="text-sm font-bold text-gray-700 mb-3">Add Status Update</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <select
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                        >
                                            <option value="">Select New Status</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Technician Assigned">Technician Assigned</option>
                                            <option value="Replacement Completed">Replacement Completed</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                    <textarea
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                        rows="2"
                                        placeholder="Write an internal note or update message..."
                                        value={updateNote}
                                        onChange={(e) => setUpdateNote(e.target.value)}
                                    ></textarea>
                                    <button
                                        onClick={handleUpdateTicketStatus}
                                        disabled={!newStatus || loading}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                                    >
                                        Submit Update
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                                    <button
                                        onClick={handleEscalateToDispute}
                                        disabled={loading}
                                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 shadow-sm transition-colors border border-red-200"
                                    >
                                        Escalate to Dispute
                                    </button>
                                )}
                                <button onClick={() => { setIsViewModalOpen(false); setSelectedTicket(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 shadow-sm transition-colors">
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Raise Ticket Super Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h5 className="text-xl font-bold flex items-center text-gray-800">
                                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                                    Raise New Service Ticket
                                </h5>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600 transition-colors">
                                    <XCircle className="w-7 h-7" />
                                </button>
                            </div>

                            <form onSubmit={submitTicket}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    {/* Franchisee Partner Lock */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Franchisee Partner <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={ticketForm.dealerId}
                                            onChange={(e) => {
                                                setTicketForm({ ...ticketForm, dealerId: e.target.value, projectId: '' });
                                                setSelectedDealer(e.target.value);
                                                // Wait for native handler above to push customer states if needed.
                                            }}
                                            required
                                        >
                                            <option value="">Select Assignee</option>
                                            {dealers.map(d => (
                                                <option key={d._id} value={d._id}>{d.name} {d.companyName ? `(${d.companyName})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Customer / Project Selector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Affected Customer
                                        </label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={ticketForm.projectId}
                                            onChange={handleCustomerChange}
                                        >
                                            <option value="">Select Target Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Originating Product
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg bg-gray-100 cursor-not-allowed"
                                            value={ticketForm.product}
                                            placeholder="System Product"
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Installation Target Date</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border rounded-lg bg-gray-100 cursor-not-allowed"
                                            value={ticketForm.installDate || 'Unknown Date'}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    {/* Fault Type matched to Ticket Schema enums */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Issue Indicator <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={ticketForm.faultType}
                                            onChange={(e) => setTicketForm({ ...ticketForm, faultType: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Condition Group</option>
                                            <option value="Performance Issue">Performance Issue</option>
                                            <option value="Physical Damage">Physical Damage</option>
                                            <option value="Monitoring System Problem">Monitoring System Problem</option>
                                            <option value="Billing Issue">Billing Issue</option>
                                            <option value="Other">Other Miscellaneous</option>
                                        </select>
                                    </div>

                                    {/* Component Type matched to Ticket Schema enums */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Service Component Scope <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={ticketForm.serviceType}
                                            onChange={(e) => setTicketForm({ ...ticketForm, serviceType: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Target Component</option>
                                            <option value="Solar Panel">Solar Panel Main</option>
                                            <option value="BOS Kit">BOS Mounting/Wiring</option>
                                            <option value="Inverter">Inverter Core</option>
                                            <option value="Other">Unknown/General System</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Deep Description */}
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Detailed Symptom Description <span className="text-red-500">*</span>
                                        <span className="text-xs font-normal text-gray-500 float-right mt-1">(Min length: 30 characters)</span>
                                    </label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
                                        rows="4"
                                        minLength={30}
                                        placeholder="Please provide full transparency on the encountered fault including timestamps..."
                                        value={ticketForm.description}
                                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 items-end">
                                    {/* Priority Level */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            SLA Priority Class <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={ticketForm.priority}
                                            onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                            required
                                        >
                                            <option value="">Select SLA Priority</option>
                                            <option value="low">Low (Standard Dispatch)</option>
                                            <option value="high">Urgent (48H Dispatch)</option>
                                        </select>
                                    </div>

                                    {/* Optional Proof Doc Loader Placeholder */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Evidence Attached Photo (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept="image/*"
                                            onChange={(e) => setTicketForm({ ...ticketForm, photo: e.target.files[0] })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                    <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 shadow-sm transition-colors">
                                        Cancel Operation
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow flex flex-row items-center transition-colors">
                                        <PlusCircle className="mr-2 w-5 h-5" />
                                        Initialize Ticket
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerServiceTicket;