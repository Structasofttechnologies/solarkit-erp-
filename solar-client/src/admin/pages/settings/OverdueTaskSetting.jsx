import React, { useState, useEffect } from 'react';
import { Save, X, Loader, Eye, EyeOff, MapPin, Globe, LayoutGrid, Building2, ChevronRight, Briefcase, Search, CheckCircle2, Clock, Trash2, Plus, Users, ShieldAlert, ArrowDownCircle } from 'lucide-react';
import { fetchOverdueTaskSettings, updateOverdueTaskSettings, fetchAllOverdueTaskSettings, deleteOverdueTaskSettings } from '../../../services/settings/settingsApi';
import { locationAPI, departmentAPI } from '../../../api/api';
import { masterApi } from '../../../api/masterApi';
import toast from 'react-hot-toast';

export default function OverdueTaskSetting() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [allSettings, setAllSettings] = useState([]);
  const [refreshTable, setRefreshTable] = useState(0);

  // Location Hierarchy State
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: [],
    departments: [],
    designations: []
  });

  const [departmentSearch, setDepartmentSearch] = useState('');

  const [selectedLocation, setSelectedLocation] = useState({
    country: ['all'],
    state: ['all'],
    cluster: ['all'],
    district: ['all'],
    departments: ['all'] // 'all' means all departments
  });

  const [showLocationCards, setShowLocationCards] = useState(true);

  const [formData, setFormData] = useState({
    // Today's Tasks
    todayTasksDays: 0,
    todayPriority: 'medium',
    showTodayTasks: true,

    // Pending Tasks
    pendingMinDays: 1,
    pendingMaxDays: 7,
    sendPendingReminders: true,
    reminderFrequency: 'weekly',

    // Overdue Tasks
    overdueDays: 1,
    escalationLevels: [],
    autoPenalty: true,
    penaltyPercentage: 2,
    overdueBenchmark: 70
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialLocations();
    fetchDepartments();
    fetchDesignations(selectedLocation.departments);
  }, [selectedLocation.departments]);

  useEffect(() => {
    if (!isEditModalOpen) {
      loadSettings();
    }
    loadAllSettings();
  }, [selectedLocation.district, selectedLocation.cluster, selectedLocation.state, selectedLocation.country, selectedLocation.departments, refreshTable, isEditModalOpen]);

  const loadAllSettings = async () => {
    try {
      const data = await fetchAllOverdueTaskSettings();
      setAllSettings(data);
    } catch (err) {
      console.error('Failed to load all settings:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      // The API returns { success: true, departments: [...] }
      if (res.data && res.data.departments) {
        setLocationData(prev => ({ ...prev, departments: res.data.departments }));
      } else if (res.data && res.data.data) {
        // Fallback for different API versions
        setLocationData(prev => ({ ...prev, departments: res.data.data }));
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const fetchInitialLocations = async () => {
    try {
      const countryRes = await locationAPI.getAllCountries({ isActive: true });
      if (countryRes.data && countryRes.data.data) {
        setLocationData(prev => ({ ...prev, countries: countryRes.data.data }));
      }
    } catch (error) {
      console.error("Error loading countries:", error);
      toast.error("Failed to load countries");
    }
  };

  const fetchDesignations = async (deptIds) => {
    try {
      const isAllDepts = !deptIds || deptIds.includes('all');
      
      let data = [];
      if (!isAllDepts && deptIds.length > 0) {
        // Fetch specific
        const promises = deptIds.map(id => masterApi.getDesignationsByDepartment(id));
        const results = await Promise.all(promises);
        results.forEach(res => {
          const deptData = Array.isArray(res) ? res : (res.data || []);
          data = [...data, ...deptData];
        });
        // Unique
        data = Array.from(new Map(data.map(item => [item._id, item])).values());
      } else {
        // Fetch all
        const res = await masterApi.getDesignations();
        data = Array.isArray(res) ? res : (res.data || []);
      }
      
      setLocationData(prev => ({ ...prev, designations: data }));
    } catch (error) {
      console.error("Error loading designations:", error);
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
        setLocationData(prev => ({ ...prev, states: [] }));
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
        setLocationData(prev => ({ ...prev, clusters: [] }));
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
        } else if (!selectedLocation.country?.includes('all')) {
          params.countryId = selectedLocation.country.join(',');
        }
        
        const res = await locationAPI.getAllDistricts(params);
        setLocationData(prev => ({ ...prev, districts: res.data?.data || [] }));
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        setLocationData(prev => ({ ...prev, districts: [] }));
      }
    };
    fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state, selectedLocation.country]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLocation.district !== 'all') params.district = selectedLocation.district;
      else if (selectedLocation.cluster !== 'all') params.cluster = selectedLocation.cluster;
      else if (selectedLocation.state !== 'all') params.state = selectedLocation.state;
      if (selectedLocation.country !== 'all') params.country = selectedLocation.country;

      if (selectedLocation.departments?.length > 0 && selectedLocation.departments[0] !== 'all') {
        params.departments = selectedLocation.departments.join(',');
      }

      const data = await fetchOverdueTaskSettings(params);
      setFormData({
        ...data,
        departments: data.departments || [],
        escalationLevels: Array.isArray(data.escalationLevels) ? data.escalationLevels : []
      });
      setInitialData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Prevent save if no department selected
    if (selectedLocation.departments.length === 0) {
      toast.error('Please select at least one department or "All Departments"');
      return;
    }

    // Escalation Level Validations
    const levels = formData.escalationLevels;
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (!level.fromDay && level.fromDay !== 0) {
        toast.error(`Level ${i + 1} must have a start day`);
        return;
      }
      if (level.toDay && parseInt(level.toDay) <= parseInt(level.fromDay)) {
        toast.error(`Level ${i + 1}: End day must be greater than start day`);
        return;
      }
      // Check for overlapping
      if (i > 0) {
        const prevLevel = levels[i-1];
        if (prevLevel.toDay && parseInt(level.fromDay) <= parseInt(prevLevel.toDay)) {
          toast.error(`Level ${i + 1} overlaps with Level ${i}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const getVal = (arr) => {
        if (!arr) return [];
        if (typeof arr === 'string') return arr === 'all' ? [] : [arr];
        return arr.includes('all') ? [] : arr;
      };

      // Strip internal IDs and timestamps from formData before sending to update
      const { _id, createdAt, updatedAt, __v, ...cleanFormData } = formData;

      const payload = {
        ...cleanFormData,
        escalationLevels: (cleanFormData.escalationLevels || []).map(level => ({
          ...level,
          escalateTo: level.escalateTo?._id || level.escalateTo || null
        })),
        countries: getVal(selectedLocation.country),
        states: getVal(selectedLocation.state),
        clusters: getVal(selectedLocation.cluster),
        districts: getVal(selectedLocation.district),
        departments: getVal(selectedLocation.departments)
      };

      const updatedSettings = await updateOverdueTaskSettings(payload);
      setFormData(updatedSettings);
      setInitialData(updatedSettings);
      setRefreshTable(prev => prev + 1);
      toast.success('Task settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFromTable = (setting) => {
    // Populate form data for the modal
    const { countries, states, clusters, districts, departments, ...cleanData } = setting;
    setFormData({
      ...cleanData,
      escalationLevels: Array.isArray(setting.escalationLevels) ? setting.escalationLevels : []
    });

    // Populate the location path so the user knows what they are editing
    setSelectedLocation({
      country: setting.countries?.length > 0 ? setting.countries.map(c => c._id || c) : ['all'],
      state: setting.states?.length > 0 ? setting.states.map(s => s._id || s) : ['all'],
      cluster: setting.clusters?.length > 0 ? setting.clusters.map(cl => cl._id || cl) : ['all'],
      district: setting.districts?.length > 0 ? setting.districts.map(d => d._id || d) : ['all'],
      departments: setting.departments?.length > 0 ? setting.departments.map(d => d._id || d) : ['all']
    });

    setInitialData({ ...cleanData, countries, states, clusters, districts, departments });
    setIsEditModalOpen(true);
    
    // Use a small timeout to ensure state settles and isn't overwritten
    setTimeout(() => {
      setFormData({
        ...cleanData,
        escalationLevels: Array.isArray(setting.escalationLevels) ? [...setting.escalationLevels] : []
      });
    }, 100);

    toast.success('Edit Modal Opened');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await deleteOverdueTaskSettings(id);
      setRefreshTable(prev => prev + 1);
      toast.success('Configuration deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete configuration');
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addEscalationLevel = () => {
    const levels = formData.escalationLevels || [];
    const lastLevel = levels[levels.length - 1];
    const newFromDay = lastLevel ? (parseInt(lastLevel.toDay) || parseInt(lastLevel.fromDay)) + 1 : 1;

    const newLevel = {
      level: levels.length + 1,
      name: `Level ${levels.length + 1}`,
      fromDay: newFromDay,
      toDay: '',
      escalateTo: '',
      penaltyPercentage: 0,
      isActive: true
    };
    setFormData(prev => ({
      ...prev,
      escalationLevels: [...levels, newLevel]
    }));
  };

  const removeEscalationLevel = (index) => {
    const levels = [...formData.escalationLevels];
    levels.splice(index, 1);
    // Re-index levels
    const updatedLevels = levels.map((l, i) => ({ ...l, level: i + 1, name: `Level ${i + 1}` }));
    setFormData(prev => ({ ...prev, escalationLevels: updatedLevels }));
  };

  const updateEscalationLevel = (index, field, value) => {
    const levels = [...formData.escalationLevels];
    levels[index][field] = value;
    setFormData(prev => ({ ...prev, escalationLevels: levels }));
  };


  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
        <button
          onClick={loadSettings}
          className="ml-4 text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const LocationCard = ({ title, subtitle, icon: Icon, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer text-center transition-all duration-300 transform hover:scale-105 ${isSelected
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
      } else if (dim === 'state') {
        updates.cluster = ['all'];
        updates.district = ['all'];
      } else if (dim === 'cluster') {
        updates.district = ['all'];
      }
      
      return { ...prev, ...updates };
    });
  };

  const toggleDepartment = (deptId) => {
    toggleLocation('departments', deptId);
  };

  const uniqueDepts = Array.from(new Map(locationData.departments.map(d => [d.name, d])).values());
  const filteredDepartments = uniqueDepts.filter(d => 
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div>
            <nav className="flex mb-1" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 text-xs text-gray-500">
                <li className="flex items-center">
                  <span>Settings</span>
                  <ChevronRight size={12} className="mx-1" />
                </li>
                <li className="flex items-center">
                  <span>Task Highlighting</span>
                  <ChevronRight size={12} className="mx-1" />
                </li>
                <li className="text-blue-600 font-medium">Overdue Task Setting</li>
              </ol>
            </nav>
            <h2 className="text-2xl font-bold text-gray-800">Overdue Task Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Configure task escalation and penalty rules based on location</p>
          </div>
          <button
            onClick={() => setShowLocationCards(!showLocationCards)}
            className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-100"
          >
            {showLocationCards ? <><EyeOff size={16} className="mr-2" /> Hide Location Selection</> : <><Eye size={16} className="mr-2" /> Show Location Selection</>}
          </button>
        </div>

        {/* Location Hierarchy Cards */}
        {showLocationCards && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Countries */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4">
                <Globe className="text-blue-600 mr-2" size={20} />
                <h4 className="font-bold text-gray-800">Select Country</h4>
                <div className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                  {selectedLocation.country?.includes('all') ? 'Global Target' : `${selectedLocation.country?.length} Countries Selected`}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <LocationCard
                  title="Global"
                  subtitle="All Countries"
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

            {/* States */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4">
                <MapPin className="text-blue-600 mr-2" size={20} />
                <h4 className="font-bold text-gray-800">Select State</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <LocationCard
                  title="All States"
                  subtitle={selectedLocation.country?.includes('all') ? "Global Default" : "Country Default"}
                  icon={MapPin}
                  isSelected={selectedLocation.state?.includes('all')}
                  onClick={() => toggleLocation('state', 'all')}
                />
                {locationData.states.map(s => (
                  <LocationCard
                    key={s._id}
                    title={s.name}
                    subtitle={s.country?.name || s.code || 'STATE'}
                    icon={MapPin}
                    isSelected={selectedLocation.state?.includes(s._id)}
                    onClick={() => toggleLocation('state', s._id)}
                  />
                ))}
              </div>
              {locationData.states.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">No states found.</div>
              )}
            </div>

            {/* Clusters */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4">
                <LayoutGrid className="text-indigo-600 mr-2" size={20} />
                <h4 className="font-bold text-gray-800">Select Cluster</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <LocationCard
                  title="All Clusters"
                  subtitle="Hierarchy Default"
                  icon={LayoutGrid}
                  isSelected={selectedLocation.cluster?.includes('all')}
                  onClick={() => setSelectedLocation(prev => ({ ...prev, cluster: ['all'], district: ['all'] }))}
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
              {locationData.clusters.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">No clusters found.</div>
              )}
            </div>

            {/* Districts */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4">
                <Building2 className="text-purple-600 mr-2" size={20} />
                <h4 className="font-bold text-gray-800">Select District</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <LocationCard
                  title="All Districts"
                  subtitle="Hierarchy Default"
                  icon={Building2}
                  isSelected={selectedLocation.district?.includes('all')}
                  onClick={() => setSelectedLocation(prev => ({ ...prev, district: ['all'] }))}
                />
                {locationData.districts.map(d => (
                  <LocationCard
                    key={d._id}
                    title={d.name}
                    subtitle="District"
                    icon={Building2}
                    isSelected={selectedLocation.district?.includes(d._id)}
                    onClick={() => toggleLocation('district', d._id)}
                  />
                ))}
              </div>
              {locationData.districts.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">No districts found.</div>
              )}
            </div>

            {/* Departments */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center">
                  <Briefcase className="text-orange-600 mr-2" size={20} />
                  <h4 className="font-bold text-gray-800">Select Department(s)</h4>
                  <span className="ml-3 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Multi-Select Enabled</span>
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
                  isSelected={(selectedLocation.departments || []).includes('all')}
                  onClick={() => toggleDepartment('all')}
                />
                {filteredDepartments.map(d => (
                  <LocationCard
                    key={d._id}
                    title={d.name}
                    subtitle="Department"
                    icon={Briefcase}
                    isSelected={(selectedLocation.departments || []).includes(d._id)}
                    onClick={() => toggleDepartment(d._id)}
                  />
                ))}
              </div>
              {filteredDepartments.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">No departments match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`plan-section rounded-2xl border shadow-sm overflow-hidden transition-all duration-500 ${loading ? 'opacity-50 blur-[2px]' : 'opacity-100 blur-0'}`} 
           style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
        <div className="p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-4">
           <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">Configuring Rules</h3>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {!selectedLocation.district?.includes('all') 
                    ? `${selectedLocation.district?.length} Districts`
                    : !selectedLocation.cluster?.includes('all')
                    ? `${selectedLocation.cluster?.length} Clusters`
                    : !selectedLocation.state?.includes('all')
                    ? `${selectedLocation.state?.length} States`
                    : !selectedLocation.country?.includes('all')
                    ? `${selectedLocation.country?.length} Countries`
                    : 'Global'}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                  {(selectedLocation.departments || []).includes('all') 
                    ? 'All Departments' 
                    : selectedLocation.departments?.length === 1 
                    ? locationData.departments.find(d => d._id === selectedLocation.departments[0])?.name
                    : `${selectedLocation.departments?.length || 0} Departments Selected`}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Active Path: {selectedLocation.country?.includes('all') ? 'World' : selectedLocation.country?.map(id => locationData.countries.find(c => c._id === id)?.name).join(', ')} 
                {!selectedLocation.state?.includes('all') && ` > ${selectedLocation.state?.map(id => locationData.states.find(s => s._id === id)?.name).join(', ')}`}
                {!selectedLocation.cluster?.includes('all') && ` > ${selectedLocation.cluster?.map(id => locationData.clusters.find(c => c._id === id)?.name).join(', ')}`}
                {!selectedLocation.district?.includes('all') && ` > ${selectedLocation.district?.map(id => locationData.districts.find(d => d._id === id)?.name).join(', ')}`}
                {' + '}
                {(selectedLocation.departments || []).includes('all') 
                  ? 'General Units' 
                  : selectedLocation.departments?.map(id => locationData.departments.find(d => d._id === id)?.name).join(' & ') || 'None'}
              </p>
           </div>
           <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Authenticated Config</span>
           </div>
        </div>

        <form id="taskSettingsForm" onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Today's Tasks Settings */}
            <div className="col-span-1">
              <div className="card border border-blue-300 rounded-lg overflow-hidden">
                <div className="card-header bg-blue-500 text-white p-4">
                  <h5 className="text-lg font-semibold mb-0">Today's Tasks Definition</h5>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consider tasks due within:
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.todayTasksDays}
                        min="0"
                        onChange={(e) => handleInputChange('todayTasksDays', parseInt(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        days
                      </span>
                    </div>
                    <small className="text-gray-500 text-xs mt-1 block">
                      (0 means only tasks due exactly today)
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Highlighting:
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.todayPriority}
                      onChange={(e) => handleInputChange('todayPriority', e.target.value)}
                    >
                      <option value="high">High Priority (Color: Red)</option>
                      <option value="medium">Medium Priority (Color: Orange)</option>
                      <option value="low">Low Priority (Color: Blue)</option>
                    </select>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="showTodaysTasks"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.showTodayTasks}
                      onChange={(e) => handleInputChange('showTodayTasks', e.target.checked)}
                    />
                    <label htmlFor="showTodaysTasks" className="ml-2 block text-sm text-gray-700">
                      Show in Dashboard
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Tasks Settings */}
            <div className="col-span-1">
              <div className="card border border-yellow-300 rounded-lg overflow-hidden">
                <div className="card-header bg-yellow-400 text-gray-900 p-4">
                  <h5 className="text-lg font-semibold mb-0">Pending Tasks Definition</h5>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum days remaining to be "Pending":
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.pendingMinDays}
                        min="1"
                        onChange={(e) => handleInputChange('pendingMinDays', parseInt(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        days
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum days remaining to be "Pending":
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.pendingMaxDays}
                        min="1"
                        onChange={(e) => handleInputChange('pendingMaxDays', parseInt(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="sendPendingReminders"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.sendPendingReminders}
                      onChange={(e) => handleInputChange('sendPendingReminders', e.target.checked)}
                    />
                    <label htmlFor="sendPendingReminders" className="ml-2 block text-sm text-gray-700">
                      Send Reminder Emails
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Frequency:
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.reminderFrequency}
                      onChange={(e) => handleInputChange('reminderFrequency', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Tasks Settings */}
            <div className="col-span-1">
              <div className="card border border-red-300 rounded-lg overflow-hidden">
                <div className="card-header bg-red-500 text-white p-4">
                  <h5 className="text-lg font-semibold mb-0">Overdue Tasks Definition</h5>
                </div>
                <div className="card-body p-4">
                  {/* Days past deadline */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days past deadline to be "Overdue":
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.overdueDays}
                        min="0"
                        onChange={(e) => handleInputChange('overdueDays', parseInt(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        days
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Escalation Levels */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <ShieldAlert size={16} className="mr-2 text-red-500" />
                        Management Escalation Flow:
                      </label>
                      <button
                        type="button"
                        onClick={addEscalationLevel}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold border border-blue-200"
                      >
                        <Plus size={14} /> Add Level
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(formData.escalationLevels || []).map((level, idx) => (
                        <div key={idx} className={`border rounded-xl p-4 relative transition-all duration-300 ${level.isActive ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{level.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={level.isActive}
                                onChange={(e) => updateEscalationLevel(idx, 'isActive', e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                title="Enable/Disable this level"
                              />
                              <button
                                type="button"
                                onClick={() => removeEscalationLevel(idx)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">From Day</label>
                                <input
                                  type="number"
                                  value={level.fromDay}
                                  onChange={(e) => updateEscalationLevel(idx, 'fromDay', parseInt(e.target.value))}
                                  className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">To Day (Optional)</label>
                                <input
                                  type="number"
                                  placeholder="∞"
                                  value={level.toDay || ''}
                                  onChange={(e) => updateEscalationLevel(idx, 'toDay', e.target.value === '' ? null : parseInt(e.target.value))}
                                  className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                          </div>

{/* 
                          <div className="mb-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Escalate To (Reporting Authority)</label>
                            <div className="relative">
                              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <select
                                value={level.escalateTo?._id || level.escalateTo || ''}
                                onChange={(e) => updateEscalationLevel(idx, 'escalateTo', e.target.value)}
                                className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2 pl-9 appearance-none focus:ring-2 focus:ring-blue-100 bg-white"
                              >
                                <option value="">Select Designation...</option>
                                {locationData.designations.map(d => (
                                  <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
*/}

                          <div className="flex items-center justify-between bg-orange-50 p-2 rounded-lg border border-orange-100">
                             <div className="flex items-center gap-2">
                                <Clock size={14} className="text-orange-500" />
                                <span className="text-[10px] font-bold text-orange-700 uppercase">Penalty</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={level.penaltyPercentage}
                                  onChange={(e) => updateEscalationLevel(idx, 'penaltyPercentage', parseFloat(e.target.value))}
                                  className="w-12 text-center text-xs font-black bg-transparent border-none focus:ring-0 p-0 text-orange-700"
                                />
                                <span className="text-[10px] font-bold text-orange-500">%</span>
                             </div>
                          </div>
                        </div>
                      ))}
                      {(formData.escalationLevels || []).length === 0 && (
                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                          <ShieldAlert size={24} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400 font-medium">No escalation levels defined.<br/>Click "Add Level" to start building your flow.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto penalty switch */}
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="autoPenalty"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.autoPenalty}
                      onChange={(e) => handleInputChange('autoPenalty', e.target.checked)}
                    />
                    <label htmlFor="autoPenalty" className="ml-2 block text-sm text-gray-700">
                      Apply Automatic Penalties
                    </label>
                  </div>

                  {/* Penalty Percentage */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penalty Percentage:
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.penaltyPercentage}
                        min="0"
                        max="10"
                        step="0.5"
                        onChange={(e) => handleInputChange('penaltyPercentage', parseFloat(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Overdue Benchmark Score */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overdue Benchmark Score:
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-grow rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.overdueBenchmark}
                        min="0"
                        max="100"
                        onChange={(e) => handleInputChange('overdueBenchmark', parseInt(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Settings */}
          <div className="mt-6">
            <div className="flex justify-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Task Settings'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Configuration Summary Table */}
        <div className="bg-white border-t border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Configuration Summary</h3>
              <p className="text-xs text-gray-500 mt-1">Review all saved organizational task rules</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              {allSettings.length} Active Rules
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location Hierarchy</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departments</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Range</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overdue Def</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penalty</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allSettings.map((s, idx) => (
                  <tr key={s._id || idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700">
                        {s.countries?.length > 0 ? s.countries.map(c => c.name).join(', ') : 'Global'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {s.states?.length > 0 && ` > ${s.states.map(st => st.name).join(', ')}`}
                        {s.clusters?.length > 0 && ` > ${s.clusters.map(cl => cl.name).join(', ')}`}
                        {s.districts?.length > 0 && ` > ${s.districts.map(dt => dt.name).join(', ')}`}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.departments?.length > 0 ? (
                          s.departments.map(d => (
                            <span key={d._id} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md border border-orange-100 font-medium">
                              {d.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md border border-gray-100 font-medium">All Depts</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        <Clock size={12} className="text-yellow-500" />
                        {s.pendingMinDays} - {s.pendingMaxDays} Days
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {s.escalationLevels?.length > 0 ? (
                          s.escalationLevels.map((l, i) => (
                            <div key={i} className="flex items-center gap-1 text-[10px]">
                              <span className={`px-1.5 py-0.5 rounded ${l.isActive ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'} border border-red-100 font-black whitespace-nowrap`}>
                                L{l.level} ({l.fromDay}{l.toDay ? `-${l.toDay}` : '+'}d)
                              </span>
                              <span className="text-gray-400 truncate max-w-[80px]" title={l.escalateTo?.name}>
                                → {l.escalateTo?.name || 'No Head'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No Flow Defined</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700">
                        {s.autoPenalty ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-blue-600">Global: {s.penaltyPercentage}%</span>
                            {s.escalationLevels?.some(l => l.penaltyPercentage > 0) && (
                              <span className="text-[9px] text-orange-500 bg-orange-50 px-1 rounded border border-orange-100 w-fit">
                                + Level Penalties Active
                              </span>
                            )}
                          </div>
                        ) : 'Disabled'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditFromTable(s)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-bold transition-colors py-1 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(s._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors py-1 px-3 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
                          title="Delete Rule"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allSettings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400 text-sm italic">
                      No configurations saved yet. Select a location and department above to create your first rule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Edit Settings Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800">Edit Overdue Task Settings</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Adjust escalation levels and penalty rules for this location.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto overflow-x-hidden">
               {/* Location Context Display */}
               <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Editing Configuration for:</span>
                    <h3 className="text-sm font-bold text-gray-800">
                       {selectedLocation.country?.includes('all') ? 'Global' : selectedLocation.country?.map(id => locationData.countries.find(c => c._id === id)?.name).join(', ')} 
                       {!selectedLocation.state?.includes('all') && ` > ${selectedLocation.state?.map(id => locationData.states.find(s => s._id === id)?.name).join(', ')}`}
                       {' + '}
                       {(selectedLocation.departments || []).includes('all') 
                         ? 'All Departments' 
                         : selectedLocation.departments?.map(id => locationData.departments.find(d => d._id === id)?.name).join(' & ') || 'None'}
                    </h3>
                  </div>
                  <div className="hidden sm:block">
                     <span className="px-3 py-1 bg-white text-blue-600 border border-blue-200 rounded-full text-xs font-bold shadow-sm">
                       {formData._id ? 'Active Record' : 'Draft'}
                     </span>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Column 1: Definitions */}
                  <div className="space-y-8">
                      {/* Today Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <Clock size={18} className="text-blue-500" />
                           <h4 className="font-black text-gray-700 text-sm uppercase tracking-wide">Today's Definition</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Due Within (Days)</label>
                              <input 
                                type="number" 
                                value={formData.todayTasksDays}
                                onChange={(e) => handleInputChange('todayTasksDays', parseInt(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100" 
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Priority Style</label>
                              <select 
                                value={formData.todayPriority}
                                onChange={(e) => handleInputChange('todayPriority', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="high">Red (High)</option>
                                <option value="medium">Orange (Medium)</option>
                                <option value="low">Blue (Low)</option>
                              </select>
                           </div>
                        </div>
                      </div>

                      {/* Pending Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <Loader size={18} className="text-yellow-500" />
                           <h4 className="font-black text-gray-700 text-sm uppercase tracking-wide">Pending Range</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Min Days</label>
                              <input 
                                type="number" 
                                value={formData.pendingMinDays}
                                onChange={(e) => handleInputChange('pendingMinDays', parseInt(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100" 
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Max Days</label>
                              <input 
                                type="number" 
                                value={formData.pendingMaxDays}
                                onChange={(e) => handleInputChange('pendingMaxDays', parseInt(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100" 
                              />
                           </div>
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                           <input 
                             type="checkbox" 
                             checked={formData.sendPendingReminders}
                             onChange={(e) => handleInputChange('sendPendingReminders', e.target.checked)}
                             className="rounded" 
                           />
                           <label className="text-xs font-bold text-yellow-800">Enable Automated Reminders</label>
                           <select 
                             value={formData.reminderFrequency}
                             onChange={(e) => handleInputChange('reminderFrequency', e.target.value)}
                             className="ml-auto text-[10px] font-black uppercase border-none bg-transparent underline"
                           >
                             <option value="daily">Daily</option>
                             <option value="weekly">Weekly</option>
                           </select>
                        </div>
                      </div>

                      {/* Penalty Section */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                           <ArrowDownCircle size={18} className="text-red-500" />
                           <h4 className="font-black text-gray-700 text-sm uppercase tracking-wide">Penalty & Benchmark</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Each Overdue Penalty</label>
                              <div className="flex items-end gap-2">
                                <input 
                                  type="number" 
                                  value={formData.penaltyPercentage}
                                  onChange={(e) => handleInputChange('penaltyPercentage', parseFloat(e.target.value))}
                                  className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 text-red-700" 
                                />
                                <span className="text-xl font-black text-red-400 mb-1">%</span>
                              </div>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Monthly Benchmark</label>
                              <div className="flex items-end gap-2">
                                <input 
                                  type="number" 
                                  value={formData.overdueBenchmark}
                                  onChange={(e) => handleInputChange('overdueBenchmark', parseInt(e.target.value))}
                                  className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 text-gray-800" 
                                />
                                <span className="text-xl font-black text-gray-400 mb-1">%</span>
                              </div>
                           </div>
                        </div>
                      </div>
                  </div>

                  {/* Column 2: Escalation Hierarchy */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                           <Users size={18} className="text-indigo-500" />
                           <h4 className="font-black text-gray-700 text-sm uppercase tracking-wide">Escalation Flow</h4>
                        </div>
                        <button 
                          onClick={addEscalationLevel}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
                        >
                          <Plus size={14} /> Add Level
                        </button>
                     </div>

                     <div className="space-y-4">
                        {(formData.escalationLevels || []).length === 0 ? (
                           <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                              <Users size={40} className="mx-auto text-gray-200 mb-4" />
                              <p className="text-sm font-bold text-gray-400">No escalation levels defined.</p>
                              <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Define who gets notified when tasks go overdue.</p>
                           </div>
                        ) : (
                          formData.escalationLevels.map((level, idx) => (
                            <div key={idx} className="group relative border border-gray-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 bg-white shadow-sm overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="flex items-center justify-between mb-4">
                                   <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                      {level.name || `Level ${idx + 1}`}
                                   </span>
                                   <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={level.isActive}
                                        onChange={(e) => updateEscalationLevel(idx, 'isActive', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded" 
                                      />
                                      <button 
                                        onClick={() => removeEscalationLevel(idx)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">From Day</label>
                                      <input 
                                        type="number" 
                                        value={level.fromDay}
                                        onChange={(e) => updateEscalationLevel(idx, 'fromDay', parseInt(e.target.value))}
                                        className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100" 
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">To Day (Optional)</label>
                                      <input 
                                        type="number" 
                                        placeholder="∞"
                                        value={level.toDay || ''}
                                        onChange={(e) => updateEscalationLevel(idx, 'toDay', e.target.value === '' ? null : parseInt(e.target.value))}
                                        className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100" 
                                      />
                                   </div>
                                </div>

                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Escalate To (Reporting Authority)</label>
                                   <div className="relative">
                                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                      <select 
                                        value={level.escalateTo?._id || level.escalateTo || ''}
                                        onChange={(e) => updateEscalationLevel(idx, 'escalateTo', e.target.value)}
                                        className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 pl-9 appearance-none focus:ring-2 focus:ring-indigo-100 bg-white"
                                      >
                                        <option value="">Select Designation...</option>
                                        {locationData.designations.map(d => (
                                          <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                      </select>
                                   </div>
                                </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
               <button 
                 onClick={() => setIsEditModalOpen(false)}
                 className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={(e) => {
                    handleSubmit(e);
                    setIsEditModalOpen(false);
                 }}
                 className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
               >
                 <Save size={18} /> Update Task Settings
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
