import React, { useState, useEffect } from 'react';
import {
  Building2, Home, MapPin, Users, Truck, Package, Globe,
  DollarSign, Wrench, ShoppingBag, Briefcase, Megaphone,
  ClipboardList, CheckCircle, Clock, TrendingUp,
  ChevronRight, Eye, LayoutDashboard,
  Settings as Gear, Box, Layers, FileText, ShoppingCart,
  Compass, Grid3x3, CheckSquare, Target, FolderOpen,
  BarChart3, Award, Shield, Cpu, Zap, Sun,
  Battery, PanelTop, PackageOpen, FileCheck,
  Plus, Trash2, Edit2, X, AlertCircle, Search
} from 'lucide-react';
import * as settingsApi from '../../../services/settings/settingsApi';
import * as locationApi from '../../../services/core/locationApi';
import Select from 'react-select';

export default function ChecklistSetting() {
  // Hierarchical Location Data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [clusters, setClusters] = useState([]);

  // Selections
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [moduleCategories, setModuleCategories] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Management State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'active',
    manualStatus: 'pending',
    items: []
  });
  const [newItemName, setNewItemName] = useState('');

  // Load Initial Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Seed if first time or to ensure structure
        await settingsApi.seedChecklists();

        const fetchedCountries = await locationApi.getCountries();
        setCountries(fetchedCountries || []);

        // We'll fetch checklists and categories when cluster changes or on mount if no clusters selected
        if (selectedClusters.length === 0) {
          const [fetchedChecklists, fetchedCategories] = await Promise.all([
            settingsApi.fetchChecklists(),
            settingsApi.fetchCategories()
          ]);
          setChecklists(fetchedChecklists || []);
          processCategories(fetchedChecklists, [], fetchedCategories);
        }
      } catch (err) {
        setError('Failed to load initial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch regional checklists and completions when clusters change
  useEffect(() => {
    const fetchRegionalData = async () => {
      if (selectedClusters.length > 0) {
        try {
          setLoading(true);
          const clusterIds = selectedClusters.map(c => c._id).join(',');
          const [completions, regionalChecklists, categories] = await Promise.all([
            settingsApi.fetchModuleCompletions(clusterIds),
            settingsApi.fetchChecklists(clusterIds),
            settingsApi.fetchCategories()
          ]);
          setChecklists(regionalChecklists || []);
          processCategories(regionalChecklists, completions, categories);
        } catch (err) {
          console.error('Failed to load regional data', err);
          setError('Failed to load regional data');
        } finally {
          setLoading(false);
        }
      } else {
        // Clear data if no clusters selected
        if (countries.length > 0) {
           const initChecklists = async () => {
             const [fetchedChecklists, fetchedCategories] = await Promise.all([
               settingsApi.fetchChecklists(),
               settingsApi.fetchCategories()
             ]);
             setChecklists(fetchedChecklists || []);
             processCategories(fetchedChecklists, [], fetchedCategories);
           }
           initChecklists();
        }
      }
    };
    fetchRegionalData();
  }, [selectedClusters.map(c => c._id).join(',')]);

  const processCategories = (checklistTemplates, completions = [], categories = []) => {
    const processed = categories.map(cat => {
      // Find modules belonging to this category from checklists
      const catModules = checklistTemplates.filter(cl => cl.category === cat.title);

      const items = catModules.map(m => {
        // Find completions across all selected clusters for this module
        const clusterCompletions = completions.filter(c => c.moduleName === m.name && c.category === m.category);

        // Merge items status: Completed only if completed in all clusters (aggregated view)
        const itemsWithStatus = m.items.map(mi => {
          if (clusterCompletions.length === 0) return { ...mi, completed: false };
          
          const isCompletedInAll = clusterCompletions.every(comp => 
            comp.itemsStatus?.find(is => is.itemName === mi.itemName)?.completed || false
          );
          
          return {
            ...mi,
            completed: isCompletedInAll
          };
        });

        const totalChecklistItems = itemsWithStatus.length;
        const completedChecklistItems = itemsWithStatus.filter(i => i.completed).length;
        const autoCompleted = totalChecklistItems > 0 && totalChecklistItems === completedChecklistItems;

        return {
          id: m._id,
          name: m.name,
          items: itemsWithStatus,
          status: autoCompleted ? 'completed' : 'pending',
          progressPercent: totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0,
          manualStatus: m.manualStatus || 'pending'
        };
      });

      // Calculate category progress based on completed modules (User Request)
      const completedModulesCount = items.filter(i => i.status === 'completed').length;
      const progress = items.length > 0 ? Math.round((completedModulesCount / items.length) * 100) : 0;

      // Map dynamic icon name to Lucide component
      const iconMap = {
        Building2, Home, MapPin, Users, Truck, Package,
        DollarSign, Wrench, ShoppingBag, Briefcase, Megaphone,
        ClipboardList, CheckCircle, Clock, TrendingUp,
        Settings: Gear, Box, Layers, FileText, ShoppingCart,
        Compass, Grid3x3, CheckSquare, Target, FolderOpen,
        BarChart3, Award, Shield, Cpu, Zap, Sun,
        Battery, PanelTop, PackageOpen, FileCheck
      };

      return {
        id: cat._id,
        title: cat.title,
        icon: iconMap[cat.iconName] || ClipboardList,
        iconBg: cat.iconBg || "bg-blue-100 text-blue-600",
        progress: progress,
        modules: catModules.length,
        items: items,
        completedCount: completedModulesCount,
        pendingCount: items.length - completedModulesCount
      };
    });

    setModuleCategories(processed);
  };


  const handleCountrySelect = async (options) => {
    const countriesArr = options ? options.map(o => o.value) : [];
    setSelectedCountries(countriesArr);
    setSelectedStates([]);
    setSelectedClusters([]);
    setSelectedDistricts([]);
    setStates([]);
    setClusters([]);
    setDistricts([]);

    if (countriesArr.length > 0) {
      try {
        const countryIds = countriesArr.map(c => c._id).join(',');
        const fetchedStates = await locationApi.getStates({ countryId: countryIds });
        setStates(fetchedStates || []);
      } catch (err) {
        console.error('Failed to load states', err);
      }
    }
  };

  const handleStateSelect = async (options) => {
    const statesArr = options ? options.map(o => o.value) : [];
    setSelectedStates(statesArr);
    setSelectedClusters([]);
    setSelectedDistricts([]);
    setClusters([]);
    setDistricts([]);

    if (statesArr.length > 0) {
      try {
        const stateIds = statesArr.map(s => s._id).join(',');
        // Swap: First show clusters after state
        const fetchedClusters = await locationApi.getClustersHierarchy(stateIds);
        setClusters(fetchedClusters || []);
      } catch (err) {
        console.error('Failed to load clusters', err);
      }
    }
  };

  const handleClusterSelect = async (options) => {
    const clustersArr = options ? options.map(o => o.value) : [];
    setSelectedClusters(clustersArr);
    setSelectedDistricts([]);
    setDistricts([]);

    if (clustersArr.length > 0) {
      try {
        const clusterIds = clustersArr.map(c => c._id).join(',');
        // Swap: Districts depend on clusters
        const fetchedDistricts = await locationApi.getDistrictsHierarchy(clusterIds);
        setDistricts(fetchedDistricts || []);
      } catch (err) {
        console.error('Failed to load districts', err);
      }
    }
  };

  const handleDistrictSelect = (options) => {
    const districtsArr = options ? options.map(o => o.value) : [];
    setSelectedDistricts(districtsArr);
  };

  // CRUD Operations
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemName: newItemName, required: true, order: prev.items.length }]
    }));
    setNewItemName('');
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleToggleRequired = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, required: !item.required } : item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClusters.length === 0) {
      setError("Please select Country, State, and Clusters first to add a template");
      return;
    }
    if (formData.items.length === 0) {
      setError("Please add at least one item to the checklist");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...formData,
        state: selectedStates[0]?._id,
        district: selectedDistricts[0]?._id,
        cluster: selectedClusters[0]?._id
      };

      if (editingId) {
        await settingsApi.updateChecklist(editingId, payload);
        setSuccess('Checklist updated successfully');
      } else {
        await settingsApi.createChecklist(payload);
        setSuccess('Checklist created successfully');
      }

      resetForm(); // This will close the modal and clear form state

      // Refresh data
      const clusterIds = selectedClusters.map(c => c._id).join(',');
      const [updatedChecklists, updatedCompletions, categories] = await Promise.all([
        settingsApi.fetchChecklists(clusterIds),
        settingsApi.fetchModuleCompletions(clusterIds),
        settingsApi.fetchCategories()
      ]);
      setChecklists(updatedChecklists);
      processCategories(updatedChecklists, updatedCompletions, categories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save checklist');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: moduleCategories.length > 0 ? moduleCategories[0].title : '',
      status: 'active',
      manualStatus: 'pending',
      items: []
    });
    setEditingId(null);
    setShowForm(false);
    setNewItemName('');
  };

  const handleEdit = (cl) => {
    setFormData({
      name: cl.name,
      category: cl.category || 'Location Setting',
      status: cl.status,
      manualStatus: cl.manualStatus || 'pending',
      items: cl.items
    });
    setEditingId(cl._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this checklist?')) return;
    try {
      setLoading(true);
      await settingsApi.deleteChecklist(id);
      setSuccess('Checklist deleted successfully');

      // Refresh regional data
      const clusterIds = selectedClusters.map(c => c._id).join(',');
      const [updatedChecklists, updatedCompletions, categories] = await Promise.all([
        settingsApi.fetchChecklists(clusterIds),
        settingsApi.fetchModuleCompletions(clusterIds),
        settingsApi.fetchCategories()
      ]);
      setChecklists(updatedChecklists);
      processCategories(updatedChecklists, updatedCompletions, categories);
    } catch (err) {
      setError('Failed to delete checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cl) => {
    try {
      const newStatus = cl.status === 'active' ? 'inactive' : 'active';
      await settingsApi.updateChecklist(cl._id, { ...cl, status: newStatus });

      const updatedChecklists = await settingsApi.fetchChecklists();
      setChecklists(updatedChecklists);
      processCategories(updatedChecklists, await settingsApi.fetchModuleCompletions());
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleToggleItemStatus = async (cl, itemName, currentStatus) => {
    if (selectedClusters.length === 0) {
      setError("Please select at least one cluster to record completion");
      return;
    }
    try {
      // Record completion for ALL selected clusters (Aggregated action)
      await Promise.all(selectedClusters.map(async (cluster) => {
        // Find current regional completion for this cluster
        const currentCompletions = await settingsApi.fetchModuleCompletions(cluster._id);
        const regComp = currentCompletions.find(c => c.moduleName === cl.name && c.category === cl.category);

        // Prepare itemsStatus
        let itemsStatus = regComp?.itemsStatus || [];

        // Sync itemsStatus with current template items
        const templateItemNames = cl.items.map(i => i.itemName.trim());
        const syncedItemsStatus = templateItemNames.map(name => {
          const existing = itemsStatus.find(is => is.itemName.trim() === name);
          return existing ? existing : { itemName: name, completed: false };
        });

        const targetName = itemName.trim();
        const updatedItemsStatus = syncedItemsStatus.map(item =>
          item.itemName.trim() === targetName ? { ...item, completed: !currentStatus } : item
        );

        const completedCount = updatedItemsStatus.filter(i => i.completed).length;
        const allCompleted = completedCount === updatedItemsStatus.length;

        return settingsApi.updateModuleCompletion({
          moduleName: cl.name,
          itemsStatus: updatedItemsStatus,
          completed: allCompleted,
          progressPercent: updatedItemsStatus.length > 0 ? Math.round((completedCount / updatedItemsStatus.length) * 100) : 0,
          category: cl.category,
          iconName: cl.iconName,
          clusterId: cluster._id
        });
      }));

      // Refresh regional data
      const clusterIds = selectedClusters.map(c => c._id).join(',');
      const [updatedCompletions, regionalChecklists, categories] = await Promise.all([
        settingsApi.fetchModuleCompletions(clusterIds),
        settingsApi.fetchChecklists(clusterIds),
        settingsApi.fetchCategories()
      ]);
      setChecklists(regionalChecklists);
      processCategories(regionalChecklists, updatedCompletions, categories);
    } catch (err) {
      setError('Failed to update completion status');
      console.error(err);
    }
  };

  // Stats calculation (Regional) - Calculate from processed categories for consistency
  const totalModules = moduleCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedModules = moduleCategories.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'completed').length, 0);
  const pendingModules = totalModules - completedModules;
  const highPriorityModules = moduleCategories.reduce((acc, cat) => acc + cat.items.filter(i => i.manualStatus === 'high-priority').length, 0);
  const completionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const stats = [
    { label: "Total Modules", value: totalModules.toString(), subtext: "In this Region", icon: ClipboardList, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { label: "Completed", value: completedModules.toString(), subtext: `${completionRate}% of regional`, icon: CheckCircle, color: "bg-gradient-to-r from-emerald-500 to-green-600" },
    { label: "Pending", value: pendingModules.toString(), subtext: `${100 - completionRate}% of regional`, icon: Clock, color: "bg-gradient-to-r from-amber-500 to-orange-500" }
  ];


  // Get progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-emerald-500";
    if (percentage >= 80) return "bg-emerald-400";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-gray-400";
  };

  // Get status badge
  const getStatusBadge = (item) => {
    // 1. If all items are completed (100%), always show Fully Completed
    if (item.progressPercent === 100) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
          <CheckCircle className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />
          Fully Completed
        </span>
      );
    }

    // 2. If it's manually flagged as high priority and not 100%, show High Priority
    if (item.manualStatus === "high-priority") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
          <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
          High Priority
        </span>
      );
    }

    // 3. If some items are checked (> 0%) but not all, show In Progress
    if (item.progressPercent > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
          <Clock className="w-4 h-4 mr-1" />
          In Progress
        </span>
      );
    }

    // Default to pending
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-4 h-4 mr-1" />
        Pending
      </span>
    );
  };

  // CSS styles
  const styles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease forwards;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Custom scrollbar for module lists */
    .module-list-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .module-list-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    .module-list-scrollbar::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .module-list-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    /* Gradient borders */
    .gradient-border {
      position: relative;
    }
    
    .gradient-border::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
      border-radius: 8px 8px 0 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .gradient-border:hover::before {
      opacity: 1;
    }
    
    /* Card hover effects */
    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* Progress bar animation */
    .progress-bar-animated {
      transition: width 0.6s ease;
    }
    
    /* State card selection */
    .state-card-selected {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    /* Module item hover */
    .module-item-hover {
      transition: all 0.2s ease;
    }
    
    .module-item-hover:hover {
      padding-left: 1.5rem;
      background-color: #f9fafb;
    }
    
    .module-item-hover.completed:hover {
      background-color: #f0fdf4;
    }
    
    .module-item-hover.pending:hover {
      background-color: #fffbeb;
    }
    
    .react-select-container .react-select__control {
      border-radius: 0.75rem;
      padding: 0.25rem;
      background-color: #f9fafb;
      border-color: #e5e7eb;
    }
    
    .react-select-container .react-select__control--is-focused {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    
    .react-select-container .react-select__multi-value {
      background-color: #eff6ff;
      border-radius: 0.5rem;
      border: 1px border #dbeafe;
    }
    
    .react-select-container .react-select__multi-value__label {
      color: #2563eb;
      font-weight: 600;
    }
    
    .react-select-container .react-select__multi-value__remove:hover {
      background-color: #dbeafe;
      color: #ef4444;
    }

    /* Breadcrumb styles */
    .breadcrumb-item {
      position: relative;
    }
    
    .breadcrumb-item:not(:last-child)::after {
      content: '›';
      margin: 0 0.5rem;
      color: #9ca3af;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Dashboard</a>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-800 font-medium">Module Completion Status</span>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  if (selectedClusters.length === 0) {
                    setError("Please select Country, State, and Clusters first to add a template");
                    return;
                  }
                  setShowForm(true);
                }}
                className={`${selectedClusters.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg`}
              >
                <Plus className="w-4 h-4" />
                Add Checklist Template
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 gradient-border card-hover">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <LayoutDashboard className="w-8 h-8 mr-3 text-blue-600" />
                  Module Completion Dashboard
                </h1>
                <p className="text-gray-600">
                  Track and manage module completion status across different regions and positions
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-sm text-gray-600">{loading ? 'Syncing...' : 'Live'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Create/Edit Template Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
              {/* Modal Error Alert */}
              {error && (
                <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between sticky top-0 z-20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                  <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
              )}
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  {editingId ? 'Edit Checklist Template' : 'Create New Checklist Template'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Checklist Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="e.g., Solar Panel Quality Inspection"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {moduleCategories.map(cat => (
                        <option key={cat.id} value={cat.title}>{cat.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Status</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      value={formData.manualStatus}
                      onChange={(e) => setFormData({ ...formData, manualStatus: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="high-priority">High Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    Checklist Items
                    <span className="text-xs font-normal text-gray-500">({formData.items.length} items added)</span>
                  </label>
                  <div className="space-y-3 mb-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                        <span className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-gray-700">{item.itemName}</span>
                        {item.required && (
                          <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Required</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-500 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Add new task..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Template' : 'Save Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Region Selection Dropdowns */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-200 animate-fadeIn">
          <div className="mb-8 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 ml-4">Select Regional Scope</h2>
            <p className="text-gray-600 ml-4">Choose location hierarchy to view module completion status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Select Countries
              </label>
              <Select
                isMulti
                className="react-select-container"
                classNamePrefix="react-select"
                options={countries.map(c => ({ value: c, label: c.name }))}
                value={selectedCountries.map(c => ({ value: c, label: c.name }))}
                onChange={handleCountrySelect}
                placeholder="Choose Countries..."
              />
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                Select States
              </label>
              <Select
                isMulti
                isDisabled={selectedCountries.length === 0}
                className="react-select-container"
                classNamePrefix="react-select"
                options={states.map(s => ({ value: s, label: s.name }))}
                value={selectedStates.map(s => ({ value: s, label: s.name }))}
                onChange={handleStateSelect}
                placeholder="Choose States..."
              />
            </div>

            {/* Cluster Dropdown (SWAPPED: Now before District) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Select Clusters
              </label>
              <Select
                isMulti
                isDisabled={selectedStates.length === 0}
                className="react-select-container"
                classNamePrefix="react-select"
                options={clusters.map(cl => ({ value: cl, label: cl.name }))}
                value={selectedClusters.map(cl => ({ value: cl, label: cl.name }))}
                onChange={handleClusterSelect}
                placeholder="Choose Clusters..."
              />
            </div>

            {/* District Dropdown (SWAPPED: Now after Cluster) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-emerald-500" />
                Select Districts
              </label>
              <Select
                isMulti
                isDisabled={selectedClusters.length === 0}
                className="react-select-container"
                classNamePrefix="react-select"
                options={districts.map(d => ({ value: d, label: d.name }))}
                value={selectedDistricts.map(d => ({ value: d, label: d.name }))}
                onChange={handleDistrictSelect}
                placeholder="Choose Districts..."
              />
            </div>
          </div>
        </div>

        {/* Progress Summary Section - Show only when clusters are selected */}
        {selectedClusters.length > 0 && (
          <div className="mb-10 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Progress Overview</h2>
              <p className="text-gray-600">Overall completion status across all modules</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className={`rounded-2xl text-white p-6 shadow-lg ${stat.color} card-hover`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90 uppercase tracking-wider mb-3">{stat.label}</p>
                      <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-sm opacity-90">{stat.subtext}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <stat.icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-6 w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full progress-bar-animated"
                      style={{
                        width: stat.label === 'Total Modules' ? '100%' :
                          stat.label === 'Completed' ? `${completionRate}%` : `${100 - completionRate}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Overall Progress</h3>
                  <p className="text-gray-600 mt-1">All modules across all categories</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600">{completionRate}%</span>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full progress-bar-animated"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-3">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Module Categories Section - Show only when clusters are selected */}
        {selectedClusters.length > 0 && (
          <div className="animate-fadeIn">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {[
                { id: 'all', label: `All Modules (${totalModules})`, icon: Grid3x3 },
                { id: 'completed', label: `Completed (${completedModules})`, icon: CheckCircle },
                { id: 'pending', label: `Pending (${pendingModules})`, icon: Clock },
                { id: 'high-priority', label: `High Priority (${highPriorityModules})`, icon: TrendingUp }
              ].map((filter) => {
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 font-semibold transition-all duration-300 ${activeFilter === filter.id
                      ? filter.id === 'high-priority' ? "bg-rose-500 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-50"
                        : filter.id === 'completed' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50"
                          : filter.id === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-200 ring-4 ring-amber-50"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                      }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {moduleCategories
                .filter(cat => {
                  if (activeFilter === 'all') return true;
                  return cat.items.some(item => {
                    if (activeFilter === 'high-priority') return item.manualStatus === 'high-priority';
                    if (activeFilter === 'completed') return item.status === 'completed';
                    if (activeFilter === 'pending') return item.status === 'pending';
                    return false;
                  });
                })
                .map((category, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 card-hover flex flex-col">
                    {/* Category Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800 text-xl">{category.title}</h3>
                            <div className={`w-14 h-14 rounded-2xl ${category.iconBg} flex items-center justify-center shadow-md`}>
                              <category.icon className="w-7 h-7" />
                            </div>
                          </div>
                          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                            <span className="bg-white border border-gray-100 py-1.5 px-3 rounded-full font-medium shadow-sm">
                              {category.completedCount} Completed • {category.pendingCount} Pending
                            </span>
                            <span className="flex items-center bg-blue-50 text-blue-700 py-1.5 px-3 rounded-full font-medium border border-blue-100">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {category.progress}% Complete
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div
                          className={`h-2.5 rounded-full progress-bar-animated transition-all duration-500 ${getProgressColor(category.progress)}`}
                          style={{ width: `${category.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Module List */}
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto module-list-scrollbar flex-grow">
                      {(() => {
                        const filteredItems = category.items.filter(item => {
                          if (activeFilter === 'all') return true;
                          if (activeFilter === 'high-priority') return item.manualStatus === 'high-priority';
                          if (activeFilter === 'completed') return item.status === 'completed';
                          if (activeFilter === 'pending') return item.status === 'pending';
                          return true;
                        });

                        if (filteredItems.length === 0) {
                          return (
                            <div className="p-10 text-center text-gray-400 animate-fadeIn">
                              <Search className="w-10 h-10 mx-auto mb-2 opacity-20 text-gray-500" />
                              <p className="text-sm font-medium">No modules currently in this state</p>
                            </div>
                          );
                        }

                        return filteredItems.map((item, itemIndex) => {
                          const originalCl = checklists.find(c => c._id === item.id);
                          return (
                            <div
                              key={itemIndex}
                              className={`p-5 transition-colors ${item.status === 'completed' ? 'bg-emerald-50/20' : 'bg-white hover:bg-gray-50'}`}
                            >
                              <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-3">
                                      {getStatusBadge(item)}
                                      <span className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {item.progressPercent}% Complete
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEdit(originalCl)}
                                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                      title="Edit Template"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Checklist Items */}
                                <div className="grid grid-cols-1 gap-2.5 ml-1 pt-2">
                                  {item.items.map((checkItem, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleToggleItemStatus(originalCl, checkItem.itemName, checkItem.completed)}
                                      className="flex items-center gap-3 w-full text-left group/item"
                                    >
                                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${checkItem.completed
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'border-gray-300 bg-white group-hover/item:border-blue-400'
                                        }`}>
                                        {checkItem.completed && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                                      </div>
                                      <span className={`text-sm transition-all duration-300 ${checkItem.completed
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-700 font-medium'
                                        }`}>
                                        {checkItem.itemName}
                                        {checkItem.required && <span className="text-rose-500 ml-1.5 font-bold">*</span>}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Category Footer */}
                    <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                        <span>{category.completedCount} Completed • {category.pendingCount} Pending</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${category.progress === 100 ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-amber-500 shadow-sm shadow-amber-200'}`}></div>
                          <span>{category.progress === 100 ? 'Fully Completed' : 'In Progress'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Global Empty State */}
            {moduleCategories.filter(cat => {
              if (activeFilter === 'all') return true;
              return cat.items.some(item => {
                if (activeFilter === 'high-priority') return item.manualStatus === 'high-priority';
                if (activeFilter === 'completed') return item.status === 'completed';
                if (activeFilter === 'pending') return item.status === 'pending';
                return false;
              });
            }).length === 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-20 text-center border border-gray-100 animate-fadeIn">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Grid3x3 className="w-12 h-12 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-3">No Modules in this Filter</h3>
                  <p className="text-gray-500 max-w-sm mx-auto font-medium">
                    There are currently no checklists in the <span className="font-bold text-blue-600">"{activeFilter}"</span> state for this regional scope.
                  </p>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    View All Modules
                  </button>
                </div>
              )}

            {/* Additional Info Dashboard */}
            <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <LayoutDashboard className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Regional Management Center</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Viewing data for <span className="font-bold text-blue-600">{selectedStates.map(s => s.name).join(', ')}</span> / <span className="font-bold text-blue-600">{selectedClusters.map(c => c.name).join(', ')}</span>.
                  Track regional requirements, manage task lists, and ensure quality standards are met across all modules.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Completed", value: completedModules, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Remaining", value: pendingModules, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Categories", value: moduleCategories.length, color: "text-blue-600", bg: "bg-blue-50" }
                  ].map((sum, i) => (
                    <div key={i} className={`${sum.bg} rounded-2xl p-5 border border-white/50 shadow-sm`}>
                      <div className={`text-3xl font-black ${sum.color} mb-1`}>{sum.value}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{sum.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedClusters.length === 0 && (
          <div className="text-center py-24 animate-fadeIn">
            <div className="w-40 h-40 mx-auto mb-10 rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <LayoutDashboard className="w-20 h-20 text-blue-600" />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-6">Select Regional Scope</h3>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Choose your Country, State, District, and Cluster to synchronize regional checklist configurations and track operational progress.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10">
              {[
                { label: "Real-time Monitoring", icon: TrendingUp },
                { label: "Regional Scoping", icon: MapPin },
                { label: "Quality Assurance", icon: Shield }
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
                    <feat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-700">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-gray-500">
          <p>© {new Date().getFullYear()} Solarkits ERP. Precision Operations Platform.</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span>System: {loading ? 'Processing' : 'Active'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}