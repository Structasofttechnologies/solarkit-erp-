import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, SolarPanel, ChevronDown,
  Filter, CheckCircle, AlertCircle,
  Search, Clock, MapPin, BarChart3,
  ArrowUp, Settings, Building, Home,
  ListTodo,
  Factory, Package, Battery, Zap
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';
const getAllProjects = async () => ({ success: true, data: [] }); const getProjectStats = async () => ({ success: true, data: { stageCounts: {} } }); const createProject = async () => ({ success: false }); const updateProject = async () => ({ success: false }); const deleteProject = async () => ({ success: false }); const getProjectById = async () => ({ success: false });
import { X, Plus, Edit2, Trash2, Save } from 'lucide-react'; // Added icons for CRUD

import { useLocation } from 'react-router-dom';

export default function AdminProjectManagement() {
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [currentState, setCurrentState] = useState(null);
  const [currentCluster, setCurrentCluster] = useState(null);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [mainContainerVisible, setMainContainerVisible] = useState(false);
  const [selectedStateCard, setSelectedStateCard] = useState(null);
  const location = useLocation();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCP, setSelectedCP] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState([]);

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    category: '',
    projectType: '',
    totalKW: '',
    status: 'Consumer Registered',
    dueDate: '',
    state: '',
    cluster: '',
    district: ''
  });

  const { states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  // For form dependent dropdowns
  const [formClusters, setFormClusters] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);

  useEffect(() => {
    fetchStates();

    // Check for status in URL query params
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
      setMainContainerVisible(true);
      setLocationCardsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Fetch initial stats or overall stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (stateId = null) => {
    try {
      const data = await getProjectStats(stateId);
      if (data && data.success) {
        setStats(data.data);
        console.log("📈 Dashboard stats updated dynamically");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const filters = {
        stateId: currentState?._id,
        clusterId: currentCluster?._id,
        districtId: currentDistrict?._id, // If using district from location hierarchy logic
        // But the bottom filter also has 'selectedDistrict'.
        // Let's use the bottom filter if set, otherwise location hierarchy.
        // Actually, logic: location hierarchy filters the view. Bottom filters refine it.
        // If currentDistrict (location card) is set, we use that.
        // The bottom 'Filter by District' dropdown seems redundant or is for filtering WITHIN a cluster/state if location card hierarchy wasn't granular enough?
        // Let's assume location hierarchy is primary.
        status: selectedStatus,
        cp: selectedCP
      };

      // Add selectedDistrict from filter dropdown if distinct from location hierarchy
      if (selectedDistrict !== 'all') {
        filters.districtId = selectedDistrict; // Overwrite or add?
        // If location card district is selected, it should probably match or be restricted.
        // Let's pass it.
      } else if (currentDistrict) {
        filters.districtId = currentDistrict._id;
      }

      const response = await getAllProjects(filters);
      if (response && response.success) {
        setProjects(response.data);
        console.log("📊 Project data fetched from database");
        if (response.data.length === 0) {
          console.log("⚠️ No project data found in DB");
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  useEffect(() => {
    if (mainContainerVisible) {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState, currentCluster, currentDistrict, selectedStatus, selectedCP, selectedDistrict, mainContainerVisible]);


  // Handle state selection
  const handleStateSelect = (state) => {
    setCurrentState(state);
    setCurrentCluster(null);
    setCurrentDistrict(null);
    setSelectedStateCard(state._id);
    setMainContainerVisible(true);
    fetchClusters(state._id);
    loadStats(state._id); // Update stats for selected state
    // Reset filters
    setSelectedStatus("all");
    setSelectedCP("all");
    setSelectedDistrict("all");
    console.log("✅ Locations loaded dynamically from DB");
  };

  // Handle cluster selection
  const handleClusterSelect = (cluster) => {
    setCurrentCluster(cluster);
    setCurrentDistrict(null);
    fetchDistricts(cluster._id);
    console.log("📍 Clusters fetched from Setup Locations");
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    setCurrentDistrict(district);
    console.log('Location selected:', {
      state: currentState,
      cluster: currentCluster,
      district: district
    });
  };

  // Helper for status badge color
  const getStatusColor = (statusStage, status) => {
    // If statusStage exists, use it. Else fallback to checking text or default.
    // Dynamic data might have 'statusStage' field.
    // Map stages to colors
    const stage = statusStage || '';
    if (stage.includes('consumer') || stage === 'Consumer Registered') return 'bg-green-100 text-green-800';
    if (stage.includes('application') || stage === 'Application Submission') return 'bg-blue-100 text-blue-800';
    if (stage.includes('feasibility') || stage === 'Feasibility Check') return 'bg-yellow-100 text-yellow-800';
    if (stage.includes('work') || stage === 'Work Start') return 'bg-purple-100 text-purple-800';
    if (stage.includes('vendor') || stage === 'Vendor Selection') return 'bg-indigo-100 text-indigo-800';
    if (stage.includes('commission') || stage === 'Commissioning') return 'bg-teal-100 text-teal-800';
    if (stage.includes('meter') || stage === 'Meter Change') return 'bg-orange-100 text-orange-800';
    if (stage.includes('pcr') || stage === 'PCR') return 'bg-pink-100 text-pink-800';

    return 'bg-gray-100 text-gray-800';
  };

  // Status options for filter - could also be dynamic but static list of statuses is okay for filter options usually unless status list is dynamic
  const statusOptions = [
    { value: "all", label: "Show All" },
    { value: "consumer", label: "Consumer Registered" },
    { value: "application", label: "Application Submission" },
    { value: "feasibility", label: "Feasibility Check" },
    { value: "metercharge", label: "Meter Charge" },
    { value: "vendor", label: "Vendor Selection" },
    { value: "work", label: "Work Start" },
    { value: "install", label: "Solar Installation" },
    { value: "pcr", label: "PCR" },
    { value: "commission", label: "Commissioning" },
    { value: "meterchange", label: "Meter Change" },
    { value: "inspection", label: "Meter Inspection" },
    { value: "subsidyreq", label: "Subsidy Request" },
    { value: "subsidydis", label: "Subsidy Disbursal" }
  ];

  // CRUD Handlers
  const handleAddClick = () => {
    setEditingProject(null);
    setFormData({
      projectId: `SP-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate ID logic or input?
      projectName: '',
      category: '',
      projectType: '',
      totalKW: '',
      status: 'Consumer Registered',
      dueDate: '',
      state: '',
      cluster: '',
      district: ''
    });
    setFormClusters([]);
    setFormDistricts([]);
    setIsModalOpen(true);
  };

  const handleEditClick = async (project) => {
    setEditingProject(project);
    // Pre-fill form
    // We might need to fetch clusters/districts for the project's state
    // This is async if we want to show the dropdowns correctly populated

    // Load hierarchies
    // Note: project.state is populated object or ID? API returns populated name... wait.
    // My controller `getProjects` populates `state`, `district`, `cluster` with `name`.
    // But for editing I need IDs to set value of select.
    // I should update controller to return full object or at least ID.
    // The `populate('state', 'name')` returns `{ _id, name }`. So `project.state._id` should work.

    if (project.state?._id) {
      // Logic to fetch clusters for this state requires calling the service/hook
      // But `useLocations` hook updates `clusters` state which is used by the main view.
      // I shouldn't mess with main view `clusters`.
      // I need separate state for Form Clusters/Districts or use a new instance of hook?
      // Or just manually fetch.
      // Let's use `formClusters` state and a separate fetch function if possible, or assume `useLocations` gives us raw fetch functions?
      // `useLocations` returns `fetchClusters`. It updates `clusters` state.
      // If I use it, it will update the main view clusters. That might be okay if the modal overlays it, but it changes the background view context.
      // Ideally I should have separate fetch for form.
      // For now, I'll assume I can just use the provided list if it matches, or I'll need to fetch.
      // Actually, let's just use the `useLocations` approach but it might flicker the background.
      // A better way is to move the form to a separate component with its own `useLocations`?
      // No, `useLocations` is context based? Or just hook?
      // If hook, new instance = new state?
      // `import { useLocations } from '../../../hooks/useLocations';`
      // If it's a custom hook with local state, calling it again gives new state.
      // Let's try that in a sub-component!
    }

    setFormData({
      projectId: project.projectId,
      projectName: project.projectName,
      category: project.category,
      projectType: project.projectType,
      totalKW: project.totalKW,
      status: project.status,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
      state: project.state?._id || '',
      cluster: project.cluster?._id || '',
      district: project.district?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        loadProjects();
        loadStats();
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingProject) {
        await updateProject(editingProject._id, data);
      } else {
        await createProject(data);
      }
      setIsModalOpen(false);
      loadProjects();
      loadStats();
    } catch (error) {
      console.error("Failed to save project", error);
      alert("Failed to save project. Please check again.");
    }
  };

  // Status Logic for Form
  const formStatusOptions = statusOptions.map(o => o.value).filter(v => v !== 'all');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <ProjectForm
              initialData={formData}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            // Pass useLocations to form to have independent state?
            // Or manage form location state here?
            // Let's assume ProjectForm manages its own location state/logic via useLocations
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SolarPanel className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-blue-600">Admin Project Management</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Project
            </button>
            <button
              onClick={() => setLocationCardsVisible(!locationCardsVisible)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              {locationCardsVisible ? (
                <>
                  <EyeOff size={16} />
                  Hide Location Cards
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Show Location Cards
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Section */}
      <div className={`transition-all duration-500 overflow-hidden ${locationCardsVisible ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 m-0 p-0'}`}>
        {/* State Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Select State</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {states.map((state) => (
              <div
                key={state._id}
                className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white rounded-lg p-4 text-center border-[3px] ${selectedStateCard === state._id ? 'border-blue-500 bg-blue-50' : 'border-transparent shadow-sm'
                  }`}
                onClick={() => handleStateSelect(state)}
                style={{ backgroundColor: selectedStateCard === state._id ? '#e0f2fe' : 'white' }}
              >
                <h5 className="font-bold text-lg">{state.name}</h5>
                <p className="text-gray-500 text-sm mt-1">
                  {state.code}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster Selection */}
        {currentState && (
          <div className={`transition-all duration-500 overflow-hidden ${currentState ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 m-0 p-0'}`}>
            <h4 className="text-lg font-semibold mb-4">Select Cluster</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white rounded-lg p-4 text-center border-[3px] ${currentCluster?._id === cluster._id ? 'border-blue-500' : 'border-transparent shadow-sm'
                    }`}
                  onClick={() => handleClusterSelect(cluster)}
                >
                  <h6 className="font-bold">{cluster.name}</h6>
                  <p className="text-gray-500 text-sm mt-1">{currentState.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District Selection */}
        {currentCluster && (
          <div className={`transition-all duration-500 overflow-hidden ${currentCluster ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 m-0 p-0'}`}>
            <h4 className="text-lg font-semibold mb-4">Select District</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {districts.map((district) => (
                <div
                  key={district._id}
                  className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white rounded-lg p-4 text-center border-[3px] ${currentDistrict?._id === district._id ? 'border-blue-500' : 'border-transparent shadow-sm'
                    }`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <h6 className="font-bold">{district.name}</h6>
                  <p className="text-gray-500 text-sm mt-1">{currentCluster.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Container - Only show when state is selected */}
      {
        mainContainerVisible && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h5 className="text-lg font-semibold mb-4">Filter Projects</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                      <option value="all">All Categories</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Type</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                      <option value="all">All Types</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                      <option value="all">All Type</option>
                      <option value="above100kw">Above 100Kw</option>
                      <option value="above200kw">Above 200Kw</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project Type</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                      <option value="all">All Type</option>
                      <option value="On-Grid">On-Grid</option>
                      <option value="Off-Grid">Off-Grid</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-600 text-white rounded-lg shadow-sm p-6 text-center">
                <h5 className="text-lg font-semibold mb-2">Total Projects</h5>
                <h2 className="text-3xl font-bold mb-2">{stats.total}</h2>
                <p className="text-blue-100 flex items-center justify-center gap-1">
                  <ArrowUp size={14} />
                  12% from last month
                </p>
              </div>

              <div className="bg-yellow-600 text-white rounded-lg shadow-sm p-6 text-center">
                <h5 className="text-lg font-semibold mb-2">In Progress</h5>
                <h2 className="text-3xl font-bold mb-2">{stats.inProgress}</h2>
                <p className="text-yellow-100 flex items-center justify-center gap-1">
                  <ListTodo size={14} />
                  25% of projects
                </p>
              </div>

              <div className="bg-green-600 text-white rounded-lg shadow-sm p-6 text-center">
                <h5 className="text-lg font-semibold mb-2">Completed</h5>
                <h2 className="text-3xl font-bold mb-2">{stats.completed}</h2>
                <p className="text-green-100 flex items-center justify-center gap-1">
                  <CheckCircle size={14} />
                  65% completion rate
                </p>
              </div>

              <div className="bg-red-600 text-white rounded-lg shadow-sm p-6 text-center">
                <h5 className="text-lg font-semibold mb-2">Overdue</h5>
                <h2 className="text-3xl font-bold mb-2">{stats.overdue}</h2>
                <p className="text-red-100 flex items-center justify-center gap-1">
                  <AlertCircle size={14} />
                  9% of projects
                </p>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                <h5 className="text-lg font-semibold">Recent Projects</h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Status:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by CP:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCP}
                        onChange={(e) => setSelectedCP(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="all">All CP's</option>
                        <option value="Sunshine Solar Pvt Ltd">Sunshine Solar Pvt Ltd</option>
                        <option value="Vikas Solar Pvt Ltd">Vikas Solar Pvt Ltd</option>
                        <option value="Sun Solar Pvt Ltd">Sun Solar Pvt Ltd</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by District:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="all">All District</option>
                        {/* Populate districts dynamically from useLocations if needed in this filter */}
                        {stateDistricts().map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total kW
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overdue Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.projectId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.projectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.projectType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {project.totalKW} kW
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statusStage, project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(project.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${project.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                          {project.overdueDays} Days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                          <button
                            onClick={() => handleEditClick(project)}
                            className="p-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="p-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          No projects found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {/* Empty state when no state is selected */}
      {
        !mainContainerVisible && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <SolarPanel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a State to View Projects</h3>
            <p className="text-gray-500">Please select a state from the location cards above to view project details and statistics.</p>
          </div>
        )
      }
    </div >
  );

  // Helper function to get districts for the dropdown filter (all districts in current state/cluster context)
  function stateDistricts() {
    return districts; // useLocations already filtered districts based on cluster selection, or loaded all if nothing selected?
    // Actually useLocations `districts` is populated by `fetchDistricts(clusterId)`.
    // So if a cluster is selected, `districts` contains districts of that cluster.
    // If only state is selected, `districts` might be empty initially until `fetchDistricts` is called?
    // The UI flow is State -> Cluster -> District (cards).
    // When state is selected, `fetchClusters` is called. `clusters` populated. `districts` might be empty.
    // When cluster selected, `fetchDistricts` called.

    // The "Filter by District" dropdown at the bottom is usually for "All districts in the view".
    // If only state selected, we might want ALL districts in state?
    // But `useLocations` might not support fetching all districts for a state directly if it's strict hierarchy.
    // Let's rely on what `useLocations` gives us.
  }
}

// Internal Form Component
function ProjectForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData);
  const { states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  useEffect(() => {
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If initialData has state/cluster, fetch dependent data
  useEffect(() => {
    if (initialData.state) fetchClusters(initialData.state);
    if (initialData.cluster) fetchDistricts(initialData.cluster);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Derived statusStage logic
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
