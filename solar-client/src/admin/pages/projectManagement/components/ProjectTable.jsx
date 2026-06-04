import React from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';

export default function ProjectTable({
  projects,
  selectedStatus,
  setSelectedStatus,
  selectedCP,
  setSelectedCP,
  selectedDistrict,
  setSelectedDistrict,
  statusOptions,
  districts,
  getStatusColor,
  onEdit,
  onDelete,
  showActions = true
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h5 className="text-lg font-semibold">Recent Projects</h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow max-w-4xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status:
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by CP:
            </label>
            <div className="relative">
              <select
                value={selectedCP}
                onChange={(e) => setSelectedCP(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All CP's</option>
                <option value="Sunshine Solar Pvt Ltd">Sunshine Solar Pvt Ltd</option>
                <option value="Vikas Solar Pvt Ltd">Vikas Solar Pvt Ltd</option>
                <option value="Sun Solar Pvt Ltd">Sun Solar Pvt Ltd</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by District:
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All District</option>
                {districts && districts.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">kW</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
              {showActions && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.projectId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.projectType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-center">{project.totalKW} kW</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statusStage, project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(project.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${project.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                  {project.overdueDays} Days
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2 justify-center">
                    <button onClick={() => onEdit(project)} className="p-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(project._id)} className="p-1 border border-red-600 text-red-600 rounded hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={showActions ? "9" : "8"} className="px-6 py-12 text-center text-gray-500 text-sm">No projects found matching the criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
