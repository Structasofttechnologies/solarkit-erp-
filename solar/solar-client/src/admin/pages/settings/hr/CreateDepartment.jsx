import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, Trash2, Edit, X } from 'lucide-react';
import { createDepartment, getDepartments, deleteDepartment, updateDepartment, getRoles } from '../../../../services/core/masterApi';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getModules, createModule, updateModule, deleteModule, assignTemporaryIncharge, getTemporaryIncharges, deleteTemporaryIncharge } from '../../../../services/hr/hrApi';
import { getCountries } from '../../../../services/core/locationApi';
import { toast } from 'react-hot-toast';

export default function CreateDepartment() {
  const [departments, setDepartments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    names: [''],
    country: '', // Now added dynamically
    description: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const countryData = await getCountries();
      setCountries(countryData || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      if (res.success) {
        let grouped = [];
        res.data.forEach(d => {
          let existing = grouped.find(g => g.name.toLowerCase().trim() === d.name.toLowerCase().trim());
          if (existing) {
            existing.allIds.push(d._id);
            if (!existing.countries.includes(d.country)) {
              existing.countries.push(d.country);
              existing.countryRecords.push({ id: d._id, country: d.country });
            }
          } else {
            grouped.push({ ...d, countries: [d.country], allIds: [d._id], countryRecords: [{ id: d._id, country: d.country }] });
          }
        });
        setDepartments(grouped);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNameChange = (index, value) => {
    const newNames = [...formData.names];
    newNames[index] = value;
    setFormData({ ...formData, names: newNames });
  };

  const addNameField = () => {
    setFormData({ ...formData, names: [...formData.names, ''] });
  };

  const removeNameField = (index) => {
    setFormData({ ...formData, names: formData.names.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validNames = formData.names.map(n => n.trim()).filter(n => n);

    if (validNames.length === 0) {
      toast.error('At least one valid Department Name is required');
      return;
    }
    if (!formData.country) {
      toast.error('Country is required');
      return;
    }

    try {
      let successCount = 0;
      let errorMessages = [];

      for (const name of validNames) {
        try {
          // Provide the description even though we hid it from the UI, to match old signature requirements if any
          const res = await createDepartment({ name, country: formData.country, description: formData.description });
          if (res.success) {
            successCount++;
          }
        } catch (err) {
          errorMessages.push(`Failed for "${name}": ${err.response?.data?.message || err.message || "Unknown error"}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} department(s)`);
        setFormData({ names: [''], country: formData.country, description: '' }); // keep country selection for convenience
        fetchDepartments();
      }

      if (errorMessages.length > 0) {
        errorMessages.forEach(msg => toast.error(msg));
      }

    } catch (error) {
      console.error("Error creating departments:", error);
      toast.error("An unexpected error occurred during creation");
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete ${dept.name} from all its assigned countries?`)) return;
    try {
      const promises = dept.allIds.map(id => deleteDepartment(id));
      await Promise.all(promises);
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete department");
    }
  }

  const handleEdit = (dept) => {
    setEditingDept({
      originalIds: dept.allIds || [dept._id],
      name: dept.name,
      countryRecords: dept.countryRecords || [{ id: dept._id, country: dept.country }]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const remainingIds = editingDept.countryRecords.map(r => r.id);
      const deletedIds = editingDept.originalIds.filter(id => !remainingIds.includes(id));

      const deletePromises = deletedIds.map(id => deleteDepartment(id));
      await Promise.all(deletePromises);

      const updatePromises = remainingIds.map(id =>
        updateDepartment(id, { name: editingDept.name })
      );
      await Promise.all(updatePromises);

      toast.success("Department updated successfully");
      setIsEditModalOpen(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.message || "Failed to update department");
    }
  };

  return (
    <div className="p-4 bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-2xl text-[#0b386a]">Create Department</h3>
      </div>

      <div className="max-w-5xl mx-auto my-5">
        {/* Create New Department Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-[#0b64a8] text-white p-3">
            <h4 className="text-lg font-bold">Create New Department</h4>
          </div>
          <div className="p-6">
            <form id="departmentForm" onSubmit={handleSubmit}>
              {/* Existing Department Selection */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Select Existing Department (To add country to it)
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/30"
                  onChange={(e) => {
                    if (e.target.value) {
                      const newNames = [...formData.names];
                      newNames[0] = e.target.value;
                      setFormData({ ...formData, names: newNames });
                    }
                  }}
                  value={formData.names[0] && departments.some(d => d.name === formData.names[0]) ? formData.names[0] : ""}
                >
                  <option value="">-- Choose Existing Department --</option>
                  {[...new Set(departments.map(d => d.name))].sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  * Selecting an existing department helps in adding more countries to the same department name.
                </p>
              </div>

              {/* Department Names */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Department Name(s) <span className="text-red-500">*</span>
                </label>
                {formData.names.map((name, index) => (
                  <div key={index} className={`flex items-center gap-2 ${index > 0 ? 'mt-3' : ''}`}>
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter department name"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      required={index === 0} // Only first is strictly required by HTML
                    />
                    {formData.names.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNameField(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        title="Remove Department"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    {index === formData.names.length - 1 && (
                      <button
                        type="button"
                        onClick={addNameField}
                        className="p-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors border border-blue-600 flex items-center justify-center shadow-sm"
                        title="Add Another Department"
                      >
                        <PlusCircle size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Country Selection */}
              <div className="mb-6">
                <label htmlFor="country" className="block font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-[#0b64a8] text-white p-3">
            <h4 className="text-lg font-bold">Summary</h4>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              {/* Pill-like header styling in PHP layout */}
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#e9ecef] rounded-lg">
                    <th className="py-2.5 px-4 font-semibold text-gray-700 text-sm first:rounded-l-md">
                      Department Name
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-gray-700 text-sm">
                      Country
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-gray-700 text-sm last:rounded-r-md text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="2" className="py-8 px-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500 text-sm border-b">
                        No departments created yet.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr key={dept._id} className="hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {dept.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {dept.countries?.join(', ') || dept.country || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <button onClick={() => handleEdit(dept)} className="text-blue-500 hover:text-blue-700 mr-3" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(dept)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center bg-white p-4 rounded-lg shadow-sm w-full font-semibold text-sm text-[#0b386a]">
          Copyright &copy; 2025 Solarkits. All Rights Reserved.
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingDept && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Department</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Active In Countries</label>
                <div className="flex flex-wrap gap-2">
                  {editingDept.countryRecords.map(record => (
                    <span key={record.country} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-1">
                      {record.country}
                      {editingDept.countryRecords.length > 1 && (
                        <button
                          type="button"
                          className="hover:text-red-500 transition-colors focus:outline-none ml-1 flex items-center justify-center p-0.5"
                          onClick={() => setEditingDept({
                            ...editingDept,
                            countryRecords: editingDept.countryRecords.filter(r => r.id !== record.id)
                          })}
                          title="Remove country"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  * To assign this department to another country, use the "Create New Department" form above.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}