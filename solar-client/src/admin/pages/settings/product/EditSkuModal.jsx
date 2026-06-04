import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import { toast } from 'react-hot-toast';

const EditSkuModal = ({ isOpen, onClose, sku, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skuCode: '',
    description: '',
    wattage: '',
    capacity: '',
    phase: '',
    technology: '',
    status: true
  });

  useEffect(() => {
    if (isOpen && sku) {
      setFormData({
        skuCode: sku.skuCode || '',
        description: sku.description || '',
        wattage: sku.wattage || '',
        capacity: sku.capacity || '',
        phase: sku.phase || '',
        technology: sku.technology || '',
        status: sku.status ?? true
      });
    }
  }, [isOpen, sku]);

  if (!isOpen || !sku) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await productApi.updateSku(sku._id, formData);
      if (response.data.success) {
        toast.success("SKU updated successfully");
        onSave();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update SKU");
      }
    } catch (error) {
      console.error("Error updating SKU:", error);
      toast.error("An error occurred while updating SKU");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit SKU Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Code</label>
            <input 
              type="text" 
              readOnly 
              value={formData.skuCode} 
              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wattage</label>
              <input 
                type="number" 
                value={formData.wattage} 
                onChange={(e) => setFormData({...formData, wattage: e.target.value})}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</label>
              <input 
                type="text" 
                value={formData.capacity} 
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phase</label>
              <select 
                value={formData.phase} 
                onChange={(e) => setFormData({...formData, phase: e.target.value})}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
              >
                <option value="">Select Phase</option>
                <option value="1PH">1PH</option>
                <option value="3PH">3PH</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Technology</label>
              <select 
                value={formData.technology} 
                onChange={(e) => setFormData({...formData, technology: e.target.value})}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
              >
                <option value="">Select Technology</option>
                <option value="topcon">Topcon</option>
                <option value="monocrystalline">Monocrystalline</option>
                <option value="bifacial">Bifacial</option>
                <option value="polycrystalline">Polycrystalline</option>
                <option value="thin-film">Thin Film</option>
                <option value="hjt">HJT</option>
                <option value="perc">PERC</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="sku-status"
              checked={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sku-status" className="text-sm font-medium text-gray-700 cursor-pointer">Active</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-2 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#0066cc] text-white rounded text-sm font-bold hover:bg-blue-700 transition shadow-sm uppercase tracking-wider flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSkuModal;
