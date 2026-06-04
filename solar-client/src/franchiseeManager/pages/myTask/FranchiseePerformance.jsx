import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    Activity,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    Users,
    Award,
    Zap,
    BarChart3,
    ChevronRight,
    Home
} from 'lucide-react';

const FranchiseeManagerPerformanceList = () => {
    // Sample performance counts
    const performanceData = {
        performer: 5,
        active: 8,
        inactive: 2
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div
                    className="text-white p-6 rounded-2xl mb-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center mb-2 md:mb-0">
                            <BarChart3 className="mr-2" size={24} />
                            Franchisee Performance List
                        </h2>
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                            <Home className="mr-2" size={24} />
                            Rajkot
                        </h2>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                    {/* Performer Card */}
                    <Link
                        to="/franchiseeManager/frenchiseManagerfrenchiseperformername"
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <div className="bg-green-600 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {performanceData.performer}
                                        </div>
                                        <div className="text-lg font-semibold text-white flex items-center">
                                            Performer
                                            <ThumbsUp size={18} className="ml-2" />
                                        </div>
                                    </div>
                                    <div className="bg-green-500 p-3 rounded-full">
                                        <Award size={32} className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-green-100 text-sm">
                                    <TrendingUp size={14} className="mr-1" />
                                    <span>Top performing franchisees</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Active Card */}
                    <Link
                        to="/franchiseeManager/frenchiseManagerfrenchiseactive"
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <div className="bg-gray-500 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {performanceData.active}
                                        </div>
                                        <div className="text-lg font-semibold text-white flex items-center">
                                            Active
                                            <Activity size={18} className="ml-2" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-400 p-3 rounded-full">
                                        <Users size={32} className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-gray-100 text-sm">
                                    <Zap size={14} className="mr-1" />
                                    <span>Currently active franchisees</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* In-Active Card */}
                    <Link
                        to="/franchiseeManager/frenchiseManagerfrenchiseinactive"
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <div className="bg-red-500 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {performanceData.inactive}
                                        </div>
                                        <div className="text-lg font-semibold text-white flex items-center">
                                            In-Active
                                            <ThumbsDown size={18} className="ml-2" />
                                        </div>
                                    </div>
                                    <div className="bg-red-400 p-3 rounded-full">
                                        <AlertTriangle size={32} className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-red-100 text-sm">
                                    <AlertTriangle size={14} className="mr-1" />
                                    <span>Inactive franchisees</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Summary Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <BarChart3 size={20} className="text-blue-500 mr-2" />
                        Performance Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">{performanceData.performer}</div>
                            <div className="text-sm text-gray-600">Performer Franchisees</div>
                            <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(performanceData.performer / (performanceData.performer + performanceData.active + performanceData.inactive)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600">{performanceData.active}</div>
                            <div className="text-sm text-gray-600">Active Franchisees</div>
                            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(performanceData.active / (performanceData.performer + performanceData.active + performanceData.inactive)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600">{performanceData.inactive}</div>
                            <div className="text-sm text-gray-600">In-Active Franchisees</div>
                            <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                                <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{ width: `${(performanceData.inactive / (performanceData.performer + performanceData.active + performanceData.inactive)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-gray-500 text-sm">
                        Total Franchisees: {performanceData.performer + performanceData.active + performanceData.inactive}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-2xl font-bold text-gray-700">85%</div>
                        <div className="text-xs text-gray-500">Overall Performance</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-2xl font-bold text-gray-700">₹2.4L</div>
                        <div className="text-xs text-gray-500">Total Revenue</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-2xl font-bold text-gray-700">156</div>
                        <div className="text-xs text-gray-500">Total Orders</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-2xl font-bold text-gray-700">4.2</div>
                        <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerPerformanceList;