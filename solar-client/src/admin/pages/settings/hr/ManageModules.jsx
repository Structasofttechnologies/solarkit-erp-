import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Trash2, Edit } from 'lucide-react';
import { getModules, createModule, updateModule, deleteModule } from '../../../../services/hr/hrApi';
import { toast } from 'react-hot-toast';

export default function ManageModules() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        key: '',
        description: '',
        defaultLevel: 'country',
        status: 'active'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const res = await getAllModules();
            if (res.success) {
                setModules(res.data);
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
            toast.error("Failed to load modules");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Auto-generate key from name if key is empty or if we are typing in empty key and editing name
        if (name === 'name' && !editingId && formData.key === '') {
            const autoKey = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
            setFormData(prev => ({ ...prev, name: value, key: autoKey }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.key) {
            toast.error('Module Name and Key are required');
            return;
        }

        try {
            if (editingId) {
                const res = await updateModule(editingId, formData);
                if (res.success) {
                    toast.success('Module updated successfully');
                }
            } else {
                const res = await createModule(formData);
                if (res.success) {
                    toast.success('Module created successfully');
                }
            }
            resetForm();
            fetchModules();
        } catch (error) {
            console.error("Error saving module:", error);
            toast.error(error.response?.data?.message || "Failed to save module");
        }
    };

    const handleEdit = (module) => {
        setFormData({
            name: module.name,
            key: module.key,
            description: module.description || '',
            defaultLevel: module.defaultLevel || 'country',
            status: module.status || 'active'
        });
        setEditingId(module._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this module? This may remove it from assigned departments.")) return;
        try {
            const res = await deleteModule(id);
            if (res.success) {
                toast.success("Module deleted");
                fetchModules();
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete module");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            key: '',
            description: '',
            defaultLevel: 'country',
            status: 'active'
        });
        setEditingId(null);
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-4">
                <nav className="bg-white p-3 rounded-lg shadow-sm">
                    <ol className="flex items-center">
                        <li className="flex items-center w-full">
                            <h3 className="font-bold text-xl mb-0 flex items-center gap-2">
                                <Layers size={24} className="text-blue-500" />
                                Manage Modules
                            </h3>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 my-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="lg:col-span-1">
                    <div className="card shadow-lg rounded-xl overflow-hidden mb-6">
                        <div className="bg-blue-500 text-white p-4">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                <PlusCircle size={20} />
                                {editingId ? 'Edit Module' : 'Create New Module'}
                            </h4>
                        </div>
                        <div className="bg-white p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                                        Module Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. Sales Settings"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                                        Module Key <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="key"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. settings_sales"
                                        value={formData.key}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!!editingId} // Usually good to prevent changing keys if they are referenced
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Unique identifier, used in code.</p>
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                                        Default Level
                                    </label>
                                    <select
                                        name="defaultLevel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={formData.defaultLevel}
                                        onChange={handleInputChange}
                                    >
                                        <option value="country">Country</option>
                                        <option value="state">State</option>
                                        <option value="cluster">Cluster</option>
                                        <option value="district">District</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="coming-soon">Coming Soon</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Brief description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        {editingId ? 'Update Module' : 'Create Module'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List Card */}
                <div className="lg:col-span-2">
                    <div className="card shadow-lg rounded-xl overflow-hidden">
                        <div className="bg-blue-500 text-white p-4">
                            <h4 className="text-lg font-bold">Existing Modules</h4>
                        </div>
                        <div className="bg-white p-0">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 text-sm">Module Name & Key</th>
                                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 text-sm">Level</th>
                                            <th className="py-3 px-4 border-b text-center font-semibold text-gray-700 text-sm">Status</th>
                                            <th className="py-3 px-4 border-b text-right font-semibold text-gray-700 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">Loading...</td>
                                            </tr>
                                        ) : modules.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">No modules found</td>
                                            </tr>
                                        ) : (
                                            modules.map((mod) => (
                                                <tr key={mod._id} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-800">{mod.name}</div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{mod.key}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                                                        {mod.defaultLevel}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${mod.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                mod.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {mod.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => handleEdit(mod)}
                                                            className="text-blue-500 hover:text-blue-700 p-1 mx-1"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(mod._id)}
                                                            className="text-red-500 hover:text-red-700 p-1 mx-1"
                                                            title="Delete"
                                                        >
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
                </div>
            </div>
        </div>
    );
}
