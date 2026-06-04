import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Target,
    Users,
    Calendar,
    Clock,
    Eye,
    TrendingUp,
    Award,
    CheckCircle,
    UserPlus,
    BarChart3,
    AlertCircle,
    X
} from 'lucide-react';
import { dealerManagerApi } from '../../../services/dealerManager/dealerManagerApi';

const DealerManagerOnboardingGoals = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoading(true);
                const response = await dealerManagerApi.getOnboardingGoals();
                console.log("✅ [Onboarding Goals] Fetch success:", response);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching onboarding goals:", err);
                setError(err.message || "Failed to load onboarding goals");
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
                {error}
            </div>
        );
    }

    // Safely fallback defaults
    const {
        managerInfo = {},
        goals = {},
        leads = {},
        dealers = []
    } = data || {};

    const achieved = goals.achieved || 0;
    const totalTarget = goals.totalTarget || 0;
    const percentage = goals.progressPercentage || 0;

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <span className="text-blue-600 font-medium">
                                Dealer Manager Onboarding Goals
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Content */}
            <div className="container mx-auto">
                {/* Goals Card with Range Slider */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Onboarding Goals Tracker</h3>
                                <p className="text-sm text-gray-500">Track your dealer onboarding progress</p>
                            </div>
                        </div>

                        {/* Due Date Badge */}
                        <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-600">Due Date: {goals.dueDate || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Section - Assign Leads */}
                        <div className="lg:col-span-1 border border-blue-100 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 h-full relative">
                                <h5 className="text-sm font-semibold text-gray-600 mb-3">ASSIGN COMPANY LEADS</h5>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-3xl font-bold text-blue-600">{leads.assignedCompanyLeads || 0}</span>
                                    <Users className="w-8 h-8 text-blue-400 opacity-50 absolute right-4 top-4" />
                                </div>

                                <div className="mt-4 pt-3 border-t border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Dealer onboarded leads:</p>
                                    <div className="flex items-center">
                                        <span className="text-2xl font-bold text-green-600">{leads.dealerOnboardedLeads || 0}</span>
                                        <span className="ml-2 text-xs text-gray-500">completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section - Dealer Info */}
                        <div className="lg:col-span-1 border border-purple-100 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 h-full">
                                <h5 className="text-sm font-semibold text-gray-600 mb-3">DEALER MANAGER INFORMATION</h5>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {managerInfo.name ? managerInfo.name.substring(0, 2).toUpperCase() : 'DM'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{managerInfo.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{managerInfo.role || 'Manager'}</p>
                                    </div>
                                </div>

                                <div className="bg-white bg-opacity-70 rounded p-2 border border-purple-100">
                                    <p className="text-xs text-gray-500">App Demo Approval Date:</p>
                                    <p className="font-semibold text-gray-800 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        {managerInfo.appDemoApprovalDate || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Dates */}
                        <div className="lg:col-span-1 border border-orange-100 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 h-full">
                                <h5 className="text-sm font-semibold text-gray-600 mb-3">TIMELINE</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date:</span>
                                        <span className="font-semibold text-sm">Now</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center gap-1"><Target className="w-3 h-3" /> Target Date:</span>
                                        <span className="font-semibold text-sm">{goals.dueDate || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-200">
                                        <span className="text-sm font-medium text-red-600">Goal Status:</span>
                                        <span className="font-semibold text-sm text-red-600">
                                            {percentage >= 100 ? 'Achieved 🎉' : 'In Progress'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Range Slider (Read Only to represent progress) */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Progress Tracker</span>
                            <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">Current: {achieved}/{totalTarget}</span>
                                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">{percentage}% Complete</span>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <input
                                type="range"
                                min="0"
                                max={totalTarget || 100}
                                value={achieved}
                                readOnly
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>{totalTarget}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Self Leads</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-blue-600">{leads.selfLeads || 0}</span>
                                <UserPlus className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-tight">Total generated by Manager</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Total Target</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-purple-600">{totalTarget}</span>
                                <Award className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-tight">Assigned dealers limit</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-green-600">{goals.conversionRate || 0}%</span>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-tight">Of total goal target</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Achieved</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-orange-600">{achieved}</span>
                                <CheckCircle className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-tight">{percentage}% of target</p>
                        </div>
                    </div>
                </div>

                {/* Dealer Summary Table */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 tracking-tight">Dealer Summary Table</h4>
                        </div>
                        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                            Live Total Dealers: <span className="font-bold text-gray-700">{dealers.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Dealer Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Dealer Plan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">KYC Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">KYC Document</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Onboarding Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dealers.map((dealer) => (
                                    <tr key={dealer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 mr-3 border border-blue-200">
                                                    {dealer.name ? dealer.name.substring(0, 2).toUpperCase() : 'NA'}
                                                </div>
                                                <span className="font-medium text-gray-800">{dealer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                                                ${dealer.plan === 'Basic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    dealer.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-green-50 text-green-700 border-green-200'}`}>
                                                {dealer.plan || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 opacity-50" />
                                                {dealer.kycDate}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedDealer(dealer);
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-xs font-medium"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                View
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 opacity-50" />
                                                {dealer.onboardingDate}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!dealers.length && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No dealers onboarded yet. Your progress relies on successfully onboarding dealers.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer with Pagination Placeholder */}
                    {dealers.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500">
                                Showing 1 to {dealers.length} of {dealers.length} entries
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-colors">1</button>
                                <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Note: CPRM Add then reflect on the hr Recruitment
                    </p>
                </div>
            </div>

            {/* Dealer Details Modal */}
            {isModalOpen && selectedDealer && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold flex items-center tracking-wide">
                                <UserPlus className="w-5 h-5 mr-2 opacity-80" />
                                Dealer Information
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-blue-100 hover:text-white hover:bg-blue-500 hover:bg-opacity-30 rounded-full p-1 transition-all focus:outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700 mr-5 border-2 border-white shadow-sm ring-2 ring-blue-50">
                                    {selectedDealer.name ? selectedDealer.name.substring(0, 2).toUpperCase() : 'NA'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-800 mb-1">{selectedDealer.name}</h4>
                                    <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                                        <span className="truncate">{selectedDealer.email || 'No email provided'}</span>
                                    </p>
                                    <p className="text-sm font-medium text-gray-500">
                                        {selectedDealer.phone || selectedDealer.mobile || 'No phone provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2 tracking-wider">Dealer Plan</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border shadow-sm
                                        ${selectedDealer.plan === 'Basic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            selectedDealer.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-green-50 text-green-700 border-green-200'}`}>
                                        {selectedDealer.plan || 'Standard'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2 tracking-wider">Company Name</p>
                                    <p className="font-semibold text-gray-800 truncate" title={selectedDealer.companyName}>
                                        {selectedDealer.companyName || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2 tracking-wider">KYC Date</p>
                                    <p className="font-semibold text-gray-800 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                                        {selectedDealer.kycDate}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2 tracking-wider">Onboarding Date</p>
                                    <p className="font-semibold text-gray-800 flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                                        {selectedDealer.onboardingDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerOnboardingGoals;