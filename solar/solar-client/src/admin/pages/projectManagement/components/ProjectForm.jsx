import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';

export default function ProjectForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData);
  const { states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (initialData.state) fetchClusters(initialData.state);
    if (initialData.cluster) fetchDistricts(initialData.cluster);
  }, [initialData.state, initialData.cluster]);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'state') {
      fetchClusters(value);
      setFormData(prev => ({ ...prev, cluster: '', district: '' }));
    }
    if (name === 'cluster') {
      fetchDistricts(value);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let stage = 'consumer';
    const s = formData.status;
    if (s.includes('Consumer')) stage = 'consumer';
    else if (s.includes('Application')) stage = 'application';
    else if (s.includes('Feasibility')) stage = 'feasibility';
    else if (s.includes('Work')) stage = 'work';
    else if (s.includes('Vendor')) stage = 'vendor';
    else if (s.includes('Commission')) stage = 'commission';
    else if (s.includes('Meter Change')) stage = 'meterchange';
    else if (s.includes('PCR')) stage = 'pcr';

    onSubmit({ ...formData, statusStage: stage });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project ID</label>
          <input
            type="text"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          >
            <option value="">Select Category</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Type</label>
          <select
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          >
            <option value="">Select Type</option>
            <option value="On-Grid">On-Grid</option>
            <option value="Off-Grid">Off-Grid</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total kW</label>
          <input
            type="number"
            name="totalKW"
            value={formData.totalKW}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          >
            <option value="Consumer Registered">Consumer Registered</option>
            <option value="Application Submission">Application Submission</option>
            <option value="Feasibility Check">Feasibility Check</option>
            <option value="Work Start">Work Start</option>
            <option value="Vendor Selection">Vendor Selection</option>
            <option value="Commissioning">Commissioning</option>
            <option value="Meter Change">Meter Change</option>
            <option value="PCR">PCR</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
            >
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cluster</label>
            <select
              name="cluster"
              value={formData.cluster}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
              disabled={!formData.state}
            >
              <option value="">Select Cluster</option>
              {clusters.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
              disabled={!formData.cluster}
            >
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={16} />
          Save Project
        </button>
      </div>
    </form>
  );
}
