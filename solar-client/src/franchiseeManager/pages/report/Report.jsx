import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    CalendarDays,
    CalendarRange,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    PieChart,
    ListTodo
} from 'lucide-react';
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
import { Line, Doughnut } from 'react-chartjs-2';
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

const ProductivityReport = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const reportRef = useRef(null);

    // Sample data for different time periods
    const data = {
        daily: {
            productivity: 75,
            completed: 5,
            total: 12,
            overdue: 2,
            trend: [65, 70, 68, 72, 75, 78, 75],
            tasks: [
                { name: 'Recruitment', due: 'Today', status: 'completed' },
                { name: 'Generate Salary Report', due: 'Today', status: 'in-progress' },
                { name: 'Team Training', due: 'Yesterday', status: 'overdue' },
                { name: 'Client Meeting', due: 'Yesterday', status: 'overdue' },
                { name: 'Strategic planning', due: 'Tomorrow', status: 'pending' },
                { name: 'Budget Review', due: 'Tomorrow', status: 'pending' }
            ]
        },
        weekly: {
            productivity: 68,
            completed: 20,
            total: 35,
            overdue: 5,
            trend: [60, 62, 65, 64, 68, 70, 68],
            tasks: [
                { name: 'Recruitment', due: 'This week', status: 'completed' },
                { name: 'Generate Salary Report', due: 'This week', status: 'completed' },
                { name: 'Team training', due: 'This week', status: 'in-progress' },
                { name: 'Client Meeting', due: 'Last week', status: 'overdue' },
                { name: 'Strategic planning', due: 'Next week', status: 'pending' },
                { name: 'Budget Review', due: 'Next week', status: 'pending' }
            ]
        },
        monthly: {
            productivity: 82,
            completed: 45,
            total: 60,
            overdue: 5,
            trend: [75, 78, 80, 79, 82, 85, 82],
            tasks: [
                { name: 'Recruitment', due: 'This month', status: 'completed' },
                { name: 'Generate Salary Report', due: 'This month', status: 'completed' },
                { name: 'Team training', due: 'This month', status: 'in-progress' },
                { name: 'Client Meeting', due: 'Last month', status: 'overdue' },
                { name: 'Strategic planning', due: 'Next month', status: 'pending' },
                { name: 'Budget Review', due: 'Next month', status: 'pending' }
            ]
        }
    };

    const currentData = data[selectedPeriod];

    // Calculate status counts for distribution chart
    const statusCounts = {
        completed: currentData.tasks.filter(t => t.status === 'completed').length,
        inProgress: currentData.tasks.filter(t => t.status === 'in-progress').length,
        overdue: currentData.tasks.filter(t => t.status === 'overdue').length,
        pending: currentData.tasks.filter(t => t.status === 'pending').length
    };

    // Line chart data
    const lineChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Productivity %',
                data: currentData.trend,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }
        ]
    };

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
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    };

    // Doughnut chart data
    const doughnutChartData = {
        labels: ['Completed', 'In Progress', 'Overdue', 'Pending'],
        datasets: [
            {
                data: [
                    statusCounts.completed,
                    statusCounts.inProgress,
                    statusCounts.overdue,
                    statusCounts.pending
                ],
                backgroundColor: [
                    '#198754',
                    '#ffc107',
                    '#dc3545',
                    '#0dcaf0'
                ],
                borderWidth: 1,
                hoverOffset: 10
            }
        ]
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 15,
                    padding: 15
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
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Completed</span>;
            case 'in-progress':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" />In Progress</span>;
            case 'overdue':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1" />Overdue</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock size={12} className="mr-1" />Pending</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

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

    const TimeCard = ({ period, icon: Icon, title, description }) => (
        <div
            onClick={() => setSelectedPeriod(period)}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${selectedPeriod === period ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
        >
            <div className="p-6 text-center">
                <Icon className="mx-auto text-blue-600 mb-3" size={40} />
                <h5 className="text-lg font-semibold text-gray-800 mb-2">{title}</h5>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-4">
            <div className="container mx-auto px-4" ref={reportRef}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Productivity Progress Report</h2>
                        <p className="text-gray-500">Track your productivity and task completion progress</p>
                    </div>
                    <button
                        onClick={generatePdf}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                    >
                        <Download size={18} className="mr-2" />
                        Generate PDF
                    </button>
                </div>

                {/* Time Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <TimeCard period="daily" icon={Calendar} title="Daily" description="View today's progress" />
                    <TimeCard period="weekly" icon={CalendarDays} title="Weekly" description="View this week's progress" />
                    <TimeCard period="monthly" icon={CalendarRange} title="Monthly" description="View this month's progress" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Productivity Card */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-600">
                        <div className="p-6">
                            <h6 className="text-sm font-medium text-gray-500 mb-2">Productivity</h6>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentData.productivity}%</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${currentData.productivity}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">Your efficiency based on completed tasks</p>
                        </div>
                    </div>

                    {/* Completed Tasks Card */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600">
                        <div className="p-6">
                            <h6 className="text-sm font-medium text-gray-500 mb-2">Completed Tasks</h6>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentData.completed}/{currentData.total}</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentData.completed / currentData.total) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">Tasks you've successfully finished</p>
                        </div>
                    </div>

                    {/* Overdue Tasks Card */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-red-600">
                        <div className="p-6">
                            <h6 className="text-sm font-medium text-gray-500 mb-2">Overdue Tasks</h6>
                            <h3 className="text-2xl font-bold text-red-600 mb-3">{currentData.overdue}</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentData.overdue / currentData.total) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">Tasks that are past their deadline</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Productivity Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
                        <div className="border-b border-gray-200 p-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                                <TrendingUp size={20} className="mr-2 text-blue-600" />
                                Productivity Trend
                            </h5>
                        </div>
                        <div className="p-4">
                            <div className="h-64">
                                <Line data={lineChartData} options={lineChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Task Distribution Chart */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="border-b border-gray-200 p-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                                <PieChart size={20} className="mr-2 text-blue-600" />
                                Task Distribution
                            </h5>
                        </div>
                        <div className="p-4">
                            <div className="h-64">
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                        <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                            <ListTodo size={20} className="mr-2 text-blue-600" />
                            Recent Tasks
                        </h5>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                        </span>
                    </div>
                    <div className="p-4">
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Task</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Due Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentData.tasks.map((task, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">{task.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{task.due}</td>
                                            <td className="px-4 py-3 text-sm">{getStatusBadge(task.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityReport;