import React from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3,
    Home,
    Users,
    AlertCircle,
    Package,
    Zap,
    Activity,
    Clock,
    CheckCircle,
    TrendingUp,
    FileText,
    Award
} from 'lucide-react';

const FranchiseeManagerActiveList = () => {
    // Sample active franchisees data
    const activeFranchisees = [
        {
            id: 1,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 12,
            totalKw: '70 kW',
            activeDays: 45,
            completionRate: '85%',
            icon: Activity
        },
        {
            id: 2,
            name: 'DC Energy',
            overdueTasks: 2,
            totalOrders: 10,
            totalKw: '55 kW',
            activeDays: 32,
            completionRate: '92%',
            icon: TrendingUp
        },
        {
            id: 3,
            name: 'Ctron Energy',
            overdueTasks: 10,
            totalOrders: 21,
            totalKw: '110 kW',
            activeDays: 78,
            completionRate: '78%',
            icon: Activity
        },
        {
            id: 4,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 23,
            totalKw: '115 kW',
            activeDays: 67,
            completionRate: '88%',
            icon: Users
        },
        {
            id: 5,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 10,
            totalKw: '60 kW',
            activeDays: 28,
            completionRate: '82%',
            icon: Activity
        }
    ];

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
                            Franchisee Active List
                        </h2>
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                            <Home className="mr-2" size={24} />
                            Rajkot
                        </h2>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Active</p>
                                <p className="text-2xl font-bold text-gray-700">{activeFranchisees.length}</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-full">
                                <Users size={24} className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {activeFranchisees.reduce((sum, f) => sum + f.totalOrders, 0)}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Package size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total kW</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {activeFranchisees.reduce((sum, f) => sum + parseInt(f.totalKw), 0)} kW
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Zap size={24} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Avg Completion</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {Math.round(activeFranchisees.reduce((sum, f) => sum + parseInt(f.completionRate), 0) / activeFranchisees.length)}%
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Franchisees Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeFranchisees.map((franchisee) => {
                        const IconComponent = franchisee.icon;

                        return (
                            <Link
                                key={franchisee.id}
                                to="/franchiseeManager/frenchiseManagerfrenchiseactivedashboard"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl no-underline"
                            >
                                <div className="bg-gray-500 text-white rounded-xl shadow-lg h-full p-5 hover:bg-gray-600 transition-colors">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-400 p-2 rounded-lg">
                                                <IconComponent size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-bold text-white">
                                                    Franchisee Name:
                                                </h5>
                                                <span className="text-yellow-300 font-semibold text-sm">
                                                    {franchisee.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-green-500 text-xs px-2 py-1 rounded-full">
                                            Active
                                        </div>
                                    </div>

                                    {/* Stats List */}
                                    <div className="space-y-3 mt-4">
                                        {/* Overdue Tasks */}
                                        <div className="flex items-center justify-between border-b border-gray-400 pb-2">
                                            <div className="flex items-center text-gray-200">
                                                <AlertCircle size={16} className="mr-2" />
                                                <span className="text-sm">Overdue Tasks</span>
                                            </div>
                                            <span className="font-semibold text-white bg-gray-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.overdueTasks}
                                            </span>
                                        </div>

                                        {/* Total Orders */}
                                        <div className="flex items-center justify-between border-b border-gray-400 pb-2">
                                            <div className="flex items-center text-gray-200">
                                                <Package size={16} className="mr-2" />
                                                <span className="text-sm">Total Orders</span>
                                            </div>
                                            <span className="font-semibold text-white bg-gray-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.totalOrders}
                                            </span>
                                        </div>

                                        {/* Total kW */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-gray-200">
                                                <Zap size={16} className="mr-2" />
                                                <span className="text-sm">Total kW</span>
                                            </div>
                                            <span className="font-semibold text-white bg-gray-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.totalKw}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-4 pt-3 border-t border-gray-400 grid grid-cols-2 gap-2">
                                        <div className="flex items-center">
                                            <Clock size={14} className="text-gray-300 mr-1" />
                                            <span className="text-gray-200 text-xs">{franchisee.activeDays} days</span>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <CheckCircle size={14} className="text-green-300 mr-1" />
                                            <span className="text-green-300 text-xs">{franchisee.completionRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Performance Summary */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <FileText size={20} className="text-gray-600 mr-2" />
                        Active Franchisees Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Top Active</h4>
                            <p className="text-2xl font-bold text-gray-600">Ctron Energy</p>
                            <p className="text-sm text-gray-500 mt-1">21 orders • 110 kW</p>
                            <div className="mt-2 flex items-center">
                                <Activity size={14} className="text-green-500 mr-1" />
                                <span className="text-xs text-green-600">78% completion</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-700 mb-2">Average Performance</h4>
                            <p className="text-2xl font-bold text-blue-600">15.2 orders</p>
                            <p className="text-sm text-gray-500 mt-1">82 kW average</p>
                            <div className="mt-2 flex items-center">
                                <TrendingUp size={14} className="text-blue-500 mr-1" />
                                <span className="text-xs text-blue-600">85% avg completion</span>
                            </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-700 mb-2">Total Capacity</h4>
                            <p className="text-2xl font-bold text-yellow-600">410 kW</p>
                            <p className="text-sm text-gray-500 mt-1">From all active</p>
                            <div className="mt-2 flex items-center">
                                <Zap size={14} className="text-yellow-500 mr-1" />
                                <span className="text-xs text-yellow-600">76 orders total</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            Recent Activity
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">SunTech Energy completed 3 new orders</span>
                                <span className="text-gray-400 text-xs ml-auto">2 hours ago</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">DC Energy reached 55 kW total capacity</span>
                                <span className="text-gray-400 text-xs ml-auto">5 hours ago</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">Ctron Energy added 2 new team members</span>
                                <span className="text-gray-400 text-xs ml-auto">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerActiveList;