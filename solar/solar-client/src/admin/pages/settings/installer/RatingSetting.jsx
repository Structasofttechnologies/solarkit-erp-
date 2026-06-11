import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Save, X } from 'lucide-react';
import {
  getInstallerRatings,
  createInstallerRating,
  updateInstallerRating,
  deleteInstallerRating
} from '../../../../services/installer/installerApi';
import toast from 'react-hot-toast';

export default function RatingSetting() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRatingId, setCurrentRatingId] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    maxRating: 5
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await getInstallerRatings();
      setRatings(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, maxRating: data[0].maxRating || 5 }));
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
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
    if (!formData.category) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (isEditing && currentRatingId) {
        await updateInstallerRating(currentRatingId, formData);
        toast.success('Rating category updated successfully');
      } else {
        await createInstallerRating(formData);
        toast.success('Rating category added successfully');
      }
      resetForm();
      fetchRatings();
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Failed to save rating');
    }
  };

  const handleEdit = (rating) => {
    setFormData({
      category: rating.category,
      maxRating: rating.maxRating || 5
    });
    setCurrentRatingId(rating._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        await deleteInstallerRating(id);
        toast.success('Rating deleted successfully');
        fetchRatings();
      } catch (error) {
        console.error('Error deleting rating:', error);
        toast.error('Failed to delete rating');
      }
    }
  };

  const resetForm = () => {
    setFormData(prev => ({ ...prev, category: '' }));
    setIsEditing(false);
    setCurrentRatingId(null);
  };

  return (
    <div className="p-6 bg-[#f5f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title Match */}
        <div>
           <h2 className="text-2xl font-bold text-[#1b254b]">
             Admin Rating Settings
           </h2>
        </div>

        {/* Input Form matching the UI exactly */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Ex. Behavior, Quality, Speed..."
                required
              />
            </div>

            <div className="w-full md:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Rating</label>
              <input
                type="number"
                name="maxRating"
                value={formData.maxRating}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="5"
                required
                min="1"
              />
            </div>

            <div className="w-full md:w-auto flex gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-2 bg-[#0073b7] hover:bg-[#005f98] text-white font-medium rounded transition-colors whitespace-nowrap"
              >
                {isEditing ? 'Update Rating' : 'Add Rating'}
              </button>
            </div>
          </form>
        </div>

        {/* Rating Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#6c757d] px-6 py-3">
            <h3 className="text-white font-medium">Rating Summary</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#74b9ff] text-white">
                <tr>
                  <th className="px-6 py-3 font-medium text-sm w-16">#</th>
                  <th className="px-6 py-3 font-medium text-sm">Category Name</th>
                  <th className="px-6 py-3 font-medium text-sm w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading categories...</td>
                  </tr>
                ) : ratings.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium border-t border-gray-100">
                      No categories added
                    </td>
                  </tr>
                ) : (
                  ratings.map((rating, index) => (
                    <tr key={rating._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{rating.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(rating)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => handleDelete(rating._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 cursor-pointer" />
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
        
        <div className="text-center text-sm font-medium text-gray-600 mt-12 py-6">
          Copyright © 2025 Solarkits. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}