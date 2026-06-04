import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import {
  getStructureTypes,
  createStructureType,
  updateStructureType,
  deleteStructureType
} from '../../../../services/quote/quoteApi';
import toast from 'react-hot-toast';

export default function StructureSetting() {
  const [structureTypes, setStructureTypes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Fetch structure types on mount
  useEffect(() => {
    fetchStructureTypes();
  }, []);

  const fetchStructureTypes = async () => {
    try {
      const data = await getStructureTypes();
      setStructureTypes(data);
    } catch (error) {
      console.error("Error fetching structure types:", error);
      toast.error("Failed to load structure types");
    }
  };

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Add new structure type
  const handleAddStructure = async () => {
    if (inputValue.trim() !== '') {
      try {
        await createStructureType({ name: inputValue.trim() });
        setInputValue('');
        setErrorMessage('');
        fetchStructureTypes();
        toast.success("Structure type added successfully");
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error("Error adding structure type:", error);
        toast.error("Failed to add structure type");
      }
    } else {
      setErrorMessage('⚠️ Please enter a structure type name!');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddStructure();
    }
  };

  // Start editing a structure type
  const startEdit = (type) => {
    setEditingId(type._id);
    setEditValue(type.name);
  };

  // Save edited structure type
  const saveEdit = async () => {
    if (editValue.trim() !== '') {
      try {
        await updateStructureType(editingId, { name: editValue.trim() });
        setEditingId(null);
        setEditValue('');
        fetchStructureTypes();
        toast.success("Structure type updated successfully");
      } catch (error) {
        console.error("Error updating structure type:", error);
        toast.error("Failed to update structure type");
      }
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Delete structure type
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this structure type?")) {
      try {
        await deleteStructureType(id);
        fetchStructureTypes();
        toast.success("Structure type deleted successfully");
        if (editingId === id) {
          setEditingId(null);
        }
      } catch (error) {
        console.error("Error deleting structure type:", error);
        toast.error("Failed to delete structure type");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <div className="inline-flex items-center text-sm font-medium">
                <span className="text-2xl font-bold text-center text-blue-600">Structure Setting</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-blue-600 text-white font-bold text-center py-4 px-6">
            <h2 className="text-xl">Add Structure Type</h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Input Section */}
              <div className="space-y-4">
                <div>
                  <h6 className="font-bold text-blue-600 text-lg mb-2">Structure Type</h6>
                  <div className="space-y-3 mt-2">
                    <div className="flex space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter Structure Type Name"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddStructure}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition duration-200"
                      >
                        <Plus size={20} />
                        <span>Add</span>
                      </button>
                    </div>
                    {errorMessage && (
                      <div className="text-red-600 font-bold text-sm animate-pulse">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Editing (when editing) */}
                {editingId !== null && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <h3 className="font-bold text-yellow-700 mb-2">Editing Structure Type</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-grow px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Edit structure type name"
                      />
                      <button
                        onClick={saveEdit}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition duration-200"
                      >
                        <Save size={20} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition duration-200"
                      >
                        <X size={20} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary */}
              <div>
                <div className="bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-600 text-white font-bold text-center py-3 px-6">
                    <h3 className="text-lg">Structure Type Summary</h3>
                  </div>
                  <div className="p-4 min-h-[200px]">
                    {structureTypes.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500 text-lg italic">
                          No Structure types added yet.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {structureTypes.map((item, index) => (
                          <div
                            key={item._id}
                            className="flex justify-between items-center border-b border-gray-200 py-3 px-2 hover:bg-gray-50 rounded transition duration-150"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-700 font-medium">
                                {index + 1}.
                              </span>
                              <span className="text-gray-800 font-semibold">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEdit(item)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition duration-200"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition duration-200"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                {structureTypes.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {structureTypes.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Types</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {structureTypes.length}
                        </div>
                        <div className="text-sm text-gray-600">Unique Types</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-bold text-blue-700 text-lg mb-2">How to use:</h4>
          <ul className="list-disc pl-5 space-y-1 text-blue-600">
            <li>Enter a structure type name in the input field and click "Add" or press Enter</li>
            <li>Click the edit icon (✏️) to modify an existing structure type</li>
            <li>Click the delete icon (🗑️) to remove a structure type</li>
            <li>All changes are saved to the database immediately</li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Structure Setting Configuration • All changes are saved to the database</p>
      </div>
    </div>
  );
}
