'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { projectAPI, masterAPI } from '../../../api/api';
import { productApi } from '../../../api/productApi';
import {
  Briefcase,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Eye,
  X,
  Globe,
  Tag,
  Layers,
  Filter
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';

export default function ProjectReport() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  // Location Hierarchy Hook
  const { 
    countries, 
    states, 
    clusters, 
    districts,
    fetchStates, 
    fetchClusters, 
    fetchDistricts 
  } = useLocations('reports');

  // Location State
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // Master Data State
  const [masterData, setMasterData] = useState({
    categories: [],
    subCategories: [],
    projectTypeRanges: [], // Extracted from mappings
    subProjectTypes: []
  });

  // Filter State
  const [filters, setFilters] = useState({
    categoryId: 'all',
    subCategoryId: 'all',
    projectTypeRange: 'all',
    subProjectTypeId: 'all',
    status: 'Show All',
    cpType: 'All CP\'s'
  });

  // Load Master Data on Mount
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cats, mappings, subTypes] = await Promise.all([
          masterAPI.getAllCategories(),
          productApi.getProjectCategoryMappings(),
          masterAPI.getAllSubProjectTypes()
        ]);

        const catList = Array.isArray(cats.data) ? cats.data : (Array.isArray(cats.data?.data) ? cats.data.data : []);
        const mappingList = Array.isArray(mappings.data) ? mappings.data : (Array.isArray(mappings.data?.data) ? mappings.data.data : []);
        const subTypeList = Array.isArray(subTypes.data) ? subTypes.data : (Array.isArray(subTypes.data?.data) ? subTypes.data.data : []);

        // Extract Unique kW Ranges for "Project Type"
        const uniqueRanges = [];
        const seen = new Set();
        mappingList.forEach(m => {
          const rangeLabel = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
          if (!seen.has(rangeLabel)) {
            uniqueRanges.push({ id: rangeLabel, label: rangeLabel });
            seen.add(rangeLabel);
          }
        });

        setMasterData(prev => ({
          ...prev,
          categories: catList,
          projectTypeRanges: uniqueRanges,
          subProjectTypes: subTypeList
        }));
      } catch (err) {
        console.error('Failed to load master data', err);
      }
    };
    loadMasters();
  }, []);

  // Fetch Sub-Categories when Category changes
  useEffect(() => {
    const loadSubCats = async () => {
      if (filters.categoryId !== 'all') {
        try {
          const res = await masterAPI.getAllSubCategories({ categoryId: filters.categoryId });
          setMasterData(prev => ({
            ...prev,
            subCategories: Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
          }));
        } catch (err) {
          console.error(err);
        }
      } else {
        setMasterData(prev => ({ ...prev, subCategories: [] }));
        setFilters(prev => ({ ...prev, subCategoryId: 'all' }));
      }
    };
    loadSubCats();
  }, [filters.categoryId]);

  // Handle Country Selection
  const handleCountryToggle = (id) => {
    if (selectedCountry === id) {
      setSelectedCountry('all');
      setSelectedState('all');
      setSelectedCluster('all');
      setSelectedDistrict('all');
    } else {
      setSelectedCountry(id);
      setSelectedState('all');
      setSelectedCluster('all');
      setSelectedDistrict('all');
      if (id !== 'all') fetchStates({ countryId: id });
    }
  };

  // Handle State Selection
  const handleStateToggle = (id) => {
    if (selectedState === id) {
      setSelectedState('all');
      setSelectedCluster('all');
      setSelectedDistrict('all');
    } else {
      setSelectedState(id);
      setSelectedCluster('all');
      setSelectedDistrict('all');
      if (id !== 'all') fetchClusters({ stateId: id });
    }
  };

  // Handle Cluster Selection
  const handleClusterToggle = (id) => {
    if (selectedCluster === id) {
      setSelectedCluster('all');
      setSelectedDistrict('all');
    } else {
      setSelectedCluster(id);
      setSelectedDistrict('all');
      if (id !== 'all') fetchDistricts({ clusterId: id });
    }
  };

  // Handle District Selection
  const handleDistrictToggle = (id) => {
    setSelectedDistrict(selectedDistrict === id ? 'all' : id);
  };

  // Load Projects based on ALL filters
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const params = {
          country: selectedCountry !== 'all' ? selectedCountry : undefined,
          state: selectedState !== 'all' ? selectedState : undefined,
          cluster: selectedCluster !== 'all' ? selectedCluster : undefined,
          district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
          category: filters.categoryId !== 'all' ? filters.categoryId : undefined,
          subCategory: filters.subCategoryId !== 'all' ? filters.subCategoryId : undefined,
          projectTypeRange: filters.projectTypeRange !== 'all' ? filters.projectTypeRange : undefined,
          subProjectType: filters.subProjectTypeId !== 'all' ? filters.subProjectTypeId : undefined,
        };
        const res = await projectAPI.getAll(params);
        setProjects(Array.isArray(res.data) ? res.data : (res.data?.projects || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict, filters]);

  const stats = useMemo(() => {
    if (!projects.length) return { total: 128, inProgress: 32, completed: 84, overdue: 12 };
    
    return {
      total: projects.length,
      inProgress: projects.filter(p => ['in-progress', 'active'].includes(p.status?.toLowerCase())).length,
      completed: projects.filter(p => p.status?.toLowerCase() === 'completed').length,
      overdue: projects.filter(p => p.taskStatusTag === 'overdue').length,
      pending: projects.filter(p => p.taskStatusTag === 'pending').length
    };
  }, [projects]);

  const mockProjects = [
    { 
      projectId: '#SP-1025', 
      name: 'Rajkot Residential Complex', 
      category: { name: 'Solar Rooftop' }, 
      projectType: { name: '15 to 50 kW' }, 
      totalKw: 25, 
      status: 'Consumer Registered', 
      dueDate: '2025-08-15', 
      overdueDays: 0 
    },
    { 
      projectId: '#SP-1026', 
      name: 'Ahmedabad Mall Installation', 
      category: { name: 'Solar light' }, 
      projectType: { name: '3 to 30 kW' }, 
      totalKw: 100, 
      status: 'Application Submission', 
      dueDate: '2025-09-30', 
      overdueDays: 7 
    },
    { 
      projectId: '#SP-1027', 
      name: 'Jamnagar Agricultural Pump', 
      category: { name: 'Solar pump' }, 
      projectType: { name: '2 to 20 kW' }, 
      totalKw: 10, 
      status: 'Feasibility Check', 
      dueDate: '2025-07-20', 
      overdueDays: 2 
    },
    { 
      projectId: '#SP-1028', 
      name: 'Porbandar Solar Farm', 
      category: { name: 'Solar Rooftop' }, 
      projectType: { name: '15 to 50 kW' }, 
      totalKw: 500, 
      status: 'Work Start', 
      dueDate: '2025-12-15', 
      overdueDays: 0 
    },
    { 
      projectId: '#SP-1029', 
      name: 'Dwarka Office Building', 
      category: { name: 'Solar Rooftop' }, 
      projectType: { name: '15 to 50 kW' }, 
      totalKw: 50, 
      status: 'Vendor Selection', 
      dueDate: '2025-10-10', 
      overdueDays: 12 
    },
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;

  const SelectionCard = ({ id, name, subtext, isSelected, onClick }) => (
    <div 
      onClick={() => onClick(id)}
      className={`p-4 rounded-lg text-center cursor-pointer transition-all border-b-4 ${isSelected ? 'bg-[#dbeafe] border-[#3b82f6] shadow-md' : 'bg-white border-transparent hover:shadow-md'}`}
    >
      <div className={`font-bold ${isSelected ? 'text-[#1e40af]' : 'text-gray-700'}`}>{name}</div>
      <div className="text-xs text-gray-400 mt-1 uppercase">{subtext}</div>
    </div>
  );

  return (
    <div className="bg-[#f0f4f9] min-h-screen font-sans">
      {/* Page Header */}
      <div className="bg-white px-8 py-4 border-b border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1e293b]">Admin Project Management</h1>
        <button className="text-[#0ea5e9] text-xs font-medium flex items-center gap-1 mt-1">
          <Eye size={14} /> Hide Location Cards
        </button>
      </div>

      <div className="p-8 space-y-8 pb-20">
        
        {/* Dynamic Location Cards Sequence */}
        <section className="space-y-6">
          {/* Countries */}
          <div>
            <div className="flex items-center gap-2 mb-4"><Globe className="text-blue-500" size={18} /><h3 className="text-sm font-bold text-[#1e293b] uppercase">Select Country</h3></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <SelectionCard id="all" name="All Countries" subtext="Global" isSelected={selectedCountry === 'all'} onClick={handleCountryToggle} />
              {countries.map(c => <SelectionCard key={c._id} id={c._id} name={c.name} subtext={c.code || 'IN'} isSelected={selectedCountry === c._id} onClick={handleCountryToggle} />)}
            </div>
          </div>

          {/* States */}
          {selectedCountry !== 'all' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-4"><MapPin className="text-blue-500" size={18} /><h3 className="text-sm font-bold text-[#1e293b] uppercase">Select State</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <SelectionCard id="all" name="All States" subtext="Regional" isSelected={selectedState === 'all'} onClick={handleStateToggle} />
                {states.map(s => <SelectionCard key={s._id} id={s._id} name={`${s.name} ${s.count !== undefined ? `(${s.count})` : ''}`} subtext={s.code || 'ST'} isSelected={selectedState === s._id} onClick={handleStateToggle} />)}
              </div>
            </div>
          )}

          {/* Clusters */}
          {selectedState !== 'all' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-4"><ClipboardList className="text-blue-500" size={18} /><h3 className="text-sm font-bold text-[#1e293b] uppercase">Select Cluster</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <SelectionCard id="all" name="All Clusters" subtext="Zonal" isSelected={selectedCluster === 'all'} onClick={handleClusterToggle} />
                {clusters.map(cl => <SelectionCard key={cl._id} id={cl._id} name={`${cl.name} ${cl.count !== undefined ? `(${cl.count})` : ''}`} subtext={cl.code || 'CL'} isSelected={selectedCluster === cl._id} onClick={handleClusterToggle} />)}
              </div>
            </div>
          )}

          {/* Districts */}
          {selectedCluster !== 'all' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-4"><MapPin className="text-blue-500" size={18} /><h3 className="text-sm font-bold text-[#1e293b] uppercase">Select District</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <SelectionCard id="all" name="All Districts" subtext="Local" isSelected={selectedDistrict === 'all'} onClick={handleDistrictToggle} />
                {districts.map(d => <SelectionCard key={d._id} id={d._id} name={`${d.name} ${d.count !== undefined ? `(${d.count})` : ''}`} subtext={d.code || 'DT'} isSelected={selectedDistrict === d._id} onClick={handleDistrictToggle} />)}
              </div>
            </div>
          )}
        </section>

        {/* Master Filters (Dropdowns) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
          <div className="absolute -top-3 right-6 bg-[#0f172a] text-white px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
            <Clock size={12} /> Break Time
          </div>
          <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Filter size={16} className="text-blue-500" /> Filter Projects
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  value={filters.categoryId}
                  onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, subCategoryId: 'all' }))}
                >
                  <option value="all">All Categories</option>
                  {masterData.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Sub Category Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sub Category Type</label>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  disabled={filters.categoryId === 'all'}
                  value={filters.subCategoryId}
                  onChange={(e) => setFilters(prev => ({ ...prev, subCategoryId: e.target.value }))}
                >
                  <option value="all">All Types</option>
                  {masterData.subCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Project Type Range Dropdown (Extract from Listings) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Type</label>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  value={filters.projectTypeRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, projectTypeRange: e.target.value }))}
                >
                  <option value="all">All Type</option>
                  {masterData.projectTypeRanges.map(ptr => <option key={ptr.id} value={ptr.id}>{ptr.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Sub Project Type Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sub Project Type</label>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-gray-200 rounded-lg py-2.5 pl-3 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  value={filters.subProjectTypeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, subProjectTypeId: e.target.value }))}
                >
                  <option value="all">All Type</option>
                  {masterData.subProjectTypes.map(spt => <option key={spt._id} value={spt._id}>{spt.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0284c7] text-white p-6 rounded-xl shadow-lg border-b-8 border-[#0369a1] relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h4 className="text-sm font-bold opacity-90 uppercase tracking-widest">Total Projects</h4>
              <div className="text-5xl font-extrabold my-2">{stats.total}</div>
              <div className="flex items-center justify-center gap-1 text-sm font-medium"><TrendingUp size={16} /> 12% from last month</div>
            </div>
          </div>

          <div className="bg-[#facc15] text-[#854d0e] p-6 rounded-xl shadow-lg border-b-8 border-[#ca8a04] relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest">In Progress</h4>
              <div className="text-5xl font-extrabold my-2">{stats.inProgress}</div>
              <div className="flex items-center justify-center gap-1 text-sm font-medium"><BarChart3 size={16} /> 25% of projects</div>
            </div>
          </div>

          <div className="bg-[#22c55e] text-white p-6 rounded-xl shadow-lg border-b-8 border-[#15803d] relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h4 className="text-sm font-bold opacity-90 uppercase tracking-widest">Completed</h4>
              <div className="text-5xl font-extrabold my-2">{stats.completed}</div>
              <div className="flex items-center justify-center gap-1 text-sm font-medium"><CheckCircle2 size={16} /> 65% completion rate</div>
            </div>
          </div>

          <div className="bg-[#ef4444] text-white p-6 rounded-xl shadow-lg border-b-8 border-[#b91c1c] relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h4 className="text-sm font-bold opacity-90 uppercase tracking-widest">Overdue</h4>
              <div className="text-5xl font-extrabold my-2">{stats.overdue}</div>
              <div className="flex items-center justify-center gap-1 text-sm font-medium"><AlertCircle size={16} /> 9% of projects</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-700">Recent Projects</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Filter by Status :</label><div className="relative"><select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"><option>Show All</option></select><ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Filter by CP :</label><div className="relative"><select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"><option>All CP's</option></select><ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Filter by District :</label><div className="relative"><select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"><option>All District</option></select><ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-blue-50">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#93c5fd] text-white">
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Project ID</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Project Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Project Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Total kW</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Due Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap">Overdue Days</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayProjects.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-4 text-xs font-bold text-gray-400">{row.projectId || '#SP-1001'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.name}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.category?.name || 'N/A'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.projectType?.name || 'N/A'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.totalKw || '0'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600 text-blue-500">{row.status}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-4 text-xs font-bold">
                      {row.taskStatusTag === 'overdue' && <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100 flex items-center gap-1 w-fit"><AlertCircle size={10} /> Overdue {row.overdueDays > 0 ? `(${row.overdueDays}d)` : ''}</span>}
                      {row.taskStatusTag === 'pending' && <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 flex items-center gap-1 w-fit"><Clock size={10} /> Pending</span>}
                      {row.taskStatusTag === 'today' && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1 w-fit"><Clock size={10} /> Today</span>}
                      {row.taskStatusTag === 'upcoming' && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center gap-1 w-fit">Upcoming</span>}
                      {!row.taskStatusTag && <span className="text-gray-400">---</span>}
                    </td>
                    <td className="px-4 py-4 text-center"><button className="text-blue-500 text-xs font-bold border-b border-blue-500 hover:text-blue-700 hover:border-blue-700">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#1e293b] py-8 mt-12 border-t border-gray-200">
          Copyright © 2025 Solarkits. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
