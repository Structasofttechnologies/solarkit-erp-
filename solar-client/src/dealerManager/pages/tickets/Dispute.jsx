import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    Filter,
    X,
    Plus,
    Eye,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Flag,
    FileText,
    Paperclip,
    Calendar,
    User,
    Upload
} from 'lucide-react';
import { disputeApi } from '../../../services/tickets/disputeApi';

const DealerManagerDispute = () => {
    // State for filters
    const [disputeType, setDisputeType] = useState('');
    const [disputeStatus, setDisputeStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // State for modals
    const [isNewDisputeModalOpen, setIsNewDisputeModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [updateNote, setUpdateNote] = useState('');

    // State for new dispute form
    const [newDispute, setNewDispute] = useState({
        type: '',
        priority: '',
        subject: '',
        relatedTo: '',
        referenceId: '',
        description: '',
        attachments: []
    });

    // Import api handler (add import path manually if needed inside the component or at top)
    // Note: It's better to import at the top level

    // Sample dispute data replaced by real state
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch disputes from API
    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const data = await disputeApi.getDisputes({
                type: disputeType,
                status: disputeStatus,
                fromDate: dateFrom,
                toDate: dateTo
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
    }, [disputeType, disputeStatus, dateFrom, dateTo]);

    // Get filtered disputes (Real filtering is done on backend via API now, but keeping client-side fallback just in case)
    const getFilteredDisputes = () => {
        let filtered = [...disputes];

        if (disputeType) {
            filtered = filtered.filter(d => d.type === disputeType);
        }

        if (disputeStatus) {
            filtered = filtered.filter(d => d.status === disputeStatus);
        }

        // Note: In a real app, you would implement date filtering
        // This is just a placeholder for the demo

        return filtered;
    };

    const filteredDisputes = getFilteredDisputes();

    // Reset filters
    const resetFilters = () => {
        setDisputeType('');
        setDisputeStatus('');
        setDateFrom('');
        setDateTo('');
    };

    // Handle new dispute form changes
    const handleNewDisputeChange = (e) => {
        const { id, value, files } = e.target;
        if (id === 'disputeAttachments') {
            setNewDispute({ ...newDispute, attachments: Array.from(files) });
        } else {
            setNewDispute({ ...newDispute, [id.replace('new', '').toLowerCase()]: value });
        }
    };

    // Submit new dispute
    const submitDispute = async () => {
        // Validate form
        if (!newDispute.type || !newDispute.priority || !newDispute.subject || !newDispute.relatedTo || !newDispute.description) {
            alert('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await disputeApi.createDispute({
                type: newDispute.type,
                priority: newDispute.priority,
                subject: newDispute.subject,
                relatedTo: newDispute.relatedTo,
                referenceId: newDispute.referenceId,
                description: newDispute.description,
                // Attachments are ignored currently or mapped separately via Cloudinary if implemented
            });

            if (response.success) {
                // Refresh list
                fetchDisputes();
                setIsNewDisputeModalOpen(false);

                // Reset form
                setNewDispute({
                    type: '', priority: '', subject: '', relatedTo: '', referenceId: '', description: '', attachments: []
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

    // View dispute details
    const viewDisputeDetails = (disputeId) => {
        const dispute = disputes.find(d => d._id === disputeId);
        if (dispute) {
            setSelectedDispute(dispute);
            setIsDetailModalOpen(true);
        }
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Open' };
            case 'in_progress': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' };
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };

    // Get priority badge color
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'low': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Low' };
            case 'medium': return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Medium' };
            case 'high': return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' };
            case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: priority };
        }
    };

    // Get type label
    const getTypeLabel = (type) => {
        switch (type) {
            case 'payment': return 'Payment Dispute';
            case 'service': return 'Service Quality';
            case 'warranty': return 'Warranty Claim';
            case 'contract': return 'Contract Terms';
            case 'other': return 'Other';
            default: return type;
        }
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

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
            {/* Header with Breadcrumb */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2 text-sm">
                            <li className="breadcrumb-item active w-100">
                                <h3 className="text-xl font-semibold text-gray-800">Dispute Management</h3>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Dispute Filters */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-6">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4">Filter Disputes</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Dispute Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dispute Type</label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={disputeType}
                                onChange={(e) => setDisputeType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="payment">Payment Dispute</option>
                                <option value="service">Service Quality</option>
                                <option value="warranty">Warranty Claim</option>
                                <option value="contract">Contract Terms</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={disputeStatus}
                                onChange={(e) => setDisputeStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <div>
                            <button
                                onClick={() => { }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="ml-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                        <button
                            onClick={() => setIsNewDisputeModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Dispute
                        </button>
                    </div>
                </div>
            </div>

            {/* Disputes Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4">Dispute Records</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left border">Dispute ID</th>
                                    <th className="px-4 py-3 text-left border">Raised On</th>
                                    <th className="px-4 py-3 text-left border">Type</th>
                                    <th className="px-4 py-3 text-left border">Subject</th>
                                    <th className="px-4 py-3 text-left border">Raised By</th>
                                    <th className="px-4 py-3 text-left border">Priority</th>
                                    <th className="px-4 py-3 text-left border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDisputes.map((dispute) => {
                                    const statusBadge = getStatusBadge(dispute.status);
                                    const priorityBadge = getPriorityBadge(dispute.priority);

                                    return (
                                        <tr key={dispute._id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 border font-medium">{dispute.disputeId}</td>
                                            <td className="px-4 py-3 border">{new Date(dispute.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-4 py-3 border">{getTypeLabel(dispute.type)}</td>
                                            <td className="px-4 py-3 border max-w-xs truncate">{dispute.subject}</td>
                                            <td className="px-4 py-3 border">{dispute.raisedBy?.companyName || dispute.raisedBy?.name || 'Unknown User'}</td>
                                            <td className="px-4 py-3 border">
                                                <span className={`px-2 py-1 rounded-full text-xs ${priorityBadge.bg} ${priorityBadge.text}`}>
                                                    {priorityBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border">
                                                <button
                                                    onClick={() => viewDisputeDetails(dispute._id)}
                                                    className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-xs flex items-center"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing 1 to {filteredDisputes.length} of {filteredDisputes.length} entries
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                Previous
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Dispute Modal */}
            {isNewDisputeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-xl font-semibold">Raise New Dispute</h5>
                                <button onClick={() => setIsNewDisputeModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Dispute Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dispute Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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

                                {/* Subject */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={newDispute.subject}
                                        onChange={(e) => setNewDispute({ ...newDispute, subject: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Related To */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Related To <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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

                                {/* Reference ID */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID (if any)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={newDispute.referenceId}
                                        onChange={(e) => setNewDispute({ ...newDispute, referenceId: e.target.value })}
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Detailed Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                        value={newDispute.description}
                                        onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                {/* Attachments */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                                    <input
                                        type="file"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        multiple
                                        onChange={handleNewDisputeChange}
                                    />
                                    <small className="text-gray-500">You can upload multiple files (max 5MB each)</small>
                                </div>
                            </form>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setIsNewDisputeModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitDispute}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Submit Dispute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Detail Modal */}
            {isDetailModalOpen && selectedDispute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-xl font-semibold">Dispute Details</h5>
                                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm"><span className="font-medium">Dispute ID:</span> {selectedDispute.disputeId}</p>
                                    <p className="text-sm mt-1"><span className="font-medium">Raised On:</span> {new Date(selectedDispute.createdAt).toLocaleDateString('en-GB')}</p>
                                    <p className="text-sm mt-1"><span className="font-medium">Type:</span> {getTypeLabel(selectedDispute.type)}</p>
                                    <p className="text-sm mt-1 flex items-center">
                                        <span className="font-medium mr-2">Priority:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(selectedDispute.priority).bg} ${getPriorityBadge(selectedDispute.priority).text}`}>
                                            {getPriorityBadge(selectedDispute.priority).label}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm flex items-center">
                                        <span className="font-medium mr-2">Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedDispute.status).bg} ${getStatusBadge(selectedDispute.status).text}`}>
                                            {getStatusBadge(selectedDispute.status).label}
                                        </span>
                                    </p>
                                    <p className="text-sm mt-1"><span className="font-medium">Raised By:</span> {selectedDispute.raisedBy?.companyName || selectedDispute.raisedBy?.name || 'Unknown User'}</p>
                                    <p className="text-sm mt-1"><span className="font-medium">Related To:</span> {selectedDispute.relatedTo}</p>
                                    <p className="text-sm mt-1"><span className="font-medium">Assigned To:</span> {selectedDispute.assignedTo?.name || 'Unassigned'}</p>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Subject</h6>
                                <p className="text-sm bg-gray-50 p-3 rounded">{selectedDispute.subject}</p>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Description</h6>
                                <p className="text-sm bg-gray-50 p-3 rounded">{selectedDispute.description}</p>
                            </div>

                            {/* Linked Service Ticket */}
                            {selectedDispute.relatedTicket && (
                                <div className="mb-4">
                                    <h6 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Linked Service Ticket
                                    </h6>
                                    <div className="text-sm bg-red-50 p-3 rounded border border-red-100 grid grid-cols-2 gap-2">
                                        <div>
                                            <p><span className="font-semibold">Ticket ID:</span> {selectedDispute.relatedTicket.ticketId}</p>
                                            <p className="mt-1"><span className="font-semibold">Status:</span> {selectedTicket?.status || selectedDispute.relatedTicket.status}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-semibold">Issue:</span> {selectedDispute.relatedTicket.issueType}</p>
                                            <p className="mt-1"><span className="font-semibold">Priorty:</span> {selectedDispute.relatedTicket.priority}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            <div className="mb-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Attachments</h6>
                                {selectedDispute.attachments.length > 0 ? (
                                    <ul className="border rounded divide-y">
                                        {selectedDispute.attachments.map((file, index) => (
                                            <li key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                                <div className="flex items-center">
                                                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm">{file.name}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({file.size})</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No attachments</p>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="mb-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Resolution Progress</h6>
                                <div className="relative pl-6 border-l-2 border-gray-200 ml-2 space-y-4">
                                    {selectedDispute.timeline.map((item, index) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <div>
                                                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</p>
                                                <p className="text-sm mt-1">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add Update */}
                            <div className="mb-3">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Add Update</h6>
                                <textarea
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add your comment or update..."
                                    value={updateNote}
                                    onChange={(e) => setUpdateNote(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={() => handleUpdateDispute()}
                                    disabled={!updateNote.trim() || loading}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                                >
                                    Submit Update
                                </button>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                    disabled={loading}
                                >
                                    Close
                                </button>
                                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleUpdateDispute('resolved')}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
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
    );
};

export default DealerManagerDispute;