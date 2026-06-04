import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Info, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import {
  getTerraceTypes,
  createTerraceType,
  updateTerraceType,
  deleteTerraceType
} from '../../../../services/quote/quoteApi';
import toast from 'react-hot-toast';

export default function TerraceSetting() {
  const [terraceTypes, setTerraceTypes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Fetch terrace types on mount
  useEffect(() => {
    fetchTerraceTypes();
  }, []);

  const fetchTerraceTypes = async () => {
    setIsFetching(true);
    try {
      const data = await getTerraceTypes();
      // Ensure data is an array
      setTerraceTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching terrace types:", error);
      toast.error("Failed to load terrace types");
    } finally {
      setIsFetching(false);
    }
  };

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const uniqueNames = new Set(terraceTypes.map(t => t.name.toLowerCase().trim()));
    return {
      total: terraceTypes.length,
      unique: uniqueNames.size
    };
  }, [terraceTypes]);

  // Add new terrace type
  const handleAddTerrace = async () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      toast.error("Please enter a terrace type name!");
      return;
    }

    // Duplicate check
    const isDuplicate = terraceTypes.some(
      type => type.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This terrace type already exists!");
      return;
    }

    setIsLoading(true);
    try {
      await createTerraceType({ name: trimmedValue });
      setInputValue('');
      fetchTerraceTypes();
      toast.success("Terrace type added successfully");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Error adding terrace type:", error);
      toast.error(error.response?.data?.message || "Failed to add terrace type");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTerrace();
    }
  };

  // Start editing a terrace type
  const startEdit = (type) => {
    setEditingId(type._id);
    setEditValue(type.name);
  };

  // Save edited terrace type
  const saveEdit = async () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      toast.error("Name cannot be empty!");
      return;
    }

    // Duplicate check (excluding current item)
    const isDuplicate = terraceTypes.some(
      type => type._id !== editingId && type.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This terrace type already exists!");
      return;
    }

    setIsLoading(true);
    try {
      await updateTerraceType(editingId, { name: trimmedValue });
      setEditingId(null);
      setEditValue('');
      fetchTerraceTypes();
      toast.success("Terrace type updated successfully");
    } catch (error) {
      console.error("Error updating terrace type:", error);
      toast.error(error.response?.data?.message || "Failed to update terrace type");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Delete terrace type
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this terrace type? This action cannot be undone.")) {
      setIsLoading(true);
      try {
        await deleteTerraceType(id);
        fetchTerraceTypes();
        toast.success("Terrace type deleted successfully");
        if (editingId === id) {
          setEditingId(null);
        }
      } catch (error) {
        console.error("Error deleting terrace type:", error);
        toast.error("Failed to delete terrace type");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 font-sans">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#3b82f6] px-4">Terrace Setting</h1>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-slate-100">
          {/* Main Blue Header */}
          <div className="bg-[#3b82f6] py-3 px-6">
            <h2 className="text-white text-lg font-bold text-center">Add Terrace Type</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Side: Input Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#3b82f6] mb-3">
                    Terrace Type
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      placeholder="Enter Terrace Type Name"
                      className="flex-grow px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3b82f6] transition-all"
                    />
                    <button
                      onClick={handleAddTerrace}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Visual Placeholder (Matching User's Red Text in Screenshot) */}
                <div className="flex flex-col items-center justify-center pt-8 opacity-60">
                   <p className="text-red-500 text-2xl font-medium">Terrace type can be added from here</p>
                </div>

                {/* Inline Editing Overlay/Section (if editing) */}
                {editingId && (
                  <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200 animate-in slide-in-from-top-2 duration-200">
                    <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
                      <Edit2 size={16} />
                      Modify Record
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-grow px-4 py-2 bg-white border border-amber-300 rounded-lg font-medium text-amber-900 focus:ring-2 focus:ring-amber-200 outline-none"
                      />
                      <button
                        onClick={saveEdit}
                        disabled={isLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Summary Card */}
              <div className="flex flex-col">
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Summary Header */}
                  <div className="bg-[#3b82f6] py-2.5 px-6">
                    <h3 className="text-white text-lg font-bold text-center">Terrace Type Summary</h3>
                  </div>

                  {/* List Section */}
                  <div className="flex-grow min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isFetching ? (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : terraceTypes.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-400 italic">
                        No records found
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {terraceTypes.map((item, index) => (
                          <div key={item._id} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 font-semibold w-6">{index + 1}.</span>
                              <span className="text-slate-700 font-semibold">{item.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(item)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats Footer (Matching screenshot) */}
                  <div className="bg-white border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
                    <div className="py-4 text-center">
                      <div className="text-[#3b82f6] text-xl font-bold">{stats.total}</div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Types</div>
                    </div>
                    <div className="py-4 text-center">
                      <div className="text-[#22c55e] text-xl font-bold">{stats.unique}</div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Unique Types</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* How to Use Box */}
        <div className="mt-8 bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-8">
          <h4 className="text-[#1d4ed8] font-bold text-lg mb-4">How to use:</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-[#3b82f6] font-medium text-sm">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
              Enter a terrace type name in the input field and click "Add" or press Enter
            </li>
            <li className="flex items-center gap-3 text-[#3b82f6] font-medium text-sm">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
              Click the edit icon (<Edit2 size={12} className="inline" />) to modify an existing terrace type
            </li>
            <li className="flex items-center gap-3 text-[#3b82f6] font-medium text-sm">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
              Click the delete icon (<Trash2 size={12} className="inline" />) to remove a terrace type
            </li>
            <li className="flex items-center gap-3 text-[#3b82f6] font-medium text-sm">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
              All changes are saved to the database immediately
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
          Terrace Setting Configuration • All changes are saved to the database
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}} />
    </div>
  );
}
