import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge,
    ThumbsUp,
    ThumbsDown,
    AlertTriangle,
    Award,
    Users,
    UserX,
    MapPin,
    Star,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react';
import performanceApi from '../../../services/performance/performanceApi';
import authStore from '../../../store/authStore';

const DealerManagerDealerPerformance = () => {
    const user = authStore((state) => state.user);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalDealers, setModalDealers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const res = await performanceApi.getDealerPerformance();

                console.log("✅ [Dealer Performance] Successfully connected to Database");
                console.log("📊 [Dealer Performance] Fetched Dashboard Data:", res);
                if (!res?.tableData || res.tableData.length === 0) {
                    console.log("⚠️ [Dealer Performance] No dealers found for this Dealer Manager in the database yet.");
                }

                setPerformanceData(res);
            } catch (err) {
                console.error("Failed to fetch performance data:", err);
                setError(err.message || "Failed to load performance data");
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    // Safely extract data
    const performerCount = performanceData?.summary?.statusCounts?.Performer || 0;
    const activeCount = performanceData?.summary?.statusCounts?.Active || 0;
    const inactiveCount = performanceData?.summary?.statusCounts?.Inactive || 0;
    const totalDealers = performanceData?.summary?.totalRecords || 0;

    // Performance data mapping
    const metricsData = {
        performer: {
            id: 'performer',
            count: performerCount,
            color: 'bg-green-600',
            hoverColor: 'hover:bg-green-700',
            icon: ThumbsUp,
            description: 'Top performing dealers with excellent results'
        },
        active: {
            id: 'active',
            count: activeCount,
            color: 'bg-gray-500',
            hoverColor: 'hover:bg-gray-600',
            icon: Activity,
            description: 'Active dealers with regular engagement'
        },
        inactive: {
            id: 'inactive',
            count: inactiveCount,
            color: 'bg-red-500',
            hoverColor: 'hover:bg-red-600',
            icon: ThumbsDown,
            description: 'Inactive dealers needing attention'
        }
    };

    // Handle Card Click
    const handleCardClick = (categoryId) => {
        let filtered = [];
        const allDealers = performanceData?.tableData || [];

        if (categoryId === 'performer') {
            filtered = allDealers.filter(d => d.status === 'Active' && d.orders > 0);
        } else if (categoryId === 'active') {
            filtered = allDealers.filter(d => d.status === 'Active');
        } else if (categoryId === 'inactive') {
            filtered = allDealers.filter(d => d.status === 'Inactive');
        }

        setSelectedCategory(categoryId);
        setModalDealers(filtered);
        setIsModalOpen(true);
    };

    // Location info
    const location = user?.cluster?.name || user?.district?.name || user?.state?.name || 'Assigned Area';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Header with gradient background */}
            <div
                className="text-white p-6 rounded-2xl mb-6 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold flex items-center">
                        <Gauge className="w-6 h-6 mr-2" />
                        Dealer Performance List
                    </h2>
                    <h2 className="text-xl font-semibold flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <MapPin className="w-5 h-5 mr-2" />
                        {location}
                    </h2>
                </div>
            </div>

            {/* Performance Cards */}
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">

                    {/* Performer Card */}
                    <div
                        onClick={() => handleCardClick('performer')}
                        className={`
              ${metricsData.performer.color} 
              ${metricsData.performer.hoverColor}
              rounded-xl shadow-lg overflow-hidden group
              cursor-pointer transform transition-all duration-300 hover:-translate-y-2
            `}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <metricsData.performer.icon className="w-5 h-5 text-white mr-2" />
                                        <h3 className="text-white text-lg font-semibold">Performer</h3>
                                    </div>
                                    <div className="text-white text-3xl font-bold mb-1">
                                        {metricsData.performer.count}
                                    </div>
                                    <p className="text-white text-sm opacity-90">
                                        {metricsData.performer.description}
                                    </p>

                                    {/* Progress indicator */}
                                    <div className="mt-4 flex items-center">
                                        <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white rounded-full"
                                                style={{ width: `${totalDealers > 0 ? (metricsData.performer.count / totalDealers) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-white text-sm">
                                            {totalDealers > 0 ? Math.round((metricsData.performer.count / totalDealers) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Icon badge */}
                                <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:scale-110 transition-transform">
                                    <Star className="w-8 h-8 text-yellow-300" />
                                </div>
                            </div>

                            {/* Stats footer */}
                            <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                                <div className="flex justify-between text-white text-sm">
                                    <span className="flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Achieved targets
                                    </span>
                                    <span className="font-semibold">+25%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Card */}
                    <div
                        onClick={() => handleCardClick('active')}
                        className={`
              ${metricsData.active.color} 
              ${metricsData.active.hoverColor}
              rounded-xl shadow-lg overflow-hidden group
              cursor-pointer transform transition-all duration-300 hover:-translate-y-2
            `}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <metricsData.active.icon className="w-5 h-5 text-white mr-2" />
                                        <h3 className="text-white text-lg font-semibold">Active</h3>
                                    </div>
                                    <div className="text-white text-3xl font-bold mb-1">
                                        {metricsData.active.count}
                                    </div>
                                    <p className="text-white text-sm opacity-90">
                                        {metricsData.active.description}
                                    </p>

                                    {/* Progress indicator */}
                                    <div className="mt-4 flex items-center">
                                        <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white rounded-full"
                                                style={{ width: `${totalDealers > 0 ? (metricsData.active.count / totalDealers) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-white text-sm">
                                            {totalDealers > 0 ? Math.round((metricsData.active.count / totalDealers) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Icon badge */}
                                <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:scale-110 transition-transform">
                                    <Activity className="w-8 h-8 text-blue-200" />
                                </div>
                            </div>

                            {/* Stats footer */}
                            <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                                <div className="flex justify-between text-white text-sm">
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Regular engagement
                                    </span>
                                    <span className="font-semibold">12 active this week</span>
                                </div>
                            </div>
                        </div>

                        {/* In-Active Card */}
                        <div
                            onClick={() => handleCardClick('inactive')}
                            className={`
              ${metricsData.inactive.color} 
              ${metricsData.inactive.hoverColor}
              rounded-xl shadow-lg overflow-hidden group
              cursor-pointer transform transition-all duration-300 hover:-translate-y-2
            `}>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <metricsData.inactive.icon className="w-5 h-5 text-white mr-2" />
                                            <h3 className="text-white text-lg font-semibold">In-Active</h3>
                                        </div>
                                        <div className="text-white text-3xl font-bold mb-1">
                                            {metricsData.inactive.count}
                                        </div>
                                        <p className="text-white text-sm opacity-90">
                                            {metricsData.inactive.description}
                                        </p>

                                        {/* Progress indicator */}
                                        <div className="mt-4 flex items-center">
                                            <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white rounded-full"
                                                    style={{ width: `${totalDealers > 0 ? (metricsData.inactive.count / totalDealers) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-2 text-white text-sm">
                                                {totalDealers > 0 ? Math.round((metricsData.inactive.count / totalDealers) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Icon badge */}
                                    <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:scale-110 transition-transform">
                                        <UserX className="w-8 h-8 text-red-200" />
                                    </div>
                                </div>

                                {/* Stats footer */}
                                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                                    <div className="flex justify-between text-white text-sm">
                                        <span className="flex items-center">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Need attention
                                        </span>
                                        <span className="font-semibold">2 overdue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Dealers */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Dealers</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalDealers}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        <span className="text-green-600">↑ 12%</span> from last month
                    </div>
                </div>

                {/* Performance Rate */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Performance Rate</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalDealers > 0 ? Math.round((metricsData.performer.count / totalDealers) * 100) : 0}%
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <Award className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Performers among total dealers
                    </div>
                </div>

                {/* Active Rate */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Active Rate</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalDealers > 0 ? Math.round((metricsData.active.count / totalDealers) * 100) : 0}%
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Active dealers excluding performers
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Download Performance Report
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Send Performance Alerts
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        Schedule Review Meeting
                    </button>
                </div>
            </div>

            {/* Dealer Performance Summary Table */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-blue-600 text-white px-5 py-3 flex items-center">
                    <BarChart3 className="inline mr-3 text-white" size={24} />
                    <h5 className="font-semibold text-lg">Dealer Performance Summary</h5>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Orders</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Conv %</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {performanceData?.tableData?.map((row, index) => (
                                <tr key={row.id || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{row.location}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{row.orders || 0}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{row.conversion || 0}%</td>
                                    <td className="px-4 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {row.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!performanceData?.tableData?.length && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No dealers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Category Details Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl w-full max-w-4xl mx-4 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className={`p-5 flex justify-between items-center text-white ${selectedCategory === 'performer' ? 'bg-gradient-to-r from-green-500 to-green-600' : selectedCategory === 'active' ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                                <h3 className="text-xl font-bold flex items-center tracking-wide capitalize">
                                    {selectedCategory === 'performer' ? <ThumbsUp className="w-6 h-6 mr-2 opacity-90" /> : selectedCategory === 'active' ? <Activity className="w-6 h-6 mr-2 opacity-90" /> : <ThumbsDown className="w-6 h-6 mr-2 opacity-90" />}
                                    {selectedCategory} Dealers
                                    <span className="ml-3 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                                        {modalDealers.length} total
                                    </span>
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all focus:outline-none"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-0 overflow-y-auto flex-1 bg-gray-50">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="py-4 px-6 font-semibold text-gray-600 text-sm border-b uppercase tracking-wider">Name</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600 text-sm border-b uppercase tracking-wider">Location</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600 text-sm border-b uppercase tracking-wider">Orders</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600 text-sm border-b uppercase tracking-wider">Conversion</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600 text-sm border-b uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {modalDealers.map((dealer, index) => (
                                            <tr key={dealer.id || index} className="hover:bg-blue-50 transition-colors bg-white">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 border shadow-sm
                                                            ${selectedCategory === 'performer' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                selectedCategory === 'active' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                                                    'bg-red-100 text-red-700 border-red-200'}`}>
                                                            {dealer.name ? dealer.name.substring(0, 2).toUpperCase() : 'NA'}
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{dealer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 text-sm">{dealer.location || 'N/A'}</td>
                                                <td className="py-4 px-6">
                                                    <span className="font-semibold text-gray-800">{dealer.orders || 0}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold mr-2">{dealer.conversion || 0}%</span>
                                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${dealer.conversion > 10 ? 'bg-green-500' : dealer.conversion > 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                                                                style={{ width: `${Math.min(dealer.conversion || 0, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border shadow-sm
                                                        ${dealer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {dealer.status || 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {modalDealers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-12 px-6 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <Users className="w-12 h-12 mb-3 opacity-20" />
                                                        <p className="text-lg font-medium">No dealers found in this category.</p>
                                                        <p className="text-sm mt-1">There are no {selectedCategory} dealers matching this criteria.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-white p-4 border-t border-gray-100 flex justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* CSS for additional animations */}
            <style jsx>{`
                    @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                    }
                    .animate-pulse-slow {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
        </div>

    );
};

export default DealerManagerDealerPerformance;