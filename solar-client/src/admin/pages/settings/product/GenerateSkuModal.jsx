import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { productApi } from '../../../../api/productApi';

const getCode = (str, len) => {
  if (!str) return 'X'.repeat(len);
  return str.replace(/[^a-zA-Z0-9]/g, '').substring(0, len).toUpperCase();
};

const GenerateSkuModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [phases, setPhases] = useState({ single: false, three: false, none: false });
  const [capacities, setCapacities] = useState([]);
  const [newCapacity, setNewCapacity] = useState('');
  const [unit, setUnit] = useState('kW');
  const [availableUnits, setAvailableUnits] = useState([]);
  const [skuPreview, setSkuPreview] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const res = await productApi.getUnits();
      if (res.data.success) {
        setAvailableUnits(res.data.data);
        if (res.data.data.length > 0) {
          // Keep kW as default if it exists, otherwise use first
          const kwUnit = res.data.data.find(u => u.symbol === 'kW');
          setUnit(kwUnit ? 'kW' : res.data.data[0].symbol);
        }
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };


  const handleAddCapacity = () => {
    if (!newCapacity.trim()) return;
    const cap = `${newCapacity} ${unit}`;
    if (!capacities.includes(cap)) {
      setCapacities([...capacities, cap]);
      setNewCapacity('');
    }
  };

  const handleRemoveCapacity = (cap) => {
    setCapacities(capacities.filter(c => c !== cap));
  };

  useEffect(() => {
    if (!product || (capacities.length === 0 && !phases.single && !phases.three && !phases.none)) {
      setSkuPreview([]);
      return;
    }

    const catCode = getCode(product.categoryId?.name || 'GEN', 3);
    const brandCode = getCode(product.brandId?.name || product.brandId?.brand || 'VES', 3);
    const prodCode = getCode(product.name || 'PROD', 4);
    const techCode = getCode(Array.isArray(product.technology) ? product.technology[0] : (product.technology || 'TECH'), 4);
    const stateCode = getCode(product.stateId?.code || product.stateId?.name || 'GJ', 2);
    const clusterCode = getCode(product.clusterId?.name?.split(' ').pop() || 'A', 1);

    const selectedPhases = [];
    if (phases.single) selectedPhases.push('1PH');
    if (phases.three) selectedPhases.push('3PH');
    if (phases.none) selectedPhases.push('NONE');

    const newPreview = [];
    selectedPhases.forEach(phase => {
      capacities.forEach(cap => {
        const capValue = cap.split(' ')[0];
        let subTech = '';
        if (phase === '1PH') subTech = '1';
        else if (phase === '3PH') subTech = '3';
        
        const skuCode = `${catCode}-${brandCode}-${prodCode}-${techCode}${subTech}-${capValue}-${stateCode}-${clusterCode}`;
        
        // Find if this SKU already was in preview to preserve selection
        const existing = skuPreview.find(s => s.skuCode === skuCode);
        
        newPreview.push({
          skuCode,
          phase: phase === 'NONE' ? '-' : phase,
          capacity: cap,
          capValue,
          selected: existing ? existing.selected : true
        });
      });
    });
    setSkuPreview(newPreview);
  }, [phases, capacities, product]);

  if (!isOpen || !product) return null;


  const handleGenerate = async () => {
    try {
      setLoading(true);

      const selectedSkus = skuPreview.filter(s => s.selected);
      if (selectedSkus.length === 0) {
        showToast("Please select at least one SKU to generate", "error");
        setLoading(false);
        return;
      }

      const skusToCreate = selectedSkus.map(s => ({
        skuCode: s.skuCode,
        product: product._id,
        brand: product.brandId?._id || product.brandId,
        category: product.categoryId?.name,
        technology: Array.isArray(product.technology) ? product.technology[0] : product.technology,
        capacity: s.capacity,
        wattage: parseFloat(s.capValue) || 0,
        phase: s.phase === '-' ? 'None' : s.phase,
        state: product.stateId?._id || product.stateId,
        cluster: product.clusterId?._id || product.clusterId
      }));

      const generatedSkuCodes = selectedSkus.map(s => s.skuCode);

      // 1. Bulk create/update SKU documents
      await productApi.bulkCreateSkus({ skus: skusToCreate });

      // 2. Update product with all generated SKU strings
      const payload = {
        additionalSkus: [...new Set([...(product.additionalSkus || []), ...generatedSkuCodes])]
      };

      await productApi.update(product._id, payload);

      showToast(`${generatedSkuCodes.length} SKUs generated successfully`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("SKU Gen Error:", error);
      showToast("Failed to generate SKUs", "error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Generate SKU</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[85vh] space-y-6">
          {/* SKU Structure Visualization */}
          <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">SKU Structure</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'CAT', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { label: 'BRAND', color: 'bg-green-100 text-green-700 border-green-200' },
                { label: 'PROD', color: 'bg-red-100 text-red-700 border-red-200' },
                { label: 'TECH', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { label: 'CAP', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                { label: 'STATE', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                { label: 'CLUSTER', color: 'bg-gray-100 text-gray-700 border-gray-200' },
              ].map((box, i) => (
                <div key={i} className={`px-4 py-2 rounded font-bold text-xs border shadow-sm ${box.color}`}>
                  {box.label}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
              CAT: Product Category (3 chars) | BRAND: Brand Code (3 chars) | PROD: Product Code (4 chars) | TECH: Technology Code (4 chars) | CAP: Capacity (4 chars) | STATE: State Code (2 chars) | CLUSTER: Cluster Code (1 char)
            </p>
          </div>

          {/* Product Information */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-700 font-bold text-xs uppercase tracking-wider mb-3">Product Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-gray-400 font-medium mr-2">Brand:</span>
                <span className="text-gray-800 font-bold">{product.brandId?.name || product.brandId?.brand || product.brandId?.companyName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-2">Product Name:</span>
                <span className="text-gray-800 font-bold">{product.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-2">Technology:</span>
                <span className="text-gray-800 font-bold capitalize">{Array.isArray(product.technology) ? product.technology.join(', ') : (product.technology || '-')}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-2">DCR Type:</span>
                <span className="text-gray-800 font-bold">{product.dcr || '-'}</span>
              </div>
            </div>
          </div>

          {/* Phase Selection */}
          <div>
            <h3 className="text-gray-700 font-bold text-xs uppercase tracking-wider mb-3">Phase Selection</h3>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={phases.single}
                  onChange={(e) => setPhases({ ...phases, single: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition">Single Phase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={phases.three}
                  onChange={(e) => setPhases({ ...phases, three: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition">Three Phase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={phases.none}
                  onChange={(e) => setPhases({ ...phases, none: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition">None</span>
              </label>
            </div>
          </div>

          {/* Capacities Section */}
          <div className="space-y-4">
            <h3 className="text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">Available Capacities</h3>
            
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-2 border border-dashed border-gray-200 rounded bg-gray-50/50">
              {capacities.length === 0 ? (
                <span className="text-gray-400 text-xs italic px-2 py-1">N/A</span>
              ) : (
                capacities.map((cap, i) => (
                  <div key={i} className="bg-blue-600 text-white px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-2 shadow-sm">
                    {cap}
                    <X size={14} className="cursor-pointer hover:text-red-200 transition" onClick={() => handleRemoveCapacity(cap)} />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-gray-500 text-xs font-bold">Add New Capacity</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter capacity value"
                  className="flex-1 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-blue-400 transition shadow-inner bg-white"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                />
                <select
                  className="w-24 border border-gray-200 rounded p-2.5 outline-none text-sm text-gray-700 bg-white shadow-sm font-medium"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {availableUnits.length > 0 ? (
                    availableUnits.map(u => (
                      <option key={u._id} value={u.symbol}>{u.symbol}</option>
                    ))
                  ) : (
                    <>
                      <option value="kW">kW</option>
                      <option value="W">W</option>
                      <option value="V">V</option>
                      <option value="Ah">Ah</option>
                    </>
                  )}
                </select>
                <button
                  onClick={handleAddCapacity}
                  className="bg-[#0066cc] hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-bold transition shadow-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* SKU Preview Section */}
          {skuPreview.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-700 font-bold text-xs uppercase tracking-wider">SKU Preview ({skuPreview.filter(s => s.selected).length} selected)</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const allSelected = skuPreview.every(s => s.selected);
                    setSkuPreview(skuPreview.map(s => ({ ...s, selected: !allSelected })));
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  {skuPreview.every(s => s.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-100">
                {skuPreview.map((sku, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm border border-gray-100 hover:border-blue-200 transition">
                    <input 
                      type="checkbox"
                      checked={sku.selected}
                      onChange={() => {
                        const next = [...skuPreview];
                        next[idx].selected = !next[idx].selected;
                        setSkuPreview(next);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-gray-800 break-all">{sku.skuCode}</div>
                      <div className="text-[10px] text-gray-500">{sku.phase} | {sku.capacity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || (capacities.length === 0 && !phases.single && !phases.three && !phases.none)}
            className="px-8 py-2.5 bg-[#0066cc] text-white rounded text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Generate SKUs
          </button>
        </div>

        {/* Toasts */}
        <div className="fixed top-4 right-4 z-[110] space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`p-4 rounded shadow-2xl flex items-center gap-2 text-white animate-in slide-in-from-right duration-300 ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateSkuModal;
