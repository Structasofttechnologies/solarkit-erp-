import React, { useState, useEffect } from 'react';
import {
  MapPin, Users, Video, Save, ChevronLeft, ChevronRight,
  PlayCircle, FileVideo, Layers, Globe, Building,
  CheckCircle, Trash2, Edit, Plus, BarChart3,
  GraduationCap, Upload, Link, Loader, Clock, X
} from 'lucide-react';
import { getCountries, getStates, getCities, getDistricts, getClusters } from '../../../../services/core/locationApi';
import { getDepartments, getDesignationsByDepartment } from '../../../../services/core/masterApi';
import { getCandidateTrainings, createCandidateTraining, updateCandidateTraining, deleteCandidateTraining } from '../../../../services/hrms/hrmsApi';
import toast from 'react-hot-toast';

const CandidateTrainingSetting = () => {
  // Data States
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Selection States
  const [currentStep, setCurrentStep] = useState('country');
  const [currentCountry, setCurrentCountry] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [currentCluster, setCurrentCluster] = useState(null);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);

  // Content States
  const [sections, setSections] = useState([]);
  const [trainingId, setTrainingId] = useState(null); // If editing existing
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [allTrainings, setAllTrainings] = useState([]); // Global summary state

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [countriesData, departmentsData] = await Promise.all([
          getCountries(),
          getDepartments()
        ]);
        setCountries(countriesData || []);
        setDepartments(departmentsData?.data || departmentsData || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch States when Country Selects
  useEffect(() => {
    if (currentCountry?._id) {
      const fetchStates = async () => {
        try {
          const data = await getStates(currentCountry._id);
          setStates(data);
          setCurrentState(null);
          setCurrentCluster(null);
          setCurrentDistrict(null);
          setSelectedCities([]);
          if (currentStep === 'country') setCurrentStep('state');
        } catch (error) {
          console.error("Error fetching states:", error);
          toast.error("Failed to load states");
        }
      };
      fetchStates();
    }
  }, [currentCountry]);

  // Fetch Clusters when State Selects
  useEffect(() => {
    if (currentState?._id) {
      const fetchClusters = async () => {
        try {
          const data = await getClusters({ stateId: currentState._id });
          setClusters(data);
          setCurrentCluster(null);
          setCurrentDistrict(null);
          setSelectedCities([]);
          if (currentStep === 'state') setCurrentStep('cluster');
        } catch (error) {
          console.error("Error fetching clusters:", error);
          toast.error("Failed to load clusters");
        }
      };
      fetchClusters();
    }
  }, [currentState]);

  // Fetch Districts when Cluster Selects
  useEffect(() => {
    if (currentCluster?._id) {
      const fetchDistricts = async () => {
        try {
          const data = await getDistricts({ clusterId: currentCluster._id });
          setDistricts(data);
          setCurrentDistrict(null);
          setSelectedCities([]);
          if (currentStep === 'cluster') setCurrentStep('district');
        } catch (error) {
          console.error("Error fetching districts:", error);
          toast.error("Failed to load districts");
        }
      };
      fetchDistricts();
    }
  }, [currentCluster]);

  // Fetch Cities when District Selects
  useEffect(() => {
    if (currentDistrict?._id) {
      const fetchCities = async () => {
        try {
          const data = await getCities({ districtId: currentDistrict._id });
          setCities(data);
          setSelectedCities([]);
          if (currentStep === 'district') setCurrentStep('city');
        } catch (error) {
          console.error("Error fetching cities:", error);
          toast.error("Failed to load cities");
        }
      };
      fetchCities();
    }
  }, [currentDistrict]);

  // Fetch Positions
  useEffect(() => {
    if (currentDepartment?._id) {
      const fetchPositions = async () => {
        try {
          const data = await getDesignationsByDepartment(currentDepartment._id);
          setPositions(data?.data || data || []);
          setCurrentPosition(null);
          if (currentStep === 'department') setCurrentStep('position');
        } catch (error) {
          console.error("Error fetching positions:", error);
          toast.error("Failed to load positions");
        }
      };
      fetchPositions();
    }
  }, [currentDepartment]);

  useEffect(() => {
    if (currentDepartment?._id && currentPosition?.name) {
      const fetchTraining = async () => {
        try {
          const params = {
            department: currentDepartment._id,
            position: currentPosition.name
          };
          if (currentCountry?._id) params.country = currentCountry._id;
          if (currentState?._id) params.state = currentState._id;
          if (currentCluster?._id) params.cluster = currentCluster._id;
          if (currentDistrict?._id) params.district = currentDistrict._id;

          const response = await getCandidateTrainings(params);
          if (response.data && response.data.length > 0) {
            const existing = response.data[0];
            setTrainingId(existing._id);
            const formattedSections = (existing.sections || []).map(s => ({
              ...s,
              id: s._id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));
            setSections(formattedSections);
          } else {
            setTrainingId(null);
            setSections([{
              id: `section_${Date.now()}`,
              category: 'solarrooftop',
              name: 'New Section',
              videos: []
            }]);
          }
          setCurrentStep('training');
        } catch (error) {
          console.error("Error fetching training:", error);
          toast.error("Failed to load training settings");
        }
      };
      fetchTraining();
    }
  }, [currentPosition, currentDepartment]);

  // Fetch all trainings for Global Summary
  useEffect(() => {
    const fetchAllMatching = async () => {
      try {
        const params = {};
        if (currentCountry?._id) params.country = currentCountry._id;
        if (currentState?._id) params.state = currentState._id;
        if (currentCluster?._id) params.cluster = currentCluster._id;
        if (currentDistrict?._id) params.district = currentDistrict._id;
        if (currentDepartment?._id) params.department = currentDepartment._id;

        const response = await getCandidateTrainings(params);
        setAllTrainings(response.data || []);
      } catch (error) {
        console.error("Error fetching all trainings:", error);
      }
    };
    fetchAllMatching();
  }, [currentCountry, currentState, currentCluster, currentDistrict, currentDepartment, showSuccessModal]);


  // HANDLERS

  const handleCountrySelect = (country) => {
    setCurrentCountry(country);
    setCurrentStep('state');
  };

  const handleStateSelect = (state) => {
    setCurrentState(state);
    setCurrentStep('cluster');
  };

  const handleClusterSelect = (cluster) => {
    setCurrentCluster(cluster);
    setCurrentStep('district');
  };

  const handleDistrictSelect = (district) => {
    setCurrentDistrict(district);
    setCurrentStep('city');
  };

  const toggleCitySelect = (city) => {
    if (selectedCities.find(c => c._id === city._id)) {
      setSelectedCities(selectedCities.filter(c => c._id !== city._id));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSelectAllCities = () => setSelectedCities([...cities]);

  const handleDepartmentSelect = (dept) => {
    setCurrentDepartment(dept);
    setCurrentStep('position');
  };

  const handlePositionSelect = (pos) => {
    setCurrentPosition(pos);
    // Effect triggers fetch
  };

  // Section Handlers
  const addNewSection = () => {
    setSections([...sections, {
      id: `section_${Date.now()}`,
      category: 'solarrooftop',
      name: '',
      videos: []
    }]);
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addVideoToSection = (sectionId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          videos: [...s.videos, { url: '', type: 'youtube' }]
        };
      }
      return s;
    }));
  };

  const updateVideo = (sectionId, videoIndex, field, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newVideos = [...s.videos];
        newVideos[videoIndex] = { ...newVideos[videoIndex], [field]: value };
        return { ...s, videos: newVideos };
      }
      return s;
    }));
  };

  const removeVideo = (sectionId, videoIndex) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newVideos = s.videos.filter((_, i) => i !== videoIndex);
        return { ...s, videos: newVideos };
      }
      return s;
    }));
  };

  const saveTrainingSettings = async () => {
    if (!currentDepartment) return toast.error("Department is required");

    // Sanitize sections to remove frontend temporary IDs
    const sanitizedSections = sections.map(section => {
      const { id, ...rest } = section;
      return rest;
    });

    const payload = {
      country: currentCountry?._id,
      state: currentState?._id,
      cluster: currentCluster?._id,
      district: currentDistrict?._id,
      cities: selectedCities.map(c => c._id),
      department: currentDepartment._id,
      position: currentPosition?.name || "",
      sections: sanitizedSections
    };

    try {
      setIsSaving(true);
      if (trainingId) {
        await updateCandidateTraining(trainingId, payload);
        setShowSuccessModal(true);
      } else {
        const res = await createCandidateTraining(payload);
        setTrainingId(res.data._id);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error saving training:", error);
      const errorMsg = error.message || (typeof error === 'string' ? error : "Failed to save settings");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTraining = (training) => {
    setCurrentCountry(training.country || null);
    setCurrentState(training.state || null);
    setCurrentCluster(training.cluster || null);
    setCurrentDistrict(training.district || null);
    setSelectedCities(training.cities || []);
    setCurrentDepartment(training.department || null);

    // Find match for position in current positions list
    if (training.position && positions.length > 0) {
      const match = positions.find(p => p.name === training.position);
      setCurrentPosition(match || { name: training.position });
    } else {
      setCurrentPosition(null);
    }

    const formattedSections = (training.sections || []).map(s => ({
      ...s,
      id: s._id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    setSections(formattedSections);
    setTrainingId(training._id);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast("Training data loaded for editing");
  };

  const handleDeleteTraining = async (id) => {
    if (window.confirm("Are you sure you want to delete this training configuration?")) {
      try {
        await deleteCandidateTraining(id);
        toast.success("Training deleted successfully");
        // Refetch updated list
        const params = {};
        if (currentCountry?._id) params.country = currentCountry._id;
        if (currentState?._id) params.state = currentState._id;
        if (currentCluster?._id) params.cluster = currentCluster._id;
        if (currentDistrict?._id) params.district = currentDistrict._id;
        if (currentDepartment?._id) params.department = currentDepartment._id;
        const response = await getCandidateTrainings(params);
        setAllTrainings(response.data || []);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete training");
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-[#2D3E50] p-4 flex items-center shadow-md">
          <h1 className="text-xl font-bold text-white ml-2">Candidate Training Settings</h1>
        </div>
      </div>

      <div className="container mx-auto">
        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        )}

        {/* Stacked Selection Section */}
        <div className="space-y-6">
          {/* Country Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select Country</h2>
            <div className="flex flex-wrap gap-4">
              {countries.map((country) => (
                <div
                  key={country._id}
                  className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentCountry?._id === country._id ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <h3 className="font-medium">{country.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* State Selection */}
          {currentCountry && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select State in <span className="text-blue-600">{currentCountry.name}</span></h2>
              <div className="flex flex-wrap gap-4">
                {states.map((state) => (
                  <div
                    key={state._id}
                    className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentState?._id === state._id ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                    onClick={() => handleStateSelect(state)}
                  >
                    <h3 className="font-medium">{state.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cluster Selection */}
          {(currentCountry && currentState) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select Clusters in <span className="text-blue-600">{currentState.name}</span></h2>
              <div className="flex flex-wrap gap-4">
                <div
                  className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${currentCluster === 'all' || !currentCluster ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                  onClick={() => handleClusterSelect(null)}
                >
                  <CheckCircle className="h-4 w-4 mb-1" />
                  <h3 className="font-medium text-sm">All Clusters</h3>
                </div>
                {clusters.map((cluster) => (
                  <div
                    key={cluster._id}
                    className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentCluster?._id === cluster._id ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                    onClick={() => handleClusterSelect(cluster)}
                  >
                    <h3 className="font-medium">{cluster.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* District Selection */}
          {(currentState && (currentCluster || districts.length > 0)) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select Districts in <span className="text-blue-600">{currentCluster?.name || 'All Clusters'}</span></h2>
              <div className="flex flex-wrap gap-4">
                <div
                  className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${!currentDistrict ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                  onClick={() => handleDistrictSelect(null)}
                >
                  <CheckCircle className="h-4 w-4 mb-1" />
                  <h3 className="font-medium text-sm">All Districts</h3>
                </div>
                {districts.map((district) => (
                  <div
                    key={district._id}
                    className={`min-w-[120px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentDistrict?._id === district._id ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'hover:shadow-md'}`}
                    onClick={() => handleDistrictSelect(district)}
                  >
                    <h3 className="font-medium">{district.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Locations Bar */}
        {(currentState) && (
          <div className="bg-[#E9ECEF] rounded-lg p-3 mb-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2D3E50] text-sm mr-2">Selected Locations:</span>
              <div className="flex gap-2">
                {currentCountry && <span className="bg-[#2ECC71] text-white text-xs px-3 py-1 rounded-full">{currentCountry.name}</span>}
                {currentState && <span className="bg-[#2ECC71] text-white text-xs px-3 py-1 rounded-full">{currentState.name}</span>}
                <span className="bg-[#2ECC71] text-white text-xs px-3 py-1 rounded-full">{currentCluster?.name || 'All Clusters'}</span>
                <span className="bg-[#2ECC71] text-white text-xs px-3 py-1 rounded-full flex items-center">
                  <Layers className="h-3 w-3 mr-1" /> {currentDistrict?.name || `${districts.length} Districts`}
                </span>
              </div>
            </div>
            <div className="bg-[#0D1B2A] text-white text-[10px] px-3 py-1 rounded-full flex items-center font-bold">
              <Clock className="w-3 h-3 mr-1" /> Break Time
            </div>
          </div>
        )}

        {/* Department Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select a Department</h2>
          <div className="flex flex-wrap gap-4">
            {departments.map(dept => (
              <div
                key={dept._id}
                className={`min-w-[150px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentDepartment?._id === dept._id ? 'bg-[#3498DB] text-white border-[#3498DB]' : 'hover:shadow-md text-gray-700'}`}
                onClick={() => handleDepartmentSelect(dept)}
              >
                <h3 className="font-bold text-sm">{dept.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Position Selection */}
        {positions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#2D3E50] mb-4">Select a Position</h2>
            <div className="flex flex-wrap gap-4">
              {positions.map(pos => (
                <div
                  key={pos._id}
                  className={`min-w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center cursor-pointer transition-all ${currentPosition?._id === pos._id ? 'bg-[#3498DB] text-white border-[#3498DB]' : 'hover:shadow-md text-gray-700'}`}
                  onClick={() => handlePositionSelect(pos)}
                >
                  <h3 className="font-bold text-sm">{pos.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Form */}
        {currentDepartment && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-0 overflow-hidden mb-8 transition-all">
            <div className="p-6">
              <h2 className="text-[22px] font-bold text-[#0077B6] mb-2 uppercase tracking-tight text-center sm:text-left">
                {currentDepartment?.name} - {currentPosition ? currentPosition.name : "Selection Required"} Training Settings
              </h2>
              <h3 className="text-lg font-bold text-[#0077B6] mb-4">Upload Video Section</h3>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-[#0077B6] text-white p-3 flex justify-between items-center rounded-t-lg">
                <span className="font-bold text-sm">Video Upload Sections</span>
                <button onClick={addNewSection} className="bg-white text-[#0077B6] px-3 py-1 rounded-md text-[10px] font-bold hover:bg-gray-100 flex items-center">
                  Add Section
                </button>
              </div>

              <div className="border border-gray-200 rounded-b-lg p-6 bg-white shadow-inner">
                {sections.map(section => (
                  <div key={section.id} className="border-l-[4px] border-[#3498DB] border-t border-r border-b border-gray-100 rounded-lg p-8 mb-8 relative bg-white transition-all hover:shadow-md">

                    {/* Row 1: Category & Section Name & Small Trash */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 relative">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select
                          value={section.category}
                          onChange={e => updateSection(section.id, 'category', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="solarrooftop">Solar Rooftop</option>
                          <option value="solarpump">Solar Pump</option>
                          <option value="solarstreetlight">Solar Street Light</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Section Name</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={section.name}
                            onChange={e => updateSection(section.id, 'name', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter Section Name"
                          />
                          <button
                            onClick={() => removeSection(section.id)}
                            className="text-[#E74C3C] hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Videos Area */}
                    <div className="space-y-6">
                      {section.videos.map((video, vIndex) => (
                        <div key={vIndex} className="bg-white transition-all">
                          {/* Row 2: Upload Video & YouTube Link */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-bold text-gray-700 mb-2">Upload Video</label>
                              <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white h-[42px] items-center">
                                <label className="bg-[#F8F9FA] px-4 py-2 text-[10px] font-bold border border-gray-300 rounded m-1 cursor-pointer hover:bg-gray-200 h-[30px] flex items-center shadow-sm">
                                  Choose File
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={e => {
                                      const file = e.target.files[0];
                                      if (file) updateVideo(section.id, vIndex, 'file', file);
                                    }}
                                  />
                                </label>
                                <span className="px-2 py-2 text-[10px] text-gray-400">
                                  {video.file ? video.file.name : 'No file chosen'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col relative">
                              <label className="text-sm font-bold text-gray-700 mb-2">Or YouTube Link</label>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white h-[42px]">
                                <input
                                  type="url"
                                  value={video.url}
                                  onChange={e => updateVideo(section.id, vIndex, 'url', e.target.value)}
                                  className="w-full px-4 py-2 text-sm outline-none bg-transparent"
                                  placeholder="https://youtube.com/xyz"
                                />
                                {vIndex > 0 && (
                                  <button onClick={() => removeVideo(section.id, vIndex)} className="p-2 text-red-500 hover:bg-red-50 h-full flex items-center pr-3">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Row 3: Add Video & Save Section Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => addVideoToSection(section.id)}
                          className="bg-[#0077B6] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center whitespace-nowrap"
                        >
                          Add Video
                        </button>
                        <button
                          onClick={saveTrainingSettings}
                          className="bg-[#2ECC71] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-600 transition-all shadow-sm flex items-center whitespace-nowrap"
                        >
                          Save Section
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sections.length === 0 && (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    No sections added yet. Click "Add Section" to begin training configuration.
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={saveTrainingSettings} disabled={isSaving} className="px-8 py-3 bg-[#2ECC71] text-white rounded-lg text-sm font-extrabold hover:shadow-lg transition-all disabled:opacity-50 flex items-center uppercase tracking-wide">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Processing...' : 'Final Save Training Settings'}
                </button>
              </div>
            </div>
          </div>
        )
        }

        {/* Training Summary Section */}
        <div className="bg-[#F8F9FA] border-l-[6px] border-[#1565C0] rounded-lg p-8 mb-12 shadow-sm">
          <h3 className="text-2xl font-bold text-[#1565C0] mb-8">Training Summary</h3>

          {/* Training Summary Cards List */}
          <div className="space-y-8">
            {allTrainings.length > 0 ? (
              allTrainings.map((training, index) => (
                <div key={training._id || index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md relative group">
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTraining(training)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Edit Training"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTraining(training._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Delete Training"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Location Information */}
                      <div>
                        <h4 className="font-bold text-gray-700 flex items-center mb-3 text-xs uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500" /> Location Coverage
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {training.country?.name && (
                            <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.country.name}</span>
                          )}
                          {training.state?.name && (
                            <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.state.name}</span>
                          )}
                          {training.cluster?.name && (
                            <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.cluster.name}</span>
                          )}
                          {training.district?.name && (
                            <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.district.name}</span>
                          )}
                        </div>
                      </div>

                      {/* Role Information */}
                      <div>
                        <h4 className="font-bold text-gray-700 flex items-center mb-3 text-xs uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5 mr-2 text-blue-500" /> Department & Position
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.department?.name || 'General'}</span>
                          {training.position && (
                            <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] px-2.5 py-1 rounded font-bold uppercase">{training.position}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Summary */}
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-50">
                      <h4 className="font-bold text-gray-700 flex items-center mb-4 text-xs uppercase tracking-wider">
                        <Globe className="w-3.5 h-3.5 mr-2 text-blue-500" /> Training Modules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['solarrooftop', 'solarpump', 'solarstreetlight'].map(cat => {
                          const catSections = (training.sections || []).filter(s => s.category === cat);
                          const videoCount = catSections.reduce((acc, s) => acc + (s.videos?.length || 0), 0);

                          const catLabel = cat === 'solarrooftop' ? 'Solar Rooftop' :
                            cat === 'solarpump' ? 'Solar Pump' : 'Street Light';

                          const Icon = cat === 'solarrooftop' ? PlayCircle : cat === 'solarpump' ? Layers : FileVideo;

                          return (
                            <div key={cat} className="flex items-center">
                              <div className="p-1.5 bg-white rounded shadow-sm mr-3">
                                <Icon className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-extrabold text-[10px] text-gray-800 leading-tight">{catLabel}</p>
                                <p className="text-[9px] text-gray-400 font-bold">{videoCount} Videos</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Video className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-bold">No training data found for current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl transform transition-all scale-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">Training data has been saved successfully in the database.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Copyright Footer */}
        <div className="text-center py-6 border-t mt-12">
          <p className="text-gray-500 text-xs">Copyright © 2025 <span className="font-bold">Solarkits. All</span> Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateTrainingSetting;