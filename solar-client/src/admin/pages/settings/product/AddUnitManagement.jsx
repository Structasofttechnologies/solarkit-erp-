import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Package,
  Ruler,
  Scale,
  Thermometer,
  Zap,
  Battery,
  Loader2
} from 'lucide-react';
import { productApi } from '../../../../api/productApi';

const AddUnitManagement = () => {
  // States
  const [showForm, setShowForm] = useState(false);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    unitName: '',
    symbol: '',
    unitType: '',
    description: '',
    status: true
  });
  const [toasts, setToasts] = useState([]);

  // Fetch Units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await productApi.getUnits();
      if (res.data.success) {
        setUnits(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch units", error);
      showToast("Failed to fetch units", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAddNewUnit = () => {
    setEditingUnit(null);
    setFormData({ unitName: '', symbol: '', unitType: '', description: '', status: true });
    setShowForm(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      unitName: unit.unitName,
      symbol: unit.symbol,
      unitType: unit.unitType || '',
      description: unit.description || '',
      status: unit.status
    });
    setShowForm(true);
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await productApi.deleteUnit(id);
        showToast('Unit deleted');
        fetchUnits();
      } catch (error) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.unitName || !formData.symbol || !formData.unitType) {
      showToast('Unit Name, Symbol, and Unit Type are required', 'error');
      return;
    }

    try {
      if (editingUnit) {
        await productApi.updateUnit(editingUnit._id, formData);
        showToast('Unit updated');
      } else {
        await productApi.createUnit(formData);
        showToast('Unit added');
      }
      setShowForm(false);
      fetchUnits();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const filteredUnits = units.filter(u =>
    u.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-lg shadow-lg flex items-center gap-2 text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6 p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-600">Unit Management</h2>
        <button onClick={handleAddNewUnit} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <PlusCircle size={20} /> Add New Unit
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
            <h3 className="font-bold text-[#1a365d] text-lg">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h3>
          </div>
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Unit Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition"
                value={formData.unitName}
                onChange={e => setFormData({ ...formData, unitName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Unit Symbol</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Unit Type</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition bg-white"
                value={formData.unitType}
                onChange={e => setFormData({ ...formData, unitType: e.target.value })}
              >
                <option value="">Select Unit Type</option>
                <option value="Power">Power</option>
                <option value="Length">Length</option>
                <option value="Weight">Weight</option>
                <option value="Temperature">Temperature</option>
                <option value="Energy">Energy</option>
                <option value="Volts">Volts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Description</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setShowForm(false)} 
              className="px-5 py-2 bg-gray-500 text-white text-sm font-bold rounded hover:bg-gray-600 transition shadow-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-5 py-2 bg-[#0ea5e9] text-white text-sm font-bold rounded hover:bg-[#0284c7] transition shadow-sm flex items-center gap-2"
            >
              Save Unit
            </button>
          </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full border rounded-lg pl-10 pr-4 py-2"
            placeholder="Search units..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No units found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white border border-gray-100 rounded-lg overflow-hidden">
              <thead className="bg-[#60A5FA] text-white">
                <tr>
                  <th className="p-4 font-semibold text-sm">ID</th>
                  <th className="p-4 font-semibold text-sm">Unit Name</th>
                  <th className="p-4 font-semibold text-sm">Unit Symbol</th>
                  <th className="p-4 font-semibold text-sm">Unit Type</th>
                  <th className="p-4 font-semibold text-sm">Description</th>
                  <th className="p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit, index) => (
                  <tr key={unit._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="p-4 font-bold text-gray-800 text-sm">{unit.unitName}</td>
                    <td className="p-4 text-sm text-gray-600">{unit.symbol}</td>
                    <td className="p-4 text-sm text-gray-600">{unit.unitType || '-'}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={unit.description}>{unit.description || '-'}</td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => handleEditUnit(unit)} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteUnit(unit._id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUnitManagement;