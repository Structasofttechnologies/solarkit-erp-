
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
    DollarSign,
    TrendingUp,
    Clock,
    Award,
    BarChart,
    PieChart,
    Home,
    Building2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Zap,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import api from '../../../api/api'; // Ensure this path is correct

const DealerTrackCommission = () => {
    // State for data
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCommission: '₹0',
        completedCommission: '₹0',
        pendingCommission: '₹0',
        averageCommission: '₹0',
        highestCommission: '₹0',
        totalProjects: '0'
    });

    const [commissionData, setCommissionData] = useState([]);

    // Chart States
    const [commissionChartData, setCommissionChartData] = useState({
        categories: [],
        data: []
    });

    const [distributionChartData, setDistributionChartData] = useState([0, 0, 0, 0]);

    // Fetch Data Function
    const fetchCommissionData = async () => {
        setLoading(true);
        try {
            console.log("🔄 Fetching Commission Data...");
            const response = await api.get('/dealer/commission/stats');

            if (response.data.success) {
                console.log("📊 Commission Data Fetched:", response.data);

                const { stats, charts, tableData } = response.data;

                setStats(stats);
                setCommissionData(tableData);
                setCommissionChartData(charts.trend);
                setDistributionChartData(charts.distribution);
            } else {
                console.error("❌ Failed to fetch commission data:", response.data.message);
            }
        } catch (error) {
            console.error("❌ Error fetching commission data:", error);
        } finally {
            setLoading(false);
        }
    };

    // UseEffect to load data
    useEffect(() => {
        fetchCommissionData();
    }, []);

    // Commission trend chart configuration
    const commissionChartOptions = {
        series: [{
            name: 'Commission',
            data: commissionChartData.data
        }],
        chart: {
            height: 350,
            type: 'line',
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        grid: {
            show: true,
            padding: { left: 0, right: 0 }
        },
        stroke: {
            width: 7,
            curve: 'smooth'
        },
        xaxis: {
            categories: commissionChartData.categories,
            labels: {
                style: { colors: '#6c757d', fontSize: '12px' }
            }
        },
        title: {
            text: 'Commission Trend',
            align: 'left',
            style: { fontSize: '16px', fontWeight: '600', color: '#333' }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                gradientToColors: ['#1b00ff'],
                shadeIntensity: 1,
                type: 'horizontal',
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100, 100, 100]
            }
        },
        markers: {
            size: 4,
            colors: ['#1bff5f'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        yaxis: {
            labels: {
                formatter: (value) => {
                    return '₹' + (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value);
                },
                style: { colors: '#6c757d', fontSize: '12px' }
            },
            title: {
                text: 'Commission (₹)',
                style: { color: '#495057', fontSize: '12px' }
            }
        },
        tooltip: {
            y: {
                formatter: (value) => '₹' + value.toLocaleString()
            }
        }
    };

    // Project distribution chart configuration
    const distributionChartOptions = {
        series: distributionChartData, // [Res, Com, Comp, Pend]
        labels: ['Residential Project', 'Commercial Project', 'Completed Project', 'Pending Project'],
        chart: {
            type: 'donut',
            height: 350,
            toolbar: { show: false }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
            }
        }],
        title: {
            text: 'Project Distribution',
            align: 'left',
            style: { fontSize: '16px', fontWeight: '600', color: '#333' }
        },
        legend: {
            position: 'bottom',
            fontSize: '12px',
            itemMargin: { horizontal: 10, vertical: 5 }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: () => stats.totalProjects
                        }
                    }
                }
            }
        },
        colors: ['#4299e1', '#48bb78', '#9f7aea', '#ed8936']
    };

    // Helpers
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'Commercial': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'Residential': return 'bg-green-100 text-green-800 border border-green-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return 'bg-blue-600 text-white';
            case 'Pending': return 'bg-yellow-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Commercial': return <Building2 size={14} className="mr-1" />;
            case 'Residential': return <Home size={14} className="mr-1" />;
            default: return null;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
            case 'Paid':
                return <CheckCircle size={14} className="mr-1" />;
            case 'Pending': return <AlertCircle size={14} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-white shadow-sm p-3">
                    <nav className="container-fluid flex justify-between items-center">
                        <ol className="flex items-center space-x-2">
                            <li className="text-gray-500">
                                <h3 className="text-xl font-semibold text-gray-800">Track Commission</h3>
                            </li>
                        </ol>
                        <button
                            onClick={fetchCommissionData}
                            disabled={loading}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </nav>
                </div>
            </div>

            <div className="p-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    <SummaryCard title="Total Commission" value={stats.totalCommission} icon={DollarSign} color="text-green-500" />
                    <SummaryCard title="Completed Commission" value={stats.completedCommission} icon={CheckCircle} color="text-green-500" valueColor="text-green-600" />
                    <SummaryCard title="Pending Commission" value={stats.pendingCommission} icon={Clock} color="text-yellow-500" valueColor="text-yellow-600" />
                    <SummaryCard title="Average Commission" value={stats.averageCommission} icon={BarChart} color="text-blue-500" />
                    <SummaryCard title="Highest Commission" value={stats.highestCommission} icon={Award} color="text-purple-500" />
                    <SummaryCard title="Total Projects" value={stats.totalProjects} icon={TrendingUp} color="text-orange-500" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Commission Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
                        {loading ? <LoadingPlaceholder height={350} /> : (
                            <Chart
                                options={commissionChartOptions}
                                series={commissionChartOptions.series}
                                type="line"
                                height={350}
                            />
                        )}
                    </div>

                    {/* Project Distribution Chart */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
                        {loading ? <LoadingPlaceholder height={350} /> : (
                            <Chart
                                options={distributionChartOptions}
                                series={distributionChartOptions.series}
                                type="donut"
                                height={350}
                            />
                        )}
                    </div>
                </div>

                {/* Commission Table */}
                <div className="bg-white rounded-lg shadow-sm mt-4">
                    <div className="px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">Commission Details</h4>
                        <div className="flex space-x-2">
                            <button className="flex items-center px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                <Filter size={14} className="mr-1" />
                                Filter
                            </button>
                            <button className="flex items-center px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                <Download size={14} className="mr-1" />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">System Size</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commission</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            Loading commission data...
                                        </td>
                                    </tr>
                                ) : commissionData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            No commission records found.
                                        </td>
                                    </tr>
                                ) : (
                                    commissionData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.project}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                                                    {getTypeIcon(item.type)}
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 flex items-center">
                                                <Zap size={14} className="mr-1 text-yellow-500" />
                                                {item.systemSize}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.totalAmount}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-green-600">{item.commission}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 flex items-center">
                                                <Calendar size={14} className="mr-1 text-gray-400" />
                                                {item.date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                                                    {getStatusIcon(item.status)}
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Table Footer with Pagination (optional) */}
                    {commissionData.length > 0 && (
                        <div className="px-4 py-3 border-t flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Showing 1 to {commissionData.length} of {commissionData.length} entries
                            </div>
                            {/* Pagination controls can be added here if backend supports pagination */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Subcomponent for specific cards
const SummaryCard = ({ title, value, icon: Icon, color, valueColor = "text-gray-800" }) => (
    <div className="bg-white rounded-lg shadow-sm p-3 text-center border hover:shadow-md transition-shadow">
        <h3 className={`text-xl font-bold ${valueColor}`}>{value}</h3>
        <p className="text-xs text-gray-500 flex items-center justify-center mt-1">
            <Icon size={12} className={`mr-1 ${color}`} />
            {title}
        </p>
    </div>
);

const LoadingPlaceholder = ({ height }) => (
    <div className={`w-full flex items-center justify-center bg-gray-100 rounded animate-pulse`} style={{ height }}>
        <span className="text-gray-400">Loading Chart...</span>
    </div>
);

export default DealerTrackCommission;