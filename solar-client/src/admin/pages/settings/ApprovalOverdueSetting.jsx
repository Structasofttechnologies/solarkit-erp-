import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Edit,
  X,
  Save,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  fetchApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  seedApprovalRules
} from '../../../services/settings/settingsApi';
import toast from 'react-hot-toast';

export default function ApprovalOverdueSetting() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);

  // State for adding new rule
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: '',
    overdueDays: 1,
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentRuleId, setCurrentRuleId] = useState(null);

  // Fetch rules
  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await fetchApprovalRules();
      if (data.length === 0) {
        // Try to seed if empty
        try {
          await seedApprovalRules();
          const seededData = await fetchApprovalRules();
          setRules(seededData);
        } catch (seedError) {
          console.error("Seeding failed", seedError);
          setRules([]);
        }
      } else {
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load approval rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleUpdateRule = async (id, field, value) => {
    try {
      await updateApprovalRule(id, { [field]: value });
      toast.success('Rule updated successfully');
      loadRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteApprovalRule(id);
        toast.success('Rule deleted successfully');
        loadRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
        toast.error('Failed to delete rule');
      }
    }
  };

  const handleAddRule = async () => {
    if (!newRule.ruleName.trim()) {
      toast.error('Rule name is required');
      return;
    }

    try {
      if (isEditing) {
        await updateApprovalRule(currentRuleId, {
          ruleName: newRule.ruleName,
          overdueDays: newRule.overdueDays,
          status: newRule.status
        });
        toast.success('Rule updated successfully');
      } else {
        // Generate key efficiently
        const key = newRule.ruleName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

        await createApprovalRule({
          ...newRule,
          type: activeTab,
          key
        });
        toast.success('Rule added successfully');
      }

      setIsAddingMetric(false);
      setIsEditing(false);
      setCurrentRuleId(null);
      setNewRule({ ruleName: '', overdueDays: 1, status: 'Active' });
      loadRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error(error.response?.data?.message || 'Failed to save rule');
    }
  };

  const handleEditClick = (rule) => {
    setNewRule({
      ruleName: rule.ruleName,
      overdueDays: rule.overdueDays,
      status: rule.status
    });
    setCurrentRuleId(rule._id);
    setIsEditing(true);
    setIsAddingMetric(true);
  };

  const filteredRules = rules.filter(rule => rule.type === activeTab);

  const renderTable = () => (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approvals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OverDue Setting (Days)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => (
                <tr key={rule._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.ruleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {rule.overdueDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleUpdateRule(rule._id, 'status', rule.status === 'Active' ? 'Inactive' : 'Active')}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {rule.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md text-xs font-medium transition-all"
                      title="Edit Rule"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Configuration
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No rules found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <nav className="flex mb-2 sm:mb-0" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <div className="flex items-center w-full">
                <h3 className="text-xl font-semibold text-blue-600 mb-0 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Approval Overdue Days Configuration
                </h3>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto p-4">
        {/* Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            onClick={() => setActiveTab('onboarding')}
            className={`card text-center py-4 cursor-pointer transition-colors ${activeTab === 'onboarding' ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
          >
            <div className="card-body">
              <h4 className={`${activeTab === 'onboarding' ? 'text-white' : 'text-gray-900'} font-medium`}>
                Onboarding Approvals Overdue Setting
              </h4>
            </div>
          </div>
          <div
            onClick={() => setActiveTab('company')}
            className={`card text-center py-4 cursor-pointer transition-colors ${activeTab === 'company' ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
          >
            <div className="card-body">
              <h4 className={`${activeTab === 'company' ? 'text-white' : 'text-gray-900'} font-medium`}>
                Company User Approval Overdue Setting
              </h4>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <>
            {/* Main Configuration Tables */}
            {renderTable()}

          </>
        )}
      </div>

      {/* Add Rule Modal */}
      {isAddingMetric && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Rule' : 'Add New Rule'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingMetric(false);
                  setIsEditing(false);
                  setCurrentRuleId(null);
                  setNewRule({ ruleName: '', overdueDays: 1, status: 'Active' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Approval Type</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 font-semibold">
                  {newRule.ruleName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Overdue Days</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={newRule.overdueDays}
                  onChange={(e) => setNewRule({ ...newRule, overdueDays: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={newRule.status}
                  onChange={(e) => setNewRule({ ...newRule, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingMetric(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isEditing ? 'Update Rule' : 'Add Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}