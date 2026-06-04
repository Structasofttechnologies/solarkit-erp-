import React from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3,
    Home,
    Users,
    AlertCircle,
    Package,
    Zap,
    ThumbsDown,
    Clock,
    AlertTriangle,
    FileText,
    TrendingDown,
    XCircle,
    UserX
} from 'lucide-react';

const FranchiseeManagerInactiveList = () => {
    // Sample inactive franchisees data
    const inactiveFranchisees = [
        {
            id: 1,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            inactiveDays: 45,
            lastActive: '2024-01-15',
            reason: 'Payment pending',
            icon: UserX
        },
        {
            id: 2,
            name: 'DC Energy',
            overdueTasks: 2,
            totalOrders: 30,
            totalKw: '155 kW',
            inactiveDays: 32,
            lastActive: '2024-01-28',
            reason: 'Contract expired',
            icon: XCircle
        },
        {
            id: 3,
            name: 'Ctron Energy',
            overdueTasks: 10,
            totalOrders: 25,
            totalKw: '125 kW',
            inactiveDays: 78,
            lastActive: '2023-12-05',
            reason: 'Inactive',
            icon: UserX
        },
        {
            id: 4,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            inactiveDays: 67,
            lastActive: '2023-12-20',
            reason: 'Documentation incomplete',
            icon: AlertTriangle
        },
        {
            id: 5,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            inactiveDays: 28,
            lastActive: '2024-02-01',
            reason: 'Under review',
            icon: XCircle
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
                            Franchisee In-Active List
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
                                <p className="text-sm text-gray-500">Total In-Active</p>
                                <p className="text-2xl font-bold text-gray-700">{inactiveFranchisees.length}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <Users size={24} className="text-red-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {inactiveFranchisees.reduce((sum, f) => sum + f.totalOrders, 0)}
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
                                    {inactiveFranchisees.reduce((sum, f) => sum + parseInt(f.totalKw), 0)} kW
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
                                <p className="text-sm text-gray-500">Avg Inactive Days</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {Math.round(inactiveFranchisees.reduce((sum, f) => sum + f.inactiveDays, 0) / inactiveFranchisees.length)} days
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Clock size={24} className="text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertTriangle size={20} className="text-red-500 mr-3" />
                        <div>
                            <p className="text-sm text-red-700 font-medium">
                                {inactiveFranchisees.length} franchisees currently inactive. Immediate attention required.
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Inactive Franchisees Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inactiveFranchisees.map((franchisee) => {
                        const IconComponent = franchisee.icon;

                        return (
                            <Link
                                key={franchisee.id}
                                to="/franchiseeManager/frenchiseManagerfrenchisenamedashboard"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl no-underline"
                            >
                                <div
                                    className="text-white rounded-xl shadow-lg h-full p-5 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: 'rgb(228, 71, 53)' }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-red-400 p-2 rounded-lg">
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
                                        <div className="bg-red-700 text-xs px-2 py-1 rounded-full flex items-center">
                                            <ThumbsDown size={12} className="mr-1" />
                                            Inactive
                                        </div>
                                    </div>

                                    {/* Stats List */}
                                    <div className="space-y-3 mt-4">
                                        {/* Overdue Tasks */}
                                        <div className="flex items-center justify-between border-b border-red-400 pb-2">
                                            <div className="flex items-center text-red-100">
                                                <AlertCircle size={16} className="mr-2" />
                                                <span className="text-sm">Overdue Tasks</span>
                                            </div>
                                            <span className="font-semibold text-white bg-red-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.overdueTasks}
                                            </span>
                                        </div>

                                        {/* Total Orders */}
                                        <div className="flex items-center justify-between border-b border-red-400 pb-2">
                                            <div className="flex items-center text-red-100">
                                                <Package size={16} className="mr-2" />
                                                <span className="text-sm">Total Orders</span>
                                            </div>
                                            <span className="font-semibold text-white bg-red-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.totalOrders}
                                            </span>
                                        </div>

                                        {/* Total kW */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-red-100">
                                                <Zap size={16} className="mr-2" />
                                                <span className="text-sm">Total kW</span>
                                            </div>
                                            <span className="font-semibold text-white bg-red-600 px-3 py-1 rounded-full text-sm">
                                                {franchisee.totalKw}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Inactive Info */}
                                    <div className="mt-4 pt-3 border-t border-red-400">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <Clock size={14} className="text-red-200 mr-1" />
                                                <span className="text-red-200 text-xs">Inactive for {franchisee.inactiveDays} days</span>
                                            </div>
                                            <div className="flex items-center">
                                                <TrendingDown size={14} className="text-red-200 mr-1" />
                                                <span className="text-red-200 text-xs">Last: {franchisee.lastActive}</span>
                                            </div>
                                        </div>
                                        <div className="bg-red-600 rounded p-2 mt-2">
                                            <p className="text-xs text-white flex items-center">
                                                <AlertTriangle size={12} className="mr-1" />
                                                Reason: {franchisee.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Recovery Summary */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <FileText size={20} className="text-red-500 mr-2" />
                        Inactive Franchisees Recovery Plan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-semibold text-red-700 mb-2">Priority Cases</h4>
                            <p className="text-2xl font-bold text-red-600">3</p>
                            <p className="text-sm text-gray-500 mt-1">Inactive 60 days</p>
                            <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                                <div className="bg-red-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-700 mb-2">At Risk Revenue</h4>
                            <p className="text-2xl font-bold text-orange-600">₹8.5L</p>
                            <p className="text-sm text-gray-500 mt-1">From inactive accounts</p>
                            <div className="mt-2 flex items-center">
                                <TrendingDown size={14} className="text-orange-500 mr-1" />
                                <span className="text-xs text-orange-600">↓ 12% from last month</span>
                            </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-700 mb-2">Recovery Rate</h4>
                            <p className="text-2xl font-bold text-yellow-600">35%</p>
                            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                            <div className="mt-2 flex items-center">
                                <Clock size={14} className="text-yellow-500 mr-1" />
                                <span className="text-xs text-yellow-600">Avg 15 days to recover</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <AlertCircle size={16} className="mr-2 text-red-500" />
                            Required Actions
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" className="mr-3 rounded border-gray-300" />
                                <span className="text-gray-600">Contact SunTech Energy - Payment pending (45 days)</span>
                                <span className="text-xs text-red-500 ml-auto">Urgent</span>
                            </div>
                            <div className="flex items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" className="mr-3 rounded border-gray-300" />
                                <span className="text-gray-600">Schedule meeting with DC Energy - Contract renewal</span>
                                <span className="text-xs text-orange-500 ml-auto">Due in 3 days</span>
                            </div>
                            <div className="flex items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" className="mr-3 rounded border-gray-300" />
                                <span className="text-gray-600">Follow up with Ctron Energy - Documentation required</span>
                                <span className="text-xs text-yellow-500 ml-auto">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerInactiveList;