import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDepartments } from '../../../../services/core/masterApi';
import { getEmployees as getUsers, getTemporaryInchargeDashboard, createTemporaryIncharge, updateTemporaryIncharge } from '../../../../services/hr/hrApi';
import { getStates } from '../../../../services/core/locationApi';
import { X, ChevronDown, Clock } from 'lucide-react';

export default function TemporaryInchargeSetting() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalAbsent: 0,
    stateStats: {},
    totalNotice: 0,
    noticeStateStats: {},
    clusterStats: {},
    allStateStats: { absent: {}, notice: {} },
    employeeList: []
  });

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');

  // Dropdown UI toggle
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [managementType, setManagementType] = useState('Leave Employee Management');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  // Assignment Form State
  const [formData, setFormData] = useState({
    tempInchargeUser: '',
    startDate: '',
    endDate: '',
    reason: 'Leave'
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, deptRes, userRes, statesRes] = await Promise.all([
        getTemporaryInchargeDashboard(),
        getDepartments(),
        getUsers(), // for the temp incharge dropdown in modal
        getStates()
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data);
      }
      if (userRes.success) {
        setUsers(userRes.users || userRes.data || []);
      }
      if (statesRes) {
        setStates(statesRes);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (employee, isEdit = false) => {
    setSelectedEmployee(employee);
    setFormData({
      tempInchargeUser: isEdit ? employee.tempInchargeId || '' : '',
      startDate: isEdit && employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
      endDate: isEdit && employee.endDate ? new Date(employee.endDate).toISOString().split('T')[0] : '',
      reason: 'Leave'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tempInchargeUser || !formData.startDate || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedEmployee._id === formData.tempInchargeUser) {
      toast.error("Original user and Temporary Incharge cannot be the same person");
      return;
    }

    setSaving(true);
    try {
      // Find the department ID for the selected employee if available
      const dept = departments.find(d => d.name === selectedEmployee.department);
      const deptId = dept ? dept._id : null;

      const payload = {
        originalUser: selectedEmployee._id,
        tempInchargeUser: formData.tempInchargeUser,
        department: deptId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };

      if (selectedEmployee.inchargeRecordId) {
        const res = await updateTemporaryIncharge(selectedEmployee.inchargeRecordId, payload);
        if (res.success) {
          toast.success("Temporary In-charge updated successfully");
          setIsModalOpen(false);
          fetchDashboard(); // Refresh UI
        }
      } else {
        const res = await createTemporaryIncharge(payload);
        if (res.success) {
          toast.success("Temporary In-charge assigned successfully");
          setIsModalOpen(false);
          fetchDashboard(); // Refresh UI
        }
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error.response?.data?.message || "Failed to assign temporary in-charge");
    } finally {
      setSaving(false);
    }
  };

  // Derived filtered employees
  const filteredEmployees = dashboardData.employeeList.filter(emp => {
    let match = true;

    // Type Filter
    if (managementType === 'Absent Employee Management' && !emp.isAbsent) match = false;
    if (managementType === 'Notice Period Employee Management' && !emp.isNoticePeriod) match = false;

    // Additional Filters
    if (selectedDeptFilter && emp.department !== selectedDeptFilter) match = false;
    if (selectedStateFilter && emp.state !== selectedStateFilter) match = false;
    return match;
  });

  const isNoticeView = managementType === 'Notice Period Employee Management';
  const isAllView = managementType === 'All Employee Management';
  const totalDisplayCount = isNoticeView ? dashboardData.totalNotice : isAllView ? dashboardData.employeeList.length : dashboardData.totalAbsent;

  // Choose the right state dictionary to use for the top cards
  let stateStatsDisplay = dashboardData.stateStats; // Default to absent
  if (isNoticeView) stateStatsDisplay = dashboardData.noticeStateStats;
  if (isAllView) stateStatsDisplay = dashboardData.employeeList.reduce((acc, emp) => {
    acc[emp.state] = (acc[emp.state] || 0) + 1;
    return acc;
  }, {});

  // The counts for the bottom Select State clickable cards should exactly match
  // the number of employees that will appear in the list for that state
  const stateCountsForCards = dashboardData.employeeList.reduce((acc, emp) => {
    let match = true;
    if (managementType === 'Absent Employee Management' && !emp.isAbsent) match = false;
    if (managementType === 'Notice Period Employee Management' && !emp.isNoticePeriod) match = false;

    if (match) {
      acc[emp.state] = (acc[emp.state] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-xl font-bold text-blue-900 mb-6 tracking-wide">Temporary Incharge Management</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Top Section: Leave Dropdown and State Stats */}
          <div className="flex flex-col md:flex-row gap-6">

            {/* Dropdown Card */}
            <div className="w-full md:w-1/4">
              <div className="relative mb-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded shadow-sm px-4 py-2 flex justify-between items-center text-sm font-medium text-gray-700"
                >
                  {managementType}
                  <ChevronDown size={16} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-10 text-sm">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                      onClick={() => { setManagementType('Absent Employee Management'); setIsDropdownOpen(false); }}
                    >
                      Absent Employee Management
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => { setManagementType('Notice Period Employee Management'); setIsDropdownOpen(false); }}
                    >
                      Notice Period Employee Management
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => { setManagementType('All Employee Management'); setIsDropdownOpen(false); }}
                    >
                      All Employee Management
                    </button>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="bg-[#4b8feb] text-white rounded-md p-6 flex flex-col items-center justify-center shadow-sm h-32">
                <div className="text-3xl font-bold text-red-100">{totalDisplayCount || 0}</div>
                <div className="text-sm tracking-wide mt-1 text-center leading-tight">
                  {isNoticeView ? 'Notice Period Employees' : isAllView ? 'Total Employees' : 'Absent Employees'}
                </div>
              </div>
            </div>

            {/* State Cards Mapping */}
            <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              {Object.keys(stateStatsDisplay || {}).length > 0 ? (
                Object.entries(stateStatsDisplay).map(([stateName, count]) => (
                  <div key={stateName} className="bg-white rounded-md p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center h-32">
                    <div className="text-sm font-bold text-gray-700 mb-2">{stateName}</div>
                    <div className="text-3xl font-bold text-red-500 mb-1">{count}</div>
                    <div className="text-xs text-gray-500 text-center leading-tight">
                      {isNoticeView ? 'Notice Period Employees' : isAllView ? 'Total Employees' : 'Absent Employees'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-md p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center h-32 text-gray-400">
                  No state data available
                </div>
              )}
            </div>
          </div>

          {/* Middle Section: State Filter Cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded"></div>
              <h2 className="text-lg font-bold text-gray-800">Select State</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => setSelectedStateFilter('')}
                className={`cursor-pointer rounded-md p-6 flex flex-col items-center justify-center h-32 shadow-sm border transition-all ${!selectedStateFilter ? 'bg-[#4b8feb] text-white border-blue-400 shadow-md scale-105' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="text-sm font-bold mb-2">All States</div>
                <div className={`text-3xl font-bold mb-1 ${!selectedStateFilter ? 'text-red-100' : 'text-blue-600'}`}>
                  {totalDisplayCount || 0}
                </div>
                <div className={`text-xs ${!selectedStateFilter ? 'text-blue-100' : 'text-gray-500'} text-center leading-tight`}>
                  {isNoticeView ? 'Notice Employees' : isAllView ? 'Total Employees' : 'Absent Employees'}
                </div>
              </div>

              {states.length > 0 && (
                states.map((stateObj) => {
                  const stateName = stateObj.name;
                  const isSelected = selectedStateFilter === stateName;
                  const count = stateCountsForCards[stateName] || 0;
                  return (
                    <div
                      key={stateObj._id || stateName}
                      onClick={() => setSelectedStateFilter(stateName)}
                      className={`cursor-pointer rounded-md p-6 flex flex-col items-center justify-center h-32 shadow-sm border transition-all ${isSelected ? 'bg-[#4b8feb] text-white border-blue-400 shadow-md scale-105' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="text-sm font-bold mb-2">{stateName}</div>
                      <div className={`text-3xl font-bold mb-1 ${isSelected ? 'text-red-100' : 'text-blue-600'}`}>{count}</div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'} text-center leading-tight`}>
                        {isNoticeView ? 'Notice Employees' : isAllView ? 'Total Employees' : 'Absent Employees'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Section: Employee List */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded"></div>
              <h2 className="text-lg font-bold text-gray-800">Employee List</h2>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <span className="font-bold text-gray-700">Employees</span>
                <select
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#4b8feb] text-white">
                    <tr>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center">Absent Days</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center">Notice Period (Days)</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center">Pending Task</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center">Overdue Task</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">Temp Incharge</th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-8 text-center text-gray-500">No employees found</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, idx) => (
                        <tr key={emp._id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{emp.employeeId}</td>
                          <td className="px-6 py-4 text-gray-700">
                            <div>{emp.name}</div>
                            {/* <div className="text-xs text-gray-400">{emp.email}</div> */}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{emp.department}</td>
                          <td className="px-6 py-4 text-gray-500 capitalize">{emp.position}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded ${emp.status === 'Absent' ? 'bg-red-500 text-white' :
                              emp.status === 'Notice Period' ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-red-500 font-medium font-mono text-xs">
                            {emp.absentDays}
                          </td>
                          <td className="px-4 py-4 text-center text-orange-500 font-medium font-mono text-xs">
                            {emp.noticeStatus}
                          </td>
                          <td className="px-4 py-4 text-center text-yellow-500 font-medium font-mono text-xs">{emp.pendingTask}</td>
                          <td className="px-4 py-4 text-center text-red-500 font-medium font-mono text-xs">{emp.overdueTask}</td>
                          <td className="px-6 py-4 text-center">
                            {emp.tempInchargeName && emp.tempInchargeName !== '-' ? (
                              <span className="text-green-600 font-medium">{emp.tempInchargeName}</span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {emp.tempInchargeName && emp.tempInchargeName !== '-' ? (
                              <button
                                onClick={() => openAssignModal(emp, true)}
                                className="bg-yellow-500 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-yellow-600 transition"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => openAssignModal(emp, false)}
                                className="bg-[#0074b7] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition"
                              >
                                Assign
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedEmployee?.inchargeRecordId ? 'Edit Temporary In-Charge' : 'Assign Temporary In-Charge'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Absent Employee</label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.name || ''}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.department || ''}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.position || ''}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm capitalize"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Absent Days</label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee?.absentDays || '0 days'}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Temporary Incharge</label>
                <select
                  name="tempInchargeUser"
                  value={formData.tempInchargeUser}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                  required
                >
                  <option value="">Select employee</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 bg-white text-blue-500 rounded text-sm font-medium hover:bg-gray-50 transition drop-shadow-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#0074b7] text-white rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2 drop-shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}