import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Activity, ChevronDown, 
  BriefcaseBusiness
} from 'lucide-react';
import { useLocations } from '../../../hooks/useLocations';
import { useLocation } from 'react-router-dom';

const getProjectStats = async (stateId) => ({ success: true, data: { total: 0, inProgress: 0, completed: 0, overdue: 0 } });
const getAllProjects = async (filters) => ({ success: true, data: [] });

import StatsCards from './components/StatsCards';
import ProjectTable from './components/ProjectTable';

export default function TrackProjects() {
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [currentState, setCurrentState] = useState(null);
  const [currentCluster, setCurrentCluster] = useState(null);
  const [mainContainerVisible, setMainContainerVisible] = useState(false);
  const [selectedStateCard, setSelectedStateCard] = useState(null);
  const location = useLocation();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCP, setSelectedCP] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, overdue: 0 });

  const { states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  useEffect(() => {
    fetchStates();
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
      setMainContainerVisible(true);
      setLocationCardsVisible(false);
    }
  }, [location.search]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async (stateId = null) => {
    try {
      const data = await getProjectStats(stateId);
      if (data && data.success) setStats(data.data);
    } catch (error) { console.error("Error loading stats:", error); }
  };

  const loadProjects = async () => {
    try {
      const filters = {
        stateId: currentState?._id,
        clusterId: currentCluster?._id,
        districtId: selectedDistrict !== 'all' ? selectedDistrict : null,
        status: selectedStatus,
        cp: selectedCP
      };
      const response = await getAllProjects(filters);
      if (response && response.success) setProjects(response.data);
    } catch (error) { console.error("Error loading projects:", error); }
  };

  useEffect(() => {
    if (mainContainerVisible) loadProjects();
  }, [currentState, currentCluster, selectedStatus, selectedCP, selectedDistrict, mainContainerVisible]);

  const handleStateSelect = (state) => {
    setCurrentState(state);
    setCurrentCluster(null);
    setSelectedStateCard(state._id);
    setMainContainerVisible(true);
    fetchClusters(state._id);
    loadStats(state._id);
    setSelectedStatus("all");
    setSelectedCP("all");
    setSelectedDistrict("all");
  };

  const handleClusterSelect = (cluster) => {
    setCurrentCluster(cluster);
    fetchDistricts(cluster._id);
  };

  const statusOptions = [
    { value: "all", label: "Show All" },
    { value: "consumer", label: "Consumer Registered" },
    { value: "application", label: "Application Submission" },
    { value: "feasibility", label: "Feasibility Check" },
    { value: "work", label: "Work Start" },
    { value: "vendor", label: "Vendor Selection" },
    { value: "commission", label: "Commissioning" },
    { value: "meterchange", label: "Meter Change" },
    { value: "pcr", label: "PCR" }
  ];

  const getStatusColor = (statusStage, status) => {
    const stage = statusStage || status || '';
    if (stage.includes('consumer')) return 'bg-green-100 text-green-800';
    if (stage.includes('application')) return 'bg-blue-100 text-blue-800';
    if (stage.includes('feasibility')) return 'bg-yellow-100 text-yellow-800';
    if (stage.includes('work')) return 'bg-purple-100 text-purple-800';
    if (stage.includes('vendor')) return 'bg-indigo-100 text-indigo-800';
    if (stage.includes('commission')) return 'bg-teal-100 text-teal-800';
    if (stage.includes('meter')) return 'bg-orange-100 text-orange-800';
    if (stage.includes('pcr')) return 'bg-pink-100 text-pink-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Track Projects</h1>
          </div>
          <button onClick={() => setLocationCardsVisible(!locationCardsVisible)} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2">
            {locationCardsVisible ? <><EyeOff size={16} /> Hide Filter</> : <><Eye size={16} /> Show Filter</>}
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 overflow-hidden ${locationCardsVisible ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">States</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {states.map((state) => (
              <div key={state._id} onClick={() => handleStateSelect(state)} className={`cursor-pointer p-3 rounded-md border text-center transition ${selectedStateCard === state._id ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                {state.name}
              </div>
            ))}
          </div>
        </div>

        {currentState && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-700">Clusters</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {clusters.map((cluster) => (
                <div key={cluster._id} onClick={() => handleClusterSelect(cluster)} className={`cursor-pointer p-3 rounded-md border text-center transition ${currentCluster?._id === cluster._id ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                  {cluster.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {mainContainerVisible ? (
        <div className="space-y-6">
          <StatsCards stats={stats} />
          <ProjectTable 
            projects={projects}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedCP={selectedCP}
            setSelectedCP={setSelectedCP}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            statusOptions={statusOptions}
            districts={districts}
            getStatusColor={getStatusColor}
            showActions={false}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Detailed Tracking Overview</h3>
          <p className="text-gray-500">Select a region to see the project progression and metrics.</p>
        </div>
      )}
    </div>
  );
}
