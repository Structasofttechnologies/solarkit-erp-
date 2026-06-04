import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Settings, Zap, Thermometer, PlusCircle } from 'lucide-react';
import { masterApi } from '../../../../api/masterApi';

const DEFAULT_SECTIONS = [
  {
    id: 'mechanical',
    title: 'Mechanical Parameters',
    icon: <Settings className="text-blue-500" size={20} />,
    rows: [
      { id: 1, name: 'Weight', value: '', unit: 'kg' },
      { id: 2, name: 'Height', value: '', unit: 'mm' },
      { id: 3, name: 'Width', value: '', unit: 'mm' }
    ]
  },
  {
    id: 'electrical',
    title: 'Electrical Parameters',
    icon: <Zap className="text-blue-500" size={20} />,
    rows: [
      { id: 1, name: 'Watt', value: '', unit: 'W' },
      { id: 2, name: 'Voltage', value: '', unit: 'V' },
      { id: 3, name: 'Current', value: '', unit: 'A' }
    ]
  },
  {
    id: 'thermal',
    title: 'Thermal Parameters',
    icon: <Thermometer className="text-blue-500" size={20} />,
    rows: [
      { id: 1, name: 'Temp Operating', value: '', unit: '°C' },
      { id: 2, name: 'Temp Storage', value: '', unit: '°C' }
    ]
  }
];

const AddParameterModal = ({ isOpen, onClose, skuCode, onSave }) => {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && skuCode) {
      fetchParameters();
    }
  }, [isOpen, skuCode]);

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const response = await masterApi.getSkuParameters(skuCode);
      if (response.success && response.data && response.data.length > 0) {
        // Map data back to include icons
        const mappedSections = response.data.map(section => ({
          ...section,
          id: section._id || Date.now() + Math.random(),
          icon: getIconForTitle(section.title),
          rows: section.rows.map(row => ({
            ...row,
            id: row._id || Date.now() + Math.random()
          }))
        }));
        setSections(mappedSections);
      } else {
        // Reset to default sections if no parameters found for this specific SKU
        setSections(DEFAULT_SECTIONS);
      }
    } catch (error) {
      console.error("Error fetching parameters:", error);
      setSections(DEFAULT_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  const getIconForTitle = (title) => {
    if (title.includes('Mechanical')) return <Settings className="text-blue-500" size={20} />;
    if (title.includes('Electrical')) return <Zap className="text-blue-500" size={20} />;
    if (title.includes('Thermal')) return <Thermometer className="text-blue-500" size={20} />;
    return <PlusCircle className="text-blue-500" size={20} />;
  };


  if (!isOpen) return null;

  const addRow = (sectionId) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: [...section.rows, { id: Date.now(), name: '', value: '', unit: '' }]
        };
      }
      return section;
    }));
  };

  const removeRow = (sectionId, rowId) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.filter(row => row.id !== rowId)
        };
      }
      return section;
    }));
  };

  const updateRow = (sectionId, rowId, field, val) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          rows: section.rows.map(row => row.id === rowId ? { ...row, [field]: val } : row)
        };
      }
      return section;
    }));
  };

  const addNewSection = () => {
    const newTitle = prompt("Enter Section Title:");
    if (newTitle) {
      setSections([...sections, {
        id: Date.now().toString(),
        title: newTitle,
        icon: <PlusCircle className="text-blue-500" size={20} />,
        rows: [{ id: Date.now(), name: '', value: '', unit: '' }]
      }]);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-[#0066cc]">Add Parameters</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
              <p className="text-gray-500 font-medium">Loading parameters...</p>
            </div>
          ) : (
            <>
              {/* SKU Display */}
              <div className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200 shadow-sm">
                <label className="text-sm font-bold text-gray-700 min-w-[40px]">SKU:</label>
                <input 
                  type="text" 
                  readOnly 
                  value={skuCode || ''} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm font-mono text-gray-600 focus:outline-none"
                />
              </div>

              {/* Sections */}
              {sections.map((section) => (
                <div key={section.id} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span className="text-[#0066cc] font-bold text-sm tracking-tight">{section.title}</span>
                    </div>
                    <button 
                      onClick={() => addRow(section.id)}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#28a745] border border-[#28a745] px-2 py-0.5 rounded hover:bg-green-50 transition uppercase"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {section.rows.map((row) => (
                      <div key={row.id} className="flex flex-wrap md:flex-nowrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 outline-none"
                          value={row.name}
                          onChange={(e) => updateRow(section.id, row.id, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 outline-none"
                          value={row.value}
                          onChange={(e) => updateRow(section.id, row.id, 'value', e.target.value)}
                        />
                        <select
                          className="w-full md:w-32 border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 outline-none"
                          value={row.unit}
                          onChange={(e) => updateRow(section.id, row.id, 'unit', e.target.value)}
                        >
                          <option value="">Unit</option>
                          <option value="kg">kg</option>
                          <option value="mm">mm</option>
                          <option value="W">W</option>
                          <option value="V">V</option>
                          <option value="A">A</option>
                          <option value="°C">°C</option>
                          <option value="Ah">Ah</option>
                        </select>
                        <button 
                          onClick={() => removeRow(section.id, row.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition border border-red-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Section Button */}
              <button 
                onClick={addNewSection}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#0066cc] text-[#0066cc] bg-white rounded-lg hover:bg-blue-50 transition-all font-bold text-xs"
              >
                <PlusCircle size={16} /> Add New Section
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(sections)}
            className="px-6 py-2 bg-[#0066cc] text-white rounded text-sm font-bold hover:bg-blue-700 transition shadow-sm uppercase tracking-wider"
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddParameterModal;
