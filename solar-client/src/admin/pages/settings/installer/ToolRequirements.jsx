import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import {
  getInstallerTools,
  createInstallerTool,
  updateInstallerTool,
  deleteInstallerTool
} from '../../../../services/installer/installerApi';
import { productApi } from '../../../../api/productApi';
import api from '../../../../api/api';
import toast from 'react-hot-toast';

export default function ToolRequirements() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentToolId, setCurrentToolId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);

  const [formData, setFormData] = useState({
    toolName: '',
    projectCategory: '',
    subCategory: '',
    projectType: '',
    subType: ''
  });

  useEffect(() => {
    fetchFilters();
    fetchTools();
  }, []);

  const fetchFilters = async () => {
    try {
      const [catRes, subPTypeRes] = await Promise.all([
        productApi.getCategories().catch(() => ({ data: { data: [] } })),
        productApi.getSubProjectTypes().catch(() => ({ data: { data: [] } }))
      ]);
      setCategories(catRes.data?.data || []);
      setSubTypes(subPTypeRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchProjectTypes = async (categoryId) => {
    if (!categoryId) {
      setProjectTypes([]);
      return;
    }
    try {
      const res = await productApi.getProjectCategoryMappings({ categoryId }).catch(() => ({ data: { success: true, data: [] } }));
      if (res.data?.success) {
        const mappings = res.data.data;
        // Extract unique ranges like "1 to 3 kW"
        const uniqueRanges = [...new Set(mappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`))];
        setProjectTypes(uniqueRanges.map(r => ({ _id: r, name: r })));
      }
    } catch (error) {
      setProjectTypes([]);
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      const params = {};
      if (formData.projectCategory) params.projectCategory = formData.projectCategory;
      if (formData.subCategory) params.subCategory = formData.subCategory;
      if (formData.projectType) params.projectType = formData.projectType;
      if (formData.subType) params.subType = formData.subType;
      
      const data = await getInstallerTools(params);
      setTools(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch tools when filters change
  useEffect(() => {
    fetchTools();
  }, [formData.projectCategory, formData.subCategory, formData.projectType, formData.subType]);

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'projectCategory') {
      try {
        const res = await productApi.getSubCategories({ categoryId: value }).catch(() => ({ data: { data: [] } }));
        setSubCategories(res.data?.data || []);
      } catch (error) {
        setSubCategories([]);
      }
      setFormData(prev => ({ ...prev, subCategory: '', projectType: '', subType: '' }));
      fetchProjectTypes(value);
    }

    if (name === 'projectType') {
      setFormData(prev => ({ ...prev, subType: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.toolName.trim()) {
      toast.error('Tool Name is required');
      return;
    }
    if (!formData.projectCategory || !formData.projectType) {
       toast.error('Please select Project Category and Project Type before adding a tool.');
       return;
    }

    const payload = { ...formData };
    if (!payload.subCategory) delete payload.subCategory;
    if (!payload.subType) delete payload.subType;

    try {
      if (isEditing && currentToolId) {
        await updateInstallerTool(currentToolId, payload);
        toast.success('Tool updated successfully');
      } else {
        await createInstallerTool(payload);
        toast.success('Tool added successfully');
      }
      resetForm();
      fetchTools();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error('Failed to save tool');
    }
  };

  const handleEdit = (tool) => {
    // When editing, we need to ensure project types for that category are loaded
    const catId = tool.projectCategory?._id || tool.projectCategory || '';
    if (catId) fetchProjectTypes(catId);

    setFormData({
      toolName: tool.toolName || '',
      projectCategory: catId,
      subCategory: tool.subCategory?._id || tool.subCategory || '',
      projectType: tool.projectType || '',
      subType: tool.subType?._id || tool.subType || ''
    });
    setCurrentToolId(tool._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData(prev => ({ ...prev, toolName: '' })); // Only reset tool name, keep filters
    setIsEditing(false);
    setCurrentToolId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteInstallerTool(id);
        toast.success('Tool deleted successfully');
        fetchTools();
      } catch (error) {
        console.error('Error deleting tool:', error);
        toast.error('Failed to delete tool');
      }
    }
  };

  return (
    <div className="p-6 bg-[#f5f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div>
           <h2 className="text-2xl font-bold text-[#1b254b]">
             Installer Tool Requirements
           </h2>
        </div>

        {/* Project Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0073b7] px-6 py-3 flex justify-between items-center">
            <h3 className="text-white font-medium">Project Filters</h3>
            <button 
              onClick={() => {
                setFormData({
                  toolName: '',
                  projectCategory: '',
                  subCategory: '',
                  projectType: '',
                  subType: ''
                });
                setSubCategories([]);
                setProjectTypes([]);
              }}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              name="projectCategory"
              value={formData.projectCategory}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-100 rounded-md text-gray-600 outline-none focus:border-blue-300 transition-colors bg-white shadow-sm"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-100 rounded-md text-gray-600 outline-none focus:border-blue-300 transition-colors bg-white shadow-sm"
            >
              <option value="">Select Sub Category</option>
              {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-100 rounded-md text-gray-600 outline-none focus:border-blue-300 transition-colors bg-white shadow-sm"
            >
              <option value="">Project Type</option>
              {projectTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <select
              name="subType"
              value={formData.subType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-100 rounded-md text-gray-600 outline-none focus:border-blue-300 transition-colors bg-white shadow-sm"
            >
              <option value="">Select Sub type</option>
              {subTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Add Tool Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#28a745] px-6 py-3">
            <h3 className="text-white font-medium">Add Tool (Project-Wise)</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tool Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="toolName"
                    value={formData.toolName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-blue-100 bg-blue-50/10 rounded-md text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                    placeholder="Enter tool name"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-full md:w-32 px-6 py-2 bg-[#0073b7] hover:bg-[#005f98] text-white font-bold rounded shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                  >
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tool Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#343a40] px-6 py-3">
            <h3 className="text-white font-medium">Tool Summary</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#74b9ff] text-white">
                <tr>
                  <th className="px-6 py-3 font-medium text-sm w-16">#</th>
                  <th className="px-6 py-3 font-medium text-sm">Category</th>
                  <th className="px-6 py-3 font-medium text-sm">Project Type</th>
                  <th className="px-6 py-3 font-medium text-sm">Tool Name</th>
                  <th className="px-6 py-3 font-medium text-sm w-32 border-l border-white/20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading tools...</td>
                  </tr>
                ) : tools.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-700 font-medium">
                      No Rows Added Here
                    </td>
                   </tr>
                ) : (
                  tools.map((tool, index) => (
                    <tr key={tool._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{tool.projectCategory?.name || 'N/A'}</span>
                          {tool.subCategory?.name && <span className="text-[11px] text-gray-500">{tool.subCategory.name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-green-700">{tool.projectType || 'N/A'}</span>
                          {tool.subType?.name && <span className="text-[11px] text-gray-500">{tool.subType.name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{tool.toolName}</td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(tool)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool._id)}
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