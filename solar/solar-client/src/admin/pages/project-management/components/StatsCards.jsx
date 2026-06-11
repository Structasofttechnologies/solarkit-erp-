import React from 'react';
import { ArrowUp, ListTodo, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-600 text-white rounded-lg shadow-sm p-6 text-center">
        <h5 className="text-lg font-semibold mb-2">Total Projects</h5>
        <h2 className="text-3xl font-bold mb-2">{stats.total || 0}</h2>
        <p className="text-blue-100 flex items-center justify-center gap-1">
          <ArrowUp size={14} />
          12% from last month
        </p>
      </div>

      <div className="bg-yellow-600 text-white rounded-lg shadow-sm p-6 text-center">
        <h5 className="text-lg font-semibold mb-2">In Progress</h5>
        <h2 className="text-3xl font-bold mb-2">{stats.inProgress || 0}</h2>
        <p className="text-yellow-100 flex items-center justify-center gap-1">
          <ListTodo size={14} />
          25% of projects
        </p>
      </div>

      <div className="bg-green-600 text-white rounded-lg shadow-sm p-6 text-center">
        <h5 className="text-lg font-semibold mb-2">Completed</h5>
        <h2 className="text-3xl font-bold mb-2">{stats.completed || 0}</h2>
        <p className="text-green-100 flex items-center justify-center gap-1">
          <CheckCircle size={14} />
          65% completion rate
        </p>
      </div>

      <div className="bg-red-600 text-white rounded-lg shadow-sm p-6 text-center">
        <h5 className="text-lg font-semibold mb-2">Overdue</h5>
        <h2 className="text-3xl font-bold mb-2">{stats.overdue || 0}</h2>
        <p className="text-red-100 flex items-center justify-center gap-1">
          <AlertCircle size={14} />
          9% of projects
        </p>
      </div>
    </div>
  );
}
