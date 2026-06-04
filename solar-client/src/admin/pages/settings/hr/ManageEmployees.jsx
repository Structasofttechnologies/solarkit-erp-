import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit } from 'lucide-react';
import { getDepartments } from '../../../../services/core/masterApi';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../../../services/hr/hrApi';
import { getStates } from '../../../../services/core/locationApi';
import { toast } from 'react-hot-toast';

export default function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'employee',
        department: '',
        state: '',
        status: 'active',
    });

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const roleOptions = [
        { value: 'employee', label: 'Employee' },
        { value: 'admin', label: 'Admin' },
        { value: 'dealerManager', label: 'Dealer Manager' },
        { value: 'franchiseeManager', label: 'Franchisee Manager' },
        { value: 'delivery_manager', label: 'Delivery Manager' },
        { value: 'installer', label: 'Installer' },
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [empRes, deptRes, statesRes] = await Promise.all([
                getHREmployees(),
                getDepartments(),
                getStates()
            ]);
            if (empRes.success) setEmployees(empRes.data);
            if (deptRes.success) setDepartments(deptRes.data);
            if (statesRes) setStates(statesRes);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.state) {
            toast.error("Name, Email, Phone, and State are required");
            return;
        }

        if (!editingId && !formData.password) {
            toast.error("Password is required for new employees");
            return;
        }

        try {
            const payload = { ...formData };

            // Handle optional department
            if (!payload.department) delete payload.department;

            let res;
            if (editingId) {
                // If password is empty during edit, don't send it to prevent updating it to empty
                if (!payload.password) delete payload.password;
                res = await updateHREmployee(editingId, payload);
            } else {
                res = await createHREmployee(payload);
            }

            if (res.success) {
                toast.success(`Employee ${editingId ? 'updated' : 'created'} successfully`);
                setShowForm(false);
                resetForm();
                fetchInitialData(); // refresh list
            }
        } catch (error) {
            console.error("Employee save error:", error);
            toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} employee`);
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            password: '', // Do not populate password for security
            role: employee.role || 'employee',
            department: employee.department?._id || '',
            state: employee.state || '',
            status: employee.status || 'active',
        });
        setEditingId(employee._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            const res = await deleteHREmployee(id);
            if (res.success) {
                toast.success("Employee deleted successfully");
                fetchInitialData();
            }
        } catch (error) {
            console.error("Delete employee error:", error);
            toast.error("Failed to delete employee");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'employee',
            department: '',
            state: '',
            status: 'active',
        });
        setEditingId(null);
    };

    const openCreateForm = () => {
        setShowForm(!showForm);
        if (!showForm) {
            resetForm();
        }
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-4">
                <nav className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                    <h3 className="font-bold text-xl mb-0">Manage Employees</h3>
                    <button
                        onClick={openCreateForm}
                        className="bg-[#0074b7] hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        {showForm ? 'Close Form' : '+ Add Employee'}
                    </button>
                </nav>
            </div>

            {/* Form Wrapper */}
            {showForm && (
                <div className="card shadow-md rounded-xl overflow-hidden mb-6 bg-white p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h4 className="font-bold text-lg text-gray-800">{editingId ? 'Edit Employee' : 'Create New Employee'}</h4>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Employee Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingId ? '(Leave blank to keep)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    {roleOptions.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    name="department"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <select
                                    name="state"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {states.map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    {statusOptions.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#0074b7] hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition"
                            >
                                {editingId ? 'Update Employee' : 'Save Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Wrapper */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#4b8feb] text-white">
                            <tr>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">State</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading employees...</td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No employees found. Create one above.</td></tr>
                            ) : (
                                employees.map(employee => (
                                    <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{employee.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{employee.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{employee.phone}</td>
                                        <td className="px-6 py-4 text-gray-600 capitalize">
                                            {roleOptions.find(r => r.value === employee.role)?.label || employee.role}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{employee.department?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{employee.state}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
