import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    Calendar,
    Upload,
    Download,
    Eye,
    Plus,
    Search,
    RefreshCw,
    ChevronRight,
    FileText,
    User,
    Tag,
    AlertTriangle,
    Info,
    MessageCircle,
    Paperclip,
    Star,
    Zap,
    DollarSign,
    Shield,
    Award,
    X
} from 'lucide-react';
import { disputeApi } from '../../../services/tickets/disputeApi';

const FranchiseeManagerDispute = () => {
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updateNote, setUpdateNote] = useState('');
    const [showNewDisputeModal, setShowNewDisputeModal] = useState(false);
    const [newDispute, setNewDispute] = useState({
        type: '',
        priority: '',
        subject: '',
        relatedTo: '',
        referenceId: '',
        description: '',
        attachments: []
    });

    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch disputes from API
    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const data = await disputeApi.getDisputes({
                type: filters.type,
                status: filters.status,
                fromDate: filters.dateFrom,
                toDate: filters.dateTo
            });
            if (data.success) {
                setDisputes(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, [filters.type, filters.status, filters.dateFrom, filters.dateTo]);

    // Get type text
    const getTypeText = (type) => {
        const types = {
            payment: 'Payment Dispute',
            service: 'Service Quality',
            warranty: 'Warranty Claim',
            contract: 'Contract Terms',
            other: 'Other'
        };
        return types[type] || type;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Open', icon: AlertCircle };
            case 'in_progress':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress', icon: Clock };
            case 'resolved':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved', icon: CheckCircle };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: AlertCircle };
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'low':
                return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info };
            case 'medium':
                return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: AlertCircle };
            case 'high':
                return { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle };
            case 'critical':
                return { bg: 'bg-red-100', text: 'text-red-700', icon: Zap };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle };
        }
    };

    // Filter disputes
    const filteredDisputes = disputes.filter(dispute => {
        if (filters.type && dispute.type !== filters.type) return false;
        if (filters.status && dispute.status !== filters.status) return false;
        // Date filtering would be implemented here in a real app
        return true;
    });

    // Reset filters
    const resetFilters = () => {
        setFilters({ type: '', status: '', dateFrom: '', dateTo: '' });
    };

    // View dispute details
    const viewDisputeDetails = (dispute) => {
        setSelectedDispute(dispute);
        setShowDetailModal(true);
    };

    const handleUpdateDispute = async (statusUpdate = null) => {
        if (!selectedDispute) return;
        if (!updateNote.trim() && !statusUpdate) return;

        try {
            setLoading(true);
            const payload = {};
            if (statusUpdate) payload.status = statusUpdate;
            if (updateNote.trim()) payload.note = updateNote;

            const response = await disputeApi.updateDispute(selectedDispute._id, payload);

            if (response.success) {
                // Update local state to reflect changes immediately
                setSelectedDispute(response.data);
                setUpdateNote('');
                // Refresh list
                fetchDisputes();
                alert('Dispute updated successfully!');
            }
        } catch (error) {
            console.error("Failed to update dispute:", error);
            alert('Error updating dispute. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Submit new dispute
    const submitNewDispute = async () => {
        // Validate form
        if (!newDispute.type || !newDispute.priority || !newDispute.subject || !newDispute.relatedTo || !newDispute.description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await disputeApi.createDispute({
                type: newDispute.type,
                priority: newDispute.priority,
                subject: newDispute.subject,
                relatedTo: newDispute.relatedTo === 'payment' ? 'Payment' :
                    newDispute.relatedTo === 'service' ? 'Service Ticket' :
                        newDispute.relatedTo === 'installation' ? 'Installation' :
                            newDispute.relatedTo === 'contract' ? 'Contract' : 'Product',
                referenceId: newDispute.referenceId,
                description: newDispute.description,
            });

            if (response.success) {
                fetchDisputes();
                setShowNewDisputeModal(false);
                setNewDispute({
                    type: '',
                    priority: '',
                    subject: '',
                    relatedTo: '',
                    referenceId: '',
                    description: '',
                    attachments: []
                });

                alert(`New dispute submitted successfully!\n\nSubject: ${response.data.subject}`);
            }
        } catch (error) {
            console.error("Failed to submit dispute:", error);
            alert('Error submitting dispute. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li className="text-gray-500 font-medium" aria-current="page">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <AlertCircle className="mr-2 text-red-500" size={28} />
                                    Dispute Management
                                </h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Disputes</p>
                                <p className="text-2xl font-bold text-gray-700">{disputes.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <AlertCircle size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Open</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {disputes.filter(d => d.status === 'open').length}
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Clock size={20} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">In Progress</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {disputes.filter(d => d.status === 'in_progress').length}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <RefreshCw size={20} className="text-orange-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {disputes.filter(d => d.status === 'resolved').length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                    <div
                        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <h5 className="font-semibold text-gray-700 flex items-center">
                            <Filter size={16} className="mr-2 text-blue-500" />
                            Filter Disputes
                        </h5>
                        <ChevronRight size={16} className={`transform transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                    </div>

                    {showFilters && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dispute Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    >
                                        <option value="">All Types</option>
                                        <option value="payment">Payment Dispute</option>
                                        <option value="service">Service Quality</option>
                                        <option value="warranty">Warranty Claim</option>
                                        <option value="contract">Contract Terms</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <button
                                        onClick={() => filterDisputes?.()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 ml-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowNewDisputeModal(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                                >
                                    <Plus size={16} className="mr-1" />
                                    New Dispute
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Disputes Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h5 className="font-semibold text-gray-700">Dispute Records</h5>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dispute ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Raised On</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Raised By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDisputes.map((dispute) => {
                                    const StatusIcon = getStatusBadge(dispute.status).icon;
                                    const priorityBadge = getPriorityBadge(dispute.priority);
                                    const PriorityIcon = priorityBadge.icon;

                                    return (
                                        <tr key={dispute._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dispute.disputeId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(dispute.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTypeText(dispute.type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dispute.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dispute.raisedBy?.companyName || dispute.raisedBy?.name || 'Unknown User'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                                                    <PriorityIcon size={10} className="mr-1" />
                                                    {dispute.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => viewDisputeDetails(dispute)}
                                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Dispute Modal */}
                {showNewDisputeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xl font-semibold text-gray-800">Raise New Dispute</h5>
                                    <button
                                        onClick={() => setShowNewDisputeModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dispute Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={newDispute.type}
                                                onChange={(e) => setNewDispute({ ...newDispute, type: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="payment">Payment Dispute</option>
                                                <option value="service">Service Quality</option>
                                                <option value="warranty">Warranty Claim</option>
                                                <option value="contract">Contract Terms</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={newDispute.priority}
                                                onChange={(e) => setNewDispute({ ...newDispute, priority: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newDispute.subject}
                                            onChange={(e) => setNewDispute({ ...newDispute, subject: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Related To <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newDispute.relatedTo}
                                            onChange={(e) => setNewDispute({ ...newDispute, relatedTo: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Option</option>
                                            <option value="installation">Installation</option>
                                            <option value="service">Service Ticket</option>
                                            <option value="payment">Payment</option>
                                            <option value="contract">Contract</option>
                                            <option value="product">Product</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reference ID (if any)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newDispute.referenceId}
                                            onChange={(e) => setNewDispute({ ...newDispute, referenceId: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Detailed Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newDispute.description}
                                            onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Attachments
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={(e) => setNewDispute({ ...newDispute, attachments: Array.from(e.target.files) })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">You can upload multiple files (max 5MB each)</p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowNewDisputeModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitNewDispute}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Submit Dispute
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dispute Detail Modal */}
                {showDetailModal && selectedDispute && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xl font-semibold text-gray-800">Dispute Details</h5>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Dispute ID</p>
                                        <p className="font-semibold">{selectedDispute.disputeId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Raised On</p>
                                        <p className="font-semibold">{new Date(selectedDispute.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-semibold">{getTypeText(selectedDispute.type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Priority</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedDispute.priority).bg} ${getPriorityBadge(selectedDispute.priority).text}`}>
                                            {selectedDispute.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedDispute.status).bg} ${getStatusBadge(selectedDispute.status).text}`}>
                                            {getStatusBadge(selectedDispute.status).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Raised By</p>
                                        <p className="font-semibold">{selectedDispute.raisedBy?.companyName || selectedDispute.raisedBy?.name || 'Unknown User'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Related To</p>
                                        <p className="font-semibold">{selectedDispute.relatedTo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned To</p>
                                        <p className="font-semibold">{selectedDispute.assignedTo?.name || 'Unassigned'}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h6 className="font-semibold text-gray-700 mb-2">Subject</h6>
                                    <p className="text-gray-600">{selectedDispute.subject}</p>
                                </div>

                                <div className="mb-6">
                                    <h6 className="font-semibold text-gray-700 mb-2">Description</h6>
                                    <p className="text-gray-600">{selectedDispute.description}</p>
                                </div>

                                <div className="mb-6">
                                    <h6 className="font-semibold text-gray-700 mb-2">Attachments</h6>
                                    <div className="space-y-2">
                                        {selectedDispute.attachments?.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="text-gray-400 mr-2" />
                                                    <span className="text-sm">{file.name}</span>
                                                    <span className="text-xs text-gray-400 ml-2">({file.size})</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h6 className="font-semibold text-gray-700 mb-3">Resolution Progress</h6>
                                    <div className="relative pl-4 border-l-2 border-blue-200 ml-2">
                                        {selectedDispute.timeline?.map((item, index) => (
                                            <div key={index} className="mb-4 relative">
                                                <div className="absolute -left-[1.35rem] top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                                                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString('en-GB')}</p>
                                                <p className="text-sm">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="font-semibold text-gray-700 mb-2">Add Update</h6>
                                    <textarea
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add your comment or update..."
                                        value={updateNote}
                                        onChange={(e) => setUpdateNote(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleUpdateDispute()}
                                        disabled={!updateNote.trim() || loading}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Submit Update
                                    </button>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        Close
                                    </button>
                                    {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleUpdateDispute('resolved')}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FranchiseeManagerDispute;