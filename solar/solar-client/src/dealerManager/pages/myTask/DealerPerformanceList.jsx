import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import performanceApi from '../../../services/performance/performanceApi';

const DealerPerformanceList = () => {
    const { type } = useParams(); // 'performer', 'active', 'inactive'
    const navigate = useNavigate();
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDealers = async () => {
            try {
                setLoading(true);
                const res = await performanceApi.getDealerPerformance();
                const allDealers = res?.tableData || [];

                console.log(`✅ [Dealer Performance List - ${type}] Successfully connected to Database`);
                console.log(`📊 [Dealer Performance List] Total dealers fetched:`, allDealers.length);

                let filtered = [];
                if (type === 'performer') {
                    // Logic from backend: Active status and orders > 0
                    filtered = allDealers.filter(d => d.status === 'Active' && d.orders > 0);
                } else if (type === 'active') {
                    // Just all active ones
                    filtered = allDealers.filter(d => d.status === 'Active');
                } else if (type === 'inactive') {
                    // Just inactive ones
                    filtered = allDealers.filter(d => d.status === 'Inactive');
                }

                setDealers(filtered);
            } catch (err) {
                console.error("Failed to fetch performance data:", err);
                setError(err.message || "Failed to load dealers");
            } finally {
                setLoading(false);
            }
        };

        fetchDealers();
    }, [type]);

    const getTitle = () => {
        switch (type) {
            case 'performer': return 'Performer Dealers';
            case 'active': return 'Active Dealers';
            case 'inactive': return 'Inactive Dealers';
            default: return 'Dealers';
        }
    };

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
        )
    }

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dealer-manager/my-task/dealer-performance')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <Users className="text-blue-600" />
                        {getTitle()}
                    </h2>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-blue-600 text-white px-5 py-3 flex items-center">
                    <Users className="inline mr-3 text-white" size={24} />
                    <h5 className="font-semibold text-lg">{getTitle()} ({dealers.length})</h5>
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
                            {dealers.map((row, index) => (
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
                            {!dealers.length && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No dealers found in this category
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DealerPerformanceList;
