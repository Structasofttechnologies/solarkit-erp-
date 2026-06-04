import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    CalendarDays,
    CalendarRange,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Clock,
    Download,
    BarChart3,
    PieChart,
    ListChecks,
    Award,
    Target,
    FileText
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { dealerManagerApi } from '../../../services/dealerManager/dealerManagerApi';
import { Loader2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import html2pdf from 'html2pdf.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const DealerManagerReport = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reportRef = useRef(null);

    useEffect(() => {
        fetchReportData();
    }, [selectedPeriod]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(`%c[Report System] Connecting to Database for ${selectedPeriod} stats...`, 'color: #3b82f6; font-weight: bold;');

            const response = await dealerManagerApi.getReportStats(selectedPeriod);

            if (response.success) {
                console.log('%c[Database Connected] Dynamic stats received successfully!', 'color: #10b981; font-weight: bold;', response.data);
                setReportData(response.data);
            } else {
                console.error('[Database Error] Failed to fetch dynamic data:', response.message);
                setError(response.message || "Failed to load report data.");
            }
        } catch (err) {
            console.error("%c[System Error] Database connection failed!", 'color: #ef4444; font-weight: bold;', err);
            setError("Failed to load report data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !reportData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium font-inter text-lg">Fetching Dynamic Reports from Database...</p>
                </div>
            </div>
        );
    }

    if (error && !reportData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h3>
                    <p className="text-gray-600 mb-6 font-inter">{error}</p>
                    <button
                        onClick={fetchReportData}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry Database Connection
                    </button>
                </div>
            </div>
        );
    }

    const currentData = reportData;
    if (!currentData) return null;
    const completedPercentage = (currentData.completed / currentData.total) * 100;
    const overduePercentage = (currentData.overdue / currentData.total) * 100;

    // Status counts for distribution chart
    const statusCounts = {
        completed: currentData.tasks.filter(t => t.status === 'completed').length,
        inProgress: currentData.tasks.filter(t => t.status === 'in-progress').length,
        overdue: currentData.tasks.filter(t => t.status === 'overdue').length,
        pending: currentData.tasks.filter(t => t.status === 'pending').length
    };

    // Line chart data
    const lineChartData = {
        labels: currentData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Productivity %',
                data: currentData.trend,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    // Line chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                min: 50,
                max: 100,
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 6
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Productivity: ${context.raw}%`;
                    }
                }
            }
        }
    };

    // Doughnut chart data
    const doughnutChartData = {
        labels: ['Completed', 'In Progress', 'Overdue', 'Pending'],
        datasets: [
            {
                data: [statusCounts.completed, statusCounts.inProgress, statusCounts.overdue, statusCounts.pending],
                backgroundColor: [
                    '#10b981', // green
                    '#f59e0b', // yellow
                    '#ef4444', // red
                    '#3b82f6'  // blue
                ],
                borderWidth: 0,
                hoverOffset: 10
            }
        ]
    };

    // Doughnut chart options
    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '70%'
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' };
            case 'in-progress':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' };
            case 'overdue':
                return { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' };
            case 'pending':
                return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };

    // Generate PDF
    const generatePdf = () => {
        const element = reportRef.current;
        const opt = {
            margin: 0.5,
            filename: 'productivity_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    // Time period cards
    const timePeriods = [
        { id: 'daily', icon: Calendar, label: 'Daily', description: "View today's progress", color: 'blue' },
        { id: 'weekly', icon: CalendarDays, label: 'Weekly', description: "View this week's progress", color: 'purple' },
        { id: 'monthly', icon: CalendarRange, label: 'Monthly', description: "View this month's progress", color: 'green' }
    ];

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                        Productivity Progress Report
                    </h2>
                    <p className="text-gray-500 mt-1">Track your productivity and task completion progress</p>
                </div>
                <button
                    onClick={generatePdf}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                </button>
            </div>

            {/* Report Content */}
            <div ref={reportRef} className="space-y-6">
                {/* Time Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {timePeriods.map((period) => {
                        const Icon = period.icon;
                        return (
                            <div
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`
                  bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
                  ${selectedPeriod === period.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'border border-gray-200'
                                    }
                `}
                            >
                                <div className="text-center">
                                    <Icon className={`w-12 h-12 mx-auto mb-3 ${selectedPeriod === period.id ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                    <h5 className={`text-lg font-semibold mb-1 ${selectedPeriod === period.id ? 'text-blue-600' : 'text-gray-700'
                                        }`}>
                                        {period.label}
                                    </h5>
                                    <p className="text-sm text-gray-500">{period.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Productivity Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <h6 className="text-sm font-medium text-gray-500">Productivity</h6>
                            <Award className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentData.productivity}%</h3>
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${currentData.productivity}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500">Your efficiency based on completed tasks</p>
                    </div>

                    {/* Completed Tasks Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <h6 className="text-sm font-medium text-gray-500">Completed Tasks</h6>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentData.completed}/{currentData.total}</h3>
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${completedPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500">Tasks you've successfully finished</p>
                    </div>

                    {/* Overdue Tasks Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-2">
                            <h6 className="text-sm font-medium text-gray-500">Overdue Tasks</h6>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-red-500 mb-2">{currentData.overdue}</h3>
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                            <div
                                className="h-full bg-red-500 rounded-full transition-all duration-300"
                                style={{ width: `${overduePercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500">Tasks that are past their deadline</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Productivity Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                                Productivity Trend
                            </h5>
                            <span className="text-sm text-gray-500">Last 7 days</span>
                        </div>
                        <div className="h-64">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Task Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                                Task Distribution
                            </h5>
                            <span className="text-sm text-gray-500">Current period</span>
                        </div>
                        <div className="h-64">
                            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                                <ListChecks className="w-5 h-5 mr-2 text-green-600" />
                                Recent Tasks
                            </h5>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Task</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Due Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentData.tasks.map((task, index) => {
                                        const badge = getStatusBadge(task.status);
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-800">{task.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{task.due}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerManagerReport;