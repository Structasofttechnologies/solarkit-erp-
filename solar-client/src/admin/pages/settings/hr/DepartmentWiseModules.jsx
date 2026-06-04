import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getDepartments,
  saveDepartmentModules,
  getAllDepartmentStats,
  getDepartmentModules,
  deleteDepartmentModule
} from '../../../../services/hr/departmentModuleApi';
import { X, Trash2 } from 'lucide-react';

const SIDEBAR_MODULES = [
  {
    category: "Dashboard",
    modules: [
      { name: "User Performance", key: "dashboard_performance" },
      { name: "Orders", key: "dashboard_orders" },
      { name: "Orders by Loan", key: "dashboard_orders_loan" },
      { name: "Installer", key: "dashboard_installer" },
      { name: "Delivery", key: "dashboard_delivery" },
      { name: "Inventory", key: "dashboard_inventory" },
      { name: "Vendors", key: "dashboard_vendors" },
    ]
  },
  {
    category: "Departments",
    modules: [
      { name: "Organization chart", key: "dept_org_chart" }
    ]
  },
  {
    category: "Approvals",
    modules: [
      { name: "Approvals", key: "approvals_main" }
    ]
  },
  {
    category: "Project Management",
    modules: [
      { name: "Project Management", key: "pm_main" }
    ]
  },
  {
    category: "Operations",
    modules: [
      { name: "Our Warehouse", key: "ops_warehouse" },
      { name: "Add Inventory", key: "ops_add_inventory" },
      { name: "Inventory Management", key: "ops_inventory" },
    ]
  },
  {
    category: "Settings",
    modules: [
      { name: "Location Settings", key: "settings_location" },
      { name: "HR Settings", key: "settings_hr" },
      { name: "Vendor Settings", key: "settings_vendor" },
      { name: "Sales Settings", key: "settings_sales" },
      { name: "Marketing Settings", key: "settings_marketing" },
      { name: "Delivery Settings", key: "settings_delivery" },
      { name: "Installer Settings", key: "settings_installer" },
      { name: "Inventory Management", key: "settings_inventory" },
      { name: "Product Configuration", key: "settings_product" },
      { name: "Brand Manufacturer", key: "settings_brand" },
      { name: "ComboKit", key: "settings_combokit" },
      { name: "Combokit Overview", key: "settings_combokit_overview" },
      { name: "Order Procurement", key: "settings_order_procurement" },
      { name: "Franchisee Settings", key: "settings_franchisee" },
      { name: "Dealer Settings", key: "settings_dealer" },
      { name: "HRMS Settings", key: "settings_hrms" },
      { name: "Project Management Settings", key: "settings_project" },
      { name: "Quote", key: "settings_quote" },
      { name: "Approval Overdue Setting", key: "settings_approval_overdue" },
      { name: "Overdue Task Setting", key: "settings_overdue_task" },
      { name: "Overdue Status Setting", key: "settings_overdue_status" },
      { name: "Franchisee Manager Setting", key: "settings_franchisee_manager" },
      { name: "Franchise Buy Lead Setting", key: "settings_franchise_buy_lead" },
      { name: "Loan Setting", key: "settings_loan" },
      { name: "Checklist Setting", key: "settings_checklist" },
    ]
  },
  {
    category: "Report",
    modules: [
      { name: "Financial & P&L", key: "report_financial" },
      { name: "Cashflow", key: "report_cashflow" },
      { name: "Inventory", key: "report_inventory" },
      { name: "Loans", key: "report_loans" },
      { name: "Captable", key: "report_captable" },
      { name: "Revenue By CP Types", key: "report_revenue" },
      { name: "Cluster", key: "report_cluster" },
      { name: "District", key: "report_district" },
      { name: "City", key: "report_city" },
    ]
  }
];

const DepartmentWiseModules = () => {
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({});

  // Form State
  const [selectedLevel, setSelectedLevel] = useState('country');
  const [selectedPanel, setSelectedPanel] = useState(''); // NEW
  const [selectedModuleData, setSelectedModuleData] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [selectedModalDepartment, setSelectedModalDepartment] = useState(null);
  const [departmentModulesList, setDepartmentModulesList] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Palette for headers
  const headerColors = [
    'bg-[#0074b7]', /* Blue */
    'bg-[#3bb143]', /* Green */
    'bg-[#ffc107]', /* Yellow */
    'bg-[#dc3545]', /* Red */
    'bg-[#6f42c1]', /* Purple */
    'bg-[#17a2b8]', /* Info/Teal */
    'bg-[#fd7e14]', /* Orange */
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [deptRes, statsRes] = await Promise.all([
        getDepartments(),
        getAllDepartmentStats(),
      ]);

      if (deptRes.success) {
        let grouped = [];
        let mergedStats = { ...(statsRes.stats || {}) };

        deptRes.departments.forEach(d => {
          let existing = grouped.find(g => g.name.toLowerCase().trim() === d.name.toLowerCase().trim());
          if (existing) {
            existing.allIds.push(d._id);
            // merge stats into existing._id
            let s1 = mergedStats[existing._id] || { country: 0, state: 0, cluster: 0, district: 0 };
            let s2 = (statsRes.stats && statsRes.stats[d._id]) ? statsRes.stats[d._id] : { country: 0, state: 0, cluster: 0, district: 0 };
            mergedStats[existing._id] = {
              country: Math.max(s1.country, s2.country),
              state: Math.max(s1.state, s2.state),
              cluster: Math.max(s1.cluster, s2.cluster),
              district: Math.max(s1.district, s2.district),
            };
          } else {
            grouped.push({ ...d, allIds: [d._id] });
          }
        });

        setDepartments(grouped);
        setStats(mergedStats);
      }

      // The original code had `if (modRes.success) setModules(modRes.modules);` but `modRes` was not defined.
      // Assuming this was a placeholder or intended for a future API call,
      // I'm commenting it out to avoid a reference error.
      // if (modRes.success) setModules(modRes.modules);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedModuleData || !selectedDeptId || !selectedLevel) {
      toast.error("Please select a valid Level, Module, and Department");
      return;
    }

    const [moduleCategory, moduleName, moduleKey] = selectedModuleData.split('|');

    setSaving(true);
    try {
      // Check if already assigned
      const existingRes = await getDepartmentModules(selectedDeptId);
      if (existingRes.success && existingRes.accessList) {
        const isAlreadyAssigned = existingRes.accessList.some(
          mapping => mapping.moduleId?.key === moduleKey && mapping.accessLevel === selectedLevel && mapping.enabled
        );
        if (isAlreadyAssigned) {
          toast.error("Already assigned! This module is already active at this level.");
          setSaving(false);
          return;
        }
      }

      const selectedDeptObj = departments.find(d => d._id === selectedDeptId);
      const allIds = selectedDeptObj?.allIds || [selectedDeptId];

      const promises = allIds.map(id => {
        const payload = {
          departmentId: id,
          mappings: [
            {
              moduleKey,
              moduleName,
              moduleCategory,
              accessLevel: selectedLevel,
              enabled: true
            }
          ]
        };
        return saveDepartmentModules(payload);
      });

      const responses = await Promise.all(promises);
      const allSuccess = responses.every(res => res.success);

      if (allSuccess) {
        toast.success('Module assigned successfully');
        // Reset form slightly
        setSelectedModuleData('');
        // Refresh stats completely to recount
        loadInitialData();
      } else {
        toast.error(response.message || 'Failed to assign module');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleViewModules = async (department, mode = 'view') => {
    setSelectedModalDepartment(department);
    setModalMode(mode);
    setIsModalOpen(true);
    setLoadingModal(true);
    try {
      const response = await getDepartmentModules(department._id);
      if (response.success) {
        setDepartmentModulesList(response.accessList || []);
      } else {
        toast.error('Failed to load modules for this department');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while fetching modules');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleEdit = (dept) => {
    handleViewModules(dept, 'edit');
  };

  const handleRemoveModule = async (mappingId) => {
    if (!window.confirm("Are you sure you want to remove this module access?")) return;

    try {
      const res = await deleteDepartmentModule(mappingId);
      if (res.success) {
        toast.success("Module removed successfully");
        // refresh list
        setDepartmentModulesList(prev => prev.filter(m => m._id !== mappingId));
        // refresh main stats
        loadInitialData();
      } else {
        toast.error(res.message || "Failed to remove module");
      }
    } catch (error) {
      console.error("Error removing module:", error);
      toast.error(error.message || "Error removing module");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50">
      <div className="flex-none">
        <h1 className="text-2xl text-blue-900 font-bold mb-6 tracking-wide">Department Modules</h1>

        {/* Assign Modules Form Section */}
        <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="bg-slate-500 text-white px-4 py-3 rounded-t font-semibold">
            Assign Modules to Department
          </div>
          <div className="p-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Select Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="country">Country Level</option>
                  <option value="state">State Level</option>
                  <option value="cluster">Cluster Level</option>
                  <option value="district">District Level</option>
                </select>
              </div>

              {/* Select Panel (Category) - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Panel</label>
                <select
                  value={selectedPanel}
                  onChange={(e) => {
                    setSelectedPanel(e.target.value);
                    setSelectedModuleData(''); // Reset module when panel changes
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Panel --</option>
                  {SIDEBAR_MODULES.map((group) => (
                    <option key={group.category} value={group.category}>
                      {group.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Modules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
                <select
                  value={selectedModuleData}
                  onChange={(e) => setSelectedModuleData(e.target.value)}
                  disabled={!selectedPanel}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">{selectedPanel ? '-- Choose Module --' : 'First Select Panel'}</option>
                  {selectedPanel && SIDEBAR_MODULES.find(g => g.category === selectedPanel)?.modules.map((mod) => (
                    <option
                      key={mod.key}
                      value={`${selectedPanel}|${mod.name}|${mod.key}`}
                      className="font-normal text-gray-800"
                    >
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="text-gray-800">{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                disabled={saving}
                className="bg-[#0074b7] text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-70"
              >
                {saving ? 'Assigning...' : 'Assign Modules'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => {
          const deptStats = stats[dept._id] || { country: 0, state: 0, cluster: 0, district: 0 };
          const headerBg = headerColors[index % headerColors.length];

          return (
            <div key={dept._id} className="bg-white rounded shadow-sm border border-gray-200 flex flex-col items-center">
              <div className={`w-full py-4 px-4 pr-12 text-left text-white font-medium text-lg rounded-t ${headerBg}`}>
                {dept.name}
              </div>

              <div className="w-full flex-1 p-4 space-y-4 flex flex-col">

                {/* Country */}
                <div className="bg-slate-50 rounded p-4 text-left border border-gray-100 shadow-sm flex flex-col">
                  <div className="text-xs text-gray-600 font-medium mb-2">Country Level</div>
                  <div className="text-xl font-bold text-blue-500">{deptStats.country}</div>
                </div>

                {/* State */}
                <div className="bg-slate-50 rounded p-4 text-left border border-gray-100 shadow-sm flex flex-col">
                  <div className="text-xs text-gray-600 font-medium mb-2">State Level</div>
                  <div className="text-xl font-bold text-blue-500">{deptStats.state}</div>
                </div>

                {/* Cluster */}
                <div className="bg-slate-50 rounded p-4 text-left border border-gray-100 shadow-sm flex flex-col">
                  <div className="text-xs text-gray-600 font-medium mb-2">Cluster Level</div>
                  <div className="text-xl font-bold text-blue-500">{deptStats.cluster}</div>
                </div>

                {/* District */}
                <div className="bg-slate-50 rounded p-4 text-left border border-gray-100 shadow-sm flex flex-col">
                  <div className="text-xs text-gray-600 font-medium mb-2">District Level</div>
                  <div className="text-xl font-bold text-blue-500">{deptStats.district}</div>
                </div>

              </div>

              {/* Footer text link */}
              <div className="pb-4 w-full text-center mt-2 flex items-center justify-center gap-6">
                <button
                  className="text-sm font-medium hover:underline text-gray-500 transition-colors"
                  style={{ color: headerBg.replace('bg-[', '').replace(']', '') }}
                  onClick={() => handleViewModules(dept)}
                >
                  View Modules
                </button>
                <span className="text-gray-300">|</span>
                <button
                  className="text-sm font-medium hover:underline text-gray-500 transition-colors"
                  style={{ color: headerBg.replace('bg-[', '').replace(']', '') }}
                  onClick={() => handleEdit(dept)}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modules Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {modalMode === 'edit' ? 'Edit Modules for ' : 'View Modules for '}
                <span className="text-[#0074b7]">{selectedModalDepartment?.name}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingModal ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0074b7]"></div>
                </div>
              ) : departmentModulesList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No modules assigned to this department yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Module Name</th>
                        <th className="px-6 py-3 font-semibold text-center">Access Level</th>
                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                        {modalMode === 'edit' && (
                          <th className="px-6 py-3 font-semibold text-center">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {departmentModulesList.map((mapping) => (
                        <tr key={mapping._id} className="bg-white border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>{mapping.moduleId?.name || 'Unknown Module'}</span>
                              {mapping.moduleId?.description && (
                                <span className="text-xs text-gray-400 font-normal uppercase tracking-wide">
                                  {mapping.moduleId.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                              {mapping.accessLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {mapping.enabled ? (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center justify-center w-max mx-auto gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center justify-center w-max mx-auto gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Inactive
                              </span>
                            )}
                          </td>
                          {modalMode === 'edit' && (
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleRemoveModule(mapping._id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                title="Remove Module"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentWiseModules;