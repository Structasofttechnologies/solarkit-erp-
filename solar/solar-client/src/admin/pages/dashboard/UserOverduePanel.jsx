import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, ChevronRight, Filter, Bell } from 'lucide-react';
import api from '../../../services/api/axios';

const UserOverduePanel = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ totalAssigned: 0, completed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [tasksRes, statsRes] = await Promise.all([
                    api.get('/dashboard/user/overdue-tasks'),
                    api.get('/dashboard/user/stats')
                ]);
                setTasks(tasksRes.data.data.tasks);
                setStats(statsRes.data.data);
            } catch (error) {
                console.error('Error fetching user dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Work Dashboard</h1>
                    <p className="text-gray-500">Manage your deadlines and track performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
                        <Filter size={18} /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Bell size={18} /> Notifications
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.totalAssigned}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending / Overdue</p>
                            <h3 className="text-2xl font-bold mt-1 text-red-600">{tasks.length}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Overdue Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Critical Overdue Tasks</h2>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                        Action Required
                    </span>
                </div>
                <div className="divide-y divide-gray-50">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{task.projectName}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {task.priority} Priority
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> Delayed by {task.delayDays} days
                                            </span>
                                            <span className="flex items-center gap-1 font-medium text-blue-600">
                                                Stage: {task.currentStage}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                                            Update Progress
                                        </button>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <CheckCircle size={48} className="mx-auto text-green-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-800">No Overdue Tasks!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                Great job! You are all caught up with your deadlines.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOverduePanel;
