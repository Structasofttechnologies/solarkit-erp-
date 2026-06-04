import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Building, X } from 'lucide-react';
import {
  getBuildingTypes,
  createBuildingType,
  updateBuildingType,
  deleteBuildingType
} from '../../../../services/quote/quoteApi';
import toast from 'react-hot-toast';

export default function BuildingSetting() {
  const [buildings, setBuildings] = useState([]);

  // Add Form State
  const [buildingType, setBuildingType] = useState('');
  const [floorLimit, setFloorLimit] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBuildingType, setEditBuildingType] = useState('');
  const [editFloorLimit, setEditFloorLimit] = useState('');

  // Fetch building types on mount
  useEffect(() => {
    fetchBuildingTypes();
  }, []);

  const fetchBuildingTypes = async () => {
    try {
      const data = await getBuildingTypes();
      setBuildings(data);
    } catch (error) {
      console.error("Error fetching building types:", error);
      toast.error("Failed to load building types");
    }
  };

  // Add building
  const handleAddBuilding = async () => {
    if (!buildingType.trim()) {
      alert("Please enter a building type");
      return;
    }

    const payload = {
      name: buildingType.trim(),
      floorLimit: floorLimit ? parseInt(floorLimit) : null
    };

    try {
      await createBuildingType(payload);
      setBuildingType('');
      setFloorLimit('');
      fetchBuildingTypes();
      toast.success("Building type added successfully");
    } catch (error) {
      console.error("Error adding building type:", error);
      toast.error("Failed to add building type");
    }
  };

  // Open Edit Modal
  const openEditModal = (building) => {
    setEditId(building._id);
    setEditBuildingType(building.name);
    setEditFloorLimit(building.floorLimit || '');
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditId(null);
    setEditBuildingType('');
    setEditFloorLimit('');
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editBuildingType.trim()) {
      alert("Please enter a building type");
      return;
    }

    try {
      await updateBuildingType(editId, {
        name: editBuildingType.trim(),
        floorLimit: editFloorLimit ? parseInt(editFloorLimit) : null
      });
      fetchBuildingTypes();
      closeEditModal();
      toast.success("Building type updated successfully");
    } catch (error) {
      console.error("Error updating building type:", error);
      toast.error("Failed to update building type");
    }
  };

  // Delete building
  const handleDeleteBuilding = async (id) => {
    if (window.confirm("Are you sure you want to delete this building type?")) {
      try {
        await deleteBuildingType(id);
        fetchBuildingTypes();
        toast.success("Building type deleted successfully");
      } catch (error) {
        console.error("Error deleting building type:", error);
        toast.error("Failed to delete building type");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        <Building className="inline mr-2" size={24} />
        Building Settings
      </h3>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Add New Building Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building Type
            </label>
            <input
              type="text"
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Tenement, Flat, Villa"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Limit (Optional)
            </label>
            <input
              type="number"
              value={floorLimit}
              onChange={(e) => setFloorLimit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              min="1"
              placeholder="Enter floor limit"
            />
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleAddBuilding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Building
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gray-800 text-white px-6 py-4">
          <h5 className="text-lg font-semibold text-white">Building Summary</h5>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border border-gray-300 text-gray-700 font-medium text-center">#</th>
                  <th className="py-3 px-4 border border-gray-300 text-gray-700 font-medium text-center">Building Type</th>
                  <th className="py-3 px-4 border border-gray-300 text-gray-700 font-medium text-center">Floor Limit</th>
                  <th className="py-3 px-4 border border-gray-300 text-gray-700 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-4 border border-gray-300 text-center text-gray-500">
                      No building types added yet. Add your first building type above.
                    </td>
                  </tr>
                ) : (
                  buildings.map((building, index) => (
                    <tr key={building._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 border border-gray-300 text-center">{index + 1}</td>
                      <td className="py-3 px-4 border border-gray-300 text-center font-medium">{building.name}</td>
                      <td className="py-3 px-4 border border-gray-300 text-center">{building.floorLimit || "N/A"}</td>
                      <td className="py-3 px-4 border border-gray-300 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(building)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 flex items-center"
                          >
                            <Edit2 size={14} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBuilding(building._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Edit Building Type</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Type
                </label>
                <input
                  type="text"
                  value={editBuildingType}
                  onChange={(e) => setEditBuildingType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Limit (Optional)
                </label>
                <input
                  type="number"
                  value={editFloorLimit}
                  onChange={(e) => setEditFloorLimit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Leave empty for no limit"
                  min="1"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
