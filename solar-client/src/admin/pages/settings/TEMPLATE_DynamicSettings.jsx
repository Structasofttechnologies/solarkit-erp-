'use client';

/**
 * TEMPLATE: Dynamic Settings Page
 * 
 * Use this template to create new dynamic settings pages.
 * 
 * Steps:
 * 1. Copy this file and rename it (e.g., DeliveryTypeSetting.jsx)
 * 2. Replace 'ITEM' with your entity name (e.g., 'DeliveryType')
 * 3. Replace 'items' with your data array name
 * 4. Update the API calls (itemAPI)
 * 5. Update form fields as needed
 * 6. Update the icon (currently Globe)
 * 
 * Example:
 * const YourAPI = {
 *   getAll: () => api.get('/your-endpoint'),
 *   create: (data) => api.post('/your-endpoint', data),
 *   update: (id, data) => api.put(`/your-endpoint/${id}`, data),
 *   delete: (id) => api.delete(`/your-endpoint/${id}`),
 * };
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';

// TODO: Import your API here
// import { itemAPI } from '../../../api/api';

export default function DynamicSettingsTemplate() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    // TODO: Add more fields as needed
  });

  // Load data on mount
  useEffect(() => {
    loadItems();
  }, []);

  // TODO: Replace with your API call
  const loadItems = async () => {
    try {
      setLoading(true);
      // const response = await itemAPI.getAll();
      // setItems(response.data.data || []);
      
      // For now, showing empty state
      setItems([]);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace with your API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // await itemAPI.update(editingId, formData);
        setSuccess('Updated successfully');
      } else {
        // await itemAPI.create(formData);
        setSuccess('Created successfully');
      }

      resetForm();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace with your API call
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        setLoading(true);
        // await itemAPI.delete(id);
        setSuccess('Deleted successfully');
        loadItems();
      } catch (err) {
        setError('Failed to delete');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <style jsx>{`
        .rounded-box {
          border-radius: 15px;
          background: #fff;
          box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.08);
        }
        .item-card {
          border-radius: 12px;
          box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
          padding: 16px;
          background: white;
          border-left: 4px solid #3b82f6;
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-box p-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-2xl text-gray-800">Settings Management</h4>
              <p className="text-gray-500 mt-2 text-sm">Manage your items</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-3xl text-blue-500">{items.length}</h3>
              <small className="text-gray-500 text-sm">Total Items</small>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-box p-4 bg-red-50 border border-red-200 flex gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} className="text-red-500" />
            </button>
          </div>
        )}
        {success && (
          <div className="rounded-box p-4 bg-green-50 border border-green-200 flex gap-2">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} className="text-green-500" />
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-box p-6 bg-gray-50 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-lg">
                {editingId ? 'Edit Item' : 'Add New Item'}
              </h5>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 block mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TODO: Add more form fields here */}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={20} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-box p-4 bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add New Item
          </button>
        )}

        {/* Search */}
        {items.length > 0 && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="item-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-bold text-lg text-gray-800">{item.name}</h5>
                    {item.code && <p className="text-sm text-gray-500">Code: {item.code}</p>}
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(item);
                        setEditingId(item._id);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-box p-8 text-center text-gray-500">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No items available</p>
              <p className="text-sm mt-1">Add an item to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
