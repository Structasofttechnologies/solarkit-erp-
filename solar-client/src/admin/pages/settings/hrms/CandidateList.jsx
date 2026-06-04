import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, RefreshCw,
    MoreVertical, CheckCircle, Clock,
    XCircle, UserCheck, Briefcase, Trash2, UserPlus, Key
} from 'lucide-react';
import { getAllCandidates, updateCandidateStatus, deleteCandidate } from '../../../../services/hrms/hrmsApi';
import toast from 'react-hot-toast';

const CandidateList = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Recruitment Modal State
    const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [recruitCandidates, setRecruitCandidates] = useState([]);
    const [isRecruiting, setIsRecruiting] = useState(false);

    // Credentials Modal State
    const [credentialsModal, setCredentialsModal] = useState({ isOpen: false, data: null });

    const statusOptions = ['All', 'Pending', 'Applied', 'Test Completed', 'Under Review', 'Selected', 'Rejected', 'Joined'];
    const updateStatusOptions = ['Pending', 'Applied', 'Test Completed', 'Under Review', 'Selected', 'Rejected', 'Joined'];

    // Get unique positions from all loaded candidates
    const uniquePositions = [...new Set(candidates.map(c => c.vacancy?.title).filter(Boolean))];

    const fetchCandidates = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (statusFilter !== 'All') params.status = statusFilter;

            const res = await getAllCandidates(params);
            setCandidates(res.data || []);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Failed to load candidates data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [statusFilter]);

    const handleStatusChange = async (candidateId, newStatus) => {
        try {
            await updateCandidateStatus(candidateId, newStatus);
            toast.success(`Candidate status updated to ${newStatus}`);
            // Update local state without refetching to keep UI responsive
            setCandidates(candidates.map(c =>
                c._id === candidateId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;

        try {
            await deleteCandidate(candidateId);
            toast.success("Candidate deleted successfully");
            setCandidates(candidates.filter(c => c._id !== candidateId));
        } catch (error) {
            toast.error(error.message || "Failed to delete candidate");
        }
    };

    // Recruitment flow
    useEffect(() => {
        if (selectedPosition) {
            const filtered = candidates.filter(c =>
                c.vacancy?.title === selectedPosition &&
                ['Selected', 'Joined'].includes(c.status) // Assuming Agreement Signed translates to Selected contextually 
            );
            setRecruitCandidates(filtered);
        } else {
            setRecruitCandidates([]);
        }
    }, [selectedPosition, candidates]);

    const handleRecruit = async (candidateId) => {
        try {
            setIsRecruiting(true);
            const { recruitCandidate } = await import('../../../../services/hrms/hrmsApi');
            const res = await recruitCandidate(candidateId, { joiningDate: new Date() });

            toast.success(res.message);

            // Show credentials modal
            setCredentialsModal({
                isOpen: true,
                data: res.credentials
            });

            // Fetch updated list
            fetchCandidates();
        } catch (error) {
            toast.error(error.message || "Failed to recruit candidate");
        } finally {
            setIsRecruiting(false);
        }
    };

    // Filter by search term
    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch =
            (candidate.name && candidate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (candidate.mobile && candidate.mobile.includes(searchTerm)) ||
            (candidate.vacancy?.title && candidate.vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Joined': return 'bg-green-100 text-green-800 border-green-300';
            case 'Selected': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Under Review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Test Completed': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Applied': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 shadow-lg text-white flex justify-between items-center">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 mr-4 opacity-90" />
                        <div>
                            <h1 className="text-2xl font-bold">Candidates Overview</h1>
                            <p className="text-blue-200 text-sm mt-1">Track and manage all vacancy applicants across the system</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsRecruitModalOpen(true)}
                            className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-50 transition flex items-center"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Recruit Candidate
                        </button>
                        <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center shadow-inner">
                            <Users className="h-5 w-5 mr-2 text-blue-200" />
                            <span className="font-semibold text-xl">{candidates.length}</span>
                            <span className="text-blue-200 ml-2 text-sm uppercase tracking-wider font-bold">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex w-full md:w-auto gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name, mobile, or role..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 appearance-none font-medium text-gray-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{opt === 'All' ? 'All Statuses' : opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={fetchCandidates}
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors shrink-0"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                <th className="p-4 font-semibold">Candidate Info</th>
                                <th className="p-4 font-semibold">Applied Role</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold text-center">Location</th>
                                <th className="p-4 font-semibold">Applied Date</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center border-b">
                                        <div className="flex justify-center items-center">
                                            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mr-3" />
                                            <span className="text-gray-500 font-medium tracking-wide">Loading candidates...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center border-b">
                                        <div className="flex flex-col items-center">
                                            <Users className="h-12 w-12 text-gray-300 mb-3" />
                                            <span className="text-gray-500 font-medium">No candidates found matching your criteria.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map(candidate => (
                                    <tr key={candidate._id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg mr-3 shadow-sm">
                                                    {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{candidate.name}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{candidate.mobile}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="font-semibold text-gray-700">
                                                    {candidate.vacancy?.title || 'Unknown Role'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">
                                            {candidate.vacancy?.department?.name || 'Unknown Department'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="text-sm font-semibold text-gray-700">
                                                {candidate.vacancy?.state?.name || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {candidate.vacancy?.cluster?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="h-4 w-4 mr-1.5 opacity-70" />
                                                {new Date(candidate.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <select
                                                    value={candidate.status}
                                                    onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                                                    className={`border rounded-full px-4 py-1.5 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer appearance-none text-center min-w-[130px] ${getStatusStyle(candidate.status)}`}
                                                    style={{ textAlignLast: 'center' }}
                                                >
                                                    {updateStatusOptions.map(opt => (
                                                        <option key={opt} value={opt} className="bg-white text-gray-800 font-medium text-left">{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDeleteCandidate(candidate._id)}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition border border-red-100 shadow-sm"
                                                    title="Delete Candidate"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination/Info */}
                {!isLoading && filteredCandidates.length > 0 && (
                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>Showing <span className="font-bold text-gray-700">{filteredCandidates.length}</span> candidates</span>
                    </div>
                )}
            </div>

            {/* Recruit Candidate Modal */}
            {isRecruitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                                    Recruit Candidates
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Select a position to view selected candidates ready for recruitment.</p>
                            </div>
                            <button onClick={() => setIsRecruitModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Position</label>
                                <select
                                    value={selectedPosition}
                                    onChange={(e) => setSelectedPosition(e.target.value)}
                                    className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Select Position --</option>
                                    {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>

                            {selectedPosition && recruitCandidates.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600 border-b">
                                            <tr>
                                                <th className="p-3 font-semibold">Candidate Name</th>
                                                <th className="p-3 font-semibold">Mobile Number</th>
                                                <th className="p-3 font-semibold">Email</th>
                                                <th className="p-3 font-semibold">Preferred Joining Date</th>
                                                <th className="p-3 font-semibold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recruitCandidates.map(c => (
                                                <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{c.name}</td>
                                                    <td className="p-3 text-gray-600">{c.mobile}</td>
                                                    <td className="p-3 text-gray-600">{c.email || '-'}</td>
                                                    <td className="p-3 text-gray-600">
                                                        {c.preferredJoiningDate ? new Date(c.preferredJoiningDate).toLocaleDateString() : 'Not Set'}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {c.status === 'Joined' ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                                                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Recruited
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRecruit(c._id)}
                                                                disabled={isRecruiting}
                                                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs disabled:opacity-50 flex items-center justify-center mx-auto"
                                                            >
                                                                {isRecruiting ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Recruit'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : selectedPosition ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                                    <UserCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No selected candidates found for this position.</p>
                                </div>
                            ) : null}
                        </div>
                        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
                            <button onClick={() => setIsRecruitModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credentials Modal */}
            {credentialsModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="bg-green-600 p-6 text-center text-white">
                            <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <Key className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Successfully Recruited</h2>
                            <p className="text-green-100 text-sm mt-1">ERP Credentials Generated</p>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Login ID</p>
                                    <p className="font-bold text-gray-800 text-lg">{credentialsModal.data?.loginId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Password</p>
                                    <p className="font-mono bg-white border px-3 py-1.5 rounded-lg text-gray-800">{credentialsModal.data?.password}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCredentialsModal({ isOpen: false, data: null })}
                                className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateList;
