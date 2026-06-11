import React from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge,
    MapPin,
    AlertCircle,
    Package,
    Zap,
    Users,
    Clock,
    XCircle,
    TrendingDown,
    Calendar,
    Phone,
    Mail,
    AlertTriangle
} from 'lucide-react';

const DealerManagerDealerInactive = () => {
    // Sample inactive dealers data
    const inactiveDealers = [
        {
            id: 1,
            name: 'SunTech Energy',
            dealerName: 'SunTech Energy',
            overdueTasks: 8,
            totalOrders: 25,
            totalKW: '125 kW',
            contactPerson: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            email: 'contact@suntechenergy.com',
            lastActive: '2024-01-15',
            location: 'Rajkot',
            status: 'Inactive'
        },
        {
            id: 2,
            name: 'DC Energy',
            dealerName: 'DC Energy',
            overdueTasks: 2,
            totalOrders: 30,
            totalKW: '155 kW',
            contactPerson: 'Priya Shah',
            phone: '+91 87654 32109',
            email: 'info@dcenergy.com',
            lastActive: '2024-02-10',
            location: 'Rajkot',
            status: 'Inactive'
        },
        {
            id: 3,
            name: 'Ctron Energy',
            dealerName: 'Ctron Energy',
            overdueTasks: 10,
            totalOrders: 25,
            totalKW: '125 kW',
            contactPerson: 'Amit Patel',
            phone: '+91 76543 21098',
            email: 'amit@ctronenergy.com',
            lastActive: '2024-01-05',
            location: 'Rajkot',
            status: 'Inactive'
        },
        {
            id: 4,
            name: 'Green Power Solutions',
            dealerName: 'Green Power Solutions',
            overdueTasks: 5,
            totalOrders: 18,
            totalKW: '90 kW',
            contactPerson: 'Sunita Mehta',
            phone: '+91 65432 10987',
            email: 'sunita@greenpower.com',
            lastActive: '2024-01-20',
            location: 'Rajkot',
            status: 'Inactive'
        },
        {
            id: 5,
            name: 'Solar Tech India',
            dealerName: 'Solar Tech India',
            overdueTasks: 12,
            totalOrders: 32,
            totalKW: '160 kW',
            contactPerson: 'Vikram Singh',
            phone: '+91 54321 09876',
            email: 'vikram@solartech.com',
            lastActive: '2024-01-25',
            location: 'Rajkot',
            status: 'Inactive'
        },
        {
            id: 6,
            name: 'Eco Energy Solutions',
            dealerName: 'Eco Energy Solutions',
            overdueTasks: 7,
            totalOrders: 22,
            totalKW: '110 kW',
            contactPerson: 'Neha Gupta',
            phone: '+91 43210 98765',
            email: 'neha@ecoenergy.com',
            lastActive: '2024-02-05',
            location: 'Rajkot',
            status: 'Inactive'
        }
    ];

    const location = 'Rajkot';
    const totalInactive = inactiveDealers.length;

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Header with gradient background */}
            <div
                className="text-white p-6 rounded-2xl mb-6 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            <Gauge className="w-6 h-6 mr-2" />
                            Dealer In-Active List
                        </h2>
                        <p className="text-blue-100 mt-1 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            {totalInactive} dealers currently inactive
                        </p>
                    </div>
                    <h2 className="text-xl font-semibold flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <MapPin className="w-5 h-5 mr-2" />
                        {location}
                    </h2>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Inactive</p>
                            <p className="text-2xl font-bold text-gray-800">{totalInactive}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Overdue Tasks</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {inactiveDealers.reduce((sum, dealer) => sum + dealer.overdueTasks, 0)}
                            </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {inactiveDealers.reduce((sum, dealer) => sum + dealer.totalOrders, 0)}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Capacity</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {inactiveDealers.reduce((sum, dealer) => sum + parseInt(dealer.totalKW), 0)} kW
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inactive Dealers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {inactiveDealers.map((dealer) => (
                    <Link
                        key={dealer.id}
                        to={`/dealer-manager/dealer-dashboard/${dealer.id}`}
                        className="group transform transition-all duration-300 hover:-translate-y-2"
                    >
                        <div
                            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg overflow-hidden h-full"
                        >
                            {/* Card Header */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h5 className="text-white text-lg font-bold flex items-center">
                                            <span className="bg-white bg-opacity-20 p-1 rounded mr-2">
                                                <Users className="w-4 h-4" />
                                            </span>
                                            {dealer.dealerName}
                                        </h5>
                                        <p className="text-red-100 text-sm mt-1 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {dealer.location}
                                        </p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                                        <TrendingDown className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                        <div className="flex items-center text-white text-sm mb-1">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Overdue
                                        </div>
                                        <p className="text-white text-xl font-bold">{dealer.overdueTasks}</p>
                                    </div>

                                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                        <div className="flex items-center text-white text-sm mb-1">
                                            <Package className="w-3 h-3 mr-1" />
                                            Orders
                                        </div>
                                        <p className="text-white text-xl font-bold">{dealer.totalOrders}</p>
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-white text-xs mb-1">
                                        <span className="flex items-center">
                                            <Zap className="w-3 h-3 mr-1" />
                                            Capacity
                                        </span>
                                        <span className="font-semibold">{dealer.totalKW}</span>
                                    </div>
                                    <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-300 rounded-full"
                                            style={{ width: `${(parseInt(dealer.totalKW) / 200) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-white text-xs">
                                        <Clock className="w-3 h-3 mr-2" />
                                        Last active: {dealer.lastActive}
                                    </div>
                                    <div className="flex items-center text-white text-xs">
                                        <Phone className="w-3 h-3 mr-2" />
                                        {dealer.phone}
                                    </div>
                                    <div className="flex items-center text-white text-xs">
                                        <Mail className="w-3 h-3 mr-2" />
                                        {dealer.email}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-4 pt-3 border-t border-white border-opacity-30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-xs flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            {dealer.overdueTasks} tasks overdue
                                        </span>
                                        <button className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors">
                                            View Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* No Results Message (if no inactive dealers) */}
            {inactiveDealers.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-700 font-semibold text-lg">No Inactive Dealers</h3>
                    <p className="text-gray-500 text-sm mt-1">All dealers are currently active</p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Send Bulk Reminders
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Review Calls
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Export Inactive List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DealerManagerDealerInactive;