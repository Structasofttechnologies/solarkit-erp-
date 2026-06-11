import React from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3,
    Home,
    Award,
    AlertCircle,
    Package,
    Zap,
    Users,
    TrendingUp,
    Star,
    Clock,
    CheckCircle,
    FileText
} from 'lucide-react';

const FranchiseeManagerPerformerName = () => {
    // Sample performer franchisees data
    const performers = [
        {
            id: 1,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            rating: 4.8,
            revenue: '₹2.4L',
            icon: Award
        },
        {
            id: 2,
            name: 'DC Energy',
            overdueTasks: 2,
            totalOrders: 30,
            totalKw: '155 kW',
            rating: 4.9,
            revenue: '₹3.1L',
            icon: Star
        },
        {
            id: 3,
            name: 'Ctron Energy',
            overdueTasks: 10,
            totalOrders: 25,
            totalKw: '125 kW',
            rating: 4.7,
            revenue: '₹2.2L',
            icon: TrendingUp
        },
        {
            id: 4,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            rating: 4.8,
            revenue: '₹2.4L',
            icon: Award
        },
        {
            id: 5,
            name: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKw: '125 kW',
            rating: 4.8,
            revenue: '₹2.4L',
            icon: Award
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
                            Franchisee Performer List
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
                                <p className="text-sm text-gray-500">Total Performers</p>
                                <p className="text-2xl font-bold text-gray-700">{performers.length}</p>
                            </div>
                            <div className="bg-teal-100 p-3 rounded-full">
                                <Award size={24} className="text-teal-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {performers.reduce((sum, p) => sum + p.totalOrders, 0)}
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
                                    {performers.reduce((sum, p) => sum + parseInt(p.totalKw), 0)} kW
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
                                <p className="text-sm text-gray-500">Avg Rating</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {(performers.reduce((sum, p) => sum + p.rating, 0) / performers.length).toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Star size={24} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performer Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {performers.map((performer) => {
                        const IconComponent = performer.icon;

                        return (
                            <Link
                                key={performer.id}
                                to="/franchiseeManager/frenchiseManagerfrenchisenamedashboard"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl no-underline"
                            >
                                <div className="bg-teal-600 text-white rounded-xl shadow-lg h-full p-5 hover:bg-teal-700 transition-colors">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-teal-500 p-2 rounded-lg">
                                                <IconComponent size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-bold text-white">
                                                    Franchisee Name:
                                                </h5>
                                                <span className="text-yellow-300 font-semibold text-sm">
                                                    {performer.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats List */}
                                    <div className="space-y-3 mt-4">
                                        {/* Overdue Tasks */}
                                        <div className="flex items-center justify-between border-b border-teal-500 pb-2">
                                            <div className="flex items-center text-teal-100">
                                                <AlertCircle size={16} className="mr-2" />
                                                <span className="text-sm">Overdue Tasks</span>
                                            </div>
                                            <span className="font-semibold text-white bg-teal-700 px-3 py-1 rounded-full text-sm">
                                                {performer.overdueTasks}
                                            </span>
                                        </div>

                                        {/* Total Orders */}
                                        <div className="flex items-center justify-between border-b border-teal-500 pb-2">
                                            <div className="flex items-center text-teal-100">
                                                <Package size={16} className="mr-2" />
                                                <span className="text-sm">Total Orders</span>
                                            </div>
                                            <span className="font-semibold text-white bg-teal-700 px-3 py-1 rounded-full text-sm">
                                                {performer.totalOrders}
                                            </span>
                                        </div>

                                        {/* Total kW */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-teal-100">
                                                <Zap size={16} className="mr-2" />
                                                <span className="text-sm">Total kW</span>
                                            </div>
                                            <span className="font-semibold text-white bg-teal-700 px-3 py-1 rounded-full text-sm">
                                                {performer.totalKw}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-4 pt-3 border-t border-teal-500 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Star size={14} className="text-yellow-300 mr-1" />
                                            <span className="text-yellow-300 text-sm font-semibold">{performer.rating}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TrendingUp size={14} className="text-teal-200 mr-1" />
                                            <span className="text-teal-200 text-sm">{performer.revenue}</span>
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
                        <FileText size={20} className="text-teal-600 mr-2" />
                        Performer Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-teal-50 rounded-lg p-4">
                            <h4 className="font-semibold text-teal-700 mb-2">Top Performer</h4>
                            <p className="text-2xl font-bold text-teal-600">DC Energy</p>
                            <p className="text-sm text-gray-600 mt-1">30 orders • 155 kW</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-700 mb-2">Average Performance</h4>
                            <p className="text-2xl font-bold text-blue-600">26 orders</p>
                            <p className="text-sm text-gray-600 mt-1">131 kW average</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-700 mb-2">Total Revenue</h4>
                            <p className="text-2xl font-bold text-yellow-600">₹12.3L</p>
                            <p className="text-sm text-gray-600 mt-1">From all performers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerPerformerName;