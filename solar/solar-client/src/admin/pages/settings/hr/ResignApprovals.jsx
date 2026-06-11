import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    createResignationRequest,
    getResignationRequests,
    approveResignation,
    rejectResignation
} from '../../../../services/hr/hrApi';
import { getEmployees } from '../../../../services/hr/hrApi';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';

const ResignApprovals = () => {
    // State for Create Resignation Request
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        department: '',
        position: '',
        resignationDate: '',
        noticePeriodDays: '',
        lastWorkingDate: '',
        reason: ''
    });

    // State for Resignations Table
    const [resignRequests, setResignRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Fetch initial data
    useEffect(() => {
        fetchEmployees();
        fetchAllResignRequests();
    }, []);

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const response = await getEmployees();
            if (Array.isArray(response)) {
                setEmployees(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setEmployees(response.data);
            } else if (response?.users && Array.isArray(response.users)) {
                setEmployees(response.users);
            } else {
                setEmployees([]);
            }
        } catch (err) {
            console.error('Failed to fetch employees', err);
            toast.error('Failed to load employee list');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchAllResignRequests = async () => {
        setLoadingRequests(true);
        try {
            const response = await getResignationRequests();
            if (response.success || response.data?.success) {
                setResignRequests(response.data || response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch resignation requests', err);
            toast.error('Failed to load resignation requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    // Form Handlers
    const handleEmployeeChange = (e) => {
        const empId = e.target.value;
        const selectedEmp = employees.find(emp => emp._id === empId);
        setFormData({
            ...formData,
            employee: empId,
            department: selectedEmp?.department?._id || '',
            position: selectedEmp?.role || 'employee'
        });
    };

    const handleDateOrNoticeChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        if (name === 'resignationDate' || name === 'noticePeriodDays') {
            const rDate = name === 'resignationDate' ? value : newFormData.resignationDate;
            const npDays = name === 'noticePeriodDays' ? value : newFormData.noticePeriodDays;

            if (rDate && npDays !== '') {
                const dateObj = new Date(rDate);
                dateObj.setDate(dateObj.getDate() + parseInt(npDays || 0, 10));
                newFormData.lastWorkingDate = dateObj.toISOString().split('T')[0];
            } else {
                newFormData.lastWorkingDate = '';
            }
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createResignationRequest(formData);
            toast.success('Resignation Request Created Successfully');
            // Reset form
            setFormData({
                employee: '', department: '', position: '',
                resignationDate: '', noticePeriodDays: '', lastWorkingDate: '', reason: ''
            });
            // Refresh list
            fetchAllResignRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error creating resignation request');
        }
    };

    // Modal Handlers
    const openModal = (request) => {
        setSelectedRequest(request);
        setRejectReason('');
        setIsModalOpen(true);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveResignation(selectedRequest._id);
            toast.success('Resignation Approved Successfully');
            setIsModalOpen(false);
            fetchAllResignRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error approving resignation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }
        setActionLoading(true);
        try {
            await rejectResignation(selectedRequest._id, rejectReason);
            toast.success('Resignation Rejected');
            setIsModalOpen(false);
            fetchAllResignRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error rejecting resignation');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold border-l-4 border-blue-600 pl-4 text-gray-800">Resign Approvals</h1>
            </div>

            {/* SECTION 1: CREATE RESIGNATION REQUEST */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-3">Create Resignation Request (Manual Admin Entry)</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Employee Selection */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            value={formData.employee}
                            onChange={handleEmployeeChange}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.userId || emp.phone})</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resignation Date</label>
                        <input
                            type="date"
                            name="resignationDate"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.resignationDate}
                            onChange={handleDateOrNoticeChange}
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (Days)</label>
                        <input
                            type="number"
                            name="noticePeriodDays"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.noticePeriodDays}
                            onChange={handleDateOrNoticeChange}
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Working Date (Auto Calculated)</label>
                        <input
                            type="date"
                            readOnly
                            className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-blue-900 font-bold"
                            value={formData.lastWorkingDate}
                        />
                    </div>

                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Resignation</label>
                        <textarea
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-span-3">
                        <button
                            type="submit"
                            disabled={loadingEmployees}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            Submit Resignation Request
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: RESIGNATION APPROVAL TABLE */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Resignation Requests Table</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                                <th className="p-4 rounded-tl-lg font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Department & Pos</th>
                                <th className="p-4 font-semibold">Resignation Date</th>
                                <th className="p-4 font-semibold">Notice Period (Days)</th>
                                <th className="p-4 font-semibold">Last Working Date</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 rounded-tr-lg font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {loadingRequests ? (
                                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Loading resignation requests...</td></tr>
                            ) : resignRequests.length === 0 ? (
                                <tr><td colSpan="7" className="text-center p-8 text-gray-500">No resignation requests found.</td></tr>
                            ) : (
                                resignRequests.map(req => (
                                    <tr key={req._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">{req.employee?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">ID: {req.employee?.userId || req.employee?.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div>{req.department?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 uppercase">{req.position || req.employee?.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-800">{new Date(req.resignationDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">{req.noticePeriodDays} days</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-800">{new Date(req.lastWorkingDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    req.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-center">
                                            <button
                                                onClick={() => openModal(req)}
                                                className="flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm"
                                            >
                                                <Eye size={14} /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 3: VIEW DETAILS MODAL */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="text-blue-600" /> Resignation Request Details
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 border">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Employee Info</p>
                                    <p className="font-bold text-gray-800 text-lg">{selectedRequest.employee?.name}</p>
                                    <p className="text-sm text-gray-600">EMP ID: {selectedRequest.employee?.userId || selectedRequest.employee?.phone}</p>
                                    <p className="text-sm text-gray-600 mt-2">{selectedRequest.department?.name} • <span className="uppercase">{selectedRequest.position || selectedRequest.employee?.role}</span></p>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Resignation Info</p>
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-sm text-gray-700">Resigned On: {new Date(selectedRequest.resignationDate).toLocaleDateString()}</p>
                                            <p className="text-sm font-bold text-gray-800 mt-1">LWD: {new Date(selectedRequest.lastWorkingDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-blue-600">{selectedRequest.noticePeriodDays}</span> <span className="text-xs font-semibold text-blue-600 uppercase">Days Notice</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Reason for Resignation:</h4>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 items-center rounded-lg border">{selectedRequest.reason}</p>
                            </div>

                            {selectedRequest.status === 'Pending' && (
                                <div className="bg-yellow-50/30 p-4 rounded-xl border border-yellow-100/50">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Rejection Reason</label>
                                    <input
                                        type="text"
                                        placeholder="If rejecting, specify here..."
                                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            )}

                        </div>

                        {selectedRequest.status === 'Pending' ? (
                            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-medium transition disabled:opacity-50"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
                                >
                                    <CheckCircle size={18} /> Approve Resignation
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600 rounded-b-2xl">
                                This request has been <span className="font-bold text-gray-800">{selectedRequest.status}</span>. No further actions available.
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default ResignApprovals;
