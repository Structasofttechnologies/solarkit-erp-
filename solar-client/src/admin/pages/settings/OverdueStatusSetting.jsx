// OverdueStatusSetting.jsx
import React, { useState, useEffect } from 'react';
import {
  Save,
  Building2,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader,
  Globe,
  LayoutGrid,
  Search,
  CheckCircle2,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import { locationAPI, departmentAPI } from '../../../api/api';
import { getRoles } from '../../../services/core/masterApi';
import { fetchOverdueStatusSettings, updateOverdueStatusSettings, fetchAllOverdueStatusSettings } from '../../../services/settings/settingsApi';
import toast from 'react-hot-toast';

const OverdueStatusSetting = () => {
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: [],
    departments: [],
    roles: []
  });

  const [selectedLocation, setSelectedLocation] = useState({
    country: ['all'],
    state: ['all'],
    cluster: ['all'],
    district: ['all'],
    departments: ['all'],
    positions: ['all']
  });

  const [departmentSearch, setDepartmentSearch] = useState('');

  const [overdueData, setOverdueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Initial Data
  const [allSettings, setAllSettings] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countryRes, deptRes, roleRes] = await Promise.all([
          locationAPI.getAllCountries({ isActive: true }),
          departmentAPI.getAll(),
          getRoles()
        ]);
        
        const depts = deptRes.data?.departments || deptRes.data?.data || [];
        const roles = roleRes.data || roleRes || [];
        
        setLocationData(prev => ({ 
          ...prev, 
          countries: countryRes.data?.data || [],
          departments: depts,
          roles: roles
        }));
        
        loadAllSettings();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const loadAllSettings = async () => {
    try {
      const data = await fetchAllOverdueStatusSettings();
      setAllSettings(data || []);
    } catch (error) {
      console.error("Failed to load all settings summary", error);
    }
  };

  // Fetch States when Country changes
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const params = { isActive: true };
        if (!selectedLocation.country?.includes('all')) {
          params.countryId = selectedLocation.country.join(',');
        }
        const res = await locationAPI.getAllStates(params);
        setLocationData(prev => ({ ...prev, states: res.data?.data || [] }));
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };
    fetchStates();
  }, [selectedLocation.country]);

  // Fetch Clusters when State changes
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const params = { isActive: true };
        if (!selectedLocation.state?.includes('all')) {
          params.stateId = selectedLocation.state.join(',');
        } else if (!selectedLocation.country?.includes('all')) {
          params.countryId = selectedLocation.country.join(',');
        }
        const res = await locationAPI.getAllClusters(params);
        setLocationData(prev => ({ ...prev, clusters: res.data?.data || [] }));
      } catch (error) {
        console.error('Failed to fetch clusters:', error);
      }
    };
    fetchClusters();
  }, [selectedLocation.state, selectedLocation.country]);

  // Fetch Districts when Cluster changes
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const params = { isActive: true };
        if (!selectedLocation.cluster?.includes('all')) {
          params.clusterId = selectedLocation.cluster.join(',');
        } else if (!selectedLocation.state?.includes('all')) {
          params.stateId = selectedLocation.state.join(',');
        }
        const res = await locationAPI.getAllDistricts(params);
        setLocationData(prev => ({ ...prev, districts: res.data?.data || [] }));
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state]);

  // Load Settings logic
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (!selectedLocation.district?.includes('all')) params.district = selectedLocation.district.join(',');
        else if (!selectedLocation.cluster?.includes('all')) params.cluster = selectedLocation.cluster.join(',');
        else if (!selectedLocation.state?.includes('all')) params.state = selectedLocation.state.join(',');
        if (!selectedLocation.country?.includes('all')) params.country = selectedLocation.country.join(',');

        if (selectedLocation.departments?.length > 0 && !selectedLocation.departments.includes('all')) {
          params.departments = selectedLocation.departments.join(',');
        }
        
        if (selectedLocation.positions?.length > 0 && !selectedLocation.positions.includes('all')) {
          params.positions = selectedLocation.positions.join(',');
        }

        const backendData = await fetchOverdueStatusSettings(params);
        
        // Dynamic Sync Logic: If position is selected, populate from HR Master Optional Tasks
        let finalData = backendData;
        if (selectedLocation.positions.length === 1 && selectedLocation.positions[0] !== 'all') {
          const role = locationData.roles.find(r => r._id === selectedLocation.positions[0]);
          if (role && role.optionalTasks) {
            // Map HR Optional Tasks to Overdue Table Structure
            const optionalTasks = role.optionalTasks.map(taskName => {
               // Check if we already have saved settings for this task in backendData
               const existingModule = backendData.modules?.find(m => m.name === 'Optional Tasks');
               const existingTask = existingModule?.tasks?.find(t => t.name === taskName);
               return {
                  id: existingTask?.id || `opt_${taskName}`,
                  name: taskName,
                  overdueDays: existingTask?.overdueDays || 2,
                  status: existingTask?.status || "Active"
               };
            });

            const optionalModule = {
               id: 'opt_module',
               name: 'Optional Tasks',
               tasks: optionalTasks
            };

            finalData = {
               ...backendData,
               modules: [optionalModule, ...(backendData.modules?.filter(m => m.name !== 'Optional Tasks') || [])]
            };
          }
        }
        
        setOverdueData(finalData);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [selectedLocation, locationData.roles]);

  const LocationCard = ({ title, subtitle, icon: Icon, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer text-center transition-all duration-300 transform hover:scale-105 relative ${isSelected
        ? 'bg-blue-600 border-blue-600 shadow-lg text-white'
        : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md text-gray-800'
        }`}
    >
      <div className={`flex justify-center mb-2 ${isSelected ? 'text-white' : 'text-blue-500'}`}>
        <Icon size={24} />
      </div>
      <div className="font-bold text-sm mb-1 line-clamp-1">{title}</div>
      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{subtitle}</div>
      {isSelected && (
        <div className="absolute top-2 right-2 text-white opacity-80">
          <CheckCircle2 size={14} />
        </div>
      )}
    </div>
  );

  const toggleLocation = (dim, id) => {
    setSelectedLocation(prev => {
      let newVals;
      const current = prev[dim] || [];
      if (id === 'all') {
        newVals = ['all'];
      } else {
        const filtered = current.filter(x => x !== 'all');
        if (filtered.includes(id)) {
          newVals = filtered.filter(x => x !== id);
          if (newVals.length === 0) newVals = ['all'];
        } else {
          newVals = [...filtered, id];
        }
      }

      // Reset children when parent changes
      const updates = { [dim]: newVals };
      if (dim === 'country') { 
        updates.state = ['all'];
        updates.cluster = ['all'];
        updates.district = ['all'];
        updates.departments = ['all'];
        updates.positions = ['all'];
      } else if (dim === 'state') {
        updates.cluster = ['all'];
        updates.district = ['all'];
        updates.departments = ['all'];
        updates.positions = ['all'];
      } else if (dim === 'cluster') {
        updates.district = ['all'];
        updates.departments = ['all'];
        updates.positions = ['all'];
      } else if (dim === 'district') {
        updates.departments = ['all'];
        updates.positions = ['all'];
      } else if (dim === 'departments') {
        updates.positions = ['all'];
      }
      
      return { ...prev, ...updates };
    });
  };

  const uniqueDepts = Array.from(new Map(locationData.departments.map(d => [d.name, d])).values());
  const filteredDepartments = uniqueDepts.filter(d => 
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const filteredRoles = locationData.roles.filter(r => {
    const isDeptMatch = selectedLocation.departments.includes('all') || 
                       selectedLocation.departments.includes(r.department?._id || r.department) ||
                       // Check if any selected department ID matches the role's department name
                       selectedLocation.departments.some(selectedId => {
                          const dept = locationData.departments.find(d => d._id === selectedId);
                          const roleDept = locationData.roles.find(role => role.department?._id === r.department?._id || role.department === r.department)?.department;
                          return dept && (dept.name === (roleDept?.name || roleDept));
                       });
    return isDeptMatch;
  });

  const uniqueRoles = Array.from(new Map(filteredRoles.map(r => [r.name, r])).values());

  const handleOverdueDaysChange = (moduleId, taskId, value) => {
    if (!overdueData) return;

    const updatedModules = overdueData.modules.map(module => {
      if (module.id === moduleId) {
        if (taskId) {
          // Update task overdue days
          const updatedTasks = module.tasks.map(task =>
            task.id === taskId ? { ...task, overdueDays: parseInt(value) || 1 } : task
          );
          return { ...module, tasks: updatedTasks };
        } else {
          // Update module overdue days
          return { ...module, overdueDays: parseInt(value) || 1 };
        }
      }
      return module;
    });

    setOverdueData({ ...overdueData, modules: updatedModules });
  };

  const handleStatusToggle = (moduleId, taskId) => {
    if (!overdueData) return;

    const updatedModules = overdueData.modules.map(module => {
      if (module.id === moduleId) {
        if (taskId) {
          // Toggle task status
          const updatedTasks = module.tasks.map(task =>
            task.id === taskId ? {
              ...task,
              status: task.status === "Active" ? "Inactive" : "Active"
            } : task
          );
          return { ...module, tasks: updatedTasks };
        } else {
          // Toggle module status
          return {
            ...module,
            status: module.status === "Active" ? "Inactive" : "Active"
          };
        }
      }
      return module;
    });

    setOverdueData({ ...overdueData, modules: updatedModules });
  };

  const handleSaveSettings = async () => {
    if (selectedLocation.departments.length === 0) {
      toast.error('Please select a department first');
      return;
    }

    if (!overdueData) {
      alert('No settings to save');
      return;
    }

    setSaving(true);
    try {
      await updateOverdueStatusSettings({
        location: {
           countries: selectedLocation.country.includes('all') ? [] : selectedLocation.country,
           states: selectedLocation.state.includes('all') ? [] : selectedLocation.state,
           clusters: selectedLocation.cluster.includes('all') ? [] : selectedLocation.cluster,
           districts: selectedLocation.district.includes('all') ? [] : selectedLocation.district,
           departments: selectedLocation.departments.includes('all') ? [] : selectedLocation.departments,
           positions: selectedLocation.positions.includes('all') ? [] : selectedLocation.positions
        },
        modules: overdueData.modules
      });
      toast.success(`Settings saved successfully!`);
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <nav className="bg-white p-3 shadow-sm rounded-lg">
          <div className="flex items-center">
            <div className="text-primary w-full">
              <h3 className="mb-0 text-blue-600 font-bold text-xl flex items-center">
                <Building2 className="mr-2" />
                Admin Overdue Status Setting
              </h3>
            </div>
          </div>
        </nav>
      </div>

      <div className="container-fluid mt-6 space-y-6">
        {/* Country */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Globe className="text-blue-600 mr-2" size={20} />
            <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Country</h4>
            <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-blue-200">Selection Hierarchy</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All Countries"
              subtitle="Enterprise Rules"
              icon={Globe}
              isSelected={selectedLocation.country?.includes('all')}
              onClick={() => toggleLocation('country', 'all')}
            />
            {locationData.countries.map(c => (
              <LocationCard
                key={c._id}
                title={c.name}
                subtitle={c.code || 'COUNTRY'}
                icon={Globe}
                isSelected={selectedLocation.country?.includes(c._id)}
                onClick={() => toggleLocation('country', c._id)}
              />
            ))}
          </div>
        </div>

        {/* State */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center mb-4">
            <MapPin className="text-blue-600 mr-2" size={20} />
            <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select State</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All States"
              subtitle="Hierarchy Default"
              icon={MapPin}
              isSelected={selectedLocation.state?.includes('all')}
              onClick={() => toggleLocation('state', 'all')}
            />
            {locationData.states.map(s => (
              <LocationCard
                key={s._id}
                title={s.name}
                subtitle="State"
                icon={MapPin}
                isSelected={selectedLocation.state?.includes(s._id)}
                onClick={() => toggleLocation('state', s._id)}
              />
            ))}
          </div>
        </div>

        {/* Cluster */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center mb-4">
            <LayoutGrid className="text-indigo-600 mr-2" size={20} />
            <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Cluster</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All Clusters"
              subtitle="Hierarchy Default"
              icon={LayoutGrid}
              isSelected={selectedLocation.cluster?.includes('all')}
              onClick={() => toggleLocation('cluster', 'all')}
            />
            {locationData.clusters.map(c => (
              <LocationCard
                key={c._id}
                title={c.name}
                subtitle="Cluster"
                icon={LayoutGrid}
                isSelected={selectedLocation.cluster?.includes(c._id)}
                onClick={() => toggleLocation('cluster', c._id)}
              />
            ))}
          </div>
        </div>

        {/* District */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Building className="text-purple-600 mr-2" size={20} />
            <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select District</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All Districts"
              subtitle="Hierarchy Default"
              icon={Building}
              isSelected={selectedLocation.district?.includes('all')}
              onClick={() => toggleLocation('district', 'all')}
            />
            {locationData.districts.map(d => (
              <LocationCard
                key={d._id}
                title={d.name}
                subtitle="District"
                icon={Building}
                isSelected={selectedLocation.district?.includes(d._id)}
                onClick={() => toggleLocation('district', d._id)}
              />
            ))}
          </div>
        </div>

        {/* Department */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
             <div className="flex items-center">
                <Briefcase className="text-orange-600 mr-2" size={20} />
                <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Department(s)</h4>
             </div>
             <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-48 bg-white"
                />
             </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All Departments"
              subtitle="Enterprise Rules"
              icon={Briefcase}
              isSelected={selectedLocation.departments?.includes('all')}
              onClick={() => toggleLocation('departments', 'all')}
            />
            {filteredDepartments.map(d => (
              <LocationCard
                key={d._id}
                title={d.name}
                subtitle="Department"
                icon={Briefcase}
                isSelected={selectedLocation.departments?.includes(d._id)}
                onClick={() => toggleLocation('departments', d._id)}
              />
            ))}
          </div>
        </div>

        {/* Position */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center mb-4">
             <MapPin className="text-blue-600 mr-2" size={20} />
             <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Position</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <LocationCard
              title="All Positions"
              subtitle="Department Default"
              icon={Briefcase}
              isSelected={selectedLocation.positions?.includes('all')}
              onClick={() => toggleLocation('positions', 'all')}
            />
            {uniqueRoles.map(r => (
              <LocationCard
                key={r._id}
                title={r.name || r.position}
                subtitle={r.department?.name || 'ROLE'}
                icon={Briefcase}
                isSelected={selectedLocation.positions?.includes(r._id)}
                onClick={() => toggleLocation('positions', r._id)}
              />
            ))}
          </div>
          {filteredRoles.length === 0 && !selectedLocation.departments.includes('all') && (
            <div className="text-center py-4 text-gray-400 text-xs italic">No positions found for the selected department(s).</div>
          )}
        </div>
      </div>

      {/* Overdue Settings Table */}
      {loading && (
        <div className="flex justify-center mt-8">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && overdueData && (
        <div className="card mt-8 mb-4 p-6 bg-white rounded-lg shadow-md" id="overdueSettingsContainer">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-blue-600 font-bold text-lg">
              Overdue Status Settings Mapping
            </h4>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
               Active Context: {selectedLocation.country.includes('all') ? 'Global' : 'Regional'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">#</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Module Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Task Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Overdue Days</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody id="overdueSettingsBody">
                {overdueData.modules && overdueData.modules.map((module, moduleIndex) => (
                  <React.Fragment key={module.id}>
                    {/* Module Row */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-4 py-3 align-top" rowSpan={module.tasks.length + 1}>
                        {moduleIndex + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 align-top" rowSpan={module.tasks.length + 1}>
                        <span className="font-bold text-gray-800">{module.name}</span>
                      </td>
                    </tr>

                    {/* Task Rows */}
                    {module.tasks.map((task, taskIndex) => (
                      <tr key={task.id} className="bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{task.name}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <input
                            type="number"
                            className="form-input w-24 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={task.overdueDays}
                            min="1"
                            max="30"
                            onChange={(e) => handleOverdueDaysChange(module.id, task.id, e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleStatusToggle(module.id, task.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${task.status === "Active" ? "bg-green-500" : "bg-gray-300"
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${task.status === "Active" ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                              {task.status === "Active" ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle size={16} className="mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <XCircle size={16} className="mr-1" />
                                  Inactive
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configuration Summary Table */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-24">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Configuration Summary</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">Overview of all active overdue settings across the organization</p>
          </div>
          <button 
             onClick={loadAllSettings}
             className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
             title="Refresh Summary"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left align-middle border-collapse text-sm">
            <thead className="bg-[#f8fafc] text-[#475569]">
              <tr>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider text-center">#</th>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">Hierarchy Level</th>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">Department / Position</th>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider text-center">Modules</th>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider text-center">Tasks</th>
                <th className="p-3 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider text-center">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {allSettings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 italic">No configurations saved yet.</td>
                </tr>
              ) : (
                allSettings.map((s, idx) => {
                  const locationLabels = [
                    ...(s.countries?.map(c => c.name) || []),
                    ...(s.states?.map(st => st.name) || []),
                    ...(s.clusters?.map(cl => cl.name) || []),
                    ...(s.districts?.map(di => di.name) || [])
                  ].filter(Boolean);

                  const roleLabels = [
                     ...(s.departments?.map(d => d.name) || []),
                     ...(s.positions?.map(p => p.name) || [])
                  ].filter(Boolean);

                  const totalTasks = s.modules?.reduce((acc, m) => acc + (m.tasks?.length || 0), 0) || 0;

                  return (
                    <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 border-b border-gray-100 text-gray-500 font-medium text-center">{idx + 1}</td>
                      <td className="p-3 border-b border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {locationLabels.length > 0 ? (
                            locationLabels.map(label => (
                              <span key={label} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
                                {label}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[10px] font-medium italic">Global Default</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {roleLabels.length > 0 ? (
                            roleLabels.map(label => (
                              <span key={label} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 uppercase tracking-tighter">
                                {label}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[10px] font-medium italic">All Depts</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-100 text-center font-bold text-gray-700">
                        {s.modules?.length || 0}
                      </td>
                      <td className="p-3 border-b border-gray-100 text-center font-bold text-[#f57c00]">
                        {totalTasks}
                      </td>
                      <td className="p-3 border-b border-gray-100 text-center text-[10px] text-gray-500 font-medium">
                        {new Date(s.updatedAt).toLocaleDateString()} <br />
                        {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button - Fixed Position */}
      <button
        onClick={handleSaveSettings}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        disabled={saving || !overdueData}
      >
        {saving ? <Loader className="mr-2 animate-spin" size={20} /> : <Save className="mr-2" size={20} />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Custom Styles */}
      <style>{`
        .selected-department,
        .selected-state,
        .selected-city {
          background-color: #6da1ee !important;
          color: white;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .form-input:focus {
          box-shadow: 0 0 0 2px rgba(109, 161, 238, 0.2);
        }
      `}</style>
    </div>
  );
};

export default OverdueStatusSetting;
