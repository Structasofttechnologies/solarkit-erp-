import React, { useState, useEffect } from 'react';
import { Search, Save, Edit2, Trash2, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import { masterApi } from '../../../../api/masterApi';
import { getSubCategories, getSubProjectTypes } from '../../../../services/settings/orderProcurementSettingApi';

const AddProjectCategory = () => {
  // Tabs & Geofencing
  const [countries, setCountries] = useState([]);
  const [activeCountryId, setActiveCountryId] = useState(null);
  const [states, setStates] = useState([]);
  const [activeStateId, setActiveStateId] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [isClusterDropdownOpen, setIsClusterDropdownOpen] = useState(false);

  // Data Mappings
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);

  // Data Mappings
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState([]);

  // Form
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    projectTypeFrom: '',
    projectTypeTo: '',
    subProjectTypeId: '',
    clusterIds: [],
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const toggleClusterSelection = (clusterId) => {
    setFormData(prev => {
      const isSelected = prev.clusterIds.includes(clusterId);
      return {
        ...prev,
        clusterIds: isSelected
          ? prev.clusterIds.filter(id => id !== clusterId)
          : [...prev.clusterIds, clusterId]
      };
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isClusterDropdownOpen && !event.target.closest('.cluster-dropdown')) {
        setIsClusterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClusterDropdownOpen]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [countryRes, catRes, subCatRes, subPTypeRes] = await Promise.all([
        masterApi.getCountries(),
        productApi.getCategories(),
        getSubCategories(),
        getSubProjectTypes()
      ]);

      const fetchedCountries = countryRes?.data || countryRes || [];
      setCountries(fetchedCountries);

      if (fetchedCountries.length > 0) {
        setActiveCountryId(fetchedCountries[0]._id);
      }

      setCategories(catRes?.data?.data || catRes?.data || []);

      const subCatData = subCatRes?.data || [];
      setSubCategories(subCatData);

      const subPData = subPTypeRes?.data || [];
      setSubProjectTypes(subPData);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch initial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCountryId) {
      fetchStates(activeCountryId);
    }
  }, [activeCountryId]);

  const fetchStates = async (countryId) => {
    try {
      const res = await masterApi.getStates({ countryId });
      const fetchedStates = res?.data || res || [];
      setStates(fetchedStates);

      if (fetchedStates.length > 0) {
        setActiveStateId(fetchedStates[0]._id);
      } else {
        setActiveStateId(null);
        setClusters([]);
        setMappings([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeStateId) {
      fetchClusters(activeStateId);
      fetchMappings(activeStateId);
    }
  }, [activeStateId]);

  const fetchClusters = async (stateId) => {
    try {
      const res = await masterApi.getClusters({ stateId });
      setClusters(res?.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMappings = async (stateId) => {
    try {
      setLoading(true);
      const res = await productApi.getProjectCategoryMappings({ stateId });
      if (res.data.success) {
        setMappings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    // If editing a grouped item, populate its full original details and all clusters
    setEditingId(item.mappingIds ? item.mappingIds[0] : item._id); // We just need one arbitrary valid ID if doing single updates later, but bulk edits might need rethinking if user changes from 3 clusters to 1
    // Actually, editing a grouped row is tricky because we'd need to delete the ones removed and add the ones added, or just let them edit a single row. 
    // Given the nature of grouping, the safest approach for the "Edit" form is to let them edit the single mapping they click, OR update the whole group.
    // The previous implementation used a single `editingId`.
    setFormData({
      categoryId: item.categoryId?._id || '',
      subCategoryId: item.subCategoryId?._id || '',
      projectTypeFrom: item.projectTypeFrom || '',
      projectTypeTo: item.projectTypeTo || '',
      subProjectTypeId: item.subProjectTypeId?._id || '',
      clusterIds: item.clusters ? item.clusters.map(c => c._id) : (item.clusterId ? [item.clusterId._id] : [])
    });
  };

  const handleDelete = async (itemsToDelete) => {
    if (window.confirm("Are you sure you want to delete this configuration across all its clusters?")) {
      try {
        const ids = Array.isArray(itemsToDelete) ? itemsToDelete : [itemsToDelete];
        await Promise.all(ids.map(id => productApi.deleteProjectCategoryMapping(id)));
        showToast("Mapping(s) deleted");
        fetchMappings(activeStateId);
      } catch (err) {
        showToast("Failed to delete", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeStateId) {
      showToast("Please select a state first", "error");
      return;
    }

    const { categoryId, subCategoryId, projectTypeFrom, projectTypeTo, clusterIds } = formData;
    if (!categoryId || !subCategoryId || projectTypeFrom === '' || projectTypeTo === '' || clusterIds.length === 0) {
      showToast("Category, Sub Category, Ranges, and at least one Cluster are required fields.", "error");
      return;
    }

    const payload = {
      ...formData,
      stateId: activeStateId
    };

    try {
      if (editingId) {
        // If they edit the group, what happens? They might have removed clusters, added clusters, or changed bounds.
        // Easiest robust approach for a grouped edit: Delete original group docs and re-insert the new payload.
        // Wait, `editingId` only held one ID previously. Let's find all mapping IDs in this group.
        const originalGroup = groupedMappings.find(g => g.mappingIds && g.mappingIds.includes(editingId));
        if (originalGroup && originalGroup.mappingIds) {
          await Promise.all(originalGroup.mappingIds.map(id => productApi.deleteProjectCategoryMapping(id)));
        } else {
          await productApi.deleteProjectCategoryMapping(editingId);
        }
        await productApi.createProjectCategoryMapping(payload);
        showToast("Mapping(s) Updated");
      } else {
        await productApi.createProjectCategoryMapping(payload);
        showToast("Mapping(s) Created");
      }
      // Reset form
      setEditingId(null);
      setFormData({ categoryId: '', subCategoryId: '', projectTypeFrom: '', projectTypeTo: '', subProjectTypeId: '', clusterIds: [] });
      fetchMappings(activeStateId);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to save mapping", "error");
    }
  };

  const activeStateName = states.find(s => s._id === activeStateId)?.name || 'UNKNOWN';

  // Group identical configurations but pool their cluster IDs and names
  const groupedMappings = Object.values(mappings.reduce((acc, curr) => {
    const key = `${curr.stateId?._id}-${curr.categoryId?._id}-${curr.subCategoryId?._id}-${curr.subProjectTypeId?._id || 'none'}-${curr.projectTypeFrom}-${curr.projectTypeTo}`;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        mappingIds: [curr._id], // Track all original document IDs for bulk delete/edit if needed later
        clusters: curr.clusterId ? [curr.clusterId] : []
      };
    } else {
      if (curr.clusterId && !acc[key].clusters.find(c => c._id === curr.clusterId._id)) {
        acc[key].clusters.push(curr.clusterId);
        acc[key].mappingIds.push(curr._id);
      }
    }
    return acc;
  }, {}));

  const filteredList = groupedMappings.filter(m =>
    m.categoryId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subCategoryId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-lg shadow-lg flex items-center gap-2 text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-blue-600 mb-6 uppercase">
        Add Project Category - {activeStateName}
      </h2>

      {/* Country Selection Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {countries.map((country) => (
          <button
            key={country._id}
            onClick={() => setActiveCountryId(country._id)}
            className={`min-w-[200px] h-24 flex flex-col justify-center items-center border rounded-lg transition-all duration-200 ${activeCountryId === country._id
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-blue-400 text-gray-700 hover:border-blue-600'
              }`}
          >
            <span className="font-bold uppercase tracking-wider">{country.name}</span>
            <span className="text-sm mt-1">{country.shortName || country.name.substring(0, 2).toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* State Tabs */}
      {states.length > 0 && (
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 border-t pt-4 border-gray-100">
          {states.map((state) => (
            <button
              key={state._id}
              onClick={() => setActiveStateId(state._id)}
              className={`min-w-[200px] h-24 flex flex-col justify-center items-center border rounded-lg transition-all duration-200 ${activeStateId === state._id
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'bg-white border-green-400 text-gray-700 hover:border-green-600'
                }`}
            >
              <span className="font-bold uppercase tracking-wider">{state.name}</span>
              <span className="text-sm mt-1">{state.code || state.name.substring(0, 2).toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Constraints Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select className="w-full border rounded p-2 focus:border-blue-500"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Category</label>
            <select className="w-full border rounded p-2 focus:border-blue-500"
              value={formData.subCategoryId}
              onChange={e => setFormData({ ...formData, subCategoryId: e.target.value })}
              disabled={!formData.categoryId}
            >
              <option value="">Sub Category</option>
              {subCategories
                .filter(c => (c.categoryId?._id || c.category?._id || c.categoryId || c.category) === formData.categoryId)
                .map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Project Type From (kW)</label>
            <input type="number" className="w-full border rounded p-2 focus:border-blue-500" placeholder="e.g. 1.0"
              value={formData.projectTypeFrom} onChange={e => setFormData({ ...formData, projectTypeFrom: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Project Type To (kW)</label>
            <input type="number" className="w-full border rounded p-2 focus:border-blue-500" placeholder="e.g. 10.0"
              value={formData.projectTypeTo} onChange={e => setFormData({ ...formData, projectTypeTo: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Project Type</label>
            <select className="w-full border rounded p-2 focus:border-blue-500"
              value={formData.subProjectTypeId} onChange={e => setFormData({ ...formData, subProjectTypeId: e.target.value })}>
              <option value="">Sub Project Type</option>
              {subProjectTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="cluster-dropdown relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Clusters</label>
            <div
              className={`w-full border rounded p-2 min-h-[42px] max-h-[42px] bg-white cursor-pointer flex gap-1 items-center overflow-x-auto focus-within:border-blue-500`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onClick={() => setIsClusterDropdownOpen(!isClusterDropdownOpen)}
            >
              <style dangerouslySetInnerHTML={{ __html: `\n                  .cluster-dropdown > div::-webkit-scrollbar {\n                    display: none;\n                  }\n                ` }} />
              {formData.clusterIds.length === 0 ? (
                <span className="text-gray-500 text-[15px]">Please Select</span>
              ) : (
                formData.clusterIds.map(id => {
                  const cluster = clusters.find(c => c._id === id);
                  return cluster ? (
                    <span key={id} className="bg-blue-100 text-blue-800 text-[11px] px-2 py-1 rounded flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                      {cluster.name}
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); toggleClusterSelection(id); }} />
                    </span>
                  ) : null;
                })
              )}
            </div>

            {/* Dropdown Menu */}
            {isClusterDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {clusters.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No clusters available for this state</div>
                ) : (
                  clusters.map(c => (
                    <label key={c._id} className="flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        checked={formData.clusterIds.includes(c._id)}
                        onChange={() => toggleClusterSelection(c._id)}
                      />
                      <span className="text-sm text-gray-700">{c.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-start">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            {editingId ? 'Update Project Category' : 'Add Project Category'}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setFormData({ categoryId: '', subCategoryId: '', projectTypeFrom: '', projectTypeTo: '', subProjectTypeId: '', clusterIds: [] }); }}
              className="ml-4 bg-gray-400 text-white font-semibold py-2 px-6 rounded hover:bg-gray-500 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Project Type List</h3>
        </div>

        <div className="p-4 flex gap-4 bg-gray-50 border-b">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full border rounded p-2 pl-10 focus:border-blue-500"
              placeholder="Search table..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 min-w-[40px] flex items-center justify-center">
            <Search size={20} />
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-300 text-white">
                  <th className="p-3 border text-sm font-semibold rounded-tl-lg">State</th>
                  <th className="p-3 border text-sm font-semibold">Category</th>
                  <th className="p-3 border text-sm font-semibold">Sub Category</th>
                  <th className="p-3 border text-sm font-semibold">Project Type</th>
                  <th className="p-3 border text-sm font-semibold">Sub Project Type</th>
                  <th className="p-3 border text-sm font-semibold">Cluster</th>
                  <th className="p-3 border text-sm font-semibold">Status</th>
                  <th className="p-3 border text-sm font-semibold rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 border">No Data Found</td>
                  </tr>
                ) : (
                  filteredList.map((m, i) => (
                    <tr key={m._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border text-xs">{m.stateId?.name}</td>
                      <td className="p-3 border font-medium text-xs">{m.categoryId?.name}</td>
                      <td className="p-3 border text-xs text-blue-600">{m.subCategoryId?.name}</td>
                      <td className="p-3 border text-xs font-semibold text-green-700 whitespace-nowrap">
                        {m.projectTypeFrom} to {m.projectTypeTo} kW
                      </td>
                      <td className="p-3 border text-xs">{m.subProjectTypeId?.name || '-'}</td>
                      <td className="p-3 border text-xs leading-relaxed">
                        {m.clusters ? m.clusters.map(c => c.name).join(', ') : m.clusterId?.name}
                      </td>
                      <td className="p-3 border text-xs">
                        <span className={`px-2 py-1 rounded-full ${m.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {m.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 border text-center flex justify-center gap-2">
                        <button onClick={() => handleEdit(m)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(m.mappingIds || m._id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProjectCategory;