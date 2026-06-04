import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    createLeaveRequest,
    getLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest
} from '../../../../services/hrms/leaveApi';
import { getEmployees } from '../../../../services/hr/hrApi';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';

const LeaveApprovals = () => {
    // State for Create Leave Request
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        department: '',
        position: '',
        leaveType: 'Paid Leave',
        leaveDuration: 'Full Day',
        halfDayTiming: '',
        fromDate: '',
        toDate: '',
        totalDays: 0,
        reason: '',
        attachment: null
    });

    // State for Leave Approval Table
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [tempIncharge, setTempIncharge] = useState('');

    // Fetch initial data
    useEffect(() => {
        fetchEmployees();
        fetchAllLeaveRequests();
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

    const fetchAllLeaveRequests = async () => {
        setLoadingRequests(true);
        try {
            const response = await getLeaveRequests();
            if (response.data.success) {
                setLeaveRequests(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch leave requests', err);
            toast.error('Failed to load leave requests');
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

    const calculateDays = (from, to) => {
        if (!from || !to) return 0;
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        return diffDays > 0 ? diffDays : 0;
    };

    const handleDurationChange = (e) => {
        const value = e.target.value;
        let newTotalDays = formData.totalDays;
        let newToDate = formData.toDate;

        if (value === 'Full Day') {
            newTotalDays = formData.fromDate ? 1 : 0;
            newToDate = formData.fromDate;
        } else if (value === 'Half Day') {
            newTotalDays = formData.fromDate ? 0.5 : 0;
            newToDate = formData.fromDate;
        } else {
            newTotalDays = calculateDays(formData.fromDate, formData.toDate);
        }

        setFormData({
            ...formData,
            leaveDuration: value,
            totalDays: newTotalDays,
            toDate: newToDate,
            halfDayTiming: value === 'Half Day' ? 'First Half' : ''
        });
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;

        if (formData.leaveDuration === 'Full Day' || formData.leaveDuration === 'Half Day') {
            if (name === 'toDate') return;
            const newFormData = { ...formData, [name]: value };
            if (name === 'fromDate') {
                newFormData.toDate = value;
                newFormData.totalDays = value ? (formData.leaveDuration === 'Full Day' ? 1 : 0.5) : 0;
            }
            setFormData(newFormData);
        } else {
            const newFormData = { ...formData, [name]: value };
            if (name === 'fromDate' || name === 'toDate') {
                newFormData.totalDays = calculateDays(
                    name === 'fromDate' ? value : newFormData.fromDate,
                    name === 'toDate' ? value : newFormData.toDate
                );
            }
            setFormData(newFormData);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Attachment logic would be here if uploading files. Assuming text/URL for now or skipping
            await createLeaveRequest(formData);
            toast.success('Leave Request Created Successfully');
            // Reset form
            setFormData({
                employee: '', department: '', position: '', leaveType: 'Paid Leave', leaveDuration: 'Full Day', halfDayTiming: '',
                fromDate: '', toDate: '', totalDays: 0, reason: '', attachment: null
            });
            // Refresh list
            fetchAllLeaveRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error creating leave request');
        }
    };

    // Modal Handlers
    const openModal = (request) => {
        setSelectedRequest(request);
        setRejectReason('');
        setTempIncharge('');
        setIsModalOpen(true);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveLeaveRequest(selectedRequest._id, tempIncharge || null);
            toast.success('Leave Approved Successfully');
            setIsModalOpen(false);
            fetchAllLeaveRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error approving leave');
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
            await rejectLeaveRequest(selectedRequest._id, rejectReason);
            toast.success('Leave Rejected');
            setIsModalOpen(false);
            fetchAllLeaveRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error rejecting leave');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold border-l-4 border-blue-600 pl-4 text-gray-800">Leave Approvals</h1>
            </div>

            {/* SECTION 1: CREATE LEAVE REQUEST */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-3">Create Leave Request (Manual Admin Entry)</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Employee Selection */}
                    <div className="col-span-1">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={formData.leaveType}
                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                        >
                            <option value="Paid Leave">Paid Leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Duration</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={formData.leaveDuration}
                            onChange={handleDurationChange}
                        >
                            <option value="Full Day">Full Day</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Multiple Days">Multiple Days</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input
                            type="date"
                            name="fromDate"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.fromDate}
                            onChange={handleDateChange}
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                            type="date"
                            name="toDate"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            value={formData.toDate}
                            onChange={handleDateChange}
                            required
                            disabled={formData.leaveDuration === 'Full Day' || formData.leaveDuration === 'Half Day'}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Days (Auto Calculated)</label>
                        <input
                            type="number"
                            readOnly
                            className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-blue-900 font-bold"
                            value={formData.totalDays}
                        />
                    </div>

                    {formData.leaveDuration === 'Half Day' && (
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Selection</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow md:w-1/2 lg:w-1/3"
                                value={formData.halfDayTiming}
                                onChange={(e) => setFormData({ ...formData, halfDayTiming: e.target.value })}
                                required
                            >
                                <option value="">Select Timing</option>
                                <option value="First Half">First Half</option>
                                <option value="Second Half">Second Half</option>
                            </select>
                        </div>
                    )}

                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
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
                            Submit Leave Request
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: LEAVE APPROVAL TABLE */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Leave Requests Table</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                                <th className="p-4 rounded-tl-lg font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Department & Pos</th>
                                <th className="p-4 font-semibold">Leave Details</th>
                                <th className="p-4 font-semibold">Dates (Days)</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 rounded-tr-lg font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {loadingRequests ? (
                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Loading leave requests...</td></tr>
                            ) : leaveRequests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">No leave requests found.</td></tr>
                            ) : (
                                leaveRequests.map(req => (
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
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">{req.leaveType}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-800">{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</div>
                                            <div className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{req.totalDays} days</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
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
                                <FileText className="text-blue-600" /> Leave Application Details
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
                                    <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Leave Info</p>
                                    <p className="font-bold text-blue-900 text-lg mb-1">{selectedRequest.leaveType}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-gray-700">{new Date(selectedRequest.fromDate).toLocaleDateString()} to {new Date(selectedRequest.toDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-blue-600">{selectedRequest.totalDays}</span> <span className="text-xs font-semibold text-blue-600 uppercase">Days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Reason for Leave:</h4>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 items-center rounded-lg border">{selectedRequest.reason}</p>
                            </div>

                            {selectedRequest.status === 'Pending' && (
                                <div className="grid grid-cols-2 gap-6 bg-yellow-50/30 p-4 rounded-xl border border-yellow-100/50">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Temporary Incharge (Optional)</label>
                                        <select
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                            value={tempIncharge}
                                            onChange={(e) => setTempIncharge(e.target.value)}
                                        >
                                            <option value="">Do not assign</option>
                                            {employees.filter(e => e._id !== selectedRequest.employee?._id).map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Assigns someone else while they are on leave.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Rejection Reason</label>
                                        <input
                                            type="text"
                                            placeholder="If rejecting, specify here..."
                                            className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                    </div>
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
                                    <CheckCircle size={18} /> Approve & Update Status
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

export default LeaveApprovals;
